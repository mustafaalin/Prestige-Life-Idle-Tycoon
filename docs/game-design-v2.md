# Prestige Life v2 — Oyun Tasarım Belgesi

Son güncelleme: 2026-10-08 · Durum: Faz 1A bitti; sahne, toplama, Şans'ın bulduğu, aylık gelir, işletme yükseltmeleri ve hedefler eklendi; erken tempo yeniden dengelendi, işletme ana gelir (2026-10-08). Reklam/IAP kuralları: [monetization-v2.md](./monetization-v2.md)

Bu belge v2'nin tek doğruluk kaynağıdır. Gerekçesi [report-v2.md](./report-v2.md); rapordan sapmalar §9'da. Sayısal değerler kodda `src/game/core/config/` altında durur; buradaki tablolar `npm run sim -- --config` çıktısından alınmıştır. Değer değiştirince önce simülatörü çalıştır, sonra bu belgeyi güncelle.

## 1. Vaat

**"Sokaktan dünyanın en zenginine, tek bir ömürde; sonra hikâye çocuğunla sürer."**

- AdVenture Capitalist tarzı üstel idle ekonomi (sayılar her zaman akar, büyük basamaklar "vay" anıdır)
- 7 basamaklı, törenli sınıf merdiveni (her basamakta sahne, ev, araç, kıyafet değişir)
- Bir ömür: kahraman 17 yaşında başlar, yaş sadece oyun açıkken ilerler (1 dk = 1 ay). 97 yaşında emekli olur ve varis miras çarpanıyla devralır; erken emeklilik yok (§4.9)
- BitLife tadında olay kartları (Faz 2)

Hikaye, karakterler ve ton: [story-v2.md](./story-v2.md) (kahraman + köpeği Şans, Rıza Amca, annesine verilen söz).

## 2. Üç iç içe döngü

| Döngü | Süre | Oyuncu ne yapar | Sistemler |
| --- | --- | --- | --- |
| Anlık | saniyeler | Para akar; şişe toplar, işletme alır, yönetici atar | İşletmeler, yöneticiler, kilometre taşı çarpanları, sahnede toplama, Şans'ın bulduğu |
| Hayat | günler | Terfi alır, hayallerini satın alır, sınıf atlar | Kariyer, statü eşyaları, sınıf töreni, çevrimdışı kazanç, (olay kartları — Faz 2) |
| Ömür ve hanedan | haftalar | Bir ömür boyunca sınıf atlar; ömür sonunda emekli olur, varis mirasla başlar | Yaş, miras puanı, (yadigarlar, nesil içeriği — Faz 2) |

## 3. Kaynaklar

| Kaynak | Ne işe yarar | Sıfırlanır mı (emeklilikte) |
| --- | --- | --- |
| Nakit ($) | Her şeyi satın alır | Evet |
| Nesil kazancı | Sınıfı belirler; harcayınca düşmez | Evet |
| Toplam kazanç | Miras puanını belirler | Hayır |
| Miras puanı | Her puan tüm gelire +%1 | Hayır |
| Yaş | Ömrün ne kadarının geçtiği; 97'de emeklilik | Evet (varis 17'den başlar) |

## 4. Sistemler

### 4.1 Sınıf merdiveni (`config/classes.ts`)

| # | Sınıf | Eşik (nesil kazancı) | Kahramanın yaşı (engaged bot) |
| --- | --- | --- | --- |
| 0 | Living on the Street | 0 | 17 |
| 1 | Day Laborer | 1K | 17 |
| 2 | Working Class | 100K | 18 |
| 3 | Middle Class (Orta Sınıf) | 1M | 19 |
| 4 | Millionaire (Milyoner) | 10M | 20 |
| 5 | Billionaire | 1B | 24 |
| 6 | Multibillionaire (Multimilyarder) | 100B | 41 |
| 7 | Richest Person Alive | 1T | 54 |

Multibillionaire 2026-10-08'de eklendi: Milyarder → En Zengin arasındaki 25 yıllık boşluğa bir hikâye anı koymak için.

