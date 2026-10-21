import { Check, Store, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { BOOST_FACTOR, BOOST_SECONDS, COIN_RAIN_SECONDS } from '../../core/config/ads';
import { PRODUCTS, STORE_SECTIONS, type ProductDef } from '../../core/config/iap';
import { canCollect } from '../../core/formulas';
import type { MessageKey } from '../../i18n/translate';
import { useT } from '../../i18n/useT';
import { adCooldownLeft, boostSecondsLeft, boostsLeft, canBoost, canWatch } from '../../runtime/adRewards';
import type { AdPlacement } from '../../runtime/ads';
import { track } from '../../runtime/analytics';
import { useBackButton } from '../../runtime/backButton';
import { haptic, playSfx } from '../../runtime/feedback';
import { buyProduct, storeAvailable } from '../../runtime/iap';
import {
  limitedOfferOn,
  offerSecondsLeft,
  owns,
  purchaseCash,
  saleId,
  storeProducts,
  welcomeSecondsLeft,
} from '../../runtime/purchases';
import { useGameV2 } from '../../runtime/useGameV2';
import { AdButton } from '../ads/AdButton';
import { payout } from '../home/coins';
import { requestFind } from '../scene/sceneEvents';
import { STORE_ART } from './storeArt';
import { NoAdsArt, PricePill } from './StoreParts';
import { Checks, ComfortBanner, StarterBanner } from './StoreBanners';
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

/** The price pill on the banner's edge, and under the banner the regular price or a failure. */
function BuyRow({ price, welcome, saleId: id, busy, failed, onBuy }: CardProps) {
  const { t } = useT();
  return (
    <>
      <PricePill disabled={busy !== null} onClick={onBuy}>
        {busy === id ? t('iap.busy') : t('iap.buy', { price })}
      </PricePill>
      {(welcome || failed) && (
        <p role={failed ? 'status' : undefined} className="mt-1.5 text-[11px] font-bold text-center v2-iap-muted">
          {failed ? t('iap.failed') : welcome && t('iap.welcome.later', { price: welcome.later })}
        </p>
      )}
    </>
  );
}

/** The store's section titles, centred like a shop sign. */
function SectionTitle({ children }: { children: string }) {
  return <h3 className="v2-iap-section mt-1">{children}</h3>;
}

/** The Starter Pack: a welcome price with its countdown in the first days, then the regular price. */
function StarterCard(props: CardProps) {
  const welcome = props.welcome !== null;
  return (
    <article className="v2-iap-wrap">
      <StarterBanner product={props.product} welcome={welcome} secondsLeft={props.welcome?.secondsLeft ?? props.secondsLeft} />
      <BuyRow {...props} />
    </article>
  );
}

function ComfortCard(props: CardProps) {
  if (props.owned) return <ComfortActive />;
  return (
    <article className="v2-iap-wrap">
      <ComfortBanner product={props.product} />
      <BuyRow {...props} />
    </article>
  );
}

/** The Comfort Pack once bought: still readable, no price, what it keeps doing. */
function ComfortActive() {
  const { t } = useT();
  return (
    <article className="v2-iap-wrap pb-0">
      <div className="v2-iap-banner v2-iap-banner-owned">
        <span className="v2-iap-ribbon inline-flex items-center gap-1">
          <Check className="w-3 h-3" />
          {t('iap.comfort.active')}
        </span>
        <div className="flex items-center gap-2 min-h-[96px]">
          <div className="flex-1 min-w-0">
            <h3 className="v2-iap-title text-[22px] leading-none mt-2">{t('iap.comfort.name')}</h3>
            <div className="mt-2">
              <Checks lines={[t('iap.comfort.enabled'), t('iap.comfort.access')]} />
            </div>
          </div>
          <NoAdsArt className="w-[92px]" />
        </div>
      </div>
    </article>
  );
}

/**
 * Free things for an ad (2026-10-21, user: the reference shop shows them next to the paid ones). The
 * same ads as the scene's buttons, with the same daily limits; one that ends on the scene (Şans, the
 * coin shower) closes the store so the player sees it happen.
 */
function FreeOffers({ onClose }: { onClose: () => void }) {
  const { game, state, actions } = useGameV2();
  const { t, duration } = useT();
  const now = useNow();
  const boostLeft = boostSecondsLeft(state.ads, now);
  const sansWait = adCooldownLeft(state.ads, 'call_sans', now);
  const showRain = canCollect(game) && state.ads.coinRainUntil <= now;
  const tiles: { key: string; image: string; title: string; note: string; ready: boolean; reason: string; placement: AdPlacement; run: () => void }[] = [
    {
      key: 'boost',
      image: STORE_ART.hourglass,
      title: t('ads.boostTitle', { factor: BOOST_FACTOR }),
      note: duration(BOOST_SECONDS),
      ready: canBoost(state, Date.now()),
      reason: boostsLeft(state.ads, now) <= 0 ? t('iap.free.later') : boostLeft > 0 ? t('iap.free.running') : t('iap.free.later'),
      placement: 'income_boost',
      run: () => {
        if (actions.ads.boost()) playSfx('reward');
      },
    },
    {
      key: 'sans',
      image: '/assets/scene/sans-wallet.webp',
      title: t('ads.callSans'),
      note: t('iap.free.sansNote'),
      ready: canWatch(state.ads, 'call_sans', now),
      reason: sansWait > 0 ? duration(Math.ceil(sansWait)) : t('iap.free.later'),
      placement: 'call_sans',
      run: () => {
        if (!actions.ads.callSans()) return;
        onClose();
        requestFind();
      },
    },
    ...(showRain
      ? [
          {
            key: 'rain',
            image: '/assets/scene/coin-pile.webp',
            title: t('ads.coinRain'),
            note: duration(COIN_RAIN_SECONDS),
            ready: canWatch(state.ads, 'coin_rain', now),
            reason: t('iap.free.later'),
            placement: 'coin_rain' as AdPlacement,
            run: () => {
              if (!actions.ads.coinRain()) return;
              playSfx('reward');
              onClose();
            },
          },
        ]
      : []),
  ];
  return (
    <div className="flex flex-col gap-2 mb-1">
      <SectionTitle>{t('iap.sections.free')}</SectionTitle>
      <div className={`grid gap-2 ${tiles.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
        {tiles.map((tile) => (
          <div key={tile.key} className="v2-iap-free">
            <b className="v2-display text-[13px] leading-tight text-[#2b1b6b] break-words">{tile.title}</b>
            <img src={tile.image} alt="" draggable={false} className="w-14 h-14 object-contain" />
            <small className="text-[10px] font-bold leading-tight v2-iap-muted">{tile.note}</small>
            {tile.ready ? (
              <AdButton placement={tile.placement} small className="w-full" onReward={() => {
                haptic('medium');
                tile.run();
              }}>
                {t('iap.free.get')}
              </AdButton>
            ) : (
              <span className="w-full rounded-full bg-slate-200 px-2 py-1.5 text-[11px] font-black text-slate-500 tabular-nums">{tile.reason}</span>
            )}
          </div>
        ))}
      </div>
    </div>
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
        <div className="relative mt-3 pb-[50px]">
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
  const { t, money } = useT();
  // The store's purchase dialog takes a while; the paid amount is read from the state after it.
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  });
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
      // Read before the purchase lands: the same amount applyPurchase pays.
      const cash = purchaseCash(stateRef.current.game, stateRef.current.purchases, product);
      actions.purchases.apply(id);
      playSfx('purchase');
      haptic('medium');
      payout({ amount: cash, label: `+${money(cash)}`, count: 14 });
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
          return (
            <div key={section} className="flex flex-col gap-2">
              {items.length > 0 && <SectionTitle>{t(`iap.sections.${section}`)}</SectionTitle>}
              {items.map(card)}
              {/* The free offers sit right after the first offers, before the permanent ones. */}
              {section === 'limited' && <FreeOffers onClose={onClose} />}
            </div>
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

/** In the shop tab: the special offers live in the Store; a strip points there while one is for sale. */
export function StoreStrip({ onOpen }: { onOpen: () => void }) {
  const { state } = useGameV2();
  const { t } = useT();
  const now = useNow();
  if (storeProducts(state, now).every((product) => owns(state.purchases, product))) return null;
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
