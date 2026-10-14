import { Check, Clock, Store, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { PRODUCTS, STORE_SECTIONS, type ProductDef } from '../../core/config/iap';
import type { MessageKey } from '../../i18n/translate';
import { useT } from '../../i18n/useT';
import { track } from '../../runtime/analytics';
import { useBackButton } from '../../runtime/backButton';
import { haptic, playSfx } from '../../runtime/feedback';
import { buyProduct, storeAvailable } from '../../runtime/iap';
import { limitedOfferOn, offerSecondsLeft, owns, saleId, storeProducts, welcomeSecondsLeft } from '../../runtime/purchases';
import { useGameV2 } from '../../runtime/useGameV2';
import { burstCoins } from '../home/coins';
import { SectionLabel } from '../kit';
import { STORE_ART } from './storeArt';
import { BuyButton, ComfortArt, StarterArt, StarterRewards } from './StoreParts';
import { usePrices } from './usePrices';
import { useRestore } from './useRestore';

// The Store (docs/monetization-v2.md §6, decided 2026-10-14; look: docs/iap-store-design-handoff.md):
// a sheet opened from the round button on the scene, from the first class-up. Products come from
// config/iap.ts in section order. The Starter Pack and the Comfort Pack have their own cards (layered
// art, the rewards as objects); a later product gets a plain card until it has its own.
// A bought permanent product stays as an "active" card; a one-time one leaves, with a short summary
// of what it gave. Prices are the store's local ones. Restore purchases at the bottom, as in Settings.

/** Re-renders every half minute so countdowns move. */
function useNow() {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(timer);
  }, []);
  return now;
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
      className="pointer-events-auto relative w-14 h-14 rounded-full border-2 border-white bg-gradient-to-b from-[#9173db] to-[#6244b3] shadow-xl v2-glossy flex items-center justify-center transition-all active:scale-90"
    >
      <img src={STORE_ART.button} alt="" draggable={false} className="w-11 h-11 object-contain drop-shadow" />
      {dot && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white bg-rose-500 shadow" />}
    </button>
  );
}

interface CardProps {
  product: ProductDef;
  owned: boolean;
  price: string;
  /** While a welcome price lasts: the regular price it goes up to, and how long it has left. */
  welcome: { later: string; secondsLeft: number } | null;
  /** The store id being sold now (the welcome price's while it lasts). */
  saleId: string;
  /** The product being bought now, if any (one purchase at a time). */
  busy: string | null;
  failed: boolean;
  secondsLeft: number;
  onBuy: () => void;
}

function BuyRow({ price, welcome, saleId: id, busy, failed, onBuy }: CardProps) {
  const { t } = useT();
  return (
    <>
      <BuyButton disabled={busy !== null} onClick={onBuy}>
        {busy === id ? t('iap.busy') : t('iap.buy', { price })}
      </BuyButton>
      {welcome && (
        <p className="mt-1.5 text-[11px] font-bold text-center v2-iap-muted">{t('iap.welcome.later', { price: welcome.later })}</p>
      )}
      {failed && (
        <p role="status" className="mt-2 text-[12px] font-bold text-center v2-iap-muted">
          {t('iap.failed')}
        </p>
      )}
    </>
  );
}

const TITLE = 'v2-display text-[23px] max-[359px]:text-[21px] leading-[1.1] break-words';
const HEADLINE = 'v2-display text-[21px] max-[359px]:text-[19px] leading-[1.13] mb-2 break-words';