**Orta Sınıf (karar 2026-10-08, kullanıcı):** Multimilyoner kalktı, İşçi ile Milyoner arasına Orta Sınıf ($1M) girdi; Milyoner $1M'dan $10M'a çıktı. Neden: İşçi'den (kas gücüyle maaşlı iş) Milyoner'e geçiş çok büyük bir sıçrama gibi duruyordu; Milyoner artık gerçekten milyonlar demek. Gerçek dünya: milyoner net servet ≥ $1M (dünyada ~57,5 milyon kişi, çoğunun en büyük varlığı evi; UBS 2026), milyarder ≥ $1B (Forbes 2026: 3.428 kişi), $100B üstü ~15–20 kişi, dünyanın en zengini ~$0,84–0,9T. Oyunda eşik "nesil kazancı"dır, eldeki para değil. Orta Sınıf ilk oturumun zirvesini (30. dk) tutar; Milyoner dönüş oturumunun açılışında gelir ("geri gel" nedeni). Çevrimdışı tavan sınıf sırasına bağlı kaldı (Orta Sınıf 1 sa, Milyoner ve üstü 2 sa).

Sınıf, harcanan paradan bağımsızdır (kazanılan toplam). Oyuncu alışveriş yaptığı için asla sınıf kaybetmez.

### 4.2 İşletmeler (`config/businesses.ts`)

AdVenture Capitalist modeli: her işletme adet adet alınır, her birim bir üretim döngüsünde gelir getirir.

- Birim fiyatı: `baseCost × costGrowth^sahipOlunan`
- Gelir/sn: `baseRevenue × adet × kilometreTaşıÇarpanı / cycleSeconds × globalÇarpan`
- Kilometre taşları: 10, 25, 50, 100, 200, 300 adette kâr ×2
- Yöneticisiz işletme sadece oyuncu açıkken ve "Çalıştır"a dokununca tek döngü çalışır, çevrimdışı üretmez (simülatör bunu %60 verimle yaklaşık modeller)
- Yönetici: tek seferlik, işletmeyi otomatik ve çevrimdışı çalıştırır. Her işletmenin kendi yönetici karakteri var (story-v2 §3)
- Ekranda gelir aylık gösterilir: $/ay = $/sn × 60 (1 dk = 1 oyun ayı). Para yine saniye saniye artar; işletme kartındaki çubuk tur başına geliri gösterir

Değerler 6 düğmeden üretilir (`BUSINESS_TUNING`): ilk fiyat $25, kademe fiyat adımı ×15, ilk döngü 4 sn (her kademede ×2), ilk geri dönüş 270 sn, geri dönüş adımı ×3,3, yönetici = ilk birim × 12. Kademe başına gelir çarpanı (`revenueFactor`): Çiçek Tezgâhı ×2,7 (kendini 100 sn'de öder) ve Kahve Arabası ×1,2 (erken oyunda işletme, şişe ve maaştan iyi yatırım olsun), Mini Market ×0,7, Beauty Salon ×0,6 (orta oyun yavaş), Logistics ×2, Factory / Hotel / Tech ×2,5 (geç oyun hızlı).

**İşletme ana gelirdir (karar 2026-10-08):** Erken tempo önce tüm işletme gelirini 7,5'e bölerek yavaşlatılmıştı; Çiçek Tezgâhı turda $0,01 veriyor, iş ondan 15 kat iyi yatırım oluyordu (kullanıcı: "Çalıştır'a basınca sıfır gelir oluyor"). Şimdi her tur en az $1 öder, tempo kazançtan değil fiyatlardan gelir: birim pahalanması (Çiçek Tezgâhı ×1,15), 2. ve 3. yükseltmenin fiyatı ve daha düşük maaşlar (§4.3). AdVenture Capitalist'te de limonata standı kendini 2 sn'de öder; yavaşlık birim fiyatlarından gelir. Simülatör bunu "his" kontrolleriyle bekler (§5).

| İşletme | İlk birim | Büyüme | Döngü | Tur başına | İlk birim geri dönüşü | Yönetici |
| --- | --- | --- | --- | --- | --- | --- |
| Flower Stand | $25 | ×1.15 | 4 sn | $1 | 1 dk 40 sn | $300 |
| Coffee Cart | $375 | ×1.15 | 8 sn | $4 | 12 dk 23 sn | $4.5K |
| Bakery | $5.63K | ×1.14 | 16 sn | $30 | 49 dk | $67.6K |
| Car Wash | $84.4K | ×1.13 | 32 sn | $278 | 2 sa 41 dk | $1.01M |
| Mini Market | $1.27M | ×1.12 | 64 sn | $1.78K | 12 sa 41 dk | $15.2M |
| Beauty Salon | $19.0M | ×1.11 | 128 sn | $13.8K | 2 g | $228M |
| Logistics Warehouse | $285M | ×1.10 | 256 sn | $418K | 2 g | $3.42B |
| Factory | $4.27B | ×1.09 | 512 sn | $4.75M | 5 g 7 sa | $51.2B |
| Hotel Chain | $64.1B | ×1.09 | 1024 sn | $43.2M | 17 g 14 sa | $769B |
| Tech Startup | $961B | ×1.09 | 2048 sn | $393M | 58 g | $11.5T |

**Yükseltmeler (`config/upgrades.ts`, karar 2026-10-08):** Her işletmeye sırayla alınan 3 tek seferlik yükseltme, her biri o işletmenin kârı ×2 (toplam ×8). 5 / 15 / 35 adette açılır; fiyat ilk birimin ×6 / ×3.000 / ×120.000'i (Çiçek Tezgâhı: Tente $150, Renkli saksılar $75K, Çiçek kamyoneti $3M). İlki ucuz, açıldığı anda yaklaşık bir dakikalık gelir; sonrakiler orta oyunun temposunu tutar. Adet, yükseltme ve yönetici arasında gerçek bir seçim yaratır (AdVenture Capitalist'in nakit yükseltmeleri). Adları i18n `upgrades`.

