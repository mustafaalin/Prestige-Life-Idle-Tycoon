import { App } from '@capacitor/app';
import { Capacitor, type PluginListenerHandle } from '@capacitor/core';
import { SECONDS_PER_YEAR } from '../core/config/life';
import { fetchReward } from '../core/formulas';
import { earn, live } from '../core/state';
import {
  buyBusinessUnits,
  buyHome,
  buyLifestyle,
  claimFind,
  claimOffline,
  createRuntimeState,
  hireManager,
  moveHome,
  promote,
  rentHome,
  resume,
  retire,
  startCycle,
  tap,
  tick,
  type Payout,
  type RuntimeState,
} from './engine';
import { clearSave, parseRuntime, saveRuntime } from './storage';

// Owns the live game: 250 ms tick, autosave, foreground/background handling (web visibility events
// plus native app pause/resume, which fire more reliably when the phone suspends the app).
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
  /** Pays for what Şans found; returns the amount for the flying number. */
  claimFind(): number;
  buyBusiness(businessId: string, count: number): boolean;
  hireManager(businessId: string): boolean;
  startCycle(businessId: string): boolean;
  promote(): boolean;
  buyLifestyle(itemId: string): boolean;
  rentHome(houseId: string): boolean;
  buyHome(houseId: string): boolean;
  moveHome(houseId: string): boolean;
  claimOffline(multiplier?: number): boolean;
  /** End of life: hand the family over to the heir. */
  retire(): boolean;
  dev: {
    getSpeed(): number;
    setSpeed(speed: number): void;
    addCash(amount: number): void;
    /** Pretends the app was closed for `seconds`, to test offline earnings. */
    awayFor(seconds: number): void;
    /** Ages the hero by `years`, to test the end of life. */
    age(years: number): void;
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

/** `saveText` comes from readSave(), which is async on phones, so it is read before the store is made. */
export function createGameStore(saveText: string | null, clock: () => number = Date.now): GameStore {
  let state = parseRuntime(saveText, clock());
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

  const goBackground = () => {
    runTick();
    persist();
  };

  const onVisibilityChange = () => {
    if (document.hidden) goBackground();
    else runResume();
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

      // Pause and visibilitychange may both fire; a second resume finds no time away and changes nothing.
      const nativeHandles: Promise<PluginListenerHandle>[] = Capacitor.isNativePlatform()
        ? [App.addListener('pause', goBackground), App.addListener('resume', runResume)]
        : [];

      return () => {
        window.clearInterval(interval);
        document.removeEventListener('visibilitychange', onVisibilityChange);
        window.removeEventListener('pagehide', persist);
        nativeHandles.forEach((handle) => handle.then((h) => h.remove()).catch(() => {}));
        persist();
      };
    },

    actions: {
      tap: () => {
        act(tap);
      },
      claimFind: () => {
        const amount = fetchReward(state.game);
        act(claimFind);
        return amount;
      },
      buyBusiness: (businessId, count) => act((s) => buyBusinessUnits(s, businessId, count)),
      hireManager: (businessId) => act((s) => hireManager(s, businessId)),
      startCycle: (businessId) => act((s) => startCycle(s, businessId)),
      promote: () => act(promote),
      buyLifestyle: (itemId) => act((s) => buyLifestyle(s, itemId)),
      rentHome: (houseId) => act((s) => rentHome(s, houseId)),
      buyHome: (houseId) => act((s) => buyHome(s, houseId)),
      moveHome: (houseId) => act((s) => moveHome(s, houseId)),
      claimOffline: (multiplier) => act((s) => claimOffline(s, multiplier)),
      retire: () => act(retire),
      dev: {
        getSpeed: () => speed,
        setSpeed: (value) => {
          speed = Math.max(0, value);
        },
        addCash: (amount) => {
          act((s) => ({ ...s, game: earn(s.game, amount) }));
        },
        awayFor: (seconds) => {
          state = { ...state, lastActiveAt: state.lastActiveAt - seconds * 1000 };
          runResume();
        },
        age: (years) => {
          act((s) => ({ ...s, game: live(s.game, years * SECONDS_PER_YEAR) }));
        },
        reset: () => {
          clearSave();
          commit(createRuntimeState(clock()), [], true);
        },
      },
    },
  };
}
