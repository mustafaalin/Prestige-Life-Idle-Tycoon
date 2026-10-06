# Prestige Life v2 — Yeniden Yapım Planı

Son güncelleme: 2026-10-07 · Dal: `v2-rebuild` · Tasarım: [game-design-v2.md](./game-design-v2.md)

## Amaç

Oyunu oynaması keyifli ve oyuncuyu her gün geri getiren bir idle hayat simülasyonuna dönüştürmek. Ölçülebilir hedef: kapalı testte D1 ≥ %35, D7 ≥ %12, D30 ≥ %5.

## İlkeler

1. **Önce his, sonra içerik.** Her faz, oyuncunun hissedeceği bir şeyi bitirir ve gerçek insanlarla test edilir.
2. **Ekonomi kodla değil veriyle değişir.** Denge değerleri `src/game/core/config/` içinde; her değişiklik `npm run sim` ile kontrol edilir.
3. **v1 bozulmaz.** v2 ayrı klasörde (`src/game/`) ve ayrı uygulama kökünde (`AppV2`) büyür. v1, v2 onu tamamen karşılayana kadar (Faz 2 sonu) yerinde kalır.
4. **Kapı geçilmeden sonraki faza geçilmez.** Hedef tutmazsa önce düzelt.
5. **Çok dilli baştan.** Oyun Türkçe ve İngilizce çıkar, sonra başka diller eklenir. v2'de ekrana yazılan her metin `src/game/i18n/` üzerinden gelir; sabit metin yazılmaz. Yeni ekran = `en` + `tr` metinleri birlikte.

## Mimari

```
src/game/
  core/            Saf TypeScript ekonomi çekirdeği (React yok, depolama yok)
    config/        Denge verisi: işletmeler, kariyer, sınıflar, statü eşyaları, sabitler
    formulas.ts    Fiyat, gelir, çarpan, miras formülleri
    state.ts       Saf durum geçişleri (satın al, terfi, emekli ol...)
    format.ts      $1.23M biçimlendirme, süre biçimlendirme
  sim/             Dengeleme botu ve tempo hedefleri
  runtime/         Tick döngüsü, kayıt, çevrimdışı hesap, React hook'u
    engine.ts      Saf zaman motoru: döngü çubukları, ödemeler, çevrimdışı (zaman parametre olarak gelir)
    storage.ts     `prestige_life_v2` kaydı, bozuk/eski kayıtları normalleştirme
    store.ts       Canlı oyun: 250 ms tick, otomatik kayıt, ön/arka plan, olaylar (payout, classUp)
    GameV2Provider.tsx + useGameV2.ts   React bağlantısı (useSyncExternalStore)
  i18n/            Diller: messages/<dil>.ts (arayüz), content/<dil>.ts (içerik adları), sayı biçimi
  ui/              v2 ekranları ve bileşenleri
  AppV2.tsx        v2 kökü (VITE_GAME_V2=true)
scripts/sim-economy.ts   `npm run sim` giriş noktası
```

Aynı formülleri hem oyun hem simülatör kullanır, bu yüzden simülasyon sonucu oyunda ne olacağını gösterir.

---

## Faz 0 — Temel ve ölçüm ✅ (bu oturum)

