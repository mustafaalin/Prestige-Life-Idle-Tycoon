# Session Handoff

Son güncelleme: 2026-10-21 · Dal: `v2-rebuild` · Son sürüm: **AAB 30** (`versionCode` 30, `versionName` 2.0; derlendi, Play'e yüklenmedi)

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

- **Ekonomi (yeniden kuruldu 2026-10-20/21):** gerçekçi takvim (1 ay = 80 sn, 1 yıl = 16 dk, gerçek maaş ve fiyatlar); 14 işletme, her biri 10 seviye + şube, üç görünüm; 63 meslek şartla açılır, 16 kurs, 4 meslek açan eşya, iş panosu; 12 ev (kirala → satın al → kiraya ver), 12 araç, 7 kıyafet, 4 lüks (gelir bonusu yok); Şans'ın tasmaları (%2 / %4 / %6); çevrimdışı %20, en çok 1 sa; 8 sınıf, 1. nesilde Milyarder'e kadar (~70 yaş). Kayıt şeması 2.
- **Hikâye:** önsöz (6 kare), 5 sınıf töreni (Gündelikçi → Milyarder; Multimilyarder ve En Zengin torunla), annenin mesajları, hayat anları (25, 28, 31, 63, 70), 4 lüks anı, 10 olay kartı, Zenginler Listesi, aile albümü, 60+ dede görünümü. 80'de kahraman kalır: bir kez "Torununun hikâyesi yakında" kartı, oyun sürer. Burak hikâyesi, devir, miras, Aile sekmesi ve Lumen kodda duruyor ama kapalı (`config/content.ts`).
- **Ana ekran:** oturulan ev ve önündeki araç, kahraman, Şans, yerden toplama (Orta Sınıf'ta biter), hedef rozeti, gelir dökümü, hayaller panosu, ×2 hızlandırıcı, Şans'ı çağır, fırsat balonu; alt menüde İşletmeler, Kariyer, Alışveriş, Yatırım. Rıza Amca rehberi.
- **Para:** 19 ödüllü reklam yeri, kilitsiz (reklam izleyen Milyarder'e %47 erken); Mağaza: Rahat Paket $7,99 (reklamsız), Başlangıç Paketi $2,99 (ilk 3 gün $1,49); geri yükleme; Play puanlama penceresi.
- **Görseller:** 1. neslin bütün görselleri oyunda; son gelen 91'i (14 işletmenin üçer görünümü, 4 yeni yönetici, 51 meslek ve 4 eşya ikonu) 2026-10-21'de bağlandı.
- **Altyapı:** kayıt Preferences'ta, Android geri tuşu, güvenli alanlar, yalnız dikey (tablette ortada dikey sütun), yerel bildirimler, Firebase Analytics, ses ve müzik, TR + EN.

## Sıradaki

1. **AAB 30'u telefonda denemek** (aşağıdaki liste). Play'deki son sürüm AAB 29: 2026-10-15'ten sonraki her şey (ekonominin yeniden kurulması dahil) ilk kez AAB 30'la telefona gidiyor. Şema 2 yüzünden AAB 29 kaydı bir kez sıfırdan başlar (mağaza alımları kalır); yayından sonra bu bir daha yapılmaz.
2. **Telefon bulgularına göre düzeltme**, özellikle reklam düğmesi kalabalığı (bir işletme kartında 3–4 düğme görünebiliyor) ve yeni ekonominin ilk saati.
3. **Lansman hazırlığı:** kapalı test 14 günü doldu (~2026-10-20) → Play'den üretim erişimi başvurusu; Play Console işleri (aşağıda); uygulama ikonu ve özellik grafiği seçimi.
4. **Sonra:** IAP 2. adım (Yakut Tasma, Gece Vardiyası), Remote Config, Crashlytics, oyuncuyu tutma önerileri ([discussion-notes.md §2](./discussion-notes.md)). 2. nesil (Ada, Lumen, devir) yayından sonra.

## Telefonda test listesi (AAB 30)

Kurulum: dahili testten (Play sürümü) ya da `npm run phone -- --install` (DEV sürümü, ayrı uygulama "Prestige DEV"). Bulgular gelince madde buradan silinir.

**Daha önce denendi, sorun yok (AAB 28–29):** güncellemede kayıt, mağaza ve yerel para birimi, Başlangıç Paketi'nin ödülleri, Rahat Paket'le "Hemen al ×2", kıyafetlerin sınıf kilidi, akıcılık, TR/EN metinler, bildirimler.

1. **İlk saat:** el ilanı → bulaşıkçı → tezgâh, şişe ve tezgâh turunun hissi, "Çalıştır", ilk yönetici (Rıza Amca), hedef rozeti ve "Git".
2. **İşletme kartı:** seviye noktaları, "Geliştir", 8. ve 10. seviyede yeni görünüm ve "büyüdü!" kartı, şube satırı; yeni görsellerin kartta boyu; reklam düğmelerinin kalabalığı.
3. **Kariyer:** iş panosu, şart satırları ve "Git", kurs başlatma, eşya alıp meslek açma, yeni meslek ikonları.
4. **Reklamlar:** 19 yerin düğmeleri, gerçek test reklamı, Rahat Paket'le reklamsız ödül, Şans'ı çağır, fırsat balonu, bozuk para yağmuru.
5. **Sınıflar:** Gündelikçi → İşçi → Orta Sınıf (tasma kartı, toplamanın bitişi, olay kartları, yatırım) → Milyoner (ilk kendi ev, gümüş tasma, puanlama penceresi). Milyarder ve 80 yaş DEV sürümüyle.
6. **Yaşa bağlı anlar:** 25 / 28 / 31, 60+ dede görünümü, 63 ve 70, 80'de "Torununun hikâyesi yakında".
7. **Günlük ödül ve çevrimdışı kartı:** ertesi gün, ×2 reklamı, kapat-aç sonrası aynı tutar.
8. **Dikey sütun, ses ve müzik:** tablette ortada dikey oyun; telefonu yan çevirince dönmemesi; dört müziğin geçişleri, Ayarlar'daki iki anahtar, arka planda sesin susması.
9. **Para:** Başlangıç Paketi'nin hoş geldin fiyatının 3 gün sonra $2,99'a dönmesi, "Satın alımları geri yükle".

## Kullanıcının yapacakları

- **Play Console:**
  - AAB 30'u dahili teste yüklemek (`~/Downloads/prestige-life-v2-30.aab`); sonra kapalı test ve üretim erişimi başvurusu.
  - Mağaza sayfası: web sitesi `https://mathgamesstudio.com` (AdMob `app-ads.txt`'yi buradan okur), gizlilik politikası `https://mathgamesstudio.com/games/prestige-life/privacy`.
  - Başlangıç Paketi açıklamasına fuların bonusu (metin [monetization-v2.md §8](./monetization-v2.md)).
  - Veri güvenliği beyanı v2'ye göre ([monetization-v2.md §7](./monetization-v2.md)).
  - v1'in 8 ürününü pasifleştirmek.
  - Mağaza görselleri `~/Downloads/play-store-v2/` (6 ekran × TR/EN, özellik grafiği, ikon 512). Ekran görüntüleri eski ekonomiden; yeni işletme kartı ve iş panosuyla yenilenebilir (kaynak `art/store-v2/`, `capture.mjs` / `compose.mjs` / `feature.mjs`; `playwright-core` projede yok, yerel bir kopya gerekir).
- **Seçimler:** uygulama ikonu (A, B, C adayları) ve özellik grafiği (C, D) ([art-prompts-v2.md §1](./art-prompts-v2.md)); GPT'de önsözün 5 karesi (§2).
- **AdMob:** Play'de web sitesi girildikten sonra app-ads.txt doğrulaması (AdMob → Uygulamalar); Ayarlar → Test cihazları'na telefon.
- **Oyuncu gözlemi:** 6–8 tanıdıkla (kapalı test verisi çoğunlukla kendi hesapların).

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
- **AAB:** `npm run cap:sync:v2`, sonra `android/` içinde `./gradlew bundleRelease` (imza `android/keystore.properties`; DEV menüsü ve test reklamı kapalı olmalı); çıktı `android/app/build/outputs/bundle/release/app-release.aab` → `~/Downloads/prestige-life-v2-<kod>.aab`. Sonraki sürümde `android/app/build.gradle` `versionCode` bir artar.
- **Kod:** `src/game/` (çekirdek `core/`, simülatör `sim/`, `runtime/`, `i18n/`, `ui/`). Yapı [game-design-v2.md §7](./game-design-v2.md).
- **Görseller:** önce GPT (komutu Claude yazar), gerekirse fal.ai. Kaynaklar `art/` (git'te değil), oyundakiler `public/assets/` (webp: işletme ve ikonlar 384 px, yönetici portresi 256 px); kurallar [art-brief-v2.md](./art-brief-v2.md), stil [story-v2.md §8](./story-v2.md). Git dışı klasörler Drive'da yedekli; yeni görselden sonra `npm run backup`.
- **Stüdyo sitesi:** `https://mathgamesstudio.com` (Cloudflare Pages; oyun sayfası, destek, `app-ads.txt`, gizlilik politikası).

## Uygulama kimliği

- Paket `com.prestigelife.idletycoon` · Prestige Life: Idle Tycoon · yayıncı Math Games Studio (`mathgamesstudio@gmail.com`, `mathgamesstudio.com`)
- AdMob App ID: Android `ca-app-pub-8950990027285549~9898475278`, iOS `ca-app-pub-8950990027285549~3253175874`; ödüllü birim `runtime/ads.ts`. GDPR mesajı yayında.
- Firebase projesi `prestige-life-idle-tycoon`; RevenueCat → Firebase entegrasyonu panelde.
