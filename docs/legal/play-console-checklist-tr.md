# Prestige Life — Play Console ve yayın kontrolü

İnceleme: 22 Ekim 2026. Kapsam: mevcut v2 Android kaynak kodu. Veri sorumlusu Mustafa ALIN, marka Math Games Studio, destek mathgamesstudio@gmail.com. Kullanıcının beyan ettiği hedef kitle 13+. Şirket kurulmuş gibi yazılmadı.

## Teslimler ve yayın durumu

- privacy-en.md / privacy-tr.md: güncel gizlilik metinleri.
- terms-en.md / terms-tr.md: yeni kullanım şartları.
- data-deletion-en.md / data-deletion-tr.md: yeni veri başvurusu sayfaları.
- Aynı isimli HTML dosyaları: bağımsız, okunabilir web sayfası çıktıları.
- ../privacy-policy.html: güncellenmiş iki dilli toplu HTML. Eski dosya ve canlı sayfa bu klasörde tarihli arşivlendi.
- Bu dosyalar yerel teslimdir. Web sitesine veya Play Console'a yayın yapılmadı.
- Ayarlara gerçek ve mevcut EN/TR gizlilik URL'leri ile destek e-postası eklendi. Yeni APK/AAB yayımlanmadan kullanıcıların oyununa gelmez. Şartlar için bağlantı, hedef sayfa yayına alındıktan sonra eklenmeli.

**Yayın öncesi açık konular:** Analytics saklama süresi/yenileme ayarı; Analytics ve reklam rızası bağlantısı; AdMob mesajlarının yayında olması ve genç kullanıcı ayarları; veri sorumlusu için gerekli tebligat/iletişim adresi ve uluslararası aktarım düzenlemeleri. Bilinmeyen sözleşme, adres veya saklama süresi uydurulmadı. Metinler teknik bulgulara dayalı taslaktır; KVKK/GDPR aktarım ve rıza uygunluğu sadece metin yazarak sağlanmaz. Yayın öncesi bu noktalar hukuki/operasyonel olarak sonuçlandırılmalıdır.

## Mevcut metinde bulunan hatalar

1. Crashlytics hiç yoktu; çökme ve JavaScript hata raporları eklendi.
2. Satın almalar gelecekteki özellik gibi yazılmıştı; mevcut Google Play/RevenueCat sistemi, tüketilebilir paketler ve Firebase kimliği bağlantısı açıklandı.
3. “Bütün ilerleme yalnız cihazda kalır” çok genişti: kayıt yerel ama ilerleme olayları analitiğe gider; Android allowBackup=true. Yerel kayıt, analitik ve işletim sistemi yedeği ayrıldı.
4. “Bildirim için hiçbir veri gönderilmez” ifadesi düzeltildi: bildirim yerel, izin/açılma olayları analitik olabilir.
5. “En fazla 14 ay” doğrulanmamıştı; yeni etkinlikte süre yenileme ve toplulaştırılmış veri istisnaları nedeniyle kaldırıldı. Panelden kesinleşince net süre eklenmeli.
6. Reklam tercihleri bütün veri işlemesini kapatıyor gibi anlatılmadı. Kodda ayrı analitik/hata raporlama kapatma seçeneği yok.
7. Uygulama içi gizlilik politikası bağlantısı eksikti; ayarlara eklendi.
8. Eski monetizasyon belgesindeki veri tablosu Crashlytics'i içermiyor; “fazla beyan sorun değil” doğru bir yaklaşım değil. Aşağıdaki tablo ve gerçek yapılandırma esas alınmalı.

## Play Console'da nerede?

Önce uygulamayı seç. Menü çevirileri/hiyerarşisi hesaba göre değişebilir; ortak merkez **Politika ve programlar → Uygulama içeriği (Policy and programs → App content)**. Bazı görünümlerde “Politika → Uygulama içeriği”. Daha önce doldurulmuş kartlar “İşlem yapılanlar / Actioned” sekmesinde ve “Yönet / Manage” düğmesindedir.

