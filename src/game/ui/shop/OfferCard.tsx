import { Clock, X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useT } from '../../i18n/useT';
import { useBackButton } from '../../runtime/backButton';
import { limitedOffer, saleId, welcomeSecondsLeft } from '../../runtime/purchases';
import { useGameV2 } from '../../runtime/useGameV2';
import { STORE_ART } from './storeArt';
import { BuyButton, StarterRewards } from './StoreParts';
import { usePrices } from './usePrices';

// The welcome offer (decided 2026-10-14; look: docs/iap-store-design-handoff.md): once, at a quiet
// moment after the first ceremony, it points at the limited offer. It is a paid pack, so the card says
// so with its price; "View pack" opens the Store and never buys from here. StoryDirector decides when
// (runtime/purchases.ts offerCardDue).

export function OfferCard({ onLook, onLater }: { onLook: () => void; onLater: () => void }) {
  const { state } = useGameV2();
  const { t, duration } = useT();
  const price = usePrices();
  useBackButton(true, 80, onLater);

  const now = Date.now();
  const product = limitedOffer(state, now);
  if (!product) return null;
  const left = welcomeSecondsLeft(state.purchases, product, now);

  return createPortal(
    <div className="fixed inset-0 z-[80] bg-black/35 flex items-center justify-center p-4 overflow-y-auto">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="offer-title"
        className="v2-iap v2-iap-card w-full max-w-[340px] max-h-full overflow-y-auto rounded-[25px] border-[#f1c05d] p-[15px] text-center shadow-2xl"
        style={{ background: 'radial-gradient(ellipse at 50% 30%, #ffe9af, transparent 60%), #fff5de' }}
      >
        <div className="flex items-center justify-between gap-2 text-left">
          <span className="v2-iap-badge">{t('iap.offer.tag')}</span>
          <button
            type="button"
            onClick={onLater}
            aria-label={t('common.close')}
            className="-mr-2 -mt-1 w-11 h-11 rounded-full flex items-center justify-center text-[#231951] transition-all active:scale-90"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <h3 id="offer-title" className="v2-display text-[25px] leading-[1.1] mt-1 break-words">
          {t(`iap.${product.key}.name` as 'iap.starter.name')}
        </h3>
        <p className="mt-1 text-[12px] v2-iap-muted">
          {left > 0
            ? t('iap.offer.welcome', { price: price(product, saleId(state.purchases, product, now)), later: price(product) })
            : t('iap.offer.paid', { price: price(product) })}
        </p>
        <div className="v2-iap-art mx-auto my-1 w-[142px] h-[142px] max-[359px]:w-[120px] max-[359px]:h-[120px]">
          <img src={STORE_ART.dog} alt="" draggable={false} className="w-full h-full object-contain" />
        </div>
        <h4 className="v2-display text-[19px] leading-tight mb-2.5 break-words">{t('iap.starter.headline')}</h4>
        <StarterRewards product={product} />
        {left > 0 && (
          <p className="mb-3.5 inline-flex items-center gap-1.5 rounded-full bg-[#fff1cf] px-3 py-1 text-[11px] font-bold text-[#814307]">
            <Clock className="w-3.5 h-3.5" />
            {t('iap.offer.ends', { duration: duration(left) })}
          </p>
        )}
        <BuyButton onClick={onLook}>{t('iap.offer.look')}</BuyButton>
        <button type="button" onClick={onLater} className="w-full mt-1 min-h-11 font-bold text-[14px] text-[#665978]">
          {t('iap.offer.later')}
        </button>
      </section>
    </div>,
    document.body,
  );
}
