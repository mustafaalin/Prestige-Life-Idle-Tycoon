# Session Handoff

Last updated: 2026-05-07

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

Oyunun ana omurgası local-first olarak çalışıyor. Repo playable durumda, ürün tamamlanmış değil.

Çalışan ana sistemler:

- Local auth / local profile bootstrap
- Worker (20) + Specialist (20) + Manager (20) job progression — toplam 60 job
- Chapter tabanlı quest sistemi — 100 static quest + generated job level quest'leri
- Daily reward / collect earnings / ad reward
- Business progression (40 işletme, max level 6)
- Real estate investments (50 mülk)
- Bank deposits / cashback / premium bank card
- Health ve happiness stat sistemi (action modals + offline decay + wellbeing factors panel)
- Premium cars (3 adet, gem ile)
- Premium houses (3 adet, gem ile) — Sky Loft / Crystal Villa / Apex Penthouse
- Stuff modal — araç/ev/karakter/outfit satın alma ve seçim akışları
- Bottom nav job progress feedback
- Header outfit avatar — seçili outfit başı profil dairesinde gösteriliyor
- Supabase anonymous auth (IAP altyapısı için hazır)
- RevenueCat-ready IAP altyapısı (mock purchase çalışıyor, native SDK kurulmadı)
- Wellbeing factors panel (HealthModal / HappinessModal)

## What Was Done Recently (2026-05-07)

### Manager Job Görselleri
- 20 manager job ikonu işlendi: arka plan kaldırıldı, 512×512'ye düşürüldü, ~50-95KB
- `public/assets/jobs/manager/` klasörüne kopyalandı
- `src/data/local/jobs.ts`'te tüm manager job `icon_url`'leri bağlandı

### Quest Balance Turu
- Tüm 100 quest + job level quest'leri, ekonomi ve job gereksinimleri incelendi
- Tek broken quest bulundu: `quest-90` (rental income eşiği $100K → $20K düzeltildi)
- Chapter 8'de 12 investment ile max $32K/h kazanılabiliyordu; $100K ulaşılamaz bir eşikti
- `claimed_quest_count` mantığı doğru çalışıyor — eski "~15 broken quest" notu geçersiz
- Prestige doğal seyriyle dolduruluyor: Chapter 7 sonu ~245 prestige; job 53 için gereken 206 ✓

### Premium House Görselleri
- `p-house-1/2/3.webp` (backgrounds + icons) assets'e eklendi
- `localAssets.ts` path'leri güncellendi (`house-premium-N` → `p-house-N`)

### Header Outfit Avatar
- Header profil dairesinde seçili outfit görselinin baş kısmı gösteriliyor
- `object-top scale-150 origin-top` ile krop yapılıyor

## Current Architecture Notes

### Quest Sistemi Gerçek Yapısı
- Chapter başına gerçek quest sayısı: 10 (ch0), 11 (ch1-2), 14-16 (ch3-9)
- Job level quest'leri (level 2-60) static quest'lerle aynı chapter'a dağıtılmış
- Chapter tamamlamak için o chapter'daki TÜM quest'ler gerekiyor (`every()` kontrolü)
- Bottleneck her zaman en zorlu static quest'tir; job quest'leri paralel ilerler
- Quest prestige kaynağı: her claim +1, chapter reward'lar ayrıca bonus prestige verir

### IAP Akışı (Mevcut Durum)
- Anonymous auth: `src/lib/auth.ts` → `ensureAnonymousSession()`
- Purchase kayıt: `src/services/iapService.ts` → `purchasePackage()`
- Native RevenueCat: `npm install @revenuecat/purchases-capacitor` yapılmadı, TODO block var
- Webhook: deploy edilmedi (`npx supabase functions deploy revenuecat-webhook`)

### Dikkat Edilmesi Gereken Teknik Borçlar
- `useGameState.ts` ~1667 satır (SRP ihlali, refactor roadmap'te ama öncelikli değil)
- AdMob tüm placement'lar Google test ID kullanıyor (üretim geçişi gerekli)
- RevenueCat SDK kurulmadı (native IAP mock çalışıyor)
- Gem ekonomisi: kaynak (daily reward + quest gem ödülleri) ile sink (premium car/house/skip) dengesi test edilmedi
- Prestige/reset loop oyuncuya UI'da net açıklanmıyor

## Current Important Files

- app orchestration: [App.tsx](../src/App.tsx)
- main game orchestration: [useGameState.ts](../src/hooks/useGameState.ts)
- jobs data: [jobs.ts](../src/data/local/jobs.ts)
- job requirements: [jobRequirements.ts](../src/data/local/jobRequirements.ts)
- quests data: [quests.ts](../src/data/local/quests.ts)
- economy / prestige recalc: [economy.ts](../src/data/local/economy.ts)
- wellbeing: [wellbeing.ts](../src/data/local/wellbeing.ts)
- calculations: [calculations.ts](../src/utils/game/calculations.ts)
- businesses: [businesses.ts](../src/data/local/businesses.ts)
- investments: [investments.ts](../src/data/local/investments.ts)
- cars: [cars.ts](../src/data/local/cars.ts)
- houses: [houses.ts](../src/data/local/houses.ts)
- reward scaling: [rewardScaling.ts](../src/data/local/rewardScaling.ts)
- IAP service: [iapService.ts](../src/services/iapService.ts)
- auth: [auth.ts](../src/lib/auth.ts)

## What Still Needs Work

### Yayın Bloklayıcılar
1. **AdMob production** — `isTesting: false` + gerçek ad unit ID'leri set edilmeli
2. **RevenueCat native SDK** — `npm install @revenuecat/purchases-capacitor` + iapService TODO block
3. **Edge Function deploy** — `npx supabase functions deploy revenuecat-webhook`

### Önemli Eksikler (Oynanabilirlik / Retention)
4. **Gem ekonomisi dengesi** — gem kaynakları yeterli mi, sink'ler erken baskı yapıyor mu, test edilmeli
5. **Prestige/reset loop UI** — reset ne kazandırır? Oyuncuya net gösterilmiyor; en güçlü retention hook'u
6. **Geçici boost sistemi** — 2x income 1 saat gibi reklamlı boost yok; monetization + engagement fırsatı kaçıyor
7. **Leaderboard UI** — schema ve tablo hazır, frontend yok

### Sonraki Aşama
8. **Stocks / investment 3. sekme** — InvestmentsModal'da kilitli placeholder
9. **useGameState refactor** — SRP ihlali, büyüdükçe bug riski artar (öncelik düşük)
10. **Supabase legacy remnant cleanup** — kullanılmayan tablo/sorgu kalıntıları

## Validation Status

- TypeScript check: `npm run typecheck` ile doğrulanmalı
- Quest 90 düzeltmesi: `quests.ts` line ~779 — `investment_income_at_least: 20000`
