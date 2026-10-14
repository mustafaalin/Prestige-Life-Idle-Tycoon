import { Check, Store, X } from 'lucide-react';
import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { STORE_SECTIONS, type ProductDef } from '../../core/config/iap';
import type { MessageKey } from '../../i18n/translate';
import { useT } from '../../i18n/useT';
import { track } from '../../runtime/analytics';
import { useBackButton } from '../../runtime/backButton';
import { haptic, playSfx } from '../../runtime/feedback';
import { buyProduct, loadPrices, storeAvailable } from '../../runtime/iap';
import { limitedOfferOn, offerSecondsLeft, owns, storeProducts } from '../../runtime/purchases';
import { useGameV2 } from '../../runtime/useGameV2';
import { burstCoins } from '../home/coins';
import { GameButton, Panel, SectionLabel } from '../kit';
import { useRestore } from './useRestore';

// The Store (docs/monetization-v2.md §6, decided 2026-10-14): a sheet opened from the round button on
// the scene, from the first class-up. Products come from config/iap.ts, laid out by section: the
// limited offer on top (one big card with its countdown), then what stays yours, then cash bags.
// Bought permanent products stay with an "Owned" badge; one-time ones leave. Prices are the store's
// local ones. Restore purchases at the bottom, as in Settings.

/** Re-renders every half minute so countdowns move. */
function useNow() {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(timer);
  }, []);
  return now;
}

/** Buying through the store: local prices, one purchase at a time, the reward on screen when paid. */
function useProductPurchase() {
  const { actions } = useGameV2();
  const [prices, setPrices] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [note, setNote] = useState<'thanks' | 'failed' | null>(null);

  useEffect(() => {
    void loadPrices().then(setPrices);
  }, []);

  const buy = async (product: ProductDef, event: MouseEvent<HTMLElement>) => {
    if (busy) return;
    const rect = event.currentTarget.getBoundingClientRect();
    playSfx('click');
    setBusy(product.id);
    setNote(null);
    const outcome = await buyProduct(product.id);
    setBusy(null);
    if (outcome === 'purchased') {
      actions.purchases.apply(product.id);
      playSfx('purchase');
      haptic('medium');
      burstCoins({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, count: 14 });
      setNote('thanks');
    } else if (outcome === 'unavailable') {
      setNote('failed');
    }
  };

  const price = (product: ProductDef) => prices[product.id] ?? product.fallbackPrice;
  return { buy, busy, note, price };
}

