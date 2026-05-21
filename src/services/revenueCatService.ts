import { Capacitor } from '@capacitor/core';
import { Purchases, LOG_LEVEL, PRODUCT_CATEGORY } from '@revenuecat/purchases-capacitor';

let initialized = false;
let initPromise: Promise<void> | null = null;

export async function initializeRevenueCat(appUserId: string | null): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  if (initialized) return;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const platform = Capacitor.getPlatform();
    const apiKey = platform === 'ios'
      ? import.meta.env.VITE_REVENUECAT_API_KEY_IOS
      : import.meta.env.VITE_REVENUECAT_API_KEY_ANDROID;

    if (!apiKey || apiKey === 'appl_xxxx' || apiKey === 'goog_xxxx') {
      console.warn('[RevenueCat] API key henüz tanımlanmadı, atlanıyor.');
      return;
    }

    await Purchases.setLogLevel({ level: LOG_LEVEL.ERROR });
    await Purchases.configure({ apiKey, appUserID: appUserId ?? undefined });
    initialized = true;
  })().finally(() => { initPromise = null; });

  return initPromise;
}

export async function getOfferings() {
  if (!initialized) return null;
  try {
    return await Purchases.getOfferings();
  } catch {
    return null;
  }
}

export interface StoreProductPrice {
  price: number;
  priceString: string;
}

export async function fetchProductPrices(
  productIds: string[]
): Promise<Record<string, StoreProductPrice>> {
  if (!Capacitor.isNativePlatform()) return {};
  // Init devam ediyorsa tamamlanmasını bekle
  if (!initialized && initPromise) await initPromise;
  if (!initialized) return {};
  try {
    const { products } = await Purchases.getProducts({
      productIdentifiers: productIds,
      type: PRODUCT_CATEGORY.NON_SUBSCRIPTION,
    });
    const result: Record<string, StoreProductPrice> = {};
    for (const p of products) {
      result[(p as { identifier: string; price: number; priceString: string }).identifier] = {
        price: (p as { price: number }).price,
        priceString: (p as { priceString: string }).priceString,
      };
    }
    return result;
  } catch {
    return {};
  }
}

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out after ${ms / 1000}s`)), ms)
    ),
  ]);
}

export async function purchaseProduct(productId: string) {
  if (!initialized) throw new Error('RevenueCat not initialized');
  const { products } = await withTimeout(
    Purchases.getProducts({ productIdentifiers: [productId], type: PRODUCT_CATEGORY.NON_SUBSCRIPTION }),
    15000,
    'getProducts'
  );
  console.log(`[RevenueCat] getProducts(${productId}) returned ${products.length} product(s):`, products.map((p: { identifier: string }) => p.identifier));
  const product = products.find((p: { identifier: string }) => p.identifier === productId);
  if (!product) {
    throw new Error(`Product not found in store: ${productId}`);
  }
  return withTimeout(
    Purchases.purchaseStoreProduct({ product: product as Parameters<typeof Purchases.purchaseStoreProduct>[0]['product'] }),
    60000,
    'purchaseStoreProduct'
  );
}
