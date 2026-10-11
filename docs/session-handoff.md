# Session Handoff

Son güncelleme: 2026-10-11 · Dal: `v2-rebuild`

Yeni bir oturumda projeye hızlı dönmek için güncel durum özeti. Oyun v2 olarak yeniden yapılıyor; v1 dondu ve v2 onu Faz 2.11'de kaldıracak. Bu belge tarih sırasıyla günlük tutmaz; her oturum sonunda **güncel durumu yansıtacak şekilde yeniden yazılır**.

## Belgeler

| Belge | Soru | Not |
| --- | --- | --- |
| [report-v2.md](./report-v2.md) | **Neden?** | Tasarım analizi ve yeniden doğuş raporu. Değişmez referans. |
| [game-design-v2.md](./game-design-v2.md) | **Ne?** Kurallar ve sayılar | Rapordan sapmalar §9'da. Rapor ile çelişirse bu geçerli. |
| [story-v2.md](./story-v2.md) | Hikâye, karakterler, ton, görsel listesi ve stil kılavuzu | |
| [monetization-v2.md](./monetization-v2.md) | Reklam ve IAP | Kararlaştırıldı (2026-10-08); altyapı hazır, yerler ve IAP bekliyor. |
| [rebuild-plan.md](./rebuild-plan.md) | **Ne zaman?** Fazlar, görevler, durum | Yapılanlar işaretli. |
| [discussion-notes.md](./discussion-notes.md) | Kararı bekleyen konular | Sadece açık konular; karar verilince taşınır. |
| [art-brief-v2.md](./art-brief-v2.md) | Üretilecek görseller | Liste, boyutlar, referanslar, komutlar; GPT'ye ya da fal.ai'ye verilir. |
| [mobile-ad-integration.md](./mobile-ad-integration.md) | Reklam altyapısı | Üstte v2 bölümü, altında v1. |
| [v1/](./v1/) | v1 arşivi | v2 işinde okunmaz. |

## Durum (oyunda olanlar)

