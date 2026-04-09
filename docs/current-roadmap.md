# Current Roadmap

Last updated: 2026-04-09

Bu dosya aktif ürün ve teknik roadmap özetidir.

## Done

- Local-first auth ve profile bootstrap
- Worker + Specialist jobs
- Explicit job category / requirement modeli
- Quest chapters + quest list + reward animations
- Daily reward / collect earnings
- Bank deposits / cashback / premium bank card
- Health and happiness modals
- Wellbeing engine for job + house + car
- Premium cars
- Stuff modal buy / sell / selection flows
- Bottom nav job progress feedback
- **Supabase anonymous auth (IAP altyapısı)** — `src/lib/auth.ts`
- **IAP purchase recording** — `src/services/iapService.ts` + Supabase `iap_purchases` tablosu
- **RevenueCat webhook Edge Function** — `supabase/functions/revenuecat-webhook/index.ts` (deploy bekliyor)
- **Offline wellbeing decay** — `calculateOfflineWellbeingDecay()` in `calculations.ts`; maks 24h, offline decay maks -2/h
- **Wellbeing factors panel** — HealthModal + HappinessModal'da job/car/house etkisi breakdown kartı

## In Progress / Immediate Next

1. **Manager jobs** — veri seti tanımlanmalı, placeholder kaldırılmalı
2. **RevenueCat native SDK kurulumu** — `npm install @revenuecat/purchases-capacitor` + native flow
3. **Edge Function deploy** — `npx supabase functions deploy revenuecat-webhook`

## Next

1. Premium houses (gem sink)
2. Quest cleanup (~15 broken quest)
3. AdMob production IDs + `isTesting: false`
4. House / car / job requirement balans turu

## Later

1. useGameState decomposition (SRP)
2. Leaderboard UI (schema hazır)
3. Stocks / investment expansion
4. Better gem economy and temporary boosts
5. Code splitting / bundle size cleanup
6. Supabase legacy remnant cleanup

## Risks / Debt

- `useGameState.ts` aşırı büyük (~1667+ satır)
- Manager content missing
- RevenueCat SDK kurulmadı (native purchase çalışmıyor, sadece mock)
- AdMob test modunda (üretim için geçiş gerekli)
- ~15 quest broken (claimed_quest_count mantığı hatalı)

## When Starting a New Session

Öncelikle şu dosyaları oku:

- [session-handoff.md](./session-handoff.md)
- [current-roadmap.md](./current-roadmap.md)
