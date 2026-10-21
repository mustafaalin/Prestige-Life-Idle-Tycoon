import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { PRODUCTS, type ProductDef } from '../../core/config/iap';
import { useT } from '../../i18n/useT';
import { useBackButton } from '../../runtime/backButton';
import { saleId, welcomeSecondsLeft } from '../../runtime/purchases';
import { useGameV2 } from '../../runtime/useGameV2';
import { portalRoot } from '../stage';
import { ComfortBanner, StarterBanner } from './StoreBanners';
import { PricePill } from './StoreParts';
import { useBuy } from './useBuy';
import { usePrices } from './usePrices';

// The day's offer card (2026-10-14 the welcome one; 2026-10-21 once a day, user): at a quiet moment it
// shows one pack not bought yet as the Store shows it. The button says the price and buys at once
// through the store's own purchase dialog (2026-10-22, user: no detour through the Store); during the
// welcome price the price it goes up to is written under it. The only way out is the close button,
// shown after CLOSE_DELAY_MS. StoryDirector decides when and which
// (runtime/purchases.ts offerCardProduct).

/** The close button shows this long after the card. */
const CLOSE_DELAY_MS = 2000;

export function OfferCard({ product, onBought, onLater }: { product: ProductDef; onBought: () => void; onLater: () => void }) {
  const { state } = useGameV2();
  const { t } = useT();
  const price = usePrices();
  const { buy, busy, failed } = useBuy(onBought);
  // The close button comes a moment after the card, so the pack is seen before it can be dismissed
  // (2026-10-22, user); Android's back waits for it too.
  const [closable, setClosable] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(() => setClosable(true), CLOSE_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, []);
  useBackButton(true, 80, () => {
    if (closable) onLater();
  });

  const now = Date.now();
  const welcome = welcomeSecondsLeft(state.purchases, product, now);
  const id = saleId(state.purchases, product, now);

  return createPortal(
    <div className="fixed inset-0 z-[80] bg-black/45 flex items-center justify-center p-4 overflow-y-auto">
      <section role="dialog" aria-modal="true" aria-label={t(`iap.${product.key}.name` as 'iap.starter.name')} className="v2-iap v2-pop-in relative w-full max-w-[350px]">
        {closable && (
          <button
            type="button"
            onClick={onLater}
            aria-label={t('common.close')}
            className="v2-pop-in absolute z-10 -top-4 -right-3 w-12 h-12 rounded-full border-[3px] border-white bg-[#3b2a7a] shadow-lg flex items-center justify-center transition-all active:scale-90"
          >
            <X className="w-7 h-7 text-white" strokeWidth={3} />
          </button>
        )}
        <div className="v2-iap-wrap">
          {product === PRODUCTS.starter ? (
            <StarterBanner product={product} welcome={welcome > 0} secondsLeft={welcome} />
          ) : (
            <ComfortBanner product={product} />
          )}
          <PricePill disabled={busy !== null} onClick={() => void buy(product)}>
            {busy === id ? t('iap.busy') : t('iap.buy', { price: price(product, id) })}
          </PricePill>
        </div>
        {(welcome > 0 || failed) && (
          <p role={failed ? 'status' : undefined} className="mt-2 text-center text-[12px] font-bold text-white/90">
            {failed ? t('iap.failed') : t('iap.welcome.later', { price: price(product) })}
          </p>
        )}
      </section>
    </div>,
    portalRoot(),
  );
}
