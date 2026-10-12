# Session Handoff

Son güncelleme: 2026-10-12 · Dal: `v2-rebuild`

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
| [art-brief-v2.md](./art-brief-v2.md) | Görsel listesi | Boyutlar, referanslar, durum; bekleyenler §5. |
| [art-prompts-v2.md](./art-prompts-v2.md) | GPT'ye yapıştırılacak hazır komutlar | Evler, araçlar, karakterler, kıyafet 3 ve 4. |
| [mobile-ad-integration.md](./mobile-ad-integration.md) | v2 reklam altyapısı | v1'inki [v1/](./v1/) altında. |
| [v1/](./v1/) | v1 arşivi | v2 işinde okunmaz. |

## Durum (oyunda olanlar)

- **Çekirdek ve simülatör:** İşletmeler (+ yükseltmeler), yöneticiler, kariyer, statü eşyaları (12 araç; **ev–araç zinciri**, 2026-10-11: araç evinde açılır, evin son aracı olmadan sonraki eve geçilmez, törenin bedava taşıması istisna; [game-design §4.4](./game-design-v2.md)), konut (kirala → satın al → kiraya ver; 2026-10-12: kendi evinde oturana +%8 ek bonus, kira 3 kat hızlı, eski eve geri taşınma yok; [game-design §4.8](./game-design-v2.md)), 8 sınıf (2026-10-08: Multimilyoner kalktı, İşçi ile Milyoner arasına Orta Sınıf $1M girdi, Milyoner $10M), yaş ve ömür (17 → 80, 1 dk ≈ 3 hafta; 2026-10-11'de 97'den indi, ömür ~17 saatlik oyun), miras, hedefler. İşletme ana gelir: Çalıştır turda en az $1, yavaşlatma fiyatlardan (Gündelikçi 4,5 dk, İşçi 15 dk, Orta Sınıf ilk oturumun sonu, Milyoner dönüş oturumu). `npm run sim` 11 tempo + 4 his hedefi.
- **Önsöz:** 6 karelik görsel roman (annesini doğum gününde aradığı için kovulma → lojmandan çıkış → otogarda söz → ara sokakta Şans). Yeni oyuncu oyundan önce görür.
- **Ana ekran:** Tam ekran ara sokak; kahraman pozlarıyla, yanında Şans. Yerden toplama (her nesne ~2,5 sn gelir; Orta Sınıf'ta biter), Şans'ın 5–10 dakikada bir cüzdan getirmesi (sahibine verilir, teşekkür ödülü). Paralar kavisle bakiyeye uçar. Renkli üst bar (aylık gelir, sınıf, yaş, ayarlar), 3D ikonlu alt menü, sekmeler sahnenin üstünde sayfa.
- **Olay kartları (2026-10-12):** Orta Sınıf'tan sonra yerde toplanacak kalmaz; tanıdık biri arar, kartta sağlamcı ve cesur iki cevap (10 kart, `ui/events/`; kurallar [game-design §4.7](./game-design-v2.md)).
- **Ekranlar:** İşletmeler (adet, aylık kazanç, Çalıştır, kilometre taşı çubuğu, 3 yükseltme, her işletmeye kendi yöneticisi: portre + işe alma kartı + cümleler), Kariyer, Alışveriş/Evler, Ayarlar (dil, gizlilik seçenekleri). Ana ekranda Hedefler kartı (3 hedef, ödül; her hedefte resim, nerede yapıldığı ve "Git": sekmeyi açıp düğmeyi parlatır; sekme içinde hedef şeridi). Ortak görünüm `ui/kit.tsx`, yazı tipi Fredoka.
- **Sınıf törenleri (1.10):** 7 tören, görsel roman (24 ifade portresi, çatı katı ve fotoğraf kareleri), "Önce / Şimdi" kartı; tören sırasında saat durur. İşçi töreninde Nevin Hanım ve torunu Defne (cüzdan zinciri; ikisinin de ifade portreleri oyunda). Annenin 11 mesajı dönüş oturumlarında (20 saatte bir). Metinler story §4.
- **Sahne (1.6, 2026-10-10):** arka plan oturulan ev, o evin izin verdiği en iyi araç önünde park eder; taşınınca arka plan yumuşak geçer ve "Yeni evin" etiketi çıkar, yeni araç kayarak gelir. Ev 25 → 12 (eski kayıtlar taşınır); sınıf töreni hikâyenin evine taşır (Gündelikçi'de Rıza Amca minibüsünü verir). Kıyafet (2026-10-11): mağazada hikâyenin 4 kıyafeti, kahraman en iyisini giyer, tören sınıfınkini bedava verir; toplanacaklar ve Şans'ın tasması sınıfı izler (`ui/scene/stages.ts`). Yeni stilde olanlar: iş kıyafeti, **12 aracın hepsi** (önü sağa, 2026-10-12) ve **12 evin hepsi** (ev 2–12 derin zeminli yeni görsellerle, 2026-10-12) ([art-prompts-v2.md](./art-prompts-v2.md) §1). Yerleşim metre ölçeğiyle (aşağıda "Sahne yerleşimi planı").
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
3. **[x] Burundan hizalama, aynalama yok:** aracın burnu x %89'da sabit, fazla uzunluk kahramanın arkasına gider; ön yüz hep açıkta. Bütün araç görselleri önü sağa; ne araç ne arka plan aynalanır. Tek istisna çadır: iki teker solda, **önü sola** durur (şeridin `facesLeft`'i; burun x %14'te, arkası kahramanın arkasında) ve sağdan gelir.
4. **[x] Boy gerçek yükseklikten:** `VEHICLE_SHAPE.metres` görselin kutusunun kapsadığı her şeyin yüksekliği (hatchback'te anten, SUV'da tavan rayı, motosiklette aynalar dahil). Genişlik = boy × görselin oranı; 2,75 m'yi aşan görsel küçültülür (şimdi yalnızca pikap ve arazi aracı, ×0,96). Araç başına oran sınırı [art-prompts-v2.md §2](./art-prompts-v2.md).
5. **[ ] Görseller (kullanıcı, GPT):** **araçlar tamam (12/12 oyunda).** **Evler de oyunda (12/12, 2026-10-12)**; derin zemin, araç şeridi varsayılan y %62. Ev 6–12'ye deneme görsellerinde kendi iki aracıyla bakıldı: 6–9, 11, 12 iyi (ev 7 üçüncü denemede: ev uzakta ve bir metre yüksekte, önünde taş duvar ve çit; kaynak `home-7-first-house.png`); ev 10 (göl evi) sınırda (arazi aracı sol kanadı kapatıyor) ([art-prompts-v2.md §1](./art-prompts-v2.md)). Her ev yalnızca kendi iki aracına göre düşünülür. Çadır kalıyor (araba gelmez).
6. **[ ] Ev başına yerleşim ve telefonda son ayar:** her yeni ev gelince laboratuvarda bakılır, o eve özel araç şeridi ve ışık `HOME_ART`'a yazılır; kahramanın ve Şans'ın yatay yeri de ev başına kaydırılabilir (`castX`; ayak çizgisi ve boy her evde sabit). Ev 2–5'te kahraman %7 sağda (minibüs ve kapılar açıkta kalsın diye); laboratuvarda bakıldı, telefonda bakılmadı. Sonra S24+ üzerinde tek tek bakılır. Araç gölgesinin görselden çıkarılıp sahnede çizilmesi de burada.

Ekran haritası (resmin oranı): üst %15 üst bar · %15–37 evin kimliği · en çok %55 duvarın zemine değdiği çizgi · %62 araba şeridi (x %13–89) · %70 iki teker şeridi · %73,5 kahraman (x %40) ve Şans (x %66) · %77–87 toplanacaklar · alt %10 menü · yatay güvenli alan x %12–88.

## Son oturum (2026-10-12)

- **Yerden toplama Orta Sınıf'ta biter, yerini olay kartları alır** ([game-design §4.7](./game-design-v2.md), metinler [story-v2.md §4d](./story-v2.md)). Sağlamcı cevap 45 sn gelir, cesur cevap %50 ihtimalle 100 sn, olmazsa 10 sn. Ödül cevap anında ödenir, üst bar "Topla"ya kadar göstermez; cevabın saati kayıtta, oyunu kapatıp açmak avantaj vermez. "30 şişe topla" hedefi toplama bitince tamamlanmış sayılır. Kod `core/config/events.ts`, `ui/events/`; DEV → "Olay kartı gelsin" (Orta Sınıf'tan önce de çalışır). Tarayıcıda DEV'den bir kart denendi (ilk sürüm); ödeme ve kayıt betikle denendi. Gerçek zamanlama, Orta Sınıf'ta yerin boşalması, çağrı düğmesinin yeri ve telefon denenmedi.
- **Konut ([game-design §4.8](./game-design-v2.md)):** kendi evinde oturana +%8 ek bonus; kira 3 kat hızlı; çıkılan eve geri taşınma yok. Milyoner töreni "İlk Kendi Evin"i sahipli verir.
- **Ev–araç zinciri ([game-design §4.4](./game-design-v2.md)):** çadırda yalnızca bisiklet, skuter minibüste, emektar sedan ve motosiklet kiralık odada. Tören yalnızca evi değiştirir, araç vermez; sonraki eve geçmek için o eve kadar açılan bütün araçlar alınmış olmalı.
- **12 ev ve 12 araç yeni görsellerle oyunda.** Ev 7 üçüncü kez üretildi (kullanıcı telefonda pikap ve makam sedanını evin önünde çok büyük buldu; yeni görselde ev uzakta ve yüksekte). Yeni ev 7 ve ev 10 telefonda bakılacak.
- **Pozlar:** kapüşonlunun umutlu bekleme pozu (çadır dışındaki evlerde; `stages.ts` `heroLook(kıyafet, ev)`), iş kıyafetinin eğilme pozları büyütüldü. Telefonda bakılmadı.
- **Belgeler gözden geçirildi:** eskimiş sayılar güncel simülatöre çekildi, kararlaşmış konular tartışma notlarından çıkarıldı, v1 reklam notları `v1/` altına taşındı, kullanılmayan görseller silindi.
- Simülatör tüm hedefleri tutuyor: Milyarder 1 sa 43 dk, Multimilyarder 5 sa 6 dk, En Zengin 11 sa 21 dk, ömür sonu 25. gün ([game-design §5](./game-design-v2.md)).

## Ekonomi

2026-10-09'da yeniden ayarlandı, kullanıcı telefonda deneyecek; açık sorular [discussion-notes.md §5](./discussion-notes.md). Simülatör hedefleri `src/game/sim/report.ts`'te (varsayılan 45 gün). Eski kayıtlar açılır ama fiyatlar ve yaş değişti.

## Sıradaki (sırayla)

0. **Şans'ın getirdiği şey sınıfa göre değişsin mi** (konuşulacak; mekanik aynı kalacak): [discussion-notes.md §7](./discussion-notes.md).
0. **Kıyafet 3 ve 4** (kullanıcı GPT ile üretiyor; komutlar [art-prompts-v2.md §4](./art-prompts-v2.md)): görseller gelince kesilip `stages.ts` `HERO_ART`'a bağlanır.
0. **Hayat anlarının izi ana ekranda** (öneri, karar bekliyor): Defne ve kızından mesajlar, aile albümü ([story-v2.md §7](./story-v2.md)).
0. **Konuşulacak kalanlar:** ilerleme hissi (ilk oturumda tek tören, yaş temposu, 4. saatten sonrası) [discussion-notes.md §8](./discussion-notes.md)'de; kararlaştırılmadı.
1. **Görseller gelince oyuna bağlamak:** araçlar ve 12 ev bağlandı; sıradaki kıyafet 3, hikâye kareleri (`ceremonyScript.ts`). Liste [art-brief-v2.md](./art-brief-v2.md). Yeni ev gelince: `public/assets/scene/home-N.webp` (1080 px genişlik), `housing.ts`'te görsel, gerekirse `stages.ts` `HOME_ART`'a yerleşim; DEV → Sahne laboratuvarı'ndan bakılır. Araçta `scripts/cutout-vehicle.sh` ve `VEHICLE_SHAPE`.
2. **Telefonda deneme:** törenler (DEV → "Töreni oynat" 1–7; sahne tören bitince değişmeli), annenin mesajı, bildirim ve "Deneme bildirimi (5 sn)", Firebase DebugView (`adb shell setprop debug.firebase.analytics.app com.prestigelife.idletycoon`). Yeni yerel eklentiler olduğu için `npm run phone -- --install`.
3. **İmzalı v2 AAB → kapalı test kanalı:** ilk v2 AAB alındı (2026-10-09, sürüm kodu 25, `versionName` 2.0, İşçi sahnesi dahil; `~/Downloads/prestige-life-v2-25.aab`. 24 Play'e yüklenmişti; Play'in RevenueCat SDK uyarısı yüzünden eklenti 13.7.3'e güncellendi). Yükleme kullanıcıda. Kapalı testin 14 günü ~2026-10-20'de doluyor; testçiler listede kalmalı.
   Sürüm derleme: sürüm kodunu artır (`android/app/build.gradle`), sonra `VITE_DEV_MENU=false VITE_ADMOB_TESTING=false npm run build:v2 && npx cap sync android`, ardından `android/`'da `./gradlew bundleRelease` (JAVA_HOME Android Studio'nun Java'sı). Ortam değişkenleri şart: `.env.v2` DEV menüsünü, `.env.local` test reklamını açık tutuyor.
4. **Faz 1'in kalanı:** oyun testi paketi (1.15), tören hediyesi, ekonomi ayarının kalanı (discussion-notes §5), reklam yerleri ve IAP ([monetization-v2](./monetization-v2.md)), hayaller panosu (1.8). Ayrıntı: [rebuild-plan.md](./rebuild-plan.md).

## Kullanıcının yapacakları

- **Play mağaza ekran görüntüleri (2026-10-09):** 4 görsel × TR/EN, 1080×1920 JPG, `~/Downloads/play-store-v2/` ve `art/store-v2/` (yeniden üretme betikleri de orada: `capture.mjs` sürüm derlemesinden ekranları çeker, `compose.mjs` başlıkla çerçeveler). Play Console → Ana mağaza girişi → Telefon ekran görüntüleri; TR görseller Türkçe girişe, EN İngilizce girişe.
- **Play ikonu ve özellik grafiği (2026-10-09):** `icon-512.png` (fal.ai nano-banana-pro, yarı sokak / yarı takım elbise + Şans; 1024'lük kaynağı `art/store-v2/icon-1024.png`) ve `feature-tr.jpg` / `feature-en.jpg` (1024×500, `feature.mjs`). Uygulamanın telefondaki ikonu (`android/.../mipmap-*`) hâlâ v1'inki; istenirse bu ikondan üretilir.

- **Telefonda olay kartlarını ve pozları denemek:** DEV → "Olay kartı gelsin" (çağrı alt ortada bekler, Şans ve Hedefler kartıyla çakışıyor mu; iki cevabı da dene; cesur cevaptan sonra bakiye "Topla"ya kadar sabit kalmalı; sonuç ekranındayken uygulamayı kapatıp açınca ödül bakiyede olmalı). Yerin boşalması için gerçekten Orta Sınıf'a çıkmak ya da DEV'den para eklemek gerekir ("Töreni oynat" 3 göstermez). Minibüste umutlu poz, iş kıyafetinde eğilme pozlarının boyu.
- **Telefonda evlere bakmak:** yeni ev 7 (pikap ve makam sedanıyla; kahramanın başı çit hizasında), ev 10 (göl evi; arazi aracı sol kanadı kapatıyor), Evler sayfası ("Senin" etiketi, ek bonus, toplam kira), Milyoner töreni (DEV → "Töreni oynat" 4), zincirin başı (çadırda bisiklet, minibüste skuter).
- **Telefonda hayat anlarını denemek:** DEV → "Hayat anını oynat" 25 / 28 / 31; 31'den sonra isim sorusu DEV'den oynatınca gelmez (gerçek akışta gelir).
- **Görselleri GPT ile üretmeye devam:** araçlar ve evler oyunda; sıradaki kıyafet 3 ve 4 ([art-prompts-v2.md §4](./art-prompts-v2.md): önce kılavuz, onaylayınca 3 poz).
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
- Görseller fal.ai ile (MCP bağlı, kullanıcının bakiyesi ~$10, ~$5,95 harcandı, kalan ~$4,05 (2026-10-11: Defne ve Nevin sayfaları, 3 hayat karesi, $0,75)); stil kılavuzu [story-v2.md §8](./story-v2.md). Kaynak dosyalar `art/` (git'te değil, 184 MB), oyundakiler `public/assets/`.
- Git dışı klasörler (`art/`, `gpt-astra-inceleme/`, `rich inc oyun görselleri/`) Google Drive'da yedekli: My Drive → "Prestige Life yedek" (Drive for desktop). Yeni görsel üretince `npm run backup` (sadece yeni/değişen dosyaları kopyalar).

## Uygulama kimliği (v1 ve v2 ortak)

- Paket adı: `com.prestigelife.idletycoon` · Uygulama adı: Prestige Life: Idle Tycoon
- AdMob App ID: Android `ca-app-pub-8950990027285549~9898475278`, iOS `ca-app-pub-8950990027285549~3253175874`; ödüllü birimler `runtime/ads.ts`.
- IAP: v1'in 8 ürünü Play Console'da (`com.prestigelife.*`, liste [v1/session-handoff-v1.md](./v1/session-handoff-v1.md)); v2'de pasifleştirilip yenileri açılacak.
