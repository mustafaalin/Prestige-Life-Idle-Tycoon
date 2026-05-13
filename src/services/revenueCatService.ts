import { Capacitor } from '@capacitor/core';
import { Purchases, LOG_LEVEL } from '@revenuecat/purchases-capacitor';

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

export async function purchaseProduct(productId: string) {
  if (!initialized) throw new Error('RevenueCat not initialized');
  const offerings = await Purchases.getOfferings();
  const allPackages = Object.values(offerings.all).flatMap(
    (o: { availablePackages: { product: { identifier: string } }[] }) => o.availablePackages
  );
  const pkg = allPackages.find(p => p.product.identifier === productId);
  if (!pkg) throw new Error(`Product not found: ${productId}`);
  return Purchases.purchasePackage({ aPackage: pkg as Parameters<typeof Purchases.purchasePackage>[0]['aPackage'] });
}
