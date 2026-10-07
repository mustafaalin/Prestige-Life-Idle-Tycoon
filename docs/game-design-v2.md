# Prestige Life v2 — Oyun Tasarım Belgesi

Son güncelleme: 2026-10-08 · Durum: Faz 1A bitti; yaş ve ömür modeli eklendi (§4.9)

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
| Anlık | saniyeler | Para akar; işletme alır, yükseltir, yönetici atar | İşletmeler, yöneticiler, kilometre taşı çarpanları, tıklama |
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
| Gem | Premium hızlandırma, kozmetik | Hayır |

## 4. Sistemler

### 4.1 Sınıf merdiveni (`config/classes.ts`)

| # | Sınıf | Eşik (nesil kazancı) |
| --- | --- | --- |
| 0 | Living on the Street | 0 |
| 1 | Day Laborer | 1K |
| 2 | Working Class | 100K |
| 3 | Millionaire | 1M |
| 4 | Multimillionaire | 100M |
| 5 | Billionaire | 1B |
| 6 | Richest Person Alive | 1T |

Sınıf, harcanan paradan bağımsızdır (kazanılan toplam). Oyuncu alışveriş yaptığı için asla sınıf kaybetmez.

### 4.2 İşletmeler (`config/businesses.ts`)

AdVenture Capitalist modeli: her işletme adet adet alınır, her birim bir üretim döngüsünde gelir getirir.

- Birim fiyatı: `baseCost × costGrowth^sahipOlunan`
- Gelir/sn: `baseRevenue × adet × kilometreTaşıÇarpanı / cycleSeconds × globalÇarpan`
- Kilometre taşları: 10, 25, 50, 100, 200, 300 adette kâr ×2
- Yöneticisiz işletme sadece oyuncu açıkken ve dokunarak çalışır (aktif verim %60), çevrimdışı üretmez
- Yönetici: tek seferlik, işletmeyi otomatik ve çevrimdışı çalıştırır

Değerler 6 düğmeden üretilir (`BUSINESS_TUNING`): ilk fiyat 4, kademe fiyat adımı ×15, ilk geri dönüş 36 sn, geri dönüş adımı ×3,3, yönetici = ilk birim × 250.

| İşletme | İlk birim | Büyüme | Döngü | İlk birim geri dönüşü | Yönetici |
| --- | --- | --- | --- | --- | --- |
| Flower Stand | $4 | ×1.07 | 1 sn | 36 sn | $1K |
| Coffee Cart | $60 | ×1.15 | 2 sn | 2 dk | $15K |
| Bakery | $900 | ×1.14 | 4 sn | 6,5 dk | $225K |
| Car Wash | $13.5K | ×1.13 | 8 sn | 21,5 dk | $3.38M |
| Mini Market | $203K | ×1.12 | 16 sn | 1 sa 11 dk | $50.8M |
| Beauty Salon | $3.04M | ×1.11 | 32 sn | 3 sa 54 dk | $760M |
| Logistics Warehouse | $45.6M | ×1.10 | 64 sn | 12 sa 54 dk | $11.4B |
| Factory | $683M | ×1.09 | 128 sn | 1 g 18 sa | $171B |
| Hotel Chain | $10.3B | ×1.09 | 256 sn | 5 g 20 sa | $2.58T |
| Tech Startup | $154B | ×1.09 | 512 sn | 19 g 8 sa | $38.5T |

### 4.3 Kariyer (`config/careers.ts`)

Tek iş, para ile terfi. Maaş online ve offline otomatik gelir. Her terfi o nesil boyunca tüm gelire kalıcı bonus ekler. Rol: erken oyunda maaş, geç oyunda gelir bonusu.

| Meslek | Fiyat | Maaş/sn | Gelir bonusu |
| --- | --- | --- | --- |
| Flyer Distributor | $10 | $0.3 | +5% |
| Dishwasher | $90 | $1.4 | +5% |
| Cashier | $810 | $5.6 | +5% |
| Waiter | $7.29K | $22 | +5% |
| Delivery Driver | $65.6K | $93 | +10% |
| Sales Representative | $590K | $382 | +10% |
| IT Support | $5.31M | $1.56K | +10% |
| Web Developer | $47.8M | $6.39K | +10% |
| Software Engineer | $430M | $26.1K | +15% |
| Team Leader | $3.87B | $107K | +15% |
| Director | $34.9B | $438K | +20% |
| CEO | $314B | $1.79M | +25% |

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

