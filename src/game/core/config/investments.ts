import { WEALTH_CLASSES } from './classes';

// The investment account, "Old Ray's deals" (plan 2.5, decided 2026-10-15; game-design-v2.md §4.14).
// The player puts savings in for a set time and collects stake and return when it is up. Every deal can
// run at once, one of each. Rules: runtime/investment.ts. Checked by `npm run sim`.

/** Saved with a running deal: never rename one. */
export type InvestPlanId = 'quick' | 'safe' | 'balanced' | 'bold' | 'night' | 'special';

export interface InvestPlan {
  id: InvestPlanId;
  hours: number;
  /** Return when it pays off (0.2 = +20%). */
  gain: number;
  /** The old bold deal only: the chance it paid off, and what it lost otherwise (-0.2 = −20%). */
  chance?: number;
  loss?: number;
  /** Opens only with a rewarded ad (ad placement `invest_special`). */
  ad?: boolean;
  /** No longer offered: kept so a deal running in an old save still shows and pays out. */
  retired?: boolean;
  /** Its picture: a step of the money series (ui/icons.ts MONEY), bigger for a bigger deal. */
  moneyTier: 2 | 3 | 4 | 5 | 6;
}

/**
 * Three deals, none can lose (2026-10-22, user: "waiting 8 hours to lose money annoys the player"; a
 * player who invests every 5 minutes is one who stays and plays, so the quick deal may pay well). Before:
 * five deals, 10 min +2%, 1 h +7%, 4 h +22%, 8 h bold (60%: +70%, else −20%), an ad hour +20%.
 */
export const INVEST_PLANS: InvestPlan[] = [
  { id: 'quick', hours: 5 / 60, gain: 0.1, moneyTier: 3 },
  // For the night.
  { id: 'night', hours: 6, gain: 0.5, moneyTier: 5 },
  // Old Ray's special: an ad opens it, the night deal doubled (twice a day, config/ads.ts).
  { id: 'special', hours: 6, gain: 1, ad: true, moneyTier: 6 },
  { id: 'safe', hours: 1, gain: 0.07, retired: true, moneyTier: 3 },
  { id: 'balanced', hours: 4, gain: 0.22, retired: true, moneyTier: 4 },
  { id: 'bold', hours: 8, gain: 0.7, chance: 0.6, loss: -0.2, retired: true, moneyTier: 5 },
];

/** The deals on offer (the retired ones only finish a deal from an old save). */
export const OFFERED_PLANS = INVEST_PLANS.filter((plan) => !plan.retired);

/**
 * The most that can go into one deal, in months of income (24 = two years; 60 until the economy rebuild,
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
