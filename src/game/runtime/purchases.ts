import {
  PRODUCT_LIST,
  PRODUCTS,
  REVOKE_REFUNDS,
  SPECIAL_SHOP_CEREMONY,
  productById,
  productIds,
  type ProductDef,
} from '../core/config/iap';
import { incomePerSecond } from '../core/formulas';
import { earn } from '../core/state';
import type { GameStateV2 } from '../core/types';
import { dayKey, type AdProgress } from './adRewards';
import type { StoryProgress } from './story';

// What a purchase gives and when an offer shows (docs/monetization-v2.md §5). Pure rules: the store
// calls them after the store (runtime/iap.ts) confirmed a purchase or a restore. What was bought is
// kept for good, across lives; the store can always restore it.

export interface PurchaseProgress {
  /** Product ids owned (store ids, config/iap.ts): permanent and one-time products, never consumables. */
  owned: string[];
  /** Wall-clock ms when the store opened (0 = not yet): limited offers count their days from here. */
  offersFrom: number;
  /** The welcome card that points at the limited offer was shown (it shows once). */
  offerCardShown: boolean;
  /** The day (local date key) an offer card last showed, and which product it showed (2026-10-21). */
  offerDay: string;
  offerLast: string;
}

export function createPurchaseProgress(): PurchaseProgress {
  return { owned: [], offersFrom: 0, offerCardShown: false, offerDay: '', offerLast: '' };
}

interface PurchaseContext {
  game: GameStateV2;
  ads: AdProgress;
  story: StoryProgress;
  purchases: PurchaseProgress;
}

/** Bought, at either of its prices. */
export function owns(purchases: PurchaseProgress, product: ProductDef) {
  return productIds(product).some((id) => purchases.owned.includes(id));
}

/** The Comfort Pack: every rewarded ad gives its reward without the ad. */
export function adFree(purchases: PurchaseProgress) {
  return owns(purchases, PRODUCTS.comfort);
}

/** Lucky wears the Starter Pack's red scarf. */
export function hasScarf(purchases: PurchaseProgress) {
  return owns(purchases, PRODUCTS.starter);
}

/** What Şans's paid accessories multiply all income by: each owned product's bonus, one after another. */
export function accessoryMultiplier(purchases: PurchaseProgress) {
  return Object.values(PRODUCTS).reduce(
    (multiplier, product) => (product.incomeBonus > 0 && owns(purchases, product) ? multiplier * (1 + product.incomeBonus) : multiplier),
    1,
  );
}

/** The game with the accessories' bonus of these purchases (game.accessoryMultiplier follows the purchases). */
export function withAccessories(game: GameStateV2, purchases: PurchaseProgress): GameStateV2 {
  const multiplier = accessoryMultiplier(purchases);
  return game.accessoryMultiplier === multiplier ? game : { ...game, accessoryMultiplier: multiplier };
}

/** The store opens with the first class-up. */
export function offersOpen(story: StoryProgress) {
  return story.ceremonySeen >= SPECIAL_SHOP_CEREMONY;
}

/** Seconds a limited offer has left (0 when it is over or not started); Infinity for one that is always on. */
export function offerSecondsLeft(purchases: PurchaseProgress, product: ProductDef, now: number) {
  if (product.offerSeconds === 0) return Infinity;
  if (purchases.offersFrom === 0) return 0;
  return Math.max(0, product.offerSeconds - (now - purchases.offersFrom) / 1000);
}

/**
 * The products the store shows now: limited offers only in their days, one-time products only until
 * bought. Permanent products stay once bought, shown as owned.
 */
export function storeProducts({ story, purchases }: Pick<PurchaseContext, 'story' | 'purchases'>, now: number) {
  if (!offersOpen(story)) return [];
  return PRODUCT_LIST.filter((product) => {
    if (product.kind === 'once' && owns(purchases, product)) return false;
    if (product.kind === 'permanent' && owns(purchases, product)) return true;
    return offerSecondsLeft(purchases, product, now) > 0;
  });
}

/** Seconds the welcome price has left (0: none, over, or the store not open yet). */
export function welcomeSecondsLeft(purchases: PurchaseProgress, product: ProductDef, now: number) {
  if (!product.welcome || purchases.offersFrom === 0) return 0;
  return Math.max(0, product.welcome.seconds - (now - purchases.offersFrom) / 1000);
}

/** The store id to sell now: the welcome price while it lasts, else the regular one. */
export function saleId(purchases: PurchaseProgress, product: ProductDef, now: number) {
  return product.welcome && welcomeSecondsLeft(purchases, product, now) > 0 ? product.welcome.id : product.id;
}

/** The limited offer on show and not bought: a limited product in its days, or a welcome price that lasts. */
function limitedNow(purchases: PurchaseProgress, product: ProductDef, now: number) {
  if (owns(purchases, product)) return false;
  return product.welcome ? welcomeSecondsLeft(purchases, product, now) > 0 : product.section === 'limited';
}

/** The product a limited offer is on for now (the welcome card points at it), if any. */
export function limitedOffer(context: Pick<PurchaseContext, 'story' | 'purchases'>, now: number) {
  return storeProducts(context, now).find((product) => limitedNow(context.purchases, product, now));
}

