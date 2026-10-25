import { BUSINESSES } from '../core/config/businesses';
import type { EventOutcome } from '../core/config/events';
import {
  cycleRevenue,
  eventCardsFor,
  eventReward,
  fetchReward,
  globalMultiplier,
  offlineEarnings,
  steadyIncomePerSecond,
  tapValue,
} from '../core/formulas';
import {
  buyHeirloom as coreBuyHeirloom,
  buyHome as coreBuyHome,
  buyLifestyle as coreBuyLifestyle,
  claimQuest as coreClaimQuest,
  createInitialState,
  earn,
  handOverEarly as coreHandOverEarly,
  hireManager as coreHireManager,
  levelUpBusiness as coreLevelUpBusiness,
  moveHome as coreMoveHome,
  openBranch as coreOpenBranch,
  startCourse as coreStartCourse,
  startTraining as coreStartTraining,
  stopTraining as coreStopTraining,
  collectSkill as coreCollectSkill,
  train,
  takeCareer as coreTakeCareer,
  rentHome as coreRentHome,
  retire as coreRetire,
  live,
  liveAway,
} from '../core/state';
import type { BusinessDef, GameStateV2, SkillId } from '../core/types';
import { CAMPAIGN_FACTOR, COIN_RAIN_VALUE_FACTOR } from '../core/config/ads';
import { boostFactor, boostShare, campaignFactor, coinRainActive, createAdProgress, tempManagerLeft, type AdProgress } from './adRewards';
import { createDailyProgress, type DailyProgress } from './daily';
import { afterAnswer } from './eventDeck';
import { createInvestProgress, runningDeals, type InvestProgress } from './investment';
import { createPurchaseProgress, type PurchaseProgress } from './purchases';
import { createStoryProgress, type StoryProgress } from './story';

// Runtime layer on top of the economy core: real-time production cycles, taps and offline time.
// Pure functions — time comes in as an argument, so the store and any test can drive it.

/** A visible production cycle. Managed lines loop forever; unmanaged lines run one cycle per tap. */
export interface CycleState {
  /** 0–1, how full the progress bar is. */
  progress: number;
  /** Unmanaged lines only: a cycle was started by the player and is still running. */
  running: boolean;
}

export interface PendingOffline {
  amount: number;
  awaySeconds: number;
}

export interface RuntimeState {
  game: GameStateV2;
  cycles: Record<string, CycleState>;
  /** Offline earnings waiting for the player to collect them. */
  offline: PendingOffline | null;
  /** Wall-clock ms up to which time has been simulated. */
  lastActiveAt: number;
  /** Ceremonies seen and Mom's messages (story-v2.md §4). */
  story: StoryProgress;
  /** The income boost and the day's ad counters (monetization-v2.md §4). */
  ads: AdProgress;
  /** What was bought in the store, kept across lives (monetization-v2.md §5). */
  purchases: PurchaseProgress;
  /** The daily reward's calendar and today's offer (runtime/daily.ts). */
  daily: DailyProgress;
  /** Old Ray's deals: the running investment (runtime/investment.ts). */
  invest: InvestProgress;
}

export interface Payout {
  businessId: string;
  amount: number;
  /** Cycles completed in this step (can be > 1 for fast lines or long frames). */
  cycles: number;
}

/** A gap between ticks longer than this means the app was suspended; it is treated as offline time. */
export const MAX_TICK_GAP_SECONDS = 10;
/** Shorter absences are credited silently instead of becoming a "welcome back" claim. */
export const OFFLINE_MIN_SECONDS = 60;

const BUSINESS_BY_ID = new Map(BUSINESSES.map((def) => [def.id, def]));

export function emptyCycles(): Record<string, CycleState> {
  return Object.fromEntries(BUSINESSES.map((def) => [def.id, { progress: 0, running: false }]));
}

export function createRuntimeState(now: number, game: GameStateV2 = createInitialState()): RuntimeState {
  return {
    game,
    cycles: emptyCycles(),
    offline: null,
    lastActiveAt: now,
    story: createStoryProgress(),
    ads: createAdProgress(),
    purchases: createPurchaseProgress(),
    daily: createDailyProgress(),
    invest: createInvestProgress(),
  };
}

/**
 * What one run of a business pays right now, as the "+$" bubble shows it: the run, a campaign on the
 * line and the income boost (both ads). The card's "per run" reads this same number.
 */
export function runPay(state: Pick<RuntimeState, 'game' | 'ads'>, def: BusinessDef, now: number) {
  return cycleRevenue(state.game, def) * campaignFactor(state.ads, def.id, now, CAMPAIGN_FACTOR) * boostFactor(state.ads, now);
}

/**
 * Runs production cycles for `seconds`. Offline time skips managed lines; their income comes from
 * offlineEarnings. While the game is open a stand-in manager (an ad) runs a line like a manager, and
 * a campaign (an ad) multiplies what its runs pay (runtime/adRewards.ts). A run started by hand was
 * paid when "Run" was tapped (startCycle); its second only has to pass before the next tap.
 */
