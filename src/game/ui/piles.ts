import { SECONDS_PER_MONTH } from '../core/config/life';
import { incomePerSecond } from '../core/formulas';
import { useGameV2 } from '../runtime/useGameV2';

// Which picture of the money series a money reward gets (CashAmount.tsx, icons.ts MONEY).

/** Money series step: 1 a banknote … 6 a vault. */
export type MoneyTier = 1 | 2 | 3 | 4 | 5 | 6;

/**
 * The step a reward deserves next to what the player earns (docs/art-prompts-v2.md §2): under a month
 * a bundle (M2), up to six months three bundles (M3), up to two years a pyramid (M4), more a briefcase (M5).
 */
export function useMoneyTier(amount: number): MoneyTier {
  const { game } = useGameV2();
  const month = incomePerSecond(game, 'active') * SECONDS_PER_MONTH;
  if (month <= 0 || amount < month) return 2;
  if (amount <= month * 6) return 3;
  return amount <= month * 24 ? 4 : 5;
}
