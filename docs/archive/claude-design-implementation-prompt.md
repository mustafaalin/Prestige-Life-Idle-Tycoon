# Claude Code uygulama promptu — v2 görsel arayüz iyileştirmesi (revize)

Önce AGENTS.md varsa, CLAUDE.md Design System ve güncel v2 belgelerini oku. GPT tasarım/görsel üretimini, Claude uygulamayı üstlenir. Mevcut çalışma ağacını koru. Ekonomi, kayıt uyumluluğu, fiyatlar, ödüller ve hikâye tetikleri bu kapsamda değişmez.

Altı tören karesi ve on işletme görseli zaten bağlıdır. Kahve coffee-cart-v2, bahçe c4-riza-garden-v2 kaynağıdır. Milyarder anlatım açılışı, Otel+Bülent hediyesi, tüm sahip olunan işletmeleri gösteren liste ve yeni gelir ayarlarını koru. Aşağıdaki adımları ayrı teslim et; her adımda bütün ekran/dil/durum matrisini tekrar test etme.

## a — Hikâye kadrajları + dokunma alanları

CeremonyShot.image ve LIFE_SCRIPT için kare bazında odak/zoom/güvenli yerleşim destekle. Ortak %8 yakınlaşmayı kaldır; eski fotoğrafın contain davranışını koru.

Başlangıç önerileri: x,y kaynak resimde sol üstten yüzde; bunlar doğrudan CSS object-position değildir. CSS object-position kırpılacak alanı dağıtır; dikey kırpma yoksa y etkisizdir. Görünür kaynak dikdörtgeni ve transform-origin birlikte hesaplanmalı. Değerler telefonda doğrulanmış final ayar değildir.

| Kare | Odak x,y | Zoom | İlk deneme / korunacaklar |
|---|---|---|---|
| soup | 52,41 | 1.00→1.00 | güvenli contain; yüzler, kaseler, tencere, sağdaki Şans |
| nevin-door | 50,36 | 1.00→1.00 | güvenli contain; Nevin, Defne, kahraman, kurabiye, Şans |
| attic | 50,39 | 1.00→1.02 | cover güvenliyse; yüz, defter, düşen fotoğraf, Şans |
| riza-garden | 42,29 | 1.00→1.00 | güvenli contain; anı balonunun tamamı, yüzler, fotoğrafın arka yüzü |
| restaurant | 49,34 | 1.00→1.00 | güvenli contain; iki personel, Bülent, kahraman |
| mansion-cake | 51,35 | 1.00→1.02 | cover güvenliyse; yüzler, kutu, pencere çiçekleri |
| date | 50,55 | 1.00→1.00 | güvenli contain; yüzler, çay/kurabiye, aşağıdaki Şans |
| wedding | 50,55 | 1.00→1.00 | güvenli contain; dört yüz, çift, Şans'ın yüzük paketi |
| birth | 50,52 | 1.00→1.00 | güvenli contain; iki yüz, bebek ve onu tutan eller |

Güvenli contain: diyalog ve portre tarafından kapatılmayan üst sahne alanına asıl resmi oranını koruyarak sığdır; boşluklar bulanık düşük kontrastlı arka plan uzantısıyla doldurulabilir. Alt %30 yanında balondan yukarı taşan 112 px portreyi de hesaba kat. En uzun satırın balon yüksekliği + safe-area + portre taşmasından güvenli alanı türet; aynı kare boyunca sabit tut. Resmi esnetme. Cover içerik keserse önce zoom kapat, ardından güvenli contain. Sığdırma yüzleri aşırı küçültürse GPT kadraj revizyonu listesine koy. Odak değiştirmenin tek başına düğündeki aşağıda kalan Şans'ı kurtaramayacağını kabul et. Reduced-motion'da zoom kapalı.

TopBar ayarlar, TabSheet kapatma, hedef genişletme, yönetici konuşma ve segmentlerin dokunma kutusu en az 44×44 CSS px. İkon büyümek zorunda değil; hedefler çakışmasın, kaydırmayı engellemesin. Fontları topluca değiştirme.

