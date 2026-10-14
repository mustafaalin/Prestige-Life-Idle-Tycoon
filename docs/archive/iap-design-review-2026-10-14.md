# IAP ekranı ve kart tasarımı değerlendirmesi

Tarih: 2026-10-14 · Durum: tasarım önerisi; kod değiştirilmedi.

İncelenenler: `StoreSheet.tsx`, `OfferCard.tsx`, ana ekran düğme yerleşimi, `kit.tsx`, `mobile.css`, işletme kartları, ürün tanımları, TR metinleri ve iki runtime IAP görseli. Bu oturumda canlı tarayıcı/telefon görüntüsü alınamadı; boyut ve hiyerarşi değerlendirmesi kod ile görseller üzerinden. Kesin ekran taşması, kontrast veya mobil kırpma sonucu iddia edilmiyor.

## Genel görüş

Temel düzen tutarlı: aynı yuvarlak köşeler, mor başlıklar, Fredoka, yumuşak 3D görseller ve belirgin fiyat düğmeleri oyunun kimliğini taşıyor. Başlangıç ve kalıcı ürün ayrımı, boş bölümlerin gizlenmesi ve satın alınanın sahiplik durumu iyi bir temel.

IAP'nin görsel sunumu henüz paketin özel değerini yeterince büyütmüyor. Ürünler genel beyaz `Panel` bileşenine yerleşiyor: küçük görsel, sağda başlık/maddeler, altta standart altın düğme. İlk ürünü özel yapan şey esas olarak biraz daha büyük görsel ve altın kenarlık. Paketlerin birbirinden ayrılan duygusu, ana faydası ve ödül sunumu güçlendirilebilir.

Benim yönüm: oyunun genel ekranları sakin ve okunabilir kalsın; IAP kartının ürün görseli, ana faydası ve satın alma düğmesi özel bir vurgu alsın. Her yüzeyi daha parlak yapmak yerine tek bir görsel odak kurulsun.

## 1. Kartın görsel hiyerarşisi

Mevcut başlangıç kartında görsel 112×112, Rahat Paket'te 80×80. Metin yanında 12 px maddeler, 10 px tür/süre satırı var. Yaklaşık 360 px ekran örneğinde dış boşluklar, iç padding, 112 px görsel ve aralık çıktıktan sonra metin sütunu yaklaşık 170 px veya daha az olabilir; gerçek ölçüm telefonda yapılmalı. Uzun ürün adı ve açıklamalar burada sık satır değiştirebilir.

**Başlangıç önerisi:** üstte kısa isim ve küçük teklif rozeti; ortada veya sağda 140–160 px Şans görseli; yanında en önemli fayda büyük; altta üç ödül kutusu; en altta fiyat düğmesi. 320 px genişlikte içerik tek sütuna geçebilir. Büyük görsel ile uzun madde listesini aynı dar yatay sıraya sıkıştırma.

**Rahat Paket önerisi:** aynı temel kart anatomisi, farklı renk ve ana fayda. Büyük başlık “Reklam izlemeden ödülleri al”; kalıcılık rozeti görünür. Kutunun görseli 110–130 px civarında kullanılabilir; 2 saatlik hızlandırıcı alt kısımda küçük bir bonus satırı olmalı. Kalıcı reklamsızlık ile süreli ×2 aynı ağırlıkta görünmemeli.

Bu boyutlar uygulama hedefleridir, ölçülmüş optimum değil. İki kartın ilk ekranda ne kadar göründüğü toplam kart boyundan daha önemlidir: tercihen başlangıç kartı tamamıyla, Rahat Paket'in de adı/ana faydası ilk görünümde yer alsın. Kısa telefonda bunları zorla tek ekrana sığdırıp metni küçültme.

## 2. Üç ödülü ayrı nesneler gibi göster

Başlangıç paketindeki üç maddeyi küçük görsel kutulara dönüştürmek paketi daha somut yapar:

- **4 saat ×2 gelir:** hızlandırıcı/süre simgesi, büyük “×2”, altında “4 saat”.
- **1 saatlik gelir:** para simgesi; mümkünse satın alma anındaki otomatik gelire göre parasal tutarı ayrıca göster.
- **Kırmızı fular:** gerçek fuların küçük görseli, altında “Şans'a fular”.

