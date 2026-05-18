import { Capacitor } from '@capacitor/core';
import { Purchases, LOG_LEVEL, PRODUCT_CATEGORY } from '@revenuecat/purchases-capacitor';

let initialized = false;

export async function initializeRevenueCat(appUserId: string | null): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  if (initialized) return;

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

export async function purchaseProduct(productId: string) {
  if (!initialized) throw new Error('RevenueCat not initialized');
  const { products } = await Purchases.getProducts({ productIdentifiers: [productId], type: PRODUCT_CATEGORY.NON_SUBSCRIPTION });
  console.log(`[RevenueCat] getProducts(${productId}) returned ${products.length} product(s):`, products.map((p: { identifier: string }) => p.identifier));
  const product = products.find((p: { identifier: string }) => p.identifier === productId);
  if (!product) {
    throw new Error(
      `Product not found: ${productId}. Make sure it is approved in Play Console and your test account is added as an internal tester.`
    );
  }
  return Purchases.purchaseStoreProduct({ product: product as Parameters<typeof Purchases.purchaseStoreProduct>[0]['product'] });
}
