import { Check, Clock } from 'lucide-react';
import type { ProductDef } from '../../core/config/iap';
import { useT } from '../../i18n/useT';
import { purchaseCash } from '../../runtime/purchases';
import { useGameV2 } from '../../runtime/useGameV2';
import { NoAdsArt, StarterArt, StarterRewards } from './StoreParts';

// The packs' banners (2026-10-21; reference: Idle Guy's shop): what a pack is, shared by the Store
// (with the price pill under it) and the day's offer card on the home scene (with "View pack").

export function Checks({ lines }: { lines: string[] }) {
  return (
    <ul className="flex flex-col gap-1">
      {lines.map((line) => (
        <li key={line} className="v2-iap-check">
          <span className="mt-px w-4 h-4 shrink-0 rounded-full bg-emerald-400 border-2 border-white flex items-center justify-center">
            <Check className="w-2.5 h-2.5 text-white" strokeWidth={4} />
          </span>
          {line}
        </li>
      ))}
    </ul>
  );
}

const TITLE = 'v2-iap-title text-center text-[25px] max-[359px]:text-[22px] leading-none mt-2';

/** `welcome`: the welcome price is on; `secondsLeft` its countdown (Infinity: none). */
export function StarterBanner({ product, welcome, secondsLeft }: { product: ProductDef; welcome: boolean; secondsLeft: number }) {
  const { t, duration } = useT();
  return (
    <div className="v2-iap-banner v2-iap-banner-starter">
      <div className="v2-rays" aria-hidden />
      <div className="flex items-center justify-between gap-2">
        <span className="v2-iap-ribbon">{welcome ? t('iap.welcome.tag') : t('iap.once')}</span>
        {Number.isFinite(secondsLeft) && secondsLeft > 0 && (
          <span className="flex items-center gap-1 rounded-full bg-black/25 px-2 py-0.5 text-[11px] font-black text-white whitespace-nowrap">
            <Clock className="w-3.5 h-3.5" />
            {duration(secondsLeft)}
          </span>
        )}
      </div>
      <h3 className={TITLE}>{t('iap.starter.name')}</h3>
      <div className="flex items-center min-h-[132px]">
        <p className="flex-1 min-w-0 v2-display text-[19px] leading-[1.15] text-white [text-shadow:0_2px_3px_rgba(80,20,60,0.5)]">
          {t('iap.starter.headline')}
        </p>
        <StarterArt />
      </div>
      <StarterRewards product={product} />
    </div>
  );
}

export function ComfortBanner({ product }: { product: ProductDef }) {
  const { state } = useGameV2();
  const { t, money } = useT();
  return (
    <div className="v2-iap-banner v2-iap-banner-comfort">
      <div className="v2-rays" aria-hidden />
      <span className="v2-iap-ribbon">{t('iap.forever')}</span>
      <h3 className={TITLE}>{t('iap.comfort.name')}</h3>
      <div className="flex items-center gap-1 min-h-[140px]">
        <div className="flex-1 min-w-0 flex flex-col gap-2">
          <Checks
            lines={[
              t('iap.comfort.line1'),
              t('iap.comfort.cash', { amount: money(purchaseCash(state.game, state.purchases, product)) }),
              t('iap.comfort.line2'),
              t('iap.comfort.point3'),
            ]}
          />
          <p className="text-[10px] font-bold text-white/80">{t('iap.comfort.limits')}</p>
        </div>
        <NoAdsArt />
      </div>
    </div>
  );
}
