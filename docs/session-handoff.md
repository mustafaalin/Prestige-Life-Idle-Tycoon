# Session Handoff

Son güncelleme: 2026-10-16 · Dal: `v2-rebuild` · Son sürüm: **AAB 29** (`versionCode` 29, `versionName` 2.0)

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
| [art-prompts-burak.md](./art-prompts-burak.md) | Burak hattının görselleri: kılavuz, ortaklık ve kazık kareleri | Anahtar karesi yetişkin Ada'yı bekliyor |
| [art-prompts-lumen.md](./art-prompts-lumen.md) | 2. neslin şehri Lumen: yöneticiler, evler, işletmeler, araçlar, lüksler için GPT komutları | Stil A (2026-10-16); yalnız ilk ev üretildi |
| [mobile-ad-integration.md](./mobile-ad-integration.md) | v2 reklam altyapısı | |
| [report-v2.md](./report-v2.md) | **Neden?** | Değişmez; tasarım belgesiyle çelişirse tasarım geçerli |
| [archive/](./archive/) | Bitmiş teslimler ve incelemeler | Yalnızca geçmiş için |
| [v1/](./v1/) | v1 arşivi | v2 işinde okunmaz |

## Oyunda olanlar (özet)

Ayrıntılar tasarım ve hikâye belgelerinde. Telefonda **gerçek cihazda neredeyse hiçbir şey denenmedi** (aşağıda "Telefonda test listesi").

