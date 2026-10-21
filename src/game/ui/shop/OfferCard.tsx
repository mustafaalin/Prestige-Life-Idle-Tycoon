import { X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { PRODUCTS, type ProductDef } from '../../core/config/iap';
import { useT } from '../../i18n/useT';
import { useBackButton } from '../../runtime/backButton';
import { saleId, welcomeSecondsLeft } from '../../runtime/purchases';
import { useGameV2 } from '../../runtime/useGameV2';
import { portalRoot } from '../stage';
import { ComfortBanner, StarterBanner } from './StoreBanners';
import { PricePill } from './StoreParts';
import { usePrices } from './usePrices';

// The day's offer card (2026-10-14 the welcome one; 2026-10-21 once a day, user): at a quiet moment it
// shows one pack not bought yet as the Store shows it, with its price. It is a paid pack, so "View
// pack" opens the Store and never buys from here. StoryDirector decides when and which
// (runtime/purchases.ts offerCardProduct).

export function OfferCard({ product, onLook, onLater }: { product: ProductDef; onLook: () => void; onLater: () => void }) {
  const { state } = useGameV2();
  const { t } = useT();
  const price = usePrices();
  useBackButton(true, 80, onLater);

  const now = Date.now();
  const welcome = welcomeSecondsLeft(state.purchases, product, now);
  const priceLine =
    welcome > 0
      ? t('iap.offer.welcome', { price: price(product, saleId(state.purchases, product, now)), later: price(product) })
      : t('iap.offer.paid', { price: price(product) });

  return createPortal(
    <div className="fixed inset-0 z-[80] bg-black/45 flex items-center justify-center p-4 overflow-y-auto">
      <section role="dialog" aria-modal="true" aria-label={t(`iap.${product.key}.name` as 'iap.starter.name')} className="v2-iap v2-pop-in relative w-full max-w-[350px]">
        <button
          type="button"
          onClick={onLater}
          aria-label={t('common.close')}
          className="absolute z-10 -top-3 -right-2 w-10 h-10 rounded-full border-2 border-white bg-[#3b2a7a] shadow-lg flex items-center justify-center transition-all active:scale-90"
        >
          <X className="w-5 h-5 text-white" />
        </button>
        <div className="v2-iap-wrap">
          {product === PRODUCTS.starter ? (
            <StarterBanner product={product} welcome={welcome > 0} secondsLeft={welcome} />
          ) : (
            <ComfortBanner product={product} />
          )}
          <PricePill onClick={onLook}>{t('iap.offer.look')}</PricePill>
        </div>
        <p className="mt-2 text-center text-[11px] font-bold text-white/90">{priceLine}</p>
        <button type="button" onClick={onLater} className="w-full min-h-11 font-bold text-[14px] text-white/80">
          {t('iap.offer.later')}
        </button>
      </section>
    </div>,
    portalRoot(),
  );
}
