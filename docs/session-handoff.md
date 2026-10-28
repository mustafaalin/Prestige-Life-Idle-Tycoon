# Session Handoff

Son güncelleme: 2026-10-28 · Dal: `v2-rebuild` · Play kapalı testte **AAB 34** (kullanıcı yükledi 2026-10-26: beceriler, ekran düzeltmeleri, açılışta analytics rızası, müzik, Play güncelleme teklifi). Sonraki sürüm kodu **35** (`android/app/build.gradle` `versionCode`).

Yeni bir oturumda projeye hızlı dönmek için güncel durum. Oyun v2 olarak yeniden yapılıyor; v1 dondu ve Faz 2.11'de kaldırılacak. Bu belge günlük tutmaz: her oturum sonunda **güncel durumu yansıtacak şekilde yeniden yazılır**, biten işler buradan silinir (kayıtları ilgili belgede ve git geçmişinde). Kararların gerekçesi ve sayılar ilgili belgededir.

## Belgeler

| Belge | Soru |
| --- | --- |
| [game-design-v2.md](./game-design-v2.md) | **Ne?** Kurallar ve sayılar; tek doğruluk kaynağı |
| [story-v2.md](./story-v2.md) | Hikâye, karakterler, ton, metinler, görsel stil kılavuzu |
| [monetization-v2.md](./monetization-v2.md) | Reklam ve IAP: yerler, ürünler, mağaza kurulumu, veri güvenliği beyanı |
| [rebuild-plan.md](./rebuild-plan.md) | **Ne zaman?** Fazlar ve görevler |
| [discussion-notes.md](./discussion-notes.md) | Kararı bekleyen konular (yalnız açık olanlar) |
| [art-brief-v2.md](./art-brief-v2.md) | Görsellerin kuralları, boyutları, sahne ölçeği, oyuna bağlama |
| [default-icons.md](./default-icons.md) | Kendi çizimimiz olmayan varsayılan ikonlar (ikon üretimi için) |
| [art-prompts-v2.md](./art-prompts-v2.md) | GPT komutları (§0e, §0f: Rive manken ve kıyafetler) |
| [art-prompts-ada.md](./art-prompts-ada.md), [art-prompts-lumen.md](./art-prompts-lumen.md) | 2. neslin görselleri (yayından sonra) |
| [audio-v2.md](./audio-v2.md) | Ses efektleri ve müzik |
| [analytics-v2.md](./analytics-v2.md) | Firebase olayları, parametreleri, hangileri özel boyut olarak kayıtlı |
| [mobile-ad-integration.md](./mobile-ad-integration.md) | v2 reklam altyapısı (AdMob, izin, test) |
| [legal/](./legal/) | Gizlilik, şartlar, veri talepleri (EN/TR), Play Console kontrol listesi |
| [report-v2.md](./report-v2.md) | **Neden?** Değişmez; tasarım belgesiyle çelişirse tasarım geçerli |
| [research/](./research/) | Idle Guy incelemesi ve oyuncuyu tutma (2026-10-20); hayat özellikleri ve karakter animasyonu (2026-10-25) |
| [archive/](./archive/) | Bitmiş teslimler, ekonominin yeniden kurulması, Burak hikâyesi; yalnız geçmiş için |
| [v1/](./v1/) | v1 arşivi; v2 işinde okunmaz |

## Oyunda olanlar (lansman = 1. nesil)

Ayrıntılar tasarım ve hikâye belgelerinde.