Kabul: dokuz kare 9:16, 19.5:9, 20:9 oranlarında (ör. 360×640/780/800), en uzun TR/EN diyalog ve portre taraflarıyla kontrol edilmiş. Ana yüz/nesneler zoom başlangıç/sonunda kesilmiyor ve balon altında kalmıyor. Dokunma kutuları ölçülmüş. Önce/sonra görüntüleri; typecheck/build:v2 geçer. Telefonda görülmediyse açıkça yaz.

## b — Sınıf kapanış kartı

340 px dış / yaklaşık 300 px iç genişlikte tek ana dönüşüm: gerçekten değişen ev > gerçekten değişen kıyafet > gerçekten değişen araç. İki yaklaşık 135 px kutu, ortada 20 px ok; ev görseli yaklaşık 120×72 px. Hepsini aynı kartta yığma. Başlık, ana dönüşüm, kazanım satırı, sonraki hedef, devam sırası.
Otel+Bülent hediyesini işletme küçük resmi + yönetici portresi + kısa metinle koru; diğer değişim yoksa ana kazanım olabilir.
Oyuncu evi/kıyafeti önceden aldıysa sınıf tabanını yeni hediye gibi gösterme. Gerçek önce/sonra mevcut geçişten alınabiliyorsa kullan; eski durum bilinmiyorsa karşılaştırma yerine ulaşılan sınıf/mevcut kazanımı göster. Sırf görsel için kayıt göçü yok.

Kabul: erken ev değişimi, kıyafet değişimi, Milyarder hediyesi ve önceden satın alınmış eşya durumları TR/EN 340 px'de doğru; uzun adlar taşmıyor. Çevrimdışı limit, sonraki hedef ve devam davranışı korunmuş; typecheck/build:v2 geçer.

## c — Aile albümü + emeklilik (iki bağımsız alt teslim)

c1: yalnız görülmüş hayat/tören kareleri; mevcut kayıt ve görsellerle albüm. Salt-okunur tekrar oynatma. Ödül, seen, isim sorusu, tören tetikleri ve gelir/yaş saatinin çalışma durumuna yan etki yok; mevcut oynatıcının saat durdurmasını özellikle kontrol et.
c2: mevcut hayat anları, aile adı varsa, işletme özeti ve miras puanı ile emeklilik paneli. Yeni soy ağacı/ekonomi icat etme; emeklilik düğmesi erişilebilir ve tek kez çalışır.

Kabul c1: boş/kısmi/tamam albüm, TR/EN; tekrar izleme öncesi/sonrası ilgili kayıt, ödül ve saat davranışı aynı.
Kabul c2: kısa/uzun ad, az/çok işletme, 360 px görünüm; emeklilik mantığı korunmuş.
Her alt teslim typecheck/build:v2 ve ilgili akış kontrolü.

## d — Tek ekranlık görsel sistem denemesi

Mor–indigo ve beyaz kart varsayılandır; CLAUDE.md paletini topluca değiştirme.
İşletmeler ekranında aynı durum/kaydırma konumuyla:
A: mevcut palet, azaltılmış parlak iç gölge, sakin kenarlar, küçük metinde kontursuz tipografi.
B: aynı düzen/ikonlarla alternatif #202D46 lacivert çerçeve ve #FFF8EC kırık beyaz kart; lokal izole önizleme.
Önce A. B kullanıcı seçimi olmadan üretim varsayılanı olmaz veya diğer ekranlara yayılmaz. A'nın mevcut paletle iyileştirilmesi ek onay gerektirmez.

Kabul: 360 px TR A/B karşılaştırması, EN uzun ad ve metin kontrastı kontrolü. İsim/gelir/ana eylem ilk bakışta ayırt edilir; reklam ana eylemden baskın değildir. Kontrast ve kullanıcı tercihi değerlendirilir; ölçülmemiş başarı oranı iddia edilmez. B geri alınabilir; typecheck/build:v2 geçer.

## e — İşletme kartları + seçici yazı boyutu