Bu kutular paket içeriğini karşılaştırmayı kolaylaştırır. Banknot görselinin büyüklüğü tek başına ne kadar para alındığını anlatmıyor. Dinamik tutar gösterilecekse boost'un etkisi ve ödülün hesaplandığı an gerçek satın alma kuralıyla aynı olmalı; statik/donmuş bir teklif tutarıyla gerçek ödeme çelişmemeli.

Mevcut ortak ikonlar ve `sans-scarf.webp` kullanılabilir. Kum saati yalnız süreyi anlatıyor; ×2 bilgisini uygulama metni vermeli. Rakamlara ürün görseli içine yer vermek gerekmiyor; Play Console görseli metinsiz kalır, oyun UI'sında metin ayrı çizilir.

## 3. İki paketin renk ve duygu farkı

Başlangıç: sıcak kayısı/altın yüzey, Şans ve kırmızı fular odak. Rahat Paket: mor/indigo yüzey, yumuşak altın detay ve kalıcı erişim rozeti. Aynı köşe yarıçapı, başlık ölçeği, padding ve düğme düzeni korunur; renk değişimi rastgele ikinci tasarım sistemine dönüşmez.

Arka planda düşük kontrastlı ışık halkası veya sabit ışın deseni, ürün görselini öne çıkarabilir. `RewardCard`'ın ışın mantığı yeniden kullanılabilir ama her IAP kartında sonsuz dönen desen gerekli değil. 1–2 kontrollü vurgu yeterli; bütün kenarları parlatma, bütün yazıları konturlama.

Mevcut mağaza açık mavi/indigo arka planı korunabilir; ürün kartı renklenince arka plan daha sakin tutulmalı. Mor başlık ile altın fiyat düğmesi oyuna zaten uyuyor. Tüm mağazayı koyu renge geçirmek ilk önerim değil: kullanıcının seçtiği sakin işletme görünümüyle uyum korunmalı.

## 4. Fiyat düğmesi ve satın alma anlamı

Şu an düğmede yalnız fiyat yazıyor. Ürün fiyatı kadar düğmenin ne yaptığı da okunmalı:

- “Satın al · {yerel fiyat}” veya “Paketi al · {yerel fiyat}”.
- Satın alma sırasında aynı düğmede durum (“İşleniyor…”); diğer ürünün fiyatına yanlışlıkla odak kaymamalı.
- Rahat Paket'in kalıcı faydası düğmenin yakınında görünür; başlangıç ödülleri tek seferlik olarak açıklanır.

Düğme 48–52 px yüksekliğinde, metni açık ve kontrastlı olabilir. Altın yüzeyde koyu indigo yazıyı denemek mevcut beyaz+gölge metinden daha net olabilir; gerçek renkler üzerinden ölçüm gerekir. Hem düğme hem fiyat ayrı ayrı bağırmamalı.

Satın alındığında Rahat Paket'in kartını yalnız %80 opaklığa düşürmek yerine kompakt bir “Aktif · Reklamsız ödüller” kartına çevirmek, satın almanın sonucunu görünür kılar. Başlangıç kartı kaybolmadan önce kısa teslim özeti gösterilebilir: para, hızlandırıcı süresi ve fular. Mevcut teşekkür satırı buna iyi bir başlangıç, fakat hangi hakların geldiğini görsel olarak göstermiyor.

## 5. Soldaki mağaza düğmesi

Mevcut düğme 56 px mor daire içinde beyaz çizgisel `Store` ikonu; albüm 3D raster, liste çizgisel kupa. Düğme işlevsel ve dokunma alanı yeterli büyüklükte tanımlanmış, fakat ürün görsellerinin sıcak 3D diliyle bağı zayıf.

Öneri: büyük gezinme simgelerinin aile uyumunu tamamla. Mağaza için küçük 3D alışveriş çantası/mağaza simgesi kullanılabilir; boşluk ve anlam nedeniyle mevcut Alışveriş alt menü ikonu ile karışmaması kontrol edilmeli. Sırf ilgi çekmek için farklı bir ürünün görselini bütün mağazanın simgesi yapma.

Yeni başlangıç teklifinde düğmeye bir kez yumuşak giriş vurgusu veya küçük “Yeni” rozeti yeterli. Mevcut kırmızı nokta teklif açık olduğu üç gün boyunca yanıyor; kullanıcı mağazayı gördükten sonra da aynı bildirim kalırsa “yeni bir şey var” anlamını kaybedebilir. Görüldü durumu ile gerçek aktif teklif durumu tasarımda ayrılmalı. Sayaç kullanılacaksa yerleştirme ve yoğunluk telefon üzerinde test edilmeli.

