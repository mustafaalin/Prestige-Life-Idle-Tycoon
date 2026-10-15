import { SECONDS_PER_MONTH } from '../core/config/life';
import { INVEST_CAP_MONTHS, INVEST_FROM_CLASS, investPlan, type InvestPlanId } from '../core/config/investments';
import { autoIncomePerSecond } from '../core/formulas';
import { earn } from '../core/state';
import type { GameStateV2 } from '../core/types';

// The investment account (config/investments.ts, game-design-v2.md §4.13). Pure rules; time and the
// bold deal's roll come in as arguments.
//
// The stake leaves the wallet at once and comes back with the return when the term is up. The bold
// deal is rolled when the money goes in, so closing the app cannot roll it again. The stake was earned
// already: only a gain counts as new earnings (class, Rich List); a loss comes off the stake.

export interface Investment {
  planId: InvestPlanId;
  stake: number;
  /** What comes back (stake and return, or the stake less the loss). */
  payout: number;
  startedAt: number;
  /** Wall-clock ms when it can be collected. */
  until: number;
}

export interface InvestProgress {
  active: Investment | null;
  /** Investments made so far, ever. */
  made: number;
}

export function createInvestProgress(): InvestProgress {
  return { active: null, made: 0 };
}

interface InvestContext {
  game: GameStateV2;
  invest: InvestProgress;
}

export function investUnlocked(game: GameStateV2) {
  return game.classIndex >= INVEST_FROM_CLASS;
}

/** The tab opens when the account is unlocked, or an heir still has a deal running from before. */
export function investTabOpen({ game, invest }: InvestContext) {
  return investUnlocked(game) || invest.active !== null;
}

/** The most that can go in now: five years of income, never more than the wallet. */
export function investCap(game: GameStateV2) {
  return autoIncomePerSecond(game) * SECONDS_PER_MONTH * INVEST_CAP_MONTHS;
}

export function investAvailable(game: GameStateV2) {
  return Math.max(0, Math.min(game.cash, investCap(game)));
}

export function investmentDue(invest: InvestProgress, now: number) {
  return invest.active !== null && now >= invest.active.until;
}

/** Puts `stake` into a deal. `roll` (0–1) decides the bold deal: below its chance it pays off. */
export function startInvestment<T extends InvestContext>(
  state: T,
  planId: InvestPlanId,
  stake: number,
  now: number,
  roll: number,
): T | null {
  const plan = investPlan(planId);
  // A little slack: the button's figure was read a moment ago and income keeps the cap moving.
  const amount = Math.min(stake, state.game.cash);
  if (!plan || state.invest.active || !investUnlocked(state.game) || amount <= 0 || amount > investCap(state.game) * 1.01) {
    return null;
  }
  const won = plan.chance === undefined || roll < plan.chance;
  const payout = amount * (1 + (won ? plan.gain : (plan.loss ?? 0)));
  return {
    ...state,
    game: { ...state.game, cash: state.game.cash - amount },
    invest: {
      active: { planId, stake: amount, payout, startedAt: now, until: now + plan.hours * 3600 * 1000 },
      made: state.invest.made + 1,
    },
  };
}

/** Collects a deal whose term is up: the stake comes back, a gain is earned (a loss is not). */
export function collectInvestment<T extends InvestContext>(state: T, now: number): T | null {
  const active = state.invest.active;
  if (!active || now < active.until) return null;
  const gain = active.payout - active.stake;
  const back = { ...state.game, cash: state.game.cash + Math.min(active.payout, active.stake) };
  return { ...state, game: gain > 0 ? earn(back, gain) : back, invest: { ...state.invest, active: null } };
}
