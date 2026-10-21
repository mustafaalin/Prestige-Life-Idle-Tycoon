# Prestige Life v2 — Yeniden Yapım Planı

Son güncelleme: 2026-10-21 · Dal: `v2-rebuild` · Rapor (neden): [report-v2.md](./report-v2.md) · Tasarım: [game-design-v2.md](./game-design-v2.md) · Hikâye: [story-v2.md](./story-v2.md) · Açık kararlar: [discussion-notes.md](./discussion-notes.md)

## Amaç

Oynaması keyifli ve oyuncuyu her gün geri getiren bir idle hayat simülasyonu. Ölçülebilir hedef: D1 ≥ %35, D7 ≥ %12, D30 ≥ %5.

## İlkeler

1. **Önce his, sonra içerik.** Her faz oyuncunun hissedeceği bir şeyi bitirir ve gerçek insanlarla denenir.
2. **Ekonomi kodla değil veriyle değişir.** Denge değerleri `src/game/core/config/`'te; her değişiklik `npm run sim` ile kontrol edilir.
3. **v1 bozulmaz.** v2 ayrı klasörde (`src/game/`) ve ayrı uygulama kökünde (`AppV2`); v1 Faz 2.11'de kalkar.
4. **Kapı geçilmeden sonraki faza geçilmez.** Hedef tutmazsa önce düzelt.
5. **Çok dilli baştan.** Ekrana yazılan her metin `src/game/i18n/` üzerinden, `en` + `tr` birlikte.
6. **Mobil öncelikli.** Önce Google Play, sonra App Store; web yalnız geliştirme için. Kayıt Preferences'ta, geri tuşu, güvenli alanlar, 44–48 px dokunma alanı, hover yok, düşük seviye Android'de akıcı. Doğrulama gerçek cihazda.
7. **Kayıtlar korunur.** Yayından sonra hiçbir güncelleme oyuncunun kaydını bozmaz ([session-handoff.md](./session-handoff.md) "Kurallar").
8. **Belgeler bağlayıcı ama değişmez değil.** Daha iyi bir fikir çıkarsa kullanıcıyla konuşulur, belge güncellenir.

## Mimari

```
src/game/
  core/            Saf TypeScript çekirdek (React ve depolama yok); simülatör de bunu oynar
    config/        Denge verisi: işletmeler, meslekler, kurslar, eşyalar, evler, sınıflar, ömür, hedefler, reklamlar, içerik bayrakları...
    economy/       Sistem başına modül: business, career, income, multipliers, legacy, manual
    requirements.ts  Ortak şart sistemi (meslek, kurs, işletme)
    formulas.ts, state.ts, format.ts
  sim/             Dengeleme botu, tempo ve his hedefleri (`npm run sim`)
  runtime/         Canlı oyun: store (tick, kayıt, olaylar), engine, storage, story, ads + adRewards, iap + purchases,
                   daily, investment, notifications, analytics, review, city (Lumen kaplaması), feedback (ses, haptik), backButton
  i18n/            messages/<dil>.ts (arayüz), content/<dil>.ts (içerik adları), sayı biçimi
  ui/              home, scene, story, events, guide, businesses, career, shop, invest, richList, family, ads; kit.tsx, DevMenu.tsx
  AppV2.tsx        v2 kökü (VITE_GAME_V2=true)
```

Kod yapısı kuralları: [game-design-v2.md §7](./game-design-v2.md).

---

## Faz 0 — Temel ve ölçüm ✅

Ekonomi çekirdeği, simülatör, tasarım belgesi, Firebase projesi ve Analytics.

- [x] **Crashlytics** (2026-10-21): yerel çökmeler, JS hataları ölümcül olmayan rapor, çizilemeyen ekranda "Oyunu yeniden başlat" (`runtime/crashReports.ts`, `ui/CrashScreen.tsx`); DEV menüsünde deneme çökmesi. iOS'ta dSYM yüklemesi iOS sürümüyle.
- [ ] **Kullanıcı:** test kullanıcısı listesi (20–50 kişi); Remote Config (2.10).

## Faz 1 — Dikey dilim ✅ (oyuncu testi kaldı)

