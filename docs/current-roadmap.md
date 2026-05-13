# Current Roadmap

Last updated: 2026-05-14

## Done

- Local-first auth ve profile bootstrap
- Worker (20) + Specialist (20) + Manager (20) jobs — 60 job, tam veri seti
- Chapter tabanlı quest sistemi — 100 static + generated job quest'leri
- Quest balance turu — quest-90 düzeltildi ($100K→$20K)
- Daily reward / collect earnings / ad reward
- Bank deposits / cashback / premium bank card
- Health ve happiness sistemi — modals, wellbeing factors, offline decay
- Premium cars (3 adet, gem ile)
- Premium houses (3 adet, gem ile)
- Stuff modal — araç/ev/karakter/outfit
- Business progression (40 işletme, max level 6)
- Real estate investments (50 mülk, 5 upgrade, 50 görsel)
- Prestige/reset loop — quest bazlı prestige, reset_prestige_bonus
- Global Leaderboard — Supabase, top 100, kendi sıra, 3dk sync
- Outfit isimleri — Bare Basics → Elite
- Geçici boost sistemi — Business/Investment/Total Income 2× (reklam, 1 saat)
- Gem ekonomisi analizi — reset'te gem korunuyor, fiyatlar dengelendi
- Ses/müzik sistemi — Howler.js, lazy init, modal ducking, settings
- InsufficientFundsModal — para yetersizse Shop'a yönlendirme
- AdMob production entegrasyonu — gerçek ID'ler, env bazlı isTesting
- RevenueCat SDK — @revenuecat/purchases-capacitor kuruldu, servis yazıldı
- Paket adı — com.prestigelife.idletycoon
- IAP ürünleri — 8 ürün Play Console'da tanımlı
- Responsive tasarım — karakter/araç boyutları genişlik+yükseklik bazlı
- BottomNav — max genişlik, sabit yükseklik, kapsül tasarım
- Health/Happiness bug fix — updateProfile stale write sorunu giderildi
- Araç görseli bug fix — ilk yüklemede görünmeme sorunu giderildi

## In Progress

1. **RevenueCat hesabı** — hesap aç, ürünleri import et, Android/iOS API key'leri al
2. **Play Store yayın süreci** — store listing tamamlanacak, yayına alınacak

## Next

1. Onboarding — ilk açılışta 3-4 adımlık mini tutorial
2. Push notification — Capacitor LocalNotifications ile daily reward bildirimi
3. Edge Function deploy — `npx supabase functions deploy revenuecat-webhook`
4. iOS geliştirici hesabı + App Store süreci

## Later

1. Stocks / investment 3. sekme — placeholder kilitli
2. Manager job kategorisi — gerçek içerik yok
3. Supabase legacy remnant cleanup

## Risks / Debt

- RevenueCat API key'leri henüz placeholder — native IAP çalışmıyor
- iOS geliştirici hesabı açılmadı
- Edge Function deploy edilmedi — webhook çalışmıyor
- Push notification yok — retention fırsatı kaçıyor

## When Starting a New Session

Öncelikle şu dosyaları oku:
- [session-handoff.md](./session-handoff.md)
- [current-roadmap.md](./current-roadmap.md)