| Konu | Ekran / yapılacak işlem |
| --- | --- |
| Gizlilik politikası | Uygulama içeriği → Gizlilik politikası → Yönet. URL: https://mathgamesstudio.com/privacy/prestige-life. URL açık, HTTPS, girişsiz ve HTML olmalı; sayfa TR bağlantısı sunmalı. |
| Veri güvenliği | Uygulama içeriği → Veri güvenliği / Data safety → Yönet. SDK'lar dahil aşağıdaki tabloyla doldur. |
| Reklamlar | Uygulama içeriği → Reklamlar / Ads → Evet. Reklamların isteğe bağlı olması veya Rahat Paket bulunması “hayır” demek değildir. |
| Uygulama erişimi | Uygulama içeriği → Uygulama erişimi / App access. Kullanıcı hesabı ve giriş yok; normal oynanış erişilebilir. Satın alma/reklam ve ilerleme koşullarını istenen not alanında dürüstçe açıkla; kilitli içerik için yokmuş gibi sınırsız erişim deme. |
| Hedef kitle | Uygulama içeriği → Hedef kitle ve içerik. Gerçekte hedeflenen 13–15, 16–17 ve 18+ gruplarını doğrula. “13+” ile içerik derecelendirmesi aynı şey değil. Yaş bilgisi için oyun karakterinin 17 yaşını kullanma. |
| İçerik derecelendirmesi | Uygulama içeriği → İçerik derecelendirmeleri / Content ratings. IARC anketini oyunun gerçek içeriğine göre tamamla. Para kazanma ihtimali olan oyun içi seçimleri, rastgele satın alınan içerik sorularını ve reklamları soru metnine göre değerlendir; otomatik olarak PEGI 3/Everyone tahmin etme. |
| Reklam kimliği | Uygulama içeriği → Reklam kimliği / Advertising ID. Birleştirilmiş release manifestinde AD_ID var; AdMob ve Analytics kullanıyor. Evet; mevcut amaçlar reklam/pazarlama ve analiz, SDK belgesine göre dolandırıcılık önleme de değerlendirilmeli. |
| Veri silme bağlantısı | Veri güvenliği → Veri silme soruları. Uygulama içinde hesap oluşturma yok. İsteğe bağlı veri silme başvurusu için sayfa yayınlanıp süreç işletilebilir olduktan sonra URL ver. |
| Mağaza iletişim bilgileri | Kullanıcıları artır → Mağaza varlığı → Mağaza ayarları / Grow users → Store presence → Store settings → İletişim bilgileri. E-posta mathgamesstudio@gmail.com; web sitesi https://mathgamesstudio.com. |
| Kullanım şartları | Standart oyun mağaza kaydında gizlilik URL'sine eşdeğer zorunlu ayrı bir “şartlar URL'si” alanı yok. Kendi sitende ve oyun ayarlarında sun. Gizlilik URL'sinin yerine şartlar koyma. |
| Diğer beyanlar | Uygulama içeriği → Dikkat gerektirenler / Needs attention. Haber, sağlık, finansal özellikler ve izin kartları varsa gerçek işleve göre yanıtla. Oyundaki sanal yatırım gerçek bankacılık, kredi veya gerçek para yatırımı değildir. |
| Satın almalar / iadeler | Ürünler: Para kazanma → Ürünler → Tek seferlik ürünler / One-time products (bazı arayüzlerde In-app products). Siparişler: Sipariş yönetimi / Order management. Ürün türü, yerel fiyat ve paket teslimini kontrol et. |

Kaydettikten sonra **Yayınlama özeti / Publishing overview** ekranında bekleyen değişiklikleri ve incelemeye gönderim durumunu kontrol et. Kaydetmek her zaman canlı yayın anlamına gelmez.

## Veri güvenliği çalışma tablosu

Bu tablo mevcut kod + SDK belgeleri üzerinden başlangıçtır; panel entegrasyonları ve kullanılan tüm yayın sürümleriyle son kontrol gerekir. İç/dış test ve yayındaki v1 varyantları hâlâ dağıtılıyorsa onların veri akışlarını da ayrıca değerlendir. Yalnız v2'yi incelemek tüm paket beyanını otomatik doğrulamaz.