- **Ekonomi:** 10 işletme (+ yükseltmeler, yöneticiler), 12 basamak kariyer, 8 sınıf, 12 ev (kirala → satın al → kiraya ver), 12 araç (ev–araç zinciri), 7 kıyafet, 4 lüks, Şans'ın tasmaları (deri %2, gümüş %4, altın %6), yaş ve ömür (17 → 80, ~17 saatlik oyun), miras, hedefler, Zenginler Listesi. `npm run sim` tempo ve his hedefleri.
- **Hikâye:** önsöz (6 kare), 7 sınıf töreni (hepsinin kendi karesi), tasma kartı, annenin 11 mesajı, yaşa bağlı 3 hayat anı, 4 lüks anı, 10 olay kartı, Zenginler Listesi'nin 6 kartı, aile albümü, emeklilik paneli. Kapanış kartında ve hayat anlarında hediye (10 dk gelir, reklamla ×2).
- **Ana ekran:** oturulan ev ve önünde araç, kahraman (kıyafetine göre pozlar), Şans (cüzdan getirir, tasması sınıfı izler), yerden toplama (Orta Sınıf'ta biter), solda üstte yuvarlak hedef rozeti (ilerleme halkası; biten hedefte yeşil halka, "!" ve yanında "Topla"; dokununca tüm hedefler açılır, 8 sn sonra kapanır), üst bardaki paraya dokununca gelir dökümü (`ui/home/IncomeSheet.tsx`, `incomeBreakdown()`), solda albüm / Zenginler Listesi / Mağaza, sağda ×2 hızlandırıcı. Rıza Amca rehberi.
- **Hayaller panosu:** alt menünün üstünde sıradaki ev, araç ve kıyafet, yüzdeyle; dokununca Alışveriş o eşyada açılır (plan 1.8).
- **Yatırım (Rıza Amca'nın fırsatları):** 1 / 4 / 8 saatlik vade, cesur vadede +%70 ya da −%20, en fazla 5 yıllık gelir, Orta Sınıf'ta açılır; alt menüde 4. düğme, öncesinde kilitli (game-design §4.13). DEV → "Yatırımı hemen bitir".
- **Günlük ödül:** aylık gelirin katı (×5 → ×50), 7 günlük takvim, cezasız, reklamla ×2 (game-design §4.12). DEV → "Günlük ödülü tekrar ver".
- **Para:** 6 ödüllü reklam yeri (çevrimdışı +%30, Şans ×2, 1 saatlik ×2, biraz yardım, hediye ×2, günlük ödül ×2); Mağaza ve 3 ürün (Rahat Paket $7,99; Başlangıç Paketi $2,99, ilk 3 gün hoş geldin fiyatı $1,49); geri yükleme; Play puanlama penceresi (Milyoner'den sonra).
- **Altyapı:** kayıt Preferences'ta, Android geri tuşu, güvenli alanlar, yerel bildirimler, Firebase Analytics, TR + EN.

## Son oturum (2026-10-16)

- **Burak hattı (1. nesil) oyunda, görselsiz:** 45 yaşta ortaklık anı, annenin uyarısı, 70 yaş anında iki gölge balonu, 80'de devirden önce kazık anı, devirde Ada'nın yemini ([story-v2.md §6a](./story-v2.md)). Burak isim etiketiyle konuşur; kılavuz ve iki kare GPT'yi bekliyor ([art-prompts-burak.md](./art-prompts-burak.md)). Simülatör: hedefler aynı. DEV → "Hayat anını oynat" `partner` / `betrayal`.

GPT devir görsellerini üretirken (komutlar [art-prompts-dynasty.md](./art-prompts-dynasty.md)) görselden bağımsız işler yapıldı. Tarayıcıda denendi, telefonda denenmedi.

- **Devir hikâye anları:** 63 (torunun doğumu, adını Elif sorar, varsayılan Ada), 70 (dede ve torun, çiçek tezgâhı), 80 ("Babamın saati", otogar). Metinler [story-v2.md §4c](./story-v2.md). "Şimdi devret" Aile sekmesini kapatır, "Yıllar geçti…" ekranı yaşı 80'e sayar, sonra anlar arka arkaya oynar; emeklilik paneli anlar ve isim bitince açılır. Paneldeki yeni etiket: "Varisin: Ada". Kayıtta yeni alan `story.grandchildName` (varsayılan `''`).
- **Görseller gelene kadar:** anlar sahnenin üstünde portresiz oynar, dede smokinli kahramanın yüzüyle konuşur. Görseller gelince bekleme listelerinden çıkarılacak ([art-prompts-dynasty.md §6](./art-prompts-dynasty.md)). Dede sahne görünümünün kodu hazır (60+, yalnız 1. nesil).
- **Bildirimler (plan 2.8):** "Günlük ödül hazır" ve ömür sonunda varisin mesajı; günde bir kuralı öncelik sırasıyla.
- **Küçük sorunlar:** 320 px'de para artık kısalmıyor (dar ekranda küçük yazı, uzun sınıf adı iki satır), çevrimdışı kartının paraları inmeden sıradaki kart açılmıyor, "OTOMATİK" rozeti 4 px sola alındı, v1'in `icons/` ve `vehicles/` PNG'leri v2 paketine girmiyor (`vite.config.ts`).
- Simülatör: 63 ve 70 yaş hediyeleri miras puanını ~%1 artırdı; kaçan tek hedef öncekiyle aynı.

## Önceki oturum (2026-10-14 → 15)

- **Şans'ın tasmaları gelir veriyor:** deri / gümüş / altın %2 / %4 / %6, yalnız takılı olan; törende "Şans'ın yeni tasması!" kartı (önce / şimdi, +%0 → +%2). Gümüş tasma görselleri oyunda; yakut tasmanın üç görseli hazır (`public/assets/scene/sans-*-ruby.webp`).
- **Fular kalıcı +%10**, ücretli aksesuarlar ayrı çarpan (`GameStateV2.accessoryMultiplier`, satın almalardan her açılışta hesaplanır).
- **Yakut Tasma +%50** (kalıcı ×2'nin yerine; altın tasma artık bedava): ürün 2. adımda.
- **Başlangıç Paketi:** ilk 3 gün $1,49 (`v2_starter_pack_welcome`), sonra $2,99 ve hep satışta; "%50 indirim" yerine "Hoş geldin fiyatı · Sonra $2,99".
- **Hedef kartı yuvarlak rozete döndü:** ince kart da evi kapatıyordu.
- **Gelir dökümü:** aylık gelire dokununca kaynaklar (yöneticili işletmeler, maaş, kira) ve bonuslar (kariyer, ev, tasma, araç/kıyafet/lüks, aile itibarı, fular, ×2) görünür.
- **Olay kartında gerçek risk:** tutmayan cesur cevap 20 sn'lik geliri alır (+130 / −20, ortalama aynı; game-design §4.7); kayıp düğmede kırmızı yazar, kapanınca paralar cüzdandan dökülür. Kayıp cümleleri paranın nereye gittiğini söyler. Arama düğmesi telefon gibi titrer.
- **Tekne anı yeni kare:** mağazadaki sürat teknesinin aynısı.
- **Simülatör:** "fular" ve "reklam + fular + yakut" profilleri; Milyarder hedefinin alt sınırı 2. gün 20:00 (gümüş tasma yüzünden; kullanıcı kabul etti).
- **Belgeler toparlandı:** bitmiş teslimler `archive/`'e taşındı, eskimiş yerler güncellendi, açık konular [discussion-notes.md](./discussion-notes.md)'de.
- **AAB 29 yeniden derlendi (2026-10-15):** `~/Downloads/prestige-life-v2-29.aab` (41 MB, imzası doğrulandı, DEV menüsü ve test reklamı kapalı). İlk AAB 29 Play Console'a yüklenmemişti, kod 29'da kaldı; bu dosya günlük ödül, yatırım ve hayaller panosunu da içeriyor. Telefona kurulup denenmedi.

## Sıradaki

1. **AAB 29'u dahili teste yükle ve telefonda dene (kullanıcı).** Lisans hesabıyla üç ürün: ödüller geliyor mu, RevenueCat → Customers, Firebase Realtime'da `purchase` ve `purchase_applied`. Puanlama penceresi Milyoner'e ulaşmış kayıtta, ikinci oturumda. Sonra "Telefonda test listesi".
2. **Kapalı test:** sorun yoksa aynı sürüm kapalı test kanalına. 14 gün ~2026-10-20'de doluyor; testçiler listede kalmalı, sonra Play'den yayın erişimi başvurusu.
3. **Telefondan gelen bulguları düzeltmek**, gerekiyorsa AAB 30.
4. **Faz 2:** günlük ödül (2.7) ve yatırım (2.5) yapıldı, telefonda denenmedi; sıradaki zirve sonrası ve yeni hanedan (plan 2.12; kararlar 2026-10-15: [game-design §4.5](./game-design-v2.md) ve [story-v2 §6](./story-v2.md)): görünür miras, "Şimdi devret" (yıllar atlanır, devir hep 80'de), yadigâr mağazası, 2. nesil kız torun yeni şehirde, 3. nesil erkek (ilk kahramanın görselleri), 60+ dede görünümü; hepsi birlikte yayınlanır. Yapıldı (2026-10-16): Aile sekmesi, "Şimdi devret", yadigârlar ([game-design §4.5](./game-design-v2.md)). Devir hikâye anları kodda (2026-10-16). Devir görselleri oyunda (2026-10-16; portreler, dede pozları, üç kare, yadigâr ikonları; tarayıcıda denendi, telefonda değil). Sıradaki: 2. nesil yeni şehir (2.3): önce Lumen deneme karesi ([art-prompts-lumen.md](./art-prompts-lumen.md)), sonra içerik. Sonra Yakut Tasma ve Gece Vardiyası (IAP 2. adım), Remote Config (2.10).
5. **Faz 1'in küçük kalanları:** oyun testi paketi (1.15: anket, test notları), fuların bütün pozlarda görünmesi ([discussion-notes §1](./discussion-notes.md)).

**Sürüm derleme:** sürüm kodunu artır (`android/app/build.gradle`; Play'e yüklenmemiş bir kodu artırma), sonra `VITE_DEV_MENU=false VITE_ADMOB_TESTING=false npm run build:v2 && npx cap sync android`, ardından `android/`'da `./gradlew bundleRelease` (`JAVA_HOME` Android Studio'nun Java'sı). Ortam değişkenleri şart: `.env.v2` DEV menüsünü, `.env.local` test reklamını açık tutuyor. Çıktı `android/app/build/outputs/bundle/release/app-release.aab`; `~/Downloads/prestige-life-v2-<kod>.aab` adıyla kopyalanır.

## Kullanıcının yapacakları

- **Play Console:**
  - AAB 29 → dahili test, sonra kapalı test.
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
3. **Sahne:** ev 7 ve ev 10'da araçların boyu, yedi kıyafetin pozları, tasmalar (gerçek sınıf atlamayla), fular (oturan Şans'ta), hedef rozeti ve gelir dökümü, sol ve sağ düğmeler kahramanı ya da evi kapatıyor mu.
4. **Ekranlar:** İşletmeler (A görünümü; DEV'den Eski / A / B, sonra B ve seçici kaldırılabilir), rehberin eli ilk dakikalarda doğru düğmede mi, Kariyer, Alışveriş, Lüks resimlerinde gri kenar kalıntısı.
5. **Albüm, hayat anları, emeklilik, Zenginler Listesi:** DEV → "Hayat anını oynat", "Kahramanı yaşlandır +40" iki kez (emeklilik paneli ve devir), liste kartları.
6. **Çevrimdışı ve reklam** (DEV'de Google'ın test reklamı): uyuyan Şans kartı, "+%30", ×2 hızlandırıcı, Şans ×2, "biraz yardım".
7. **Olay kartları:** çağrı düğmesinin titremesi, iki cevap, kayıpta paraların dökülmesi ve bakiyenin düşmesi, kapat-aç sonrası ödül ya da kayıp bakiyede mi.
7b. **Günlük ödül:** ertesi gün ilk açılışta çevrimdışı kartından sonra geliyor mu, küçük ekranda kart sığıyor mu, ×2 reklamı, uygulamayı kapatıp açınca tutar aynı mı (DEV → "Günlük ödülü tekrar ver").
7c. **Yatırım:** alt menüde 4 düğme dar ekranda sığıyor mu, kilitli düğmenin baloncuğu, üç vade, kalan süre, vade dolunca bildirim ve "!", cesur vadenin kaybı (DEV → "Yatırımı hemen bitir").
7d. **Hayaller panosu:** alt menü yükseldi; şişeler menünün altında kalıyor mu, kahramanın ayakları ve araç görünüyor mu (özellikle küçük ekranlarda), "Al!" ve kilit, dokununca doğru sekme.
7e. **Devir:** DEV → "Hayat anını oynat" 63 / 70 / 80; En Zengin'de Aile → "Şimdi devret": "Yıllar geçti…", üç an, torunun adı, sonra emeklilik paneli ("Varisin: …").
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

**Bilinen küçük sorunlar:** listedekiler 2026-10-16'da düzeltildi; "OTOMATİK" rozeti ile 320 px üst bar telefonda bir kez görülmeli.

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