export function StoreButton({ onOpen }: { onOpen: () => void }) {
  const { state } = useGameV2();
  const { t } = useT();
  const dot = limitedOfferOn(state, useNow());

  return (
    <button
      type="button"
      onClick={() => {
        playSfx('click');
        haptic('light');
        onOpen();
      }}
      aria-label={t('iap.store')}
      className="pointer-events-auto relative w-14 h-14 rounded-full border-2 border-white bg-gradient-to-b from-violet-400 to-violet-600 shadow-xl v2-glossy flex items-center justify-center transition-all active:scale-90"
    >
      <Store className="w-7 h-7 text-white drop-shadow" />
      {dot && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white bg-rose-500 shadow" />}
    </button>
  );
}

/** What a card says about how long the product lasts. */
function useKindText() {
  const { t, duration } = useT();
  return (product: ProductDef, secondsLeft: number) => {
    if (product.kind === 'permanent') return t('iap.forever');
    if (product.kind === 'consumable') return t('iap.consumable');
    return Number.isFinite(secondsLeft)
      ? `${t('iap.once')} · ${t('iap.ends', { duration: duration(secondsLeft) })}`
      : t('iap.once');
  };
}

function Lines({ product }: { product: ProductDef }) {
  const { t } = useT();
  return (
    <ul className="flex flex-col gap-0.5">
      {Array.from({ length: product.lines }, (_, index) => (
        <li key={index} className="flex items-start gap-1.5 text-[12px] font-bold leading-snug text-slate-600">
          <Check className="w-3.5 h-3.5 mt-0.5 shrink-0 text-emerald-500" />
          {t(`iap.${product.key}.line${index + 1}` as MessageKey)}
        </li>
      ))}
    </ul>
  );
}

export function StoreSheet({ onClose }: { onClose: () => void }) {
  const { state } = useGameV2();
  const { t } = useT();
  const now = useNow();
  const kindText = useKindText();
  const { buy, busy, note, price } = useProductPurchase();
  const { status: restore, restore: restorePurchases } = useRestore();
  const body = useRef<HTMLDivElement>(null);
  useBackButton(true, 50, onClose);

  // The thanks note sits on top: bring it into view (a one-time product's card is gone by then).
  useEffect(() => {
    if (note) body.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [note]);

  const products = storeProducts(state, now);
  const onSale = products.filter((product) => !owns(state.purchases, product));
  const shown = onSale.map((product) => product.id).join(',');
  useEffect(() => {
    if (shown) track('offer_view', { products: shown });
  }, [shown]);

  const buyButton = (product: ProductDef, big: boolean) =>
    owns(state.purchases, product) ? (
      <span className="w-full min-h-11 rounded-2xl bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center gap-1.5 v2-display text-[15px] text-emerald-600">
        <Check className="w-4 h-4" />
        {t('iap.owned')}
      </span>
    ) : (
      <GameButton
        tone="gold"
        onClick={(event) => void buy(product, event)}
        disabled={busy !== null}
        className={`w-full min-h-11 py-2 px-4 v2-display v2-shadow tabular-nums ${big ? 'text-[18px]' : 'text-[16px]'}`}
      >
        {price(product)}
      </GameButton>
    );

  return (
    <div className="v2-sheet-in absolute inset-x-2 top-2 bottom-1 flex flex-col rounded-[28px] bg-indigo-100 shadow-2xl overflow-hidden pointer-events-auto">
      <div className="shrink-0 flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-violet-500 to-indigo-500">
        <Store className="w-8 h-8 text-white drop-shadow" />
        <h2 className="flex-1 min-w-0 v2-display v2-outline-thin text-xl text-white truncate">{t('iap.store')}</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label={t('common.close')}
          className="relative v2-hit p-1.5 rounded-full bg-white/20 transition-all active:scale-90"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      </div>

      <div ref={body} className="flex-1 overflow-y-auto px-3 py-3 bg-gradient-to-b from-sky-100 to-indigo-100 flex flex-col gap-3">
        {note && (
          <p
            className={`rounded-2xl px-3 py-2 text-[13px] font-black text-center ${
              note === 'thanks' ? 'bg-emerald-100 text-emerald-700' : 'bg-white text-slate-500'
            }`}
          >
            {t(note === 'thanks' ? 'iap.thanks' : 'iap.failed')}
          </p>
        )}

        {STORE_SECTIONS.map((section) => {
          const items = products.filter((product) => product.section === section);
          if (items.length === 0) return null;
          return (
            <div key={section} className="flex flex-col gap-2">
              <SectionLabel>{t(`iap.sections.${section}`)}</SectionLabel>
              {section === 'bundles' ? (
                <div className="grid grid-cols-3 gap-2">
                  {items.map((product) => (
                    <Panel key={product.id} className="p-2 flex flex-col items-center gap-1.5 text-center">
                      <img src={product.art} alt="" draggable={false} className="w-16 h-16 object-contain" />
                      <p className="v2-display text-[13px] leading-tight text-indigo-950">{t(`iap.${product.key}.name` as MessageKey)}</p>
                      {buyButton(product, false)}
                    </Panel>
                  ))}
                </div>
              ) : (
                items.map((product) => {
                  const big = section === 'limited';
                  const left = offerSecondsLeft(state.purchases, product, now);
                  const owned = owns(state.purchases, product);
                  return (
                    <Panel key={product.id} accent={big && !owned} className={`p-3 flex flex-col gap-2.5 ${owned ? 'opacity-80' : ''}`}>
                      <div className="flex items-start gap-3">
                        <img
                          src={product.art}
                          alt=""
                          draggable={false}
                          className={`shrink-0 object-contain drop-shadow ${big ? 'w-28 h-28' : 'w-20 h-20'}`}
                        />
                        <div className="flex-1 min-w-0 flex flex-col gap-1">
                          <p className={`v2-display leading-tight text-indigo-950 ${big ? 'text-[19px]' : 'text-[17px]'}`}>
                            {t(`iap.${product.key}.name` as MessageKey)}
                          </p>
                          <p className="text-[10px] font-black uppercase tracking-widest text-amber-600">{kindText(product, left)}</p>
                          <Lines product={product} />
                        </div>
                      </div>
                      {buyButton(product, big)}
                    </Panel>
                  );
                })
              )}
            </div>
          );
        })}

        {storeAvailable && (
          <button
            type="button"
            onClick={() => void restorePurchases()}
            disabled={restore === 'busy'}
            className="mt-1 self-center px-3 py-2 text-[12px] font-black text-indigo-700/70 underline underline-offset-2 transition-all active:scale-95 disabled:opacity-50"
          >
            {restore === 'done'
              ? t('iap.restored')
              : restore === 'none'
                ? t('iap.restoreNone')
                : restore === 'failed'
                  ? t('iap.failed')
                  : t('iap.restore')}
          </button>
        )}
      </div>
    </div>
  );
}

/** In the shop tab: the special offers live in the Store now; a strip points there. */
export function StoreStrip({ onOpen }: { onOpen: () => void }) {
  const { state } = useGameV2();
  const { t } = useT();
  const now = useNow();
  if (storeProducts(state, now).length === 0) return null;
  return (
    <button
      type="button"
      onClick={() => {
        playSfx('click');
        onOpen();
      }}
      className="w-full flex items-center gap-3 rounded-[22px] border-2 border-white bg-gradient-to-r from-violet-500 to-indigo-500 px-3 py-2.5 shadow-[0_4px_14px_rgba(30,41,99,0.18)] transition-all active:scale-[0.98]"
    >
      <Store className="w-7 h-7 shrink-0 text-white drop-shadow" />
      <span className="flex-1 min-w-0 text-left v2-display text-[15px] leading-tight text-white">{t('iap.strip')}</span>
      {limitedOfferOn(state, now) && <span className="w-3 h-3 shrink-0 rounded-full border-2 border-white bg-rose-500" />}
      <span className="shrink-0 rounded-full bg-white/25 px-3 py-1 v2-display text-[13px] text-white">{t('iap.open')}</span>
    </button>
  );
}
