# Mağaza tasarımı — Claude için uygulama teslimi

Tarih: 2026-10-14 · Tasarım: GPT · Üretim: yerleşik ImageGen.

## Teslim ve kapsam

Kullanıcı mağaza tasarımını GPT'ye bıraktı. Bu teslim, §10'daki ilk üretim fikrini daha küçük ve kontrollü bir tasarıma dönüştürür. Oyun kodu, ekonomi, fiyat, ödeme entegrasyonu ve satın alma hakları bu turda değiştirilmedi.

**Önizleme:** [iap-store-design-preview.html](./iap-store-design-preview.html). Tek dosyalık yerel HTML prototipi; gerçek ödeme/kayıt yok. TR/EN, 320×640, 360×740, 390×844, 430×932; mağaza, teklif, sahiplik, teklif süresi bitmiş ve ana ekran düğmesi durumları seçilebilir. Satın alma düğmeleri yalnızca tasarım durumunu simüle eder.

**PNG maketleri:**

- [Mağaza](../art/pilot/15-iap/v2/store-mockup-1080.png)
- [Başlangıç teklifi](../art/pilot/15-iap/v2/offer-card-mockup-1080.png)
- [Satın alınmış durum](../art/pilot/15-iap/v2/store-owned-mockup-1080.png)

Üç maketin ImageGen kaynakları `*-mockup.png` (853×1844); `*-mockup-1080.png` teslim kopyaları 1080×2340. Yeniden boyutlandırma yaklaşık %0,3 oran farkı içerir, yalnız sunum içindir. Kaynaklar korunur. Her üretimin promptu aynı gövde adıyla `-prompt.txt` yanında bulunur.

**Öncelik sırası:** iş kuralları mevcut koddan; kapsam/metin/ölçü/durum bu handoff'tan; çalışır yerleşim örneği HTML'den; PNG yalnız estetik yön için. PNG'leri ekran arka planı veya üzerinde metin olan satın alma kartı olarak runtime'a koymayın.

PNG'deki örnek üst bar, yeşil para “+” düğmesi ve farklı alt menü simgeleri uygulama kapsamı **değildir**. Mevcut TopBar ve BottomNav korunur. Yeni ürün, yeni para birimi, indirim, tasarruf yüzdesi veya HUD işlevi yok. $1.99/$7.99 ve 2 gün 23 saat örnektir; gerçek yerel fiyat ve mevcut `offerSecondsLeft` kullanılır.

## Tasarım yönü

Başlangıç kartı sıcak, Şans odaklı ve somut üç ödüllü. Rahat Paket daha sakin lavanta; kalıcı reklamsızlık ana fayda, süreli hızlandırıcı ayrı bonus. Paylaşılmış kart anatomisi aynı: rozet → isim → fayda/görsel → içerik → fiyat veya aktif durum. Her kartın etrafı hareket ettirilmez; fiyat düğmeleri sabit ve okunur.

Yeni bileşenleri IAP alanında tutun. Genel `Panel`, bütün `GameButton` veya işletmelerin seçili A görünümünü bu tasarım için topluca değiştirmeyin.

## Nesne dosyaları

Seçili katmanlar `art/pilot/15-iap/v2/` altında:

| Dosya | Boyut | Kullanım |
| --- | --- | --- |
| `starter-dog.png` | 1024² | Kırmızı puantiyeli fularlı Şans; baş/göğüs, sabit ana görsel |
| `starter-cash.png` | 512² | Para ödülü ve küçük vitrin katmanı |
| `starter-coins.png` | 512² | Vitrinde küçük para ayrıntısı; ayrı ödül değil |
| `starter-hourglass.png` | 512² | Süreli ×2 ve Rahat Paket'in tek seferlik bonusu |
| `comfort-box.png` | 1024² | Kapaksız mor kutu gövdesi |
| `comfort-lid.png` | 1024² | Kapağı/fiyonk; küçük dikey hareket |
| `comfort-medal.png` | 512² | Yeşil-altın onay madalyonu |
| `store-button.png` | 512² | Soldaki mağaza düğmesinin 3D çanta simgesi |

Her dosya 8-bit RGBA (32 bit PNG), gerçek saydamlık içerir. `asset-validation.json` boyut, alpha aralığı, dolu silüet kutusu ve dosya ağırlığını kaydeder. Silüetler kadraja değmiyor. Padding her nesnede aynı değil; **tüm PNG'yi otomatik kırparak layer koordinatlarını bozmayın**. Özellikle dog üst/alt marjı yaklaşık %5; sabit contain kutusu ve hareket payı bırakılır. Çantanın kulp boşluğu saydamdır.