- **Ekonomi:** gerçekçi takvim (1 ay = 80 sn, 1 yıl = 16 dk); 14 işletme × 15 seviye + şube; 104 meslekli ağaç, 24 kurs, 4 meslek açan eşya; 12 ev (kirala → satın al → kiraya ver), 12 araç (her ev ve araç "Sv N bir işte çalış" ister), 7 kıyafet, 4 lüks; Şans'ın tasmaları (%2 / %4 / %6); çevrimdışı %20, en çok 1 sa; oyun kapalıyken yaş da ilerler (kapalı sürenin %0,2'si, en çok 24 sa); 8 sınıf, 1. nesilde Milyarder'e kadar (~70 yaş). Hedeflerin ödülü fiyata / zorluğa bağlı (§4.11). Yatırım = "Banka": üç fırsat aynı anda, risksiz. Kayıt şeması 3.
- **Beceriler (2026-10-25, AAB 34):** Güç / Zekâ / Karizma, bedava, gerçek zamanlı, tek beceri çalışır, en çok 3 seviye biriktirir, reklamla +2 seviye (21. reklam yeri); ilk iş hariç her meslek beceri ister ([game-design-v2.md §4.15](./game-design-v2.md)). **Telefonda denenmedi** (aşağıdaki liste).
- **Hikâye:** önsöz, 5 sınıf töreni, annenin mesajları, hayat anları (25, 28, 31, 63, 70; 60'tan sonra dede kareleri), 4 lüks anı, 50 olay kartı, Zenginler Listesi, aile albümü. 80'de kahraman kalır, oyun sürer. Burak, devir, miras, Aile sekmesi, Lumen ve Multimilyarder / En Zengin hikâyesi kodda ama kapalı (`core/config/content.ts`).
- **Ana ekran:** ev, araç, kahraman, Şans, yerden toplama, hedef rozeti (×3 reklamı), gelir dökümü, hayaller panosu, ×2, Şans'ı çağır, para / şişe yağmuru, fırsat balonu, günlük teklif kartı, profil (üst barın solunda yüz); alt menü İşletmeler, Kariyer, Beceriler, Alışveriş, Yatırım ("!" rozetleriyle). Rıza Amca rehberi, karartmalı el (Spotlight), arayüzün adım adım açılması, özellik tanıtımları.
- **Ekranlar:** İşletmeler, Kariyer (oyun karosu ağacı), Alışveriş (vitrin + koleksiyon), Yatırım, Mağaza afiş tarzında; para ikonu her tutarın yanında (`ui/CashAmount.tsx`), kendi ikonlarımız (`ui/UiIcon.tsx`).
- **Para:** 21 ödüllü reklam yeri, kilitsiz; Başlangıç Paketi $2,99 (ilk 3 gün $1,49), Rahat Paket $7,99 (reklamsız), 5 para çantası `v2_cash_1..5`; geri yükleme; Play puanlama penceresi. Gerçek satın alma ve gerçek reklam çalışıyor.
- **Altyapı:** kayıt Preferences'ta, geri tuşu, güvenli alanlar, yalnız dikey, yerel bildirimler, Firebase Analytics (açılışta rıza sorgusu) ve Crashlytics, ses ve müzik, TR + EN; Play güncelleme teklifi (`runtime/appUpdate.ts`, ilk kez 35 çıkınca görünür).
- **Sahne panosu (DEV):** `npm run dev:v2` → `/scene-board.html`; her ev / araç / kıyafet / tasma birleşimi telefon boyunda, yorumlar `scene-notes.json`'a (git dışı).

## Sıradaki

### 1. Lansman (2–3 hafta)

**Üretim erişimi reddedildi (2026-10-26):** Google 12 testçiyle **14 gün daha** kapalı test istiyor; biri çıkarsa süre baştan başlar. Lansman en az 2, belki 3 hafta kaydı. Kapalı teste yeni AAB yüklenebilir (testçilerin oynaması ikinci başvuruya yardım eder). Hedef: Rive kahraman, Şans ve kıyafetler lansmana girsin (kullanıcı: "hepsini yetiştiririz"); AAB 34 kapalı testte.

### 2. Karakter animasyonu: Rive (ana iş)

Ayrıntılar (rig yapısı, boru hattı, kararlar): [research/character-animation-2026-10-25.md](./research/character-animation-2026-10-25.md) §8–11; GPT komutları [art-prompts-v2.md §0e–0i](./art-prompts-v2.md).

- **Oyunda (2026-10-28, kullanıcı videoyu `~/Downloads/rive-kiyafetler-v3.mp4` onayladı):** ana sahnede kahraman ve Şans Rive rigi; **telefonda denenmedi** (S24+'ta `npm run phone`; düşük telefonda kare hızına bakılacak). Kod: `ui/scene/rigs.ts` (dosyalar, artboard içindeki figür kutusu, görünüm modeli değerleri), `ui/scene/RigCanvas.tsx` (`@rive-app/canvas-lite` 2.44.2, sahne açılınca yüklenir; wasm oyunla gelir, bayt olarak verilir, CDN yok; yüklenemezse resimler), `ui/scene/heroRig.ts` (durum kuralları), `Scene.tsx`. Dosyalar `public/assets/rig/hero.riv` (0,92 MB) ve `sans.riv` (0,34 MB); oynatıcı 202 KB JS + 772 KB wasm, ayrı parça. Kayıt değişmedi.
- **Sahnede kim ne yapar (`heroRig.ts`):** sevinç (alım, terfi, taşınma, Şans'ın bulduğu toplanınca) = kahkaha yüzü, Şans `happy`; ilk anlardaki replik (`heroQuips.ts`) = gülümser, replik uzunluğu kadar konuşur (karakter başına 55 ms, 1,2–3,2 sn); çadırda endişeli yüz ve **12–20 sn'de bir 2,5 sn titreme** (kullanıcı, 2026-10-28; konuşurken, gülerken, üstte ekran varken titremez); yoksa dinlenme yüzü. Resim kalır: yerden toplama, Şans'ı okşama, Şans'ın cüzdanı, uyuyan Şans, dede (60+). Tasma sınıfa göre (`stages.ts` `collar`), fular Başlangıç Paketi'yle. Üstte ekran varken rigler çizilmez. Rig 2 sn'de yüklenmezse resimler görünür, sonra rig gelince yerini alır. Rig, yerine geçtiği resimle aynı noktada (orta ve ayak çizgisi tarayıcıda ölçüldü), boy 0,42.
- **Rig'i yeniden üretmek:** `gen3.py art/pilot/18-rig/rive/dressrig --game` / `sans_rig.py art/pilot/19-sans-rig/rive/sansrig --game` (şeffaf arka plan, webp parçalar) → `rive <proje> --once` → `build/*.riv`'i `public/assets/rig/hero.riv` / `sans.riv`'e kopyala, sonra bayraksız yeniden üret (videolar için gri zemin, png). Betik olmadığı için imzasız dosya yetiyor, filigran yok. Kıyafetlerin 21 parçası see-through'dan; smokin pantolonu `legwear` katmanında; `project_layers.py` mankenin bacağından ince çizilmiş pantolonları genişletir. Rig'de artboard içindeki figür kutusu değişirse `rigs.ts`'deki sayılar yeniden ölçülür.
- **Sonra:** sahne panosu (`scene-board.html`) ve SceneLab hâlâ resimleri gösteriyor; parça parça gardırop lansmandan sonra.
- **Not:** Rive CLI `~/.rive/bin/rive`. see-through Kaggle'da (`mustafaalin/pl-seethrough`, betik `scripts/rig/kaggle/`; çıktıyı yalnız PSD olarak indir: `kaggle kernels output … --file-pattern 'wear-[a-z-]+\.psd$'`). **see-through yerelde asla çalıştırılmaz** (Mac'i çökertti).

### 3. Diğer işler

- **Mutluluk, sağlık, hobiler, Defne (2. adım; kararlar verildi, kod yok; beceriler telefonda denendikten sonra):** [research/life-features-2026-10-25.md](./research/life-features-2026-10-25.md). Üst barda iki çubuk; yalnız terfide işe yarar (işe göre alt sınır); yumuşak düşer, 30'un altına inmez, ceza yok. 12 hobi onaylı, ayrı yuva, ayrı ekran. Defne etkileşimli (~12 GPT görseli). Yemek merdiveni konuşulmadı; C (Şans'ın bağı), D (hayat listesi), E (bağış) bekliyor.
- **Müzik:** ana ekran parçası kısa ve sıkıcı; kullanıcı Gemini / Lyria 3 Pro ile ~3 dk'lık iki "cozy jazz-pop" parça deniyor (ticari şart belirsizse ElevenLabs Music). Gelince −18 LUFS, sırayla çalsın (`runtime/feedback.ts`), `audio-v2.md`.
- **Bekleyen sıra (2026-10-24 onaylı):** simülatöre boş kalma ölçüsü, zenginliği hissettirmek, iş teklifleri, ekonominin açık konuları (Fabrika–Medya arası ~8,5 sa, reklamlı oyuncunun erken hızı; kullanıcının kararı).
- **Varsayılan ikonlar** için kendi ikonlarımız üretilecek ([default-icons.md](./default-icons.md)).
- **Açık (küçük):** hikâye karelerinde Şans'ın tasması sabit (altın); 320 px'te İşletmeler satırında işletme adı kesiliyor; Sahil Malikânesi'nde arazi aracı evin altına biniyor (ev yeniden çizilecek, art-prompts-v2 §4); Rahat Paket'li hesapta Mağaza → Bedava → ×2 artık kartı açıyor (kodda düzeltildi, d40a438; yalnız telefonda bakılacak).
- **Lansmandan sonra:** IAP 2. adım (Yakut Tasma, Gece Vardiyası), Remote Config, oyuncuyu tutma önerileri ([discussion-notes.md §2](./discussion-notes.md)), 2. nesil; kolye / çanta / küpe yuvaları.

## Telefonda test listesi

Sonraki AAB (34) ya da `npm run phone` ile. Önce **telefondaki mevcut kayıtla**, sonra DEV menüsünden yeni oyunla. Bulgular gelince madde silinir. Daha önce sorunsuz: kayıt güncellemesi, mağaza ve yerel para, paketler, para çantaları, kıyafet kilidi, akıcılık, TR/EN, bildirimler.

**Beceriler (en önemli):**
1. Eski kayıtta hiçbir iş, işletme, para kaybolmamış; beceriler şimdiki işin istediği seviyeden başlıyor; çalışılan iş kilitlenmemiş.
2. Beş düğmeli alt menü dar ekranda sığıyor.
3. Güç'ü başlat: 1. seviye 15 sn'de doluyor; seviye birikince 3,5 sn mor şerit, dokununca Beceriler açılıyor.
4. 3 seviyede duruyor ("Dolu"); "Topla +3 Sv" sayıyor, "+3 Sv" ikondan yükseliyor.
5. Oynat / duraklat; başka beceriye geçince eskisi "Beklemede", yarım seviye yerinde.
6. Uygulama 1–2 dk kapalıyken seviyeler birikiyor (en çok 3).
7. Reklamla +2 Sv: düğme kaybolup bir seviye sonra geri geliyor; Rahat Paket'te yeşil.
8. "!" rozeti çalışmayan beceri ya da toplanacak seviye varken.
9. Hamal / Bulaşıkçı kartında "Güç 2", "Git" Beceriler'i açıyor.
10. Yeni oyunda: ilk iş → Şans cüzdanla → Rıza "Parkta biraz şınav çek…", el Güç'ün oynat düğmesinde → tezgâh.
11. Bisiklet hedefi bulaşıkçıdan sonra.

**Güncelleme uyarısı (AAB 34'te geldi, ilk kez 35 yüklenince denenebilir):**
0. 34 kurulu telefonda 35 kapalı teste çıkınca: açılıştan ~8 sn sonra Play'in "Güncelleme var" penceresi; kabul edince oyun sürerken iner, inince yeşil şerit "Yeni sürüm hazır! Yeniden başlatmak için dokun."; dokununca oyun yeni sürümle açılıyor, kayıt yerinde. Reddedince bir sonraki açılışta yine soruyor. (Play bazen yeni sürümü birkaç saat geç fark eder; Play Store'un önbelleği temizlenirse hızlanır.)

**AAB 33 ve sonrası:**
12. Gerçek reklam açılıyor, ödül geliyor; yüklenemezse düğme ne yapıyor. **Önce telefon AdMob → Ayarlar → Test cihazları'na eklenmeli** (kendi reklamına tıklamak hesabı riske atar).
13. Yeni ikonlar küçük boyda okunuyor; reklam düğmeleri (kare + etiket) taşmıyor.
14. Ayarlar: Gizlilik / Şartlar tarayıcıyı, Destek e-postayı açıyor; Gizlilik seçenekleri rıza formunu; Titreşim kapalıyken titreşim yok; sürüm numarası doğru; "Baştan başla" (yalnız test hesabında).
15. AEA rıza denemesi: geliştirme derlemesinde `VITE_ADMOB_DEBUG_EEA=true`, `npm run phone`.
16. Analytics rızası açılışta: yeni kurulumda DebugView'da `story_view` kimlikli (`adb shell setprop debug.firebase.analytics.app com.prestigelife.idletycoon`).
17. Profil: 320 px'te para sığıyor; isim değişince rehber ve Zenginler Listesi güncelleniyor.
18. Rehber: karartmanın deliği hedefle kayıyor; iş şovundan sonra sekme kapanıyor; Şans'ın üstündeki şişe dokunuşu kapmıyor; dört tanıtım (Alışveriş, kurslar, Yatırım, albüm) sırayla.
19. Yatırım "Topla" parlaması göz yormuyor; hedefler üç farklı tutar ve işletme başına tek basamak; kapalı bir gün sonra yaş ~2 ay ilerlemiş, aynı anda gelen yaş anı çevrimdışı kartından sonra oynuyor.
20. Alışveriş: sekmeler taşmıyor, alınabilen hayal parlıyor, "ÖNDE / ÜSTÜNDE" doğru öğede.
21. İlk saat (yeni hesap), günlük ödül ve çevrimdışı kartı (×2 gerçek reklam), "Satın alımları geri yükle", Başlangıç Paketi'nin 3 gün sonra $2,99'a dönmesi.

## Kullanıcının yapacakları

- **Kapalı test:** 12 testçiyi 14 gün testte tutmak; sonra üretim erişimine yeniden başvurmak.
- **Play Console:** telefon ekran görüntülerini `~/Downloads/play-store-v2/` ile değiştirmek (8 ekran × TR/EN, özellik grafiği, ikon; kaynak `art/store-v2/`; yeniden üretmek: `npm run build:v2`, `npx vite preview --mode v2 --port 5198 --strictPort`, `node art/store-v2/capture.mjs <ham>`, `node art/store-v2/compose.mjs <ham> <çıktı> node_modules/@fontsource/fredoka/files`); Başlangıç Paketi açıklamasına fuların bonusu ([monetization-v2.md §8](./monetization-v2.md)); v1'in 8 ürününü pasifleştirmek.
- **AdMob:** app-ads.txt doğrulaması; telefonu test cihazı yapmak.
- **Firebase'e kaydet:** şu an bekleyen yok (2026-10-26 hepsi kaydedildi, [analytics-v2.md](./analytics-v2.md)). Yeni olay / parametre eklendikçe buraya madde düşer.
- **Karar:** 13–15 yaş ve AdMob rıza yaşı.
- **`npm run backup`:** yeni art (Rive pilotu dahil) Drive'a yedeklenmeli.
- **Oyuncu gözlemi:** 6–8 tanıdıkla (kapalı test verisi çoğunlukla kendi hesapların).

## Çalışma kuralları

- **Her istek bir yere yazılır.** Kullanıcının mesajındaki her madde ya aynı turda yapılır ya da "Sıradaki"ye (karar bekliyorsa discussion-notes'a) yazılır.
- **Karar verilince** ilgili belge (tasarım, hikâye, monetizasyon) aynı commit'te güncellenir.
- **"Yaptım" demeden önce** commit'li ve ekranda görülmüş olmalı; kullanıcıya nerede göreceği söylenir (geliştirme sunucusu, hangi AAB).
- **Zaten var olan bir şey istenirse** bunu söyle ve nerede olduğunu göster.
- **Token / kota (kullanıcı Pro paketinde, 5 saatlik pencere + haftalık sınır):** önce sayıyla denetle, resme az bak, videoları kullanıcı izler; betikler repoda; bu belgenin yalnız gereken bölümünü oku. İş türü değişince söyle: mekanik işte "`/model` ile Sonnet'e geçebilirsin", zor işte "Opus 5.5'e geçersen daha iyi olur"; konu bitince `/clear`.
- **Denetimler:** `npm run typecheck` (`npx tsc -p .` hiçbir dosyayı denetlemiyor), `npx eslint src/game`, `npm run sim` (denge), `npm run savecheck` (kayıt), `npm run progresscheck` (meslek, kurs, ev, araç ya da sınıf şartı değişince).

## Kurallar

**Kayıt uyumluluğu (kullanıcı, 2026-10-14):** yayından sonra her güncelleme oyuncunun kaydını korumalı. Kod `src/game/runtime/storage.ts`.

- **Kimlikler değişmez:** kayıttaki id (işletme, eşya, ev, meslek, kurs, hedef, an, ürün) yeniden adlandırılmaz, silinmez; gerekirse eskisi yenisine eşlenir.
- **Yeni alan varsayılanla gelir:** `normalize*()` her alanı tek tek okur; yeni sistem eski oyuncuya bir anda onlarca kart ya da tören yaşatmaz.
- **Alınmış olan geri alınmaz:** sınıf hediyeleri `applyClassFloors` ile eksikse verilir.
- **Şema:** `SAVE_SCHEMA` yalnızca `migrate()`'e adım eklenerek artar; okunamayan kayıt `prestige_life_v2_unreadable`'a yedeklenir. Temiz başlangıç bir daha yapılmaz.
- **Kayıt anahtarı** `prestige_life_v2` ve uygulama kimliği değişmez.
- **`npm run savecheck`** `scripts/save-fixtures/` içindeki her eski kaydı açıp ilerlemenin tamamını arar. Şema artmadan önce `npm run savecheck -- --snapshot schemaN-midgame`; örnek kayıtlar hiç düzenlenmez.

**Ekran kuralı:** yeni açılır kart `createPortal(..., portalRoot())`; ekrandan ölçülen nokta `toStage()` ile sütuna; `vw` yerine `var(--stage-w)`.

**İçerik bayrakları:** lansmanın içeriği `core/config/content.ts`'te (`handover`, `legacy`, `bradStory`, `topClassStory`; hepsi kapalı). Lumen resimleri `handover` kapalıyken derlemeye girmez (`vite.config.ts` `LATER_GENERATION_ASSETS`).

## Çalıştırma

- `npm run dev:v2` (DEV menüsü açık); `npm run sim` (`-- --quests`, `-- --rare`); `npm run typecheck`; `npx eslint src/game`.
- **Telefon:** `npm run phone` (port değişince `-- PORT`, yerel eklenti değişince `-- --install`). DEV sürümü ayrı uygulama `com.prestigelife.idletycoon.dev`, kendi kaydı var. Telefon Samsung Galaxy S24+ (Android 16).
- **AAB:** `npm run cap:sync:v2`, `android/` içinde `./gradlew bundleRelease` (imza `android/keystore.properties`; `build:v2` DEV menüsünü ve test reklamını kapatır); `JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"`. Çıktı `android/app/build/outputs/bundle/release/app-release.aab` → `~/Downloads/prestige-life-v2-<kod>.aab`; her sürümde `versionCode` bir artar. Yalnız kapalı teste yüklenir.
- **Uygulama ikonu:** "iki kafa" (`art/store-v2/icon-f-diagonal-heads-v1.png`); değiştirmek: `scripts/android-art.mjs` içindeki yol + script + yeni AAB.
- **Kod:** `src/game/` (`core/`, `sim/`, `runtime/`, `i18n/`, `ui/`). Yapı [game-design-v2.md §7](./game-design-v2.md).
- **Görseller:** önce GPT (komutu Claude yazar), gerekirse fal.ai. Kaynaklar `art/` (git dışı, Drive'da yedekli), oyundakiler `public/assets/` (webp); kurallar [art-brief-v2.md](./art-brief-v2.md), stil [story-v2.md §8](./story-v2.md).
- **Stüdyo sitesi:** `https://mathgamesstudio.com` (Cloudflare Pages; oyun sayfası, destek, `app-ads.txt`, gizlilik `/privacy/prestige-life`, şartlar `/terms/prestige-life`).

## Uygulama kimliği

- Paket `com.prestigelife.idletycoon` · Prestige Life: Idle Tycoon · yayıncı Math Games Studio (`mathgamesstudio@gmail.com`)
- AdMob App ID: Android `ca-app-pub-8950990027285549~9898475278`, iOS `ca-app-pub-8950990027285549~3253175874`; ödüllü birim `runtime/ads.ts`. GDPR mesajı yayında, izin modu açık.
- Firebase projesi `prestige-life-idle-tycoon`; RevenueCat → Firebase entegrasyonu panelde.
