# Prestige Life v2 — Yeniden Yapım Planı

Son güncelleme: 2026-10-15 · Dal: `v2-rebuild` · Rapor (neden): [report-v2.md](./report-v2.md) · Tasarım: [game-design-v2.md](./game-design-v2.md) · Hikaye: [story-v2.md](./story-v2.md) · Açık kararlar: [discussion-notes.md](./discussion-notes.md)

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
    config/        Denge verisi: işletmeler, yükseltmeler, kariyer, sınıflar, statü eşyaları, evler, ömür, hedefler, sahne, olay kartları
    formulas.ts    Fiyat, gelir, çarpan, miras formülleri
    state.ts       Saf durum geçişleri (satın al, terfi, taşın, emekli ol...)
    format.ts      $1.23M biçimlendirme, süre biçimlendirme
  sim/             Dengeleme botu, tempo ve his hedefleri
  runtime/         Tick döngüsü, kayıt, çevrimdışı hesap, React hook'u
    engine.ts      Saf zaman motoru: döngü çubukları, ödemeler, çevrimdışı (zaman parametre olarak gelir)
    storage.ts     `prestige_life_v2` kaydı (telefonda Preferences, web'de localStorage), bozuk/eski kayıtları normalleştirme
    store.ts       Canlı oyun: 250 ms tick, otomatik kayıt, ön/arka plan, olaylar (payout, classUp), analitik
    story.ts       Hikâye ilerlemesi: görülen törenler, hayat anları, annenin mesajları, rehber adımları
    backButton.ts  Android geri tuşu: açık katmanlar (sekme, sayfa, modal) z-index sırasıyla kapanır
    feedback.ts    Ses (v1 sfx dosyaları) ve haptik
    ads.ts         Ödüllü reklam (AdMob + UMP izin + iOS ATT; web'de sahte reklam)
    notifications.ts  Yerel bildirimler (annenin mesajı, kasa doldu)
    analytics.ts   Firebase Analytics olayları (`track`)
    GameV2Provider.tsx + useGameV2.ts   React bağlantısı (useSyncExternalStore)
  i18n/            Diller: messages/<dil>.ts (arayüz), content/<dil>.ts (içerik adları), sayı biçimi
  ui/
    home/          Ana ekran: HomeScreen, TopBar, BottomNav, TabSheet, QuestPanel, RewardCard, CoinLayer, SettingsSheet
    scene/         Ev sahnesi: arka plan, kahraman, Şans, araç, toplama (Scene, stages, SceneLab), coverFit
    story/         Önsöz, sınıf törenleri, hayat anları, annenin mesajları (StoryDirector)
    events/        Olay kartları (çağrı ve kart)
    guide/         Rıza Amca rehberi
    businesses/ career/ shop/   Sekme ekranları; managers.ts (yönetici portre ve cümleleri)
    ads/           Sahte reklam ekranı (web/dev)
    kit.tsx        Ortak oyun görünümü bileşenleri (parlak düğme, kart, çubuk...)
    DevMenu.tsx    Geliştirici menüsü
  AppV2.tsx        v2 kökü (VITE_GAME_V2=true)
scripts/sim-economy.ts   `npm run sim` giriş noktası
scripts/phone.mjs        `npm run phone`: Android telefonda canlı yenilemeyle oynatma
```

Aynı formülleri hem oyun hem simülatör kullanır, bu yüzden simülasyon sonucu oyunda ne olacağını gösterir.

---

## Faz 0 — Temel ve ölçüm ✅

- [x] `v2-rebuild` dalı
- [x] Ekonomi çekirdeği: işletmeler, yöneticiler, kariyer, statü eşyaları, sınıflar, miras (`src/game/core/`)
- [x] Dengeleme simülatörü: optimal bot, 2 oyuncu profili, tempo ve his hedefleri (`npm run sim`; güncel hedefler ve sonuçlar tasarım belgesi §5)
- [x] Ekonomi ayarı: hedeflerin hepsi tutuyor
- [x] Tasarım belgesi v2
- [~] **Senin işin:** Firebase projesi (`prestige-life-idle-tycoon`) açıldı, Analytics bağlı ve `google-services.json` yerinde (1.14). Remote Config (2.10) ve Crashlytics bekliyor.
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
  - İlk geçici ana ekran (`HomeShell`) 2026-10-08'de sahne + üst bar + alt menüyle değişti (1.6–1.7).
- [x] **1.3 İşletmeler ekranı:** Liste, döngü çubukları, ×1 / ×10 / Max alım, sonraki kilometre taşı göstergesi ("25'e 3 kaldı → ×2"), yönetici satın alma, yöneticisiz işletmeye dokunarak döngü başlatma.
  - `ui/businesses/`: kademeli açılma (sahip olunanlar + sıradaki + kilitli bir önizleme), döngü çubuğu tick'ler arasında `requestAnimationFrame` ile akıcı dolar (React yeniden çizmeden), 0,5 sn'den hızlı döngüler dolu ve nabız atan çubuk.
  - Boşta duran yöneticisiz işletmede resmin üstünde "▶ Çalıştır" düğmesi (2026-10-08, 1.7).
  - Üst bar ve "~X sonra alabilirsin" tahminleri sadece otomatik geliri gösterir (`autoIncomePerSecond`: yönetici, maaş, kira); 2026-10-08'de değişti, önceden yöneticisizleri %60 sayıp şişik gösteriyordu.
- [x] **1.4 Kariyer ekranı:** Mevcut iş, sonraki terfi kartı (fiyat, maaş, bonus).
  - `ui/career/CareerScreen.tsx`: mevcut iş (maaş, toplam bonus), öne çıkan terfi kartı (gelirdeki toplam artış, maaş, bonus, "~2dk sonra alabilirsin"), 12 basamaklık kariyer merdiveni.
  - Alt menü 2026-10-08'de `ui/home/BottomNav.tsx` oldu; terfi alınabilirken Kariyer düğmesinde "!".
- [x] **1.5 Alışveriş ekranı:** Ev, araç, kıyafet. Satın alınca sahne anında değişir.
  - `ui/shop/ShopScreen.tsx`: Evler / Araçlar / Kıyafetler / Lüks. Eşyalar sırayla alınır: her kategoride tek "Sıradaki hayal" kartı (bonus, fiyat, "~X sonra alabilirsin"), 3 kilitli önizleme, koleksiyon ızgarası. Alınabilir kategori ve Alışveriş sekmesinde kırmızı nokta.
  - Alınan ev, araç ve kıyafet ana sahnede görünür (1.6).
  - Çekirdek: `nextLifestyle`, `bestOwnedLifestyle`, `canBuyAnyLifestyle`, `LIFESTYLE_KINDS` (simülatör de bunları kullanıyor; sim sonucu değişmedi).

### 1B. His ve sahne (2. hafta)

- [x] **1.M Mobil temel:** Oyunun telefonda doğru çalışması için altyapı (ilke 6).
  - Kayıt `@capacitor/preferences`'ta (Android SharedPreferences, iOS UserDefaults); işletim sistemi WebView'in localStorage'ını silebilir. localStorage kopyası web yedeği; açılışta ikisinden yenisi okunur. Açılış kaydı okuyana kadar splash ekranı kalır.
  - Android geri tuşu (`@capacitor/app`): en üstteki katmanı kapatır (geliştirici menüsü → ödül kartı = topla → ayarlar → sekme sayfası); açık katman yoksa uygulama kapanmaz, arka plana gider.
  - Uygulama duraklat/devam olayları da kaydı ve çevrimdışı hesabı tetikler (`visibilitychange`'e ek).
  - `viewport-fit=cover` sadece v2 build'inde (`vite.config.ts`); güvenli alan için `var(--safe-top/bottom)`: Android 15+ için Capacitor 8'in enjekte ettiği değerler, diğerlerinde `env()`.
  - Telefonda test: `npm run phone` (`scripts/phone.mjs`; kablosuz/USB adb, canlı yenileme, adb tüneli).
  - Dil seçimi de Preferences'ta (2026-10-10; `i18n/locales.ts` `loadLocale`, açılışta kayıtla birlikte okunur; eski localStorage seçimi bir kez taşınır).

- [~] **1.6 Sahne sistemi:** Ana ekranın yüzeyi; katmanlar: arka plan, kahraman, Şans, toplanabilir nesneler, uçan sayılar.
  - Tamam (2026-10-08): `ui/scene/Scene.tsx`: tam ekran ara sokak, kahramanın 4 pozu (bekleme, toplama, sevinç, Şans'ı okşama; yumuşak geçiş), Şans (dokununca okşama + kalp), şişe/kutu toplama ([game-design §4.7](./game-design-v2.md)), Şans'ın cüzdan getirmesi. Görsel yerleşimi `ui/scene/coverFit.ts` (önsözle ortak).
  - Tamam (2026-10-09): sahne sınıfı izler (`ui/scene/stages.ts`): her sınıfın arka planı, kıyafet pozları, toplanacakları, Şans'ın tasması; tören bitince yeni aşamaya geçer, sonraki aşama tören sırasında yüklenir. Görseli olmayan aşama bir öncekini kullanır. Oyunda: sokak, minibüs (Gündelikçi).
  - Tamam (2026-10-10): **arka plan oturulan ev, en iyi araç önünde park eder** (`stages.ts` `homeArt`, `parkedVehicle`). Ev 25 → 12 (`config/housing.ts`, eski kayıtlar `LEGACY_HOUSE_TO_HOME` ile taşınır); sınıf töreni hikâyenin evine taşır (`CLASS_HOME_FLOOR`; Gündelikçi töreninde Rıza Amca minibüsünü verir). Taşınınca arka plan yumuşak geçer, kahraman sevinir, "Yeni evin: …" etiketi; yeni araç sahneye kayarak gelir ("Yeni aracın: …"). Tören sürerken sahne eski evde kalır. Ev bonusu kademe başına %8; sim 11/11 tempo + 4/4 his.
  - Tamam (2026-10-11/12): mağazada hikâyenin 4 kıyafeti, kahraman en iyisini giyer; 12 araç ve ev–araç zinciri (game-design §4.4); sahnede metre ölçeği, arabalar kahramanın ~2,5 m arkasında gerçek boyda ve burundan hizalı, bisiklet ve skuter yanında; 12 ev ve 12 aracın hepsi yeni stilde oyunda; ev başına yerleşim ve ışık (`HOME_ART`); DEV → Sahne laboratuvarı.
  - Tamam (2026-10-12): kıyafet 3 ve 4 (3'er poz; `HERO_ART`), Şans'ın deri (Orta Sınıf) ve altın (Milyarder) tasması (`LOOK_ART`); gümüş (Milyoner) 2026-10-15.
  - Tamam (2026-10-14): palto, üç parçalı takım ve smokin (3'er poz, 4'er portre); kıyafet bonusu %6.
  - Kalan: ev başına telefonda son ayar, araç gölgesinin sahnede çizilmesi, yağmur/ortam sesi (ölçek ve ekran haritası: [art-brief-v2.md §3](./art-brief-v2.md)).
- [~] **1.7 HUD ve ekranlar:**
  - Tamam (2026-10-08): renkli üst bar (`TopBar`: para, aylık otomatik gelir, sınıf rozeti, yaş, sınıf çubuğu, ayarlar dişlisi); 3D ikonlu alt menü (`BottomNav`); sekmeler sahnenin üstünde sayfa (`TabSheet`); sekme ekranları yeni görünümde (`ui/kit.tsx`). İşletme kartı netleştirildi: "7 adet", aylık kazanç / "yöneticiyle +$X/ay", "▶ Çalıştır", kilometre taşı çubuğu, yöneticinin ne yaptığı. Her işletmeye kendi yöneticisi (portre, işe alma kartı, portreye dokununca konuşma; [story-v2 §3](./story-v2.md)). Ayarlar sayfası (dil, gizlilik seçenekleri).
  - Kalan: ilerleme çubuğunun ucunda somut ödül (Rich Inc. dersi), paranın fiziksel hali (cüzdan → kasa → banka kasası → altın oda; rapor §6.3).
- [x] **1.8 Hayaller panosu (2026-10-15):** alt menünün içinde, düğmelerin üstünde bir sıra: sıradaki ev, araç ve kıyafet (biri biterse sıradaki lüks), cüzdanın fiyata yüzdesi; alınabilince yeşil "Al!", başka bir şey bekliyorsa (önce araç, sınıf) kilit. Dokununca Alışveriş o eşyada açılır ve el satın al düğmesini gösterir. Sekme açıkken gizli; kısa ekranda (< 700 px) şişe toplama dönemi boyunca gizli. Menü yükseldiği için sahnedeki şişe noktaları en fazla zeminin %81'ine çekildi (`Scene.tsx` `SPOTS`). `ui/home/DreamsRow.tsx`. Hikâye hayalleri ve annenin evi ara basamakları testten sonra ([story-v2.md §5, §7](./story-v2.md), karar 2026-10-09).
- [~] **1.9 Para akışı efekti:** Tamam: şişe toplayınca ve ödül alınca paralar kavisle bakiyeye uçar, bakiye zıplar (`CoinLayer`). Kalan: işletme döngüsü bitince işletmeden uçan "+$1.2K", sayacın büyüyüp renk değiştirmesi.
- [x] **1.10 Sınıf atlama töreni (2026-10-09):** `ui/story/Ceremony.tsx` + `ceremonyScript.ts` + `StoryDirector.tsx`. "Yeni sınıf" başlığı (konfeti, ses, haptik) → görsel roman (ifade portreleri; yedi törenin yedisinin de kendi karesi) → tasma veren sınıflarda "Şans'ın yeni tasması!" kartı (2026-10-15) → kapanış kartı (gerçekten değişen ev ya da kıyafet, otel hediyesi, çevrimdışı tavan, tasma satırı, sıradaki sınıf; İşçi'den itibaren hediye + "reklamla ×2"). 7 tören, TR/EN ([story-v2.md §4](./story-v2.md)); tören sırasında saat durur; görülenler kayıtta (`runtime.story`). Annenin 11 mesajı (dönüş oturumunda, 20 saatte bir). Yalnız 1. nesil (varisin hikâyesi Faz 2).
- [~] **1.11 Juice paketi:** Tamam: `runtime/feedback.ts` ses (v1 sfx dosyaları) ve haptik (`@capacitor/haptics`): toplama, alım, ödül, yönetici. Kalan: basma geri bildirimlerinin ekranlara yayılması, müzik, ses ayarı.

- [x] **1.16 Hikaye görselleri (görsel roman):** liste ve stil kılavuzu [story-v2.md §8](./story-v2.md), stil yarı 3D (2026-10-08). İlk görseller (karakter kılavuzları, portreler, önsöz, hayat anları, lüks anları) fal.ai, sonrakiler (12 ev, 12 araç, 7 kıyafet, tören kareleri, işletme ve kariyer ikonları, Şans'ın tasmaları ve uyku pozları, mağaza) GPT ile; hepsi oyunda. Açık kalanlar (fuların bütün pozlarda görünmesi, iki çizim dili, lüks kesimleri): [discussion-notes.md §1](./discussion-notes.md).
  - Kural: kodla zıplatma karakter animasyonu sayılmaz; gerçek animasyon sadece 2–3 büyük an için ve isteğe bağlı ([discussion-notes.md](./discussion-notes.md) §1). Özellikler görsel beklemez, yer tutucuyla yapılır.
- [x] **1.17 Konut modeli:** Kirala → satın al → kiraya ver ([game-design-v2.md §4.8](./game-design-v2.md)). Kiraya verme Faz 2.5'ten buraya çekildi (karar 2026-10-07): o olmadan ev satın almanın bir getirisi yoktu.
  - Çekirdek: `config/housing.ts` (evler artık statü eşyası değil), durumda `home` + `homesOwned`, `rentHome` / `buyHome` / `moveHome`, `homeBonus` (yaşanan evin kademesi, kendi evinde +%8) ve `rentPerSecond` (maaşla birlikte her saniye, çevrimdışı da).
  - Arayüz: `ui/shop/HousingPanel.tsx`: evin (Kiracısın / Senin etiketi, içinde oturduğun evi satın al), sıradaki ev (kirala ve taşın, satın al ve taşın, sadece kiralık etiketi), sıradakiler, mülklerin (kirada +$X/sn), satılık önceki evler. Yalnızca yukarı taşınılır (2026-10-12). Sahne yaşanan evi gösterir.
  - Eski kayıtlar: `lifestyleOwned` içindeki en iyi ev, kiralık olarak `home` olur.
  - Simülasyon: kira gelirin ortanca ~%7'si. İlk kendi ev Milyoner töreniyle gelir (hediye, sahipli; 2026-10-12).

- [x] **1.18 Önsöz (görsel roman, 2026-10-08):** 6 kare, 13 balon: restoran, annenin doğum günü telefonu, kovulma, lojman kapısı, otogarda söz, ara sokakta Şans ([story-v2.md §4](./story-v2.md)). `ui/story/Prologue.tsx` + `prologueScript.ts`: tam ekran kare, yavaş yakınlaşma, isim etiketli balon, dokun → devam, "Geç", sona siyaha geçiş. Kayıt yoksa (yeni oyuncu) oyundan önce oynar; oyun ve yaş saati önsöz bitince başlar. Geniş ekranda 9:16 sütun. Geliştirici menüsünde "Önsözü tekrar oynat". Balonlar konuşanın başının üstünde, kuyruğu konuşana bakar. Ses yok (yağmur sesi bekliyor). Balon bileşeni törenlerde (1.10) ve rehberde (1.12) yeniden kullanılacak.
- [x] **1.S Simülatör düzeltmeleri (2026-10-08):** Olay saatleri artık dönüş oturumuna ve adım sonuna yazılıyor (önce çevrimdışı kazançla gelen olaylar bir önceki oturumun saatine yazılıyordu). `--offline-cap <saat>` ve `--life <sn/ay>` (emekliliksiz tek kahraman, yaş ölçümü) seçenekleri. Sonuçlar tasarım belgesi §5.
- [x] **1.L Yaş ve ömür (2026-10-08; ömür 80 yaş 2026-10-11):** [game-design-v2.md §4.9](./game-design-v2.md). `config/life.ts` (17 → 80, 80 sn = 1 ay), durumda `lifeSeconds`; yaş sadece tick'te ilerler, çevrimdışında ilerlemez. Emeklilik sadece ömür sonunda (`canRetire` = ömür bitti). Üst barda "24 yaş"; ömür sonunda "Bir ömür tamamlandı" paneli (2026-10-13: hayattan kareler, işletme özeti, aile itibarı, "Emekli ol ve devret"; `ui/home/RetirementPanel.tsx`; vakıf töreni ve soy ağacı 2.1). Geliştirici menüsünde "Kahramanı yaşlandır +10 / +40 yıl". Simülatör tek ömür modelinde.
- [x] **1.P Tek ömür temposu (2026-10-08):** Multimilyarder ($100B) sınıfı; orta oyun yavaş, geç oyun hızlı (`paybackMinutes`, `salaryFactor`, `costFactor`). Güncel yaşlar ve hedefler: [game-design-v2.md §5](./game-design-v2.md).
- [x] **1.G Gelir ve toplama (2026-10-08):** Gelir "/ay" gösterilir; şişe ~2,5 sn gelir eder; çevrimdışı tavan sınıfla büyür (10 dk → 2 sa); Şans'ın cüzdanı ve çevrimdışı kazanç "Topla" kartıyla ([game-design §4.6–4.7](./game-design-v2.md)).
- [~] **1.T Ekonomi ayarı (kullanıcıyla):**
  - Tamam (2026-10-08): yavaşlarken yapılacak şey eklendi: işletme yükseltmeleri (§4.2) ve hedefler (§4.10); sınıf çubuğu karekök ölçeğinde; simülatörde his kontrolleri (tur ≥ $1, işletme payı ≥ %50) ve `--purchases`.
  - Tamam (2026-10-09, kullanıcıyla): yeniden ayar: başta ana gelir iş, sonra işletmeler; Çiçek Tezgâhı $250, kısa turlar (1–15 sn), kilometre taşları 25 / 50 / 75, yükseltme fiyatı ulaşma maliyetine bağlı ([game-design §4.2, §5](./game-design-v2.md)). 2026-10-12: ev bonusu ve kira (§4.8).
  - Tamam (2026-10-13): son iki işletme alınmaya değer (Otel 22 gün → 4 gün, Teknoloji 208 gün → 3,5 gün geri ödeme), Milyarder töreni oteli ve Bülent Bey'i hediye eder ([game-design §4.2](./game-design-v2.md)).
  - Tamam (2026-10-14/15): reklam izleyen, fular alan ve reklam + fular + yakut profilleri simülatörde ([monetization-v2.md §5](./monetization-v2.md)).
  - Kalan: erken sınıflarda çevrimdışı ödül, Multimilyarder hedefi ([discussion-notes.md §4](./discussion-notes.md)).

### 1C. İlk izlenim ve ölçüm (3. hafta)

- [x] **1.12 Onboarding (2026-10-09):** Hedefler kartı (resim, konum, "Git", sekme içinde hedef şeridi; game-design §4.10) + Rıza Amca rehberi (`ui/guide/`): 5 şişe topla → ilk hedefin ödülü → ilk iş (El İlanı Dağıtıcısı) → Çiçek Tezgâhı → kahramanın adı (varsayılan Can / Alex, en fazla 16 harf) → ilk "Çalıştır" → Rıza Amca yönetici. Adımlar oyun durumundan okunur (ileri kayıt görmez; varis görmez). Her adımda Rıza'nın tek cümlesi (duygu; 9 sn sonra ya da dokununca kapanır) ve işaret eden el (eylem): sahnede şişe, hedef kartında "Ödülü al", menüde sekme (halka + el), sekme içinde düğme. El ancak adım yapılabilir olunca çıkar (yeterli para). Balon sahnede Hedefler kartının altında, sekmede menünün üstünde; tören, çevrimdışı kartı ve ömür sonu sırasında gizli. Kayıtta `story.heroName`, `guideSeen`, `guideDone`. Analitik `tutorial_step` (adım geçişleri, sonda `done`). Sonra: kahramanın adı törenlerde ve anne mesajlarında kullanılabilir; yağmur sesi.
- [x] **1.13 Çevrimdışı kazanç kartı v2:** gelire oranlı, tavan bilgili "Topla" kartı, kartta sınıfın tasmasıyla uyuyan Şans (2026-10-13), paralar bakiyeye uçar, "Reklam izle: +%30" (2026-10-12).
- [x] **1.19 Bildirimler (2026-10-09, Faz 1 kararı):** `@capacitor/local-notifications`; annenin sıradaki mesajı ve kasa dolunca Şans, günde en fazla bir, 10:00–21:00; arka plana geçerken kurulur, açılınca iptal. İzin ilk törenden sonra oyun içi kartla, sonra sistem diyaloğu. Ayarlarda aç/kapa. Android: beyaz kalp simgesi, `SCHEDULE_EXACT_ALARM` manifestten kaldırıldı. Telefonda denenmedi ([story-v2.md §4b](./story-v2.md)).
- [~] **1.14 Analitik (2026-10-09):** Kod tamam: `runtime/analytics.ts` (`@capacitor-firebase/analytics` 8.5.2; telefonda Firebase'e gider, web'de gönderilmez, geliştirmede konsola da yazar). Firebase kendisi `first_open`, `session_start`, etkileşim süresini kaydeder (oturum süresi, D1/D7). Bizim olaylar: `class_up` (sınıf, nesil, `life_minutes` = bu hayatta oynanan dakika), `business_buy`, `manager_hire`, `upgrade_buy`, `promotion`, `lifestyle_buy`, `home_change`, `quest_claim`, `find_claim`, `event_card`, `offline_claim`, `retire`, `ad_watch`, `story_view` (önsöz/tören/anne; `skipped`), `notification_prompt`, `notification_open`; ekran = açık sekme; kullanıcı özelliği `class_index`, `generation`. Firebase projesi ve `android/app/google-services.json` yerinde. Kalan: telefonda DebugView ile doğrulama; `tutorial_step` rehberle geldi (1.12); AB izni (consent mode) yayından önce; iOS kurulumu iOS'a geçerken.
- [x] **1.20 Hayat anları (2026-10-11):** yaşa bağlı tek karelik anlar ([story-v2.md §4c](./story-v2.md)): ilk buluşma (25 yaş), düğün (28), kızın doğumu ve adı (31). Tanım ve tetik `runtime/story.ts` (`LIFE_MOMENTS`, `pendingLifeMoment`: yaş + ön koşul töreni, sırayla), senaryo `ui/story/lifeScript.ts`, metinler `moments.*`. Törenle aynı oynatıcı (`Ceremony.tsx` → `StoryPlayer`; hayat anında kapanış kartı yok). Yalnızca ana sahnede oynar (sekme, çevrimdışı kartı, annenin mesajı açıkken bekler), bir tören ya da hayat anından sonra 2 dk bekler. Kızın adı ortak `NameSheet` ile sorulur (Rıza'nın isim sorusu da onu kullanıyor). Kayıtta `story.lifeSeen`, `story.daughterName`; analitik `story_view` (`kind: life`), `daughter_named`; DEV → "Hayat anını oynat" 25 / 28 / 31. Görseller oyunda (fal.ai, 2026-10-11): Defne ve Nevin Hanım portreleri, 3 kare. Köprü: annenin Defne mesajı İşçi töreninden ilk buluşmaya kadar öncelikli (`untilMoment`), ilk buluşma "Kurabiyeler o günden sonra hiç kesilmedi" ile açılır. Tarayıcıda DEV menüsünden oynatıldı; gerçek yaş tetiği ve telefon denenmedi. Kalan anlar (okul, ilk para, mezuniyet, torun, devir) oyun testinden sonra.
- [x] **1.23 IAP 1. adım (2026-10-14):** ayrı Mağaza ekranı (sahnedeki yuvarlak düğme, bölümler, "Sahipsin" rozeti, geri yükleme), bir kerelik hoş geldin kartı, ürün türleri (kalıcı / tek seferlik / tüketilir), katmanlı paket görselleri ([monetization-v2.md §8](./monetization-v2.md)). Ürünler: Rahat Paket $7,99 (reklamsız + 2 sa ×2), Başlangıç Paketi $2,99, ilk 3 gün hoş geldin fiyatı $1,49 (4 sa ×2, 1 sa gelir, Şans'a kalıcı +%10 fular; 2026-10-15). Kayıt: `purchases` (eski kayıtta boş). Play ve RevenueCat'te tanımlı; gerçek satın alma AAB 28 dahili testinde denenecek.
- [x] **1.24 Şans'ın tasmaları (2026-10-15):** deri / gümüş / altın tasma gelire %2 / %4 / %6 (yalnız takılı olan), törende tasma kartı; ücretli aksesuarlar ayrı çarpan ([game-design-v2.md §4.4](./game-design-v2.md)).
- [x] **1.25 Puanlama penceresi (2026-10-14):** Google Play'in kendi penceresi Milyoner töreninden sonra, en fazla 3 kez, aralarında 30 gün (`runtime/review.ts`). Yalnız Play'den kurulan sürümde görünür; dahili testte denenecek.
- [x] **1.22 Lükslerin karşılığı (2026-10-14):** lüks fiyatları indi (reklamsız oyuncu jeti ilk hayatta alır, [game-design-v2.md §4.4](./game-design-v2.md)); her lüks ilk alındığında bir lüks anı ve albüm sayfası ([story-v2.md §4c](./story-v2.md)). Kod `runtime/story.ts` `LUXURY_MOMENTS` / `pendingLifeMoment` / `luxuryMomentsBelow`, `ui/story/lifeScript.ts`, `album.ts` `lifeMomentLabel`, metinler `moments.{boat,yacht,heli,jet}`; DEV → "Hayat anını oynat" boat / yacht / heli / jet. Kayıt: yeni alan yok (`story.lifeSeen`); lüksü önceden alan oyuncuda yalnızca en yenisinin anı oynar. Sahnede gösterim sonraki tur. Telefonda denenmedi.
- [x] **1.21 Zenginler Listesi (2026-10-14):** kurgusal ilk 20, sıra bu hayatta kazanılana bağlı, altı dönüm noktası kartı ([game-design-v2.md §4.11](./game-design-v2.md), metinler [story-v2.md §4e](./story-v2.md)). Kod `core/config/richList.ts`, `formulas.ts` `richListRank` / `richListTarget` / `rivalFortune`, `runtime/story.ts` `pendingRichMoment`, `ui/richList/RichList.tsx` (düğme, sayfa, kart). Kayıtta `story.richSeen`; analitik `story_view` (`kind: rich_list`), ekran `rich_list`. Simülatör zaman çizelgesinde "Rich List" satırları. Tarayıcıda Türkçe giriş kartı ve liste sayfası denendi; diğer kartlar, İngilizce, ilk 20'nin içinde kahraman (yalnızca betikle) ve telefon denenmedi. Geç oyunun kalanı: zirve sonrası (2.12), yerel başarımlar ([discussion-notes.md §8](./discussion-notes.md)).
- [ ] **1.15 Oyun testi paketi:** Kapalı test sürümü, 5 soruluk kısa anket, test notları şablonu.

### Faz 1 kapısı

20–50 kişilik oyun testi:

- İlk oturum medyanı ≥ 15 dakika
- İlk oturumda Orta Sınıf olanlar ≥ %60 (yeniden yazılacak: güncel tempoda Orta Sınıf ilk oturumda gelmiyor; [discussion-notes.md §4](./discussion-notes.md))
- Ertesi gün geri gelenler ≥ %35
- "En sevdiğin an" sorusunda sınıf töreni veya para akışı çıkmalı

---

## Faz 2 — Geri getiren döngüler (hayati, ~4 hafta)

**Amaç:** Oyuncunun 1., 7. ve 30. gün geri gelmesi için sebep yaratmak.

- [ ] **2.1 Hanedan ekranı:** Ömür sonu (80 yaş) emeklilik akışının tam hali: vakıf töreni, ne kazanıldığı, miras puanı, soy ağacı. Özet paneli 1.L'de var.
- [x] **2.2 Yadigârlar (2026-10-16):** miras puanı Aile sekmesinde 5 yadigâra harcanır (Mehmet'in saati, annenin erik reçeli, Rıza Amca'nın defteri, Şans'ın tasması, aile albümü; `config/heirlooms.ts`, `ui/family/FamilyScreen.tsx`, [game-design-v2.md §4.5](./game-design-v2.md)). Görseller yok (şimdilik ikon kutuları). Telefonda denenmedi.
- [ ] **2.3 Nesil içeriği:** Her nesil yeni bir şey açsın (yeni şehir + yeni işletme kademeleri; kullanılmayan 30 işletme görseli). Simülatöre eklenip 30 günlük tempo yeniden ayarlanacak.
- [~] **2.4 Olay kartları:** Kart motoru + sınıfa göre değişen 60 kart (risk, duygu, mizah). Günde 3–5 kart.
  - Tamam (2026-10-12, öne alındı): yerden toplama Orta Sınıf'ta bitiyor, yerine 10 kartlık ilk set ([game-design-v2.md §4.7](./game-design-v2.md), metinler [story-v2.md §4d](./story-v2.md)). `core/config/events.ts`, `ui/events/` (`EventCards.tsx`: çağrı ve kart; `eventScript.ts`: kim, hangi yüzle), `events.*` metinleri, simülatörde modelli, `event_card` analitik olayı, DEV → "Olay kartı gelsin". Ödül cevap anında ödenir, cevabın saati kayıtta (`story.eventAnsweredAt`). Telefonda denenmedi.
  - Kalan: büyük set, kötü sonuçta reklamla "ikinci şans".
- [x] **2.5 Yatırımlar (2026-10-15):** Rıza Amca'nın fırsatları: 1 / 4 / 8 saatlik vade, cesur vadede risk, en fazla 5 yıllık gelir, aynı anda tek yatırım, Orta Sınıf'ta açılır; alt menüde 4. düğme (`ui/invest/InvestScreen.tsx`, [game-design-v2.md §4.13](./game-design-v2.md)). Kiradaki evler 1.17'de yapıldı. Ayrı emlak listesi ve borsa yok. İleride: ikinci yatırım yuvası mağaza ürünü olabilir.
- [ ] **2.6 Lüks oyuncaklar sahnede:** Jet gökyüzünden geçer, helikopter süzülür, yat sahil evlerinde görünür; ayrıca Garaj/Marina koleksiyon ekranı.
- [~] **2.7 Günlük döngü:** Tamam (2026-10-15): günlük ödül, aylık gelirin katı, 7 günlük takvim, cezasız, reklamla ×2 ([game-design-v2.md §4.12](./game-design-v2.md); `ui/home/DailyCard.tsx`). Çark yapılmadı (tona uymuyor, yerine ödülde ×2). Kalan: "ödülün hazır" bildirimi (bildirimler günde bir; şimdilik Şans'ın hatırlatması yetiyor), günlük görevler. "Sıradaki 3 hedef" zinciri 1.T'de yapıldı. Lansmanda gem yok.
- [x] **2.8 Bildirimlerin kalanı (2026-10-16):** "Günlük ödül hazır" (ertesi sabah, ödüller açıldıysa) ve ömür bittiyse yalnız varisin mesajı ("{Ada} otogarda seni bekliyor", 3 saat sonra). Günde en fazla bir kuralı öncelik sırasıyla: varis, anne, yatırım / Şans, günlük ödül (`pickReminders`, `runtime/notifications.ts`). Telefonda denenmedi.
- [~] **2.9 Monetizasyon v2:** Kararlar: [monetization-v2.md](./monetization-v2.md) (2026-10-08).
  - Tamam: reklam altyapısı (`runtime/ads.ts`: AdMob 8.2.1, UMP izin formu ana ekranda, ATT ilk reklamda, web'de sahte reklam, Ayarlar'da gizlilik seçenekleri, geliştirici menüsünde test reklamı). Ayrıntı: [mobile-ad-integration.md](./mobile-ad-integration.md).
  - Tamam (2026-10-12): reklam yerleri 1–4 (çevrimdışı reklamı, Şans ×2, 1 saatlik ×2 hızlandırıcı, biraz yardım; `core/config/ads.ts`, `runtime/adRewards.ts`, `ui/ads/`), simülatörde "reklam izleyen" profili. Tarayıcıda sahte reklamla denendi (çevrimdışı ×2, hızlandırıcı); telefonda gerçek test reklamıyla denenmedi. Çevrimdışı reklamı +%30 (2026-10-13; ×2 oyunu yarıya indiriyordu): reklam izleyen En Zengin'e ~%31 erken ulaşıyor ([monetization-v2 §4](./monetization-v2.md)). "Biraz yardım" 15 dakikalık gelir yerine eksik tutarı verir, eksik fiyatın %10'undan ve 5 dakikalık gelirden azken çıkar (2026-10-14; telefonda fazla geliyordu). Kıyafetler sınıfa kilitli (2026-10-14; game-design §4.4).
  - Tamam (2026-10-14/15): IAP 1. adım (1.23), tören hediyesi ×2 (5. reklam yeri).
  - Kalan: IAP 2. adım, Şans'ın Yakut Tasması $4,99 (kalıcı +%50; görselleri hazır) ve Gece Vardiyası Ekibi $3,99 (çevrimdışı oran %100, tavan +2 sa); v1'in 8 ürünü pasifleştirilir. Zorla reklam lansmanda yok.
- [ ] **2.10 Remote Config:** Denge değerlerini güncelleme yayınlamadan değiştirebilmek.
- [ ] **2.11 v1'in kaldırılması:** Banka, sağlık/mutluluk (v2'de karşılığı yok; karar 2026-10-07), v1 görevleri, claim sistemi, Supabase senkronu. Eski oyunculara hoş geldin hediyesi.
- [ ] **2.12 Zirveden sonrası (2026-10-15, kullanıcı: Faz 2'de; öncelikli):** En Zengin'den ömür sonuna kadar yeni hedef yok (reklamsız ~6,5 sa, reklam + fular + yakut ~12 sa oyun). Karar (2026-10-15, [discussion-notes.md §2–3](./discussion-notes.md)): görünür miras + "Şimdi devret / Kal, biriktir", yadigâr mağazası (2.2) ve miras formülü, 2. nesil yeni şehirde (2.3), kahramanın dede görünümü; üçü birlikte yayınlanır. Yapıldı (2026-10-16): Aile sekmesi (alt menüde 5. düğme), canlı "Varisine bırakacağın", "Kal, biriktir" / "Şimdi devret" (onaylı, yıllar atlanır), yadigârlar (2.2); 2. nesil En Zengin'e ~4 saatte (önce 40 dk). Tarayıcıda denendi. Devir hikâye anları (2026-10-16): 63, 70, 80 yaş anları, torunun adı, "Yıllar geçti…", emeklilik paneli anları bekler, dede görünümünün kodu (60+, `stages.ts` `GRANDPA_ART`); metinler story §4c, tarayıcıda denendi. Görseller oyunda (2026-10-16). Kalan: 2. nesil içeriği (2.3) ve puanın şehre göre hesabı.
- [ ] **2.13 Google Play Games başarımları (2026-10-15, kullanıcı: sonra yapılacak):** Play Games Services v2 ile 15–20 başarım; kesin tetiklerden (7 sınıf töreni, 3 hayat anı, 4 lüks, Zenginler Listesi sıraları, ilk yönetici, Şans'ın bulduğu cüzdanlar (ilerlemeli), tasmalar, emeklilik). Google kuralları: en az 10 (Play Points özellikleri için 15), en az 4'ü ilk saatte herkesin alabileceği (ilk iş, ilk tezgâh, ilk yönetici, Gündelikçi), toplam en çok 2.000 puan, her biri 5'in katı ve en çok 200; puanın bir kısmı sonraki içeriğe ayrılır. iOS'ta karşılığı Game Center.
  - **Kullanıcı (Play Console):** uygulama "oyun" olarak işaretli → Kullanıcı kazanın → Play Games Services → Yapılandırma: "Google API'leri kullanıyor" → mevcut Cloud projesi (`prestige-life-idle-tycoon`); Özellikler (ad, açıklama, kategori, görseller mağaza sayfasıyla aynı); OAuth izin ekranı (`games`, `games_lite`, `drive.appdata`, yayınla); Android kimlik bilgisi: paket `com.prestigelife.idletycoon` + **Uygulama bütünlüğü → Uygulama imzalama**'daki SHA-1 (testte hata ayıklama anahtarıyla ikinci bir kimlik); Testçiler (kendi hesabın + dahili/kapalı test kanalları); başarımlar (ad ≤ 100, açıklama ≤ 500 karakter, kare ikon, puan, sıra; konsolun verdiği kimlikler koda yazılır); oyunu herkese açmadan önce "Oyunu yayınla". Kaynak: [Play Games Services kurulumu](https://developer.android.com/games/pgs/console/setup), [başarım kuralları](https://developer.android.com/games/pgs/achievements).
  - **Claude:** Capacitor 8 için güvenilir hazır eklenti yok (`capacitor-game-connect` Capacitor 5'te kalmış), Play Games SDK v2'ye küçük kendi yerel köprümüz (`android/`), başarım listesi TR/EN ve ikonları (GPT). v2 oyuncuyu kendiliğinden tanır: giriş düğmesi ve hesap yok; başarımlar internetsizken de açılır, sonra eşitlenir. Yalnız Play'den kurulan sürümde denenebilir.

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
