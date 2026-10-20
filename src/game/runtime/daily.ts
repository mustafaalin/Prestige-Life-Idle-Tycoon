import { dailyMonths } from '../core/config/daily';
import { dailyReward } from '../core/formulas';
import { earn } from '../core/state';
import type { GameStateV2 } from '../core/types';
import { dayKey, rewardsStarted, type AdProgress } from './adRewards';

// The daily reward (config/daily.ts, game-design-v2.md §4.13). Pure rules, time comes in as an argument.
//
// The amount is fixed when the day's reward is offered, at the first opening of the day before the
// player buys anything, and stays the same until it is collected: collecting later never pays more.
// It is offered from the same moment as the ads (a manager hired and one return to offline
// earnings), so the first one comes on the first return, never in the middle of the guide.

export interface DailyOffer {
  /** The calendar day it belongs to (local YYYY-MM-DD). */
  day: string;
  months: number;
  amount: number;
}

export interface DailyProgress {
  /** Rewards collected so far, ever (index of the next one in config/daily.ts). Kept across lives. */
  claimed: number;
  /** The day of the last reward collected (local YYYY-MM-DD; '' = none yet). */
  claimedDay: string;
  /** Today's reward, waiting on its card; an older one stays until collected. */
  offer: DailyOffer | null;
}

export function createDailyProgress(): DailyProgress {
  return { claimed: 0, claimedDay: '', offer: null };
}

interface DailyContext {
  game: GameStateV2;
  ads: AdProgress;
  daily: DailyProgress;
}

/** Offers the day's reward once it is due; returns the same state when nothing changes. */
export function offerDaily<T extends DailyContext>(state: T, now: number): T {
  if (state.daily.offer || !rewardsStarted(state)) return state;
  const day = dayKey(now);
  if (state.daily.claimedDay === day) return state;
  const months = dailyMonths(state.daily.claimed);
  const amount = dailyReward(state.game, months);
  if (amount <= 0) return state;
  return { ...state, daily: { ...state.daily, offer: { day, months, amount } } };
}

/** Collects the waiting reward; `multiplier` is 2 after a rewarded ad. */
export function claimDaily<T extends DailyContext>(state: T, multiplier = 1): T | null {
  const offer = state.daily.offer;
  if (!offer) return null;
  return {
    ...state,
    game: earn(state.game, offer.amount * multiplier),
    daily: { claimed: state.daily.claimed + 1, claimedDay: offer.day, offer: null },
  };
}
