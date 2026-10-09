import type { UpgradeDef } from '../types';
import { BUSINESSES, roundNice } from './businesses';

// Business upgrades (game-design-v2 §4.2): three one-time buys per business, each doubling that
// business's profit. They unlock at a unit count, so buying units, an upgrade or a manager is a
// real choice. Names live in i18n (`upgrades.<businessId>.<n>`). Checked by `npm run sim`.

export const UPGRADE_TUNING = {
  /** Units needed for upgrade 1, 2, 3. */
  requiredOwned: [5, 15, 35],
  /**
   * Price as a multiple of what reaching that unit count cost (2026-10-09). Tied to the business's
   * own size, so there are no jumps and late businesses' upgrades stay in reach (the old 6× / 3000× /
   * 120000× of the first unit's price put them beyond the whole game).
   */
  reachCostMultiple: [2, 6, 20],
  multiplier: 2,
};

/** Price of units 1..n of a business (geometric series, like formulas.costForUnits from zero). */
const reachCost = (baseCost: number, growth: number, units: number) => (baseCost * (growth ** units - 1)) / (growth - 1);

export const UPGRADES: UpgradeDef[] = BUSINESSES.flatMap((def) =>
  UPGRADE_TUNING.requiredOwned.map((requiredOwned, index) => ({
    id: `${def.id}:${index + 1}`,
    businessId: def.id,
    cost: roundNice(reachCost(def.baseCost, def.costGrowth, requiredOwned) * UPGRADE_TUNING.reachCostMultiple[index]),
    requiredOwned,
    multiplier: UPGRADE_TUNING.multiplier,
  })),
);