Yapıldı (2026-10-08 → 15); ayrıntılar tasarım ve hikâye belgelerinde:

- **Çalışan oyun:** 250 ms tick, kayıt (Preferences), çevrimdışı hesap, `AppV2` kökü, DEV menüsü, i18n (TR/EN), Android geri tuşu, güvenli alanlar, `npm run phone`.
- **Ekranlar:** işletmeler, kariyer, alışveriş, üst bar, alt menü, sekme sayfaları, Ayarlar, gelir dökümü, hayaller panosu, hedef rozeti.
- **Sahne:** oturulan ev ve önünde araç, kahramanın pozları (7 kıyafet, 60+ dede), Şans ve tasmaları, yerden toplama, para uçuşu.
- **Hikâye:** önsöz, sınıf törenleri, annenin mesajları, Rıza Amca rehberi, hayat anları, lüks anları, olay kartları, Zenginler Listesi, aile albümü.
- **Diğer:** yaş ve ömür, konut (kirala → satın al → kiraya ver), bildirimler, analitik, IAP 1. adım, tasmaların bonusu, puanlama penceresi, ses ve müzik, yalnız dikey ekran.

Kalan:

- [ ] **1.15 Oyuncu testi:** 6–8 tanıdıkla gözlem ve 7 günlük günlük ([discussion-notes.md §2](./discussion-notes.md)); kapalı test verisi çoğunlukla kullanıcının hesapları.
- [ ] **His parçaları:** yağmur ve ortam sesi, işletmeden uçan "+$1.2K", paranın fiziksel hâli (cüzdan → kasa → altın oda), araç gölgesi, ev başına telefonda son ayar.

**Faz 1 kapısı** (oyuncu testi): ilk oturum medyanı ≥ 15 dk; ertesi gün dönen ≥ %35; "en sevdiğin an"da tören ya da para akışı. "İlk oturumda Orta Sınıf ≥ %60" maddesi yeni tempoda yeniden yazılacak ([discussion-notes.md §4](./discussion-notes.md)).

---

## Faz E — Ekonominin yeniden kurulması (lansmandan önce; karar 2026-10-20, kullanıcı)

Lansman = 1. nesil; 2. ve 3. nesil yayından sonra; Burak hikâyesi kalktı; 80'de kahraman kalır. Kararların ve yapılanların kaydı: [archive/economy-rebuild.md](./archive/economy-rebuild.md).

- [x] **E1 Çekirdek:** `core/economy/` modülleri, ortak şart sistemi, işletme seviye + şube, kayıt şeması 2, yaşa bağlı tempo hedefleri.
- [x] **E2 Sayılar:** 14 işletme, gerçek maaş ve fiyatlar, eşya ve meslek bonusu yok, çevrimdışı %20 / 1 sa.
- [x] **E3 Arayüz:** işletme kartı (seviye noktaları, "büyüdü!" kartı, takvimle geri dönüş, şube), 36 görsel (2026-10-21).
- [x] **E4 Meslekler:** 63 meslek, 16 kurs, 4 eşya, iş panosu, 55 ikon (2026-10-21).
- [x] **E7 Meslek ağacı** (karar 2026-10-21, [career-redesign.md](./career-redesign.md)): ✅ 1. adım: 104 meslek, 15 satır, ustalık, yıllık zam, 8 yeni kurs, yeni şart türleri (araç, yöneticili işletme), deneyim reklamı işte bir kez, simülatör raporu. ✅ 2. sekmeli ağaç ekranı, şart penceresi, Kurslar sekmesi, ustalık halkası. ✅ İkinci düzen: satırda 2 iş, sekmeler sırayla, ustalık 3–8 ay, yıllık zam yok. ✅ 3. iş değişimi şovu ve "Usta oldun!" şeridi. ✅ 4. 41 yeni meslek ikonu (komutlar [archive/art-prompts-careers.md](./archive/art-prompts-careers.md); kurslar ve sekmeler kod simgesi kullanır).
- [x] **E5 Lansman kapsamı:** içerik bayrakları (`config/content.ts`), Burak hikâyesi oynamaz, 80'de "Torununun hikâyesi yakında", Aile sekmesi ve miras gizli.
- [~] **E6 Bütünleme:** ✅ ödül tutarları ölçüldü, tasarım belgesi yeniden yazıldı, 19 ödüllü reklam yeri, belgeler sadeleşti, AAB 30 (2026-10-21). Kalan: telefonda test ve bulgular → lansman.