| Veri türü | Toplama | Paylaşma | Amaç / açıklama |
| --- | --- | --- | --- |
| Yaklaşık konum | Evet | AdMob için evet | IP'den; reklam/pazarlama, analiz, dolandırıcılığı önleme/güvenlik. GPS izni olmasa da bildirilir. |
| Satın alma geçmişi | Evet | Hizmet sağlayıcı istisnası uygulanırsa hayır; harici entegrasyonları doğrula | RevenueCat ve Analytics; uygulama işlevselliği, analiz; uygulandığı ölçüde işlem güvenliği. |
| Uygulama etkileşimleri | Evet | AdMob için evet | Oyun olayları, ekranlar, reklam etkileşimleri; analiz, reklam, dolandırıcılık önleme. |
| Kilitlenme günlükleri / Crash logs | Evet | AdMob'un da bu veriyi paylaşımı varsa evet; yalnız Crashlytics hizmet sağlayıcısı aktarımını otomatik paylaşım sayma | Crashlytics ve AdMob teşhisleri; analiz, ilgili SDK amaçları. |
| Teşhis / Diagnostics | Evet | AdMob için evet | Teknik performans ve reklam hataları; analiz ve reklam/güvenlik amaçları SDK rehberine göre. |
| Cihaz veya diğer kimlikler | Evet | AdMob için evet | Reklam kimliği, Analytics/Crashlytics kurulum kimlikleri; reklam, analiz, güvenlik; işlevsellik gereken işlemlerde. |
| Kullanıcı kimlikleri / User IDs | RevenueCat App User ID için ayrıca değerlendir | Hizmet sağlayıcı istisnasına ve entegrasyonlara bağlı | Takma müşteri kimliği satın alma profilini tanımlar. “Hesap yok” kişiyi ayırt eden kimlik yok demek değildir. RevenueCat rehberi varsayılan zorunlu türü satın alma geçmişi olarak listeler; form tanımı ve gerçek kullanım esas alınmalı. |

- “Veri topluyor/paylaşıyor mu?” → **Evet**.
- Aktarımda şifreleme → incelenen SDK'lar HTTPS kullanır; ek uç nokta/mediation yokluğu doğrulanınca **Evet**.
- Analytics/Crashlytics için oyun içi kapatma yok: ilgili verileri **zorunlu**, **geçici işlem değil** olarak değerlendir. RevenueCat kendi rehberinde satın alma geçmişini zorunlu ve geçici değil olarak belirtir. Reklam izleme seçimi tek başına bütün AdMob veri işlemesini isteğe bağlı yapmaz. Tür bazında kullanıcı gerçekten tüm toplamayı durdurabiliyorsa isteğe bağlı işaretlenebilir; herhangi bir dağıtılan varyantta zorunluysa genel beyan isteğe bağlı olmamalı.
- GPS, kişiler, kamera, mikrofon, fotoğraf ve sağlık verisi toplanmasına dair bulgu yok. Karakter adları analitik parametrelerine gönderilmiyor. E-posta desteği ayrı iş akışıdır; politikada açıklandı. Harici e-posta desteğini otomatik olarak oyun SDK'sının “mesajlar” kategorisine ekleme; form kapsamına göre değerlendir.
- Hizmet sağlayıcıya aktarma her zaman formdaki “paylaşım” değildir; istisna şartlarına bak. AdMob kendisi otomatik “toplar ve paylaşır” der. Tüm Google servislerini tek şekilde sınıflandırma.
- “Hesap açma” → mevcut v2 için **yok**. RevenueCat takma kimliği kullanıcı kayıt ekranı değildir. Bu nedenle hesap silme zorunluluğunu otomatik uygulama; veri silme talepleri yine ele alınmalıdır.
- “Silme talebi imkânı” → sayfa ve e-posta süreci gerçekten çalışır hale gelince **evet**. Sadece HTML dosyası üretmek yeterli değildir.

## Firebase'de kontrol edilecekler

