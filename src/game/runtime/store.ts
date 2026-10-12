import { App } from '@capacitor/app';
import { Capacitor, type PluginListenerHandle } from '@capacitor/core';
import type { EventOutcome } from '../core/config/events';
import { SECONDS_PER_YEAR } from '../core/config/life';
import { eventReward, fetchReward } from '../core/formulas';
import { earn, live } from '../core/state';
import { applyBoost, applyHelp, helpReward } from './adRewards';
import {
  buyBusinessUnits,
  buyHome,
  buyLifestyle,
  buyUpgrade,
  answerEvent,
  claimFind,
  claimQuest,
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
import { setPlayerProperties, track } from './analytics';
import { clearSave, parseRuntime, saveRuntime } from './storage';
import { HERO_NAME_MAX } from './story';

// Owns the live game: 250 ms tick, autosave, foreground/background handling (web visibility events
// plus native app pause/resume, which fire more reliably when the phone suspends the app).
// Framework-free; React reads it through useSyncExternalStore (see GameV2Provider).

export const TICK_MS = 250;
const AUTOSAVE_MS = 5000;

export type GameEvent =
  /** One or more production cycles finished this tick (drives "+$1.2K" flying numbers). */
  | { type: 'payout'; payouts: Payout[] }
  /** A new wealth class was reached (drives the class-up ceremony). */
  | { type: 'classUp'; classIndex: number }
  /** The game caught up after the app was closed or in the background (also once at start). */
  | { type: 'returned'; awaySeconds: number }
  /** The app is going to the background (reminders are scheduled here). */
  | { type: 'background' };

export interface GameActions {
  tap(): void;
  /** Pays for what Şans found (`multiplier` is 2 after a rewarded ad); returns the amount for the flying number. */
  claimFind(multiplier?: number): number;
  /** Pays an event card the moment it is answered (the card rolled the bold answer); returns the amount. */
  answerEvent(cardId: string, outcome: EventOutcome): number;
  buyBusiness(businessId: string, count: number): boolean;
  hireManager(businessId: string): boolean;
  startCycle(businessId: string): boolean;
  promote(): boolean;
  buyLifestyle(itemId: string): boolean;
  buyUpgrade(upgradeId: string): boolean;
  /** Claims a finished goal; returns what it paid (0 if it could not be claimed). */
  claimQuest(questId: string): number;
  rentHome(houseId: string): boolean;
  buyHome(houseId: string): boolean;
  moveHome(houseId: string): boolean;
  claimOffline(multiplier?: number): boolean;
  /** End of life: hand the family over to the heir. */
  retire(): boolean;
  /** Rewards of watched ads (call only after showRewardedAd() returned 'rewarded'; adRewards.ts). */
  ads: {
    /** An hour of doubled income; false when the day's limit or the cap is reached. */
    boost(): boolean;
    /** A little help toward the next purchase; returns what it paid (0 if not allowed). */
    help(): number;
  };
  story: {
    /** Stops the clock (income and age) while a ceremony plays (story-v2.md §4). */
    setPaused(paused: boolean): void;
    ceremonySeen(classIndex: number): void;
    momShown(messageId: string): void;
    notificationsAsked(): void;
    setHeroName(name: string): void;
    /** A life moment was shown (story §4c). */
    lifeSeen(momentId: string): void;
    setDaughterName(name: string): void;
    /** Old Ray's guide (plan 1.12): a step's line was shown / a step was done. */
    guideSeen(stepId: string): void;
    guideDone(stepId: string): void;
  };
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
  let paused = false;
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
      track('class_up', {
        class_index: index,
        generation: next.game.generation,
        life_minutes: Math.round(next.game.lifeSeconds / 60),
      });
    }
    if (next.game.classIndex !== previousClass) setPlayerProperties(next.game);
    events.forEach((event) => eventListeners.forEach((listener) => listener(event)));
  };

  const runTick = () => {
    if (paused) {
      // Time stands still: the clock moves on without earning or ageing.
      state = { ...state, lastActiveAt: clock() };
      return;
    }
    const result = tick(state, clock(), speed);
    if (result.state !== state) commit(result.state, result.payouts, false);
  };

  const runResume = () => {
    const awaySeconds = Math.max(0, (clock() - state.lastActiveAt) / 1000);
    const result = resume(state, clock());
    commit(result.state, result.payouts, true);
    eventListeners.forEach((listener) => listener({ type: 'returned', awaySeconds }));
  };

  /** Player actions save right away so a purchase is never lost to a crash. */
  const act = (transition: (current: RuntimeState) => RuntimeState | null) => {
    const next = transition(state);
    if (!next) return false;
    commit(next, [], true);
    return true;
  };

  /** A player action that is also an analytics event (sent only if the action went through). */
  const actTracked = (
    transition: (current: RuntimeState) => RuntimeState | null,
    event: Parameters<typeof track>[0],
    params: () => Parameters<typeof track>[1],
  ) => {
    const done = act(transition);
    if (done) track(event, params());
    return done;
  };

  const updateStory = (change: (story: RuntimeState['story']) => RuntimeState['story']) => {
    act((s) => ({ ...s, story: change(s.story) }));
  };

  const goBackground = () => {
    runTick();
    persist();
    eventListeners.forEach((listener) => listener({ type: 'background' }));
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
      setPlayerProperties(state.game);
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
      claimFind: (multiplier = 1) => {
        const amount = fetchReward(state.game) * multiplier;
        actTracked((s) => claimFind(s, multiplier), 'find_claim', () => ({ finds: state.game.finds, multiplier }));
        return amount;
      },
      answerEvent: (cardId, outcome) => {
        const amount = eventReward(state.game, outcome);
        actTracked((s) => answerEvent(s, outcome, clock()), 'event_card', () => ({ card_id: cardId, outcome }));
        return amount;
      },
      buyBusiness: (businessId, count) =>
        actTracked((s) => buyBusinessUnits(s, businessId, count), 'business_buy', () => ({
          business_id: businessId,
          count,
          owned: state.game.businesses[businessId]?.owned ?? 0,
        })),
      hireManager: (businessId) =>
        actTracked((s) => hireManager(s, businessId), 'manager_hire', () => ({ business_id: businessId })),
      startCycle: (businessId) => act((s) => startCycle(s, businessId)),
      promote: () => actTracked(promote, 'promotion', () => ({ career_index: state.game.careerIndex })),
      buyLifestyle: (itemId) => actTracked((s) => buyLifestyle(s, itemId), 'lifestyle_buy', () => ({ item_id: itemId })),
      buyUpgrade: (upgradeId) => actTracked((s) => buyUpgrade(s, upgradeId), 'upgrade_buy', () => ({ upgrade_id: upgradeId })),
      claimQuest: (questId) => {
        const before = state.game.cash;
        return actTracked((s) => claimQuest(s, questId), 'quest_claim', () => ({ quest_id: questId }))
          ? state.game.cash - before
          : 0;
      },
      rentHome: (houseId) =>
        actTracked((s) => rentHome(s, houseId), 'home_change', () => ({ action: 'rent', house_id: houseId })),
      buyHome: (houseId) =>
        actTracked((s) => buyHome(s, houseId), 'home_change', () => ({ action: 'buy', house_id: houseId })),
      moveHome: (houseId) =>
        actTracked((s) => moveHome(s, houseId), 'home_change', () => ({ action: 'move', house_id: houseId })),
      claimOffline: (multiplier) => {
        const awaySeconds = state.offline?.awaySeconds ?? 0;
        return actTracked((s) => claimOffline(s, multiplier), 'offline_claim', () => ({
          away_minutes: Math.round(awaySeconds / 60),
          multiplier: multiplier ?? 1,
        }));
      },
      retire: () => {
        // The life that just ended, not the heir's.
        const { generation, classIndex } = state.game;
        return actTracked(retire, 'retire', () => ({ generation, class_index: classIndex }));
      },
      ads: {
        boost: () => act((s) => applyBoost(s, clock())),
        help: () => {
          const amount = helpReward(state.game);
          return act((s) => applyHelp(s, clock())) ? amount : 0;
        },
      },
      story: {
        setPaused: (value) => {
          if (paused && !value) state = { ...state, lastActiveAt: clock() };
          paused = value;
        },
        ceremonySeen: (classIndex) =>
          updateStory((story) => ({ ...story, ceremonySeen: Math.max(story.ceremonySeen, classIndex) })),
        momShown: (messageId) =>
          updateStory((story) => ({
            ...story,
            momSeen: story.momSeen.includes(messageId) ? story.momSeen : [...story.momSeen, messageId],
            momShownAt: clock(),
          })),
        notificationsAsked: () => updateStory((story) => ({ ...story, notificationsAsked: true })),
        setHeroName: (name) =>
          updateStory((story) => ({ ...story, heroName: name.trim().slice(0, HERO_NAME_MAX) })),
        lifeSeen: (momentId) =>
          updateStory((story) =>
            story.lifeSeen.includes(momentId) ? story : { ...story, lifeSeen: [...story.lifeSeen, momentId] },
          ),
        setDaughterName: (name) =>
          updateStory((story) => ({ ...story, daughterName: name.trim().slice(0, HERO_NAME_MAX) })),
        guideSeen: (stepId) =>
          updateStory((story) =>
            story.guideSeen.includes(stepId) ? story : { ...story, guideSeen: [...story.guideSeen, stepId] },
          ),
        guideDone: (stepId) =>
          updateStory((story) =>
            story.guideDone.includes(stepId) ? story : { ...story, guideDone: [...story.guideDone, stepId] },
          ),
      },
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