`*-source.png` yüksek çözünürlüklü özgün üretimlerdir. Runtime'a seçili PNG'lerden alpha korunarak WebP kopyası verilebilir; yazılı promptlar ve kaynaklar art altında kalır. Yeni dosyalar için örnek runtime adları: `public/assets/iap/v2/<dosya>.webp`. Eski `comfort.webp` ve `starter.webp` Play ürünleri/fallback için korunur.

Kart gradyanları, ışımalar ve parıltı CSS ile yapılır. `comfort-glow`, `starter-glow`, `sparkle` ve iki raster kart arka planı bilinçli olarak üretilmedi. Toplam: **8 seçili nesne + 3 maket**, 14 raster dosyalık ilk kapsam yerine. Animasyonlu WebP/video yok.

## Tokenlar

Bu isimler önerilen IAP-scoped CSS custom property'leridir; mevcut kodda tanımlı olduğu varsayılmamalı.

| Token | Değer | Rol |
| --- | --- | --- |
| `--iap-ink` | `#231951` | Başlık, fiyat düğmesi yazısı |
| `--iap-muted` | `#625B77` | Açıklama/koşul |
| `--iap-cream` | `#FFF9EC` | Ödül kutuları/aydınlık yüzey |
| `--iap-starter-top` | `#FFF9E8` | Başlangıç gradyanı |
| `--iap-starter-bottom` | `#FFE5CF` | Başlangıç gradyanı |
| `--iap-comfort-top` | `#FAF7FF` | Kalıcı kart |
| `--iap-comfort-bottom` | `#E8DFFA` | Kalıcı kart |
| `--iap-cta-top` | `#FFDB69` | Altın CTA |
| `--iap-cta-bottom` | `#F5B735` | Altın CTA |
| `--iap-active-bg` | `#E4F6E7` | Sahiplik şeridi |
| `--iap-active-text` | `#28623C` | Sahiplik yazısı |
| `--iap-space-card` | 14 px | Kart iç padding |
| `--iap-space-gap` | 12 px | Kartlar arası |
| `--iap-radius-card` | 23–24 px | Ürün kartı |
| `--iap-radius-tile` | 15 px | Ödül kutusu/düğme |

Başlık Fredoka 600; normal metin mevcut sans ailesi. Ürün adı 23 px/1.1; ana fayda 21 px/1.13; açıklama 11–12 px/1.4; ödül başlığı 12 px/1.2; CTA 16 px. Rozet 10–11 px uppercase; fiyat/yarar anlatımı uppercase uzun paragraf olmaz. Gövde yazılarını konturlama. Kenar 1 px; gölge hafif; CTA üst highlight + 3 px alt gölgeyle dokunulabilir.

## Yerleşim

Mevcut `StoreSheet` topbar ile menü arasındaki alanı kullanır. İç gövde dikey scroll, x-padding 12 px, gap 12 px. Mağaza başlığı 23 px; kapat düğmesi en az 44×44 px. En az ilk ürünün fiyatı rahat bulunmalı. İki kartı zorla tek ekrana sığdırmak için yazıyı küçültmeyin.

**Başlangıç kartı:** rozet + sağda süre; altında başlık; sonra fayda solda ve 148×158 px görsel alan sağda. Altında üç eşit ödül kutusu (minmax(0,1fr), gap 6 px), en altta 50 px minimum CTA. Şans ana nesne; banknot/para/kum saati alt kenarda yardımcı nesneler. Madeni para ayrı dördüncü ödül gibi etiketlenmez.

**Rahat Paket:** kalıcılık rozeti + başlık; fayda/görsel iki kolon. Kutu/kapak/madalyon tek bir `ComfortArt` içinde ayrı absolute layer. Bonus şeridi ve 50 px CTA aşağıda. Uzun fayda cümlesi ürün resminin üzerine taşmaz; metin kendi kolonunda wrap eder.

**Dar ekran (<340 px kart kapsayıcısı):** görsel kolon 125 px, başlık 21, fayda 19 px. Ödül kutularında satır kırılması serbest. CTA fiyatı ve çeviri uzunsa yükseklik büyür; fiyat ellipsis olmaz. Daha küçük container/uzun çeviride fayda/görseli dikey sıralamak güvenli fallback; tile label'larını 11 px altında küçültmeyin.