1. Firebase → proje → Analytics → Dashboard → Google Analytics'te görüntüle. İlgili GA4 mülkünü seç.
2. GA4 → Yönetici / Admin → Veri toplama ve değiştirme / Data collection and modification → Veri saklama / Data retention. Olay ve kullanıcı saklama süresini not et (standart mülkte genellikle 2 veya 14 ay). “Yeni etkinlikte sıfırla / Reset on new activity” ayarını ayrıca not et. Amaç için yeterliyse veri minimizasyonu açısından 2 ay ve yenileme kapalı değerlendirilebilir; bu bir öneridir, mevcut ayar değildir. Politikadaki saklama bölümünü gerçek seçimle somutlaştır.
3. GA4 → Yönetici → Veri akışları ve reklam/Google sinyalleri/bağlı ürünler ayarlarını incele. Google Ads bağlantısı ve reklam kişiselleştirmesi varsa paylaşım/amaç beyanına dahil et.
4. Firebase Crashlytics: raporlar, mesajlar ve breadcrumb olaylarında gereksiz kişisel veri var mı kontrol et. Kaynak kod hata nesnelerini metin olarak gönderiyor; hassas içerik sonradan eklenirse filtreleme gerekir.
5. RevenueCat → Integrations → Firebase: entegrasyon etkin mi, gönderilen alanlar ve diğer entegrasyonlar neler? Kod Firebase app-instance ID'yi RevenueCat'e veriyor; politikada bu açıklandı.
6. **Analytics rızası (bağlandı, 2026-10-22):** AndroidManifest'te dört rıza (analytics_storage, ad_storage, ad_user_data, ad_personalization) varsayılan olarak reddedilmiş başlar. Rıza kuralı olan bölgelerde UMP (Android 4.0.0) oyuncunun seçimlerini Firebase'e kendisi aktarır; UMP "gerekmez" derse oyun dördünü verir (`runtime/ads.ts` → `grantAnalyticsConsent`). Bunun çalışması için **AdMob → Gizlilik ve mesajlaşma → (Avrupa düzenlemeleri) ayarlarında Google Analytics for Firebase için "rıza modu" açılmalı**. AEA test coğrafyasıyla ret / kabul / Gizlilik seçeneklerinden değiştirme senaryoları telefonda denenmeli (Firebase DebugView'da `analytics_storage` durumu). iOS'ta eklenti UMP 3.1 kullanıyor; iOS yayınından önce ayrıca bakılmalı.

## AdMob'da kontrol edilecekler

1. AdMob → Gizlilik ve mesajlaşma / Privacy & messaging → Avrupa düzenlemeleri / European regulations. İlgili uygulamanın mesajını oluştur/yönet; doğru gizlilik URL'sini ekle ve mesajın yayımlandığını doğrula.
2. Kullanılan bölgeler, reklam ortakları ve ABD eyaletleri mesajları dahil uygulanabilir seçenekleri kontrol et. Mediation ortağı varsa o SDK'nın veri rehberini de beyana ekle.
3. Gerçek test cihazında Avrupa test coğrafyasıyla ilk açılış, ret, kabul ve Ayarlar → Gizlilik seçenekleri üzerinden yeniden seçim senaryolarını test et. Test coğrafyasını yayın derlemesinde açık bırakma.
4. Hedef kitle 13+ olduğu için 13–15 yaş grubunu göz ardı etme. Bölgeye göre rıza yaşı, genç kullanıcılara reklam kişiselleştirmesi ve under-age-of-consent ayarları değerlendirilmelidir. Oyunda yaş ekranı olmadığı görüldü; karakterin yaşı kullanıcının yaşı değildir. Sırf marka hedefi 13+ diye herkes yetişkin kabul edilemez.
5. UMP kodu var ama bu panelde mesajın yayında olduğunu kanıtlamaz. Aynı şekilde oyun içi “gizlilik seçenekleri” düğmesinin koşullu görünmesi normal olabilir; **gizlilik politikası bağlantısı** ise her zaman erişilebilir olmalı.
6. app-ads.txt: AdMob → Uygulamalar → app-ads.txt bölümünden kendi satırını al; https://mathgamesstudio.com/app-ads.txt adresini ve Play'deki geliştirici web sitesi alanını kontrol et. Yayıncı kimliği tahmin edilmemeli. Bu dosya gizlilik politikası değildir.

## Veri silme talebini gerçekten işletme

1. Talebi destek e-postasında kaydet; asgari kimlik doğrulaması yap. Şifre/kart/kimlik fotoğrafı isteme.
2. RevenueCat → Customers → oyuncu kimliğini ara. Yetkili silme işlemini veri talebi kapsamıyla değerlendir; işlem iade veya Google Play muhasebe kaydının silinmesi değildir. Hukuken tutulacak kayıtlar varsa gerekçesini bildir.
3. Firebase Analytics kayıtlarını bulmak için RevenueCat kimliğinin yeterli olmadığını unutma. İzin verilen entegrasyon alanında app-instance ID mevcut mu kontrol et; gerekiyorsa Google Analytics User Deletion API ve sağlayıcı sürecini kullan. Silme talebi aracının izin/kimlik ve kapsamını doğrula, tüm verilerin silindiğini varsayma.
4. Crashlytics ve reklam sağlayıcılarının ayrı süreçleri/saklama süreleri var. Bulunamayan kayıtları ve bağımsız sağlayıcıların kayıtlarını açıklayarak yanıtla.
5. Yerel kayıt kullanıcı tarafından temizlenir; uzaktan telefondaki dosyayı silemezsin. OS yedekleri ayrı yönetilir. İlerleme kaybını açıkla.
6. Talebi uygulanabilir sürede sonuçlandır; KVKK için 30 gün. GDPR kapsamında genel süre bir aydır; uzatma koşulları farklıdır. İşlem kanıtı ve gerektiği kadar sınırlı destek kaydı tut.

## Önerilen web adresleri

Mevcut adresleri koru:
- EN gizlilik: https://mathgamesstudio.com/privacy/prestige-life
- TR gizlilik: https://mathgamesstudio.com/tr/privacy/prestige-life

Yeni sayfalar için öneri (henüz yayımlanmadı):
- EN şartlar: https://mathgamesstudio.com/terms/prestige-life
- TR şartlar: https://mathgamesstudio.com/tr/terms/prestige-life
- EN veri talepleri: https://mathgamesstudio.com/data-deletion/prestige-life
- TR veri talepleri: https://mathgamesstudio.com/tr/data-deletion/prestige-life

Metinleri sitenin mevcut Astro içerik yapısına aktar; EN/TR geçişi ve footer bağlantıları ekle. 200 HTTP, girişsiz erişim, mobil okunabilirlik, gerçek iletişim adresi ve yönlendirmeler kontrol edilmeli. Sayfa bir PDF veya kullanıcıların düzenleyebildiği belge olmamalı. Yayın tarihi değişirse metindeki tarih de güncellenmeli. Website Cloudflare beacon içeriyor; genel site gizlilik metninin bunu ve barındırma kayıtlarını kapsadığını ayrıca kontrol et.

## Kaynaklar

- Play inceleme ve menü yolları: https://support.google.com/googleplay/android-developer/answer/9859455?hl=en
- Veri güvenliği: https://support.google.com/googleplay/android-developer/answer/10787469?hl=en
- Hesap silme kapsamı: https://support.google.com/googleplay/android-developer/answer/13327111?hl=en
- Hedef kitle: https://support.google.com/googleplay/android-developer/answer/9867159?hl=en
- Reklam kimliği: https://support.google.com/googleplay/android-developer/answer/6048248?hl=en
- AdMob SDK beyanı: https://developers.google.com/admob/android/privacy/play-data-disclosure
- Firebase SDK beyanı: https://firebase.google.com/docs/android/play-data-disclosure
- Analytics SDK beyanı: https://support.google.com/analytics/answer/11582702?hl=en
- Analytics saklama: https://support.google.com/analytics/answer/7667196?hl=en
- Firebase saklama: https://firebase.google.com/support/privacy
- RevenueCat beyanı: https://www.revenuecat.com/docs/platform-resources/google-platform-resources/google-plays-data-safety
- KVKK aydınlatma: https://www.kvkk.gov.tr/Icerik/8151/-Arabuluculuk-Faaliyetleri-Kapsaminda-Aydinlatma-Yukumlulugunun-Yerine-Getirilmesine-Iliskin-Kamuoyu-Duyurusu-

Kod dayanakları: src/game/runtime/{analytics,crashReports,ads,iap,storage,notifications}.ts; src/game/ui/home/SettingsSheet.tsx; src/game/ui/story/StoryDirector.tsx; android/app/src/main/AndroidManifest.xml ve mevcut release merged manifest. Kaynak değişiklikleri, yeni SDK'lar veya panel entegrasyonları bu beyanı tekrar kontrol etmeyi gerektirir.
