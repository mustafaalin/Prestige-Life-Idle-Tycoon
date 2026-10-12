import {
  BOOST_FACTOR,
  BOOST_MAX_SECONDS,
  BOOST_SECONDS,
  BOOSTS_PER_DAY,
  HELP_INCOME_SECONDS,
  HELPS_PER_DAY,
} from '../core/config/ads';
import { autoIncomePerSecond } from '../core/formulas';
import { earn } from '../core/state';
import type { GameStateV2 } from '../core/types';

// What rewarded ads give and when they are offered (docs/monetization-v2.md §4). Pure rules: the
// store calls them after showRewardedAd() returned 'rewarded'. Limits count per calendar day on the
// player's phone.

export interface AdProgress {
  /** Wall-clock ms until which the income boost runs (0 = never). */
  boostUntil: number;
  /** The day the two counters below belong to (local YYYY-MM-DD). */
  day: string;
  boostsToday: number;
  helpsToday: number;
  /** An offline card was collected once: ads are not offered before the first return. */
  returned: boolean;
}

export function createAdProgress(): AdProgress {
  return { boostUntil: 0, day: '', boostsToday: 0, helpsToday: 0, returned: false };
}

/** What the rules read; the runtime state fits it. */
interface AdContext {
  game: GameStateV2;
  ads: AdProgress;
}

export function dayKey(now: number) {
  const date = new Date(now);
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** The counters as of today: a new day starts them over. */
function today(ads: AdProgress, now: number): AdProgress {
  const day = dayKey(now);
  return ads.day === day ? ads : { ...ads, day, boostsToday: 0, helpsToday: 0 };
}

/**
 * No ad offers in the first session (monetization-v2 §2.3): they start once the player has hired a
 * manager and has come back to offline earnings once.
 */
export function adsUnlocked({ game, ads }: AdContext) {
  return ads.returned && Object.values(game.businesses).some((business) => business.managed);
}

// ── Income boost ──

export function boostSecondsLeft(ads: AdProgress, now: number) {
  return Math.max(0, (ads.boostUntil - now) / 1000);
}

/** What all earnings are multiplied by right now. */
export function boostFactor(ads: AdProgress, now: number) {
  return ads.boostUntil > now ? BOOST_FACTOR : 1;
}

/** The share of the time from `from` to `to` (ms) that the boost covers. */
export function boostShare(ads: AdProgress, from: number, to: number) {
  if (to <= from) return 0;
  return Math.min(Math.max(ads.boostUntil - from, 0), to - from) / (to - from);
}

export function boostsLeft(ads: AdProgress, now: number) {
  return Math.max(0, BOOSTS_PER_DAY - today(ads, now).boostsToday);
}

/** Another hour still fits under the cap. */
export function boostHasRoom(ads: AdProgress, now: number) {
  return boostSecondsLeft(ads, now) + BOOST_SECONDS <= BOOST_MAX_SECONDS;
}

export function canBoost(context: AdContext, now: number) {
  return adsUnlocked(context) && boostsLeft(context.ads, now) > 0 && boostHasRoom(context.ads, now);
}

/** A boost ad was watched: an hour more, from now or on top of what is left. */
export function applyBoost<T extends AdContext>(state: T, now: number): T | null {
  if (!canBoost(state, now)) return null;
  const ads = today(state.ads, now);
  return {
    ...state,
    ads: { ...ads, boostUntil: Math.max(ads.boostUntil, now) + BOOST_SECONDS * 1000, boostsToday: ads.boostsToday + 1 },
  };
}

// ── A little help ──

export function helpReward(game: GameStateV2) {
  return autoIncomePerSecond(game) * HELP_INCOME_SECONDS;
}

export function helpsLeft(ads: AdProgress, now: number) {
  return Math.max(0, HELPS_PER_DAY - today(ads, now).helpsToday);
}

/** Offered on something that costs `cost` only when the help would cover what is missing. */
export function canHelp(context: AdContext, now: number, cost: number) {
  const missing = cost - context.game.cash;
  return (
    adsUnlocked(context) && helpsLeft(context.ads, now) > 0 && missing > 0 && missing <= helpReward(context.game)
  );
}

/** A help ad was watched. */
export function applyHelp<T extends AdContext>(state: T, now: number): T | null {
  const ads = today(state.ads, now);
  if (!adsUnlocked(state) || ads.helpsToday >= HELPS_PER_DAY) return null;
  return { ...state, game: earn(state.game, helpReward(state.game)), ads: { ...ads, helpsToday: ads.helpsToday + 1 } };
}