/** A limited offer on show and not bought: it puts a dot on the store button. */
export function limitedOfferOn(context: Pick<PurchaseContext, 'story' | 'purchases'>, now: number) {
  return limitedOffer(context, now) !== undefined;
}

/**
 * The product the day's offer card shows, or null (2026-10-21, user: show the packs as a special card
 * once a day). The first card is the welcome one for the limited offer; after that one card a day, at a
 * quiet moment, for a pack not bought yet, taking turns when there are two.
 */
export function offerCardProduct(context: Pick<PurchaseContext, 'story' | 'purchases'>, now: number): ProductDef | null {
  const { purchases } = context;
  if (!purchases.offerCardShown) return limitedOffer(context, now) ?? null;
  if (purchases.offerDay === dayKey(now)) return null;
  // Packs only: cash bags stay in the Store.
  const forSale = storeProducts(context, now).filter((product) => product.kind !== 'consumable' && !owns(purchases, product));
  return forSale.find((product) => product.key !== purchases.offerLast) ?? forSale[0] ?? null;
}

/** The offer card was shown: once today, and this product goes to the back of the turn. */
export function offerCardSeen(purchases: PurchaseProgress, product: ProductDef, now: number): PurchaseProgress {
  return { ...purchases, offerCardShown: true, offerDay: dayKey(now), offerLast: product.key };
}

/** Starts the limited offers' clock the first time the store is open. */
export function openOffers<T extends PurchaseContext>(state: T, now: number): T {
  if (state.purchases.offersFrom > 0 || !offersOpen(state.story)) return state;
  return { ...state, purchases: { ...state.purchases, offersFrom: now } };
}

/**
 * A purchase the store confirmed: its rewards (boost, income), and owned for good unless it is a
 * consumable. A product already owned gives nothing again.
 */
function ownedWith(purchases: PurchaseProgress, product: ProductDef, productId: string): PurchaseProgress {
  const owned = product.kind === 'consumable' ? purchases.owned : [...purchases.owned, productId];
  return { ...purchases, owned };
}

/**
 * The cash a product pays (its hours of income): the income while playing, hand-run businesses
 * included (right after the first ceremony most players have no manager yet, and the managed income
 * alone was close to $0, 2026-10-14), with the product's own accessory bonus already counted.
 */
export function purchaseCash(game: GameStateV2, purchases: PurchaseProgress, product: ProductDef) {
  if (product.incomeSeconds <= 0) return 0;
  const withBonus = withAccessories(game, ownedWith(purchases, product, product.id));
  return incomePerSecond(withBonus, 'active') * product.incomeSeconds;
}

export function applyPurchase<T extends PurchaseContext>(state: T, productId: string, now: number): T {
  const product = productById(productId);
  // Either price of a product gives it once: the other id later (a restore) gives nothing again.
  if (!product || owns(state.purchases, product)) return state;
  const purchases = ownedWith(state.purchases, product, productId);
  const boostFrom = Math.max(state.ads.boostUntil, now);
  const game = withAccessories(state.game, purchases);
  const cash = purchaseCash(state.game, state.purchases, product);
  return {
    ...state,
    game: cash > 0 ? earn(game, cash) : game,
    ads: product.boostSeconds > 0 ? { ...state.ads, boostUntil: boostFrom + product.boostSeconds * 1000 } : state.ads,
    purchases,
  };
}

/** Products that are owned for good (not consumables), by store id. */
const KEPT = new Set(Object.values(PRODUCTS).filter((product) => product.kind !== 'consumable').flatMap(productIds));

/**
 * The store's list of what the player owns (each opening, or "Restore purchases"): products this
 * save has not got yet, with their rewards (2026-10-14). That covers a purchase paid but not written
 * (the app closed in between): the player gets what was paid for. On a new phone or a fresh save the
 * one-time rewards come once more; small, and it beats losing them. Consumables are left out: the
 * store lists them among past purchases, but they were used up when bought.
 */
export function storeOwnedToGrant(purchases: PurchaseProgress, storeIds: string[]) {
  return [...new Set(storeIds)].filter((id) => {
    const product = productById(id);
    // Either price of a pack owned here is the pack owned: the other id gives nothing.
    return KEPT.has(id) && product !== undefined && !owns(purchases, product);
  });
}

/**
 * Refunded products leave the save (only with REVOKE_REFUNDS on): owned here but not in the store's
 * list. Call only with a list the store really sent, never on an error.
 */
export function refundedToRevoke(purchases: PurchaseProgress, productIds: string[]) {
  if (!REVOKE_REFUNDS) return [];
  return purchases.owned.filter((id) => KEPT.has(id) && !productIds.includes(id));
}

export function applyRevoke<T extends PurchaseContext>(state: T, productIds: string[]): T {
  if (productIds.length === 0) return state;
  const purchases = { ...state.purchases, owned: state.purchases.owned.filter((id) => !productIds.includes(id)) };
  return { ...state, game: withAccessories(state.game, purchases), purchases };
}