- **Çekirdek ve simülatör:** İşletmeler (+ yükseltmeler), yöneticiler, kariyer, statü eşyaları (12 araç; **ev–araç zinciri**, 2026-10-11: araç evinde açılır, evin son aracı olmadan sonraki eve geçilmez, törenin bedava taşıması istisna; [game-design §4.4](./game-design-v2.md)), konut (kirala → satın al → kiraya ver), 8 sınıf (2026-10-08: Multimilyoner kalktı, İşçi ile Milyoner arasına Orta Sınıf $1M girdi, Milyoner $10M), yaş ve ömür (17 → 97, 1 dk ≈ 3 hafta), miras, hedefler. İşletme ana gelir: Çalıştır turda en az $1, yavaşlatma fiyatlardan (Gündelikçi 4,5 dk, İşçi 15 dk, Orta Sınıf ilk oturumun sonu, Milyoner dönüş oturumu). `npm run sim` 11 tempo + 4 his hedefi.
- **Önsöz:** 6 karelik görsel roman (annesini doğum gününde aradığı için kovulma → lojmandan çıkış → otogarda söz → ara sokakta Şans). Yeni oyuncu oyundan önce görür.
- **Ana ekran:** Tam ekran ara sokak; kahraman 4 pozla, yanında Şans. Şişe/kutu toplama (her biri ~2,5 sn gelir), Şans'ın 5–10 dakikada bir cüzdan getirmesi (sahibine verilir, teşekkür ödülü). Paralar kavisle bakiyeye uçar. Renkli üst bar (aylık gelir, sınıf, yaş, ayarlar), 3D ikonlu alt menü, sekmeler sahnenin üstünde sayfa.
- **Ekranlar:** İşletmeler (adet, aylık kazanç, Çalıştır, kilometre taşı çubuğu, 3 yükseltme, her işletmeye kendi yöneticisi: portre + işe alma kartı + cümleler), Kariyer, Alışveriş/Evler, Ayarlar (dil, gizlilik seçenekleri). Ana ekranda Hedefler kartı (3 hedef, ödül; her hedefte resim, nerede yapıldığı ve "Git": sekmeyi açıp düğmeyi parlatır; sekme içinde hedef şeridi). Ortak görünüm `ui/kit.tsx`, yazı tipi Fredoka.
- **Sınıf törenleri (1.10):** 7 tören, görsel roman (16 ifade portresi, çatı katı ve fotoğraf kareleri), "Önce / Şimdi" kartı; tören sırasında saat durur. İşçi töreninde Nevin Hanım ve torunu Defne (cüzdan zinciri; portreleri henüz yok, isim etiketiyle konuşuyorlar). Annenin 11 mesajı dönüş oturumlarında (20 saatte bir). Metinler story §4.
- **Sahne (1.6, 2026-10-10):** arka plan oturulan ev, o evin izin verdiği en iyi araç önünde park eder; taşınınca arka plan yumuşak geçer ve "Yeni evin" etiketi çıkar, yeni araç kayarak gelir. Ev 25 → 12 (eski kayıtlar taşınır); sınıf töreni hikâyenin evine taşır (Gündelikçi'de Rıza Amca minibüsünü verir). Kıyafet (2026-10-11): mağazada hikâyenin 4 kıyafeti, kahraman en iyisini giyer, tören sınıfınkini bedava verir; toplanacaklar ve Şans'ın tasması sınıfı izler (`ui/scene/stages.ts`). Yeni stilde olanlar: sokak, minibüs, eski kiralık daire, iş kıyafeti; araç 12 (5'i yeni stilde: bisiklet, skuter, emektar sedan, hatchback, SUV; ilk 4'ü son açıyla, önü sağa); kalan 9 ev, motosiklet, pikap ve araç 6–10 v1 görselleriyle yer tutuyor ([art-brief-v2.md](./art-brief-v2.md) §4.2, §4.6). Yerleşim metre ölçeğiyle (aşağıda "Sahne yerleşimi planı").
- **Bildirimler (1.19):** annenin mesajı ve kasa dolunca Şans; günde en fazla bir, 10:00–21:00; izin ilk törenden sonra; Ayarlar'da aç/kapa. Telefonda henüz denenmedi.
- **Ödül kartları:** Çevrimdışı kazanç (tavan sınıfla büyür: 10 dk → 2 sa), Şans'ın cüzdanı, yönetici işe alma.
- **Rehber (1.12, 2026-10-09):** Rıza Amca ilk dakikalarda kısa balonlarla ve işaret eden elle yönlendirir (şişe → ödül → iş → Çiçek Tezgâhı → isim → Çalıştır → yönetici); ilk tezgâhtan sonra kahramanın adını sorar (`ui/guide/`). Sürüm 25'te yok, sonraki AAB'de.
- **Ses ve haptik:** Toplama, alım, ödül.
- **Analitik (1.14):** `runtime/analytics.ts`, Firebase Analytics; oyuncu eylemleri `store.ts`'te, sınıf atlama, törenler, reklam, bildirime dokunma, sekmeler. Firebase projesi `prestige-life-idle-tycoon`, `android/app/google-services.json` yerinde; telefonda DebugView ile doğrulanmadı.
- **Reklam altyapısı:** `runtime/ads.ts` (AdMob 8.2.1, UMP izin formu, iOS ATT, web'de sahte reklam). Reklam yerleri henüz bağlı değil.
- **Mobil:** Kayıt Preferences'ta, Android geri tuşu, güvenli alanlar; `npm run phone` ile telefonda canlı yenileme.

## Sahne yerleşimi planı (2026-10-11, ikinci tur onaylandı; 1–4 kodda, 5–6 bekliyor)

Amaç: kahraman, Şans, araç ve ev her kombinasyonda aynı ölçekte ve birbirini kapatmadan dursun. Kod: `ui/scene/stages.ts` (sahne ölçeği, `HOME_ART`, `VEHICLE_SHAPE`, `vehicleBox`), `ui/scene/place.ts`, `ui/scene/SceneLab.tsx` (DEV → "Sahne laboratuvarı": 12 ev seçilen araçla, güvenli alan ve şerit çizgileriyle; küçültülen araçta kırmızı "×0,60" etiketi). Deneme görsellerinde bakıldı; tarayıcıda ve telefonda henüz bakılmadı.

1. **[x] Metre ölçeği:** kahraman 1,78 m = resim yüksekliğinin %40'ı; ayak çizgisinde (y %73,5) 1 m = %22,5. Ufuk kahramanın göz hizası (y %37); geriye gidince küçülme `(y − ufuk) / (ayak − ufuk)`. Ekran bu derinlikte yalnızca ~2,5 m genişliğinde: gerçek boyda bir araba ancak geride durursa sığar.
2. **[x] Araba şeridi geride, gerçek boyda:** tekerlekler y %62 (kahramanın ~2,5 m arkası), şerit x %13–89 = 2,75 m. İlk plandaki şerit (y %67) 2,0 m'ydi: hatchback'ten büyük her araba küçültülüyor, en pahalısı en çok küçülüyordu. Bisiklet ve skuter kahramanın yanında (y %70).
3. **[x] Burundan hizalama, aynalama yok:** aracın burnu x %89'da sabit, fazla uzunluk kahramanın arkasına gider; ön yüz hep açıkta. Yeni araç görselleri önü sağa üretilir; eski, önü sola bakanlar `facesLeft` ile aynalanır.
4. **[x] Boy gerçek yükseklikten:** `VEHICLE_SHAPE.metres` görselin kutusunun kapsadığı her şeyin yüksekliği (hatchback'te anten dahil 1,69). Genişlik = boy × görselin oranı; 2,75 m'yi aşan görsel küçültülür. Araç başına oran sınırı [art-prompts-v2.md §2](./art-prompts-v2.md).
5. **[ ] Görseller (kullanıcı, GPT):** araç 1–4 yeni açıyla oyunda; **SUV (5), motosiklet, pikap ve 6–10** yeni komutla üretilecek. Her ev yalnızca kendi iki aracına göre düşünülür (zincir tablosu [art-prompts-v2.md §2](./art-prompts-v2.md)). Ev arka planlarında **derin zemin** (zemin çizgisi en çok y %55, evi tanıtan şey y %15–37): **minibüs (ev 2) ve eski daire (ev 4) yeniden**, ev 3 ve 5–12 yeni komutlarla. Çadır kalıyor (araba gelmez): aynalanmıyor, çadır sağda açıkta, kahraman ve Şans biraz sağda (`castX`), iki teker solda. Şimdiki minibüs ve eski daire sığ zeminli; onlarda araba şeridi y %66'da (`SHALLOW_LAYOUT`) ve ikisi sahnede aynalanıyor.
6. **[ ] Ev başına yerleşim ve telefonda son ayar:** her yeni ev gelince laboratuvarda bakılır, o eve özel araç şeridi ve ışık `HOME_ART`'a yazılır; kahramanın ve Şans'ın yatay yeri de ev başına kaydırılabilir (`castX`; ayak çizgisi ve boy her evde sabit). Sonra S24+ üzerinde tek tek bakılır. Araç gölgesinin görselden çıkarılıp sahnede çizilmesi de burada.

Ekran haritası (resmin oranı): üst %15 üst bar · %15–37 evin kimliği · en çok %55 duvarın zemine değdiği çizgi · %62 araba şeridi (x %13–89) · %70 iki teker şeridi · %73,5 kahraman (x %40) ve Şans (x %66) · %77–87 toplanacaklar · alt %10 menü · yatay güvenli alan x %12–88.

## Son oturumda kararlaşanlar (2026-10-10)

- **Mağaza sahnede görünür:** arka plan oturulan ev, araç evin önünde; ev sayısı 12; tören taban evi verir (game-design §4.8). Ev bonusu kademe başına %8, sim tüm hedefleri tutuyor.
- **Yeni ev ve araç görsellerini kullanıcı GPT ile üretecek** ([art-brief-v2.md](./art-brief-v2.md) §4.2, §4.6).
- **Dil seçimi Preferences'ta** (telefonda silinmez).

## Önceki oturumda kararlaşanlar (2026-10-09)

- **AAB'den önce:** hikâyenin ilerlemesi ve ana ekranın değişmesi; sonra imzalı v2 sürümü kapalı test kanalına.
- **Cüzdan zinciri Faz 1'e alındı:** Nevin Hanım ve Defne İşçi töreninde; devamı (buluşma, düğün, varis) Faz 2.
- **Görseller önce GPT ile:** kullanıcı projeyi gören bir GPT'ye [art-brief-v2.md](./art-brief-v2.md)'yi verecek; beğenilmezse fal.ai.
- **Analitik bağlandı:** Firebase projesi `prestige-life-idle-tycoon`.

## Ekonomi (2026-10-09)

Yeniden ayarlandı, kullanıcı telefonda deneyecek; açık sorular [discussion-notes.md §5](./discussion-notes.md). Simülatör hedefleri `src/game/sim/report.ts`'te yeni tempoya göre (varsayılan 45 gün). Eski kayıtlar açılır ama fiyatlar ve yaş değişti.

## Sıradaki (sırayla)

0. **Önce konuşulacak:** genel gözden geçirme (ilerleme hissi, yaş–hikâye çelişkisi, ilk oturum, eskimiş belgeler) [discussion-notes.md §8](./discussion-notes.md)'de; kullanıcı yeni oturumda birlikte ele almak istiyor, hiçbiri kararlaştırılmadı.
1. **Görseller gelince oyuna bağlamak:** ilk set (İşçi aşaması) bağlandı; sıradaki hatchback (araç çapası), bisiklet, ev 3 ve 5 (ilk oturumda görülenler), sonra kıyafet 3, ev 6–7, kalan araçlar, Nevin/Defne portreleri (`FACES`), hikâye kareleri (`ceremonyScript.ts`). Liste [art-brief-v2.md](./art-brief-v2.md). Yeni araç ya da ev gelince: araçta `stages.ts` `VEHICLE_SHAPE`'e görselin en/boy oranı yazılır, DEV → Sahne laboratuvarı'ndan bakılır; evde `HOME_ART`'a yerleşim. Önce SUV (5) ve eski daire (ev 4) yeniden üretilecek (sahne yerleşimi planı adım 5).
2. **Telefonda deneme:** törenler (DEV → "Töreni oynat" 1–7; sahne tören bitince değişmeli), annenin mesajı, bildirim ve "Deneme bildirimi (5 sn)", Firebase DebugView (`adb shell setprop debug.firebase.analytics.app com.prestigelife.idletycoon`). Yeni yerel eklentiler olduğu için `npm run phone -- --install`.
3. **İmzalı v2 AAB → kapalı test kanalı:** ilk v2 AAB alındı (2026-10-09, sürüm kodu 25, `versionName` 2.0, İşçi sahnesi dahil; `~/Downloads/prestige-life-v2-25.aab`. 24 Play'e yüklenmişti; Play'in RevenueCat SDK uyarısı yüzünden eklenti 13.7.3'e güncellendi). Yükleme kullanıcıda. Kapalı testin 14 günü ~2026-10-20'de doluyor; testçiler listede kalmalı.
   Sürüm derleme: sürüm kodunu artır (`android/app/build.gradle`), sonra `VITE_DEV_MENU=false VITE_ADMOB_TESTING=false npm run build:v2 && npx cap sync android`, ardından `android/`'da `./gradlew bundleRelease` (JAVA_HOME Android Studio'nun Java'sı). Ortam değişkenleri şart: `.env.v2` DEV menüsünü, `.env.local` test reklamını açık tutuyor.
4. **Faz 1'in kalanı:** oyun testi paketi (1.15), tören hediyesi, ekonomi ayarının kalanı (discussion-notes §5), reklam yerleri ve IAP ([monetization-v2](./monetization-v2.md)), hayaller panosu (1.8). Ayrıntı: [rebuild-plan.md](./rebuild-plan.md).

## Kullanıcının yapacakları

- **Play mağaza ekran görüntüleri (2026-10-09):** 4 görsel × TR/EN, 1080×1920 JPG, `~/Downloads/play-store-v2/` ve `art/store-v2/` (yeniden üretme betikleri de orada: `capture.mjs` sürüm derlemesinden ekranları çeker, `compose.mjs` başlıkla çerçeveler). Play Console → Ana mağaza girişi → Telefon ekran görüntüleri; TR görseller Türkçe girişe, EN İngilizce girişe.
- **Play ikonu ve özellik grafiği (2026-10-09):** `icon-512.png` (fal.ai nano-banana-pro, yarı sokak / yarı takım elbise + Şans; 1024'lük kaynağı `art/store-v2/icon-1024.png`) ve `feature-tr.jpg` / `feature-en.jpg` (1024×500, `feature.mjs`). Uygulamanın telefondaki ikonu (`android/.../mipmap-*`) hâlâ v1'inki; istenirse bu ikondan üretilir.

- **Görselleri GPT ile üretmeye devam** ([art-brief-v2.md](./art-brief-v2.md); ilk set oyunda; sıradaki araçlar: SUV (5), motosiklet, pikap, 6–10; evler: minibüs (ev 2, yeniden), ev 3 Kiralık Oda, eski daire (ev 4, yeniden), ev 5 Yenice Kiralık Daire, sonra sırayla ([art-prompts-v2.md](./art-prompts-v2.md), hazır komutlar), sonra kıyafet 3, Nevin ve Defne kılavuzları).
- **Telefonda İşçi sahnesini denemek:** DEV → "Töreni oynat" 2; tören bitince daire önü, iş kıyafeti ve bozuk paralar gelmeli. Boy/konum kötü görünürse söyle.
- **Telefonda törenleri, sahne geçişini ve bildirimi denemek** (yukarıda 2).
- **Telefonda gerçek test reklamını denemek:** DEV → "Test reklamı izle"; Google'ın "Test Ad" reklamı açılmalı, sonuç "rewarded" olmalı.
- **AdMob konsolu:** Privacy & messaging → "European regulations" (GDPR) mesajı oluşturup uygulamaya bağlamak (yoksa AB'de izin formu açılmaz); yayından önce `app-ads.txt`.
- **Google Play kapalı testi (v1 yapısıyla, 2026-10-06 civarı 12 kişi tamamlandı):** 14 günlük süre işliyor, ~2026-10-20'de dolar. Testçiler listeden çıkmamalı, kapalı test kanalı kapatılmamalı. Süre dolunca Play Console'dan yayın erişimi başvurusu (test hakkında sorular sorar).
- **Test kullanıcısı listesi** (Faz 1 oyun testi için 20–50 kişi; dahili test kanalı).

## Çalıştırma

- `npm run dev:v2` (v1 için `npm run dev`); tarayıcıda geliştirici menüsü (DEV) açık.
- Telefonda gerçek uygulama, canlı yenilemeyle: `npm run phone` (Android; kablosuz hata ayıklama ya da USB). Kablosuz port değişince `npm run phone -- PORT`; yerel eklenti değişince `npm run phone -- --install`. Oyun adb tüneliyle gelir, Mac'in IP'si önemli değil. Kullanıcının telefonu Samsung Galaxy S24+ (Android 16), eşlendi. Gradle için `JAVA_HOME` Android Studio'nun Java 21'i (`~/.zshrc`; sistemdeki `java` 8 kaldı).
- `npm run sim` ekonomi simülatörü; `npm run typecheck`, `npx eslint src/game`.
- Kod: `src/game/` (çekirdek `core/`, simülatör `sim/`, runtime `runtime/`, i18n `i18n/`, ekranlar `ui/`). Kayıt anahtarı `prestige_life_v2`. Türkçe + İngilizce; sabit metin yok.
- Görseller fal.ai ile (MCP bağlı, kullanıcının bakiyesi ~$10, ~$5,2 harcandı, kalan ~$4,8); stil kılavuzu [story-v2.md §8](./story-v2.md). Kaynak dosyalar `art/` (git'te değil, 184 MB), oyundakiler `public/assets/`.
- Git dışı klasörler (`art/`, `gpt-astra-inceleme/`, `rich inc oyun görselleri/`) Google Drive'da yedekli: My Drive → "Prestige Life yedek" (Drive for desktop). Yeni görsel üretince `npm run backup` (sadece yeni/değişen dosyaları kopyalar).

## Uygulama kimliği (v1 ve v2 ortak)

- Paket adı: `com.prestigelife.idletycoon` · Uygulama adı: Prestige Life: Idle Tycoon
- AdMob App ID: Android `ca-app-pub-8950990027285549~9898475278`, iOS `ca-app-pub-8950990027285549~3253175874`; ödüllü birimler `runtime/ads.ts`.
- IAP: v1'in 8 ürünü Play Console'da (`com.prestigelife.*`, liste [v1/session-handoff-v1.md](./v1/session-handoff-v1.md)); v2'de pasifleştirilip yenileri açılacak.
