# Session Handoff

Son güncelleme: 2026-10-15 · Dal: `v2-rebuild` · Son sürüm: **AAB 28** (`versionCode` 28, `versionName` 2.0)

Yeni bir oturumda projeye hızlı dönmek için güncel durum. Oyun v2 olarak yeniden yapılıyor; v1 dondu ve Faz 2.11'de kaldırılacak. Bu belge günlük tutmaz: her oturum sonunda **güncel durumu yansıtacak şekilde yeniden yazılır**. Kararların gerekçesi ve sayılar ilgili belgededir; burada yalnızca özet ve yapılacaklar durur.

## Belgeler

| Belge | Soru | Not |
| --- | --- | --- |
| [game-design-v2.md](./game-design-v2.md) | **Ne?** Kurallar ve sayılar | Tek doğruluk kaynağı; rapordan sapmalar §9 |
| [story-v2.md](./story-v2.md) | Hikâye, karakterler, ton, metinler, görsel stil kılavuzu | |
| [monetization-v2.md](./monetization-v2.md) | Reklam ve IAP | Ürünler, mağaza kurulumu, veri güvenliği beyanı, destek akışı |
| [rebuild-plan.md](./rebuild-plan.md) | **Ne zaman?** Fazlar ve görevler | Yapılanlar işaretli |
| [discussion-notes.md](./discussion-notes.md) | Kararı bekleyen konular | Yalnızca açık konular |
| [art-brief-v2.md](./art-brief-v2.md) | Görsel listesi, boyutlar, oyuna bağlama | |
| [art-prompts-v2.md](./art-prompts-v2.md) | GPT'ye yapıştırılacak hazır komutlar | Yeniden üretim için duruyor |
| [mobile-ad-integration.md](./mobile-ad-integration.md) | v2 reklam altyapısı | |
| [report-v2.md](./report-v2.md) | **Neden?** | Değişmez; tasarım belgesiyle çelişirse tasarım geçerli |
| [archive/](./archive/) | Bitmiş teslimler ve incelemeler | Yalnızca geçmiş için |
| [v1/](./v1/) | v1 arşivi | v2 işinde okunmaz |

## Oyunda olanlar (özet)

Ayrıntılar tasarım ve hikâye belgelerinde. Telefonda **gerçek cihazda neredeyse hiçbir şey denenmedi** (aşağıda "Telefonda test listesi").

