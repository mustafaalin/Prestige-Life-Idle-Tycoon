# Session Handoff

Last updated: 2026-05-14

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

Oyunun ana omurgası local-first olarak çalışıyor. Repo playable durumda, Play Store süreci devam ediyor.

Çalışan ana sistemler:

- Local auth / local profile bootstrap
- Worker (20) + Specialist (20) + Manager (20) job progression — toplam 60 job
- Chapter tabanlı quest sistemi — 100 static quest + generated job level quest'leri
- Daily reward / collect earnings / ad reward
- Business progression (40 işletme, max level 6)
- Real estate investments (50 mülk, 5 upgrade seviyesi)
- Bank deposits / cashback / premium bank card
- Health ve happiness stat sistemi (action modals + offline decay + wellbeing factors panel)
- Premium cars (3 adet, gem ile)
- Premium houses (3 adet, gem ile)
- Stuff modal — araç/ev/karakter/outfit satın alma ve seçim akışları
- Bottom nav job progress feedback
- Header outfit avatar
- Supabase anonymous auth
- Global Leaderboard — top 100, kendi sıra, 3dk sync
- Prestige/reset loop — quest bazlı prestige, reset_prestige_bonus birikimi
- Geçici boost sistemi — Business 2×, Investment 2×, Total Income 2× (reklam ile, 1 saat)
- Ses/müzik sistemi — Howler.js, lazy init, modal ducking, ayarlar
- InsufficientFundsModal — para yetersizse Shop'a yönlendirme
- AdMob production entegrasyonu — gerçek ad unit ID'leri, isTesting env bazlı
- RevenueCat SDK kurulumu — @revenuecat/purchases-capacitor, API key env'den
- IAP ürünleri — 8 ürün Play Console'da tanımlı (com.prestigelife.*)

## Uygulama Kimliği

- **Paket adı:** `com.prestigelife.idletycoon`
- **Uygulama adı:** Prestige Life: Idle Tycoon
- **Android App ID (AdMob):** `ca-app-pub-8950990027285549~9898475278`
- **iOS App ID (AdMob):** `ca-app-pub-8950990027285549~3253175874`
- **versionCode:** 2

## Prestij Sistemi (Güncel)

- Prestij yalnızca quest ilerlemesinden gelir
- Her claim edilen quest: +1 prestige
- Chapter reward'ları: bonus prestige
- Reset bonusu: `reset_prestige_bonus` alanında kalıcı birikir
- `syncQuestPrestige()` her güncellemeyi yönetir
- Job/business/house/car/outfit prestige katkısı YOKTUR

## IAP Ürün Listesi

| Ürün Kimliği | Tür | Miktar | Fiyat |
|---|---|---|---|
| com.prestigelife.money_pack_1 | money | 8,000 | $0.99 |
| com.prestigelife.money_pack_2 | money | 25,000 | $1.99 |
| com.prestigelife.money_pack_3 | money | 75,000 | $4.99 |
| com.prestigelife.money_pack_4 | money | 250,000 | $9.99 |
| com.prestigelife.gems_pack_1 | gems | 30 | $0.99 |
| com.prestigelife.gems_pack_2 | gems | 75 | $1.99 |
| com.prestigelife.gems_pack_3 | gems | 300 | $4.99 |
| com.prestigelife.gems_pack_4 | gems | 750 | $9.99 |

Not: Satın alınan money miktarı prestige puanına göre dinamik ölçekleniyor — açıklamada sabit miktar yazılmadı.

## Current Architecture Notes

### Prestige / Reset Sistemi
- `reset_prestige_bonus` (PlayerProfile) — her reset'te birikir, silinmez
- `bonus_prestige_points` = quest prestige + reset_prestige_bonus
- `syncQuestPrestige()` her ikisini birleştirerek profile'a yazar

### Boost Sistemi
- `business_boost_expires_at`, `investment_boost_expires_at`, `income_boost_expires_at` — PlayerProfile'da
- `useBoosts` hook — expiry parse, multiplier, countdown
- `activateBoost('business'|'investment'|'total')` — 1 saatlik expiry set eder
- `incomePerSecond` boost'lu hesaplanır, `boostedHourlyIncome` Header'a geçilir

### RevenueCat
- SDK kuruldu: `@revenuecat/purchases-capacitor@13.1.1`
- `revenueCatService.ts` — initialize, getOfferings, purchaseProduct
- API key'ler env'den: `VITE_REVENUECAT_API_KEY_IOS`, `VITE_REVENUECAT_API_KEY_ANDROID`
- Şu an placeholder (`appl_xxxx`, `goog_xxxx`) — RevenueCat hesabı açılınca gerçek key girilecek

### AdMob
- `isTesting`: `.env.local`'de `true`, `.env.production`'da `false`
- Test cihazı ID'si: `VITE_ADMOB_TEST_DEVICE_IDS` env değişkeni

### Ses Sistemi
- `audioService.ts` — Howler.js, lazy init (AudioContext policy)
- Modal açılınca müzik %75'e duck eder
- Settings modal'dan ses/müzik toggle + volume slider

### IAP Akışı
- `purchasePackage()` → native: RevenueCat, web: mock
- `PACKAGE_ID_TO_PRODUCT_ID` mapping — ShopModal local ID → Store product ID
- Webhook: `supabase/functions/revenuecat-webhook` — deploy bekliyor

## What Still Needs Work

### Yayın Bloklayıcılar
1. **RevenueCat hesabı** — hesap aç, ürünleri import et, API key'leri al
2. **Edge Function deploy** — `npx supabase functions deploy revenuecat-webhook`
3. **Play Store yayın süreci** — store listing, ekran görüntüleri, gizlilik politikası
4. **iOS geliştirici hesabı** — sonraya bırakıldı

### Önemli Eksikler
5. **Onboarding** — ilk açılışta mini tutorial yok
6. **Push notification** — "Daily reward hazır" bildirimleri
7. **Stocks / investment 3. sekme** — placeholder kilitli
8. **Manager job kategorisi** — placeholder, gerçek içerik yok

### Teknik Borç
9. `useGameState.ts` ~529 satır (makul, refactor öncelikli değil)
10. AdMob test mode — production build'de otomatik kapanıyor
11. Supabase legacy remnant cleanup