**Teklif modalı:** tam ekran mevcut %35 overlay; max-width 340 px, yan minimum 16 px, max-height safe-area içindeki ekran. Gerektiğinde içerisi scroll. 44 px kapat; 142 px Şans; üç tile; süre; “Paketi incele”; “Şimdi değil”. Kısa ekran/klavye/safe area nedeniyle CTA kaybolmamalı.

## Metin ve iş kuralları

TR/EN metinleri `iap` i18n alanına; prototipteki `T` tablosu copy örneğidir. Mevcut ürün kimlikleri ve `ProductKey` değişmez. Mağaza içi kısa ad “Başlangıç Paketi” / “Fresh Start Pack” kullanılabilir; Console ürününü yeniden adlandırmak gerekmez.

| Rol | TR | EN |
| --- | --- | --- |
| Teklif etiketi | Başlangıç teklifi | Welcome offer |
| Başlangıç faydası | İlk adımlarına güç kat. | Give your first steps a boost. |
| Kalıcı fayda | Ödüllerini reklam izlemeden al. | Claim rewards without watching ads. |
| Koşul | Mevcut kullanım sınırları geçerlidir. | Existing usage limits still apply. |
| Bonus | Bir defalık bonus: 2 saat ×2 gelir | One-time bonus: 2 hours of ×2 income |
| Satın alma | Paketi al · {price} | Get pack · {price} |
| Teklif detay CTA | Paketi incele | View pack |
| İkincil | Şimdi değil | Not now |
| Sahiplik | Aktif · Reklamsız ödüller açık | Active · Ad-free rewards enabled |

“Hoş geldin hediyesi” kaldırılır: bu ücretli paket. Fiyat varsa teklif subline'ında `Tek seferlik satın alma · {price}`; yerel fiyat henüz yüklenmediyse ücretli olduğu açıklanır ve uygulamanın mevcut fiyat politikasına uyulur. UI'da USD'yi sabit yazmayın. Yeni indirim veya ilk fiyat çizgisi eklemeyin.

Başlangıç parası `applyPurchase`'ta `autoIncomePerSecond(state.game) × product.incomeSeconds` ile, satın alma anındaki game state üzerinden hesaplanıyor. Yeni alınan booster bu tek seferlik ödüle UI tarafından ayrıca çarpılmamalı. Bu tur bir para tahmini eklemiyor: “1 saatlik gelir” doğru ve sade. İleride miktar gösterilecekse ödeme ile aynı fonksiyondan türetin.

Rozetteki “Tek seferlik” ödüllerin bir kez verildiğini anlatır; kırmızı fular kalıcı kozmetiktir. İstenirse fular tile alt etiketi “Kalıcı fular” olabilir. Rahat Paket reklamsızlığı bütün günlük sınırları aynen korur. Kalıcı ×2 vaat edilmez.

## Bileşen ve durumlar

Önerilen yapı: `ProductCard` (starter/comfort/owned), `RewardTile`, `StarterArt`, `ComfortArt`, `PurchaseReceipt`. Ürün listesi hâlâ `storeProducts` ve config üzerinden gelir. Rasterlar fonksiyonellik değil dekorasyon; anlam metinle verilir.

- **Varsayılan:** fiyat mağazadan, CTA açık.
- **İşleniyor:** basılan CTA'da “İşleniyor…”; eş zamanlı başka ödeme başlatılmaz. Ekranı full spinner'a çevirmeyin.
- **İptal:** kart normal durumuna döner; teşekkür veya başarı gösterilmez.
- **Hata:** kart/sayfa içinde kısa tekrar-deneme metni; satın alma başarılıymış görünmez.
- **Başlangıç başarı:** hak state'e uygulandıktan sonra kart kaldırılır; üstte kısa teslim özeti (4 saat, para, fular). Özette gerçek kazanılan miktar kullanılıyorsa işlem sonucundan alınır. Özeti kapatma 44 px; yalnız güncel satın alma, her açılışta tekrar değil.
- **Rahat Paket başarı:** kompakt aktif kart; fiyat yok, karartılıp okunmaz hâle getirilmez. 2 saatlik bonus her açılışta yeniden verilmiş veya tekrar alınabilir gibi gösterilmez.
- **İki paket sahip:** başlangıç satış kartı yok; rahat aktif; makette teslim özeti “Rahat zaten aktifken başlangıç yeni alındı” örneğini gösterir. Son satın alma Rahat ise kendi teslim özeti kullanılır.
- **Teklif bitmiş:** başlangıç kaldırılır; geri sayım negatif veya statik kalmaz. Comfort tek başına kalabilir; boşluk sahte ürünlerle doldurulmaz.
- **Geri yükleme:** mevcut store sonucuna göre done/none/failed; işlemden sonra yeni para verildiğini tasarım kendi kendine varsaymaz.

