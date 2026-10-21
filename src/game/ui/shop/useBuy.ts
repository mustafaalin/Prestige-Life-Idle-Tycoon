import { useEffect, useRef, useState } from 'react';
import type { ProductDef } from '../../core/config/iap';
import { useT } from '../../i18n/useT';
import { haptic, playSfx } from '../../runtime/feedback';
import { buyProduct } from '../../runtime/iap';
import { purchaseCash, saleId } from '../../runtime/purchases';
import { useGameV2 } from '../../runtime/useGameV2';
import { payout } from '../home/coins';

// Buying a pack, the same from the Store and from the day's offer card (2026-10-22, user: the card
// buys at once instead of sending the player to the Store): the store's own purchase dialog, then the
// rewards, the money flying in and the sound. One purchase at a time.

export function useBuy(onBought?: (product: ProductDef) => void) {
  const { state, actions } = useGameV2();
  const { money } = useT();
  // The store's dialog takes a while; the paid amount is read from the state after it.
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  });
  const [busy, setBusy] = useState<string | null>(null);
  const [failed, setFailed] = useState<string | null>(null);

  const buy = async (product: ProductDef) => {
    if (busy) return;
    playSfx('click');
    const id = saleId(stateRef.current.purchases, product, Date.now());
    setBusy(id);
    setFailed(null);
    const outcome = await buyProduct(id);
    setBusy(null);
    if (outcome === 'purchased') {
      // Read before the purchase lands: the same amount applyPurchase pays.
      const cash = purchaseCash(stateRef.current.game, stateRef.current.purchases, product);
      actions.purchases.apply(id);
      playSfx('purchase');
      haptic('medium');
      payout({ amount: cash, label: `+${money(cash)}`, count: 14 });
      onBought?.(product);
    } else if (outcome === 'unavailable') {
      setFailed(product.id);
    }
  };

  return { buy, busy, failed };
}
