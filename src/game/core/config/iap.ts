// In-app purchases (docs/monetization-v2.md §5, decided 2026-10-08). Launched in steps: the Comfort
// Pack and the Starter Pack first; the permanent ×2 (a collar for Lucky) and the Night Shift after a
// paying-player simulation. Rules: runtime/purchases.ts. Store side: runtime/iap.ts (RevenueCat).
// Screen: ui/shop/StoreSheet.tsx, which lays the products out by `section`.
//
// A new product is one entry here (and its store product, its art and its `iap.<key>` texts in both
// languages); the store screen, prices, restore and analytics pick it up. Products not on sale yet are
// left out of PRODUCT_LIST, so nothing on screen promises them.
//
// Product ids are the store ids (Play Console / App Store Connect). They are saved on the player's
// phone: never rename one (docs/session-handoff.md, "Kayıt uyumluluğu").

export type ProductKey = 'comfort' | 'starter';

/**
 * permanent: bought once, kept for good, shown as owned afterwards. once: bought once, its rewards
 * are the point, so it leaves the store when bought. consumable: can be bought again and again (cash
 * bags); never "owned", never restored.
 */
export type ProductKind = 'permanent' | 'once' | 'consumable';

/** Store screen sections, in this order. Empty sections are not shown. */
export type StoreSection = 'limited' | 'permanent' | 'bundles';
export const STORE_SECTIONS: StoreSection[] = ['limited', 'permanent', 'bundles'];

/**
 * A lower price for the player's first days (decided 2026-10-15): a second store product with the same
 * rewards. Play prices one product the same for everyone at a time, and RevenueCat does not support
 * Play's discount offers on one-time products yet, so a price that depends on the player is its own
 * product. Owning either id owns the pack. A sale for everyone at once needs none of this: the price is
 * changed in Play Console.
 */
export interface WelcomePrice {
  /** Store product id of the lower price. Saved like any product id: never rename it. */
  id: string;
  /** How long it lasts, from the moment the store opens for the player. */
  seconds: number;
  fallbackPrice: string;
}

export interface ProductDef {
  key: ProductKey;
  /** Store product id (the regular price). */
  id: string;
  kind: ProductKind;
  section: StoreSection;
  /** Picture on the store card (public/assets/iap/; source art/pilot/15-iap/). */
  art: string;
  /** How many `iap.<key>.lineN` texts the card lists. */
  lines: number;
  /** Price shown when the store gives none (web, store not reachable); the store's local price wins. */
  fallbackPrice: string;
  /** The income boost (×2) it adds once, on top of what is running. */
  boostSeconds: number;
  /** Income it pays once, counted as while playing (hand-run businesses included). */
  incomeSeconds: number;
  /**
   * A permanent bonus to all income while owned, kept across lives (0.1 = +10%). It multiplies on its
   * own, outside the status bonus, so what the card says is what the player gets (decided 2026-10-15).
   */
  incomeBonus: number;
  /** A limited offer: on show for this long once the store opens (0 = always). */
  offerSeconds: number;
  /** A welcome price for the first days; afterwards the regular price. */
  welcome?: WelcomePrice;
}

const ART = '/assets/iap';

export const PRODUCTS: Record<ProductKey, ProductDef> = {
  /**
   * Every rewarded ad's reward without the ad, for good; a 2-hour boost and 3 hours of income to start
   * (2026-10-21, user: ad-free alone felt like a high price for little).
   */
  comfort: {
    key: 'comfort',
    id: 'v2_comfort_pack',
    kind: 'permanent',
    section: 'permanent',
    art: `${ART}/comfort.webp`,
    lines: 2,
    fallbackPrice: '$7.99',
    boostSeconds: 2 * 3600,
    incomeSeconds: 3 * 3600,
    incomeBonus: 0,
    offerSeconds: 0,
  },
  /**
   * One time: a 4-hour boost, an hour of income and Lucky's red scarf (+10% income for good). $1.49
   * for the first 3 days, then $2.99, on sale for good (2026-10-15; it was $1.99 for 3 days only).
   */
  starter: {
    key: 'starter',
    id: 'v2_starter_pack',
    kind: 'once',
    section: 'limited',
    art: `${ART}/starter.webp`,
    lines: 3,
    fallbackPrice: '$2.99',
    boostSeconds: 4 * 3600,
    incomeSeconds: 3600,
    incomeBonus: 0.1,
    offerSeconds: 0,
    welcome: { id: 'v2_starter_pack_welcome', seconds: 3 * 24 * 3600, fallbackPrice: '$1.49' },
  },
};

/** The products on sale, in the order they show within a section. */
export const PRODUCT_LIST: ProductDef[] = [PRODUCTS.starter, PRODUCTS.comfort];

/** Every store id of a product: its own and its welcome price's. */
export function productIds(product: ProductDef) {
  return product.welcome ? [product.id, product.welcome.id] : [product.id];
}

/** The product a store id belongs to (either of its prices). */
export function productById(id: string): ProductDef | undefined {
  return Object.values(PRODUCTS).find((product) => productIds(product).includes(id));
}

/**
 * Refunds (2026-10-14): when on, a product the store no longer lists for the player (refunded in Play
 * Console, or by the player) leaves the save: the Comfort Pack's ad-free and the scarf (with its bonus) go, rewards
 * already used stay. Off until a refunded test purchase shows RevenueCat drops it from the list,
 * including after a reinstall (a new anonymous RevenueCat id must not look like a refund).
 */
export const REVOKE_REFUNDS = false;

/** The store opens with the first class-up (the Day Laborer ceremony). */
export const SPECIAL_SHOP_CEREMONY = 1;
