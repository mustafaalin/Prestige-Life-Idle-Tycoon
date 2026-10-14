// In-app purchases (docs/monetization-v2.md §5, decided 2026-10-08). Launched in steps: the Comfort
// Pack and the Starter Pack first; the permanent ×2 (golden collar) and the Night Shift after a
// paying-player simulation. Rules: runtime/purchases.ts. Store side: runtime/iap.ts (RevenueCat).
//
// Product ids are the store ids (Play Console / App Store Connect, one-time products). They are saved
// on the player's phone: never rename one (docs/session-handoff.md, "Kayıt uyumluluğu").

export type ProductKey = 'comfort' | 'starter';

export interface ProductDef {
  key: ProductKey;
  /** Store product id. */
  id: string;
  /** Price shown when the store gives none (web, store not reachable); the store's local price wins. */
  fallbackPrice: string;
  /** The income boost (×2) it adds once, on top of what is running. */
  boostSeconds: number;
  /** Automatic income it pays once. */
  incomeSeconds: number;
}

export const PRODUCTS: Record<ProductKey, ProductDef> = {
  /** Every rewarded ad's reward without the ad, for good; a 2-hour boost to start. */
  comfort: { key: 'comfort', id: 'v2_comfort_pack', fallbackPrice: '$7.99', boostSeconds: 2 * 3600, incomeSeconds: 0 },
  /** One time, in the first days: a 4-hour boost, an hour of income and Lucky's red scarf. */
  starter: { key: 'starter', id: 'v2_starter_pack', fallbackPrice: '$1.99', boostSeconds: 4 * 3600, incomeSeconds: 3600 },
};

export const PRODUCT_LIST: ProductDef[] = [PRODUCTS.starter, PRODUCTS.comfort];

/** The special offers open with the first class-up (the Day Laborer ceremony). */
export const SPECIAL_SHOP_CEREMONY = 1;

/** The Starter Pack is offered for this long after the special offers open. */
export const STARTER_OFFER_SECONDS = 3 * 24 * 3600;
