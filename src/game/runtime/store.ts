import { earn } from '../core/state';
import {
  buyBusinessUnits,
  buyLifestyle,
  claimOffline,
  createRuntimeState,
  hireManager,
  promote,
  resume,
  startCycle,
  tap,
  tick,
  type Payout,
  type RuntimeState,
} from './engine';
import { clearSave, loadRuntime, saveRuntime } from './storage';

// Owns the live game: 250 ms tick, autosave, foreground/background handling.
// Framework-free; React reads it through useSyncExternalStore (see GameV2Provider).

export const TICK_MS = 250;
const AUTOSAVE_MS = 5000;

export type GameEvent =
  /** One or more production cycles finished this tick (drives "+$1.2K" flying numbers). */
  | { type: 'payout'; payouts: Payout[] }
  /** A new wealth class was reached (drives the class-up ceremony). */
  | { type: 'classUp'; classIndex: number };

export interface GameActions {
  tap(): void;
  buyBusiness(businessId: string, count: number): boolean;
  hireManager(businessId: string): boolean;
  startCycle(businessId: string): boolean;
  promote(): boolean;
  buyLifestyle(itemId: string): boolean;
  claimOffline(multiplier?: number): boolean;
  dev: {
    setSpeed(speed: number): void;
    addCash(amount: number): void;
    reset(): void;
  };
}

export interface GameStore {
  getState(): RuntimeState;
  subscribe(listener: () => void): () => void;
  onEvent(listener: (event: GameEvent) => void): () => void;
  /** Starts the tick loop and lifecycle listeners; returns the stop function. */
  start(): () => void;
  actions: GameActions;
}

export function createGameStore(clock: () => number = Date.now): GameStore {
  let state = loadRuntime(clock());
  let speed = 1;
  let lastSavedAt = clock();
  const listeners = new Set<() => void>();
  const eventListeners = new Set<(event: GameEvent) => void>();

  const persist = () => {
    lastSavedAt = clock();
    saveRuntime(state, lastSavedAt);
  };

  const commit = (next: RuntimeState, payouts: Payout[], save: boolean) => {
    const previousClass = state.game.classIndex;
    state = next;
    if (save || clock() - lastSavedAt >= AUTOSAVE_MS) persist();
    listeners.forEach((listener) => listener());

    const events: GameEvent[] = [];
    if (payouts.length > 0) events.push({ type: 'payout', payouts });
    for (let index = previousClass + 1; index <= next.game.classIndex; index += 1) {
      events.push({ type: 'classUp', classIndex: index });
    }
    events.forEach((event) => eventListeners.forEach((listener) => listener(event)));
  };

  const runTick = () => {
    const result = tick(state, clock(), speed);
    if (result.state !== state) commit(result.state, result.payouts, false);
  };

  const runResume = () => {
    const result = resume(state, clock());
    commit(result.state, result.payouts, true);
  };

  /** Player actions save right away so a purchase is never lost to a crash. */
  const act = (transition: (current: RuntimeState) => RuntimeState | null) => {
    const next = transition(state);
    if (!next) return false;
    commit(next, [], true);
    return true;
  };

  const onVisibilityChange = () => {
    if (document.hidden) {
      runTick();
      persist();
    } else {
      runResume();
    }
  };

  return {
    getState: () => state,

    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },

    onEvent(listener) {
      eventListeners.add(listener);
      return () => eventListeners.delete(listener);
    },

    start() {
      runResume();
      const interval = window.setInterval(() => {
        // Background tabs and suspended apps are caught up by resume() on return, never by ticks.
        if (!document.hidden) runTick();
      }, TICK_MS);
      document.addEventListener('visibilitychange', onVisibilityChange);
      window.addEventListener('pagehide', persist);
      return () => {
        window.clearInterval(interval);
        document.removeEventListener('visibilitychange', onVisibilityChange);
        window.removeEventListener('pagehide', persist);
        persist();
      };
    },

    actions: {
      tap: () => {
        act(tap);
      },
      buyBusiness: (businessId, count) => act((s) => buyBusinessUnits(s, businessId, count)),
      hireManager: (businessId) => act((s) => hireManager(s, businessId)),
      startCycle: (businessId) => act((s) => startCycle(s, businessId)),
      promote: () => act(promote),
      buyLifestyle: (itemId) => act((s) => buyLifestyle(s, itemId)),
      claimOffline: (multiplier) => act((s) => claimOffline(s, multiplier)),
      dev: {
        setSpeed: (value) => {
          speed = Math.max(0, value);
        },
        addCash: (amount) => {
          act((s) => ({ ...s, game: earn(s.game, amount) }));
        },
        reset: () => {
          clearSave();
          commit(createRuntimeState(clock()), [], true);
        },
      },
    },
  };
}
