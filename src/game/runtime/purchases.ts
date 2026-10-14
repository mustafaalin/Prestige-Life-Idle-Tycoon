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
import type { AdProgress } from './adRewards';
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
}

export function createPurchaseProgress(): PurchaseProgress {
  return { owned: [], offersFrom: 0, offerCardShown: false };
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

/** The welcome card pointing at the limited offer is due: once, while the offer is on. */
export function offerCardDue(context: Pick<PurchaseContext, 'story' | 'purchases'>, now: number) {
  return !context.purchases.offerCardShown && limitedOfferOn(context, now);
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
export function applyPurchase<T extends PurchaseContext>(state: T, productId: string, now: number): T {
  const product = productById(productId);
  // Either price of a product gives it once: the other id later (a restore) gives nothing again.
  if (!product || owns(state.purchases, product)) return state;
  const owned = product.kind === 'consumable' ? state.purchases.owned : [...state.purchases.owned, productId];
  const purchases = { ...state.purchases, owned };
  const boostFrom = Math.max(state.ads.boostUntil, now);
  // The accessory's bonus first, so the hour of income below already counts it.
  const game = withAccessories(state.game, purchases);
  return {
    ...state,
    // The income while playing, hand-run businesses included: right after the first ceremony most
    // players have no manager yet, and the managed income alone was close to $0 (2026-10-14).
    game: product.incomeSeconds > 0 ? earn(game, incomePerSecond(game, 'active') * product.incomeSeconds) : game,
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