### 4.3 Kariyer (`config/careers.ts`)

Tek iş, para ile terfi. Maaş online ve offline otomatik gelir. Her terfi o nesil boyunca tüm gelire kalıcı bonus ekler. Rol: yan gelir; erken oyunda maaş, geç oyunda gelir bonusu. İlk işin maaşı kendini 90 sn'de öder (önce 30 sn; işletmeden iyi yatırımdı, 2026-10-08). Tek ömür temposu için (`salaryFactor` / `costFactor`, 2026-10-08): orta kariyer maaşları düşük (Sales ×0,5 → Software Engineer ×0,25), üst işler ucuz (Team Leader ×0,8, Director ×0,6, CEO ×0,5 fiyat; CEO maaşı ×1,5).

| Meslek | Fiyat | Maaş/sn | Gelir bonusu |
| --- | --- | --- | --- |
| Flyer Distributor | $10 | $0.1 | +5% |
| Dishwasher | $90 | $0.5 | +5% |
| Cashier | $810 | $1.9 | +5% |
| Waiter | $7.29K | $7.6 | +5% |
| Delivery Driver | $65.6K | $31 | +10% |
| Sales Representative | $590K | $63 | +10% |
| IT Support | $5.31M | $182 | +10% |
| Web Developer | $47.8M | $532 | +10% |
| Software Engineer | $430M | $2.18K | +15% |
| Team Leader | $3.10B | $17.8K | +15% |
| Director | $20.9B | $146K | +20% |
| CEO | $157B | $896K | +25% |

### 4.4 Statü eşyaları (`config/lifestyle.ts`)

Araç, kıyafet ve lüks oyuncaklar **gider değildir**; her biri tüm gelire kalıcı bonus verir. Evler ayrı bir modeldir (§4.8). Alışveriş = güçlenme. Fiyatlar geometrik büyür, böylece her sonraki "hayal" birkaç dakika ile birkaç saatlik gelir uzağında durur.

| Tür | Adet | İlk fiyat → büyüme | Bonus (her biri) | Görsel |
| --- | --- | --- | --- | --- |
| Ev | 25 (1. bedava) | Taşınma bedeli $200 → ×2.75 | Yaşanan evin kademesi: +%5 × (n−1) | `houses/backgrounds/house-N.webp` (kirala / satın al / kiraya ver: §4.8) |
| Kara aracı | 16 (1. bedava) | $20 → ×3.3 | +3% | `vehicles/vehicle-N.png` |
| Kıyafet | 20 (1. bedava) | $30 → ×3 | +2% | `outfits/ch-N-1.png` |
| Lüks oyuncak | 4 (tekne, yat, helikopter, jet) | $5B, $50B, $200B, $1T | +10% | `vehicles/vehicle-17..20.png` |

En iyi evde yaşanıp tüm eşyalar alındığında statü toplamı +%243 (×3,4).

