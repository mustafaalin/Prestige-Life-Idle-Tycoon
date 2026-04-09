import { Capacitor } from '@capacitor/core';
import { supabase } from '../lib/supabase';
import { getCachedAuthUserId } from '../lib/auth';

export type IAPPackageType = 'money' | 'gems';

export interface IAPPackage {
  packageId: string;         // Local ID (e.g. 'money-pack-2')
  productId: string;         // App Store / Play Store product ID
  type: IAPPackageType;
  amount: number;
  priceUsd: number;
  displayPrice?: string;     // RevenueCat'ten gelen lokalize fiyat (ör. "₺34,99")
}

export interface PurchaseResult {
  success: boolean;
  moneyAdded: number;
  gemsAdded: number;
  transactionId?: string;
  error?: string;
}

// Product ID → package mapping (App Store / Play Store ile eşleşmeli)
const PRODUCT_MAP: Record<string, { type: IAPPackageType; amount: number }> = {
  'com.idleguy.money_pack_1':  { type: 'money', amount: 8000 },
  'com.idleguy.money_pack_2':  { type: 'money', amount: 25000 },
  'com.idleguy.money_pack_3':  { type: 'money', amount: 75000 },
  'com.idleguy.money_pack_4':  { type: 'money', amount: 250000 },
  'com.idleguy.gems_pack_1':   { type: 'gems',  amount: 30 },
  'com.idleguy.gems_pack_2':   { type: 'gems',  amount: 75 },
  'com.idleguy.gems_pack_3':   { type: 'gems',  amount: 300 },
  'com.idleguy.gems_pack_4':   { type: 'gems',  amount: 750 },
};

/**
 * Ödeme akışını başlatır.
 * - Native (iOS/Android): RevenueCat SDK ile gerçek ödeme
 * - Web/Dev: Supabase'e direkt kayıt (test amaçlı)
 */
export async function purchasePackage(
  packageId: string,
  type: IAPPackageType,
  amount: number,
  priceUsd: number,
): Promise<PurchaseResult> {
  const isNative = Capacitor.isNativePlatform();

  if (isNative) {
    return purchaseNative(packageId, type, amount);
  }

  // Web/dev ortamında mock purchase (test)
  return purchaseMock(packageId, type, amount, priceUsd);
}

/**
 * Native RevenueCat satın alma.
 * @revenuecat/purchases-capacitor kurulduktan sonra implement edilecek.
 */
async function purchaseNative(
  packageId: string,
  type: IAPPackageType,
  amount: number,
): Promise<PurchaseResult> {
  // TODO: RevenueCat SDK kurulunca açılacak
  // import { Purchases } from '@revenuecat/purchases-capacitor';
  //
  // try {
  //   const offerings = await Purchases.getOfferings();
  //   const pkg = offerings.current?.availablePackages.find(p => p.identifier === packageId);
  //   if (!pkg) throw new Error('Package not found in offerings');
  //
  //   const { customerInfo } = await Purchases.purchasePackage({ aPackage: pkg });
  //   // Webhook üzerinden Supabase'e işlenir, biz sadece local state'i güncelliyoruz
  //   const moneyAdded = type === 'money' ? amount : 0;
  //   const gemsAdded = type === 'gems' ? amount : 0;
  //   return { success: true, moneyAdded, gemsAdded };
  // } catch (err: any) {
  //   if (err.userCancelled) return { success: false, moneyAdded: 0, gemsAdded: 0, error: 'cancelled' };
  //   throw err;
  // }

  // Şimdilik native'de de mock çalışsın (RevenueCat kurulana kadar)
  console.warn('[IAP] Native purchase not yet implemented, using mock');
  return purchaseMock(packageId, type, amount, 0);
}

/**
 * Web/test ortamı için mock purchase. Supabase'e transaction kaydeder.
 */
async function purchaseMock(
  packageId: string,
  type: IAPPackageType,
  amount: number,
  priceUsd: number,
): Promise<PurchaseResult> {
  const authUserId = getCachedAuthUserId();

  const moneyAdded = type === 'money' ? amount : 0;
  const gemsAdded = type === 'gems' ? amount : 0;

  // Supabase'e kaydet (auth user varsa)
  if (authUserId) {
    const { error } = await supabase.from('iap_purchases').insert({
      auth_user_id: authUserId,
      package_id: packageId,
      product_id: packageId,
      platform: 'mock',
      status: 'completed',
      money_granted: moneyAdded,
      gems_granted: gemsAdded,
      amount_usd: priceUsd,
      provider_transaction_id: `mock_${Date.now()}`,
      granted_at: new Date().toISOString(),
    });

    if (error) {
      console.warn('[IAP] Failed to log mock purchase to Supabase:', error.message);
    }
  }

  return { success: true, moneyAdded, gemsAdded };
}

/**
 * RevenueCat webhook'tan gelen entitlement'ları parse eder.
 * Edge Function içinde kullanılır (server-side).
 */
export function parseRevenueCatWebhook(body: {
  event: { type: string; product_id: string; app_user_id: string; transaction_id: string };
}): { productId: string; userId: string; transactionId: string; package: { type: IAPPackageType; amount: number } | null } {
  const { event } = body;
  const pkg = PRODUCT_MAP[event.product_id] ?? null;

  return {
    productId: event.product_id,
    userId: event.app_user_id,
    transactionId: event.transaction_id,
    package: pkg,
  };
}
