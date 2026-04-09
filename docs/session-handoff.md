# Session Handoff

Last updated: 2026-04-09

Bu dosya yeni bir oturumda projeye hızlı geri dönmek için güncel durum özetidir.

## Quick Resume Prompt

Yeni sohbette şu prompt yeterli:

```text
Bu proje local-first idle life sim. Lütfen önce şu dosyaları oku ve mevcut durumu kısaca özetle:

docs/session-handoff.md
docs/current-roadmap.md

Sonra en mantıklı sıradaki ürün ve teknik adımı öner.
```

## Current Product State

Oyunun ana omurgası local-first olarak çalışıyor.

Çalışan ana sistemler:

- local auth / local profile bootstrap
- worker + specialist job progression (manager placeholder)
- chapter tabanlı quest sistemi
- daily reward ve collect earnings
- business progression
- real estate / bank / cashback / premium bank card
- health ve happiness stat sistemi (action modals + offline decay)
- premium cars ve gem ile satın alma akışı
- modal bazlı mobil-first UI akışları
- Supabase anonymous auth (IAP altyapısı için)
- RevenueCat-ready IAP altyapısı (mock purchase çalışıyor)
- Wellbeing factors panel (HealthModal / HappinessModal'da faktör kartı)

Repo şu anda playable durumda, ürün tamamlanmış değil.

## What Was Finished Recently (2026-04-09)

### IAP Altyapısı
- Supabase anonymous auth kuruldu (`src/lib/auth.ts` — singleton promise, StrictMode safe)
- `iap_purchases` tablosu + `profiles` tablosu + `leaderboard_scores` tablosu (migration: `supabase/migrations/20260409000001_iap_and_leaderboard.sql`)
- `src/services/iapService.ts` — mock purchase flow çalışıyor (Supabase'e kayıt atıyor)
- RevenueCat webhook Edge Function hazır (`supabase/functions/revenuecat-webhook/index.ts`)
- `.env.local` dosyası oluşturuldu (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY)

### Offline Wellbeing Decay
- `src/utils/game/calculations.ts` → `calculateOfflineWellbeingDecay()` eklendi
- Kişinin sahip olduğu iş/araç/eve göre (hardcoded değil) sağlık ve mutluluk pasif olarak etkileniyor
- Maks 24 saat etki süresi
- **Offline'da negatif etki -2/h ile sınırlandırıldı** (24 saat × 2 = maks %48 düşüş)
- Pozitif etkiler (yüksek tier iş/araba/ev varsa) tam olarak uygulanıyor
- `useGameState.ts`'te: initial load + visibility change (background→foreground) anında uygulanıyor

### Wellbeing Factors Panel
- `WellbeingFactor` tipi eklendi (`src/types/game.ts`)
- `App.tsx`'te `wellbeingFactors` hesaplanıp her iki modal'a prop olarak geçiliyor
- `HealthModal.tsx` ve `HappinessModal.tsx` yeniden tasarlandı:
  - Üstte "Factors (per hour)" kartı: job/car/house etkilerini listeler + toplam gösterir
  - Ayrı "Watch Ad" kartı: ads.png ikonu, açıklama, sabit boyutlu buton
  - Reklam butonu CSS'i, alttaki action butonlarıyla birebir eşleşiyor (aynı gölge, rounded, border)

## Current Architecture Notes

### IAP akışı (mevcut durum)
- Anonymous auth: `src/lib/auth.ts` → `ensureAnonymousSession()`
- Purchase kayıt: `src/services/iapService.ts` → `purchasePackage()`
- Native RevenueCat: henüz `npm install @revenuecat/purchases-capacitor` yapılmadı, TODO block var
- Webhook: deploy edilmedi (`npx supabase functions deploy revenuecat-webhook`)

### Dikkat edilmesi gereken teknik borçlar
- `useGameState.ts` hala çok büyük (~1667+ satır)
- Manager jobs henüz gerçek veriyle tanımlı değil (placeholder)
- RevenueCat SDK kurulmadı
- AdMob üretim ID'leri set edilmedi (`isTesting: false`)
- Quest'lerde ~15 broken quest (`claimed_quest_count` mantığı hatalı, tekrarlı purchase quest'leri)

## Current Important Files

En kritik dosyalar:

- app orchestration: [App.tsx](../src/App.tsx)
- main game orchestration: [useGameState.ts](../src/hooks/useGameState.ts)
- jobs data: [jobs.ts](../src/data/local/jobs.ts)
- job requirements: [jobRequirements.ts](../src/data/local/jobRequirements.ts)
- quests data: [quests.ts](../src/data/local/quests.ts)
- wellbeing: [wellbeing.ts](../src/data/local/wellbeing.ts)
- wellbeing calculations: [calculations.ts](../src/utils/game/calculations.ts)
- IAP service: [iapService.ts](../src/services/iapService.ts)
- auth: [auth.ts](../src/lib/auth.ts)
- cars data: [cars.ts](../src/data/local/cars.ts)
- houses data: [houses.ts](../src/data/local/houses.ts)
- stuff modal: [StuffModal.tsx](../src/components/StuffModal.tsx)
- jobs modal: [JobsModal.tsx](../src/components/JobsModal.tsx)
- health modal: [HealthModal.tsx](../src/components/HealthModal.tsx)
- happiness modal: [HappinessModal.tsx](../src/components/HappinessModal.tsx)

## What Still Needs Work

1. **Manager jobs** — veri listesi yok, modalda placeholder
2. **RevenueCat native SDK** — `npm install @revenuecat/purchases-capacitor` + iapService TODO block
3. **Edge Function deploy** — `npx supabase functions deploy revenuecat-webhook`
4. **AdMob production** — `isTesting: false` + gerçek ad unit ID'leri
5. **Quest cleanup** — ~15 broken quest düzeltilmeli (claimed_quest_count hatalı)
6. **Premium houses** — gem sink olarak güçlü aday
7. **useGameState refactor** — SRP ihlali, parçalanabilir
8. **Gem economy design** — source/sink dengesi netleştirilmeli
9. **Leaderboard UI** — tablo schema hazır, frontend yok

## Validation Status

Son güncelleme anında:
- son commit: `7acef4f`
- TypeScript check temiz (tsc --noEmit başarılı)
