import type { ReactNode } from 'react';
import { usePiles, type Piles } from './piles';

// Money rewards always come with green banknotes (2026-10-22, user): a pile of cash beside the amount,
// and a bigger pile for a bigger reward, so two offers side by side read at a glance.

const PILE = '/assets/iap/v2/starter-cash.webp';

/** Where each pile sits, as shares of the box, back to front (2 and 3 piles stack up). */
const LAYOUTS: Record<1 | 2 | 3, { left: number; top: number }[]> = {
  1: [{ left: 0, top: 0 }],
  2: [
    { left: 0.32, top: 0 },
    { left: 0, top: 0.22 },
  ],
  3: [
    { left: 0.22, top: 0 },
    { left: 0, top: 0.3 },
    { left: 0.44, top: 0.3 },
  ],
};

/** One to three piles of banknotes; `size` is one pile's height in px. */
export function CashPile({ piles = 1, size = 44 }: { piles?: Piles; size?: number }) {
  const layout = LAYOUTS[piles];
  const width = size * (1 + Math.max(...layout.map((spot) => spot.left)));
  const height = size * (1 + Math.max(...layout.map((spot) => spot.top)));
  return (
    <span className="relative inline-block shrink-0" style={{ width, height }} aria-hidden>
      {layout.map((spot, index) => (
        <img
          key={index}
          src={PILE}
          alt=""
          draggable={false}
          className="absolute object-contain drop-shadow-md"
          style={{ left: spot.left * size, top: spot.top * size, width: size, height: size }}
        />
      ))}
    </span>
  );
}

/** A money reward's figure with its banknotes before it. */
export function CashAmount({ amount, piles, size = 40, children }: { amount: number; piles?: Piles; size?: number; children: ReactNode }) {
  const auto = usePiles(amount);
  return (
    <span className="inline-flex items-center justify-center gap-2">
      <CashPile piles={piles ?? auto} size={size} />
      {children}
    </span>
  );
}
