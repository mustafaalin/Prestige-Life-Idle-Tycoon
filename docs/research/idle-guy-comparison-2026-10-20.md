# Idle Guy incelemesi: Prestige Life'a aktarılabilecek tasarım

20 Ekim 2026. Öneri belgesidir; mevcut oyun kararlarını değiştirmez. Kod değiştirilmedi.

## İncelemenin kapsamı ve kanıt

Proje kökündeki `idle-guy-life-sim oyun ekran görüntüleri` klasöründeki 56 JPEG'in tamamı karşılaştırmalı sayfalarda incelendi. Editör gereksinimleri ve görev bölümü ayrıca tam boyutta okundu. Görseller farklı oyun içi tarih ve durumlar içeriyor; dosya sırası oynama sırası veya geçen gerçek süre kabul edilmedi.

Google Play sayfasının üst kısmında inceleme sırasında 4,5 yıldız, 435 bin değerlendirme ve 10M+ indirme görünüyor. Alt değerlendirme bölümünde 425 bin gösterildiği için sayfanın kendi sayaçları da birebir aynı değil. Bunlar erişimin kanıtıdır; belli bir mekaniğin tutmayı artırdığının kanıtı değildir. Güncelleme tarihi 13 Ekim 2026; sürüm notlarında ilk deneyim, aktif beceriler, görev kademeleri ve ekonomi değişiklikleri var. Eski rehberler mevcut sürümle karıştırılmamalı. [Google Play](https://play.google.com/store/apps/details?id=com.heatherglade.idleguy)

Kullanıcının “daha yavaş zenginleşiyorum ve genelde yapacak şey var” gözlemi doğrudan oyun deneyimidir. Görseller bu hissin olası mekanizmalarını gösteriyor; tam ekonomi formülü, gerçek dakika/oyun ayı oranı, bütün açılma koşulları ve çevrimdışı kurallar bu görsellerden çıkarılamaz.

İncelemede `design:design-critique` skill'i kullanıldı. Aşağıdaki mekanik çıkarımların ana kaynağı kullanıcının görselleridir.

## 1. Ana sonuç: farklı ilerleme eksenleri birbirine iş üretiyor

Prestige Life'ta birçok yolun ortak çözümü daha fazla para kazanmak. Idle Guy görsellerinde bir üst iş için para dışında beceri, önceki işte ustalık ve yaşam koşulları gerekiyor. Bu eksiklerden biri tamamlanırken başka bir hedefte ilerlenebiliyor.

Dolayısıyla aktarılacak temel yaklaşım:

**Bir hedef seç → eksikleri gör → birkaç farklı hazırlık yap → yeni imkân aç → gelir ve yaşam değişsin.**

Kısa iş sistemi hâlâ yararlı; ancak kendi başına para üreten tekrar olursa uzun vadeli sorunu çözmez. İşler bu hazırlık zincirlerinin parçaları olmalı.

## 2. Görsellerde doğrudan görülenler

Aşağıdaki dosyalar ortak `WhatsApp Image 2026-10-20 at ` önekiyle, belirtilen klasördedir.

| Kanıt dosyası | Gözlem | Tasarım işlevi |
|---|---|---|
| `17.54.41 (1).jpeg` | Editor işi: Luck 3, Happiness 60, Housing ≥5, Food ≥4, Transport ≥4, Office manager %100 ustalık, Strength 12. Eksik Luck koşulunda Go var. | Uzak hedefi yapılabilir alt hedeflere ayırıyor. |
| `17.54.42.jpeg` | İşler seviyeli bir yol üzerinde; gelecek işlerde soru işaretleri, bazı eski işlerde Return, tamamlanan işte Done var. | Geçmiş başarı ve ileride keşfedilecek içerik birlikte görünür. Dalların tüm davranışı görselden kesinleşmez. |
| `17.54.45 (1).jpeg` | Görev bölümü 11/14; bitince mini oyun açılacağı yazıyor. Luck, gece hayatı, iş seviyesi, işletme ve karizma görevleri aynı bölümde. | Görevler farklı sistemleri ortak hedefe bağlıyor; ödül yalnız nakit değil, yeni içerik. |
| `17.54.38.jpeg`, `17.54.41.jpeg` | Farklı süreli beceri eğitimleri, başlat/durdur kontrolleri, kapasite simgeleri ve aylık bedeller. | Sınırlı paralel hazırlık ve farklı zamanlarda tamamlanan işler. Eğitimlerin çevrimdışı davranışı doğrulanmadı. |
| `17.54.44 (1).jpeg`, `(7).jpeg`, `(8).jpeg` | Koşu, oyun, spor salonu, gece hayatı; ilerleme çubukları, yıldızlar, para gideri ve sağlık/mutluluk etkileri. Spor salonu yükseltmesinde önce/sonra değerleri var. | Satın alma dışında tekrar ilerlemesi ve kaynak dağıtımı. |
| `17.54.43 (7).jpeg`, `17.54.46 (9).jpeg` | Koşu sonrası olumlu etki, spor sonrası kas ağrısı olayı. | Etkinlikler zaman zaman küçük sonuçlar üretiyor; ekranlar birbirinden bağımsız katalog değil. |
| `17.54.37 (1).jpeg`, `(2).jpeg` | Konut ve araçta alış bedeli yanında sürekli gider; sağlık/mutluluk etkileri. Araçlarda farklı etkiler var. | “Daha pahalı her zaman her açıdan daha iyi” olmayan seçimler. |
| `17.54.43 (4).jpeg` | Maaş, işletme, kira, hisse geliri ile yemek, konut, araç giderleri aynı dökümde. | Oyuncu net gelirinin neden değiştiğini görebiliyor. |
| `17.54.45 (2).jpeg`, `(3).jpeg`, `(5).jpeg` | 3 dakikalık ve 1 günlük yatırımlar; aynı ekranda farklı vadeler. | Aynı ekonomik alanda oturumluk ve ertesi gün dönülecek hedef. |
| `17.54.46 (5).jpeg`, `(4).jpeg`, `(3).jpeg`, `17.54.46.jpeg` | Aynı mülkte yıldızlı yükseltmeler; ek kira ve yükseltme bedeli birlikte yazıyor. | Yeni ev alamıyorken mevcut varlıkta yakın geliştirme fırsatı. |
| `17.54.47 (3).jpeg`, `17.54.47.jpeg` | Hisse portföyü, şirketler, alım miktarı ve ücret. | Geç oyunda sermayeyi farklı yerlere ayırma alanı. Gerçek fiyat algoritması bilinmiyor. |
| `17.54.37 (3).jpeg`, `17.54.43 (6).jpeg` | İlişki durumları ve ana sahnede ikinci karakter. | Hayatın ekonomik olmayan tarafı görünür. |

## 3. Neden yavaş ilerlerken de dolu hissedebilir?

### Farklı büyüklükte başarılar

Bir iş değişimi uzun sürerken eğitim seviyesi, hobi yıldızı, yatırımı toplama ve görev maddesi daha önce tamamlanabilir. Büyük hedefin zamanı ile küçük başarıların zamanı aynı değil.

### Yavaşlığın açıklaması var

“Daha fazla para bekle” yerine “Şu beceri eksik; buradan geliştirebilirsin” deniyor. Koşulun yanında doğrudan yönlendirme olması önemlidir. Menü sayısı arttığında aradığını bulma maliyetini azaltır.

### Görevler bir sonraki oyuncağı gösteriyor

11/14 yalnız bir yüzde değil, mini oyunların açılmasına kalan yol. Tamamlamak yeni bir oynama biçimi vaat ediyor.

### Aynı para birçok aday arasında paylaşılıyor

Terfi hazırlığı, araç, hobi, mülk geliştirme ve yatırım birbirleriyle rekabet ediyor. Bu seçeneklerden biri sürekli en iyi değilse planlama doğar.

### Bazı hareketlilik bakım ihtiyacından geliyor

Mutluluk düşüşü, sağlık etkileri ve giderler de yapılacak iş yaratıyor. Bu bölümün eğlenceli strateji mi yoksa zorunlu bakım mı olduğu oyuncuya göre değişebilir. Kullanıcının keyif aldığı bütün etkileşimleri “angarya” diye reddetmek doğru olmaz; fakat aynı baskıyı bizim oyuna taşımadan karşılaştırmalı test gerekir.

## 4. Bizim oyunda ne var, ne eksik?

| Prestige Life'taki mevcut yapı | Eksik veya geliştirilebilir taraf |
|---|---|
| 12 kariyer; `promote()` sıradaki işi yalnız para harcayarak verir | Mesleğe özgü hazırlık, ustalık veya beceri yok. Terfi çoğu aşamada ekonomik yükseltme gibi çalışıyor. |
| Ev → araç → sonraki ev bağımlılığı zaten var | Yeni bağımlılık fikri sıfırdan gelmiyor. Bağın oyuncuya açıklanması ve hayatla ilişkisi güçlendirilebilir. |
| İşletmeler sınıfla açılır, adet sınırları sınıfla büyür | Yeni koşullar eklenirse mevcut sınıf kilidine ikinci bekleme duvarı eklenebilir. |
| 25 yazılı görev; ardından işletme kilometre taşları | Orta/geç oyunu kapsayan farklı fiilli bölüm zinciri eksik. |
| Konut alımı ve kiraya verme | Aynı mülkü birkaç anlamlı aşamada iyileştirme alanı yok. Bu isteğe bağlı orta vadeli bir aday. |
| Törenler ve aile hikâyesi | Büyük anların arasında oyuncunun hazırladığı küçük sonuçlar az. |
| Yatırım vadeleri 1/4/8 saat | Kısa oturum ihtiyacını işler karşılayabilir; ayrıca kısa vadeli banka ürünü eklemek başlangıçta gereksiz. |
| Sınıf nesil kazancından hesaplanır | İşletme gelirinin artması sınıfı ve birçok yaşam değişimini birlikte hızlandırır. |

Kod dayanakları: `src/game/core/config/careers.ts`, `quests.ts`, `businesses.ts`, `housing.ts`; `src/game/core/state.ts` içindeki `promote`, `lifestyleLocked`, `moveUpNeedsVehicle`, `activeQuests`, `earn`.

## 5. İlk aktarım: kariyere bağlı hazırlık ve bölüm hedefleri

Yeni on istatistik yerine pilotta tek bir yetkinlik hattı: **müşteri ilişkileri**. Kalıcı seviye veya birkaç tanımlı yeterlilik olarak tutulabilir; yeni harcanabilir para birimi gerektirmez.

Kariyer ekranında “Sıradaki terfi” kartı:

- Önceki iş deneyimi: tamamlandı / ilerleme.
- İlgili hazırlık: örneğin müşteri ilişkileri eğitimi.
- Bir uygulama: özel müşteri işini tamamla.
- Gerekiyorsa sabit başvuru/ekipman bedeli.
- Her eksikte doğru ekrana götüren “Git”.

İlk iki işin hızlı başlangıcı korunmalı. Yeni koşulları bütün kariyerlere birden koymak yerine Satış Temsilcisi gibi tek bir geçişte denemek daha güvenli.

### Örnek pilot akış — tasarım önerisi

“İlk düzenli müşterim” bölümü:

1. Selin kısa bir müşteri işi teklif eder; ücretsiz başlayabilir.
2. İlk iş müşteri ihtiyacını tanıtır.
3. Kısa eğitim veya iki farklı uygulama yoluyla hazırlık tamamlanır. Alternatifler eşit olmak zorunda değil; biri daha kısa, diğeri başka fayda sağlar.
4. İkinci işte hızlı nakit ile müşteri bağlılığı arasında seçim yapılır.
5. Düzenli müşteri anlaşması açılır: önceki sıradan işlerden farklı bir teklif.
6. Aynı yeterlilik uygun kariyer geçişinde de kullanılır.

Sayılar prototipte belirlenecek. Amaç üç kez aynı düğmeye basmak değil, bir kez kazanılan yetkinliğin en az iki sistemde işe yaraması.

## 6. Önerilen bağımlılık kuralları

1. **Koşul mantıklı olmalı.** Teslimat işi için uygun araç, şirket anlaşması için tamamlanmış sipariş anlamlıdır. Editörlük için şans puanını veya ofis işi için lüks arabayı aynen kopyalamak gereksizdir.
2. **Başlangıçta 2–3 koşul yeterli.** Bir tanesi zaten yapılmış olsun; oyuncu sürekli yedi ayrı eksiğe bakmasın.
3. **Her koşulun eylemi olmalı.** “Sınıf atlamayı bekle” çoğu zaman tek başına uğraş yaratmaz.
4. **Kilit açmak, aynı kilidin arkasındaki kaynağı gerektirmemeli.** Grafik döngüsüz olmalı; mevcut ev/araç ve sınıf sınırlarıyla birlikte kontrol edilmeli.
5. **Ücretsiz veya düşük maliyetli bir yol kalmalı.** Tüm nakit harcansa bile hazırlık yapılabilmeli.
6. **Kilitler üst üste yığılmamalı.** Sınıf eşiği + adet sınırı + uzun eğitim + büyük ücret aynı geçişte uygulanmamalı. Yeni şart bazı eski beklemelerin yerini almalı.
7. **Hazırlık boşa gitmemeli.** Eğitim ya da müşteri ilişkisi bir sonraki işte de değer taşımalı.
8. **İleri kayıtlar korunmalı.** Alınmış meslek ve içerik yeniden kilitlenmez; yeni gereksinimler geriye dönük borç çıkarmaz.
9. **Nesiller aynı eğitimi aynı hızda tekrar etmemeli.** Kazanılmış aile bilgisi tekrarları kısaltabilir; etkisi ayrıca dengelenir.

## 7. Görev bölümleri nasıl dönüştürülebilir?

Önerilen bölüm isimleri ve içerikleri karar değildir:

| Bölüm | Karışık fiiller | Bölümün somut ödülü |
|---|---|---|
| İlk düzenim | İlk iş, oda hazırlığı, ulaşım | Yeni iş fırsatları |
| Mahalle beni tanıyor | Müşteri işi, yönetici, ilk düzenli anlaşma | Yeni teklif türü |
| Kendi işimin patronuyum | İşletme geliştirme, ekip hazırlığı, müşteri seçimi | Özel işletme anlaşması |
| Rıza'nın hayali | Atölye hazırlığı, ekipman, ilk sipariş | Mevcut atölye törenine hazırlanmış sonuç |
| Anneme verdiğim söz | Konak hazırlığı, aile seçimi, teslim | Mevcut son törenin kişiselleştirilmiş sonucu |

Başlangıçta bölüm başına 4–6 ana adım düşünülebilir. Bir veya iki adım isteğe bağlı olabilir; 14 zorunlu görevi aynen almak gerekmiyor. Yeni içerik, ekonomi eğrisini patlatmayan bir ödül olabilir.

Sınıflar hâlâ kazanılan paradan gelsin; ilk pilotta törenler görev listesine kilitlenmesin. Bölüm ilerlemesi ayrı bir yönlendirme ve hazırlık katmanı olarak test edilsin.

## 8. Daha yavaş zenginleşmeyi nasıl denemeli?

Kullanıcının daha uzun bir yükseliş istemesi tasarım hedefidir. Eski tempo testlerini geçtiği için mevcut hızı dokunulmaz kabul etmek yanlış olur. Buna karşılık doğrudan bütün fiyatları artırmak mevcut boşluğu büyütür.

Önerilen sıra:

1. Mevcut hızlı yol karşılaştırma olarak saklanır.
2. Bir iş/bölüm zinciri mevcut hızda denenir: içerik kendi başına ilginç mi?
3. Sonra aynı zincirle orta sınıf yaşamı ve küçük işletmecilik uzatılır.
4. Büyük sınıf geçişleri seyrekleşirken küçük tamamlanmaların sıklığı korunur.

Deneme hipotezi: ilk oturumda ilk gelir, ilk işletme, ilk otomasyon ve barınma zaferi; sonraki oturumlarda düzenli müşteri ve kendi düzenini kurma; milyonerlik birkaç oturuma yayılan doruk. “Kaçıncı gün milyoner?” için henüz doğrulanmış yeni sayı yok; bir günlük oyuncuyla altı oturumluk oyuncu aynı takvim hedefine zorlanmamalı.

Ölçüm sadece nakit olamaz: bizim sınıflar nesil kazancına bağlı, görsellerdeki Idle Guy bakiyesi ise eldeki nakit. İki oyunun ekranındaki “1M”yi doğrudan hız kıyası yapmak yanlış olur. Milyonerlik için nakit, kazanılmış toplam ve sahip olunan mallar ayrılmalı.

Yaş da yeniden simüle edilmeli: aynı para merdivenini uzatmak kahramanın hikâye anlarına hangi sınıfta geldiğini, 80 yaşa kadar sonuca ulaşıp ulaşmadığını değiştirir. Erken devir ve sonraki nesiller de kapsanmalı.

## 9. Daha fazla ekran gerekli mi?

İçerik varsa yeni ekran yararlı olabilir. Pilot için:

- **Kariyer → Gelişim:** ilgili yeterlilikler ve terfi koşulları.
- **Hedefler → Hayat yolum:** bölüm, tamamlananlar ve açılacak şey.
- **İşletmeler → İşler:** tek aktif teklif ve sonucunun beklediği yer.

Ana ekranda seçili hedef, hazır iş ve bir sonraki hayat hedefi yeterli. Mevcut alt menüyü hemen büyütmek gerekmez. Üst bar ve geri dönüş yolu tutarlı kalmalı; eksik koşula “Git”, tamamlayınca hedefe dönüş sunulmalı.

Rakibin yoğun kırmızı noktaları ve büyük mağaza kartları birebir taşınmamalı. Yeni ekranın gerekçesi “rakipte var” değil, ayrı bir oyuncu kararını desteklemesidir. Ayarlar ve kataloglar eylem sayısını artırmış sayılmaz.

## 10. Al / dönüştür / sonraya bırak

| Yaklaşım | Karar önerisi |
|---|---|
| Eksik koşullar + doğrudan Git | İlk prototipe al |
| Görev bölümü sonunda içerik açılması | İlk prototipe al |
| Ustalık / mesleki hazırlık | Tek kariyer geçişinde dene |
| Farklı uzunlukta ilerleme | Kısa işler + hazırlık + mevcut yatırımla kur |
| Aynı mülkü geliştirme | İkinci deney adayı; ayrı emlak sistemi açmadan mevcut evlerde dene |
| İlişkiler | Mevcut aile ve yöneticilerle sonuç bırakan olaylara dönüştür |
| Sağlık/mutluluk bakım döngüsü | Doğrudan taşıma; önce pozitif hazırlık/hobi faydasını test et |
| Büyük hisse borsası | Sonraya; mevcut yatırım ve işler varken kapsamı büyütür |
| Kumar mini oyunları | Bu oyunun aile/hayat temasındaki boşluğu çözmek için öncelik değil |
| Çok sayıda reklamla hızlandırma ve baskılı teklif | Boşluğu çözme aracı olarak kullanma |
| Günlük görevler | Yeni fiiller keyifli olduktan sonra; aynı işin zorunlu tekrarına dönüşmesin |

## 11. Önceki stratejiye önerilen değişiklik

Önceki planda “kısa işler” üçüncü adımdaydı. Yeni kanıtla bunu **kısa iş + kariyer hazırlığı + bölüm hedefi birlikte çalışan tek küçük prototip** olarak değiştirirdim.

İki ayrı sistemi tamamen kurmak gerekmiyor. Bir yeterlilik, bir terfi, üç iş şablonu ve bir bölüm yeterli olabilir. Bu prototip “para gelmesini bekleme”yi “hedefe hazırlanma”ya çeviriyor mu, önce onu görmeliyiz.

Burak/devir tutarlılığı ayrı yayın işi olarak yerini korur. İşletme sınıf sınırlarını bu aşamada kaldırma önerisi yok. Gelirler, fiyatlar ve tören zamanları bu raporla değiştirilmedi.

## 12. Başarı nasıl anlaşılır?

- Oyuncu “ne için uğraşıyorum, ne eksik, nereden tamamlarım?” sorularını yardım almadan cevaplar.
- En az iki ilerleme yolu vardır; aynı anda bütün yollar tek uzun saate veya aynı para açığına takılmaz.
- Önemli bir hedefin tamamlanması başka bir hedefte işe yarar.
- Aktif oyuncu sık sık gerçek sonuç alır; seyrek gelen oyuncu hazırlanmış sonuçlara döner.
- Hedef başına zorunlu menü geçişi, kilitli geçirilen süre, alternatif yapılabilir eylem ve seçilen yol ölçülür.
- Kısa işlerin tamamlanma sayısı tek başına başarı sayılmaz; bütün oyuncular aynı seçeneği düşünmeden seçiyorsa karar zayıftır.
- İlk oturumdan sonra oyuncu yalnız bakiyeyi değil, başardığı bir hayat değişimini anlatabilir.

Gözlemde sorulacaklar: “Bu işi neden seçtin?”, “Bir sonraki terfi için ne eksik?”, “Beklerken başka ne yapabilirsin?”, “Yeni ekran işini kolaylaştırdı mı, aradığını bulmak zorlaştı mı?”

## Görsel envanteri

56 dosyanın tamamı incelendi. Yeniden inceleme için tam ad listesi aynı araştırma klasöründe `idle-guy-screenshot-index-2026-10-20.txt` dosyasındadır. Yukarıdaki tablolar belirli iddiaların kanıt dosyalarını gösterir; görüntülerin tamamı aynı ağırlıkta kanıt sayılmamıştır.