/** The Starter Pack: a welcome price with its countdown in the first days, then the regular price. */
function StarterCard(props: CardProps) {
  const { t, duration } = useT();
  const left = props.welcome?.secondsLeft ?? props.secondsLeft;
  return (
    <article className="v2-iap-card v2-iap-starter">
      <div className="flex items-center justify-between gap-2">
        <span className="v2-iap-badge">{props.welcome ? t('iap.welcome.tag') : t('iap.once')}</span>
        {Number.isFinite(left) && (
          <span className="flex items-center gap-1 text-[11px] max-[359px]:text-[10px] font-bold text-[#814307] whitespace-nowrap">
            <Clock className="w-3.5 h-3.5" />
            {duration(left)}
          </span>
        )}
      </div>
      <h3 className={`${TITLE} mt-[11px]`}>{t('iap.starter.name')}</h3>
      <div className="flex items-center min-h-[148px]">
        <div className="flex-1 min-w-0 z-[1]">
          <h4 className={HEADLINE}>{t('iap.starter.headline')}</h4>
          <p className="text-[11px] leading-[1.4] v2-iap-muted">{t('iap.starter.kind')}</p>
        </div>
        <StarterArt />
      </div>
      <StarterRewards product={props.product} />
      <BuyRow {...props} />
    </article>
  );
}

function ComfortCard(props: CardProps) {
  const { t } = useT();
  if (props.owned) return <ComfortActive />;
  return (
    <article className="v2-iap-card v2-iap-comfort">
      <span className="v2-iap-badge">{t('iap.forever')}</span>
      <h3 className={`${TITLE} mt-[11px]`}>{t('iap.comfort.name')}</h3>
      <div className="flex items-center min-h-[146px]">
        <div className="flex-1 min-w-0 z-[1]">
          <h4 className={HEADLINE}>{t('iap.comfort.headline')}</h4>
          <p className="text-[11px] leading-[1.4] v2-iap-muted">{t('iap.comfort.limits')}</p>
        </div>
        <ComfortArt />
      </div>
      <div className="flex items-center gap-[7px] rounded-xl bg-[#fffaf2]/80 px-[9px] py-[7px] mb-3 text-[11px] font-bold">
        <img src={STORE_ART.hourglass} alt="" draggable={false} className="w-[26px] h-[30px] object-contain shrink-0" />
        {t('iap.comfort.bonus', { count: props.product.boostSeconds / 3600 })}
      </div>
      <BuyRow {...props} />
    </article>
  );
}

/** The Comfort Pack once bought: still readable, no price, what it keeps doing. */
function ComfortActive() {
  const { t } = useT();
  return (
    <article className="v2-iap-card v2-iap-owned">
      <span className="v2-iap-badge inline-flex items-center gap-1">
        <Check className="w-3 h-3" />
        {t('iap.comfort.active')}
      </span>
      <div className="flex items-center gap-2 min-h-[104px]">
        <div className="flex-1 min-w-0">
          <h3 className={`${TITLE} mt-2`}>{t('iap.comfort.name')}</h3>
          <p className="mt-2 text-[12px] font-bold">{t('iap.comfort.enabled')}</p>
          <p className="mt-1 text-[11px] leading-[1.4] v2-iap-muted">{t('iap.comfort.limits')}</p>
        </div>
        <img src="/assets/iap/comfort.webp" alt="" draggable={false} className="w-[93px] h-[93px] object-contain shrink-0" />
      </div>
      <p className="mt-1 flex items-center gap-2 rounded-xl bg-[#e4f6e7] p-[11px] text-[12px] font-extrabold text-[#28623c]">
        <Check className="w-4 h-4 shrink-0" />
        {t('iap.comfort.access')}
      </p>
    </article>
  );
}