Önce yeni ikonları mevcut kartlarda telefonda veya ölçülü mobil önizlemede gör. Kanıtlanan soruna göre düzenle; zorunlu toplu yeniden tasarım yok.
360 px ekranda yaklaşık 300 px kart iç genişliği:
- Açılacak: 88–96 px ikon, 12 px boşluk, kalan alanda iki satıra izinli ad ve gelir; altında tam genişlik min.44 px satın alma + fiyat; şart/bekleme ve reklam ikincil.
- Çalışan: 72–80 px ikon/çalıştır, yanında isim/otomatik, adet ve gelir; ardından üretim/tur süresi, satın alma/fiyat, daha ince farklı etiketli kilometre taşı, yönetici/yükseltme. Önemli eylemleri menüye saklama. Uzun metinlerde ikincil satır dikey olabilir.
- Hediye otel owned>0 olduğu için çalışan/otomatik karttır. Mevcut tier sırası korunur, sıradaki alınacak işletmenin altında olabilir. Kilitli görünmez. Kayıtta hediye kökeni yoksa kalıcı hediye rozeti uydurma.

Global 12–13 px şartı kaldırıldı. Öncelik: sıkışmış fiyat, satın alma şartı, gelir açıklaması, süre, kilit gerekçesi; gerekirse 12–13 px. Kısa 10 px büyük harfli bölüm etiketi/rozet kontrastla kalabilir; dekoratif/tekrar eden 11 px alt metin otomatik büyümez. Koleksiyonun 9 px adlarını 11–12 px ve gerekirse üç sütunla dene. 62 kullanım topluca değiştirilmez.

Kabul: açılacak, manuel, otomatik ve sıra dışı hediye otel 360 px TR/EN'de kontrol; önemli ad/fiyat/şartlar taşmıyor. ×1/×10/max, çalıştır, yönetici, yükseltme ve tüm sahiplik görünümü korunmuş. Üretim/kilometre taşı farklı okunur. typecheck/build:v2 geçer.

## f — Uyku pozu ve yeni varlıklar (gelen gruba göre bağımsız)

Manifest: docs/design-art-production-plan.md. Olmayan dosyayı aktif eşlemeye ekleme.
sans-sleep-rope.png hazır ve alpha içerir. Yatay/alçak uyku sprite'ını oturan köpeğin kutusuna zorlayıp devleştirme; zemin çapası ve fiziksel uzunluğa göre yerleştir. Offline kartta kullan, kapanışta mevcut sit poza kısa geçiş. Deri/altın uyku varyantları gelene kadar o aşamalarda mevcut poza devam. Pet/finding/uyku çift köpek üretmesin.
flyer-distributor.png ve dishwasher.png hazır. Broşür çiçekçinindir; eski turuncu sembollü kaynak silindi, oyundaki Flyer-Distributor.png değiştirildi. Kariyer görselleri özgün ayrı kompozisyonlarla, referanssız üretilir.
Yeni portrelerde sahnenin gerçek kıyafetini seç; flashback ve hayat anlarını otomatik en iyi kıyafetle ezme. Portre seti yoksa mevcut sete geri dön.
Para, cüzdan, menü ve ortak raster ikonları gelen gruba göre merkezi eşlemeyle bağla. Ok/kapat/kilit/onay vektörleri korunur. Kullanılmayan v1 gem/sağlık/mutluluk/paketleri kapsam dışı.

Kabul: alpha, küçük ölçekte okunurluk, doğru anlam; kırık dosya yolu yok. Uyku normal dönüş ve pet/finding ile tek köpek, doğru tasma/ölçek. Portre sahne kıyafeti doğru. Her grup typecheck/build:v2 ve etkilenen ekran kontrolü.

## Teslim

Her adımda dosyalar, önce/sonra görüntüleri, kabul sonuçları ve telefonda doğrulanmayanları yaz. Lint'te mevcut/yeni hataları ayır. Görsel-only adım için simülatör şart değil. Son bütünleştirmede 360×800, 390×844, 412×915 TR/EN ana akış smoke kontrolü; tam matrisi her aşamada tekrarlama. Dokümanları gerçekleşen uygulamaya göre güncelle. Deploy/Play yükleme yok.