function advanceCycles(state: RuntimeState, seconds: number, includeManaged: boolean, now: number) {
  const cycles = { ...state.cycles };
  const payouts: Payout[] = [];
  let earned = 0;

  for (const def of BUSINESSES) {
    const business = state.game.businesses[def.id];
    const cycle = cycles[def.id];
    if (!business || business.level <= 0) continue;
    const runsItself = business.managed || (includeManaged && tempManagerLeft(state.ads, def.id, now) > 0);
    if (runsItself ? !includeManaged : !cycle.running) continue;

    let progress = cycle.progress + seconds / def.cycleSeconds;
    let completed = 0;
    if (runsItself) {
      completed = Math.floor(progress);
      progress -= completed;
    } else if (progress >= 1) {
      completed = 1;
      progress = 0;
    }
    cycles[def.id] = { progress, running: runsItself || (cycle.running && completed === 0) };

    if (completed > 0 && runsItself) {
      const amount = cycleRevenue(state.game, def) * completed * campaignFactor(state.ads, def.id, now, CAMPAIGN_FACTOR);
      payouts.push({ businessId: def.id, amount, cycles: completed });
      earned += amount;
    }
  }

  return { cycles, payouts, earned };
}

/** Advances the game while the app is open. `speed` is a dev-only time multiplier. */
export function tick(state: RuntimeState, now: number, speed = 1): { state: RuntimeState; payouts: Payout[] } {
  const elapsed = (now - state.lastActiveAt) / 1000;
  if (elapsed <= 0) return { state: elapsed < 0 ? { ...state, lastActiveAt: now } : state, payouts: [] };
  if (elapsed > MAX_TICK_GAP_SECONDS) return resume(state, now);

  const seconds = elapsed * speed;
  const { cycles, payouts, earned } = advanceCycles(state, seconds, true, now);
  const steady = steadyIncomePerSecond(state.game) * globalMultiplier(state.game) * seconds;
  // A watched ad's income boost multiplies everything the game earns by itself.
  const boost = boostFactor(state.ads, now);
  return {
    // Open-app time ages the hero in full; resume() (time away) only a little (liveAway).
    // Skills train in real time (the dev speed-up included, so a test does not wait for hours).
    state: { ...state, game: train(live(earn(state.game, (earned + steady) * boost), seconds), seconds), cycles, lastActiveAt: now },
    payouts: boost === 1 ? payouts : payouts.map((payout) => ({ ...payout, amount: payout.amount * boost })),
  };
}

/**
 * Catches up after the app was closed or backgrounded. Managers, salary and rent earn at the offline
 * rate; a cycle the player started by hand still finishes. Long absences become a pending claim.
 */
export function resume(state: RuntimeState, now: number): { state: RuntimeState; payouts: Payout[] } {
  const away = (now - state.lastActiveAt) / 1000;
  if (away <= 0) return { state: { ...state, lastActiveAt: now }, payouts: [] };

  const { cycles, payouts, earned } = advanceCycles(state, away, false, now);
  // The income boost runs in real time: the part of the absence it covers earns double.
  const boosted = 1 + (boostFactor(state.ads, state.lastActiveAt) - 1) * boostShare(state.ads, state.lastActiveAt, now);
  const offlineAmount = offlineEarnings(state.game, away) * boosted;
  // Skills train in full while away: a finished training waits for the player who comes back.
  const base = { ...state, game: train(liveAway(earn(state.game, earned), away), away), cycles, lastActiveAt: now };

  if (away < OFFLINE_MIN_SECONDS || offlineAmount <= 0) {
    return { state: { ...base, game: earn(base.game, offlineAmount) }, payouts };
  }
  const offline = {
    amount: (state.offline?.amount ?? 0) + offlineAmount,
    awaySeconds: (state.offline?.awaySeconds ?? 0) + away,
  };
  return { state: { ...base, offline }, payouts };
}

// ── Player actions: return the new state, or null when not allowed ────────────

function withGame(state: RuntimeState, game: GameStateV2 | null): RuntimeState | null {
  return game ? { ...state, game } : null;
}

/** A tap on the scene: one collected bottle or can. */
export function tap(state: RuntimeState, now: number): RuntimeState {
  // Coins rain (an ad): each one picked up is worth more.
  const value = tapValue(state.game) * (coinRainActive(state.ads, now) ? COIN_RAIN_VALUE_FACTOR : 1);
  const game = earn(state.game, value);
  return { ...state, game: { ...game, bottles: game.bottles + 1 } };
}

/**
 * An event card was answered (config/events.ts; the card rolled the bold answer). It pays at once and
 * the time is kept, so closing the game on a bad result neither loses the reward nor rolls again.
 */
