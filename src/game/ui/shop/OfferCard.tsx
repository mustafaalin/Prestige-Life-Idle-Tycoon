import { Check } from 'lucide-react';
import { createPortal } from 'react-dom';
import type { MessageKey } from '../../i18n/translate';
import { useT } from '../../i18n/useT';
import { useBackButton } from '../../runtime/backButton';
import { offerSecondsLeft, storeProducts } from '../../runtime/purchases';
import { useGameV2 } from '../../runtime/useGameV2';
import { GameButton } from '../kit';

// The welcome card (decided 2026-10-14): once, at a quiet moment after the first ceremony, it points
// at the limited offer. "Take a look" opens the Store; it never buys from here. StoryDirector decides
// when (runtime/purchases.ts offerCardDue).

export function OfferCard({ onLook, onLater }: { onLook: () => void; onLater: () => void }) {
  const { state } = useGameV2();
  const { t, duration } = useT();
  useBackButton(true, 80, onLater);

  const now = Date.now();
  const product = storeProducts(state, now).find((entry) => entry.section === 'limited');
  if (!product) return null;
  const left = offerSecondsLeft(state.purchases, product, now);

  return createPortal(
    <div className="fixed inset-0 z-[80] bg-black/35 flex items-center justify-center px-6">
      <div className="v2-pop-in w-full max-w-[340px] rounded-[28px] bg-gradient-to-b from-amber-50 to-white shadow-2xl overflow-hidden">
        <div className="px-4 py-3 bg-gradient-to-r from-violet-500 to-indigo-500">
          <p className="text-[10px] font-black uppercase tracking-widest text-white/80">{t('iap.card.tag')}</p>
          <p className="v2-display v2-outline-thin text-xl text-white leading-tight break-words">
            {t(`iap.${product.key}.name` as MessageKey)}
          </p>
        </div>
        <div className="px-4 pt-3 pb-5 flex flex-col items-center">
          <img src={product.art} alt="" draggable={false} className="w-36 h-36 object-contain drop-shadow" />
          <ul className="mt-2 self-stretch flex flex-col gap-1">
            {Array.from({ length: product.lines }, (_, index) => (
              <li key={index} className="flex items-start gap-2 text-[14px] font-bold leading-snug text-slate-700">
                <Check className="w-4 h-4 mt-0.5 shrink-0 text-emerald-500" />
                {t(`iap.${product.key}.line${index + 1}` as MessageKey)}
              </li>
            ))}
          </ul>
          {Number.isFinite(left) && (
            <p className="mt-2 text-[11px] font-black uppercase tracking-widest text-amber-600">
              {t('iap.ends', { duration: duration(left) })}
            </p>
          )}
          <GameButton tone="gold" onClick={onLook} className="w-full mt-4 py-3 v2-display text-lg v2-shadow">
            {t('iap.card.look')}
          </GameButton>
          <button
            type="button"
            onClick={onLater}
            className="w-full mt-2 rounded-2xl py-3 font-black text-sm bg-slate-100 text-slate-600 transition-all active:scale-[0.98]"
          >
            {t('iap.card.later')}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