/** A product without its own card yet (config/iap.ts): picture, kind, lines, price or "Owned". */
function PlainCard(props: CardProps) {
  const { t, duration } = useT();
  const { product, owned, secondsLeft } = props;
  const kind =
    product.kind === 'permanent'
      ? t('iap.forever')
      : product.kind === 'consumable'
        ? t('iap.consumable')
        : Number.isFinite(secondsLeft)
          ? `${t('iap.once')} · ${t('iap.ends', { duration: duration(secondsLeft) })}`
          : t('iap.once');
  return (
    <article className={`v2-iap-card ${owned ? 'v2-iap-owned' : 'v2-iap-comfort'}`}>
      <div className="flex items-start gap-3">
        <img src={product.art} alt="" draggable={false} className="w-20 h-20 shrink-0 object-contain" />
        <div className="flex-1 min-w-0 flex flex-col gap-1">
          <h3 className="v2-display text-[19px] leading-tight break-words">{t(`iap.${product.key}.name` as MessageKey)}</h3>
          <span className="v2-iap-badge self-start">{owned ? t('iap.owned') : kind}</span>
          <ul className="flex flex-col gap-0.5">
            {Array.from({ length: product.lines }, (_, index) => (
              <li key={index} className="flex items-start gap-1.5 text-[12px] font-bold leading-snug v2-iap-muted">
                <Check className="w-3.5 h-3.5 mt-0.5 shrink-0 text-emerald-500" />
                {t(`iap.${product.key}.line${index + 1}` as MessageKey, { percent: Math.round(product.incomeBonus * 100) })}
              </li>
            ))}
          </ul>
        </div>
      </div>
      {!owned && (
        <div className="mt-3">
          <BuyRow {...props} />
        </div>
      )}
    </article>
  );
}

/** What the Starter Pack just gave, once, right after the purchase (not on every opening). */
function StarterReceipt({ onDismiss }: { onDismiss: () => void }) {
  const { t } = useT();
  const product = PRODUCTS.starter;
  const lines = [
    t('iap.starter.gotBoost', { count: product.boostSeconds / 3600 }),
    t('iap.starter.gotIncome', { count: product.incomeSeconds / 3600 }),
    t('iap.starter.gotScarf', { percent: Math.round(product.incomeBonus * 100) }),
  ];
  return (
    <section role="status" aria-live="polite" className="v2-iap-card bg-[#fff7e1] border-[#edcf93]">
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="v2-display text-[20px] leading-tight break-words">{t('iap.starter.ready')}</h3>
          <p className="mt-1 text-[12px] v2-iap-muted">{t('iap.starter.readyBody')}</p>
        </div>
        <img src={STORE_ART.dog} alt="" draggable={false} className="w-20 h-20 shrink-0 object-contain -mt-1" />
      </div>
      <ul className="mt-2 flex flex-col gap-2 text-[12px] font-bold">
        {lines.map((line) => (
          <li key={line} className="flex items-start gap-2">
            <Check className="w-4 h-4 shrink-0 text-[#287340]" />
            {line}
          </li>
        ))}
      </ul>
      <button type="button" onClick={onDismiss} className="mt-1 min-h-11 px-2 text-[12px] font-bold underline underline-offset-2 v2-iap-muted">
        {t('iap.starter.dismiss')}
      </button>
    </section>
  );
}

