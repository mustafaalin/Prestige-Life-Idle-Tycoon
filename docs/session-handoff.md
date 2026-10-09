# Session Handoff

Son güncelleme: 2026-10-09 · Dal: `v2-rebuild`

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

- **Çekirdek ve simülatör:** İşletmeler (+ yükseltmeler), yöneticiler, kariyer, statü eşyaları, konut (kirala → satın al → kiraya ver), 8 sınıf (2026-10-08: Multimilyoner kalktı, İşçi ile Milyoner arasına Orta Sınıf $1M girdi, Milyoner $10M), yaş ve ömür (17 → 97, 1 dk ≈ 3 hafta), miras, hedefler. İşletme ana gelir: Çalıştır turda en az $1, yavaşlatma fiyatlardan (Gündelikçi 4,5 dk, İşçi 15 dk, Orta Sınıf ilk oturumun sonu, Milyoner dönüş oturumu). `npm run sim` 11 tempo + 4 his hedefi.
- **Önsöz:** 6 karelik görsel roman (annesini doğum gününde aradığı için kovulma → lojmandan çıkış → otogarda söz → ara sokakta Şans). Yeni oyuncu oyundan önce görür.
- **Ana ekran:** Tam ekran ara sokak; kahraman 4 pozla, yanında Şans. Şişe/kutu toplama (her biri ~2,5 sn gelir), Şans'ın 5–10 dakikada bir cüzdan getirmesi (sahibine verilir, teşekkür ödülü). Paralar kavisle bakiyeye uçar. Renkli üst bar (aylık gelir, sınıf, yaş, ayarlar), 3D ikonlu alt menü, sekmeler sahnenin üstünde sayfa.
- **Ekranlar:** İşletmeler (adet, aylık kazanç, Çalıştır, kilometre taşı çubuğu, 3 yükseltme, her işletmeye kendi yöneticisi: portre + işe alma kartı + cümleler), Kariyer, Alışveriş/Evler, Ayarlar (dil, gizlilik seçenekleri). Ana ekranda Hedefler kartı (3 hedef, ödül; her hedefte resim, nerede yapıldığı ve "Git": sekmeyi açıp düğmeyi parlatır; sekme içinde hedef şeridi). Ortak görünüm `ui/kit.tsx`, yazı tipi Fredoka.
- **Sınıf törenleri (1.10):** 7 tören, görsel roman (16 ifade portresi, çatı katı ve fotoğraf kareleri), "Önce / Şimdi" kartı; tören sırasında saat durur. İşçi töreninde Nevin Hanım ve torunu Defne (cüzdan zinciri; portreleri henüz yok, isim etiketiyle konuşuyorlar). Annenin 11 mesajı dönüş oturumlarında (20 saatte bir). Metinler story §4.
- **Sahne aşamaları (1.6):** ana ekran sınıfı izler (`ui/scene/stages.ts`); tören bitince yeni yer ve kıyafet. Oyunda sokak, minibüs (Gündelikçi) ve kiralık daire önü (İşçi: iş kıyafeti, 4 poz, bozuk paralar; GPT ile, 2026-10-09); diğer aşamaların görselleri [art-brief-v2.md](./art-brief-v2.md)'de, gelene kadar önceki aşama görünür.
- **Bildirimler (1.19):** annenin mesajı ve kasa dolunca Şans; günde en fazla bir, 10:00–21:00; izin ilk törenden sonra; Ayarlar'da aç/kapa. Telefonda henüz denenmedi.
- **Ödül kartları:** Çevrimdışı kazanç (tavan sınıfla büyür: 10 dk → 2 sa), Şans'ın cüzdanı, yönetici işe alma.
- **Ses ve haptik:** Toplama, alım, ödül.
- **Analitik (1.14):** `runtime/analytics.ts`, Firebase Analytics; oyuncu eylemleri `store.ts`'te, sınıf atlama, törenler, reklam, bildirime dokunma, sekmeler. Firebase projesi `prestige-life-idle-tycoon`, `android/app/google-services.json` yerinde; telefonda DebugView ile doğrulanmadı.
- **Reklam altyapısı:** `runtime/ads.ts` (AdMob 8.2.1, UMP izin formu, iOS ATT, web'de sahte reklam). Reklam yerleri henüz bağlı değil.
- **Mobil:** Kayıt Preferences'ta, Android geri tuşu, güvenli alanlar; `npm run phone` ile telefonda canlı yenileme.

## Son oturumda kararlaşanlar (2026-10-09)

- **AAB'den önce:** hikâyenin ilerlemesi ve ana ekranın değişmesi; sonra imzalı v2 sürümü kapalı test kanalına.
- **Sahne sınıfı izler** (mağaza ev/kıyafet ekonomisi kapalı testten sonra, discussion-notes §7).
- **Cüzdan zinciri Faz 1'e alındı:** Nevin Hanım ve Defne İşçi töreninde; devamı (buluşma, düğün, varis) Faz 2.
- **Görseller önce GPT ile:** kullanıcı projeyi gören bir GPT'ye [art-brief-v2.md](./art-brief-v2.md)'yi verecek; beğenilmezse fal.ai.
- **Analitik bağlandı:** Firebase projesi `prestige-life-idle-tycoon`.

## Ekonomi (2026-10-09)

Yeniden ayarlandı, kullanıcı telefonda deneyecek; açık sorular [discussion-notes.md §5](./discussion-notes.md). Simülatör hedefleri `src/game/sim/report.ts`'te yeni tempoya göre (varsayılan 45 gün). Eski kayıtlar açılır ama fiyatlar ve yaş değişti.

## Sıradaki (sırayla)

1. **Görseller gelince oyuna bağlamak:** ilk set (İşçi aşaması) bağlandı; kalanlar [art-brief-v2.md](./art-brief-v2.md) §5–6 (Orta Sınıf ve sonrası, Nevin/Defne portreleri `FACES`'e, hikâye kareleri `ceremonyScript.ts`'e).
2. **Telefonda deneme:** törenler (DEV → "Töreni oynat" 1–7; sahne tören bitince değişmeli), annenin mesajı, bildirim ve "Deneme bildirimi (5 sn)", Firebase DebugView (`adb shell setprop debug.firebase.analytics.app com.prestigelife.idletycoon`). Yeni yerel eklentiler olduğu için `npm run phone -- --install`.
3. **İmzalı v2 AAB → kapalı test kanalı:** ilk v2 AAB alındı (2026-10-09, sürüm kodu 25, `versionName` 2.0, İşçi sahnesi dahil; `~/Downloads/prestige-life-v2-25.aab`. 24 Play'e yüklenmişti; Play'in RevenueCat SDK uyarısı yüzünden eklenti 13.7.3'e güncellendi). Yükleme kullanıcıda. Kapalı testin 14 günü ~2026-10-20'de doluyor; testçiler listede kalmalı.
   Sürüm derleme: sürüm kodunu artır (`android/app/build.gradle`), sonra `VITE_DEV_MENU=false VITE_ADMOB_TESTING=false npm run build:v2 && npx cap sync android`, ardından `android/`'da `./gradlew bundleRelease` (JAVA_HOME Android Studio'nun Java'sı). Ortam değişkenleri şart: `.env.v2` DEV menüsünü, `.env.local` test reklamını açık tutuyor.
4. **Faz 1'in kalanı:** onboarding ve Rıza Amca rehber balonları (1.12), oyun testi paketi (1.15), tören hediyesi, ekonomi ayarının kalanı (discussion-notes §5), reklam yerleri ve IAP ([monetization-v2](./monetization-v2.md)), hayaller panosu (1.8). Ayrıntı: [rebuild-plan.md](./rebuild-plan.md).

## Kullanıcının yapacakları

- **Görselleri GPT ile üretmeye devam** ([art-brief-v2.md](./art-brief-v2.md); ilk set oyunda; sıradaki: kıyafet 3 + Orta Sınıf arka planı, Nevin ve Defne kılavuzları).
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
