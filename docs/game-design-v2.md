# Prestige Life v2 — Oyun Tasarım Belgesi

Son güncelleme: 2026-10-13 · Durum: Faz 1 sürüyor; kurallar ve sayılar oyundaki hâliyle. Reklam/IAP kuralları: [monetization-v2.md](./monetization-v2.md)

Bu belge v2'nin tek doğruluk kaynağıdır. Gerekçesi [report-v2.md](./report-v2.md); rapordan sapmalar §9'da. Sayısal değerler kodda `src/game/core/config/` altında durur; buradaki tablolar `npm run sim -- --config` ve `npm run sim` çıktısından alınmıştır (2026-10-13). Değer değiştirince önce simülatörü çalıştır, sonra bu belgeyi güncelle.

## 1. Vaat

**"Sokaktan dünyanın en zenginine, tek bir ömürde; sonra hikâye torununla sürer."**

- AdVenture Capitalist tarzı üstel idle ekonomi (sayılar her zaman akar, büyük basamaklar "vay" anıdır)
- 7 basamaklı, törenli sınıf merdiveni (her basamakta sahne, ev, araç, kıyafet değişir)
- Bir ömür: kahraman 17 yaşında başlar, yaş sadece oyun açıkken ilerler (1 dk ≈ 3 hafta; 2026-10-09). 80 yaşında emekli olur ve torunu miras çarpanıyla devralır; erken emeklilik yok (§4.9)
- Tanıdıklardan gelen olay kartları: bir fırsat, iki cevap (§4.7; ilk 10 kart oyunda, büyük set Faz 2)

Hikaye, karakterler ve ton: [story-v2.md](./story-v2.md) (kahraman + köpeği Şans, Rıza Amca, annesine verilen söz).

## 2. Üç iç içe döngü

| Döngü | Süre | Oyuncu ne yapar | Sistemler |
| --- | --- | --- | --- |
| Anlık | saniyeler | Para akar; şişe toplar, işletme alır, yönetici atar | İşletmeler, yöneticiler, kilometre taşı çarpanları, sahnede toplama, Şans'ın bulduğu |
| Hayat | günler | Terfi alır, hayallerini satın alır, sınıf atlar | Kariyer, statü eşyaları, sınıf töreni, çevrimdışı kazanç, olay kartları |
| Ömür ve hanedan | haftalar | Bir ömür boyunca sınıf atlar; ömür sonunda emekli olur, varis mirasla başlar | Yaş, miras puanı, (yadigarlar, nesil içeriği — Faz 2) |

## 3. Kaynaklar

| Kaynak | Ne işe yarar | Sıfırlanır mı (emeklilikte) |
| --- | --- | --- |
| Nakit ($) | Her şeyi satın alır | Evet |
| Nesil kazancı | Sınıfı belirler; harcayınca düşmez | Evet |
| Toplam kazanç | Miras puanını belirler | Hayır |
| Miras puanı | Her puan tüm gelire +%1 | Hayır |
| Yaş | Ömrün ne kadarının geçtiği; 80'de emeklilik | Evet (varis 17'den başlar) |

## 4. Sistemler

### 4.1 Sınıf merdiveni (`config/classes.ts`)

| # | Sınıf | Eşik (nesil kazancı) | Kahramanın yaşı (engaged bot) |
| --- | --- | --- | --- |
| 0 | Living on the Street | 0 | 17 |
| 1 | Day Laborer | 1K | 17 |
| 2 | Working Class | 100K | 18 |
| 3 | Middle Class (Orta Sınıf) | 1M | 18 |
| 4 | Millionaire (Milyoner) | 10M | 19 |
| 5 | Billionaire | 1B | 22 |
| 6 | Multibillionaire (Multimilyarder) | 100B | 34 |
| 7 | Richest Person Alive | 1T | 56 |

Multimilyarder, Milyarder ile En Zengin arasındaki uzun boşluğa bir hikâye anı koymak için var.

**Orta Sınıf (karar 2026-10-08, kullanıcı):** İşçi ile Milyoner arasında $1M'da durur; Milyoner $10M. Neden: İşçi'den (kas gücüyle maaşlı iş) Milyoner'e geçiş çok büyük bir sıçramaydı; Milyoner artık gerçekten milyonlar demek. Gerçek dünya: milyoner net servet ≥ $1M (dünyada ~57,5 milyon kişi, çoğunun en büyük varlığı evi; UBS 2026), milyarder ≥ $1B (Forbes 2026: 3.428 kişi), $100B üstü ~15–20 kişi, dünyanın en zengini ~$0,84–0,9T. Oyunda eşik "nesil kazancı"dır, eldeki para değil.

Sınıf, harcanan paradan bağımsızdır (kazanılan toplam). Oyuncu alışveriş yaptığı için asla sınıf kaybetmez.

### 4.2 İşletmeler (`config/businesses.ts`)

AdVenture Capitalist modeli: her işletme adet adet alınır, her birim bir üretim döngüsünde gelir getirir.

