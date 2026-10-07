# Prestige Life v2 — Yeniden Yapım Planı

Son güncelleme: 2026-10-08 · Dal: `v2-rebuild` · Rapor (neden): [report-v2.md](./report-v2.md) · Tasarım: [game-design-v2.md](./game-design-v2.md) · Hikaye: [story-v2.md](./story-v2.md) · Açık kararlar: [discussion-notes.md](./discussion-notes.md)

## Amaç

Oyunu oynaması keyifli ve oyuncuyu her gün geri getiren bir idle hayat simülasyonuna dönüştürmek. Ölçülebilir hedef: kapalı testte D1 ≥ %35, D7 ≥ %12, D30 ≥ %5.

## İlkeler

1. **Önce his, sonra içerik.** Her faz, oyuncunun hissedeceği bir şeyi bitirir ve gerçek insanlarla test edilir.
2. **Ekonomi kodla değil veriyle değişir.** Denge değerleri `src/game/core/config/` içinde; her değişiklik `npm run sim` ile kontrol edilir.
3. **v1 bozulmaz.** v2 ayrı klasörde (`src/game/`) ve ayrı uygulama kökünde (`AppV2`) büyür. v1, v2 onu tamamen karşılayana kadar (Faz 2 sonu) yerinde kalır.
4. **Kapı geçilmeden sonraki faza geçilmez.** Hedef tutmazsa önce düzelt.
5. **Çok dilli baştan.** Oyun Türkçe ve İngilizce çıkar, sonra başka diller eklenir. v2'de ekrana yazılan her metin `src/game/i18n/` üzerinden gelir; sabit metin yazılmaz. Yeni ekran = `en` + `tr` metinleri birlikte.
6. **Mobil öncelikli.** Oyun yerel uygulama olarak önce Google Play'de, sonra iOS App Store'da yayınlanır; web sürümü sadece geliştirme içindir. Kod telefona göre yazılır: kayıt `@capacitor/preferences`'ta, Android geri tuşu ve uygulama duraklat/devam olayları ele alınır, güvenli alan payları (`var(--safe-top)` / `var(--safe-bottom)`, `src/game/mobile.css`), en az 44–48 px dokunma alanı, üzerine gelme (hover) gerektiren arayüz yok, düşük seviye Android'de akıcı animasyon, küçük görseller. Doğrulama gerçek cihazda yapılır.
7. **Belgeler bağlayıcı ama değişmez değil.** Rapor, tasarım ve plan kararlarına uyulur; daha iyi bir fikir çıkarsa kullanıcıyla konuşulur ve belge güncellenir.

## Mimari