---

## Faz 2 — Geri getiren döngüler

- [x] **2.5 Yatırımlar:** Rıza Amca'nın fırsatları (1 / 4 / 8 sa vade).
- [x] **2.8 Bildirimler:** annenin mesajı, kasa doldu, günlük ödül hazır; günde en fazla bir.
- [~] **2.4 Olay kartları:** 50 kart oyunda (2026-10-21: üç tür, yönetici başına üç kart işletmenin görünümüne bağlı, deste düzeni). Kalan: iş teklifleri önerisi ([discussion-notes.md §2](./discussion-notes.md)).
- [~] **2.7 Günlük döngü:** günlük ödül oyunda. Kalan: günlük görevler (oynanış keyifli görülürse).
- [~] **2.9 Monetizasyon:** reklam altyapısı, 19 reklam yeri, IAP 1. adım oyunda ([monetization-v2.md](./monetization-v2.md)). Kalan: IAP 2. adım (Yakut Tasma $4,99, Gece Vardiyası $3,99 yeni çevrimdışına göre), v1'in 8 ürünü pasifleşir.
- [ ] **2.6 Lüks oyuncaklar sahnede:** jet, helikopter, yat, tekne.
- [ ] **2.10 Remote Config:** denge değerlerini güncellemesiz değiştirmek.
- [ ] **2.11 v1'in kaldırılması:** banka, sağlık/mutluluk, v1 görevleri, Supabase senkronu; eski oyunculara hoş geldin hediyesi.
- [ ] **2.13 Google Play Games başarımları (sonra):** 15–20 başarım, kesin tetiklerden; kendi yerel köprümüz (Capacitor 8 için hazır eklenti yok). Konsol adımları: [Play Games Services kurulumu](https://developer.android.com/games/pgs/console/setup), [başarım kuralları](https://developer.android.com/games/pgs/achievements).
- [ ] **2. nesil (yayından sonra; eski 2.1, 2.2, 2.3, 2.12):** devir (torun her şeyle devam eder), mirasın sıfırlamasız anlamı, Ada, Lumen (14 işletmeye göre), 2. neslin törenleri ve rehberi. Kodda duranlar: yadigârlar, Aile sekmesi, devir anları, Lumen kaplaması, dede görünümü ([game-design-v2.md §4.10](./game-design-v2.md), [discussion-notes.md §6](./discussion-notes.md)).

**Faz 2 kapısı** (kapalı test, ≥ 12 kişi, 14 gün): D1 ≥ %35, D7 ≥ %12, günlük oturum ≥ 4, çökme < %1.

---

## Faz 3 — Soft launch ve denge (~4 hafta)

- [ ] 1–2 pazarda yayın, küçük reklam bütçesi
- [ ] Remote Config ile denge turları, A/B testleri (fiyatlar, reklam yerleri)
- [ ] Mağaza sayfası, ekran görüntüleri, "sokaktan milyonere" videoları; Before/Now paylaşım kartı

**Kapı:** D30 ≥ %5 ve oyuncu başına gelir > oyuncu edinme maliyeti → büyüt.

## Faz 4 — Canlı operasyon (Ocak 2027 →)

- [ ] Haftalık etkinlikler (ayrı mini ekonomi, 3–5 gün), etkinlik geçişi, global lansman, içerik takvimi

---

## Nasıl çalışıyoruz

- Her görev ayrı bir commit; iş bitince `session-handoff.md` ve bu dosya güncellenir. Belgeler güncel duruma göre yeniden yazılır, günlük gibi uzatılmaz.
- Denge değiştiren her commit'te `npm run sim` sonucu commit mesajında özetlenir.
- Doğrulama: `npm run typecheck` + `npx eslint src/game` + `npm run sim` + gerçek cihazda oynama.