- Birim fiyatı: `baseCost × costGrowth^sahipOlunan`
- Gelir/sn: `baseRevenue × adet × kilometreTaşıÇarpanı × yükseltmeÇarpanı / cycleSeconds × globalÇarpan`
- Kilometre taşları: 25, 50, 75 adette kâr ×2 (bir ömürde işletme başına ~70 adet alınıyor)
- Yöneticisiz işletme sadece oyun açıkken ve "Çalıştır"a dokununca tek döngü çalışır, çevrimdışı üretmez (simülatör bunu %60 verimle yaklaşık modeller)
- Yönetici: tek seferlik (ilk birimin 12 katı; Çiçek Tezgâhı'nda $1K), işletmeyi otomatik ve çevrimdışı çalıştırır. Her işletmenin kendi yönetici karakteri var (story-v2 §3)
- **Tören hediyesi (2026-10-13):** Milyarder olunca ilk Otel Zinciri ve yöneticisi Bülent Bey bedava gelir (`CLASS_MANAGER_GIFT`; minibüs ve ilk ev gibi, sınıfa ulaşıldığı anda). Oteli önceden almış olana yalnızca yönetici verilir. Sebep: ilk otel bir Milyarder'in gelirine binde bir kadar ekliyor, bot ilk hayatta hiç almıyordu ve törende işe alınan Bülent Bey ekrana gelmiyordu. Tempoya etkisi yok denecek kadar az (En Zengin 6 dk erken). İşletme listesi sahip olunan her işletmeyi gösterir, hediye sıradaki alınacak işletmenin altında durur; törenin "Önce / Şimdi" kartında bir satırla duyurulur
- **Son iki işletme alınmaya değer (2026-10-13, kullanıcı):** ilk adedin kendini ödeme süresi Otel Zinciri'nde 22 gün → 4 gün (`paybackMinutes` 32000 → 6000), Teknoloji Girişimi'nde 208 gün → 3,5 gün (300000 → 5000); fiyatlar aynı. Bot ilk hayatta ikisini de almıyordu. Şimdi bağlı bot otel almaya 6. günde (ömür sonunda 30 adet), girişime 14. günde (17 adet) başlıyor, Kuzen'i 19. günde işe alıyor; Fabrika ve Lojistik de alınmaya devam ediyor (31 ve 53 adet). Daha güçlü değerler denendi: otel 5000'de Multimilyarder hedefin altına düşüyor, girişim 3000–4000'de bot Fabrika'yı bırakıyor
- Ekranda gelir aylık gösterilir: $/ay = $/sn × 60. Para yine saniye saniye artar; işletme kartındaki çubuk tur başına geliri gösterir
- Üst bar ve "~X sonra alabilirsin" tahminleri yalnızca otomatik geliri (yönetici, maaş, kira) kullanır; dokunarak çalıştırılan işletmeler sayılmaz

**Ayar (2026-10-09, kullanıcıyla):** başta ana gelir iş, sonra ağırlık işletmelere geçer. Fiyat merdiveni $250'den başlar; her kademenin ilk birimi bir öncekinin 3–20 katı (adım büyüyerek), böylece yeni işletmeler ilk güne yığılmaz, günlere yayılır. Turlar kısa ve okunur (1–15 sn). Kademenin geliri `paybackMinutes` ile ayarlanır (ilk birimin kendini ödeme süresi). Her tur en az $1 öder; yavaşlık kazançtan değil fiyatlardan gelir (§6.6), simülatör bunu "his" kontrolleriyle bekler (§5).

**Çiçek Tezgâhı ucuzladı (karar 2026-10-13, kullanıcı, ilk telefon testinden sonra):** ilk adet $250 → $120 (büyüme ×1,20 aynı, tur yine $1, geri dönüş 4 dk → 2 dk), yöneticisi $3K → $1K (`FIRST_STAND`); diğer kademeler merdivendeki fiyatlarında. Sebep: ikinci işten sonra tezgâha kadar şişe toplamaktan başka yapacak şey yoktu ve ilk yönetici 19. dakikada geliyordu (botta; şimdi 6 dk 31 sn). Yan etkiler: İşçi töreni ilk oturuma girdi (25. dk), Multimilyarder bir oturum erken geliyor ve hedefin 3 saat altında kalıyor (§5).

| İşletme | İlk birim | Büyüme | Döngü | Tur başına | İlk birim geri dönüşü | Yönetici |
| --- | --- | --- | --- | --- | --- | --- |
| Flower Stand | $120 | ×1.20 | 1 sn | $1 | 2 dk | $1K |
| Coffee Cart | $750 | ×1.20 | 2 sn | $4.2 | 6 dk | $9K |
| Bakery | $3K | ×1.18 | 3 sn | $10 | 15 dk | $36K |
| Car Wash | $15K | ×1.17 | 4 sn | $33 | 30 dk | $180K |
| Mini Market | $90K | ×1.16 | 5 sn | $83 | 1 sa 30 dk | $1.08M |
| Beauty Salon | $720K | ×1.15 | 7 sn | $560 | 2 sa 30 dk | $8.64M |
| Logistics Warehouse | $7.2M | ×1.14 | 9 sn | $1.44K | 12 sa 30 dk | $86.4M |
| Factory | $86.4M | ×1.13 | 11 sn | $3.52K | 3 g 3 sa | $1.04B |
| Hotel Chain | $1.3B | ×1.12 | 13 sn | $8.8K | 22 g 5 sa | $15.6B |
| Tech Startup | $25.9B | ×1.12 | 15 sn | $21.6K | 208 g | $311B |

**Yükseltmeler (`config/upgrades.ts`):** Her işletmeye sırayla alınan 3 tek seferlik yükseltme, her biri o işletmenin kârı ×2 (toplam ×8). 5 / 15 / 35 adette açılır; fiyat o adede ulaşmanın maliyetinin 2 / 6 / 20 katı (Çiçek Tezgâhı: Tente ~$1,79K, Renkli saksılar ~$51,9K, Çiçek kamyoneti ~$7,08M). Fiyat işletmenin kendi büyüklüğüne bağlı olduğu için geç işletmelerin yükseltmeleri de erişilebilir kalır. Adet, yükseltme ve yönetici arasında gerçek bir seçim yaratır. Adları i18n `upgrades`.

### 4.3 Kariyer (`config/careers.ts`)

Tek iş, para ile terfi. Maaş online ve offline otomatik gelir. Her terfi o nesil boyunca tüm gelire kalıcı bonus ekler. Rol: ilk dakikalarda ana gelir (ilk işin maaşı kendini ~90 sn'de öder), sonra yan gelir; geç terfiler maaş için değil bonus için alınır. Maaşın geri dönüş süresi her terfide ×2,2 uzar; orta ve geç kariyer maaşları ayrıca kısılmıştır (`salaryFactor`: Sales ×0,4 → Software Engineer ve üstü ×0,06–0,08), üst işler ucuzdur (`costFactor`: Team Leader ×0,8, Director ×0,6, CEO ×0,5).

| Meslek | Fiyat | Maaş/sn | Gelir bonusu |
| --- | --- | --- | --- |
| Flyer Distributor | $10 | $0.11 | +5% |
| Dishwasher | $90 | $0.46 | +5% |
| Cashier | $810 | $1.9 | +5% |
| Waiter | $7.29K | $7.6 | +5% |
| Delivery Driver | $65.6K | $31 | +10% |
| Sales Representative | $590K | $50 | +10% |
| IT Support | $5.31M | $104 | +10% |
| Web Developer | $47.8M | $213 | +10% |
| Software Engineer | $430M | $522 | +15% |
| Team Leader | $3.10B | $2.14K | +15% |
| Director | $20.9B | $8.76K | +20% |
| CEO | $157B | $47.8K | +25% |

### 4.4 Statü eşyaları (`config/lifestyle.ts`)

Araç, kıyafet ve lüks oyuncaklar **gider değildir**; her biri tüm gelire kalıcı bonus verir. Evler ayrı bir modeldir (§4.8). Alışveriş = güçlenme. Fiyatlar geometrik büyür, böylece her sonraki "hayal" birkaç dakika ile birkaç saatlik gelir uzağında durur.

| Tür | Adet | İlk fiyat → büyüme | Bonus (her biri) | Görsel |
| --- | --- | --- | --- | --- |
| Ev | 12 (1. bedava) | Taşınma bedeli $1,2K → $20B (liste §4.8) | Yaşanan evin kademesi: +%8 × (n−1) | Sahnenin arka planı (kirala / satın al / kiraya ver: §4.8) |
| Kara aracı | 12 (yeni hayat araçsız başlar) | $20, $150, $1,5K, $5K, $12K, $90K, $300K, $700K, $4M, $25M, $150M, $1B | +3,75% | `vehicles/v2/` (12'si de yeni stilde) |
| Kıyafet | 4 (kapüşonlu bedava; iş kıyafeti, şık günlük, takım elbise) | $6K, $200K, $15M (Gündelikçi, Orta Sınıf, Milyoner'de açılır) | +12% | Sahnede kahramanın pozları (`ui/scene/stages.ts`) |
| Lüks oyuncak | 4 (tekne, yat, helikopter, jet) | $3B, $20B, $50B, $120B | +10% | `vehicles/v2/luxury-*.webp` (2026-10-13; mağazada; her biri ilk alındığında bir lüks anı, [story-v2.md §4c](./story-v2.md); sahnede yok) |

En iyi evde (kendi evin) yaşanıp tüm eşyalar alındığında statü toplamı +%217 (×3,2): ev %96, araçlar %45, kıyafetler %36, oyuncaklar %40.

**Kıyafetler (karar 2026-10-11, kullanıcı):** 20 kıyafet sahnede görünmüyordu (v2 kahramanına 20 kıyafet çizmek pahalı); yerine hikâyenin 4 kıyafeti geldi, evlerle aynı model. Kahraman sahip olduğu en iyi kıyafeti giyer; dördünün de pozları oyunda (şık günlük ve takım elbisede toplama pozu yok: yerde para varken erkenden alınırsa kahraman ayakta toplar). Sınıf töreni o sınıfın kıyafetini bedava verir (`CLASS_OUTFIT_FLOOR`: Sokak ve Gündelikçi kapüşonlu, İşçi iş kıyafeti, Orta Sınıf ve Milyoner şık günlük, Milyarder ve üstü takım elbise); önden satın alan hemen giyer. **Sınıf kilidi (karar 2026-10-14, kullanıcı):** para yetse de kıyafet kendi sınıfından önce alınamaz (`minClass`): iş kıyafeti Gündelikçi'de, şık günlük Orta Sınıf'ta (aynı tören onu verdiği için hiç satın alınmaz), takım elbise Milyoner'de (Milyarder hediyesinden bir sınıf önce). Alışveriş kartında kilitliyken "Orta Sınıf olunca açılır" yazar. Simülatörde tempo değişmedi (bot şık günlüğü zaten Orta Sınıf'tan önce almıyordu). Yeni kıyafet tören bitince ya da alınınca "Yeni kıyafetin" etiketiyle gelir. Eski kayıtlar: 20 kıyafetin en iyisi fiyatça en yakın yenisine (7. → iş kıyafeti, 11. → şık günlük, 15. → takım elbise). Simülatörde tempo değişmedi.

**Lüksler (karar 2026-10-14, kullanıcı):** fiyatlar reklamsız oyuncu dördünü de ilk hayatta alacak şekilde indi ($5B / $50B / $200B / $1T idi; jet hiç alınmıyordu, helikopter ömrün son dakikalarında). Bağlı botta: tekne 6. gün (3 sa 35 dk), yat 11. gün (7 sa 33 dk), En Zengin 15–16. gün, helikopter 17. gün (11 sa 17 dk), jet 21. gün (14 sa 12 dk), ömür sonu 25. gün; En Zengin %1 erken, diğer hedefler aynı. Her lüks ilk alındığında aile onu birlikte kullanır (lüks anları, albümde de). Sahnede gösterim sonraki tur.

**Araçlar (karar 2026-10-11, kullanıcı):** 12 araç (bisiklet, retro skuter, emektar sedan, motosiklet, hatchback, SUV, pikap, makam sedanı, spor coupe, lüks arazi aracı, süper otomobil, grand lüks); el arabası çıktı, yeni hayat araçsız başlar. Toplam bonus aynı kaldı (15 × %3 → 12 × %3,75). Eski kayıtlar: en iyi eski aracın bonusunu karşılayan sayıda yeni araç, asla daha az.

**Ev–araç zinciri (karar 2026-10-11, kullanıcı):** evler ve araçlar birlikte tırmanır. Her araç bir evde açılır (o evde ya da üstünde yaşamadan alınamaz) ve bir evin açtığı son araç alınmadan bir sonraki eve geçilemez. Böylece her evin önünde iki araç görülür: gelirken getirilen ve orada alınan; çadırın önünde süper araba olmaz, araç almadan arka arkaya ev de değiştirilmez. Kiralık oda iki araç açar, son ev hariç diğer her ev bir tane (11 geçiş → 12 araç; motosiklet ve pikap bu yüzden eklendi). Çadırın önünde yalnızca bisiklet durur, minibüsün önüne araba gelmez (karar 2026-10-12, kullanıcı: minibüste yaşayanın sedanı gerçekçi durmuyordu).

| Ev (taşınma bedeli) | Gelirken önünde | Bu evde açılan | Sonraki eve geçiş şartı |
| --- | --- | --- | --- |
| 1 Çadır (0) | yok | Bisiklet $20 | Bisiklet |
| 2 Minibüs ($1,2K) | Bisiklet | Skuter $150 | Skuter |
| 3 Kiralık Oda ($2,5K) | Skuter | Emektar sedan $1,5K, motosiklet $5K | Motosiklet |
| 4 Eski Daire ($9K) | Motosiklet | Hatchback $12K | Hatchback |
| 5 Yenice Daire ($40K) | Hatchback | SUV $90K | SUV |
| 6 Sitede Daire ($240K) | SUV | Pikap $300K | Pikap |
| 7 İlk Kendi Evin ($650K) | Pikap | Makam sedanı $700K | Makam sedanı |
| 8 Banliyö Evi ($9M) | Makam sedanı | Spor coupe $4M | Spor coupe |
| 9 Villa ($20M) | Spor coupe | Arazi aracı $25M | Arazi aracı |
| 10 Göl Evi ($200M) | Arazi aracı | Süper araba $150M | Süper araba |
| 11 Sahil Malikânesi ($2B) | Süper araba | Grand lüks $1B | Grand lüks |
| 12 Büyük Malikâne ($20B) | Grand lüks | yok | son ev |

- **Tören istisnadır (karar 2026-10-12, kullanıcı):** sınıf töreni yalnızca evi değiştirir (§4.8 "Sınıfın evi"), araç vermez; kahraman yeni eve hangi araca sahipse onunla gelir, bir iki araç geride olabilir. Sonraki eve geçmek için o eve kadar açılan bütün araçlar alınmış olmalı; kilitli evdeki "Önce al" düğmesi sıradaki eksik aracı gösterir (`moveUpNeedsVehicle`).
- **Sahne:** evin önünde, o evin izin verdiği en iyi sahip olunan araç durur.
- **Mağaza:** kilitli araçta "Önce taşın: {ev}", kilitli evde "Önce al: {araç}" düğmesi diğer sekmeye götürür.
- **Simülatör (bot, 2026-10-13):** bisiklet 3. dk, skuter 10., emektar sedan 16., motosiklet 27., hatchback 30., SUV 40., pikap 47., makam sedanı 52. dk.
- Kod: `config/lifestyle.ts` (`home`), `core/state.ts` (`lifestyleNeedsHome`, `moveUpNeedsVehicle`, `parkedVehicle`).

### 4.5 Hanedan / miras (`config/economy.ts`)

- Emeklilik sadece ömrün sonunda (80 yaş, §4.9); oyuncu erken emekli olamaz
- Ailenin toplam miras puanı: `floor(10 × (toplamKazanç / 1M)^(1/3))`
- Emeklilikte kazanılan = toplam puan − eldeki puan
- Her puan: tüm gelire +%1
- Küpkök bilinçli seçildi: mirası ikiye katlamak 8 kat kazanç ister ve resetler kartopu yapmaz (bkz. §6)

### 4.6 Çevrimdışı kazanç

- Sadece yöneticili işletmeler, maaş ve kira çevrimdışı üretir
- Oran %50; oran ve geç oyundaki 2 saatlik tavan kalıyor (karar 2026-10-13; denenen seçenekler discussion-notes §5). **Tavan sınıfla büyür (karar 2026-10-08):** Sokakta 10 dk, Gündelikçi 15 dk, İşçi 30 dk, Orta Sınıf 1 sa, Milyoner ve üstü 2 sa (`OFFLINE_CAP_HOURS_BY_CLASS`). Neden: sabit 2 saatte 3 dk oynayıp 1 sa uzak kalan oyuncu elindeki paranın yüzlerce katını buluyordu. Örnek: Egg, Inc. siloları (çevrimdışı süre bir ilerleme sistemi). Karşılama kartında tavan yazar.
- **Çevrimdışı kazanç oyunun asıl geliri (ölçüm 2026-10-13):** Milyoner'den sonra dolu bir kart 60 dakikalık oyun değerinde, oturum ise ~7 dakika; simülatörde ilk hayatta kazanılan paranın %87'si bu kartlardan geliyor (gündelik oyuncuda %91). Oranı ve tavanı değiştirmek bu payı pek oynatmıyor (%78–91), tempoyu oynatıyor; denenen seçenekler discussion-notes §5.
- Reklamla +%30 (oyunda: en az 10 dk uzak kalınca, ilk dönüşten sonra; ×2 oyunu yarıya indirdiği için +%30, karar 2026-10-13); "Gece Vardiyası Ekibi" IAP'ı oranı %100'e çıkarır ve tavanı +2 saat uzatır (bekliyor). Reklam yerlerinin hepsi: [monetization-v2.md §4](./monetization-v2.md). Kullanıcı erken oyunda çevrimdışı ödülü hâlâ fazla buluyor; ekonomi ayarında tekrar ele alınacak (discussion-notes §5)

### 4.7 Sahnede kazanç: toplama, Şans'ın bulduğu, olay kartları

Ayrı bir "dokun" düğmesi yok; elle kazanç ana sahnede üç şeyden gelir (`config/scene.ts`, `config/events.ts`).

**Toplama (karar 2026-10-08):** yerde şişe ve kutular (Sokak, Gündelikçi), sonra bozuk para (İşçi) belirir. Ekranda en fazla 4 nesne, sahne dolu başlar, 2,5 sn'de bir yenisi. Nesne başına `2 × mirasÇarpanı + aktifGelir/sn × 2,5`: bir şişe ~2,5 saniyelik gelir eder, yoksa toplamaya değmez; durmadan toplayan oyuncu gelirini ~2 katına çıkarır. Simülatör: ilk 3 dk her şişe (0,4/sn), sonra ara sıra (0,15/sn ≈ +%40).

**Toplama Orta Sınıf'ta biter (karar 2026-10-12, kullanıcı):** Orta Sınıf töreni bitince yer boşalır ve kahraman bir daha yere eğilmez (`COLLECT_END_CLASS`, `canCollect`); milyarderin yerden para toplaması hikâyeye uymuyordu. Yerini olay kartları alır; Şans'ın bulduğu aynen sürer.

**Şans'ın bulduğu (karar 2026-10-08):** Oyun açıkken 5–10 dakikada bir Şans ağzında bir cüzdanla gelir, 12 sn bekler. **İlk yönetici işe alınana kadar çok daha sık gelir: 1,5–2,5 dakikada bir** (karar 2026-10-13, kullanıcı; `FETCH_EARLY_*`, `fetchSeconds`): o dakikalarda kendiliğinden kazanan bir şey yok ve yapacak şey az. Dokununca ödül kartı açılır: cüzdan sahibine verilir, teşekkür ödülü 15 şişe değerinde (`FETCH_BOTTLES`, ~37 sn gelir). "Topla" ile alınır, paralar bakiyeye uçar. Şans'a dokunmak para vermez (okşama pozu, kalp). Simülatörde yakalama oranı bağlı oyuncuda %80, gündelik oyuncuda %50.

**Olay kartları (karar 2026-10-12, kullanıcı):** Orta Sınıf töreninden sonra kahramanın tanıdığı biri arar; kart tek bir fırsat sorar, iki cevabı vardır:

| Cevap | Ödül (aktif gelirin saniyesi) |
| --- | --- |
| Sağlamcı | 45 sn, kesin |
| Cesur | %50 ihtimalle 100 sn, olmazsa 10 sn (ihtimal ve iki tutar düğmede yazar) |

- **Denge:** cesurun ortalaması 55 sn, sağlamcıdan yalnızca biraz fazla (ortalama 67,5 iken hep cesuru seçen %50 fazla kazanıyordu, seçim kalmıyordu). Dallanma, kalıcı sonuç ve ceza yok.
- **Zamanlama:** oturumun ilk çağrısı 60–90 sn sonra, cevaplanan her karttan sonra sıradaki 4–6 dk sonra. Çağrı ana sahnede cevaplanana kadar bekler (aynı anda tek kart; sekme açıkken görünmez; tören, çevrimdışı kartı ve ömür sonu önce gelir). Aynı kişi üst üste aramaz.
- **Ödeme ve kayıt:** ödül cevap verildiği anda bakiyeye geçer, üst bar onu "Topla"ya kadar göstermez; cevaplanmış kart "Topla"ya kadar ekranda kalır. Cevabın saati kayda yazılır (`story.eventAnsweredAt`) ve hızlı ilk çağrı son cevaptan beri 4–6 dk geçmeden gelmez: oyunu kapatıp açmak ne daha sık kart getirir ne kötü sonucu yeniden denetir (reklamlı "ikinci şans" için de gerekli; [monetization-v2.md](./monetization-v2.md) #7).
- **Kimler arar (10 kart):** Rıza Amca, Nevin Hanım ve Kuzen her oyuncuya; altı kart yöneticilerindir ve yalnızca o yönetici işe alındıysa gelir (Selin, Hüseyin Usta, Kemal, Ayten Abla, Derya, Burak); Bülent Bey'in kartı Milyarder töreninden sonra. İlk hayatta sınıf, töreni görülünce sayılır. Metinler `events.cards.*` (story-v2 §4d), kim hangi yüzle arar `ui/events/eventScript.ts`.
- **Simülatör:** 5 dakikada bir kart, cevapların yarısı sağlamcı (ortalama 50 sn gelir), bağlı oyuncu kartların %90'ını, gündelik oyuncu %70'ini cevaplar (aktif gelire ~%15); oturumun hızlı ilk çağrısı sayılmaz.
- **Sonra:** sınıfa göre değişen büyük set (plan 2.4).

### 4.8 Konut modeli: kirala → satın al → kiraya ver (`config/housing.ts`, Faz 1.17)

Tek ev kavramı (rapor §5). Oyuncu her zaman tek bir evde yaşar; **ana ekranın arka planı o evdir, o evin izin verdiği en iyi aracı önünde park eder** (karar 2026-10-10; ev–araç zinciri §4.4). Erken oyunda ev almak zor olduğu için önce kiralayarak ilerler, sonra satın alır, taşındığı kendi evleri kira getirir.

| Eylem | Bedel | Ne olur |
| --- | --- | --- |
| **Kirala ve taşın** | Tek seferlik taşınma bedeli (depozito + ilk kira). Sadece bir üst kademedeki ev; o eve kadar açılan bütün araçlar alınmış olmalı (§4.4). | O eve taşınırsın. Eski kiran biter (aynı anda tek kiralık ev). |
| **Satın al** | Fiyat = taşınma bedeli × 25. İçinde kiracı olduğun evi alırken ödediğin taşınma bedeli düşülür. | Bir üst kademedeki evi alırsan taşınırsın. Yaşadığın evden daha alttaki bir evi alırsan kiraya verilir. |
| **Kiraya ver** | Kendiliğinden | Sahip olunan ama içinde yaşanmayan her ev kira getirir; çevrimdışı da işler (yönetici kuralıyla: %50, tavan §4.6). |
| **Geri taşınma** | Yok (karar 2026-10-12) | Yalnızca yukarı taşınılır: her evin önünde kendi araçları durur (§4.4), çıktığın kendi evin kirada kalır. |

- **Düzenli kira gideri yok** (karar 2026-10-07). Net gelir hiçbir zaman eksiye düşmez. Kiracı olduğun "Kiracısın" etiketi ve taşınma bedeliyle hissettirilir.
- **12 ev (karar 2026-10-10; önce 25'ti, çoğu birbirine benziyordu):** her ev sahnede ayrı bir yer, her taşınma görünür bir değişim. Taşınma bedelleri: Çadır 0 · Eski Minibüs $1,2K · Kiralık Oda $2,5K · Eski Kiralık Daire $9K · Yenice Kiralık Daire $40K · Sitede Daire $240K · İlk Kendi Evin $650K · Bahçeli Banliyö Evi $9M · Villa $20M · Göl Kenarında Cam Ev $200M · Sahil Malikânesi $2B · Büyük Malikâne $20B (`config/housing.ts`). Satın alma fiyatı bedelin 25 katı, yani bedel fiyatın %4'ü.
- **Sadece kiralık evler:** 1–6 (çadırdan sitedeki daireye). Satın alma 7. evden ("İlk Kendi Evin") itibaren açılır; ilk kendi ev bir dönüm noktasıdır.
- **Sınıfın evi (karar 2026-10-10):** Her sınıf töreni, o sınıfın hikâyedeki evinden geride kalan kahramanı oraya taşır (kiracı, bedava): Gündelikçi → Rıza Amca'nın minibüsü, İşçi → eski kiralık daire, Orta Sınıf → sitede daire, Milyoner → ilk kendi evin (**hediye, sahipli**; karar 2026-10-12, `FIRST_OWNED_HOME`: tören öncesinde ev sahibi olmak mümkün değil, en ucuz ev $16,25M ve Milyoner eşiği $10M. Törenden önce ev 8'e kiraya çıkmak da mümkün değil: pikap + ev 7 kirası + makam sedanı + ev 8'in $9M'lik taşınma bedeli $10,65M eder, bu yüzden bedel $2,5M'den $9M'ye çıktı; hediye hep oturulan ev olur, kiracı evinin sahibi olur), Milyarder → villa, Multimilyarder → göl evi, En Zengin → sahil malikânesi (`CLASS_HOME_FLOOR`). Böylece tören metinleri ("Artık bir dairem var") hep doğru; mağazadan önden giden kendi evinde kalır. Sahne yeni evi tören bitince gösterir.
- **Ev bonusu:** Yaşadığın evin kademesine bağlı: n. ev tüm gelire +%8 × (n−1) verir (6. ev +%40, 12. ev +%88). Bonuslar üst üste eklenmez: yalnızca oturduğun ev sayılır. **Kendi evinde oturuyorsan +%8 ek** (`OWNER_HOME_BONUS`, karar 2026-10-12): kendi evin, bir üst kademedeki kiralık evle aynı bonusu verir, daha fazlasını değil; böylece yukarı taşınmak da yeni evi satın almak da hep kazandırır (1,5 kat denendi: oyuncu eski evinde kalıyor, Multimilyarder hedefi bozuluyordu). Çıktığın kendi evlerin bonus vermez; onların ödülü kira geliridir.
- **Kira geliri:** Taban kira/sn = fiyat / geri dönüş süresi. Geri dönüş, işletmelerdeki gibi fiyatla büyür: saat = 4 × (fiyat / $1M)^0,44 (ev 7 ~14 sa, ev 12 ~1.290 sa; 2026-10-12'de 12'den 4'e indi: 12'de kira gelirin ortanca %1'iydi ve bot oturduğu evi hiç almıyordu). Tüm gelir çarpanları kiraya da uygulanır. Simülasyonda kira gelirin ortanca ~%7'si: işletmelerle yarışmıyor ama görünür.
- **Nesil:** Emeklilikte evler sıfırlanır; varis çadırdan başlar (2. nesil açılışı Faz 2.1'de tartışılacak: [discussion-notes.md](./discussion-notes.md) §4).
- Hikâye bağı: çadır → Rıza Amca'nın minibüsü (Gündelikçi) → eski kiralık daire (İşçi) → sitede daire (Orta Sınıf; aynı törende annene eski aile evi) → ilk kendi evin (Milyoner) ([story-v2.md](./story-v2.md) §4).

### 4.9 Yaş ve ömür (`config/life.ts`, karar 2026-10-08; ömür 80 yaş 2026-10-11)

| Kural | Değer |
| --- | --- |
| Başlangıç yaşı | 17 (varis de 17'den başlar) |
| Emeklilik yaşı | 80 (63 yıl; 2026-10-11, önce 97). Varis torun kahraman 63 yaşındayken doğar, devirde 17 olur |
| Oyun ayı | 80 saniye oyun = 1 ay; 16 dakika = 1 yaş; bir ömür ≈ 17 saat oyun (2026-10-09) |
| Yaş ne zaman ilerler | Sadece oyun açıkken. Uzaktayken para birikir ama yaşlanmazsın. 10 sn'den uzun boşluk çevrimdışı sayılır |
| Ömür sonu | "Bir ömür tamamlandı" paneli (hayattan kareler, işletme özeti, aile itibarı) → Emekli ol ve devret. Ölüm gösterilmez; vakıf töreni 2.1'de |
| Gösterim | Üst barda "24 yaş" |

- Tam ekran hikâye anlarında (tören, hayat anı) yaş durur.
- **Hayat anları (karar 2026-10-11):** yaş, hikâyenin ikinci saatidir. Belirli yaşlarda kahramanın hayatından tek karelik anlar oynar (buluşma, düğün, çocuğun doğumu...); sınıf törenleri paraya, hayat anları yaşa bağlıdır. Liste ve kurallar [story-v2.md §4c](./story-v2.md).
- En Zengin'den sonraki yılları (59 → 80) hayat anları doldurur (torunun doğumu, devir; testten sonra). Engaged bot En Zengin'e 57, casual 47 yaşında ulaşıyor; ömür sonu engaged botta 25. gün (16 sa 48 dk oyun).

### 4.10 Hedefler (`config/quests.ts`)

Egg, Inc.'in 3 görevi gibi: ana ekranın sol üstünde "Hedefler" kartı, aynı anda 3 hedef (biten öne çıkar, "Ödülü al"). İlk saat için 25 yazılı hedef (5 şişe topla → işe gir → bisiklet al → Bulaşıkçı ol → Çiçek Tezgâhı aç → Tente → ... → Orta Sınıf ol); bitince işletmelerin kilometre taşlarından üretilen hedefler gelir: her işletmenin hedefi, ödülü alınmamış ilk kilometre taşıdır, yani ulaşılan taş ödülü alınana kadar ekranda kalır ve öne geçer (2026-10-12; önce hedef hep bir sonraki taşı gösteriyor, tamamlanan hedef ödülü alınmadan kayboluyordu). Ödül `max(küçük sabit, aktif gelir × 15 sn)`, üretilenlerde 20 sn. Ödüller bilinçli küçük: 45 sn'lik ödülde bot "al → hedef biter → ödülle yine al" zincirine girip ilk saati 2 dakikada bitirdi. Sayaçlar: toplanan şişe ve sahibine verilen cüzdan (`bottles`, `finds`). Toplama bitince (Orta Sınıf) şişe hedefi tamamlanmış sayılır, yoksa yerini ömür boyu tutardı. Hedefler aynı zamanda ilk dakikaların rehberi (plan 1.12).

**Hedef kartı (2026-10-08, kullanıcı: "bazı görevlerin ne olduğu ve nereden yapılacağı anlaşılmıyor"):** Her hedefte resim (işletme, yönetici portresi, iş, ev, araç, şişe, Şans), nerede yapıldığı ("İşletmeler", "Alışveriş › Evler"; sokaktakilerde ipucu: "Sokaktaki şişe ve kutulara dokun", "Şans bir şey getirince ona dokun") ve "Git" düğmesi var. "Git" ilgili sekmeyi (ve Alışveriş'in alt sekmesini) açar, gereken düğmeye kaydırır, düğme 5 sn parlar ve üstünde el işareti durur (`ui/home/focus.ts`, `Focusable.tsx`). Sekme açıkken üstte ince bir hedef şeridi kalır: biten hedef, "Git" denen hedef ya da o sekmede yapılabilecek hedef; ödül oradan da alınır.

### 4.11 Zenginler Listesi (`config/richList.ts`, karar 2026-10-14)

Kurgusal bir dünya zenginleri listesi; geç oyunda ilerlemeyi görünür kılar. Ekonomiye etkisi yok, para ödülü yok.

- **Ölçü:** bu hayatta kazanılan toplam (`generationEarnings`), sınıfın baktığı sayı. Harcamak sırayı düşürmez; jet almak listede sıra kazandırmaz ya da kaybettirmez. Varis kendi kazancıyla baştan başlar.
- **Açılış:** liste $1B'de (Milyarder) açılır. Düğme ana ekranda albümün altında, Milyoner töreninden itibaren görünür; $1B'ye kadar kilitli ("Listeye $1B ile girersin" + kalan tutar).
- **İlk 20:** 19 isimli rakip, $880B'den $105B'ye (gerçek zenginlerin hafif benzetmesi: Alan Trusk, Larry Elsin, …; yalnızca isim ve sektör, portre, şirket adı ve logo yok). Kahraman $100B'de (Multimilyarder töreni) #20 olur. 1. sıradaki Alan Trusk kahraman yaklaşınca hep biraz önde kalır (kahramanın kazancının %2 fazlası, en çok $1T): #1 tam $1T'de, En Zengin töreniyle gelir.
- **İlk 20'nin altı:** sıra dört çapa noktası arasında log-log ara değerle hesaplanır ($1B ≈ #3.400, $4B ≈ #1.000, $25B ≈ #100, $100B = #20). İsimli rakip yok; sıradaki hedef bir sonraki çapa ("Sıradaki: ilk 1000 · $X kaldı").
- **Kartlar:** altı sıra kısa bir kart getirir (kim konuşur, sıra, tek cümle; metinler [story-v2.md §4e](./story-v2.md)): giriş, ilk 1000, ilk 100, ilk 10, ilk 5, 2. sıra. İlk 20 ve #1'in kartı yok, törenleri o an. Kart yalnızca ilk nesilde, ana sahnede ve başka hikâye anı yokken gelir; tören ve hayat anından sonra 2 dk bekler. Birkaç sıra birden geçilirse (uzun uzak kalma) yalnızca en sonuncusunun kartı gelir.
- **Simülatörde (2026-10-14, bağlı bot):** giriş 1 sa 29 dk (#2.594), ilk 1000 1 sa 57 dk, ilk 100 3 sa 7 dk, ilk 20 4 sa 45 dk, ilk 10 5 sa 34 dk, ilk 5 6 sa 37 dk, 2. sıra 7 sa 54 dk, #1 10 sa 35 dk. Liste En Zengin'den sonraki saatleri doldurmaz. `npm run sim -- --timeline` "Rich List" satırlarını gösterir.

## 5. Tempo hedefleri ve simülasyon sonuçları

`npm run sim` iki oyuncu profilini 45 gün oynatır:

- **Engaged:** 1. gün 30 + 10 + 7 dk, sonraki günler 6 × 7 dk. GameAnalytics'teki ilk %10 idle oyuncuya yakın. Hedefler bu profile göre kontrol edilir.
- **Casual:** 1. gün 20 + 5 dk, sonraki günler 3 × 5 dk. Yalnızca bilgi için.
- **Engaged + ads:** engaged oyuncu, ayrıca reklam izler (günde 3 hızlandırıcı, çevrimdışı +%30, Şans ×2, günde 2 yardım, eksik fiyatın %10'una ve 5 dakikalık gelire inince eksik kadar). Yalnızca bilgi için; En Zengin'e reklamsızdan ~%31 erken ulaşıyor ([monetization-v2.md §4](./monetization-v2.md)). Hedefler reklamsız oyuncuya göre kalır.

Bot her an en kısa sürede kendini ödeyen alımı yapar, yani optimal oynar. Gerçek oyuncuların ~1,3–1,8 kat yavaş olduğu tahmin, ölçülmüş değil. Bot yöneticisiz işletmeleri %60 verimle çalıştırıyor sayar; gerçek oyunda sadece başlatılan döngü ödenir (sınırlar: discussion-notes §6). Toplama, Şans'ın bulduğu ve olay kartları simülatörde modelli (§4.7).

Güncel sonuç (2026-10-13; hedefler `src/game/sim/report.ts`):

| Kilometre taşı | Hedef (engaged bot) | Engaged bot | Casual bot |
| --- | --- | --- | --- |
| İlk satın alma | ≤ 1 dk oyun | 10 sn | 11 sn |
| İlk işletme | 2–6 dk oyun | 2 dk 5 sn | 2 dk 14 sn |
| İlk yönetici | 5–25 dk oyun (2026-10-13; önce 8–25) | 6 dk 31 sn | 6 dk 57 sn |
| Gündelikçi | 4–10 dk oyun (2026-10-13; önce 5–10) | 4 dk 33 sn (17 yaş) | 4 dk 51 sn |
| İşçi Sınıfı | 18–35 dk oyun | 24 dk 52 sn, 1. gün ilk oturum (18 yaş) | 21 dk, 1. gün 2. oturum |
| Orta Sınıf | 25–50 dk oyun | 31 dk, 1. gün 2. oturum (18 yaş) | 29 dk, 2. gün |
| Milyoner | 35 dk – 1 sa 15 dk oyun | 47 dk, 2. gün (19 yaş) | 35 dk, 2. gün |
| İlk milyarder | 3–7. gün | 3. gün, 1 sa 29 dk (22 yaş) | 5. gün |
| İlk multimilyarder | 8–14. gün | **7. gün 21:00, 4 sa 45 dk (34 yaş): hedefin 3 saat altında, simülatör bu satırda FAIL veriyor** (2026-10-13; karar bekliyor, discussion-notes §5) | 14. gün |
| İlk "en zengin" | 14–21. gün | 16. gün 08:00, 10 sa 35 dk (56 yaş) | 31. gün (46 yaş) |
| İlk ömür sonu (80 yaş) | 21–37. gün | 25. gün (16 sa 48 dk oyun) | 45 günde gelmiyor |

**His kontrolleri (`checkFeel`):** Tempo hedefleri tutarken işletmeler yan gelire düşebiliyor (eski bir ayarda Gündelikçi anında işletme payı %3'tü). Simülatör şunları da bekler: her işletmenin ilk biriminin turu ≥ $1; işletmelerin gelirdeki payı (toplama hariç) Gündelikçi anında, ilk oturumun sonunda ve 1. nesil oturumlarının ortancasında ≥ %50. Şu an: tur en az $1, pay %73 / %83 / %95. `npm run sim -- --purchases --timeline` her alımı zaman çizelgesinde gösterir.

Engaged botun ilk günü (2026-10-13): şişeler → el ilanı işi (10 sn) → Bulaşıkçı (1 dk 17 sn) → Çiçek Tezgâhı (2. dk) ve bisiklet (3. dk) → Gündelikçi (4,5. dk) → Rıza Amca yönetici (6,5. dk) → Tente ve skuter (10. dk) → Kahve Arabası (12,5. dk) → kiralık oda ve emektar sedan (14–16. dk) → İşçi töreni (25. dk); ilk oturum burada biter. Orta Sınıf 2. oturumda gelir. Sınıf çubuğu karekök ölçeğinde çizilir (`classProgress`): düz oranla dakikalarca %0'da durup sonra fırlıyordu.

- Varis çok hızlı: 1. ömür ~1.800 miras puanı (×19 gelir; son işletmeler güçlenince 1.400'den çıktı) bırakıyor; 2. nesil Milyoner ve üstüne dakikalar içinde ulaşıyor. Faz 2.1'de miras formülü ve 2. nesil içeriğiyle birlikte ele alınacak.
- İlerleme hissiyle ilgili açık gözlemler (ilk oturumda tek tören, 4. saatten sonra az değişim): [discussion-notes.md §8](./discussion-notes.md).

## 6. Simülasyondan öğrenilenler

1. **Kariyer maaşı kartopu yapıyordu.** Terfi başına maaş ×6 büyüyünce CEO maaşı tüm işletmeleri geçti. Çözüm: maaşın geri dönüş süresi her terfide ×2,2 uzar; geç terfiler maaş için değil bonus için alınır.
2. **Çarpanlar geri dönüş süresini böler.** Toplam ×30'luk bir çarpan, 1 saatlik geri dönüşü 2 dakikaya indirir. Üst kademelerin taban geri dönüşü bu yüzden çok uzun (günler); oyuncu bunu çarpanlarla kısaltır.
3. **Çevrimdışı toplu para gelir patlaması yapar.** 4 saatlik tavanla tek bir arada gelir 50 katına çıkıyordu; tavan 2 saate indi. Erken oyunda 2 saat bile fazlaydı (3 dk oynayıp 1 sa uzak kalan $106K buluyordu); tavan artık sınıfla büyüyor (10 dk → 2 sa, §4.6).
4. **Statü eşyaları ucuz ve güçlüydü.** 30 dakikada +%185 gelir veriyordu; bonuslar küçültüldü (güncel değerler §4.4).
5. **Karekök mirası kontrolden çıkıyordu.** Küpköke geçildi, puan başı bonus %2'den %1'e indi.
6. **Tempo hedefleri hissi garanti etmez.** Yavaşlatma tüm işletme gelirini bölünce sınıflar yine zamanında geldi ama Çiçek Tezgâhı turda $0,01 verdi ve oyunu maaş taşıdı. Yavaşlatma kazançtan değil fiyatlardan yapılır; his kontrolleri (§5) bunu bekler.
7. **6. nesilden sonra "en zengin" birkaç dakikada geliyor.** Mevcut içerik ~2–3 haftalık. Uzun vadeli tutma için Faz 2'de her nesle yeni içerik gerekli (§7).

## 7. Faz 2'ye bırakılan tasarım kararları

- **Nesil içeriği:** Her yeni nesil yeni bir şey açmalı. Seçenekler: yeni şehir ve yeni işletme kademeleri (40 işletme görselinin 30'u hâlâ kullanılmıyor), yadigarlar (miras puanıyla alınan kalıcı yetenekler), yeni sınıflar ("Old Money Dynasty" vb.).
- **Olay kartları:** büyük set, sınıfa göre değişen 60+ kart (ilk 10 kart oyunda, §4.7).
- **Yatırımlar:** Kiradaki evler (§4.8) ve tek bir "Yatırım Hesabı": güvenli / orta / riskli vadeler (risk anları). Ayrı emlak listesi ve borsa yok.
- **Lüks oyuncakların sahnede gösterimi:** Jet gökyüzünden geçer, yat sadece sahil evlerinde görünür.
- **Günlük döngü:** Gelire oranlı günlük ödül ve günlük görevler.

## 8. Açık sorular

- Yöneticisiz işletmeye dokunma mekaniği: AdCap modeli ("Çalıştır" → tek döngü). "Dokundukça hızlanır" alternatifi oyun testinden sonra yeniden değerlendirilecek.
- Yaş ve ömür: kurallar §4.9'da; kalan ayrıntılar (ömür sonu uyarısı, yaşlanan görünüm) discussion-notes §3.
- Ekonomi hızı ve çevrimdışı ödül: kullanıcı gerçek oynanışta fazla buluyor (discussion-notes §5).
- İlerleme hissi ve yaş temposu: discussion-notes §8.

## 9. Rapordan sapmalar

[report-v2.md](./report-v2.md) büyük çoğunlukla uygulanıyor. Bilinçli olarak farklı yapılanlar:

| Konu | Rapor | v2 kararı | Gerekçe |
| --- | --- | --- | --- |
| Miras formülü | Karekök: √(kazanç / sabit) | Küpkök, puan başı +%1 (§4.5) | Simülasyonda karekök kartopu yaptı (§6.5) |
| Sınıf eşiği | Net servet | Nesil kazancı, harcayınca düşmez (§4.1) | Alışveriş yapan oyuncu sınıf kaybetmesin |
| İlk "en zengin" | 2–3 hafta (2–4 nesil) | Tek ömürde, 14–21. gün (§5) | Simülasyon temposu; uzun vade için Faz 2'de nesil içeriği |
| Konut | Tek ev kavramı | Kirala → satın al → kiraya ver; ev bonusu yaşanan evin kademesinden (§4.8) | Erken oyunda ev almak zor; kiralamak ilerleme hissi, satın almak kira geliri verir (karar 2026-10-07) |
| Hanedan zamanlaması | Emeklilik → varis sık ve erken | Hikâye tek kahramanın hayatında biter; varis ömür sonunda (80 yaş) devralır (karar 2026-10-08, §4.9) | Hikâyenin sonu (Milyarder, En Zengin) erken emeklilikte hiç görülmüyordu |
| Sağlık / mutluluk | Tek "Yaşam Kalitesi" göstergesi, gelire çarpan | Tamamen kaldırılır | Statü eşyaları "hayatın iyileşiyor" hissini zaten veriyor; ayrı gösterge angarya riski (karar 2026-10-07) |
| Dokunarak kazanma | "Dokun" düğmesi, ilk 30 sn şişe toplama | Ayrı düğme yok; şişe/kutu sahnede, her biri ~2,5 sn gelir, Orta Sınıf'ta biter ve yerini olay kartları alır; Şans ara sıra cüzdan getirir (§4.7) | Toplamaya değmesi için (kullanıcı); sahnede canlılık |
| Monetizasyon | "Altın Kaşık" paketi, gem | Rahat Paket (reklamsız), Şans'ın Altın Tasması (kalıcı ×2), lansmanda gem yok ([monetization-v2.md](./monetization-v2.md)) | "Altın Kaşık" sıfırdan yükselen kahramanın tonuyla çelişiyor; sadelik (karar 2026-10-08) |
| Görseller ve karakter animasyonu | Mevcut ~290 görsel ve animasyon boru hattı korunur | Görsel roman: tutarlı durağan pozlar, ifade portreleri, konuşma balonları; kahraman seti küçük ve yeniden üretilir; diğer görseller seçerek kullanılır | Mevcut 20 kıyafette poz aynı, üst kıyafetler ayırt edilmiyor; kodla zıplatma yapay duruyor (karar 2026-10-08, [story-v2.md §8](./story-v2.md)) |

Kullanıcı kararı bekleyen çelişkiler: [discussion-notes.md](./discussion-notes.md).
