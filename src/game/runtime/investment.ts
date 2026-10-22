import { SECONDS_PER_MONTH } from '../core/config/life';
import { INVEST_CAP_MONTHS, INVEST_FROM_CLASS, investPlan, type InvestPlanId } from '../core/config/investments';
import { autoIncomePerSecond } from '../core/formulas';
import { earn } from '../core/state';
import type { GameStateV2 } from '../core/types';

// The investment account (config/investments.ts, game-design-v2.md §4.14). Pure rules; time and the
// old bold deal's roll come in as arguments.
//
// Every deal can run at once, one of each (2026-10-22, user). The stake leaves the wallet at once and
// comes back with the return when the term is up. The stake was earned already: only a gain counts as
// new earnings (class, Rich List); a loss (the old bold deal) comes off the stake.

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
  /** The running deals, one per plan (saved; until 2026-10-22 a single `active` deal). */
  deals: Partial<Record<InvestPlanId, Investment>>;
  /** Investments made so far, ever. */
  made: number;
}

export function createInvestProgress(): InvestProgress {
  return { deals: {}, made: 0 };
}

interface InvestContext {
  game: GameStateV2;
  invest: InvestProgress;
}

export function runningDeals(invest: InvestProgress): Investment[] {
  return Object.values(invest.deals).filter((deal): deal is Investment => deal !== undefined);
}

export function investUnlocked(game: GameStateV2) {
  return game.classIndex >= INVEST_FROM_CLASS;
}

/**
 * The tab opens when the account is unlocked, or an heir still has a deal running: since 2026-10-16 a deal
 * is paid out at the hand-over (engine.ts retire), but an heir from an older save may still have one.
 */
export function investTabOpen({ game, invest }: InvestContext) {
  return investUnlocked(game) || runningDeals(invest).length > 0;
}

/** The most that can go into one deal: INVEST_CAP_MONTHS of income. */
export function investCap(game: GameStateV2) {
  return autoIncomePerSecond(game) * SECONDS_PER_MONTH * INVEST_CAP_MONTHS;
}

/** What one deal can take now: the cap, never more than the wallet. */
export function investAvailable(game: GameStateV2) {
  return Math.max(0, Math.min(game.cash, investCap(game)));
}

export function dealDue(deal: Investment, now: number) {
  return now >= deal.until;
}

/** Some deal is due (the home tab's dot). */
export function investmentDue(invest: InvestProgress, now: number) {
  return runningDeals(invest).some((deal) => dealDue(deal, now));
}

/** Puts `stake` into a deal. `roll` (0–1) decides a deal with a chance: below it, it pays off. */
export function startInvestment<T extends InvestContext>(
  state: T,
  planId: InvestPlanId,
  stake: number,
  now: number,
  roll: number,
  /** The ad deal starts only from its ad (adRewards.ts applyInvestSpecial). */
  viaAd = false,
): T | null {
  const plan = investPlan(planId);
  if (plan?.ad && !viaAd) return null;
  // A little slack: the button's figure was read a moment ago and income keeps the cap moving.
  const amount = Math.min(stake, state.game.cash);
  if (
    !plan ||
    plan.retired ||
    state.invest.deals[planId] ||
    !investUnlocked(state.game) ||
    amount <= 0 ||
    amount > investCap(state.game) * 1.01
  ) {
    return null;
  }
  const won = plan.chance === undefined || roll < plan.chance;
  const payout = amount * (1 + (won ? plan.gain : (plan.loss ?? 0)));
  return {
    ...state,
    game: { ...state.game, cash: state.game.cash - amount },
    invest: {
      deals: { ...state.invest.deals, [planId]: { planId, stake: amount, payout, startedAt: now, until: now + plan.hours * 3600 * 1000 } },
      made: state.invest.made + 1,
    },
  };
}

/** Pays a deal out into the game: the stake comes back, a gain is earned (a loss is not). */
export function settleDeal(game: GameStateV2, deal: Investment): GameStateV2 {
  const gain = deal.payout - deal.stake;
  const back = { ...game, cash: game.cash + Math.min(deal.payout, deal.stake) };
  return gain > 0 ? earn(back, gain) : back;
}

/** Collects a deal whose term is up. */
export function collectInvestment<T extends InvestContext>(state: T, planId: InvestPlanId, now: number): T | null {
  const deal = state.invest.deals[planId];
  if (!deal || !dealDue(deal, now)) return null;
  const deals = { ...state.invest.deals };
  delete deals[planId];
  return { ...state, game: settleDeal(state.game, deal), invest: { ...state.invest, deals } };
}
