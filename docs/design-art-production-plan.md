# Tasarım görsel üretim planı

**Son teslim:** 12 ifade portresi (iş setinde `-v2` kaynaklar seçili), atölye, dört lüks ve tek önsöz stil denemesi artık kaynak olarak hazır. Bölüm 4–6'daki bekleme ifadeleri ilk planın durumudur. Güncel dosya/durum ve boyutlar: [art-v2-latest-handoff.md](./art-v2-latest-handoff.md). Önsözün kalan beş karesi ve eski kadro portrelerinin toplu stil değişimi bu teslimde yok.

Durum (2026-10-13): Bölüm 1–3 tamamlandı. Şans'ın üç uyku tasması, 12 kariyer ikonu ve 20 menü/ortak ikon kaynak olarak hazır. Bu turda 32 yeni PNG üretildi: iki uyku varyantı, kalan 10 kariyer, 20 ortak ikon. Her kaynağın yanında `-prompt.txt` bulunur. PNG boyutları: uyku varyantları 1536×1024; kariyer ve ortak ikonlar 1254×1254. Dosya sayıları, prompt eşleri ve alpha kanalları kontrol edildi. Oyuna entegrasyon ve telefon testi Claude Code tarafında yapılacak.

Bölüm 4–7 sonraki işlerdir; planlanan yol dosyanın mevcut olduğu anlamına gelmez. Hazır dosyalar dışında Claude aktif referans değiştirmesin. Kullanıcı her kariyer ve ortak ikonun özgün, önceki görsellerden kopyasız olmasını istiyor; her ikon ayrı nesne/kompozisyonla, önceki ikonlara görsel referans verilmeden üretildi. Ortak stil; yumuşak hacimli 3D CG, net siluet, yazısız, raster nesnelerde alpha. Tekrarlanan karakterlerde kimlik kılavuzları referans alınır.

## 1. Şans
Hazır: art/pilot/05-scene/sans-sleep-rope.png
Tasma sürekliliği için tamamlanan varyantlar:
- art/pilot/05-scene/sans-sleep-leather.png
- art/pilot/05-scene/sans-sleep-gold.png
Aynı köpek/anatomi/uyku; ilgili tasma varyantı sınıfın mevcut tasma seçimine bağlanır. Oranı korunarak contain kullanılır; kareye gerilmez.

## 2. Kariyer — sıra ve kaynaklar
Durum: aşağıdaki 12 kaynağın tamamı hazır.
1. art/pilot/11-careers/flyer-distributor.png — hazır, çiçekçi broşürü; eski kaynak kaldırıldı.
2. art/pilot/11-careers/dishwasher.png — hazır.
3. art/pilot/11-careers/cashier.png
4. art/pilot/11-careers/waiter.png
5. art/pilot/11-careers/delivery-driver.png
6. art/pilot/11-careers/sales-representative.png
7. art/pilot/11-careers/it-support.png
8. art/pilot/11-careers/web-developer.png
9. art/pilot/11-careers/software-engineer.png
10. art/pilot/11-careers/team-leader.png
11. art/pilot/11-careers/director.png
12. art/pilot/11-careers/ceo.png
Garsonluk dahil sonraki mesleklerin kovulduğu restoranla bağlantısı otomatik kurulmaz. Kariyer ikonları insan kılavuzu değil meslek nesneleridir; hikâyeye aykırı sembol kullanılmaz.

## 3. Ortak ikon ailesi — kariyerlerden sonra
Durum: aşağıdaki 20 kaynağın tamamı hazır.
Ana gezinme:
- art/pilot/12-icons/business.png
- art/pilot/12-icons/career.png
- art/pilot/12-icons/shop.png
Para/ödül:
- art/pilot/12-icons/money.png — bakiye/para grubu
- art/pilot/12-icons/coin.png — tek madeni para, uçuş efektleri için uygun
- art/pilot/12-icons/wallet.png — çevrimdışı/ödül cüzdanı
- art/pilot/12-icons/income.png — gelir sembolü
- art/pilot/12-icons/prestige-points.png — mevcut statü gösterimi
- art/pilot/12-icons/legacy-points.png — ayrı miras puanı; statüyle karıştırılmayacak
Ortak işlevler:
- art/pilot/12-icons/manager.png
- art/pilot/12-icons/ad-reward.png
- art/pilot/12-icons/quest.png
- art/pilot/12-icons/upgrade.png
- art/pilot/12-icons/offline.png
Alışveriş kategorileri:
- art/pilot/12-icons/home.png
- art/pilot/12-icons/vehicle.png
- art/pilot/12-icons/outfit.png
- art/pilot/12-icons/luxury.png
Yeni ekranlar için:
- art/pilot/12-icons/family-album.png
- art/pilot/12-icons/retirement.png

Hepsi ayrı, anlamı net nesne kompozisyonu. Ortak açı/ışık/görsel ağırlık olabilir, aynı nesne şablonu yeniden renklendirilmez. 24/32/48 px hedefe göre detay azaltılır. Küçük işlevsel ok/kapat/kilit/onay/ayar için tutarlı vektör sistemini koru; sırf yeni olsun diye raster üretme. V1'in kullanılmayan gem, sağlık, mutluluk, para/gem paketleri bu turda yok.

