import type { ReactNode } from 'react';
import { useT } from '../../i18n/useT';
import { Cash } from '../CashAmount';
import { TILE_FACE } from '../kit';
import { UiIcon, type UiIconName } from '../UiIcon';

// The shop's pieces in the game look of the job tree (2026-10-23, user: "the shop still looks like the
// first draft"): the next dream as a chunky tile with its picture on a stage, the dreams after it in a
// side-scrolling row, the collection as tiles with a ribbon on the one in use. Styles: mobile.css
// `.v2-shop-*` on top of `.v2-job`.

/** dream: saving or locked · ready: can be bought now (gold, glowing) · lux: luxury toys. */
export type ShowcaseTone = 'dream' | 'ready' | 'lux' | 'lux-ready';

const TONE_CLASS: Record<ShowcaseTone, string> = {
  dream: 'v2-shop-dream',
  ready: 'v2-shop-ready',
  lux: 'v2-shop-lux',
  'lux-ready': 'v2-shop-lux v2-shop-ready',
};

const BAND: Record<ShowcaseTone, string> = {
  dream: 'from-indigo-400 to-violet-500',
  ready: 'from-amber-400 to-orange-500',
  lux: 'from-fuchsia-500 to-purple-600',
  'lux-ready': 'from-amber-400 to-fuchsia-500',
};

/** The next dream: band, picture on its stage, name, what buying it does, the jobs it opens, then one action. */
export function Showcase({
  tone,
  band,
  chip,
  picture,
  name,
  price,
  promise,
  opens,
  children,
}: {
  tone: ShowcaseTone;
  band: ReactNode;
  chip?: ReactNode;
  picture: ReactNode;
  name: ReactNode;
  /** The big price under the name. */
  price?: ReactNode;
  /** One line on what buying it does ("Parks in front of your home"), with its icon. */
  promise?: { icon: UiIconName; text: ReactNode };
  opens?: ReactNode;
  /** The action area at the foot: a buy button, or what is still missing. */
  children: ReactNode;
}) {
  return (
    <div className={`v2-job ${TONE_CLASS[tone]} flex flex-col`}>
      <div className={`relative z-[1] bg-gradient-to-r ${BAND[tone]} px-4 py-1.5 flex items-center justify-between gap-2`}>
        <p className="v2-display text-[13px] uppercase tracking-wide text-white v2-shadow">{band}</p>
        {chip}
      </div>
      <div className="relative z-[1] p-3 flex flex-col gap-2.5">
        {picture}
        <div className="text-center">
          <p className="v2-display text-[22px] leading-tight text-indigo-950">{name}</p>
          {price && <div className="mt-0.5 flex justify-center">{price}</div>}
          {promise && (
            <p className="mt-0.5 flex items-center justify-center gap-1 text-[12px] font-bold text-indigo-900/70">
              <UiIcon name={promise.icon} className="w-[18px] h-[18px]" />
              {promise.text}
            </p>
          )}
        </div>
        {opens}
        {children}
      </div>
    </div>
  );
}

/**
 * The picture on its stage. Homes are photos and fill it; vehicles, toys and gear are cut-outs on a
 * light with turning rays when they can be bought; outfits stand tall.
 */
export function ShowcasePicture({ image, cover, tall, rays }: { image: string; cover?: boolean; tall?: boolean; rays?: boolean }) {
  return (
    <div className={`v2-shop-stage ${cover ? 'h-[170px]' : tall ? 'h-[210px]' : 'h-[160px]'} flex items-center justify-center`}>
      {rays && !cover && <span className="v2-job-rays" />}
      <img
        src={image}
        alt=""
        draggable={false}
        className={
          cover
            ? 'absolute inset-0 w-full h-full object-cover object-[center_30%]'
            : `relative object-contain drop-shadow-[0_8px_8px_rgba(30,27,75,0.25)] ${tall ? 'h-[196px] w-auto' : 'w-[78%] h-[86%]'}`
        }
      />
    </div>
  );
}

/** What is missing before a locked dream can be bought: one row, in place of the buy button. */
export function MissingRow({ children }: { children: ReactNode }) {
  return (
    <p className="min-h-12 py-2 px-4 rounded-2xl bg-indigo-900/10 border-2 border-dashed border-indigo-300 flex items-center justify-center gap-1.5 text-indigo-900">
      <UiIcon name="lock" />
      <span className="v2-display text-[14px]">{children}</span>
    </p>
  );
}