- **Ekonomi:** 10 işletme (+ yükseltmeler, yöneticiler), 12 basamak kariyer, 8 sınıf, 12 ev (kirala → satın al → kiraya ver), 12 araç (ev–araç zinciri), 7 kıyafet, 4 lüks, Şans'ın tasmaları (deri %2, gümüş %4, altın %6), yaş ve ömür (17 → 80, ~17 saatlik oyun), miras, hedefler, Zenginler Listesi. `npm run sim` tempo ve his hedefleri.
- **Hikâye:** önsöz (6 kare), 7 sınıf töreni (hepsinin kendi karesi), tasma kartı, annenin 11 mesajı, yaşa bağlı 3 hayat anı, 4 lüks anı, 10 olay kartı, Zenginler Listesi'nin 6 kartı, aile albümü, emeklilik paneli. Kapanış kartında ve hayat anlarında hediye (10 dk gelir, reklamla ×2).
- **Ana ekran:** oturulan ev ve önünde araç, kahraman (kıyafetine göre pozlar), Şans (cüzdan getirir, tasması sınıfı izler), yerden toplama (Orta Sınıf'ta biter), ince hedef kartı (8 sn sonra kendiliğinden kapanır), solda albüm / Zenginler Listesi / Mağaza, sağda ×2 hızlandırıcı. Rıza Amca rehberi.
- **Para:** 5 ödüllü reklam yeri (çevrimdışı +%30, Şans ×2, 1 saatlik ×2, biraz yardım, hediye ×2); Mağaza ve 3 ürün (Rahat Paket $7,99; Başlangıç Paketi $2,99, ilk 3 gün hoş geldin fiyatı $1,49); geri yükleme; Play puanlama penceresi (Milyoner'den sonra).
- **Altyapı:** kayıt Preferences'ta, Android geri tuşu, güvenli alanlar, yerel bildirimler, Firebase Analytics, TR + EN.

## Son oturum (2026-10-14 → 15)

- **Şans'ın tasmaları gelir veriyor:** deri / gümüş / altın %2 / %4 / %6, yalnız takılı olan; törende "Şans'ın yeni tasması!" kartı (önce / şimdi, +%0 → +%2). Gümüş tasma görselleri oyunda; yakut tasmanın üç görseli hazır (`public/assets/scene/sans-*-ruby.webp`).
- **Fular kalıcı +%10**, ücretli aksesuarlar ayrı çarpan (`GameStateV2.accessoryMultiplier`, satın almalardan her açılışta hesaplanır).
- **Yakut Tasma +%50** (kalıcı ×2'nin yerine; altın tasma artık bedava): ürün 2. adımda.
- **Başlangıç Paketi:** ilk 3 gün $1,49 (`v2_starter_pack_welcome`), sonra $2,99 ve hep satışta; "%50 indirim" yerine "Hoş geldin fiyatı · Sonra $2,99".
- **Hedef kartı inceldi:** evi kapatıyordu.
- **Tekne anı yeni kare:** mağazadaki sürat teknesinin aynısı.
- **Simülatör:** "fular" ve "reklam + fular + yakut" profilleri; Milyarder hedefinin alt sınırı 2. gün 20:00 (gümüş tasma yüzünden; kullanıcı kabul etti).
- **Belgeler toparlandı:** bitmiş teslimler `archive/`'e taşındı, eskimiş yerler güncellendi, açık konular [discussion-notes.md](./discussion-notes.md)'de.
- **AAB 28 derlendi:** `~/Downloads/prestige-life-v2-28.aab` (41 MB, imzası doğrulandı, DEV menüsü ve test reklamı kapalı). Telefona kurulup denenmedi.

## Sıradaki

1. **AAB 28'i dahili teste yükle ve telefonda dene (kullanıcı).** Lisans hesabıyla üç ürün: ödüller geliyor mu, RevenueCat → Customers, Firebase Realtime'da `purchase` ve `purchase_applied`. Puanlama penceresi Milyoner'e ulaşmış kayıtta, ikinci oturumda. Sonra "Telefonda test listesi".
2. **Kapalı test:** sorun yoksa aynı sürüm kapalı test kanalına. 14 gün ~2026-10-20'de doluyor; testçiler listede kalmalı, sonra Play'den yayın erişimi başvurusu.
3. **Telefondan gelen bulguları düzeltmek**, gerekiyorsa AAB 29.
4. **Faz 2'ye geçiş:** öncelik zirve sonrası (plan 2.12; adaylar [discussion-notes §2](./discussion-notes.md)) ve günlük ödül (2.7). Sonra Yakut Tasma ve Gece Vardiyası (IAP 2. adım), Remote Config (2.10).
5. **Faz 1'in küçük kalanları:** oyun testi paketi (1.15: anket, test notları), hayaller panosu (1.8), fuların bütün pozlarda görünmesi ([discussion-notes §1](./discussion-notes.md)).

**Sürüm derleme:** sürüm kodunu artır (`android/app/build.gradle`), sonra `VITE_DEV_MENU=false VITE_ADMOB_TESTING=false npm run build:v2 && npx cap sync android`, ardından `android/`'da `./gradlew bundleRelease` (`JAVA_HOME` Android Studio'nun Java'sı). Ortam değişkenleri şart: `.env.v2` DEV menüsünü, `.env.local` test reklamını açık tutuyor. Çıktı `android/app/build/outputs/bundle/release/app-release.aab`; `~/Downloads/prestige-life-v2-<kod>.aab` adıyla kopyalanır.

## Kullanıcının yapacakları

- **Play Console:**
  - AAB 28 → dahili test, sonra kapalı test.
  - Başlangıç Paketi açıklamasına fuların bonusu (metin [monetization-v2.md §8](./monetization-v2.md) "Mağaza kurulumu").
  - Veri güvenliği beyanı v2'ye göre (cevaplar [monetization-v2.md §7](./monetization-v2.md)).
  - Lisans testi: Ayarlar → Lisans testi'nde telefonun Google hesabı (geliştirici hesabıysa zaten testçi).
  - v1'in 8 ürününü pasifleştirmek.
  - Ürünler tanımlı (2026-10-15): `v2_comfort_pack` $7,99, `v2_starter_pack` $2,99, `v2_starter_pack_welcome` $1,49; RevenueCat'te üçü non-consumable.
- **Mağaza sayfası:** ekran görüntüleri (4 × TR/EN, `~/Downloads/play-store-v2/`, kaynak ve betikler `art/store-v2/`), ikon ve özellik grafiği (`art/store-v2/`) Play'e yüklenecek. Telefondaki uygulama ikonu (`android/.../mipmap-*`) hâlâ v1'inki.
- **AdMob:** yayından önce `app-ads.txt` (stüdyo sitesiyle), Ayarlar → Test cihazları'na telefon.
- **Test kullanıcısı listesi:** Faz 1 oyun testi için 20–50 kişi.
- **Telefonda test listesi** (aşağıda).

## Telefonda test listesi

Kurulum: dahili testten (Play sürümü) ya da `npm run phone -- --install` (DEV sürümü, ayrı uygulama "Prestige DEV"). Bulgular gelince madde buradan silinir.

1. **Satın alma ve puanlama** (yalnız Play sürümü): üç ürün, geri yükleme, Rahat Paket sonrası "Hemen al" düğmeleri, Başlangıç Paketi'nin hoş geldin fiyatı ve yerel para birimi, Milyoner sonrası puanlama penceresi.
2. **Törenler** (DEV → "Töreni oynat" 1–7): kareler balonun altında kalıyor mu, kahramanın yüzü kıyafetle uyuşuyor mu, kapanış kartı, 3 / 4 / 5'te tasma kartı, hediye ve "Reklam izle ×2". Tören bitince sahne değişiyor mu.
3. **Sahne:** ev 7 ve ev 10'da araçların boyu, yedi kıyafetin pozları, tasmalar (gerçek sınıf atlamayla), fular (oturan Şans'ta), hedef kartı evi kapatıyor mu, sol ve sağ düğmeler kahramanı ya da evi kapatıyor mu.
4. **Ekranlar:** İşletmeler (A görünümü; DEV'den Eski / A / B, sonra B ve seçici kaldırılabilir), rehberin eli ilk dakikalarda doğru düğmede mi, Kariyer, Alışveriş, Lüks resimlerinde gri kenar kalıntısı.
5. **Albüm, hayat anları, emeklilik, Zenginler Listesi:** DEV → "Hayat anını oynat", "Kahramanı yaşlandır +40" iki kez (emeklilik paneli ve devir), liste kartları.
6. **Çevrimdışı ve reklam** (DEV'de Google'ın test reklamı): uyuyan Şans kartı, "+%30", ×2 hızlandırıcı, Şans ×2, "biraz yardım".
7. **Olay kartları:** çağrı düğmesinin yeri, iki cevap, kapat-aç sonrası ödül bakiyede mi.
8. **Bildirim ve annenin mesajı:** DEV → "Deneme bildirimi (5 sn)", Ayarlar'daki anahtar.
9. **Erken oyun (yeni kayıtla):** tezgâha ve ilk yöneticiye kadar boşluk var mı, Şans sık geliyor mu, hedef sırası ve rehber.
10. **Genel:** Android geri tuşu, güvenli alanlar, akıcılık, Firebase DebugView (`adb shell setprop debug.firebase.analytics.app com.prestigelife.idletycoon.dev`; Play sürümünde `.dev` olmadan).

## Kurallar

**Kayıt uyumluluğu (kullanıcı, 2026-10-14):** yayından sonra her güncelleme oyuncunun kaydını korumalı. Kod `src/game/runtime/storage.ts`.

- **Kimlikler değişmez:** kayıtta duran bir id (işletme, eşya, ev, hedef, yükseltme, an, mağaza ürünü) yeniden adlandırılmaz, silinmez; gerekirse eskisi yenisine eşlenir (`legacyOutfitIndex`, `legacyVehicleCount`, `LEGACY_HOUSE_TO_HOME`).
- **Yeni alan varsayılanla gelir:** `normalize*()` her alanı tek tek okur; yeni sistem eski oyuncuya bir anda onlarca kart ya da tören yaşatmaz.
- **Alınmış olan geri alınmaz:** kural sıkılaşsa da sahip olunan kalır; sınıf hediyeleri `applyClassFloors` ile eksikse verilir.
- **Şema:** `SAVE_SCHEMA` yalnızca `migrate()`'e adım eklenerek artırılır; okunamayan kayıt `prestige_life_v2_unreadable`'a yedeklenir.
- **Kayıt anahtarı** `prestige_life_v2` ve uygulama kimliği değişmez.
- **Denetim:** kaydı etkileyen her değişiklikte eski bir kayıtla açılış denenir (DEV kaydı ya da betikle `parseRuntime`).

**Bilinen küçük sorunlar:**
- 320 px'de üst bardaki para kısalıyor.
- Uçan paralar, çevrimdışı kartından hemen sonra açılan hikâye kartının üstünden geçiyor.
- Türkçede "OTOMATİK" rozeti üretim çubuğuna değiyor.
- v2'nin kullanmadığı `vehicles/` PNG'leri ve `icons/` (~3,5 MB) pakette.

## Çalıştırma

- `npm run dev:v2` (tarayıcıda DEV menüsü açık); `npm run sim`; `npm run typecheck`; `npx eslint src/game`.
- **Telefon:** `npm run phone` (Android, kablosuz ya da USB; port değişince `-- PORT`, yerel eklenti değişince `-- --install`). DEV sürümü ayrı uygulama: `com.prestigelife.idletycoon.dev`, "Prestige DEV", kendi kaydı var, Play sürümünün yanında durur. Kullanıcının telefonu Samsung Galaxy S24+ (Android 16). Gradle için `JAVA_HOME` Android Studio'nun Java 21'i.
- **Kod:** `src/game/` (çekirdek `core/`, simülatör `sim/`, `runtime/`, `i18n/`, `ui/`). Mimari [rebuild-plan.md](./rebuild-plan.md).
- **Görseller:** çoğu GPT (yerleşik görsel üretimi; komutlar [art-prompts-v2.md](./art-prompts-v2.md)), bir kısmı fal.ai (bakiye ~$2,5 kaldı). Kaynaklar `art/` (git'te değil), oyundakiler `public/assets/`; stil kılavuzu [story-v2.md §8](./story-v2.md). Git dışı klasörler Drive'da yedekli; yeni görselden sonra `npm run backup`.
- **Gizlilik politikası:** `https://mustafaalin.github.io/Prestige-Life-Idle-Tycoon/privacy-policy.html` (kaynak `docs/privacy-policy.html`; GitHub Pages `main`'den yayınlar, değişiklik `main`'e de alınmalı).

## Uygulama kimliği

- Paket `com.prestigelife.idletycoon` · Prestige Life: Idle Tycoon · yayıncı Math Games Studio (`mathgamesstudio@gmail.com`; ileride stüdyo sitesi)
- AdMob App ID: Android `ca-app-pub-8950990027285549~9898475278`, iOS `ca-app-pub-8950990027285549~3253175874`; ödüllü birim `runtime/ads.ts`. GDPR mesajı yayında.
- Firebase projesi `prestige-life-idle-tycoon`; RevenueCat → Firebase entegrasyonu panelde.
