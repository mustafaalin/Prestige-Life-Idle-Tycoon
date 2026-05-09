# Session Handoff

Last updated: 2026-05-08

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
- **Prestige/reset loop** — reset bonusu `reset_prestige_bonus` alanında birikir, her reset kalıcıdır
- **Global Leaderboard** — Supabase `leaderboard_scores` tablosu, top 100 + kendi sıra, 3dk sync
- **Outfit isimleri** — "Outfit 2-20" yerine anlamlı isimler (Bare Basics → Elite)

## What Was Done This Session (2026-05-08)

### Reset Döngüsü Bug Düzeltmeleri (4 adet)
1. **Prestige = 0 sonrası reset**: `syncQuestPrestige()` quest prestige'i `reset_prestige_bonus`'u eziyor sorunu. `PlayerProfile`'a `reset_prestige_bonus?: number` eklendi; `syncQuestPrestige` artık `questPrestige + resetBonus` döndürüyor. `profileService.ts`'teki `resetProgress()` bonusu `reset_prestige_bonus` alanında biriktirir.
2. **Health/Happiness barları 100'e gelmiyor**: Header animasyonu `healthAnimationSequenceId` / `happinessAnimationSequenceId` increment olmadan tetiklenmiyor. `handleResetProgress()` her iki ID'yi de artırıyor.
3. **Seçili araç/ev ekranda kalmaya devam ediyor**: `initialCarSynced` flag reset olmuyordu; `selected_car_id = null` olduğunda `displayedCarImage` temizlendi.
4. **İlk job seçilemiyor**: `gameStateRef.current.jobChangeLockedUntil` silinmiyordu; reset'te `jobChangeLockedUntil: null` setlendi.

### Sonsuz Döngü Bug Düzeltmesi (KRİTİK)
- **Sorun**: `useGameState.ts:86` — `expectedPrestige = calculatePrestigeFromQuestProgress()` quest prestige'i hesaplıyordu ama `syncQuestPrestige()` artık `questPrestige + resetBonus` döndürüyor. Reset sonrası `resetBonus=5`, `questPrestige=0` → `currentPrestige(5) ≠ expectedPrestige(0)` → sonsuz `setGameState` döngüsü → "Maximum update depth exceeded" 1700+ kez.
- **Düzeltme**: `useGameState.ts:86`'da `expectedPrestige = questPrestige + resetBonus` olarak güncellendi. Exit condition artık `syncQuestPrestige`'in hesapladığıyla birebir eşleşiyor.

### Leaderboard Implementasyonu (Yeni)
- `src/services/leaderboardService.ts` — `upsertLeaderboardScore()`, `fetchLeaderboard()` (top 100 + kendi sıra)
- `src/hooks/useLeaderboardSync.ts` — 3 dakikada bir Supabase upsert, `getCachedAuthUserId()` ile (user.id değil!)
- `src/components/LeaderboardModal.tsx` — top 100 liste, 100 dışındaysa separator + kendi sıra, freshness label
- Header'a trophy butonu eklendi → LeaderboardModal açar
- **Önemli**: `user.id` (deviceId) değil `getCachedAuthUserId()` kullanılmalı — `iapService.ts` ile aynı pattern

### Outfit İsimleri
- `src/data/local/outfits.ts` — 20 outfit'e gerçek isimler verildi (Bare Basics, Street Casual, … Elite)

## Current Architecture Notes

### Prestige / Reset Sistemi
- `reset_prestige_bonus` (PlayerProfile) — her reset'te birikir, silinmez
- `bonus_prestige_points` = `calculatePrestigeFromQuestProgress(questProgress)` + `reset_prestige_bonus`
- `prestige_points` = `bonus_prestige_points` (aynı değer, farklı alan)
- `useGameState.ts` prestige sync effect: exit condition her iki alanı `questPrestige + resetBonus` ile kıyaslar

### Leaderboard Senkronizasyonu
- `useLeaderboardSync` — 3 dakika interval, `profileRef` ile stale closure'dan kaçınılır
- Supabase RLS: `auth.uid() = auth_user_id` — anonymous session gerekli
- `getCachedAuthUserId()` → `src/lib/auth.ts` → Supabase anonymous user ID

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

## Current Important Files

- app orchestration: [App.tsx](../src/App.tsx)
- main game orchestration: [useGameState.ts](../src/hooks/useGameState.ts)
- prestige helpers: [gameStateHelpers.ts](../src/utils/game/gameStateHelpers.ts)
- profile / reset: [profileService.ts](../src/services/profileService.ts)
- leaderboard service: [leaderboardService.ts](../src/services/leaderboardService.ts)
- leaderboard sync hook: [useLeaderboardSync.ts](../src/hooks/useLeaderboardSync.ts)
- leaderboard modal: [LeaderboardModal.tsx](../src/components/LeaderboardModal.tsx)
- jobs data: [jobs.ts](../src/data/local/jobs.ts)
- quests data: [quests.ts](../src/data/local/quests.ts)
- outfits data: [outfits.ts](../src/data/local/outfits.ts)
- economy / prestige recalc: [economy.ts](../src/data/local/economy.ts)
- auth: [auth.ts](../src/lib/auth.ts)
- IAP service: [iapService.ts](../src/services/iapService.ts)

## What Still Needs Work

### Yayın Bloklayıcılar
1. **AdMob production** — `isTesting: false` + gerçek ad unit ID'leri set edilmeli
2. **RevenueCat native SDK** — `npm install @revenuecat/purchases-capacitor` + iapService TODO block
3. **Edge Function deploy** — `npx supabase functions deploy revenuecat-webhook`

### Önemli Eksikler (Oynanabilirlik / Retention)
4. **Gem ekonomisi dengesi** — gem kaynakları yeterli mi, sink'ler erken baskı yapıyor mu, test edilmeli
5. **Prestige/reset loop UI** — reset ne kazandırır? Oyuncuya net gösterilmiyor; en güçlü retention hook'u
6. **Geçici boost sistemi** — 2x income 1 saat gibi reklamlı boost yok; monetization + engagement fırsatı kaçıyor

### Sonraki Aşama
7. **Stocks / investment 3. sekme** — InvestmentsModal'da kilitli placeholder
8. **useGameState refactor** — SRP ihlali, büyüdükçe bug riski artar (öncelik düşük)
9. **Supabase legacy remnant cleanup** — kullanılmayan tablo/sorgu kalıntıları

## Validation Status

- TypeScript check: `npm run typecheck` ile doğrulanmalı
- Sonsuz döngü düzeltmesi: `useGameState.ts:86` — `expectedPrestige = questPrestige + resetBonus`
