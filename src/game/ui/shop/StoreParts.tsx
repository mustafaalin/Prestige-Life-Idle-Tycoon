import { type CSSProperties, type ReactNode } from 'react';
import type { ProductDef } from '../../core/config/iap';
import { useT } from '../../i18n/useT';
import { purchaseCash } from '../../runtime/purchases';
import { CashPile } from '../CashAmount';
import type { Piles } from '../piles';
import { useGameV2 } from '../../runtime/useGameV2';
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

/**
 * The Comfort Pack at a glance (2026-10-22): the red play button under a gold "no" ring, the gift
 * peeking out (the rewards still come, only the ads are gone). One picture, art/pilot/15-iap/v2/comfort-noads.png.
 */
export function NoAdsArt({ className = 'w-[148px] max-[359px]:w-[125px]' }: { className?: string }) {
  return (
    <div className={`v2-iap-art aspect-square shrink-0 ${className}`}>
      <img src={STORE_ART.noAds} alt="" draggable={false} className="absolute inset-0 w-full h-full object-contain" />
    </div>
  );
}

/**
 * One reward as an object: what it is in big letters (the amount itself, never a formula), then what it
 * means. `piles`: a money reward, drawn as that many piles of banknotes instead of `image`.
 */
export function Tile({ image, value, note, money = false, piles }: { image: string; value: string; note: string; money?: boolean; piles?: Piles }) {
  return (
    <div className="v2-iap-reward">
      {piles ? (
        <span className="flex justify-center items-end h-[44px]">
          <CashPile piles={piles} size={piles === 1 ? 44 : 30} />
        </span>
      ) : (
        <img src={image} alt="" draggable={false} className="block w-[44px] h-[44px] mx-auto object-contain" />
      )}
      <b
        className={`block v2-display text-[17px] max-[359px]:text-[15px] leading-[1.1] mt-1 break-words ${
          money ? 'text-emerald-500 v2-outline-thin' : 'text-[#2b1b6b]'
        }`}
      >
        {value}
      </b>
      <small className="block mt-0.5 text-[10px] font-bold leading-[1.25] v2-iap-muted">{note}</small>
    </div>
  );
}

/**
 * The Starter Pack's three rewards, each as its own object. The income reward says how much money it
 * is now (2026-10-21, user: "1 hour of income" told the player nothing).
 */
export function StarterRewards({ product }: { product: ProductDef }) {
  const { state } = useGameV2();
  const { t, money } = useT();
  const boostHours = product.boostSeconds / 3600;
  const incomeHours = product.incomeSeconds / 3600;
  const cash = purchaseCash(state.game, state.purchases, product);
  return (
    <div className="grid grid-cols-3 gap-1.5">
      <Tile image={STORE_ART.hourglass} value={t('iap.starter.boost')} note={t('iap.starter.boostFor', { count: boostHours })} />
      <Tile image={STORE_ART.cash} value={`+${money(cash)}`} note={t('iap.starter.incomeNote', { count: incomeHours })} money piles={1} />
      <Tile
        image={STORE_ART.scarf}
        value={t('iap.starter.scarfValue', { percent: Math.round(product.incomeBonus * 100) })}
        note={t('iap.starter.scarfNote')}
      />
    </div>
  );
}

/** The gold price pill on a banner's bottom edge. */
export function PricePill({ disabled, onClick, children }: { disabled?: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      className="v2-iap-pill v2-display text-[18px] break-words"
    >
      {children}
    </button>
  );
}
