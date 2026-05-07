# Current Roadmap

Last updated: 2026-05-07

Bu dosya aktif ürün ve teknik roadmap özetidir.

## Done

- Local-first auth ve profile bootstrap
- Worker (20) + Specialist (20) + Manager (20) jobs — 60 job, tam veri seti, görseller dahil
- Explicit job category / requirement modeli (prestige, health, happiness, house, car)
- Quest chapters + quest list + reward animations — 100 static + generated job quest'leri
- Quest balance turu tamamlandı — tek broken quest (quest-90 $100K→$20K) düzeltildi
- Daily reward / collect earnings / ad reward
- Bank deposits / cashback / premium bank card
- Health and happiness modals + wellbeing factors panel
- Wellbeing engine (job + house + car offline decay dahil)
- Premium cars (3 adet, gem ile, StuffModal entegre)
- Premium houses (3 adet, gem ile) — görseller ve StuffModal entegrasyonu tamamlandı
- Stuff modal — araç/ev/karakter/outfit satın alma ve seçim akışları
- Bottom nav job progress feedback
- Header outfit avatar (seçili outfit baş kısmı profil dairesinde)
- Supabase anonymous auth — `src/lib/auth.ts`
- IAP purchase recording — `src/services/iapService.ts` + Supabase `iap_purchases` tablosu
- RevenueCat webhook Edge Function — hazır, deploy bekliyor
- Offline wellbeing decay — `calculateOfflineWellbeingDecay()`, maks 24h, -2/h cap
- Business progression (40 işletme, max level 6, prestige sistemi)
- Real estate investments (50 mülk, 5 upgrade seviyesi)

## In Progress / Immediate Next

1. **Gem ekonomisi test ve dengesi** — kaç gem kazanılıyor (daily+quest), kaç gem harcanıyor (car/house/skip); sink'ler erken baskı yapıyor mu analiz edilmeli
2. **Prestige/reset loop UI** — reset ne kazandırır? Oyuncuya net gösterilmiyor; idle oyunlarda en güçlü retention hook
3. **RevenueCat native SDK** — `npm install @revenuecat/purchases-capacitor` + iapService TODO block aktif edilmeli
4. **Edge Function deploy** — `npx supabase functions deploy revenuecat-webhook`

## Next

1. Geçici boost sistemi — 2x income (1 saat) gibi reklamlı boostlar; hem monetization hem engagement
2. AdMob production IDs — `isTesting: false` + gerçek ad unit ID'leri
3. Leaderboard UI — schema ve Supabase tablosu hazır, sadece frontend yok
4. Outfit isimleri — "Outfit 2...20" yerine karakter anlatan gerçek isimler

## Later

1. Stocks / investment 3. sekme — InvestmentsModal'da kilitli placeholder
2. useGameState decomposition (SRP, ~1667 satır)
3. Supabase legacy remnant cleanup
4. Code splitting / bundle size cleanup

## Risks / Debt

- `useGameState.ts` ~1667 satır — SRP ihlali, büyüdükçe bug riski artar
- RevenueCat SDK kurulmadı — native IAP mock çalışıyor, gerçek ödeme yok
- AdMob test modunda — tüm placement'lar Google test ID kullanıyor
- Gem ekonomisi test edilmedi — source/sink dengesi belirsiz
- Prestige/reset loop oyuncuya UI'da net anlatılmıyor
- Geçici boost sistemi yok — reklam monetization fırsatı kaçıyor

## When Starting a New Session

Öncelikle şu dosyaları oku:

- [session-handoff.md](./session-handoff.md)
- [current-roadmap.md](./current-roadmap.md)