Entegrasyon: kaynak PNG'ler korunur; mevcut asset adlandırmasına uygun WebP kopyalar oluşturulur. Kariyer listesinde mevcut meslek ID'leriyle birebir eşleştirilir. Şans'ın üç tasması ve bütün ikonların açık/koyu yüzeylerde 32/48/64 px görünümü telefonda kontrol edilir. `luxury.png` mağaza kategori simgesidir, yeni premium para birimi değildir. Dosyaların hazır olması runtime referanslarının değiştirildiği anlamına gelmez.

## 4. Kahraman ifade portreleri — yeni eklenen süreklilik işi
Kıyafet 2 de eksik kalmasın: her kıyafette mevcut dört anlam korunur. Kılavuz kimliği ve giysisi referans alınır, yüz değişmez.
- art/pilot/13-portraits/hero-work-worried.png
- art/pilot/13-portraits/hero-work-soft.png
- art/pilot/13-portraits/hero-work-determined.png
- art/pilot/13-portraits/hero-work-happy.png
- art/pilot/13-portraits/hero-smart-worried.png
- art/pilot/13-portraits/hero-smart-soft.png
- art/pilot/13-portraits/hero-smart-determined.png
- art/pilot/13-portraits/hero-smart-happy.png
- art/pilot/13-portraits/hero-suit-worried.png
- art/pilot/13-portraits/hero-suit-soft.png
- art/pilot/13-portraits/hero-suit-determined.png
- art/pilot/13-portraits/hero-suit-happy.png
Üretim sırası kariyer ve ortak ikonların ardından; kod mevcut portrenin yerini dosya gelmeden değiştirmesin. Hayat anlarının gömlek/düğün giysileri bu üç setle birebir eşleşmeyebilir; sahneye uygun özel portre ihtiyacı ayrı değerlendirilecek.

## 5. Atölye ve lüksler — ikinci üretim dalgası, acil test şartı değil
- art/pilot/07-story/c6-workshop.png — Rıza ve kıyafet 4 kahraman, babanın atölye hayali; önceden altı kare kapsamına dahil değildi, yeni öneri.
- art/pilot/14-luxury/speedboat.png
- art/pilot/14-luxury/mega-yacht.png
- art/pilot/14-luxury/private-helicopter.png
- art/pilot/14-luxury/private-jet.png
Lüks kaynaklar 3/4 nesne görünümü, alpha, gerçekçi oranlar; mağaza küçük resmine uygun. Sahne uçuş/park animasyonu için ayrıca yön ve ölçek sözleşmesi gerekir; statik ikon teslimi animasyonun tamamlandığı anlamına gelmez.

## 6. Stil uyumu — örnek onayına bağlı sonraki dalga
Önsöz ve mevcut portreler topluca hemen yeniden üretilmeyecek. Yeni hikâye karelerinin yumuşak 3D dili hedef; parlaklık abartılmaz. Önce tek önsöz karesiyle karşılaştırma, aynı kimlik/giysi/mekân/olay korunarak. Onay olursa altı kaynak:
- art/pilot/04-prologue/prologue-1-restaurant-3d.png
- art/pilot/04-prologue/prologue-2-phone-3d.png
- art/pilot/04-prologue/prologue-3-fired-3d.png
- art/pilot/04-prologue/prologue-4-door-3d.png
- art/pilot/04-prologue/prologue-5-bus-3d.png
- art/pilot/04-prologue/prologue-6-alley-3d.png
Tek örnek olarak prologue-4-door önerilir: anne ve kahraman kimliği, pasta kutusu, yoksulluk dönemi giysisi ve duygu aynı karede karşılaştırılabilir.

Eski ana kadronun 3D portre uyumu da örnek onayından sonra:
art/pilot/13-portraits/hero-street-{worried,soft,determined,happy}.png
art/pilot/13-portraits/mom-{worried,teary,smile,tears}.png
art/pilot/13-portraits/riza-{warm,concerned,serious,laugh}.png
art/pilot/13-portraits/bulent-{angry,smug,sly,shocked}.png
Süslü parantezler her ifadenin ayrı PNG dosyası olacağını belirtir. Nevin/Defne mevcut kaynaklarıyla yan yana kontrol edilir; gereksiz yeniden üretim yok.

## 7. Kadraj düzeltmesi — QA sonucuna bağlı
date ve wedding mevcut kareleri alt Şans/nesne yerleşimi nedeniyle gerekirse art/pilot/10-life/life-date-layout-v2.png ve life-wedding-layout-v2.png olarak revize edilir. Diğer kareler yalnız üst sahnede contain çok küçük kalır veya kimlik/nesne kesilirse aynı mantıkla kaynak revizyonuna alınır. Odak/zoom tablosu telefon testi yapılmış nihai yerleşim değildir.
