import type { CSSProperties, ReactNode } from 'react';
import type { ProductDef } from '../../core/config/iap';
import { useT } from '../../i18n/useT';
import { STORE_ART } from './storeArt';

// The pieces the Store and the offer card share (design: docs/iap-store-design-handoff.md). The art is
// layered: separate pictures placed by hand, so they are never cropped (art/pilot/15-iap/v2/).

function Layer({ src, className, style }: { src: string; className?: string; style?: CSSProperties }) {
  return <img src={src} alt="" draggable={false} className={`absolute max-w-none ${className ?? ''}`} style={style} />;
}

/** Lucky in his scarf with the cash, coins and hourglass of the pack; the cash floats a little. */
export function StarterArt() {
  return (
    <div className="v2-iap-art w-[148px] max-[359px]:w-[125px] aspect-[148/158] shrink-0">
      <Layer src={STORE_ART.dog} className="top-0 right-0 w-full" />
      <Layer src={STORE_ART.cash} className="v2-iap-float bottom-0" style={{ width: '50.7%', left: '-8%' }} />
      <Layer src={STORE_ART.coins} style={{ width: '34.5%', left: '29%', bottom: '-1.3%' }} />
      <Layer src={STORE_ART.hourglass} style={{ width: '32.4%', right: '-2%', bottom: '2.5%' }} />
    </div>
  );
}

/** The gift box with its lid breathing above it and the check medal. */
export function ComfortArt() {
  return (
    <div className="v2-iap-art w-[148px] max-[359px]:w-[125px] aspect-[148/146] shrink-0">
      <Layer src={STORE_ART.box} className="left-0 w-full" style={{ top: '24%' }} />
      <Layer src={STORE_ART.lid} className="v2-iap-lid" style={{ width: '89%', left: '5.5%', top: '-4%' }} />
      <Layer src={STORE_ART.medal} style={{ width: '46.6%', right: '-2%', bottom: 0 }} />
    </div>
  );
}

function Tile({ image, title, note }: { image: string; title: string; note: string }) {
  return (
    <div className="v2-iap-tile px-[3px] pt-[7px] pb-2 text-center">
      <img src={image} alt="" draggable={false} className="block w-[43px] h-[43px] mx-auto object-contain" />
      <b className="block v2-display text-[12px] max-[359px]:text-[11px] leading-[1.2] my-[3px] break-words">{title}</b>
      <small className="block text-[10px] leading-[1.3] v2-iap-muted">{note}</small>
    </div>
  );
}

/** The Starter Pack's three rewards, each as its own object. */
export function StarterRewards({ product }: { product: ProductDef }) {
  const { t } = useT();
  const boostHours = product.boostSeconds / 3600;
  const incomeHours = product.incomeSeconds / 3600;
  return (
    <div className="grid grid-cols-3 gap-1.5 mt-1 mb-3">
      <Tile image={STORE_ART.hourglass} title={t('iap.starter.boost')} note={t('iap.starter.boostFor', { count: boostHours })} />
      <Tile image={STORE_ART.cash} title={t('iap.starter.income', { count: incomeHours })} note={t('iap.starter.incomeWhen')} />
      <Tile image={STORE_ART.scarf} title={t('iap.starter.scarf')} note={t('iap.starter.scarfFor')} />
    </div>
  );
}

/** The gold buy button; it never cuts the price, a long one wraps. */
export function BuyButton({ disabled, onClick, children }: { disabled?: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      className="v2-iap-buy v2-display text-[16px] break-words"
    >
      {children}
    </button>
  );
}