/** A failed bold answer takes money from cash only (never below zero); earnings and class stay. */
export function answerEvent(state: RuntimeState, cardId: string, outcome: EventOutcome, now: number): RuntimeState {
  const amount = eventReward(state.game, outcome);
  const available = eventCardsFor(state.game).map((card) => card.id);
  return {
    ...state,
    game: amount >= 0 ? earn(state.game, amount) : { ...state.game, cash: Math.max(0, state.game.cash + amount) },
    story: { ...state.story, eventAnsweredAt: now, eventsHeard: afterAnswer(state.story.eventsHeard, cardId, available) },
  };
}

/** The player caught what Şans brought (the scene decides when he brings something); `multiplier` is 2 after a rewarded ad. */
export function claimFind(state: RuntimeState, multiplier = 1): RuntimeState {
  const game = earn(state.game, fetchReward(state.game) * multiplier);
  return { ...state, game: { ...game, finds: game.finds + 1 } };
}

export function claimQuest(state: RuntimeState, questId: string) {
  return withGame(state, coreClaimQuest(state.game, questId));
}

/** Opens a business or buys its next level. */
export function levelUpBusiness(state: RuntimeState, businessId: string) {
  return withGame(state, coreLevelUpBusiness(state.game, businessId));
}

export function openBranch(state: RuntimeState, businessId: string) {
  return withGame(state, coreOpenBranch(state.game, businessId));
}

export function hireManager(state: RuntimeState, businessId: string): RuntimeState | null {
  const next = withGame(state, coreHireManager(state.game, businessId));
  if (!next) return null;
  // A cycle already in progress keeps its bar; from now on it loops by itself.
  const cycle = next.cycles[businessId];
  return { ...next, cycles: { ...next.cycles, [businessId]: { ...cycle, running: true } } };
}

/**
 * Player taps "Run" on an unmanaged business (2026-10-21, user: the "+$" shows the moment it is
 * tapped): the run pays at once, then its second passes before the next tap.
 */
export function startCycle(state: RuntimeState, businessId: string, now: number): { state: RuntimeState; payouts: Payout[] } | null {
  const def = BUSINESS_BY_ID.get(businessId);
  const business = state.game.businesses[businessId];
  const cycle = state.cycles[businessId];
  if (!def || !business || business.level <= 0 || business.managed || cycle.running) return null;
  const amount = runPay(state, def, now);
  return {
    state: { ...state, game: earn(state.game, amount), cycles: { ...state.cycles, [businessId]: { progress: 0, running: true } } },
    payouts: [{ businessId, amount, cycles: 1 }],
  };
}

export function takeCareer(state: RuntimeState, careerId: string) {
  return withGame(state, coreTakeCareer(state.game, careerId));
}

export function startCourse(state: RuntimeState, courseId: string) {
  return withGame(state, coreStartCourse(state.game, courseId));
}

export function startTraining(state: RuntimeState, skillId: SkillId) {
  return withGame(state, coreStartTraining(state.game, skillId));
}

export function stopTraining(state: RuntimeState) {
  return withGame(state, coreStopTraining(state.game));
}

export function collectSkill(state: RuntimeState, skillId: SkillId) {
  return withGame(state, coreCollectSkill(state.game, skillId));
}

export function buyLifestyle(state: RuntimeState, itemId: string) {
  return withGame(state, coreBuyLifestyle(state.game, itemId));
}

export function rentHome(state: RuntimeState, houseId: string) {
  return withGame(state, coreRentHome(state.game, houseId));
}

export function buyHome(state: RuntimeState, houseId: string) {
  return withGame(state, coreBuyHome(state.game, houseId));
}

export function moveHome(state: RuntimeState, houseId: string) {
  return withGame(state, coreMoveHome(state.game, houseId));
}

/** "Hand over now" (from the top class): the remaining years are skipped, the life ends at 80. */
export function handOverEarly(state: RuntimeState) {
  return withGame(state, coreHandOverEarly(state.game));
}

/** Buys the next level of a family heirloom with legacy points. */
export function buyHeirloom(state: RuntimeState, id: string) {
  return withGame(state, coreBuyHeirloom(state.game, id));
}

/**
 * End of life: the heir takes over with the family legacy; production starts from scratch. Nothing of the
 * old fortune passes on (story-v2.md §6a): the running deals are paid out now, so their gains count toward the
 * legacy, and a waiting daily reward worked out from the old income is dropped (the heir's own comes
 * with their income).
 */
export function retire(state: RuntimeState): RuntimeState | null {
  const settled = runningDeals(state.invest).reduce((game, deal) => earn(game, deal.payout - deal.stake), state.game);
  const game = coreRetire(settled);
  return game
    ? {
        ...state,
        game,
        cycles: emptyCycles(),
        offline: null,
        invest: { ...state.invest, deals: {} },
        daily: { ...state.daily, offer: null },
      }
    : null;
}

/** Collects pending offline earnings; `multiplier` is 2 after a rewarded ad. */
export function claimOffline(state: RuntimeState, multiplier = 1): RuntimeState | null {
  if (!state.offline) return null;
  return {
    ...state,
    game: earn(state.game, state.offline.amount * multiplier),
    offline: null,
    ads: { ...state.ads, returned: true },
  };
}
