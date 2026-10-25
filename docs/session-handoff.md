# Session Handoff

Son güncelleme: 2026-10-26 (belge sadeleştirildi; lansman animasyon planı onaylandı) · Dal: `v2-rebuild` · Play'de kapalı testte **AAB 33** (gerçek reklamlı ilk sürüm; üretim erişimi bununla istendi, 2026-10-26 reddedildi). Sonraki sürüm kodu **34** (`android/app/build.gradle` `versionCode`). Kullanıcı eski AAB dosyalarını sildi; `~/Downloads/prestige-life-v2-33.aab` güncel kodla yeniden derlendi.

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
| [mobile-ad-integration.md](./mobile-ad-integration.md) | v2 reklam altyapısı (AdMob, izin, test) |
| [legal/](./legal/) | Gizlilik, şartlar, veri talepleri (EN/TR), Play Console kontrol listesi |
| [report-v2.md](./report-v2.md) | **Neden?** Değişmez; tasarım belgesiyle çelişirse tasarım geçerli |
| [research/](./research/) | Idle Guy incelemesi ve oyuncuyu tutma (2026-10-20); hayat özellikleri ve karakter animasyonu (2026-10-25) |
| [archive/](./archive/) | Bitmiş teslimler, ekonominin yeniden kurulması, Burak hikâyesi; yalnız geçmiş için |
| [v1/](./v1/) | v1 arşivi; v2 işinde okunmaz |

## Oyunda olanlar (lansman = 1. nesil)

Ayrıntılar tasarım ve hikâye belgelerinde.

