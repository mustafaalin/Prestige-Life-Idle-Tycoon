# Session Handoff

Son güncelleme: 2026-10-21 (gece) · Dal: `v2-rebuild` · Son sürüm: **AAB 30** (derlendi, Play'e yüklenmedi). Bu oturumdaki her şey AAB 31'de gelecek (henüz derlenmedi).

Yeni bir oturumda projeye hızlı dönmek için güncel durum. Oyun v2 olarak yeniden yapılıyor; v1 dondu ve Faz 2.11'de kaldırılacak. Bu belge günlük tutmaz: her oturum sonunda **güncel durumu yansıtacak şekilde yeniden yazılır**. Kararların gerekçesi ve sayılar ilgili belgededir; burada yalnızca özet ve yapılacaklar durur.

## Belgeler

| Belge | Soru |
| --- | --- |
| [game-design-v2.md](./game-design-v2.md) | **Ne?** Kurallar ve sayılar; tek doğruluk kaynağı |
| [story-v2.md](./story-v2.md) | Hikâye, karakterler, ton, metinler, görsel stil kılavuzu |
| [monetization-v2.md](./monetization-v2.md) | Reklam ve IAP: yerler, ürünler, mağaza kurulumu, veri güvenliği beyanı |
| [rebuild-plan.md](./rebuild-plan.md) | **Ne zaman?** Fazlar ve görevler |
| [discussion-notes.md](./discussion-notes.md) | Kararı bekleyen konular (yalnız açık olanlar) |
| [art-brief-v2.md](./art-brief-v2.md) | Görsellerin kuralları, boyutları, sahne ölçeği, oyuna bağlama |
| [art-prompts-v2.md](./art-prompts-v2.md) | GPT'yi bekleyen 1. nesil işleri (önsözün 3D kareleri) ve seçim bekleyen ikon / özellik grafiği adayları |
| [art-prompts-ada.md](./art-prompts-ada.md), [art-prompts-lumen.md](./art-prompts-lumen.md) | 2. neslin görselleri (yayından sonra) |
| [audio-v2.md](./audio-v2.md) | Ses efektleri ve müzik |
| [mobile-ad-integration.md](./mobile-ad-integration.md) | v2 reklam altyapısı (AdMob, izin, test) |
| [report-v2.md](./report-v2.md) | **Neden?** Değişmez; tasarım belgesiyle çelişirse tasarım geçerli |
| [research/](./research/) | Rakip incelemesi (Idle Guy) ve oyuncuyu tutma raporu (2026-10-20) |
| [archive/](./archive/) | Bitmiş teslimler, komutlar, ekonominin yeniden kurulması, Burak hikâyesi; yalnız geçmiş için |
| [v1/](./v1/) | v1 arşivi; v2 işinde okunmaz |

## Oyunda olanlar (lansman = 1. nesil)

Ayrıntılar tasarım ve hikâye belgelerinde.

- **Ekonomi (yeniden kuruldu 2026-10-20/21):** gerçekçi takvim (1 ay = 80 sn, 1 yıl = 16 dk, gerçek maaş ve fiyatlar); 14 işletme, her biri 15 seviye (üç görünüm × 5, yeni binada tur ×2) + şube, tur 1 sn; 104 meslekli ağaç (54 satır, satırda 2 iş, sekmeler sırayla, ustalık 3–8 ay, iş değişimi şovu), 24 kurs, 4 meslek açan eşya; 12 ev (kirala → satın al → kiraya ver), 12 araç, 7 kıyafet, 4 lüks (gelir bonusu yok); Şans'ın tasmaları (%2 / %4 / %6); çevrimdışı %20, en çok 1 sa; 8 sınıf, 1. nesilde Milyarder'e kadar (~70 yaş). Kayıt şeması 3 (2026-10-21: 10 → 15 işletme seviyesi).
- **Hikâye:** önsöz (6 kare), 5 sınıf töreni (Gündelikçi → Milyarder; Multimilyarder ve En Zengin torunla), annenin mesajları, hayat anları (25, 28, 31, 63, 70), 4 lüks anı, 50 olay kartı (üç tür, yönetici kartları işletmenin görünümüne bağlı, deste düzeni), Zenginler Listesi, aile albümü, 60+ dede görünümü. 80'de kahraman kalır: bir kez "Torununun hikâyesi yakında" kartı, oyun sürer. Burak hikâyesi, devir, miras, Aile sekmesi ve Lumen kodda duruyor ama kapalı (`config/content.ts`).
- **Ana ekran:** oturulan ev ve önündeki araç, kahraman, Şans, yerden toplama (Orta Sınıf'ta biter), hedef rozeti (bitince "Ödülü al" ve yanında ×3 reklamı), gelir dökümü, hayaller panosu, ×2 hızlandırıcı, Şans'ı çağır, para yağmuru (30 sn geri sayımlı), fırsat balonu, günde bir teklif kartı; ödüller yeşil banknotlarla bakiyeye uçar; alt menüde İşletmeler, Kariyer, Alışveriş, Yatırım. Rıza Amca rehberi.
- **İşletmeler ekranı (yeni tasarım, 2026-10-21):** kısa satır: resme dokun = çalıştır, ad, seviye adı · N/15, aylık gelir, üç parçalı aşama çubuğu (tezgâh / dükkân / mağaza), tek ana düğme (Geliştir / Yeni bina ×2 / Aç / Şube) ve eksik tutar ya da yardım reklamı; yöneticisi olmayan satırın altında yönetici şeridi (portre, ad, "İşe al"; para yetince altın); satıra dokununca ayrıntı penceresi (tur kazancı, sıradaki seviye, yönetici, şubeler, reklam teklifleri). Kod `ui/businesses/BusinessCard.tsx`, `BusinessDetails.tsx`, `StageBar.tsx`.
- **Para:** 19 ödüllü reklam yeri, kilitsiz (reklam izleyen Milyarder'e %47 erken); Mağaza afiş tarzında (Sınırlı teklif, Bedava, Hep senin): Başlangıç Paketi $2,99 (ilk 3 gün $1,49; ×2 4 sa, 1 sa gelir, fular +%10), Rahat Paket $7,99 (reklamsız, 3 sa gelir, ×2 2 sa; simgesi altın yasak çemberli kırmızı oynat düğmesi); geri yükleme; Play puanlama penceresi.
- **Görseller:** 1. neslin bütün görselleri oyunda, GPT'de bekleyen iş yok. 2026-10-21'de bağlananlar: 41 meslek ikonu (104'ün hepsi), önsözün 3D kareleri, dedenin okşama pozu (Şans doğru boyda), Sahil Malikânesi v2 (ev geride), fularlı okşama pozları, McLaren tarzı Süper Otomobil; 11 aracın tekerlek altındaki gri zemin temizlendi (`scripts/vehicle-ground.py`).
- **Sahne panosu (DEV, 2026-10-21):** `npm run dev:v2` → `/scene-board.html`; ilk hayatta görülebilen her ev, araç, kıyafet ve tasma (`ui/scene/sceneCombos.ts`, şu an 84 sahne) telefon boyunda, altında yorum kutusu; yorumlar `scene-notes.json`'a (git dışı) yazılır, Claude oradan okur. İlk turun yorumlarıyla poz boyları, ev başına araç yeri ve üç aracın lastik altı düzeltildi; ayak altındaki gölge kaldırıldı (kahramanı havada gösteriyordu).
- **Altyapı:** kayıt Preferences'ta, Android geri tuşu, güvenli alanlar, yalnız dikey (tablette ortada dikey sütun), yerel bildirimler, Firebase Analytics ve Crashlytics (JS hataları ölümcül olmayan rapor, çizilemeyen ekranda yeniden başlat), ses ve müzik, TR + EN.

## Sıradaki

1b. **IAP para paketleri (2026-10-22, oyunda):** Mağaza'da "Para çantaları" bölümü, 5 tüketilir ürün `v2_cash_1..5` ($0,99 / $2,99 / $4,99 / $9,99 / $14,99 = 15 dk / 1 / 2 / 5 / 10 saatlik gelir; [monetization-v2.md §5](./monetization-v2.md)), görselleri para serisi M2–M6. Lansmanda gelecek. Kullanıcı Play Console'da 5 ürünü açıyor ve RevenueCat'te **tüketilir** işaretliyor (2026-10-22); sonra telefonda gerçek satın alma denenecek.
2. **AAB 31:** karar gelince derlenir (`versionCode` 31), `~/Downloads/prestige-life-v2-31.aab`; telefon testi aşağıdaki listeyle.
3. **Telefon bulgularına göre düzeltme.**
4. **Lansman hazırlığı:** Play'den üretim erişimi başvurusu; Play Console işleri (aşağıda); uygulama ikonu ve özellik grafiği seçimi; mağaza ekran görüntülerini yeni ekranlarla yenilemek.
5. **Sonra (lansmandan sonra):** IAP 2. adım (Yakut Tasma, Gece Vardiyası), Remote Config, oyuncuyu tutma önerileri ([discussion-notes.md §2](./discussion-notes.md)), 2. nesil.

## 2026-10-21 oturumunun kararları (kullanıcı)

Hepsi yapıldı ve commit'lendi; ayrıntıları ilgili belgelerde. Yeni oturum bunları yeniden sormaz, yeniden açmaz.

- **Sahne:** sahne panosu (`/scene-board.html`) ile yorum turu; ayak altındaki gölge kalktı (kahramanı havada gösteriyordu); poz boyları düzeltildi; ev başına araç yeri (E3, E5 öne; E8, E12 geri; E11 için ev yeniden çizildi); Spor Coupe 1,42 m; Süper Otomobil yeni çizim.
- **Hikâye:** otogardaki söz artık "eski evimizi geri alacağım, pastanı orada keseriz"; Orta Sınıf töreninde ev geri alınır, pasta gelir, anne yanında ("Sen bana hep yettin"); saray sözü kalktı. Milyarder töreninde Bülent Bey emekliye ayrılır, otellerin onur başkanı olur; metinlerde kimsenin yaşı söylenmez.
- **Olay kartları:** 50 kart; her yöneticinin 3 kartı işletmenin görünümüne bağlı (yeni görünüm yeni kartı ekler, eskiler destede kalır); üç tür (sağlamcı/cesur, teşekkür, iki eşit seçenek); deste düzeni (hepsi çalmadan tekrar yok); **günlük sınır yok**.
- **Mağaza:** afiş tarzı (referans Idle Guy); ödüller miktarla ("+$277 Bin"); Bedava bölümü (sahnedeki reklamlar); Rahat Paket'e 3 saatlik gelir; reklam ve reklamsız simgeleri yeni (kırmızı oynat düğmesi; reklamsızda altın yasak çemberi resmin içinde, 2026-10-22); her gün bir teklif kartı ana ekranda (alınmamış paket, sırayla); kartın düğmesinde fiyat yazar ve doğrudan satın aldırır, hoş geldin fiyatında altında "Sonra $2.99"; "Şimdi değil" yok, büyük çarpı 2 sn sonra gelir (2026-10-22).
- **Ödül hissi:** uçan para yeşil banknot (bozuk para yok); para ödüllerinin tutarı her zaman banknotla gösterilir, büyük ödül daha büyük para (2026-10-22); para yağmurunda bütün yerler dolar, iki kat sık; şişe $2 / $20 / $50 (Sokak $2 kaldı, 2026-10-22); hedef rozetinde ×3 reklamı "Ödülü al"ın yanında.
- **İşletmeler ekranı:** onaylanan taslak gerçek oyunda (yukarıda).
- **Crashlytics** eklendi; Firebase'de kullanıcının yapacağı ayar yok (istenirse Crashlytics sayfası bir kez açılır).
- **Yayın derlemesi** DEV menüsünü kendisi kapatır (`build:v2`).

## Telefonda test listesi (AAB 31)

Kurulum: dahili testten (Play sürümü) ya da `npm run phone -- --install` (DEV sürümü, ayrı uygulama "Prestige DEV"). Bulgular gelince madde buradan silinir.

**Daha önce denendi, sorun yok (AAB 28–29):** güncellemede kayıt, mağaza ve yerel para birimi, Başlangıç Paketi'nin ödülleri, Rahat Paket'le "Hemen al ×2", kıyafetlerin sınıf kilidi, akıcılık, TR/EN metinler, bildirimler.

1. **İlk saat:** el ilanı → bulaşıkçı → tezgâh, şişe ve tezgâh turunun hissi, "Çalıştır", ilk yönetici (Rıza Amca), hedef rozeti ve "Git".
2. **İşletmeler ekranı (yeni):** kısa satırlar, resme dokunup çalıştırma, aşama çubuğu, yönetici şeridi ve "İşe al", ayrıntı penceresi, yeni bina şovu, şube; rehberin işaret ettiği düğmeler.
3. **Kariyer:** sekmeli ağaç (telefon genişliğinde kutuların dizilişi, çizgiler), şart penceresi ve "Git", ustalık halkası, kurs başlatma, eşya alıp meslek açma.
4. **Reklamlar ve mağaza:** 19 yerin düğmeleri, gerçek test reklamı, Rahat Paket'le reklamsız ödül, Şans'ı çağır, fırsat balonu, para yağmuru (yoğunluk, 30 sn geri sayım), hedefte ×3; yeni mağaza, Bedava bölümü, günlük teklif kartı; yeşil banknot uçuşu.
10. **Yeni içerik:** 3D önsöz, yeni olay kartları (teşekkür ve seçenek kartları), fularlı okşama pozu, Orta Sınıf'ta pasta, Crashlytics deneme çökmesi (DEV).
5. **Sınıflar:** Gündelikçi → İşçi → Orta Sınıf (tasma kartı, toplamanın bitişi, olay kartları, yatırım) → Milyoner (ilk kendi ev, gümüş tasma, puanlama penceresi). Milyarder ve 80 yaş DEV sürümüyle.
6. **Yaşa bağlı anlar:** 25 / 28 / 31, 60+ dede görünümü, 63 ve 70, 80'de "Torununun hikâyesi yakında".
7. **Günlük ödül ve çevrimdışı kartı:** ertesi gün, ×2 reklamı, kapat-aç sonrası aynı tutar.
8. **Dikey sütun, ses ve müzik:** tablette ortada dikey oyun; telefonu yan çevirince dönmemesi; dört müziğin geçişleri, Ayarlar'daki iki anahtar, arka planda sesin susması.
9. **Para:** Başlangıç Paketi'nin hoş geldin fiyatının 3 gün sonra $2,99'a dönmesi, "Satın alımları geri yükle".

## Kullanıcının yapacakları

- **Play Console:**
  - AAB 31 derlenince dahili teste yüklemek (AAB 30 hiç yüklenmedi, atlanabilir); sonra üretim erişimi başvurusu.
  - Mağaza sayfası: web sitesi `https://mathgamesstudio.com` (AdMob `app-ads.txt`'yi buradan okur), gizlilik politikası `https://mathgamesstudio.com/games/prestige-life/privacy`.
  - Başlangıç Paketi açıklamasına fuların bonusu (metin [monetization-v2.md §8](./monetization-v2.md)).
  - Veri güvenliği beyanı v2'ye göre ([monetization-v2.md §7](./monetization-v2.md)).
  - v1'in 8 ürününü pasifleştirmek.
  - Mağaza görselleri `~/Downloads/play-store-v2/` (6 ekran × TR/EN, özellik grafiği, ikon 512). Ekran görüntüleri eski ekonomiden; yeni işletme kartı ve iş panosuyla yenilenebilir (kaynak `art/store-v2/`, `capture.mjs` / `compose.mjs` / `feature.mjs`; `playwright-core` projede yok, yerel bir kopya gerekir).
- **Seçimler:** uygulama ikonu (A, B, C adayları) ve özellik grafiği (C, D) ([art-prompts-v2.md §1](./art-prompts-v2.md)). Para serisi (M1–M6) 2026-10-22'de oyunda: üst bardaki bakiye M3, uçan para ve işletme baloncukları M2 (kullanıcı: tek banknot değil, altın bantlı deste), günlük ödül takvimi M1–M4, ödül kartlarında tutara göre M2–M5, Başlangıç Paketi M3, Rahat Paket M4, para çantaları M2–M6 (`ui/icons.ts` `MONEY`, `ui/piles.ts`). 2026-10-21 teslimi oyunda ([archive/art-prompts-2026-10-21.md](./archive/art-prompts-2026-10-21.md)).
- **`npm run backup`:** `art/` klasörüne 2026-10-21'de yeni GPT görselleri geldi; Drive'a yedeklenmedi.
- **AdMob:** Play'de web sitesi girildikten sonra app-ads.txt doğrulaması (AdMob → Uygulamalar); Ayarlar → Test cihazları'na telefon.
- **Oyuncu gözlemi:** 6–8 tanıdıkla (kapalı test verisi çoğunlukla kendi hesapların).

## Çalışma kuralları (kullanıcı, 2026-10-21: konuşulanlar yarım kalıyor, aynı şeyi birkaç kez söylemek zorunda kaldım)

- **Her istek bir yere yazılır.** Kullanıcının bir mesajındaki her madde ya aynı turda yapılır ya da bu belgenin "Sıradaki" bölümüne (karar bekliyorsa discussion-notes'a) yazılır; hiçbiri sadece sohbette kalmaz.
- **Karar verilince belgeye geçer:** yukarıdaki "oturumun kararları" bölümü ve ilgili belge (tasarım, hikâye, monetizasyon) aynı commit'te güncellenir.
- **"Yaptım" demeden önce:** commit'li ve ekranda görülmüş olmalı (tarayıcıda ya da telefonda); kullanıcıya nerede göreceği söylenir (geliştirme sunucusu mu, hangi AAB).
- **Zaten var olan bir şey istenirse** (ör. para yağmurunun geri sayımı) bunu açıkça söyle ve nerede olduğunu göster.
- **Doğrulama komutu `npm run typecheck`**; `npx tsc -p .` hiçbir dosyayı denetlemiyor (kök tsconfig boş, 2026-10-21'de fark edildi).
- **Oturum sonunda** bu belge yeniden yazılır: Sıradaki, kararlar, test listesi güncel.

## Kurallar

**Kayıt uyumluluğu (kullanıcı, 2026-10-14):** yayından sonra her güncelleme oyuncunun kaydını korumalı. Kod `src/game/runtime/storage.ts`.

- **Kimlikler değişmez:** kayıtta duran bir id (işletme, eşya, ev, meslek, kurs, hedef, an, mağaza ürünü) yeniden adlandırılmaz, silinmez; gerekirse eskisi yenisine eşlenir.
- **Yeni alan varsayılanla gelir:** `normalize*()` her alanı tek tek okur; yeni sistem eski oyuncuya bir anda onlarca kart ya da tören yaşatmaz.
- **Alınmış olan geri alınmaz:** kural sıkılaşsa da sahip olunan kalır; sınıf hediyeleri `applyClassFloors` ile eksikse verilir.
- **Şema:** `SAVE_SCHEMA` yalnızca `migrate()`'e adım eklenerek artırılır; okunamayan kayıt `prestige_life_v2_unreadable`'a yedeklenir. Şema 2'nin tek seferlik temiz başlangıcı yayından önceydi (2026-10-21; kullanıcı telefonda gördü ve yeniden vurguladı); yayından önce de bir daha yapılmaz.
- **Kayıt anahtarı** `prestige_life_v2` ve uygulama kimliği değişmez.
- **Denetim:** `npm run savecheck` (2026-10-21) `scripts/save-fixtures/` içindeki her eski kaydı bugünün koduyla açar ve ilerlemenin tamamını arar (para, kazanç, sınıf, yaş, iş ve deneyim, kurslar, işletmeler, yöneticiler, şubeler, eşyalar, evler, törenler, kahramanın adı, satın almalar). Kaydı etkileyen her değişiklikte çalışır. Şema her arttığında yükseltmeden önce `npm run savecheck -- --snapshot schemaN-midgame` ile o şemanın örnek kaydı eklenir; örnek kayıtlar sonradan hiç düzenlenmez (eski telefonlarda duran budur).

**Ekran kuralı:** yeni bir açılır kart `createPortal(..., portalRoot())` kullanır (`document.body` değil); ekrandan ölçülen nokta sütuna `toStage()` ile çevrilir; `vw` yerine `var(--stage-w)`.

**İçerik bayrakları:** lansmanın neyi içerdiği `core/config/content.ts`'te (`handover`, `legacy`, `bradStory`, hepsi kapalı). Ekranlar, hikâye ve simülatör yalnız bunlara bakar.

## Çalıştırma

- `npm run dev:v2` (tarayıcıda DEV menüsü açık); `npm run sim`; `npm run typecheck`; `npx eslint src/game`.
- **Telefon:** `npm run phone` (Android, kablosuz ya da USB; port değişince `-- PORT`, yerel eklenti değişince `-- --install`). DEV sürümü ayrı uygulama: `com.prestigelife.idletycoon.dev`, "Prestige DEV", kendi kaydı var. Kullanıcının telefonu Samsung Galaxy S24+ (Android 16). Gradle için `JAVA_HOME` Android Studio'nun Java 21'i.
- **AAB:** `npm run cap:sync:v2`, sonra `android/` içinde `./gradlew bundleRelease` (imza `android/keystore.properties`; `build:v2` DEV menüsünü kendisi kapatır, test reklamı yalnız geliştirme sunucusunda açık); çıktı `android/app/build/outputs/bundle/release/app-release.aab` → `~/Downloads/prestige-life-v2-<kod>.aab`. Sonraki sürümde `android/app/build.gradle` `versionCode` bir artar.
- **Kod:** `src/game/` (çekirdek `core/`, simülatör `sim/`, `runtime/`, `i18n/`, `ui/`). Yapı [game-design-v2.md §7](./game-design-v2.md).
- **Görseller:** önce GPT (komutu Claude yazar), gerekirse fal.ai. Kaynaklar `art/` (git'te değil), oyundakiler `public/assets/` (webp: işletme ve ikonlar 384 px, yönetici portresi 256 px); kurallar [art-brief-v2.md](./art-brief-v2.md), stil [story-v2.md §8](./story-v2.md). Git dışı klasörler Drive'da yedekli; yeni görselden sonra `npm run backup`.
- **Stüdyo sitesi:** `https://mathgamesstudio.com` (Cloudflare Pages; oyun sayfası, destek, `app-ads.txt`, gizlilik politikası).

## Uygulama kimliği

- Paket `com.prestigelife.idletycoon` · Prestige Life: Idle Tycoon · yayıncı Math Games Studio (`mathgamesstudio@gmail.com`, `mathgamesstudio.com`)
- AdMob App ID: Android `ca-app-pub-8950990027285549~9898475278`, iOS `ca-app-pub-8950990027285549~3253175874`; ödüllü birim `runtime/ads.ts`. GDPR mesajı yayında.
- Firebase projesi `prestige-life-idle-tycoon`; RevenueCat → Firebase entegrasyonu panelde.