- [x] `v2-rebuild` dalı
- [x] Ekonomi çekirdeği: işletmeler, yöneticiler, kariyer, statü eşyaları, sınıflar, miras (`src/game/core/`)
- [x] Dengeleme simülatörü: optimal bot, 2 oyuncu profili, 30 gün, 8 tempo hedefi (`npm run sim`)
- [x] Ekonomi ayarı: 8/8 hedef tutuyor (sonuçlar: tasarım belgesi §5)
- [x] Tasarım belgesi v2
- [ ] **Senin işin:** Firebase projesi aç (Analytics + Remote Config + Crashlytics), `google-services.json` dosyasını hazırla. Faz 1'de analitiği bağlamak için gerekli.
- [ ] **Senin işin:** Test kullanıcısı listesi toplamaya başla (hedef 20–50 kişi; Google Play için en az 12'si 14 gün kesintisiz kalmalı).

---

## Faz 1 — Dikey dilim: "Sokaktan Milyonere" (hayati, ~3 hafta)

**Amaç:** İlk 30 dakikayı bitmiş bir oyun kalitesinde yapmak ve oyuncuyla doğrulamak. Bu faz başarısızsa geri kalanı yapmanın anlamı yok.

### 1A. Çalışan oyun (1. hafta)

- [x] **1.1 Runtime:** `useGameV2` hook'u. 250 ms'lik tick, işletme döngü ilerlemesi (ekranda dolan çubuklar), satın alma eylemleri, yerel kayıt (`prestige_life_v2` anahtarı, otomatik kayıt), uygulama ön plana gelince çevrimdışı hesap.
  - Yöneticisiz işletme: dokununca tek döngü çalışır (AdCap modeli); yöneticili döngü kendi kendine döner. Ödeme döngü sonunda toplu gelir.
  - Çevrimdışı: `visibilitychange` ile; arka planda tick çalışmaz. 60 sn altı sessizce eklenir, üstü `offline` bekleyen ödül olur (`claimOffline(×2)`). 10 sn'den uzun tick boşluğu da çevrimdışı sayılır. Elle başlatılmış döngü uzaktayken de tamamlanır.
  - Çekirdeğe `cycleRevenue` ve `offlineEarnings` eklendi; simülatör de `offlineEarnings` kullanıyor (sim sonucu değişmedi).
  - Geliştirici eylemleri hazır: `actions.dev.setSpeed/addCash/reset` (menüsü 1.2'de).
- [x] **1.2 Uygulama kökü:** `VITE_GAME_V2=true` ise `AppV2` açılır, değilse v1. Geliştirici menüsü: hız ×10, kaydı sıfırla, para ekle (oyun testi için).
  - `npm run dev:v2` / `build:v2` / `cap:sync:v2` (`.env.v2` modu). `main.tsx` sadece seçilen kökü yükler; v2 build'inde v1 kodu yok.
  - Geliştirici menüsü (`npm run dev` ve `VITE_DEV_MENU=true` build'leri): hız ×1/×10/×100, para ekle, "uzakta kal" (5 dk / 1 sa / 3 sa), dil, kaydı sıfırla (iki dokunuşla).
  - i18n: `I18nProvider` + `useT()` (`t`, `name`, `money`, `duration`). Türkçe tam: arayüz + 94 içerik adı. Dil: kayıtlı seçim → cihaz dili → İngilizce. Türkçe sayı biçimi: `$1,23 Mn`, `$12,5 Bin`, `1sa 30dk`.
  - Geçici ana ekran (`ui/HomeShell.tsx`): para, gelir/sn, sınıf ilerlemesi, dokunma, çevrimdışı ödül. 1.3–1.13 ile parça parça değişecek.
- [x] **1.3 İşletmeler ekranı:** Liste, döngü çubukları, ×1 / ×10 / Max alım, sonraki kilometre taşı göstergesi ("25'e 3 kaldı → ×2"), yönetici satın alma, yöneticisiz işletmeye dokunarak döngü başlatma.
  - `ui/businesses/`: kademeli açılma (sahip olunanlar + sıradaki + kilitli bir önizleme), döngü çubuğu tick'ler arasında `requestAnimationFrame` ile akıcı dolar (React yeniden çizmeden), 0,5 sn'den hızlı döngüler dolu ve nabız atan çubuk.
  - Boşta duran yöneticisiz işletme amber halka ile "dokun" der. Ses ve efektler 1.11'de.
  - Not: üst bardaki gelir/sn yöneticisiz işletmeleri %60 verimle sayar (simülatörle aynı tahmin); oyuncu dokunmazsa gerçek gelir daha düşük. Oyun testinde kafa karıştırırsa sadece çalışan gelir gösterilecek.
- [x] **1.4 Kariyer ekranı:** Mevcut iş, sonraki terfi kartı (fiyat, maaş, bonus).
  - `ui/career/CareerScreen.tsx`: mevcut iş (maaş, toplam bonus), öne çıkan terfi kartı (gelirdeki toplam artış, maaş, bonus, "~2dk sonra alabilirsin"), 12 basamaklık kariyer merdiveni.
  - `ui/TabBar.tsx`: alt sekmeler (İşletmeler / Kariyer / Alışveriş-yakında). Terfi alınabilirken Kariyer sekmesinde kırmızı nokta.
- [ ] **1.5 Alışveriş ekranı:** Ev, araç, kıyafet. Satın alınca sahne anında değişir.

### 1B. His ve sahne (2. hafta)

- [ ] **1.6 Sahne sistemi:** Tek zemin çizgisi (ev başına `groundY`), gerçek ölçekli araçlar (gerçek boy metadata), temas gölgesi, tam opak arka plan + üst/alt gradyan. Görsel normalizasyon scripti (şeffaf kenar kırpma, hizalama).
- [ ] **1.7 HUD:** Saniyede birkaç kez akan para sayacı, gelir/sn, sınıf ilerleme çubuğu ("Millionaire'a %62").
- [ ] **1.8 Hayaller panosu:** Ekranda her zaman sıradaki 3 hayal (en ucuz alınmamış ev/araç/kıyafet), ilerleme yüzdesiyle.
- [ ] **1.9 Para akışı efekti:** Döngü bitince işletmeden uçan "+$1.2K", dokununca para parçacıkları, sayaç büyüyüp renk değiştirme.
- [ ] **1.10 Sınıf atlama töreni:** Tam ekran: eski sahne çıkar, yenisi gelir, konfeti, ses, haptik, "Before / Now" kartı.
- [ ] **1.11 Juice paketi:** Her satın almada efekt ve ses, haptik (`@capacitor/haptics`), basma geri bildirimleri.

### 1C. İlk izlenim ve ölçüm (3. hafta)

- [ ] **1.12 Onboarding:** İlk 3 dakika parmak işaretiyle yönlendirme (dokun → Flower Stand al → işe gir → yönetici). Metin minimum.
- [ ] **1.13 Çevrimdışı kazanç modalı v2:** Gelire oranlı, reklamla ×2, sade.
- [ ] **1.14 Analitik:** Firebase Analytics sarmalayıcı (web'de no-op). Olaylar: `session_start`, `tutorial_step`, `business_buy`, `manager_hire`, `promotion`, `lifestyle_buy`, `class_up`, `offline_claim`, `ad_watch`, `screen_view`.
- [ ] **1.15 Oyun testi paketi:** Kapalı test sürümü, 5 soruluk kısa anket, test notları şablonu.

### Faz 1 kapısı

20–50 kişilik oyun testi:

- İlk oturum medyanı ≥ 15 dakika
- İlk oturumda Milyoner olanlar ≥ %60
- Ertesi gün geri gelenler ≥ %35
- "En sevdiğin an" sorusunda sınıf töreni veya para akışı çıkmalı

---

## Faz 2 — Geri getiren döngüler (hayati, ~4 hafta)

**Amaç:** Oyuncunun 1., 7. ve 30. gün geri gelmesi için sebep yaratmak.

- [ ] **2.1 Hanedan ekranı:** Emeklilik akışı (ne kazanacağını göster, tören), miras puanı, soy ağacı.
- [ ] **2.2 Yadigarlar:** Miras puanıyla alınan kalıcı yetenekler (çevrimdışı tavanı +1 sa, başlangıç parası, yönetici indirimi...).
- [ ] **2.3 Nesil içeriği:** Her nesil yeni bir şey açsın (yeni şehir + yeni işletme kademeleri; kullanılmayan 30 işletme görseli). Simülatöre eklenip 30 günlük tempo yeniden ayarlanacak.
- [ ] **2.4 Olay kartları:** Kart motoru + sınıfa göre değişen 60 kart (risk, duygu, mizah). Günde 3–5 kart.
- [ ] **2.5 Yatırımlar:** Emlak (kira geliri) ve basit borsa (risk anları).
- [ ] **2.6 Lüks oyuncaklar sahnede:** Jet gökyüzünden geçer, helikopter süzülür, yat sahil evlerinde görünür; ayrıca Garaj/Marina koleksiyon ekranı.
- [ ] **2.7 Günlük döngü:** Gelire oranlı günlük ödül serisi, 3 günlük görev.
- [ ] **2.8 Bildirimler:** Yerel bildirim: "Kasan doldu", "Emekli olabilirsin", "Günlük ödül hazır".
- [ ] **2.9 Monetizasyon v2:** Ödüllü reklam yerleri (çevrimdışı ×2, 4 saatlik ×2 hız, olay kartında ikinci şans), "Golden Spoon" paketi (reklamsız + kalıcı ×2), başlangıç paketi, gem harcama noktaları. RevenueCat ürünleri güncellenir.
- [ ] **2.10 Remote Config:** Denge değerlerini güncelleme yayınlamadan değiştirebilmek.
- [ ] **2.11 v1'in kaldırılması:** Banka, sağlık/mutluluk, v1 görevleri, claim sistemi, Supabase senkronu. Eski oyunculara hoş geldin hediyesi.

### Faz 2 kapısı

Google Play kapalı testi (≥ 12 kişi, 14 gün):

- D1 ≥ %35, D7 ≥ %12
- Günlük oturum ≥ 4
- Çökme oranı < %1

---

## Faz 3 — Soft launch ve denge (~4 hafta)

- [ ] 1–2 pazarda yayın, küçük reklam bütçesi
- [ ] Remote Config ile denge turları, A/B testleri (fiyatlar, reklam yerleri)
- [ ] Mağaza sayfası, ekran görüntüleri, "sokaktan milyonere" önce/sonra videoları
- [ ] Before/Now paylaşım kartı (TikTok/Instagram)

**Kapı:** D30 ≥ %5 ve oyuncu başına gelir > oyuncu edinme maliyeti → büyüt.

## Faz 4 — Canlı operasyon (Ocak 2027 →)

- [ ] Haftalık etkinlikler (ayrı mini ekonomi, 3–5 gün)
- [ ] Etkinlik geçişi (ücretli ödül hattı)
- [ ] Karakter sevinç animasyonu: pozdan poza yöntemi (B seçeneği)
- [ ] Global lansman, yeni içerik takvimi

---

## Nasıl çalışıyoruz

- Her görev ayrı bir commit; faz bitince `docs/session-handoff.md` ve bu dosya güncellenir.
- Denge değiştiren her commit'te `npm run sim` çıktısı commit mesajına özetlenir.
- Doğrulama: `npm run typecheck` + yeni kod için lint + `npm run sim` + gerçek cihazda oynama.
