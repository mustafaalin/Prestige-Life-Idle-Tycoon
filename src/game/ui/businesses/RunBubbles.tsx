import { useEffect, useRef, useState } from 'react';
import { useT } from '../../i18n/useT';
import { useGameV2Events } from '../../runtime/useGameV2';
import { ICONS } from '../icons';

// Each paid run of a business (2026-10-21, user): a bubble with a banknote and "+$5" rises from the
// picture and fades. One per tap on "Run"; a managed line pays every second, so one a second.

/** How long one bubble lives (matches .v2-run-bubble in mobile.css). */
const BUBBLE_MS = 1100;
/** Bubbles on a card at once; a fast line never stacks a cloud. */
const MOST_BUBBLES = 3;

interface Bubble {
  id: number;
  amount: number;
}

export function RunBubbles({ businessId }: { businessId: string }) {
  const { money } = useT();
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const nextId = useRef(0);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach((timer) => window.clearTimeout(timer)), []);

  useGameV2Events((event) => {
    if (event.type !== 'payout') return;
    const paid = event.payouts.find((payout) => payout.businessId === businessId);
    if (!paid || paid.amount <= 0) return;
    const id = nextId.current++;
    setBubbles((list) => [...list.slice(1 - MOST_BUBBLES), { id, amount: paid.amount }]);
    timers.current.push(window.setTimeout(() => setBubbles((list) => list.filter((bubble) => bubble.id !== id)), BUBBLE_MS));
  });

  return (
    <span className="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-center" aria-hidden>
      {bubbles.map((bubble) => (
        <span
          key={bubble.id}
          className="v2-run-bubble absolute top-0 flex items-center gap-1 whitespace-nowrap rounded-full border-2 border-white bg-white/95 pl-0.5 pr-2 py-0.5 shadow-md"
        >
          <img src={ICONS.money} alt="" draggable={false} className="w-6 h-6 object-contain" />
          <span className="v2-display text-[14px] text-emerald-600 tabular-nums">+{money(bubble.amount)}</span>
        </span>
      ))}
    </span>
  );
}
