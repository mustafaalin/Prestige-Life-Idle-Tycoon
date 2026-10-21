import { SECONDS_PER_MONTH } from '../core/config/life';
import { incomePerSecond } from '../core/formulas';
import { useGameV2 } from '../runtime/useGameV2';

// How big a pile of banknotes a money reward gets (CashAmount.tsx).

export type Piles = 1 | 2 | 3;

/** How many piles a reward deserves next to what the player earns: under a month 1, under six 2, more 3. */
export function usePiles(amount: number): Piles {
  const { game } = useGameV2();
  const month = incomePerSecond(game, 'active') * SECONDS_PER_MONTH;
  if (month <= 0 || amount < month) return 1;
  return amount < month * 6 ? 2 : 3;
}

