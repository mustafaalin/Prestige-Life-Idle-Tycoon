# Claude Code uygulama promptu — v2 görsel arayüz iyileştirmesi

Prestige Life Idle Tycoon projesinde yalnızca aktif v2 arayüzünü geliştir. Önce AGENTS.md varsa ve docs/session-handoff.md, art-brief-v2.md, story-v2.md, game-design-v2.md belgelerini oku. GPT görselleri üretiyor; sen arayüz, varlık entegrasyonu ve doğrulamayı üstlen. Mevcut kayıt uyumluluğunu, ekonomi formüllerini, fiyatları, reklam ödüllerini ve hikâye tetiklerini değiştirme.

## 1. Ortak arayüz sistemi
src/game/ui/kit.tsx ve src/game/mobile.css üzerinden ortak renk, tipografi, boşluk, köşe ve gölge değerleri oluştur. Ana çerçeve koyu lacivert (#202D46), kart sıcak kırık beyaz (#FFF8EC), ana metin koyu lacivert; yeşil satın alma/gelir, altın önemli başarı, turuncu reklam, mor yönetici için kullanılabilir. Bunlar başlangıç değerleri; metin kontrastını doğrula. Altını tüm kart başlıklarında ve tüm çubuklarda kullanma. Parlak iç gölgeleri, kalın beyaz kenarları ve küçük metinlerin konturlarını azalt. Büyük ödül başlıklarında sınırlı kontur olabilir. Ana ekran, işletmeler, kariyer, alışveriş, ödül ve olay kartları aynı sistemi kullansın. Tasarımı sinematik sıcak 3D sahnelerle uyumlu tut.

## 2. Okunabilirlik ve dokunma
Yardımcı metinlerde mümkünse 12–13 CSS px altına inme. Koleksiyonun 9 px etiketlerini iyileştir; gerekirse sütun sayısı ve kart düzenini değiştir. Tüm etkileşimli kontrollerin dokunma alanını en az 44×44 CSS px yap; ikon büyümek zorunda değil. TopBar ayarlar, TabSheet kapatma, hedef genişletme, yönetici konuşma ve segment kontrollerini incele. TR/EN uzun metinlerde taşma ve anlamı gizleyen truncate kullanımını kontrol et. Normal metinde 4.5:1 kontrast hedefle. Aktif/kilitli/satın alınabilir durumları yalnız renkle ayırma.

## 3. İşletme kartları
Yeni işletme ile çalışan işletmeyi ayrı sunumlarla göster. Açılacak işletmede daha büyük okunabilir görsel (yaklaşık 96–112 px, dar ekrana göre esnek), işletme adı, gelir ve tek ana satın alma eylemi olsun. Çalışan işletmede ana sıra isim, üretim/gelir, satın alma; yönetici ve yükseltme ikincil sırada olsun. Üretim ve kilometre taşı çubuklarını farklı etiket ve renklerle ayır. Satın alma, çalıştırma, yönetici ve yükseltme davranışları korunmalı; önemli eylemleri yeni bir menü içine saklama. Detaylı çizimleri yeniden üretme; mevcut görselin boş kenarları ve küçük ölçekte okunurluğunu kontrol et.

## 4. Hikâye kadrajları
Ceremony.tsx içindeki object-cover ve ortak %8 zoom yerine kare başına odak noktası/zoom ayarı destekle; tüm kareler için aynı zorunlu yakınlaşmayı uygulama. 9:16, 19.5:9 ve 20:9 ekranlarda yüzler, kurabiye/pasta, aile fotoğrafı, Rıza anı balonu, personel ve Şans kesilmesin. Alt konuşma katmanı önemli nesneleri kapatmasın; safe-area ve uzun TR/EN balonlarını kontrol et. Rıza kaynağında art/pilot/07-story/c4-riza-garden-v2.png kullanılmalı. Diğer kareler: c2-nevin-door.png, c3-attic-v2.png, c7-mansion-cake.png, c5-restaurant.png, c1-soup.png. Mevcut entegrasyon doğruysa yeniden yapma.

## 5. Başarı ve emeklilik sunumu
Sınıf kapanış kartına mevcut varlıklardan gerçek eski/yeni ev, kıyafet veya araç dönüşümünü ve açılan içeriği ekle. Aynı yüzün üzgün/mutlu hâli tek dönüşüm göstergesi olmasın. Ödül ve törenin mevcut sonuçlarını değiştirme.
Emeklilik panelini mevcut verilerden hayat özeti, görülen hayat anları, mevcut aile adı, işletmeler ve kazanılan miras puanı ile zenginleştir. Emeklilik eylemi ve mevcut nesil/kayıt mantığı korunmalı. Olmayan soy ağacı verisi veya yeni ekonomi mekaniği uydurma.

## 6. Aile albümü
Yalnız görülmüş hayat anlarını gösteren yeniden açılabilir hafif bir albüm tasarla. Mevcut date/wedding/birth ve tören görsellerini kullan. Yeniden izleme ödül, yaş, gelir, lifeSeen veya tören tetiklerini tekrar çalıştırmasın; gerekiyorsa ayrı salt-okunur oynatıcı modu kullan. Yeni mesaj sistemi veya ana sahneye yeni aile karakterleri bu işin kapsamı değil.

## 7. Şans uyku pozu ve yeni ikonlar
GPT kaynak üretimine başlıyor: art/pilot/05-scene/sans-sleep-rope.png. Dosya gerçekten varsa şeffaflığını koru, sahne formatına dönüştür. Çevrimdışı ödül gösterilirken mevcut Şans yerine uyuyan pozu göster; ödül kapandığında mevcut oturan poza kısa geçiş yap. Gerçek uyanma animasyonu yoksa varmış gibi üretme. Uyku görseli sadece ip tasmalıysa deri/altın dönemlerinde ipli görseli gösterme; varyantlar gelene kadar mevcut pozu koru. Hero pet ve wallet/finding akışlarında çift Şans oluşmasın.
Kariyerin 12 görseli ve menü dışındaki para, cüzdan, statü/miras, yönetici, reklam, hedef, yükseltme, ev/araç/kıyafet/lüks ikonları daha sonra gelecek. Mevcut aktif ikon referanslarını envanterle; yeni dosya gelmeden kırık yol oluşturma veya tüm public/assets/icons dosyalarını topluca değiştirme. Eski gem/sağlık/mutluluk/paket varlıkları aktif v2'de kullanılmıyorsa bu tasarım kapsamına ekleme. Yeni varlıkların adları ve eşlemeleri merkezi olsun. Basit kapatma/ok/kilit/onay gibi kontroller tutarlı vektör ikonlar olarak kalabilir.

## Doğrulama ve teslim
Önce mevcut çalışma ağacını incele; başkasının değişikliklerini ezme. 360×800, 390×844 ve 412×915 CSS px boyutlarında TR/EN temel ekranları ve uzun metinleri kontrol et; Android safe-area davranışını koru. Erken oyun, otomatik işletme, geç oyun, çevrimdışı ödül ve emeklilik durumlarını incele. Görsel QA için önce/sonra ekran görüntülerini sakla. npm run typecheck ve npm run build:v2 çalıştır; değişen etkileşimler için anlamlı kontrol yap. Yapılanlar, varlık bekleyenler ve telefonda doğrulanamayanları açıkça raporla. Dokümanları nihai uygulamaya göre güncelle. Deploy, Play yükleme veya kullanıcıya mesaj gönderme yapma.
