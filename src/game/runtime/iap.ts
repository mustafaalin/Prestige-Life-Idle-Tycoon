import { Capacitor } from '@capacitor/core';
import { LOG_LEVEL, PRODUCT_CATEGORY, PURCHASES_ERROR_CODE, Purchases } from '@revenuecat/purchases-capacitor';
import { PRODUCT_LIST } from '../core/config/iap';
import { track } from './analytics';

// In-app purchases for v2 (docs/monetization-v2.md §5) through RevenueCat, which also keeps what was
// bought so a new phone or a reinstall can restore it. One-time products, no account: RevenueCat's
// anonymous id. Web and dev: a mock store that always says yes. Framework-free; the store applies
// what this returns (runtime/purchases.ts).

/** purchased: paid (or already owned). cancelled: the player closed the store sheet. unavailable: no store, no product, an error. */
export type PurchaseOutcome = 'purchased' | 'cancelled' | 'unavailable';

const native = Capacitor.isNativePlatform();
const mock = !native && import.meta.env.DEV;

let ready: Promise<boolean> | null = null;

/** Configures RevenueCat once; false when there is no store (web, no key). Never throws. */
function setup(): Promise<boolean> {
  if (!native) return Promise.resolve(false);
  ready ??= (async () => {
    const apiKey =
      Capacitor.getPlatform() === 'ios'
        ? import.meta.env.VITE_REVENUECAT_API_KEY_IOS
        : import.meta.env.VITE_REVENUECAT_API_KEY_ANDROID;
    if (!apiKey) return false;
    try {
      await Purchases.setLogLevel({ level: LOG_LEVEL.ERROR });
      await Purchases.configure({ apiKey });
      return true;
    } catch {
      return false;
    }
  })();
  return ready;
}

/** Local prices by product id (e.g. "₺79,99"); empty where the store gave none. */
export async function loadPrices(): Promise<Record<string, string>> {
  if (!(await setup())) return {};
  try {
    const { products } = await Purchases.getProducts({
      productIdentifiers: PRODUCT_LIST.map((product) => product.id),
      type: PRODUCT_CATEGORY.NON_SUBSCRIPTION,
    });
    return Object.fromEntries(products.map((product) => [product.identifier, product.priceString]));
  } catch {
    return {};
  }
}

/** Opens the store's purchase sheet for one product. */
export async function buyProduct(productId: string): Promise<PurchaseOutcome> {
  track('purchase_start', { product_id: productId });
  let outcome: PurchaseOutcome = 'unavailable';
  if (mock) {
    await new Promise((resolve) => setTimeout(resolve, 600));
    outcome = 'purchased';
  } else if (await setup()) {
    try {
      const { products } = await Purchases.getProducts({
        productIdentifiers: [productId],
        type: PRODUCT_CATEGORY.NON_SUBSCRIPTION,
      });
      const product = products.find((entry) => entry.identifier === productId);
      if (product) {
        await Purchases.purchaseStoreProduct({ product });
        outcome = 'purchased';
      }
    } catch (error) {
      const code = (error as { code?: string }).code;
      if (code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) outcome = 'cancelled';
      // Bought on another phone, or the store finished a pending purchase: it is the player's.
      else if (code === PURCHASES_ERROR_CODE.PRODUCT_ALREADY_PURCHASED_ERROR) outcome = 'purchased';
    }
  }
  track('purchase_result', { product_id: productId, outcome });
  return outcome;
}

/** The products the store says this player owns; null when the store could not be reached. */
export async function ownedProducts(): Promise<string[] | null> {
  // The mock store remembers nothing: "unknown", so nothing is given or taken back.
  if (mock) return null;
  if (!(await setup())) return null;
  try {
    const { customerInfo } = await Purchases.getCustomerInfo();
    return customerInfo.allPurchasedProductIdentifiers;
  } catch {
    return null;
  }
}

/**
 * The player's RevenueCat id (anonymous, "$RCAnonymousID:…"), shown in Settings so a player who writes
 * "I paid but got nothing" can send it: RevenueCat → Customers finds their purchases by it. Null without a store.
 */
export async function playerId(): Promise<string | null> {
  if (mock) return '$RCAnonymousID:dev-mock';
  if (!(await setup())) return null;
  try {
    return (await Purchases.getAppUserID()).appUserID;
  } catch {
    return null;
  }
}

/** "Restore purchases": asks the store again (Apple requires the button). */
export async function restoreProducts(): Promise<string[] | null> {
  if (mock) return [];
  if (!(await setup())) return null;
  try {
    const { customerInfo } = await Purchases.restorePurchases();
    return customerInfo.allPurchasedProductIdentifiers;
  } catch {
    return null;
  }
}

export const storeAvailable = native || mock;

/** A real store answers (a phone), not the dev mock: only its lists may take a product back. */
export const realStore = native;
