import { PRODUCT_LIST, PRODUCTS, SPECIAL_SHOP_CEREMONY, STARTER_OFFER_SECONDS, type ProductDef } from '../core/config/iap';
import { autoIncomePerSecond } from '../core/formulas';
import { earn } from '../core/state';
import type { GameStateV2 } from '../core/types';
import type { AdProgress } from './adRewards';
import type { StoryProgress } from './story';

// What a purchase gives and when an offer shows (docs/monetization-v2.md §5). Pure rules: the store
// calls them after the store (runtime/iap.ts) confirmed a purchase or a restore. What was bought is
// kept for good, across lives; the store can always restore it.

export interface PurchaseProgress {
  /** Product ids owned (store ids, config/iap.ts). */
  owned: string[];
  /** Wall-clock ms when the special offers opened (0 = not yet): the Starter Pack's 3 days count from here. */
  offersFrom: number;
}

export function createPurchaseProgress(): PurchaseProgress {
  return { owned: [], offersFrom: 0 };
}

interface PurchaseContext {
  game: GameStateV2;
  ads: AdProgress;
  story: StoryProgress;
  purchases: PurchaseProgress;
}

export function owns(purchases: PurchaseProgress, product: ProductDef) {
  return purchases.owned.includes(product.id);
}

/** The Comfort Pack: every rewarded ad gives its reward without the ad. */
export function adFree(purchases: PurchaseProgress) {
  return owns(purchases, PRODUCTS.comfort);
}

/** Lucky wears the Starter Pack's red scarf. */
export function hasScarf(purchases: PurchaseProgress) {
  return owns(purchases, PRODUCTS.starter);
}

/** The special offers show from the first class-up on. */
export function offersOpen(story: StoryProgress) {
  return story.ceremonySeen >= SPECIAL_SHOP_CEREMONY;
}

/** The offers on show now: the Starter Pack only in its first days, nothing already owned. */
export function offersFor({ story, purchases }: Pick<PurchaseContext, 'story' | 'purchases'>, now: number) {
  if (!offersOpen(story)) return [];
  return PRODUCT_LIST.filter((product) => {
    if (owns(purchases, product)) return false;
    if (product === PRODUCTS.starter) {
      return purchases.offersFrom > 0 && now - purchases.offersFrom < STARTER_OFFER_SECONDS * 1000;
    }
    return true;
  });
}

/** Starts the Starter Pack's clock the first time the offers are open. */
export function openOffers<T extends PurchaseContext>(state: T, now: number): T {
  if (state.purchases.offersFrom > 0 || !offersOpen(state.story)) return state;
  return { ...state, purchases: { ...state.purchases, offersFrom: now } };
}

/**
 * A purchase the store confirmed: owned for good, and its one-time rewards (boost, income). A product
 * already owned gives nothing again.
 */
export function applyPurchase<T extends PurchaseContext>(state: T, productId: string, now: number): T {
  const product = PRODUCT_LIST.find((entry) => entry.id === productId);
  if (!product || state.purchases.owned.includes(productId)) return state;
  const boostFrom = Math.max(state.ads.boostUntil, now);
  return {
    ...state,
    game: product.incomeSeconds > 0 ? earn(state.game, autoIncomePerSecond(state.game) * product.incomeSeconds) : state.game,
    ads: product.boostSeconds > 0 ? { ...state.ads, boostUntil: boostFrom + product.boostSeconds * 1000 } : state.ads,
    purchases: { ...state.purchases, owned: [...state.purchases.owned, productId] },
  };
}

/** Products the store says the player owns (a restore, a new phone): owned again, without the one-time rewards. */
export function applyRestore<T extends PurchaseContext>(state: T, productIds: string[]): T {
  const known = new Set(PRODUCT_LIST.map((product) => product.id));
  const added = productIds.filter((id) => known.has(id) && !state.purchases.owned.includes(id));
  if (added.length === 0) return state;
  return { ...state, purchases: { ...state.purchases, owned: [...state.purchases.owned, ...added] } };
}
