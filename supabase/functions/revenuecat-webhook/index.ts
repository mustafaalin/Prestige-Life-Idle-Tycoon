/**
 * RevenueCat Webhook Edge Function
 *
 * Kurulum:
 * 1. supabase functions deploy revenuecat-webhook
 * 2. RevenueCat Dashboard > Project Settings > Webhooks
 *    URL: https://smnzcsigqbxyayeninfm.supabase.co/functions/v1/revenuecat-webhook
 *    Authorization header: REVENUECAT_WEBHOOK_SECRET değeri
 * 3. Supabase Dashboard > Edge Functions > Secrets:
 *    REVENUECAT_WEBHOOK_SECRET = RevenueCat'ten kopyaladığın secret
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const WEBHOOK_SECRET = Deno.env.get('REVENUECAT_WEBHOOK_SECRET') ?? '';

// product_id → { type, amount } mapping
const PRODUCT_MAP: Record<string, { type: 'money' | 'gems'; amount: number }> = {
  'com.prestigelife.money_pack_1': { type: 'money', amount: 8000 },
  'com.prestigelife.money_pack_2': { type: 'money', amount: 25000 },
  'com.prestigelife.money_pack_3': { type: 'money', amount: 75000 },
  'com.prestigelife.money_pack_4': { type: 'money', amount: 250000 },
  'com.prestigelife.gems_pack_1':  { type: 'gems',  amount: 30 },
  'com.prestigelife.gems_pack_2':  { type: 'gems',  amount: 75 },
  'com.prestigelife.gems_pack_3':  { type: 'gems',  amount: 300 },
  'com.prestigelife.gems_pack_4':  { type: 'gems',  amount: 750 },
};

Deno.serve(async (req) => {
  // Sadece POST kabul et
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  // Authorization kontrolü
  const authHeader = req.headers.get('Authorization') ?? '';
  if (WEBHOOK_SECRET && authHeader !== `Bearer ${WEBHOOK_SECRET}`) {
    console.error('[webhook] Unauthorized request');
    return new Response('Unauthorized', { status: 401 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return new Response('Invalid JSON', { status: 400 });
  }

  const event = body?.event;
  if (!event) {
    return new Response('Missing event', { status: 400 });
  }

  // Sadece başarılı satın almaları işle
  const VALID_TYPES = ['INITIAL_PURCHASE', 'RENEWAL', 'PRODUCT_CHANGE'];
  if (!VALID_TYPES.includes(event.type)) {
    return new Response(JSON.stringify({ skipped: true, type: event.type }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const productId: string = event.product_id ?? '';
  const appUserId: string = event.app_user_id ?? '';  // Supabase auth.user.id
  const transactionId: string = event.transaction_id ?? event.id ?? '';
  const platform: string = event.store === 'APP_STORE' ? 'ios' : event.store === 'PLAY_STORE' ? 'android' : 'unknown';
  const priceUsd: number = event.price_in_purchased_currency ?? event.price ?? 0;

  const pkg = PRODUCT_MAP[productId];
  if (!pkg) {
    console.warn(`[webhook] Unknown product_id: ${productId}`);
    return new Response(JSON.stringify({ skipped: true, reason: 'unknown_product' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // Duplicate kontrolü
  const { data: existing } = await supabase
    .from('iap_purchases')
    .select('id')
    .eq('revenuecat_event_id', transactionId)
    .maybeSingle();

  if (existing) {
    console.log(`[webhook] Duplicate transaction: ${transactionId}`);
    return new Response(JSON.stringify({ skipped: true, reason: 'duplicate' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const moneyGranted = pkg.type === 'money' ? pkg.amount : 0;
  const gemsGranted = pkg.type === 'gems' ? pkg.amount : 0;

  // iap_purchases'a kaydet
  const { error: insertError } = await supabase.from('iap_purchases').insert({
    auth_user_id: appUserId,
    package_id: productId,
    product_id: productId,
    platform,
    status: 'completed',
    money_granted: moneyGranted,
    gems_granted: gemsGranted,
    amount_usd: priceUsd,
    provider_transaction_id: transactionId,
    revenuecat_event_id: transactionId,
    granted_at: new Date().toISOString(),
  });

  if (insertError) {
    console.error('[webhook] Insert error:', insertError.message);
    return new Response(JSON.stringify({ error: insertError.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  console.log(`[webhook] Purchase recorded: ${productId} for user ${appUserId}`);

  return new Response(
    JSON.stringify({ success: true, moneyGranted, gemsGranted }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  );
});
