import { useState } from 'react';
import type { ProductDef } from '../../core/config/iap';
import { useT } from '../../i18n/useT';
import { purchaseCash } from '../../runtime/purchases';
import { useGameV2 } from '../../runtime/useGameV2';
import { CashPile } from '../CashAmount';
import type { Piles } from '../piles';

// The Store's cash bags (2026-10-22, user: five money packs like the reference shop): a grid of tiles,
// the amount on top (hours of the player's income, so it grows with them), the money below, the price
// on a gold button. Products: config/iap.ts CASH_BAGS.

/** Until the money series (M2–M6) is in public/assets/icons/v2/, a pile that grows with the bag. */
const STAND_IN: { piles: Piles; size: number }[] = [
  { piles: 1, size: 44 },
  { piles: 1, size: 56 },
  { piles: 2, size: 40 },
  { piles: 3, size: 34 },
  { piles: 3, size: 40 },
];

function BagArt({ product, tier }: { product: ProductDef; tier: number }) {
  const [missing, setMissing] = useState(false);
  if (missing) {
    const standIn = STAND_IN[tier];
    return <CashPile piles={standIn.piles} size={standIn.size} />;
  }
  return <img src={product.art} alt="" draggable={false} className="w-16 h-16 object-contain drop-shadow-md" onError={() => setMissing(true)} />;
}

interface Props {
  bags: ProductDef[];
  price: (product: ProductDef) => string;
  busy: string | null;
  failed: string | null;
  onBuy: (product: ProductDef) => void;
}

export function CashBags({ bags, price, busy, failed, onBuy }: Props) {
  const { state } = useGameV2();
  const { t, money, duration } = useT();
  return (
    <>
      <div className="flex flex-wrap justify-center gap-2">
        {bags.map((product, tier) => {
          const cash = purchaseCash(state.game, state.purchases, product);
          return (
            <div key={product.id} className="v2-iap-free w-[calc((100%-1rem)/3)]">
              <b className="v2-display text-emerald-500 v2-outline-thin text-[17px] leading-none tabular-nums break-all">+{money(cash)}</b>
              <small className="text-[10px] font-bold leading-tight v2-iap-muted">{t('iap.cash.note', { duration: duration(product.incomeSeconds) })}</small>
              <div className="h-16 flex items-center justify-center">
                <BagArt product={product} tier={tier} />
              </div>
              <button
                type="button"
                disabled={busy !== null}
                onClick={() => onBuy(product)}
                aria-label={t('iap.cash.buy', { amount: money(cash), price: price(product) })}
                className="v2-iap-buy v2-display w-full text-[14px]"
              >
                {busy === product.id ? '…' : price(product)}
              </button>
            </div>
          );
        })}
      </div>
      {failed !== null && bags.some((product) => product.id === failed) && (
        <p role="status" className="text-[11px] font-bold text-center v2-iap-muted">
          {t('iap.failed')}
        </p>
      )}
    </>
  );
}