### 4.5 Hanedan / miras (`config/economy.ts`)

- Emeklilik sadece ömrün sonunda (97 yaş, §4.9); oyuncu erken emekli olamaz
- Ailenin toplam miras puanı: `floor(10 × (toplamKazanç / 1M)^(1/3))`
- Emeklilikte kazanılan = toplam puan − eldeki puan
- Her puan: tüm gelire +%1
- Küpkök bilinçli seçildi: mirası ikiye katlamak 8 kat kazanç ister ve resetler kartopu yapmaz (bkz. §6)

### 4.6 Çevrimdışı kazanç

- Sadece yöneticili işletmeler, maaş ve kira çevrimdışı üretir
- Oran %50. **Tavan sınıfla büyür (karar 2026-10-08):** Sokakta 10 dk, Gündelikçi 15 dk, İşçi 30 dk, Orta Sınıf 1 sa, Milyoner ve üstü 2 sa (`OFFLINE_CAP_HOURS_BY_CLASS`). Neden: sabit 2 saatte 3 dk oynayıp 1 sa uzak kalan oyuncu $285 nakde karşı $106K buluyordu; şimdi ~$27K. Örnek: Egg, Inc. siloları (çevrimdışı süre bir ilerleme sistemi). Karşılama kartında tavan yazar. 4–8 saat tavan tartışması sürüyor (discussion-notes §5).
- Reklamla ×2; "Gece Vardiyası Ekibi" IAP'ı oranı %100'e çıkarır ve tavanı +2 saat uzatır ([monetization-v2.md](./monetization-v2.md)). Kullanıcı erken oyunda çevrimdışı ödülü hâlâ fazla buluyor; ekonomi ayarında tekrar ele alınacak (discussion-notes §5)

### 4.7 Tıklama: sahnede toplama (karar 2026-10-08)