/** The ribbon across the top-left corner, like the job tree's "NOW". */
export function Ribbon({ children }: { children: ReactNode }) {
  return (
    <span className="absolute z-[2] top-2 -left-7 w-[92px] -rotate-[35deg] bg-gradient-to-b from-orange-500 to-orange-600 py-0.5 text-center v2-display text-[9px] uppercase tracking-wider text-white shadow-[0_2px_0_#9a3412]">
      {children}
    </span>
  );
}

export interface StripItem {
  id: string;
  image: string;
  name: string;
  price: number;
  cover?: boolean;
}

/** The dreams after the next one: small locked tiles in a row that scrolls sideways. */
export function UpcomingStrip({ items, more }: { items: StripItem[]; more: number }) {
  const { money } = useT();
  if (items.length === 0) return null;
  return (
    <ul className="v2-shop-strip -mx-1 px-1 pb-1.5 flex gap-2 overflow-x-auto snap-x">
      {items.map((item) => (
        <li key={item.id} className={`relative snap-start shrink-0 w-[112px] ${TILE_FACE} p-1.5 flex flex-col items-center gap-1`}>
          <div className="relative w-full h-[70px] rounded-[12px] overflow-hidden bg-gradient-to-b from-sky-100 to-indigo-100 flex items-center justify-center">
            <img
              src={item.image}
              alt=""
              draggable={false}
              className={`${item.cover ? 'absolute inset-0 w-full h-full object-cover object-[center_30%]' : 'w-[88%] h-[88%] object-contain'} grayscale-[60%] opacity-75`}
            />
            <UiIcon name="lock" className="absolute top-1 right-1 w-5 h-5 drop-shadow" />
          </div>
          <span className="w-full min-h-[26px] text-center v2-display text-[12px] leading-[1.1] text-indigo-900/80 line-clamp-2">{item.name}</span>
          <Cash size={14} className="v2-display text-[12px] text-indigo-900/60 tabular-nums">{money(item.price)}</Cash>
        </li>
      ))}
      {more > 0 && (
        <li className="snap-start shrink-0 w-[72px] rounded-[18px] border-2 border-dashed border-indigo-200 bg-white/40 flex items-center justify-center v2-display text-[15px] text-indigo-900/50">
          +{more}
        </li>
      )}
    </ul>
  );
}

export interface CollectionItem {
  id: string;
  image: string;
  name: string;
  cover?: boolean;
  /** A short green line under the name (a house's rent). */
  note?: ReactNode;
}

/** What you own, three to a row; the one in use carries a ribbon, the one just bought pops in. */
export function CollectionGrid({
  items,
  ribbon,
  justBought,
}: {
  items: CollectionItem[];
  ribbon?: (id: string) => ReactNode;
  justBought?: string | null;
}) {
  return (
    <ul className="grid grid-cols-3 gap-2">
      {items.map((item) => {
        const label = ribbon?.(item.id);
        return (
          <li
            key={item.id}
            className={`relative overflow-hidden ${TILE_FACE} p-1.5 flex flex-col items-center gap-1 ${item.id === justBought ? 'v2-pop-in' : ''}`}
          >
            <div className="relative w-full h-[72px] rounded-[12px] overflow-hidden bg-gradient-to-b from-sky-100 to-indigo-100 flex items-center justify-center">
              <img
                src={item.image}
                alt=""
                draggable={false}
                className={item.cover ? 'absolute inset-0 w-full h-full object-cover object-[center_30%]' : 'w-[90%] h-[90%] object-contain'}
              />
            </div>
            {item.id === justBought && (
              <span
                className="v2-tile-shine pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/80 to-transparent"
                aria-hidden
              />
            )}
            <span className="w-full text-center text-[11px] font-bold text-slate-600 leading-tight line-clamp-2">{item.name}</span>
            {item.note && <span className="w-full text-center text-[10px] font-black text-emerald-600 leading-tight">{item.note}</span>}
            {label ? <Ribbon>{label}</Ribbon> : <UiIcon name="check" className="absolute top-1 right-1 w-5 h-5 drop-shadow" />}
          </li>
        );
      })}
    </ul>
  );
}
