import type { UpgradeDef } from '../types';
import { BUSINESSES, roundNice } from './businesses';

// Business upgrades (game-design-v2 §4.2): three one-time buys per business, each doubling that
// business's profit. They unlock at a unit count, so buying units, an upgrade or a manager is a
// real choice. Names live in i18n (`upgrades.<businessId>.<n>`). Checked by `npm run sim`.

export const UPGRADE_TUNING = {
  /** Units needed for upgrade 1, 2, 3. */
  requiredOwned: [5, 15, 35],
  /**
   * Price as a multiple of the business's first unit price. The first is cheap (about a minute of
   * income when it unlocks, so the first upgrade comes early); the later ones hold the mid-game pace.
   */
  costMultiple: [6, 3000, 120000],
  multiplier: 2,
};

export const UPGRADES: UpgradeDef[] = BUSINESSES.flatMap((def) =>
  UPGRADE_TUNING.requiredOwned.map((requiredOwned, index) => ({
    id: `${def.id}:${index + 1}`,
    businessId: def.id,
    cost: roundNice(def.baseCost * UPGRADE_TUNING.costMultiple[index]),
    requiredOwned,
    multiplier: UPGRADE_TUNING.multiplier,
  })),
);
