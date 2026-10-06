# Prestige Life v2 — Oyun Tasarım Belgesi

Son güncelleme: 2026-10-06 · Durum: Faz 0 tamamlandı (ekonomi çekirdeği + simülatör)

Bu belge v2'nin tek doğruluk kaynağıdır. Sayısal değerler kodda `src/game/core/config/` altında durur; buradaki tablolar `npm run sim -- --config` çıktısından alınmıştır. Değer değiştirince önce simülatörü çalıştır, sonra bu belgeyi güncelle.

## 1. Vaat

**"Sokaktan dünyanın en zenginine — ve her nesil bir öncekinden hızlı."**

- AdVenture Capitalist tarzı üstel idle ekonomi (sayılar her zaman akar, büyük basamaklar "vay" anıdır)
- 7 basamaklı, törenli sınıf merdiveni (her basamakta sahne, ev, araç, kıyafet değişir)
- Hanedan prestiji: emekli ol, çocuğun miras çarpanıyla sokaktan yeniden başlasın
- BitLife tadında olay kartları (Faz 2)

## 2. Üç iç içe döngü

| Döngü | Süre | Oyuncu ne yapar | Sistemler |
| --- | --- | --- | --- |
| Anlık | saniyeler | Para akar; işletme alır, yükseltir, yönetici atar | İşletmeler, yöneticiler, kilometre taşı çarpanları, tıklama |
| Hayat | günler | Terfi alır, hayallerini satın alır, sınıf atlar | Kariyer, statü eşyaları, sınıf töreni, çevrimdışı kazanç, (olay kartları — Faz 2) |
| Hanedan | haftalar | Emekli olur, mirasla yeni nesil başlatır | Miras puanı, (yadigarlar, nesil içeriği — Faz 2) |

## 3. Kaynaklar

| Kaynak | Ne işe yarar | Sıfırlanır mı (emeklilikte) |
| --- | --- | --- |
| Nakit ($) | Her şeyi satın alır | Evet |
| Nesil kazancı | Sınıfı belirler; harcayınca düşmez | Evet |
| Toplam kazanç | Miras puanını belirler | Hayır |
| Miras puanı | Her puan tüm gelire +%1 | Hayır |
| Gem | Premium hızlandırma, kozmetik | Hayır |

## 4. Sistemler

### 4.1 Sınıf merdiveni (`config/classes.ts`)

| # | Sınıf | Eşik (nesil kazancı) |
| --- | --- | --- |
| 0 | Living on the Street | 0 |
| 1 | Day Laborer | 1K |
| 2 | Working Class | 100K |
| 3 | Millionaire | 1M |
| 4 | Multimillionaire (emeklilik açılır) | 100M |
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

Ev, araç, kıyafet ve lüks oyuncaklar **gider değildir**; her biri tüm gelire kalıcı bonus verir. Alışveriş = güçlenme. Fiyatlar geometrik büyür, böylece her sonraki "hayal" birkaç dakika ile birkaç saatlik gelir uzağında durur.

| Tür | Adet | İlk fiyat → büyüme | Bonus (her biri) | Görsel |
| --- | --- | --- | --- | --- |
| Ev | 25 (1. bedava) | $200 → ×2.75 | +5% | `houses/backgrounds/house-N.webp` |
| Kara aracı | 16 (1. bedava) | $20 → ×3.3 | +3% | `vehicles/vehicle-N.png` |
| Kıyafet | 20 (1. bedava) | $30 → ×3 | +2% | `outfits/ch-N-1.png` |
| Lüks oyuncak | 4 (tekne, yat, helikopter, jet) | $5B, $50B, $200B, $1T | +10% | `vehicles/vehicle-17..20.png` |

Tüm eşyalar alındığında statü toplamı +%243 (×3,4).

### 4.5 Hanedan / miras (`config/economy.ts`)

- Emeklilik, Multimillionaire sınıfında açılır
- Ailenin toplam miras puanı: `floor(10 × (toplamKazanç / 1M)^(1/3))`
- Emeklilikte kazanılan = toplam puan − eldeki puan (erken ve sık emeklilik az kazandırır)
- Her puan: tüm gelire +%1
- Küpkök bilinçli seçildi: mirası ikiye katlamak 8 kat kazanç ister ve resetler kartopu yapmaz (bkz. §6)

### 4.6 Çevrimdışı kazanç

- Sadece yöneticili işletmeler ve maaş çevrimdışı üretir
- Oran %50, tavan 2 saat
- Reklamla ×2; tavanı yükseltmek kalıcı bir ilerleme ve IAP noktasıdır (Faz 2)

### 4.7 Tıklama

Dokunuş başına `1 × mirasÇarpanı + aktifGelir/sn × 0,05`. İlk dakikada asıl gelir kaynağıdır, sonra küçük bir aktif bonus olarak kalır.

## 5. Tempo hedefleri ve simülasyon sonuçları

`npm run sim` iki oyuncu profilini 30 gün oynatır:

- **Engaged:** 1. gün 30 + 10 + 7 dk, sonraki günler 6 × 7 dk. GameAnalytics'teki ilk %10 idle oyuncuya yakın.
- **Casual:** 1. gün 20 + 5 dk, sonraki günler 3 × 5 dk.

Bot her an en kısa sürede kendini ödeyen alımı yapar, yani optimal oynar. Gerçek oyuncular ~1,3–1,8 kat yavaştır.

| Kilometre taşı | Hedef (bot) | Engaged bot | Casual bot |
| --- | --- | --- | --- |
| İlk satın alma | ≤ 1 dk oyun | 3 sn | 3 sn |
| İlk işletme | ≤ 2 dk oyun | 20 sn | 20 sn |
| İlk yönetici | 2–5 dk oyun | 2 dk 55 sn | 2 dk 55 sn |
| Milyoner (1. nesil) | 20–30 dk oyun | 28 dk | 20 dk |
| Emeklilik açılır | ≤ 1,5 gün | 2. gün sabah | 2. gün öğle |
| İlk emeklilik | 1–2. gün | 2. gün öğle | 2. gün akşam |
| İlk milyarder | 3–5. gün | 3. gün | 4. gün |
| İlk "en zengin" | 7–16. gün | 7. gün | 14. gün |

Nesil süreleri (engaged): 1,5 → 1,5 → 2 → 2,5 → 3,5 → 6 gün. Erken nesiller hızlı geçer, sonrakiler uzar; idle türünün klasik ritmi budur.

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
- **Yatırımlar:** Emlak (kira) ve basit borsa (risk anları).
- **Lüks oyuncakların sahnede gösterimi:** Jet gökyüzünden geçer, yat sadece sahil evlerinde görünür.
- **Günlük döngü:** Gelire oranlı günlük ödül ve günlük görevler.

## 8. Açık sorular

- Para ölçeği: İlk Flower Stand döngüsü $0.1 kazandırıyor. "Fakirlik" hissi için iyi olabilir ama küçük kesirler sevimsiz durabilir. Faz 1 oyun testinde bakılacak; gerekirse tüm fiyatlar ×10.
- Yöneticisiz işletmeye dokunma mekaniği: her döngüyü elle başlatmak mı (AdCap), yoksa "dokundukça hızlanır" mı? Faz 1'de prototiple karar verilecek.
- Emeklilik yaşı/süre baskısı (Idle Guy gibi) eklenmeli mi? Şimdilik hayır; emeklilik oyuncunun kararı.