```
src/game/
  core/            Saf TypeScript ekonomi çekirdeği (React yok, depolama yok)
    config/        Denge verisi: işletmeler, kariyer, sınıflar, statü eşyaları, evler, sabitler
    formulas.ts    Fiyat, gelir, çarpan, miras formülleri
    state.ts       Saf durum geçişleri (satın al, terfi, emekli ol...)
    format.ts      $1.23M biçimlendirme, süre biçimlendirme
  sim/             Dengeleme botu ve tempo hedefleri
  runtime/         Tick döngüsü, kayıt, çevrimdışı hesap, React hook'u
    engine.ts      Saf zaman motoru: döngü çubukları, ödemeler, çevrimdışı (zaman parametre olarak gelir)
    storage.ts     `prestige_life_v2` kaydı (telefonda Preferences, web'de localStorage), bozuk/eski kayıtları normalleştirme
    backButton.ts  Android geri tuşu: açık katmanlar (sekme, sayfa, modal) z-index sırasıyla kapanır
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
  - Üst bar ve "~X sonra alabilirsin" tahminleri sadece otomatik geliri gösterir (`autoIncomePerSecond`: yönetici, maaş, kira); 2026-10-08'de değişti, önceden yöneticisizleri %60 sayıp şişik gösteriyordu.
- [x] **1.4 Kariyer ekranı:** Mevcut iş, sonraki terfi kartı (fiyat, maaş, bonus).
  - `ui/career/CareerScreen.tsx`: mevcut iş (maaş, toplam bonus), öne çıkan terfi kartı (gelirdeki toplam artış, maaş, bonus, "~2dk sonra alabilirsin"), 12 basamaklık kariyer merdiveni.
  - `ui/TabBar.tsx`: alt sekmeler (İşletmeler / Kariyer / Alışveriş-yakında). Terfi alınabilirken Kariyer sekmesinde kırmızı nokta.
- [x] **1.5 Alışveriş ekranı:** Ev, araç, kıyafet. Satın alınca sahne anında değişir.
  - `ui/shop/ShopScreen.tsx`: Evler / Araçlar / Kıyafetler / Lüks. Eşyalar sırayla alınır: her kategoride tek "Sıradaki hayal" kartı (bonus, fiyat, "~X sonra alabilirsin"), 3 kilitli önizleme, koleksiyon ızgarası. Alınabilir kategori ve Alışveriş sekmesinde kırmızı nokta.
  - `ui/shop/ScenePreview.tsx`: geçici mini sahne (en iyi ev + kıyafet + araç); alımda anında değişir. 1.6'da gerçek sahneyle değişecek.
  - Çekirdek: `nextLifestyle`, `bestOwnedLifestyle`, `canBuyAnyLifestyle`, `LIFESTYLE_KINDS` (simülatör de bunları kullanıyor; sim sonucu değişmedi).

### 1B. His ve sahne (2. hafta)

- [x] **1.M Mobil temel:** Oyunun telefonda doğru çalışması için altyapı (ilke 6).
  - Kayıt `@capacitor/preferences`'ta (Android SharedPreferences, iOS UserDefaults); işletim sistemi WebView'in localStorage'ını silebilir. localStorage kopyası web yedeği; açılışta ikisinden yenisi okunur. Açılış kaydı okuyana kadar splash ekranı kalır.
  - Android geri tuşu (`@capacitor/app`): en üstteki katmanı kapatır (geliştirici menüsü → çevrimdışı ödül = topla → başka sekme = ana sekme); açık katman yoksa uygulama kapanmaz, arka plana gider.
  - Uygulama duraklat/devam olayları da kaydı ve çevrimdışı hesabı tetikler (`visibilitychange`'e ek).
  - `viewport-fit=cover` sadece v2 build'inde (`vite.config.ts`); güvenli alan için `var(--safe-top/bottom)`: Android 15+ için Capacitor 8'in enjekte ettiği değerler, diğerlerinde `env()`.
  - Açık: dil seçimi hâlâ localStorage'da (silinirse cihaz diline döner); ayarlar ekranı gelince Preferences'a taşınır.

- [ ] **1.6 Sahne sistemi:** Dış mekân sahnesi ana ekranın esas yüzeyi; kirli ara sokakta başlar. Katmanlar: arka plan, dokunulabilir nesneler, kahraman, Şans, ön plan, arayüz. Sokakta şişe ve kutular rastgele belirir, dokununca çuvala uçar (+$, ses), yenisi çıkar; bugünkü "Dokun, kazan" düğmesinin yerini alır ([story-v2.md §4](./story-v2.md)). Kahraman pozu yaşam aşamasına göre değişir (yumuşak geçiş). Tek zemin çizgisi (ev başına `groundY`), gerçek ölçekli araçlar, temas gölgesi. Görsel normalizasyon scripti (şeffaf kenar kırpma, hizalama).
- [ ] **1.7 HUD:** Saniyede birkaç kez akan para sayacı, otomatik gelir, sınıf ilerleme çubuğu ("Millionaire'a %62"). Yaş göstergesi yaş/ömür kararına bağlı ([discussion-notes.md](./discussion-notes.md) §5). Rich Inc. dersi: ilerleme çubuğunun ucunda somut ödül görünsün. Paranın fiziksel hali sayacın yanında büyür: cüzdan → kasa → banka kasası → altın dolu oda (rapor §6.3).
- [ ] **1.8 Hayaller panosu:** Ekranda her zaman sıradaki 3 hayal (en ucuz alınmamış ev/araç/kıyafet), ilerleme yüzdesiyle. Hikaye hayalleri ve annenin evi merdiveni de girer ("Sıcak bir çorba", eski aile evi, konak; hikaye §5); fiyatları simülatöre eklenir.
- [ ] **1.9 Para akışı efekti:** Döngü bitince işletmeden uçan "+$1.2K", dokununca para parçacıkları, sayaç büyüyüp renk değiştirme.
- [ ] **1.10 Sınıf atlama töreni:** Tam ekran: eski sahne çıkar, yenisi gelir, konfeti, ses, haptik, "Before / Now" kartı. Her sınıfta hikaye kartı (hikaye §4: ilk sıcak yemek, annene ev, Bülent Bey'in şirketi...). İlk yönetici anı da küçük bir törenle verilir: "Artık param benim için çalışıyor" (Rıza Amca; rapor §7).
- [ ] **1.11 Juice paketi:** Her satın almada efekt ve ses, haptik (`@capacitor/haptics`), basma geri bildirimleri.

- [ ] **1.16 Hikaye görselleri (görsel roman):** [story-v2.md §8](./story-v2.md) listesi; karakter ve mekân görselleri sıfırdan (karar 2026-10-08). Önce karakter kılavuzu (ön/yan/arka görünüm + ifadeler), sonra her poz o kılavuz referans verilerek üretilir. Sanat stili denemesi: mevcut Pixar benzeri yarı 3D ile kalın konturlu düz çizgi film yan yana (kahraman 4 poz + 3 ifade, Şans, kirli sokak); kullanıcı telefonda seçer, sonra toplu üretim. Kodla zıplatma karakter animasyonu sayılmaz; gerçek animasyon sadece 2–3 büyük an için ve isteğe bağlı ([discussion-notes.md](./discussion-notes.md) §1). Özellikler görsel beklemez: 1.6–1.13 yer tutucuyla yapılır, görseller gelince değiştirilir.
- [x] **1.17 Konut modeli:** Kirala → satın al → kiraya ver ([game-design-v2.md §4.8](./game-design-v2.md)). Kiraya verme Faz 2.5'ten buraya çekildi (karar 2026-10-07): o olmadan ev satın almanın bir getirisi yoktu.
  - Çekirdek: `config/housing.ts` (evler artık statü eşyası değil), durumda `home` + `homesOwned`, `rentHome` / `buyHome` / `moveHome`, `homeBonus` (yaşanan evin kademesi) ve `rentPerSecond` (maaşla birlikte her saniye, çevrimdışı da).
  - Arayüz: `ui/shop/HousingPanel.tsx`: evin (Kiracısın / Senin etiketi, içinde oturduğun evi satın al), sıradaki ev (kirala ve taşın, satın al ve taşın, sadece kiralık etiketi), sıradakiler, mülklerin (kirada +$X/sn, taşın), satılık önceki evler. Sahne yaşanan evi gösterir.
  - Eski kayıtlar: `lifestyleOwned` içindeki en iyi ev, kiralık olarak `home` olur.
  - Simülasyon: 8/8 hedef tutuyor; kira gelirin medyan ~%8'i. İlk ev sahipliği 2. nesilde (oyun ~1 sa 50 dk).

- [ ] **1.18 Önsöz (görsel roman):** 5–6 karelik, geçilebilir açılış: restoran, kovulma, lojmandan çıkış, otogarda anneye söz, ara sokakta Şans ([story-v2.md §4](./story-v2.md)). Konuşan aydınlık / diğeri karartılmış, isim etiketi, tek cümlelik balon. Görsel roman bileşeni törenler (1.10) ve rehber balonlarıyla (1.12) ortak.
- [x] **1.S Simülatör düzeltmeleri (2026-10-08):** Olay saatleri artık dönüş oturumuna ve adım sonuna yazılıyor (önce çevrimdışı kazançla gelen olaylar bir önceki oturumun saatine yazılıyordu). `--offline-cap <saat>` ve `--life <sn/ay>` (emekliliksiz tek kahraman, yaş ölçümü) seçenekleri. Sonuçlar: [discussion-notes.md](./discussion-notes.md) §4–6.
- [x] **1.L Yaş ve ömür (2026-10-08):** [game-design-v2.md §4.9](./game-design-v2.md). `config/life.ts` (17 → 97, 1 dk = 1 ay), durumda `lifeSeconds`; yaş sadece tick'te ilerler, çevrimdışında ilerlemez. Emeklilik sadece ömür sonunda (`canRetire` = ömür bitti). Üst barda "24 yaş · 73 yıl kaldı"; ömür sonunda "Bir ömür tamamlandı → Emekli ol ve devret" ekranı (geçici; vakıf töreni 2.1). Geliştirici menüsünde "Kahramanı yaşlandır +10 / +40 yıl". Simülatör tek ömür modelinde; hedef tablosu güncellendi.
- [x] **1.P Tek ömür temposu (2026-10-08):** Multimilyarder ($100B) sınıfı; orta oyun yavaş, geç oyun hızlı (`revenueFactor`, `salaryFactor`, `costFactor`). Yaşlar 19 / 21 / 24 / 39 / 46; 8/8 hedef ([game-design-v2.md §5](./game-design-v2.md)).
- [ ] **1.T Tasarım düğümleri (kullanıcıyla):** Çevrimdışı tavan, gelirin aylık gösterimi ([discussion-notes.md](./discussion-notes.md) §5–6).

### 1C. İlk izlenim ve ölçüm (3. hafta)

- [ ] **1.12 Onboarding:** İlk 3 dakika parmak işaretiyle yönlendirme (şişe topla → Flower Stand al → işe gir → yönetici). Metin minimum. Rehber Rıza Amca (konuşma balonları), Çiçek Tezgâhı yöneticisi o olur; ilk satın almadan sonra kahramana isim verilir (hikaye §3). Sistemler ihtiyaç anında tanıtılır, hepsi baştan gezdirilmez (Rich Inc.'te ilk dakikalarda 12–13 sistem tanıtılıyor; sıkıcı). Kahramanın iç sesi az dozda motivasyon için kullanılabilir.
- [ ] **1.13 Çevrimdışı kazanç modalı v2:** Gelire oranlı, reklamla ×2, sade. Şans kapıda uyuyup uyanır.
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

- [ ] **2.1 Hanedan ekranı:** Ömür sonu (97 yaş) emeklilik akışının tam hali: vakıf töreni, ne kazanıldığı, miras puanı, soy ağacı. Geçici ekran 1.L'de var.
- [ ] **2.2 Yadigarlar:** Miras puanıyla alınan kalıcı yetenekler (çevrimdışı tavanı +1 sa, başlangıç parası, yönetici indirimi...).
- [ ] **2.3 Nesil içeriği:** Her nesil yeni bir şey açsın (yeni şehir + yeni işletme kademeleri; kullanılmayan 30 işletme görseli). Simülatöre eklenip 30 günlük tempo yeniden ayarlanacak.
- [ ] **2.4 Olay kartları:** Kart motoru + sınıfa göre değişen 60 kart (risk, duygu, mizah). Günde 3–5 kart.
- [ ] **2.5 Yatırımlar:** Tek "Yatırım Hesabı" (güvenli / orta / riskli vadeler). Kiradaki evler 1.17'de yapıldı ([game-design-v2.md §4.8](./game-design-v2.md)). Ayrı emlak listesi ve borsa yok.
- [ ] **2.6 Lüks oyuncaklar sahnede:** Jet gökyüzünden geçer, helikopter süzülür, yat sahil evlerinde görünür; ayrıca Garaj/Marina koleksiyon ekranı.
- [ ] **2.7 Günlük döngü ve görevler:** Gelire oranlı günlük ödül serisi, günlük çark (reklamla ek çevirme), "sıradaki 3 hedef" görev zinciri (yön gösterir, gem verir). Gem'in kazanıldığı yerler: görevler ve günlük ödül.
- [ ] **2.8 Bildirimler:** Yerel bildirim: "Kasan doldu", "Emekli olabilirsin", "Günlük ödül hazır".
- [ ] **2.9 Monetizasyon v2:** Ödüllü reklam yerleri (çevrimdışı ×2, 4 saatlik ×2 hız, olay kartında ikinci şans), "Golden Spoon" paketi (reklamsız + kalıcı ×2), başlangıç paketi, gem harcama noktaları. RevenueCat ürünleri güncellenir. Zorla reklam (interstitial): ilk 3 gün hiç yok, sonra çok seyrek.
- [ ] **2.10 Remote Config:** Denge değerlerini güncelleme yayınlamadan değiştirebilmek.
- [ ] **2.11 v1'in kaldırılması:** Banka, sağlık/mutluluk (v2'de karşılığı yok; karar 2026-10-07), v1 görevleri, claim sistemi, Supabase senkronu. Eski oyunculara hoş geldin hediyesi.

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
- [ ] Global lansman, yeni içerik takvimi

---

## Nasıl çalışıyoruz

- Her görev ayrı bir commit; faz bitince `docs/session-handoff.md` ve bu dosya güncellenir.
- Denge değiştiren her commit'te `npm run sim` çıktısı commit mesajına özetlenir.
- Doğrulama: `npm run typecheck` + yeni kod için lint + `npm run sim` + gerçek cihazda oynama.