Şişe başına `2 × mirasÇarpanı + aktifGelir/sn × 2,5` (karar 2026-10-08): bir şişe ~2,5 saniyelik gelir eder, yoksa toplamaya değmez (kullanıcı: $31/sn gelirde $2,6'lık şişe anlamsız).

Ayrı bir "dokun" düğmesi yok: ara sokakta şişe ve kutular belirir (`config/scene.ts`). Ekranda en fazla 4 nesne, sahne dolu başlar, 2,5 sn'de bir yenisi; durmadan toplayan oyuncu gelirini ~2 katına çıkarır. Simülatör: ilk 3 dk her şişe (0,4/sn), sonra ara sıra (0,15/sn ≈ +%40). Hedefler tutuyor.

**Şans'ın bulduğu (karar 2026-10-08):** Oyun açıkken 5–10 dakikada bir Şans ağzında bir cüzdanla gelir, 12 sn bekler. Dokununca ödül kartı açılır: cüzdan sahibine verilir, teşekkür ödülü 15 şişe değerinde (`FETCH_BOTTLES`, ~37 sn gelir). "Topla" ile alınır, paralar bakiyeye uçar. Şans'a dokunmak para vermez (okşama pozu, kalp). Simülatörde yakalama oranı bağlı oyuncuda %80, gündelik oyuncuda %50.

### 4.10 Hedefler (`config/quests.ts`, karar 2026-10-08)

Egg, Inc.'in 3 görevi gibi: ana ekranın sol üstünde "Hedefler" kartı, aynı anda 3 hedef (biten öne çıkar, "Ödülü al"). İlk saat için 25 yazılı hedef (5 şişe topla → Çiçek Tezgâhı aç → işe gir → Tente → ... → Orta Sınıf ol); bitince işletmelerin sıradaki kilometre taşından üretilen hedefler gelir. Ödül `max(küçük sabit, aktif gelir × 15 sn)`, üretilenlerde 20 sn. Ödüller bilinçli küçük: 45 sn'lik ödülde bot "al → hedef biter → ödülle yine al" zincirine girip ilk saati 2 dakikada bitirdi. Sayaçlar: toplanan şişe ve sahibine verilen cüzdan (`bottles`, `finds`). Hedefler aynı zamanda ilk dakikaların rehberi (plan 1.12).

**Hedef kartı (2026-10-08, kullanıcı: "bazı görevlerin ne olduğu ve nereden yapılacağı anlaşılmıyor"):** Her hedefte resim (işletme, yönetici portresi, iş, ev, araç, şişe, Şans), nerede yapıldığı ("İşletmeler", "Alışveriş › Evler"; sokaktakilerde ipucu: "Sokaktaki şişe ve kutulara dokun", "Şans bir şey getirince ona dokun") ve "Git" düğmesi var. "Git" ilgili sekmeyi (ve Alışveriş'in alt sekmesini) açar, gereken düğmeye kaydırır, düğme 5 sn parlar ve üstünde el işareti durur (`ui/home/focus.ts`, `Focusable.tsx`). Sekme açıkken üstte ince bir hedef şeridi kalır: biten hedef, "Git" denen hedef ya da o sekmede yapılabilecek hedef; ödül oradan da alınır. Araç hedefi sadece satın alınan araçları sayar (başlangıç el arabası sayılmaz; önce "1/2" görünüyordu).

### 4.8 Konut modeli: kirala → satın al → kiraya ver (`config/housing.ts`, Faz 1.17)

Tek ev kavramı (rapor §5). Oyuncu her zaman tek bir evde yaşar; sahnede o ev görünür. Erken oyunda ev almak zor olduğu için önce kiralayarak ilerler, sonra satın alır, taşındığı kendi evleri kira getirir.

| Eylem | Bedel | Ne olur |
| --- | --- | --- |
| **Kirala ve taşın** | Tek seferlik taşınma bedeli (depozito + ilk kira). Sadece bir üst kademedeki ev. | O eve taşınırsın. Eski kiran biter (aynı anda tek kiralık ev). |
| **Satın al** | Fiyat = taşınma bedeli × 25. İçinde kiracı olduğun evi alırken ödediğin taşınma bedeli düşülür. | Bir üst kademedeki evi alırsan taşınırsın. Yaşadığın evden daha alttaki bir evi alırsan kiraya verilir. |
| **Kiraya ver** | Kendiliğinden | Sahip olunan ama içinde yaşanmayan her ev kira getirir; çevrimdışı da işler (yönetici kuralıyla: %50, 2 saat tavan). |
| **Taşın** | Ücretsiz | Sahip olduğun herhangi bir eve taşınabilirsin. Kiradaysan kiran biter. |

- **Düzenli kira gideri yok** (karar 2026-10-07). Net gelir hiçbir zaman eksiye düşmez. Kiracı olduğun "Kiracısın" etiketi ve taşınma bedeliyle hissettirilir.
- **Taşınma bedeli:** Evin değerine bağlı sabit bir tutardır; karta yazılır, oyuncunun gelirine göre değişmez. 2. ev $200, sonraki her ev ×2,75 (eski satın alma eğrisi; erken tempo bu yüzden değişmedi). Satın alma fiyatı bedelin 25 katı, yani bedel fiyatın %4'ü. Böylece oyuncu, alabildiği evden yaklaşık 3 kademe üstünü kiralayabilir. 10. ev: kiralamak $654K, satın almak ~$16,4M (karar 2026-10-07, seçenek B; oyun testinden sonra tekrar bakılacak).
- **Sadece kiralık evler:** 1–9 arası (çadırdan kiralık dairelere). Satın alma 10. evden ("İlk Kendi Müstakil Evin") itibaren açılır; ilk kendi ev bir dönüm noktasıdır.
- **Ev bonusu:** Yaşadığın evin kademesine bağlı: n. ev tüm gelire +%5 × (n−1) verir (9. ev +%40, 25. ev +%120). Kiralık da olsa sahip olunan da olsa aynı. Sahip olunan evler bonus biriktirmez; onların ödülü kira geliridir.
- **Kira geliri:** Taban kira/sn = fiyat / geri dönüş süresi. Geri dönüş, işletmelerdeki gibi fiyatla büyür: saat = 1 × (fiyat / $1M)^0,44 (10. ev ~3,4 sa, 15. ev ~32 sa). Tüm gelir çarpanları kiraya da uygulanır. Simülasyonda kira gelirin medyan ~%8'i, nesil sonunda en fazla ~%25'i: işletmelerle yarışmıyor ama görünür.
- **Nesil:** Emeklilikte evler sıfırlanır; varis çadırdan başlar (2. nesil açılışı Faz 2.1'de tartışılacak: [discussion-notes.md](./discussion-notes.md) §4).
- Hikaye bağı: sokak (çadır) → Gündelikçi kiralık oda → İşçi Sınıfı ilk kiralık daire → ilk kendi evin → Orta Sınıf: annene eski aile evi ([story-v2.md](./story-v2.md) §4).

### 4.9 Yaş ve ömür (`config/life.ts`, karar 2026-10-08)

| Kural | Değer |
| --- | --- |
| Başlangıç yaşı | 17 (varis de 17'den başlar) |
| Emeklilik yaşı | 97 (80 yıl) |
| Oyun ayı | 1 dakika oyun = 1 ay; 12 dakika = 1 yaş; bir ömür ≈ 16 saat oyun |
| Yaş ne zaman ilerler | Sadece oyun açıkken. Uzaktayken para birikir ama yaşlanmazsın. 10 sn'den uzun boşluk çevrimdışı sayılır |
| Ömür sonu | "Bir ömür tamamlandı" ekranı → Emekli ol ve devret. Ölüm gösterilmez; vakıf töreni 2.1'de |
| Gösterim | Üst barda "24 yaş" |

- Sahne ve törenler (1.10, 1.18) gelince tam ekran hikâye anlarında yaş durur.
- En Zengin'den sonraki yıllar için içerik şimdilik yok (kullanıcı kararı: sonra bakılacak). Engaged bot En Zengin'e 45, casual 38 yaşında ulaşıyor.

## 5. Tempo hedefleri ve simülasyon sonuçları

`npm run sim` iki oyuncu profilini 30 gün oynatır:

- **Engaged:** 1. gün 30 + 10 + 7 dk, sonraki günler 6 × 7 dk. GameAnalytics'teki ilk %10 idle oyuncuya yakın.
- **Casual:** 1. gün 20 + 5 dk, sonraki günler 3 × 5 dk.

Bot her an en kısa sürede kendini ödeyen alımı yapar, yani optimal oynar. Gerçek oyuncuların ~1,3–1,8 kat yavaş olduğu tahmin, ölçülmüş değil. Bot yöneticisiz işletmeleri %60 verimle çalıştırıyor sayar; gerçek oyunda sadece başlatılan döngü ödenir (sınırlar: discussion-notes §6). Şişe toplama ve Şans'ın bulduğu simülatörde modelli (§4.7).

Olay saatleri 2026-10-08'de düzeltildi: çevrimdışı kazançla gelen olaylar artık dönüş oturumuna yazılıyor. Casual oyuncu Orta Sınıf'ı ilk oturumda değil, 22:00 dönüşünde görüyor.

Güncel sonuç (2026-10-08, işletme ana gelir + yükseltmeler + hedefler + Orta Sınıf):

| Kilometre taşı | Hedef (bot) | Engaged bot | Casual bot |
| --- | --- | --- | --- |
| İlk satın alma | ≤ 1 dk oyun | 12 sn | 12 sn |
| İlk işletme | ≤ 2 dk oyun | 35 sn | 35 sn |
| İlk yönetici | 2–6 dk oyun | 4 dk 27 sn | 4 dk 33 sn |
| Gündelikçi | 3–5 dk oyun | 4 dk 27 sn | 4 dk 33 sn |
| İşçi Sınıfı | 15–20 dk oyun | 15 dk 30 sn | 14 dk 49 sn |
| Orta Sınıf (1. nesil) | 25–50 dk oyun | 30 dk, ilk oturumun sonunda (19 yaş) | 23 dk, 22:00 dönüşünde (18 yaş) |
| Milyoner (1. nesil) | 35 dk – 1 sa 15 dk oyun (dönüş oturumu) | 40 dk, 1. gün 23:00 dönüşünde (20 yaş) | 30 dk, 2. gün 13:00 (19 yaş) |
| İlk milyarder | 3–6. gün | 3. gün (24 yaş) | 5. gün (22 yaş) |
| İlk multimilyarder | 6–11. gün | 7. gün (41 yaş) | 14. gün (34 yaş) |
| İlk "en zengin" | 7–17. gün | 11. gün (54 yaş) | 22. gün (44 yaş) |
| İlk ömür sonu (97 yaş) | 15–36. gün | 23. gün (16 sa oyun) | 30 günde gelmiyor |

**His kontrolleri (2026-10-08, `checkFeel`):** Tempo hedefleri tutarken işletmeler yan gelire düşebiliyordu (önceki ayarda Gündelikçi anında işletme payı %3'tü). Simülatör artık şunları da bekler: her işletmenin ilk biriminin turu ≥ $1; işletmelerin gelirdeki payı (şişeler hariç) Gündelikçi anında, ilk oturumun sonunda ve 1. nesil oturumlarının ortancasında ≥ %50. Şu an: tur en az $1, pay %93 / %95 / %74. `npm run sim -- --purchases` her alımı zaman çizelgesinde gösterir.

Engaged oyuncunun ilk dakikaları: şişe → broşür işi (12 sn) → Çiçek Tezgâhı (35 sn) → 10 tezgâh ve Tente (4 dk) → yönetici (4,5 dk) → Kahve Arabası (11 dk). İlk oturum Orta Sınıf'a sınırda ulaşır (30. dk); casual oyuncu dönüşünde görür. Sınıf çubuğu karekök ölçeğinde çizilir (`classProgress`): düz oranla dakikalarca %0'da durup sonra fırlıyordu.

- Milyoner → Milyarder (20 → 24 yaş): orta oyunda gelir çevrimdışı ağırlıklı. Daha fazla yavaşlatmak kariyer ve işletmelerde büyük kesinti istiyor; Milyarder 24 yaşta kabul edildi.
- Varis çok hızlı: 1. ömür ~3.000 miras puanı (×31 gelir) bırakıyor; 2. nesil Milyoner ve üstüne dakikalar içinde ulaşıyor. Faz 2.1'de miras formülü ve 2. nesil içeriğiyle birlikte ele alınacak.

## 6. Simülasyondan öğrenilenler

1. **Kariyer maaşı kartopu yapıyordu.** Terfi başına maaş ×6 büyüyünce CEO maaşı tüm işletmeleri geçti. Çözüm: maaşın geri dönüş süresi her terfide ×2,2 uzar; geç terfiler maaş için değil bonus için alınır.
2. **Çarpanlar geri dönüş süresini böler.** Toplam ×30'luk bir çarpan, 1 saatlik geri dönüşü 2 dakikaya indirir. Üst kademelerin taban geri dönüşü bu yüzden çok uzun (günler); oyuncu bunu çarpanlarla kısaltır.
3. **Çevrimdışı toplu para gelir patlaması yapar.** 4 saatlik tavanla tek bir arada gelir 50 katına çıkıyordu; tavan 2 saate indi. Erken oyunda 2 saat bile fazlaydı (3 dk oynayıp 1 sa uzak kalan $106K buluyordu); tavan artık sınıfla büyüyor (10 dk → 2 sa, §4.6).
4. **Statü eşyaları ucuz ve güçlüydü.** 30 dakikada +%185 gelir veriyordu. Bonuslar küçültüldü (+%5 / +%3 / +%2 / +%10).
5. **Karekök mirası kontrolden çıkıyordu.** Küpköke geçildi, puan başı bonus %2'den %1'e indi.
6. **Tempo hedefleri hissi garanti etmez.** Yavaşlatma tüm işletme gelirini bölünce sınıflar yine zamanında geldi ama Çiçek Tezgâhı turda $0,01 verdi ve oyunu maaş taşıdı. Yavaşlatma kazançtan değil fiyatlardan yapılır; his kontrolleri (§5) bunu bekler.
7. **6. nesilden sonra "en zengin" birkaç dakikada geliyor.** Mevcut içerik ~2–3 haftalık. Uzun vadeli tutma için Faz 2'de her nesle yeni içerik gerekli (§7).

## 7. Faz 2'ye bırakılan tasarım kararları

- **Nesil içeriği:** Her yeni nesil yeni bir şey açmalı. Seçenekler: yeni şehir ve yeni işletme kademeleri (40 işletme görselinin 30'u hâlâ kullanılmıyor), yadigarlar (miras puanıyla alınan kalıcı yetenekler), yeni sınıflar ("Old Money Dynasty" vb.).
- **Olay kartları:** Günde 3–5 kart, sınıfa göre değişen 60+ kart.
- **Yatırımlar:** Kiradaki evler (§4.8) ve tek bir "Yatırım Hesabı": güvenli / orta / riskli vadeler (risk anları). Ayrı emlak listesi ve borsa yok.
- **Görevler:** "Sıradaki 3 hedef" görev zinciri yön gösterir; ödülü gelire oranlı para veya hızlandırıcı. Lansmanda premium para birimi (gem) yok ([monetization-v2.md](./monetization-v2.md)).
- **Lüks oyuncakların sahnede gösterimi:** Jet gökyüzünden geçer, yat sadece sahil evlerinde görünür.
- **Günlük döngü:** Gelire oranlı günlük ödül ve günlük görevler.

## 8. Açık sorular

- Ekranda gelir: üst bar ve "~X sonra alabilirsin" tahminleri sadece otomatik geliri (yönetici, maaş, kira) kullanır; dokunarak çalıştırılan işletmeler sayılmaz (2026-10-08).
- Yöneticisiz işletmeye dokunma mekaniği: AdCap modeli ("Çalıştır" → tek döngü). "Dokundukça hızlanır" alternatifi oyun testinden sonra yeniden değerlendirilecek.
- Yaş ve ömür: kurallar §4.9'da; kalan ayrıntılar (törende yaşın durması, ömür sonu uyarısı) discussion-notes §3.
- Ekonomi hızı, çevrimdışı ödül ve ev bonusları: kullanıcı gerçek oynanışta fazla buluyor (discussion-notes §5).

## 9. Rapordan sapmalar

[report-v2.md](./report-v2.md) büyük çoğunlukla uygulanıyor. Bilinçli olarak farklı yapılanlar:

| Konu | Rapor | v2 kararı | Gerekçe |
| --- | --- | --- | --- |
| Miras formülü | Karekök: √(kazanç / sabit) | Küpkök, puan başı +%1 (§4.5) | Simülasyonda karekök kartopu yaptı (§6.5) |
| Sınıf eşiği | Net servet | Nesil kazancı, harcayınca düşmez (§4.1) | Alışveriş yapan oyuncu sınıf kaybetmesin |
| İlk "en zengin" | 2–3 hafta (2–4 nesil) | 7–16. gün (§5) | Simülasyon temposu; uzun vade için Faz 2'de nesil içeriği |
| Konut | Tek ev kavramı | Kirala → satın al → kiraya ver; ev bonusu yaşanan evin kademesinden (§4.8) | Erken oyunda ev almak zor; kiralamak ilerleme hissi, satın almak kira geliri verir (karar 2026-10-07) |
| Hanedan zamanlaması | Emeklilik → varis sık ve erken | Hikâye tek kahramanın hayatında biter; varis ömür sonunda (97 yaş) devralır (karar 2026-10-08, §4.9) | Hikâyenin sonu (Milyarder, En Zengin) erken emeklilikte hiç görülmüyordu |
| Sağlık / mutluluk | Tek "Yaşam Kalitesi" göstergesi, gelire çarpan | Tamamen kaldırılır | Statü eşyaları "hayatın iyileşiyor" hissini zaten veriyor; ayrı gösterge angarya riski (karar 2026-10-07) |
| Dokunarak kazanma | "Dokun" düğmesi, ilk 30 sn şişe toplama | Ayrı düğme yok; şişe/kutu sahnede, her biri ~2,5 sn gelir; Şans ara sıra cüzdan getirir (§4.7) | Toplamaya değmesi için (kullanıcı); sahnede canlılık |
| Monetizasyon | "Altın Kaşık" paketi, gem | Rahat Paket (reklamsız), Şans'ın Altın Tasması (kalıcı ×2), lansmanda gem yok ([monetization-v2.md](./monetization-v2.md)) | "Altın Kaşık" sıfırdan yükselen kahramanın tonuyla çelişiyor; sadelik (karar 2026-10-08) |
| Görseller ve karakter animasyonu | Mevcut ~290 görsel ve animasyon boru hattı korunur | Görsel roman: tutarlı durağan pozlar, ifade portreleri, konuşma balonları; kahraman seti küçük ve yeniden üretilir; diğer görseller seçerek kullanılır | Mevcut 20 kıyafette poz aynı, üst kıyafetler ayırt edilmiyor; kodla zıplatma yapay duruyor (karar 2026-10-08, [story-v2.md §8](./story-v2.md)) |

Kullanıcı kararı bekleyen çelişkiler: [discussion-notes.md](./discussion-notes.md).