- Sadece yöneticili işletmeler ve maaş çevrimdışı üretir
- Oran %50, tavan 2 saat (tartışmada: 4–8 saat tavan geç oyunu hızlandırıyor, yeniden ayar gerekir; discussion-notes §6)
- Reklamla ×2; tavanı yükseltmek kalıcı bir ilerleme ve IAP noktasıdır (Faz 2)

### 4.7 Tıklama

Dokunuş başına `1 × mirasÇarpanı + aktifGelir/sn × 0,05`. İlk dakikada asıl gelir kaynağıdır, sonra küçük bir aktif bonus olarak kalır.

### 4.9 Yaş ve ömür (`config/life.ts`, karar 2026-10-08)

| Kural | Değer |
| --- | --- |
| Başlangıç yaşı | 17 (varis de 17'den başlar) |
| Emeklilik yaşı | 97 (80 yıl) |
| Oyun ayı | 1 dakika oyun = 1 ay; 12 dakika = 1 yaş; bir ömür ≈ 16 saat oyun |
| Yaş ne zaman ilerler | Sadece oyun açıkken. Uzaktayken para birikir ama yaşlanmazsın. 10 sn'den uzun boşluk çevrimdışı sayılır |
| Ömür sonu | "Bir ömür tamamlandı" ekranı → Emekli ol ve devret. Ölüm gösterilmez; vakıf töreni 2.1'de |
| Gösterim | Üst barda "24 yaş · 73 yıl kaldı" |

- Sahne ve törenler (1.10, 1.18) gelince tam ekran hikâye anlarında yaş durur.
- En Zengin'den sonraki yıllar için içerik şimdilik yok (kullanıcı kararı: sonra bakılacak). Engaged bot En Zengin'e 48, casual 39 yaşında ulaşıyor.
- Gelirin "aylık" gösterilmesi ($/ay) açık bir öneri ([discussion-notes.md](./discussion-notes.md) §5).

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
- **Nesil:** Emeklilikte evler sıfırlanır; varis çadırdan başlar (2. nesil açılışı Faz 2.1'de tartışılacak: [discussion-notes.md](./discussion-notes.md) §7).
- Hikaye bağı: sokak (çadır) → Gündelikçi kiralık oda → İşçi Sınıfı ilk kiralık daire → ilk kendi evin → Milyoner: annene ev ([story-v2.md](./story-v2.md) §4).

## 5. Tempo hedefleri ve simülasyon sonuçları

`npm run sim` iki oyuncu profilini 30 gün oynatır:

- **Engaged:** 1. gün 30 + 10 + 7 dk, sonraki günler 6 × 7 dk. GameAnalytics'teki ilk %10 idle oyuncuya yakın.
- **Casual:** 1. gün 20 + 5 dk, sonraki günler 3 × 5 dk.

Bot her an en kısa sürede kendini ödeyen alımı yapar, yani optimal oynar. Gerçek oyuncuların ~1,3–1,8 kat yavaş olduğu tahmin, ölçülmüş değil. Bot yöneticisiz işletmeleri %60 verimle çalıştırıyor sayar; gerçek oyunda sadece başlatılan döngü ödenir (sınırlar: discussion-notes §8).

Olay saatleri 2026-10-08'de düzeltildi: çevrimdışı kazançla gelen olaylar artık dönüş oturumuna yazılıyor. Casual oyuncu Milyoner'i ilk oturumda değil, 22:00 dönüşünde görüyor.

Tek ömür modeli (§4.9, 2026-10-08) ile:

| Kilometre taşı | Hedef (bot) | Engaged bot | Casual bot |
| --- | --- | --- | --- |
| İlk satın alma | ≤ 1 dk oyun | 3 sn | 3 sn |
| İlk işletme | ≤ 2 dk oyun | 20 sn | 20 sn |
| İlk yönetici | 2–5 dk oyun | 2 dk 55 sn | 2 dk 55 sn |
| Milyoner (1. nesil) | 20–30 dk oyun | 28,5 dk (19 yaş) | 20 dk, 22:00 dönüşünde (18 yaş) |
| İlk milyarder | 3–6. gün | **2. gün 21:00 (23 yaş) — tutmuyor** | 4. gün (21 yaş) |
| İlk "en zengin" | 7–16. gün | 9. gün (48 yaş) | 18. gün (39 yaş) |
| İlk ömür sonu (97 yaş) | 14–35. gün | 23. gün (16 sa oyun) | 30 günde gelmiyor (~60. gün) |

**Bilinen sorun:** Sınıf aralıkları eşit değil (×100, ×10, ×100, ×10, ×1000). Multimilyoner → Milyarder 21 dakika oyun (21 → 23 yaş), Milyarder → En Zengin 5 saat (23 → 48 yaş). Tek düğmeyle düzelmiyor (geri dönüş adımı 3,4'te bile Milyarder ~3 saat kayıyor, Milyoner sınırı zorluyor). Çözüm sınıf merdiveni ve hikâye anlarıyla birlikte ele alınacak ([discussion-notes.md](./discussion-notes.md) §4).

## 6. Simülasyondan öğrenilenler

1. **Kariyer maaşı kartopu yapıyordu.** Terfi başına maaş ×6 büyüyünce CEO maaşı tüm işletmeleri geçti. Çözüm: maaşın geri dönüş süresi her terfide ×2,2 uzar; geç terfiler maaş için değil bonus için alınır.
2. **Çarpanlar geri dönüş süresini böler.** Toplam ×30'luk bir çarpan, 1 saatlik geri dönüşü 2 dakikaya indirir. Üst kademelerin taban geri dönüşü bu yüzden çok uzun (günler); oyuncu bunu çarpanlarla kısaltır.
3. **Çevrimdışı toplu para gelir patlaması yapar.** 4 saatlik tavanla tek bir arada gelir 50 katına çıkıyordu. Tavan 2 saate indi. Tavanı yükseltmek ileride ödül ve IAP olacak.
4. **Statü eşyaları ucuz ve güçlüydü.** 30 dakikada +%185 gelir veriyordu. Bonuslar küçültüldü (+%5 / +%3 / +%2 / +%10).
5. **Karekök mirası kontrolden çıkıyordu.** Küpköke geçildi, puan başı bonus %2'den %1'e indi.
6. **6. nesilden sonra "en zengin" birkaç dakikada geliyor.** Mevcut içerik ~2–3 haftalık. Uzun vadeli tutma için Faz 2'de her nesle yeni içerik gerekli (§7).

## 7. Faz 2'ye bırakılan tasarım kararları

- **Nesil içeriği:** Her yeni nesil yeni bir şey açmalı. Seçenekler: yeni şehir ve yeni işletme kademeleri (40 işletme görselinin 30'u hâlâ kullanılmıyor), yadigarlar (miras puanıyla alınan kalıcı yetenekler), yeni sınıflar ("Old Money Dynasty" vb.).
- **Olay kartları:** Günde 3–5 kart, sınıfa göre değişen 60+ kart.
- **Yatırımlar:** Kiradaki evler (§4.8) ve tek bir "Yatırım Hesabı": güvenli / orta / riskli vadeler (risk anları). Ayrı emlak listesi ve borsa yok.
- **Görevler ve gem:** "Sıradaki 3 hedef" görev zinciri yön gösterir ve gem verir; gem ayrıca günlük ödülden gelir.
- **Lüks oyuncakların sahnede gösterimi:** Jet gökyüzünden geçer, yat sadece sahil evlerinde görünür.
- **Günlük döngü:** Gelire oranlı günlük ödül ve günlük görevler.

## 8. Açık sorular

- Para ölçeği: İlk Flower Stand döngüsü $0.1 kazandırıyor. "Fakirlik" hissi için iyi olabilir ama küçük kesirler sevimsiz durabilir. Faz 1 oyun testinde bakılacak; gerekirse tüm fiyatlar ×10. Alternatif: gelir aylık gösterilir (yaş/ömür modeli, discussion-notes §5).
- Ekranda gelir: üst bar ve "~X sonra alabilirsin" tahminleri sadece otomatik geliri (yönetici, maaş, kira) kullanır; dokunarak çalıştırılan işletmeler sayılmaz (2026-10-08).
- Yöneticisiz işletmeye dokunma mekaniği: runtime şimdilik AdCap modelini uyguluyor (dokun → tek döngü). "Dokundukça hızlanır" alternatifi Faz 1 oyun testinden sonra yeniden değerlendirilecek.
- Yaş ve ömür: kurallar §4.9'da; kalan ayrıntılar (aylık gelir, törende yaşın durması, ömür sonu uyarısı) discussion-notes §5.

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
| Görseller ve karakter animasyonu | Mevcut ~290 görsel ve animasyon boru hattı korunur | Görsel roman: tutarlı durağan pozlar, ifade portreleri, konuşma balonları; kahraman seti küçük ve yeniden üretilir; diğer görseller seçerek kullanılır | Mevcut 20 kıyafette poz aynı, üst kıyafetler ayırt edilmiyor; kodla zıplatma yapay duruyor (karar 2026-10-08, [story-v2.md §8](./story-v2.md)) |

Kullanıcı kararı bekleyen çelişkiler: [discussion-notes.md](./discussion-notes.md).