## Hareket

| Nesne | Davranış | Süre |
| --- | --- | --- |
| Kart açılışı | opacity 0→1, y 8→0; scale patlaması yok | 180–220 ms ease-out |
| Kutu kapağı | y 0→−3→0 px, rotasyon en fazla −1° | 3.6 sn ease-in-out |
| Başlangıç banknotu | y 0→−2→0 px | 3.2 sn ease-in-out |
| Şans | Sabit; baş/göğüs resmini döndürmeyin | — |
| CTA | Basılı state 2 px aşağı | 100 ms |
| Mağaza yeni teklifi | Bir kez kısa opacity/scale giriş; sürekli pulse yok | 180 ms |

Bir ürün kartında aynı anda tek nesne hareketi. Kapağın bulunduğu comfort kartında madalyon dönmez. Starter'da kum saati ters dönmez, para yığını yanıp sönmez. Glow sabit radial gradient; düşük kontrastlı ışın veya tek dekoratif yıldız kullanılabilir. Prototip hareketi varsayılan kapalı; açınca örnek gösterir. Runtime'da görünmeyen/scroll dışındaki animasyon durdurulmalı; `prefers-reduced-motion` hepsini kaldırır.

## Soldaki düğme

Mevcut 56×56 mor yuvarlak form ve sol yer korunur; içeride yeni çanta 44×44 contain. Albüm/listeden büyük yapmayın. Mevcut kırmızı noktayı “aktif teklif” diye korumak kolay; “Yeni” anlamı verilecekse teklif görüntülendiğinde sönmesi için ayrı görülme durumu gerektirir. Yeni kayıt alanı bu tasarımda uygulanmadı; bunu sırf görsel için kendiliğinden eklemeyin. Prototip satın alınmış/bitmiş durumda noktayı kaldırır.

## Erişilebilirlik ve uygulama kontrolü

Modal focus içeride; Escape/Android back mevcut davranışla kapatır, odak açan düğmeye döner. Decorative img alt boş; her reward metinde açıklanır. CTA adı ürün/fiyatı ifade eder. Gerçek işlem durumu `aria-live=polite`; başarı yalnız renkle anlatılmaz. Restore/dismiss dahil gerçek hit area en az 44×44. Koyu indigo metin açık yüzeylerde kullanılır; gradient en koyu yerde ölçülür.

320/360/390/430 px; kısa ve uzun ekran; TR/EN; uzun yerel fiyat; tek ürün; iki ürün; owned; expired; cancel/error/busy; modal safe-area; reduced-motion test edilmeli. PNG font boyutlarını ekran pikseli sanıp doğrudan Tailwind'e koymayın. Son görsel karar gerçek telefonda verilir.

## Bu turda yapılan QA ve sınırlar

- 8 nesne ve 3 maket tek tek açılıp görsel olarak incelendi.
- Nesnelerde gerçek alpha min 0/max 255, tamamen saydam piksel ve kadraja değmeyen silüet programla doğrulandı. Format/boyut/prompt eşleri doğrulandı.
- Önizleme JavaScript'i `node --check` ile kontrol edildi; gerekli görsel/font dosyaları kontrol edildi.
- Bilgisayar kullanımında Accessibility/Screen Recording izinleri tamamlanmadığından canlı tarayıcı ekranı alınamadı. HTML prototipinin gerçek render, etkileşim, mobil taşma ve layer örtüşmesi **doğrulanmış sayılmaz**. Telefon kontrolü de yapılmadı.
- Kutu gövdesi/kapak bağımsız üretimlerdir; perspektifler görsel olarak uyumlu, kusursuz mekanik kapanma garantisi yok. HTML'deki küçük hover-gap tasarımı tercih edilir; gerçek kapağı sıfır boşlukla kapatma zorunlu değil. Konumlar prototipte ayarlanmıştır, canlı render QA bekler.
- Oyun runtime'ı değiştirilmedi; typecheck/build çalıştırmak bu kaynak/maket tesliminin doğrulaması değildir. Claude entegrasyondan sonra projenin ilgili kontrollerini çalıştırır.