export function StoreSheet({ onClose }: { onClose: () => void }) {
  const { state, actions } = useGameV2();
  const { t } = useT();
  const now = useNow();
  const price = usePrices();
  const { status: restore, restore: restorePurchases } = useRestore();
  const [busy, setBusy] = useState<string | null>(null);
  const [failed, setFailed] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<'starter' | 'comfort' | null>(null);
  const body = useRef<HTMLDivElement>(null);
  useBackButton(true, 50, onClose);

  const products = storeProducts(state, now);
  const onSale = products.filter((product) => !owns(state.purchases, product));
  const shown = onSale.map((product) => product.id).join(',');
  useEffect(() => {
    if (shown) track('offer_view', { products: shown });
  }, [shown]);
  // The summary sits on top: bring it into view (the Starter Pack's card is gone by then).
  useEffect(() => {
    if (receipt) body.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [receipt]);

  const buy = async (product: ProductDef) => {
    if (busy) return;
    playSfx('click');
    const id = saleId(state.purchases, product, Date.now());
    setBusy(id);
    setFailed(null);
    const outcome = await buyProduct(id);
    setBusy(null);
    if (outcome === 'purchased') {
      actions.purchases.apply(id);
      playSfx('purchase');
      haptic('medium');
      const rect = body.current?.getBoundingClientRect();
      if (rect) burstCoins({ x: rect.left + rect.width / 2, y: rect.top + 80, count: 14 });
      setReceipt(product === PRODUCTS.starter ? 'starter' : 'comfort');
    } else if (outcome === 'unavailable') {
      setFailed(product.id);
    }
  };

  const card = (product: ProductDef) => {
    const id = saleId(state.purchases, product, now);
    const welcomeLeft = welcomeSecondsLeft(state.purchases, product, now);
    const props: CardProps = {
      product,
      owned: owns(state.purchases, product),
      price: price(product, id),
      welcome: welcomeLeft > 0 ? { later: price(product), secondsLeft: welcomeLeft } : null,
      saleId: id,
      busy,
      failed: failed === product.id,
      secondsLeft: offerSecondsLeft(state.purchases, product, now),
      onBuy: () => void buy(product),
    };
    if (product === PRODUCTS.starter) return <StarterCard key={product.id} {...props} />;
    if (product === PRODUCTS.comfort) return <ComfortCard key={product.id} {...props} />;
    return <PlainCard key={product.id} {...props} />;
  };

  return (
    <div className="v2-iap v2-sheet-in absolute inset-x-2 top-2 bottom-1 flex flex-col rounded-[28px] bg-[#efeafb] shadow-2xl overflow-hidden pointer-events-auto">
      <div className="shrink-0 flex items-center gap-2 pl-3.5 pr-1.5 py-1 bg-gradient-to-r from-[#7965cd] to-[#584aaf]">
        <Store className="w-7 h-7 text-white drop-shadow" />
        <h2 className="flex-1 min-w-0 v2-display v2-outline-thin text-[23px] text-white truncate">{t('iap.store')}</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label={t('common.close')}
          className="w-11 h-11 rounded-full bg-white/15 flex items-center justify-center transition-all active:scale-90"
        >
          <X className="w-6 h-6 text-white" />
        </button>
      </div>

      <div ref={body} className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
        {receipt === 'starter' && <StarterReceipt onDismiss={() => setReceipt(null)} />}
        {receipt === 'comfort' && (
          <p role="status" aria-live="polite" className="rounded-2xl bg-[#e4f6e7] px-3 py-2 text-[13px] font-black text-center text-[#28623c]">
            {t('iap.comfort.thanks')}
          </p>
        )}

        {STORE_SECTIONS.map((section) => {
          const items = products.filter((product) => product.section === section);
          if (items.length === 0) return null;
          // Starter and Comfort carry their kind on a badge; a later section (cash bags) gets its label.
          return section === 'bundles' ? (
            <div key={section} className="flex flex-col gap-2">
              <SectionLabel>{t(`iap.sections.${section}`)}</SectionLabel>
              {items.map(card)}
            </div>
          ) : (
            items.map(card)
          );
        })}

        {onSale.length === 0 && <p className="px-3 py-2 text-[12px] leading-relaxed text-center v2-iap-muted">{t('iap.empty')}</p>}

        {storeAvailable && (
          <button
            type="button"
            onClick={() => void restorePurchases()}
            disabled={restore === 'busy'}
            className="self-center min-h-11 px-3 text-[12px] font-bold text-[#5b4b8b] underline underline-offset-[3px] disabled:opacity-50"
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

/** In the shop tab: the special offers live in the Store; a strip points there. */
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
      className="w-full flex items-center gap-3 rounded-[22px] border-2 border-white bg-gradient-to-r from-[#7965cd] to-[#584aaf] px-3 py-2.5 shadow-[0_4px_14px_rgba(30,41,99,0.18)] transition-all active:scale-[0.98]"
    >
      <img src={STORE_ART.button} alt="" draggable={false} className="w-9 h-9 shrink-0 object-contain drop-shadow" />
      <span className="flex-1 min-w-0 text-left v2-display text-[15px] leading-tight text-white">{t('iap.strip')}</span>
      {limitedOfferOn(state, now) && <span className="w-3 h-3 shrink-0 rounded-full border-2 border-white bg-rose-500" />}
      <span className="shrink-0 rounded-full bg-white/25 px-3 py-1 v2-display text-[13px] text-white">{t('iap.open')}</span>
    </button>
  );
}