Albüm, liste ve mağaza solda aynı çapta/aynı aralıkla sıralanıyor; satış düğmesini sürekli büyük veya hareketli yapmak hikâye/karakter odaklı ana ekranı zayıflatabilir. Diğer düğmeleri bastırmadan ayırt etmek hedef.

## 6. Hoş geldin teklif kartı

`OfferCard` merkezde 144 px görsel kullandığından mağaza kartına göre ürünü daha görünür sunuyor. Ancak aynı mor başlık/beyaz gövde/madde listesi burada da var. Mağazadaki yeni başlangıç kartının görsel dili bu kartta da kullanılmalı; oyuncu aynı teklifi tanımalı.

Mevcut etiket “Hoş geldin hediyesi”, ürün ise ücretli. Bunu **“Başlangıç teklifi”** yapmayı öneririm. İlk kartta fiyat görünmüyor ve CTA “Bak”; ücretli olduğunu önceden açık etmek, mağazaya geçerken beklentiyi doğru kurar. Yerel fiyat hazırsa kartta gösterilebilir; hazır değilse fiyat uydurulmadan ücretli paket olduğu anlatılmalı. CTA “Paketi incele”, ikinci seçenek “Şimdi değil” olabilir.

Bu kart doğrudan satın almamalı; mevcut mağazaya yönlendirme korunabilir. Süre bilgisi küçük bir rozet olarak belirginleşsin, ama ödülleri gölgede bırakmasın.

## 7. Genel ekran/kart dili

İşletmeler için A görünümünde daha ince çizgi, yumuşak gölge ve sakin metin var. Bu CSS yalnız ilgili `data-look` ekranında çalışıyor. IAP hâlâ eski ağır parlaklık/gölge ailesinde; geçişte temel bileşen dili farklı hissedebilir. Bu farkı bilinçli kılmak için ortak başlık/kenar/gölge değerleri bütün ekranlarda tutarlı, IAP'ye özel vurgu ise görsel alanı ve ödül kutularında olmalı.

Her kartın aynı beyaz kutu olması kullanım bilgilerini düzenler; mağazada ürün değerlerini ayrıştırmak için iki varyant gerekir. İşletme kartının işletme adı/gelir/ilerleme ilişkisi, IAP kartının ürün/fayda/ödeme ilişkisinden farklıdır. Genel `Panel`'ı bütün ekranlar için değiştirmenin yerine ortak bir `ProductCard` ve `RewardTile` tasarlamak daha küçük ve güvenli kapsamdır.

## Üretim ve uygulama kapsamı

**Yeni görsel zorunlu değil.** İki ürün resmi, para ve hızlandırıcı ikonları, gerçek fular görseli mevcut. İlk tur kart yerleşimi, renk alanları, fayda yazımı, ödül kutuları ve fiyat düğmesiyle yapılabilir. Işık/desen CSS; kilit/onay/kapat vektör kalır. Gerekirse tek ek üretim mağazanın 3D gezinme simgesi olur.

Önerilen sırayla:

1. Başlangıç ürün kartını üç ödül kutusuyla tasarla.
2. Rahat Paket'i kalıcı fayda başlığı/rozetiyle ayrıştır.
3. Hoş geldin kartını aynı dile taşı, ücretli teklif metnini açıklaştır.
4. Soldaki düğmenin simge/rozet davranışını uyumlu hâle getir.
5. Satın alma sonrası teslim ve sahiplik görünümünü tamamla.

Kontroller: 320/360/390 px ve kısa/uzun ekran; TR/EN uzun metin; gerçek yerel fiyat; yalnız bir ürün kaldığında; satın alınmış Rahat Paket; teklif süresi bitmiş; mağaza bekleme/hata/iptal; reduced-motion. Kullanılabilirliği küçülterek çekicilik artırılmamalı.

Başarıyı yalnız “daha güzel” veya satın alma sayısı üzerinden değerlendirme: teklif görüntüleme → mağaza açma → satın alma başlatma → tamamlanma; iptal ve tekrar kapatma oranları birlikte incelensin. Mevcut `offer_view` olayının gerçekten görünür kartı mı yoksa mağazada listelenen ürünleri mi saydığı da netleşmeli. Tasarım değişikliğinin dönüşümü artıracağı ölçülmeden garanti edilemez.
