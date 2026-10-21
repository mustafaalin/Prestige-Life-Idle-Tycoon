import type { ReactNode } from 'react';
import { MONEY } from './icons';
import { useMoneyTier, type MoneyTier } from './piles';

// Money rewards always come with green banknotes (2026-10-22, user): the money series' picture beside
// the amount, a bigger one for a bigger reward, so two offers side by side read at a glance.

/** One picture of the money series; `size` in px. */
export function MoneyIcon({ tier, size = 44 }: { tier: MoneyTier; size?: number }) {
  return (
    <img
      src={MONEY[tier - 1]}
      alt=""
      draggable={false}
      className="shrink-0 object-contain drop-shadow-md"
      style={{ width: size, height: size }}
      aria-hidden
    />
  );
}

/** A money reward's figure with its banknotes before it. */
export function CashAmount({ amount, tier, size = 40, children }: { amount: number; tier?: MoneyTier; size?: number; children: ReactNode }) {
  const auto = useMoneyTier(amount);
  return (
    <span className="inline-flex items-center justify-center gap-2">
      <MoneyIcon tier={tier ?? auto} size={size} />
      {children}
    </span>
  );
}