- **Ekonomi:** gerçekçi takvim (1 ay = 80 sn, 1 yıl = 16 dk); 14 işletme × 15 seviye + şube; 104 meslekli ağaç, 24 kurs, 4 meslek açan eşya; 12 ev (kirala → satın al → kiraya ver), 12 araç (her ev ve araç "Sv N bir işte çalış" ister), 7 kıyafet, 4 lüks; Şans'ın tasmaları (%2 / %4 / %6); çevrimdışı %20, en çok 1 sa; oyun kapalıyken yaş da ilerler (kapalı sürenin %0,2'si, en çok 24 sa); 8 sınıf, 1. nesilde Milyarder'e kadar (~70 yaş). Hedeflerin ödülü fiyata / zorluğa bağlı (§4.11). Yatırım = "Banka": üç fırsat aynı anda, risksiz. Kayıt şeması 3.
- **Beceriler (2026-10-25, commit 66c7079):** Güç / Zekâ / Karizma, bedava, gerçek zamanlı, tek beceri çalışır, en çok 3 seviye biriktirir, reklamla +2 seviye (21. reklam yeri); ilk iş hariç her meslek beceri ister ([game-design-v2.md §4.15](./game-design-v2.md)). **Telefonda denenmedi** (aşağıdaki liste).
- **Hikâye:** önsöz, 5 sınıf töreni, annenin mesajları, hayat anları (25, 28, 31, 63, 70; 60'tan sonra dede kareleri), 4 lüks anı, 50 olay kartı, Zenginler Listesi, aile albümü. 80'de kahraman kalır, oyun sürer. Burak, devir, miras, Aile sekmesi, Lumen ve Multimilyarder / En Zengin hikâyesi kodda ama kapalı (`core/config/content.ts`).
- **Ana ekran:** ev, araç, kahraman, Şans, yerden toplama, hedef rozeti (×3 reklamı), gelir dökümü, hayaller panosu, ×2, Şans'ı çağır, para / şişe yağmuru, fırsat balonu, günlük teklif kartı, profil (üst barın solunda yüz); alt menü İşletmeler, Kariyer, Beceriler, Alışveriş, Yatırım ("!" rozetleriyle). Rıza Amca rehberi, karartmalı el (Spotlight), arayüzün adım adım açılması, özellik tanıtımları.
- **Ekranlar:** İşletmeler, Kariyer (oyun karosu ağacı), Alışveriş (vitrin + koleksiyon), Yatırım, Mağaza afiş tarzında; para ikonu her tutarın yanında (`ui/CashAmount.tsx`), kendi ikonlarımız (`ui/UiIcon.tsx`).
- **Para:** 21 ödüllü reklam yeri, kilitsiz; Başlangıç Paketi $2,99 (ilk 3 gün $1,49), Rahat Paket $7,99 (reklamsız), 5 para çantası `v2_cash_1..5`; geri yükleme; Play puanlama penceresi. Gerçek satın alma ve gerçek reklam çalışıyor.
- **Altyapı:** kayıt Preferences'ta, geri tuşu, güvenli alanlar, yalnız dikey, yerel bildirimler, Firebase Analytics (açılışta rıza sorgusu) ve Crashlytics, ses ve müzik, TR + EN.
- **Sahne panosu (DEV):** `npm run dev:v2` → `/scene-board.html`; her ev / araç / kıyafet / tasma birleşimi telefon boyunda, yorumlar `scene-notes.json`'a (git dışı).

## Sıradaki

### 1. Lansman (2–3 hafta)

**Üretim erişimi reddedildi (2026-10-26):** Google 12 testçiyle **14 gün daha** kapalı test istiyor; biri çıkarsa süre baştan başlar. Lansman en az 2, belki 3 hafta kaydı. Kapalı teste yeni AAB yüklenebilir (testçilerin oynaması ikinci başvuruya yardım eder). Bu sürede hedef: Rive kahraman, Şans ve parça parça gardırop lansmana girsin (kullanıcı: "hepsini yetiştiririz").

### 2. Karakter animasyonu: Rive (ana iş, 2026-10-25/26)

Ayrıntı [research/character-animation-2026-10-25.md](./research/character-animation-2026-10-25.md) §4–9; komutlar [art-prompts-v2.md §0e, §0f](./art-prompts-v2.md).

- **Lansman kapsamı (kullanıcı onayladı, 2026-10-26):** ana sahnede **kahraman + Şans** canlı; hikâye ve törenler **konuşma balonu olarak kalır** (görsel roman kararı). Balon açıkken kahramanın ağzı konuşma ağızlarıyla oynar, ifadesi repliğe göre değişir (replik başına ifade etiketi). Rig yüklenmezse ya da bir görünüm hazır değilse bugünkü resimler gösterilir; animasyon lansmanı engellemez.
- **Sıra:** (1) ~~göz kırpma ve bakış~~ (2026-10-26, kullanıcı onayladı); (2) ~~ağız ifadeleri ve konuşma~~ **yapıldı, kullanıcının onayını bekliyor** (video `~/Downloads/rive-agiz-v1.mp4`, 15,5 sn: 0 dinlenme, 2 gülümse, 4–7 konuşur, 8 kahkaha, 10 üzgün, 11,5–14 üzgünken konuşur); (3) baş çevirme gerekirse yüz mesh'iyle bütün olarak; (4) dirsek bükülmesi, sevinçte kol kalkışı, ifadeler (sevin / endişelen / kararlı) durum makinesi girdisi; (5) **Şans:** tek parça resim + mesh (kuyruk, nefes, kulak, baş eğme) + **tasma yuvası** (deri, gümüş, altın, fular, yakut); GPT komutu yazılacak; (6) parçalar webp; (7) oyuna bağlama (`@rive-app/react-canvas-lite`, `<HeroRig>`, düşük telefonda akıcılık); (8) kalan 6 kıyafet ve aksesuarlar aynı yoldan; (9) parça parça gardırobun oyun kuralları ve kayıt göçü (`savecheck`).
- **Araç:** Rive CLI 1.8.0, `~/.rive/bin/rive` (PATH'te değil), hesapsız; kemik, mesh, skinning, durum makinesi RML ile; `--verify`, `inspect`, `--screenshot --advance=`. Kullanıcı Cadet ($9/ay) aboneliğini filigransız yayın dosyası gerekince açacak.
- **Kararlar:** kahraman hafif yandan (≈20°, ekranın sağına dönük). Manken + giydirilen parçalar; eklem noktaları mankende bir kez. **6 yuva: şapka, gözlük, üst, alt, ayakkabı, saat**; tek üst (ceket ile gömlek tek parça); şapka, gözlük, saat her birinden 3–4. Rive'da her yuva bir sayı (0 = boş); parça resimleri dışarıdan yüklenir ("referenced assets"). Oyunda her parça ayrı eşya (fiyat, `minClass`, bonus), takıma küçük takım bonusu (öneri); kayıtta eski kıyafet id'leri kalır, sahip olunan parçalara açılır (göç). Şapka saçı ezer (mankenin ön saçı gizlenir); şeffaf gözlükte cam see-through'dan, güneş gözlüğü opak.
- **Durum:** yandan giydirilmiş manken çalışıyor, kullanıcı onayladı. Video `~/Downloads/rive-manken-kiyafet-v3.mp4`; proje `art/pilot/18-rig/rive/dressrig/` (`.riv`, `--verify` temiz). Rig: görünüm modeli `Hero`, yuvalar `top` / `bottom` / `shoes` (şimdilik boolean); hareketler nefes + gövde + kol sallanması (4,4 sn), göz kırpma (5,3 sn: yarı → kapalı → yarı, arada çift kırpma), bakış (11 sn: 2,5 sn'de yana, 7 sn'de izleyiciye bakar; dinlenirken mankenin kendi gözleri), baş eğme (13 sn). **Ağız:** `Solo` (dinlenirken mankenin kendi ağzı); görünüm modelinde `talking` (boolean: 2,4 sn'lik düzensiz a / e / o / kapalı döngüsü) ve `mood` (sayı: 0 nötr, 1 gülümse, 2 kahkaha, 3 üzgün; konuşma bitince buna döner). Oyunda: balon açıkken `talking = true`, replik etiketine göre `mood`. Göz ve ağız durumları yandan yüzlerden yama (`rig-dressed/eyes/<durum>-<l|r>.png`, `rig-dressed/mouth/<durum>.png`; yüz katmanının içinde kalır): yüz resmi SIFT ile tuvale oturtulur (değişmeyen yerler: saç, kulak, burun, çene; ölçek ~0,256), göz bölgesi yumuşak elipsle kesilir, kenar teni mankene eşitlenir. Not: izleyiciye bakan göz mankeninkinden biraz iri; videoda göze batarsa yama küçültülür. Kaldırılan: yalnız göz / burun / ağzı kaydıran 2,5D baş çevirme.
- **Kaynaklar (`art/pilot/18-rig/`):** `manken.png`, `wear-hoodie.png` / `wear-jeans.png` / `wear-sneakers.png` (mankenin üstünde tek giysi), `rig-base.png`, `face-*.png` (yandan 14 yüz, henüz kullanılmadı). Eski önden pilot (`front/`, `rive/herorig/`, `gen2.py`) yalnız yöntem kaynağı.
- **Katman ayırma: see-through, ModelScope demosunda** (https://modelscope.cn/studios/ljsabc/See-Through; ücretsiz, 1280 px ~3 dk). Ayarlar: çözünürlük 1280, "左右拆分手臂、眼睛与耳朵" açık. Kullanıcı resmi sürükler, Claude Chrome'dan çalıştırıp PSD'yi indirir. Çıktılar `art/pilot/18-rig/seethrough-*/`. **Yerelde çalıştırma yasak** (Mac'i çökertti). Yedek: Kaggle (`art/pilot/18-rig/kaggle/`), son çare HF demosu.
- **Boru hattı (scriptler repoda, `scripts/rig/`; yollar repo köküne göre):** `scripts/rig/project_layers.py` → `rig-dressed/<kaynak>/` (görünen her piksele GPT orijinalinin rengi; see-through yalnız arkada kalan yerler; kapüşon içi, şort lastiği, göz kapakları düzeltmeleri; orijinal → tuval: yükseklik 1280, x +213) → `scripts/rig/face_patches.py <önizleme.png>` → `rig-dressed/{eyes,mouth}/` → `scripts/rig/gen3.py art/pilot/18-rig/rive/dressrig` → `scene.rml` → `~/.rive/bin/rive art/pilot/18-rig/rive/dressrig --verify`. Video kare kare `--advance` + ffmpeg 30 fps; görünüm modeli girdisi sıranın ortasında `--advance=Xms --data=mood=1` ile değişir (zsh'de argüman dizisi `${=args}`). Python geçici venv (psd-tools, numpy, pillow, scipy, opencv-python-headless).

### 3. Diğer işler

- **Mutluluk, sağlık, hobiler, Defne (2. adım; kararlar verildi, kod yok; beceriler telefonda denendikten sonra):** [research/life-features-2026-10-25.md](./research/life-features-2026-10-25.md). Üst barda iki çubuk; yalnız terfide işe yarar (işe göre alt sınır); yumuşak düşer, 30'un altına inmez, ceza yok. 12 hobi onaylı, ayrı yuva, ayrı ekran. Defne etkileşimli (~12 GPT görseli). Yemek merdiveni konuşulmadı; C (Şans'ın bağı), D (hayat listesi), E (bağış) bekliyor.
- **Müzik:** ana ekran parçası kısa ve sıkıcı; kullanıcı Gemini / Lyria 3 Pro ile ~3 dk'lık iki "cozy jazz-pop" parça deniyor (ticari şart belirsizse ElevenLabs Music). Gelince −18 LUFS, sırayla çalsın (`runtime/feedback.ts`), `audio-v2.md`.
- **Bekleyen sıra (2026-10-24 onaylı):** simülatöre boş kalma ölçüsü, zenginliği hissettirmek, iş teklifleri, ekonominin açık konuları (Fabrika–Medya arası ~8,5 sa, reklamlı oyuncunun erken hızı; kullanıcının kararı).
- **Varsayılan ikonlar** için kendi ikonlarımız üretilecek ([default-icons.md](./default-icons.md)).
- **Açık (küçük):** hikâye karelerinde Şans'ın tasması sabit (altın); 320 px'te İşletmeler satırında işletme adı kesiliyor; Sahil Malikânesi'nde arazi aracı evin altına biniyor (ev yeniden çizilecek, art-prompts-v2 §4); Rahat Paket'li hesapta Mağaza → Bedava → ×2 kart göstermeden ödül veriyor olabilir (telefonda bak).
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
- **GA4 özel boyutları (lansmandan önce, geriye dönük dolmaz):** Firebase → Analytics → Custom definitions, Scope: Event, parametre adıyla: `step`, `placement`, `outcome`, `kind`, `skipped`, `quest_id`, `career_id`, `business_id`, `level`, `class_index`, `product_id`, `id`. Custom metric: `life_minutes`. User scope: `class_index`, `generation`.
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
