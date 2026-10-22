import { WEALTH_CLASSES } from './classes';

// The investment account, "Old Ray's deals" (plan 2.5, decided 2026-10-15; game-design-v2.md §4.14).
// The player puts savings in for a set time and collects stake and return when it is up. One at a
// time. Rules: runtime/investment.ts. Checked by `npm run sim`.

/** Saved with a running deal: never rename one. */
export type InvestPlanId = 'quick' | 'safe' | 'balanced' | 'bold' | 'special';

export interface InvestPlan {
  id: InvestPlanId;
  hours: number;
  /** Return when it pays off (0.2 = +20%). */
  gain: number;
  /** The bold deal only: the chance it pays off, and what it loses otherwise (-0.2 = −20%). */
  chance?: number;
  loss?: number;
  /** Opens only with a rewarded ad (ad placement `invest_special`). */
  ad?: boolean;
  /** Its picture: a step of the money series (ui/icons.ts MONEY), bigger for a bigger deal. */
  moneyTier: 2 | 3 | 4 | 5 | 6;
}

/**
 * Short deals pay a little, long ones a lot (2026-10-22, user, after Idle Guy's bank: a 3-minute deal
 * beside day-long ones, and an ad deal that pays the most). Was 1 h +5%, 4 h +20%, 8 h bold.
 */
export const INVEST_PLANS: InvestPlan[] = [
  { id: 'quick', hours: 1 / 6, gain: 0.02, moneyTier: 2 },
  { id: 'safe', hours: 1, gain: 0.07, moneyTier: 3 },
  { id: 'balanced', hours: 4, gain: 0.22, moneyTier: 4 },
  // For the night: like the event cards' bold answer, a big win or a small loss (expected +34%).
  { id: 'bold', hours: 8, gain: 0.7, chance: 0.6, loss: -0.2, moneyTier: 5 },
  // Old Ray's special: an ad opens it, an hour for a fifth more (twice a day, config/ads.ts).
  { id: 'special', hours: 1, gain: 0.2, ad: true, moneyTier: 6 },
];

/**
 * The most that can go in, in months of income (24 = two years; 60 until the economy rebuild,
 * 2026-10-21, when offline earnings fell to 20% and the deals grew to an eighth of all money). Without
 * a cap the savings snowball session after session and the account pays a quarter to most of the game
 * (simulator, 2026-10-15).
 */
export const INVEST_CAP_MONTHS = 24;

/** The account opens with Middle Class, when players start saving for big purchases. */
export const INVEST_FROM_CLASS = WEALTH_CLASSES.findIndex((wealthClass) => wealthClass.id === 'middle-class');

export function investPlan(id: string): InvestPlan | undefined {
  return INVEST_PLANS.find((plan) => plan.id === id);
}

/** The average return of a deal (the bold one weighs its win and its loss). */
export function expectedGain(plan: InvestPlan) {
  return plan.chance === undefined ? plan.gain : plan.chance * plan.gain + (1 - plan.chance) * (plan.loss ?? 0);
}
