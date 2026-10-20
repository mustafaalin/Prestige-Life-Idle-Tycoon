# Prestige Life v2 — Oyun Tasarım Belgesi

Son güncelleme: 2026-10-21 (ekonominin yeniden kurulmasından sonra baştan yazıldı) · Durum: lansman öncesi, 1. nesil. Reklam/IAP: [monetization-v2.md](./monetization-v2.md)

Bu belge v2'nin tek doğruluk kaynağıdır. Gerekçesi [report-v2.md](./report-v2.md); rapordan sapmalar §9'da. Ekonominin 2026-10-20/21'de nasıl yeniden kurulduğu (kararlar, denenenler, ara ölçümler): [archive/economy-rebuild.md](./archive/economy-rebuild.md). Sayısal değerler kodda `src/game/core/config/` altında; tablolar `npm run sim -- --config` ve `npm run sim` çıktısından (2026-10-21). Değer değiştirince önce simülatör, sonra bu belge.

## 1. Vaat

**"Sokaktan zirveye, bir ömürde ve torunla."**

- Gerçekçi bir hayat ekonomisi: ekranda yazan aylık tutarlar gerçek hayattakine yakın, fiyatlar katlanmaz; küçük iş hızlı, büyük iş yavaş kendini öder (§4.2).
- İşletmeler seviye seviye büyür (tezgâh → dükkân → mağaza → şubeler), meslekler şartlarla açılır (deneyim, kurs, eşya, adres).
- 7 basamaklı, törenli sınıf merdiveni; her basamakta sahne, ev, araç, kıyafet değişir.
- Bir ömür: kahraman 17 yaşında başlar, yaş yalnız oyun açıkken ilerler (16 dk = 1 yıl). **Lansmanda 80'de devir yok**: kahraman 80'de kalır, "Torununun hikâyesi yakında" der, oyun sürer; devir (torun ailenin her şeyiyle devam eder) 2. nesil güncellemesiyle gelir (§4.10).
- Tanıdıklardan gelen olay kartları: bir fırsat, iki cevap.

Hikâye, karakterler ve ton: [story-v2.md](./story-v2.md).

## 2. Üç iç içe döngü

| Döngü | Süre | Oyuncu ne yapar | Sistemler |
| --- | --- | --- | --- |
| Anlık | saniyeler | Şişe toplar, "Çalıştır"a basar, işletmeyi geliştirir, yönetici atar | İşletme seviyeleri, şubeler, yöneticiler, şişe, Şans'ın bulduğu, olay kartları |
| Hayat | günler | İş değiştirir, kursa gider, eşya alır, taşınır, sınıf atlar | Meslekler, kurslar, eşyalar, evler, sınıf töreni, çevrimdışı kazanç, günlük ödül, yatırım |
| Ömür | haftalar | Bir ömrü yaşar; 63 ve 70'te torunla anlar, 80'de "yakında" | Yaş, hayat anları; hanedan sistemleri 2. nesille (§4.10) |

## 3. Kaynaklar

| Kaynak | Ne işe yarar |
| --- | --- |
| Nakit ($) | Her şeyi satın alır |
| Nesil kazancı | Sınıfı ve Zenginler Listesi'ni belirler; harcayınca düşmez |
| Yaş | Ömrün ne kadarının geçtiği; deneyim ve kurslar da yaşla ilerler |
| Deneyim | Her işte çalışılan oyun ayı (eski işlerdeki de sayılır) |
| Miras puanı | 2. nesille (lansmanda gizli, §4.10) |

## 4. Sistemler

### 4.1 Sınıf merdiveni (`config/classes.ts`)

| # | Sınıf | Eşik (nesil kazancı) | Yaş (bağlı bot) |
| --- | --- | --- | --- |
| 0 | Sokakta Yaşayan | 0 | 17 |
| 1 | Gündelikçi | $2K | 17 |
| 2 | İşçi Sınıfı | $100K | 19 |
| 3 | Orta Sınıf | $1M | 21 |
| 4 | Milyoner | $10M | 26 |
| 5 | Milyarder | $1B | 70 |
| 6 | Multimilyarder | $100B | 1. nesilde yok |
| 7 | Dünyanın En Zengini | $1T | 1. nesilde yok (torunla) |

- Sınıf kazanılan toplamdan gelir, harcamak düşürmez. Gündelikçi $2K (2026-10-21; gerçek maaşla $1K ilk tezgâh çalışmadan geliyordu).
- Her sınıf töreni o sınıfın evini (kiracı, bedava), kıyafetini ve Şans'ın tasmasını verir; Milyoner'de ilk kendi evin, Milyarder'de ilk otel ve yöneticisi Bülent Bey hediye (§4.5, §4.6). Önden alan elindekini korur.
- Orta Sınıf $1M ve Milyoner $10M (karar 2026-10-08): Milyoner gerçekten milyonlar demek.

### 4.2 Gerçekçi takvim (karar 2026-10-20/21)

Bir oyun ayı 80 sn, bir yıl 16 dk. **Aylık tutarlar gerçek hayata yakın**: el ilanı dağıtan ayda $300, CEO $60K; çiçek tezgâhı ayda $400, çiçekçi mağazası $6.400; fabrika ayda milyonlar. Yavaşlık fiyatların katlanmasından değil, büyük işlerin geri dönüşünün uzamasından gelir: tezgâh kendini 1,25 ayda, Teknoloji Girişimi 360 ayda (30 yıl) öder. Eşyalar gerçek fiyatlı (bisiklet $150, ilk kendi ev $300K, jet $60M) ve gelire bonus vermez; değerleri açtıkları meslekler ve gösterdikleri hayattır.

Bunun için çevrimdışı kazanç küçük tutulur (%20, en çok 1 sa; §4.8): yaş yalnız oyun açıkken akar, %50 ve 2 saatte paranın %76'sı oyun kapalıyken geliyor ve takvim fiilen 4 kat hızlı işliyordu.

### 4.3 İşletmeler (`config/businesses.ts`, `core/economy/business.ts`)

Bir işletme tek kart: **açılır, seviye seviye büyür, son seviyede şube açar** (karar 2026-10-20, kullanıcı: "73. çiçek tezgâhını almak yerine tezgâhımı dükkâna çevirdim"). Adet, ×10/Maks, kilometre taşları ve eski üçlü yükseltmeler yok.

- **10 seviye, üç aşama:** 1–3 işi kurmak (ucuz, hızlı döner), 4–7 verimli çalışmak, 8–10 ölçeği büyütmek. Her seviyenin adı var (`businessLevels`, TR/EN). Görünüm 8. seviyede (dükkân) ve 10. seviyede (mağaza, merkez) değişir; o an "{işletme} büyüdü!" kartı.
- **Kart:** seviye adı ve "Seviye n/10", 10 nokta (yeni görünümün başladığı seviye büyük nokta), "Seviye 8: Küçük dükkân" ipucu, "Geliştir" düğmesinde sıradaki seviyenin adı ve fiyatı, altında "Tur $130 → $200 · kendini ~22 ayda öder" (oyun takviminde). Açılmamış işletmede "Aç" ve "Açınca +$X/ay".
- **Şube:** son seviyede "Yeni şube aç". Şube başına gelir son seviyeninki kadar; ilk şube bütün seviyelerin toplamı kadar (sıfırdan bir mağaza), sonraki her biri ×1,4. Sınır sınıfla: açılış sınıfında 1, sonra 2, 4, 8, 16, 32, sonra sınırsız; tören "İşletmelerin daha çok şube açabilir" der. Ucuz işletmenin şubesi oyunun en iyi yatırımı olmasın diye (×1,15 ve son seviye fiyatında bot Milyoner'e kadar 30 çiçekçi açıyordu).
- **Yönetici:** açılışın 4 katı (Rıza Amca $5K), bütün şubeleri otomatik ve çevrimdışı çalıştırır. **Yöneticisiz işletme yalnız "Çalıştır"la tek tur döner ve aylık gelire sayılmaz**; yönetici gelince aylığa girer. Her işletmenin yöneticisi bir karakter (story-v2 §3).
- **Sınıfla açılış:** Çiçek Tezgâhı Sokak, Kahve Arabası Gündelikçi, Fırın ve Oto Yıkama İşçi, Mini Market, Restoran ve Güzellik Salonu Orta Sınıf, Emlak Ofisi, Lojistik, İnşaat ve Fabrika Milyoner, Otel, Medya ve Teknoloji Milyarder.
- **Görseller:** her işletmenin 3 aşama görseli (`config/businesses.ts` `STAGE_ART`; görseli olmayan aşama bir öncekini gösterir). Dört yeni işletme ve aşamalar GPT'yi bekliyor ([art-prompts-businesses.md](./art-prompts-businesses.md)).

| İşletme | Açılış | Tur, 1. → 10. sv | Aylık, 1. → 10. sv | Açılışın geri dönüşü | İlk şube | Yönetici |
| --- | --- | --- | --- | --- | --- | --- |
| Çiçek Tezgâhı | $1K | $25 → $400 | $400 → $6,4K | 1,25 ay | $167K | $5K |
| Kahve Arabası | $4K | $37 → $600 | $500 → $8K | 8 ay | $1,34M | $16K |
| Fırın | $30K | $107 → $1,7K | $1,07K → $17K | 28 ay | $10M | $120K |
| Oto Yıkama | $120K | $270 → $4,3K | $2,4K → $38K | 50 ay | $40M | $480K |
| Mini Market | $400K | $625 → $10K | $5K → $80K | 80 ay | $134M | $1,6M |
| Restoran | $800K | $909 → $14,5K | $7,3K → $116K | 110 ay | $267M | $3,2M |
| Güzellik Salonu | $1,5M | $1,5K → $23,6K | $10,7K → $172K | 140 ay | $501M | $6M |
| Emlak Ofisi | $3M | $2,4K → $38,8K | $17,7K → $282K | 170 ay | $1B | $12M |
| Lojistik Deposu | $10M | $10K → $160K | $66,7K → $1,07M | 150 ay | $3,3B | $40M |
| İnşaat Şirketi | $25M | $20,8K → $333K | $139K → $2,2M | 180 ay | $8,4B | $100M |
| Fabrika | $60M | $46K → $743K | $286K → $4,6M | 210 ay | $20B | $240M |
| Otel Zinciri | $150M | $105K → $1,7M | $600K → $9,6M | 250 ay | $50B | $600M |
| Medya Şirketi | $400M | $233K → $3,7M | $1,3M → $21M | 300 ay | $134B | $1,6B |
| Teknoloji Girişimi | $1B | $521K → $8,3M | $2,8M → $44M | 360 ay | $334B | $4B |

Çiçek Tezgâhı'nın seviyeleri tasarlanmış tablo ($1K, $300, $600, $1,5K, $3K, $6K, $10K, $25K, $40K, $80K; tur $25 → $400); diğer 13 işletme şimdilik onun biçiminden üretiliyor (her birine kendi tablosu sonra).

### 4.4 Meslekler ve kurslar (`config/careers.ts`, `config/courses.ts`, `core/economy/career.ts`)

**Meslekler satın alınmaz, şartla açılır** (karar 2026-10-20, kullanıcı: "60+ meslek"). 63 meslek, 9 alan: başlangıç (el ilanı), yemek ve konaklama, satış, ulaşım ve lojistik, teknoloji, ofis ve finans, inşaat ve zanaat, medya, sağlık; zirvede CEO (herhangi bir alanın direktörlüğünden sonra). Aynı anda tek iş, işler arasında serbest geçiş; önceki işlerdeki aylar deneyim olarak kalır. Maaş gerçek aylık ($300 → $60K), giriş bedeli küçük ($20 → $20K), gelir bonusu yok.

- **Şartlar** (`core/requirements.ts`, meslekler, kurslar, işletmeler ortak kullanır): bir işte N ay (şimdiki ya da eski), kurs, eşya (telefon, alet çantası, fotoğraf makinesi, dizüstü, iş kıyafeti, bisiklet, skuter, emektar sedan), adres (kiralık oda ve üstü), sınıf, işletme seviyesi, "şunlardan biri".
- **16 kurs:** İlk Yardım (1 ay, $300), Ehliyet (2 ay), Ağır Vasıta (4 ay, ehliyetten sonra), BT Sertifikası (12 ay), Yazılım Kampı (6 ay), Gazetecilik, Muhasebe (9 ay), Aşçılık, Elektrikçilik (12 ay), Turizm İşletmeciliği, MBA (24 ay, $80K), Hemşirelik (36 ay), Bilgisayar Mühendisliği, İktisat, Mühendislik (48 ay), Tıp (72 ay, $150K). Aynı anda tek kurs, parası baştan, oyun açıkken ilerler.
- **İş panosu (kariyer ekranı):** şimdiki iş ve kaç aydır orada; süren kurs (kalan ay); "Girebileceğin işler" (şartları tamam, daha çok kazandıran, "İşe gir"); "Hedefindeki işler" (en çok 6; şart listesi ✓ / ○, deneyimde "7/12", eşya, kurs ve adreste "Git"); kurslar ("Açar: …", "Başla"); "Bütün meslekler" alanlara göre. Kariyer düğmesinde "!" daha iyi bir iş alınabilir olunca.
- **Bağlı botta:** ~29 iş ve kurs adımı; CEO 7 sa 12 dk oyunda (44 yaş).
- **İkonlar:** 51 meslek ve 4 eşya ikonu GPT'yi bekliyor ([art-prompts-jobs.md](./art-prompts-jobs.md)); şimdilik kariyer ve mağaza simgesi.

### 4.5 Eşyalar (`config/lifestyle.ts`)

Gerçek fiyatlı, gelir bonusu yok (karar 2026-10-20); değerleri hayatı göstermek ve meslek açmak. Mağazada sıradaki her eşyanın altında "Açar: …".

| Tür | Liste ve fiyat | Not |
| --- | --- | --- |
| Araç (12) | Bisiklet $150, retro skuter $1,2K, emektar sedan $5K, motosiklet $8K, hatchback $18K, SUV $40K, pikap $55K, makam sedanı $90K, spor coupe $180K, lüks arazi aracı $250K, süper otomobil $500K, grand lüks $1,5M | Sırayla; ev–araç zinciri (§4.6). Sahnede evin önünde |
| Kıyafet (7) | Kapüşonlu (bedava), iş kıyafeti $60, şık günlük $400, deve tüyü palto $1,5K, takım elbise $3K, üç parçalı $8K, smokin $15K | Sınıfla açılır (`minClass`); tören o sınıfınkini verir. Kahraman en iyisini giyer |
| Lüks (4) | Sürat teknesi $300K, yat $10M, helikopter $15M, jet $60M | İlk alındığında aile anı (story §4c) |
| Eşya (4) | Akıllı telefon $300, alet çantası $400, fotoğraf makinesi $900, dizüstü $1,2K | Mağazada "Eşyalar" sekmesi; sırasız, meslek açar |

- **Şans'ın tasmaları** (karar 2026-10-15): tören verir, yalnız takılı olan sayılır: deri (Orta Sınıf) +%2, gümüş (Milyoner) +%4, altın (Milyarder) +%6. Gelir bonusu kalan tek bedava şey.
- **Şans'ın ücretli aksesuarları** ayrı çarpan (`accessoryMultiplier`, satın almalardan her açılışta hesaplanır): fular +%10 (Başlangıç Paketi), yakut tasma +%50 (IAP 2. adım).

### 4.6 Konut: kirala → satın al → kiraya ver (`config/housing.ts`)

Tek ev; ana ekranın arka planı o evdir, önünde o evin izin verdiği en iyi araç durur.

| Ev | Taşınma bedeli | Satın alma (×25) |
| --- | --- | --- |
| 1 Sokak Çadırı | 0 | — |
| 2 Eski Minibüs | $500 | — |
| 3 Kiralık Oda | $800 | — |
| 4 Eski Kiralık Daire | $1,5K | — |
| 5 Yenice Kiralık Daire | $3K | — |
| 6 Sitede Daire | $6K | — |
| 7 İlk Kendi Evin | $12K | $300K |
| 8 Bahçeli Banliyö Evi | $32K | $800K |
| 9 Villa | $120K | $3M |
| 10 Göl Kenarında Cam Ev | $320K | $8M |
| 11 Sahil Malikânesi | $1M | $25M |
| 12 Büyük Malikâne | $3,2M | $80M |

- Taşınma tek seferlik (depozito + ilk kira), düzenli kira gideri yok; net gelir eksiye düşmez. Yalnız yukarı taşınılır. Ev bonusu yok (2026-10-20); kiralık oda ve üstü bazı mesleklerin "adres" şartı.
- Sahip olunan ama oturulmayan ev kira getirir: fiyatını 200 ayda öder (~ayda %0,5), çevrimdışı da.
- **Ev–araç zinciri** (karar 2026-10-11): her araç bir evde açılır, bir evin son aracı alınmadan sonraki eve geçilmez; çadırın önünde yalnız bisiklet. Tören bu kuralın tek istisnası: kahramanı sınıfının evine taşır.
- **Sınıfın evi** (`CLASS_HOME_FLOOR`): Gündelikçi minibüs, İşçi eski daire, Orta Sınıf sitede daire, Milyoner ilk kendi evin (hediye, sahipli; önceden alan korur), Milyarder villa, Multimilyarder göl evi, En Zengin sahil malikânesi.

### 4.7 Elle kazanç: Çalıştır, şişe, Şans, olay kartları (`config/scene.ts`, `config/events.ts`, `core/economy/manual.ts`)

- **"Çalıştır":** yöneticisiz işletmenin tek turu. Çiçek Tezgâhı'nın ilk turu $25, yani ~12 şişe (karar 2026-10-20: tek tezgâhın turu bir şişeden belirgin fazla).
- **Şişe ve kutular:** sınıfa göre sabit: Sokak $2, Gündelikçi $3, İşçi $5 (bozuk para); gelirle büyümez, başta anlamlı, sonra süs. Ekranda en çok 4, 2,5 sn'de bir yenisi. Orta Sınıf'ta biter (kahraman bir daha yere eğilmez); yerini olay kartları alır.
- **Şans'ın bulduğu:** 5–10 dk'da bir (ilk yöneticiye kadar 1,5–2,5 dk) ağzında cüzdanla gelir, 12 sn bekler; ödül 15 şişe + 30 sn gelir.
- **Olay kartları** (Orta Sınıf töreninden sonra, oturumun ilk çağrısı 60–90 sn, sonra 4–6 dk'da bir): bir tanıdık arar, iki cevap: sağlamcı 45 sn gelir kesin, cesur %50 +130 sn ya da −20 sn (para gerçekten eksilir). Yönetici kartları o yönetici işe alındıysa gelir. Ayrıntı ve metinler story-v2 §4d.
- **Toplanan ödülün gösterimi:** kart kapanır, tutar ortada ~0,6 sn durur, paralarla bakiyeye uçar.

### 4.8 Çevrimdışı kazanç

- Yalnız yöneticili işletmeler, maaş ve kira çevrimdışı üretir; **oran %20** (karar 2026-10-21; önce %50). **Tavan sınıfla:** Sokak 10 dk, Gündelikçi 15 dk, İşçi ve Orta Sınıf 30 dk, Milyoner'den 1 sa (önce en çok 2 sa).
- Reklamla +%30 (en az 10 dk uzak kalınca); "Gece Vardiyası Ekibi" IAP'ı yeni orana göre yeniden yazılacak (monetization §5).
- Bağlı oyuncuda paranın ~%44'ü çevrimdışından.

### 4.9 Yaş ve ömür (`config/life.ts`)

| Kural | Değer |
| --- | --- |
| Başlangıç | 17 yaş |
| Takvim | 80 sn = 1 ay, 16 dk = 1 yıl; yalnız oyun açıkken (10 sn'den uzun boşluk çevrimdışı). Tam ekran hikâye anlarında durur |
| 60+ | Kahraman dede görünümünde |
| 80 | Lansmanda: yaş 80'de durur, bir kez "Torununun hikâyesi yakında" kartı (dede portresi), oyun ve gelir sürer |
| Bir ömür | 63 yıl ≈ 16 sa 48 dk oyun (bağlı oyuncu 24. gün) |

- **Hayat anları** (yaşa bağlı, story §4c): ilk buluşma 25, düğün 28, kızın doğumu 31, torunun doğumu 63, dede ve torun 70; lüks anları ilk alımda. Her an bir hediyeyle kapanır (10 dk gelir, reklamla ×2).
- Deneyim ve kurslar da yaşla ilerler.

### 4.10 Hanedan (lansmanda kapalı; `config/content.ts`)

Kararlar (2026-10-20/21, kullanıcı): 80'de torun ailenin **her şeyiyle** devralır ve kaldığı yerden büyütür (sıfırlama yok); Burak hikâyesi kaldırıldı, Burak yalnız Lojistik'in yöneticisi; 2. ve 3. nesil (Lumen, Ada) yayından sonra.

- **İçerik bayrakları:** `handover` (80'de devir), `legacy` (miras puanı, yadigârlar, "Şimdi devret", Aile sekmesi), `bradStory`; üçü de kapalı. Ekranlar, hikâye ve simülatör yalnız bunlara bakar; 2. nesil güncellemesi bayrakları açar.
- **Kodda duran, oynamayan:** miras puanı (`floor(10 × (nesil kazancı / $1M)^(1/3))`), 5 yadigâr (Mehmet'in saati, erik reçeli, Rıza'nın defteri, Şans'ın tasması, aile albümü; `config/heirlooms.ts`), erken devir, emeklilik paneli, Lumen şehri (`runtime/city.ts`), Burak'ın ortaklık ve kazık anları. Kayıt alanları ve kimlikler korunur. Sıfırlamasız devirde mirasın ve yadigârların anlamı 2. nesille yeniden tasarlanacak.

### 4.11 Hedefler (`config/quests.ts`)

Ana ekranın sol üstünde yuvarlak rozet, aynı anda 3 hedef (Egg, Inc. gibi). İlk saat için yazılı 24 hedef (5 şişe → el ilanı → bisiklet → bulaşıkçı → tezgâhı aç → 3. ve 5. seviye → ... → "Küçük dükkân" → mağaza → ilk şube → garson → Orta Sınıf → Oto Yıkama), sonra her açılmış işletmenin sıradaki seviye hedefi (3, 5, 8, 10) ve şube hedefleri (1, 3, 5, 10, 20, 50; sınıfın izin verdiği kadar), en ucuzu önde. Ödül `max(küçük sabit, aktif gelir × 15 sn)`, üretilenlerde 20 sn: bilinçli küçük (paranın ~%0,1'i). Her hedefte resim, nerede yapıldığı ve "Git" (ilgili sekme açılır, düğme 5 sn parlar).

### 4.12 Zenginler Listesi (`config/richList.ts`)

Kurgusal liste; ölçü bu hayatta kazanılan toplam. Düğme Milyoner töreninden itibaren görünür, liste $1B'de açılır ($1B ≈ #3.400, $100B = #20, 1. sıradaki Alan Trusk hep biraz önde, #1 $1T'de). Altı sıra kısa bir kart getirir (story §4e). 1. nesilde liste ömrün son on yılında açılır; ilk 20 ve sonrası torunla.

### 4.13 Günlük ödül (`config/daily.ts`, `runtime/daily.ts`)

Aylık gelirin katı: ilk hafta ×2, ×4, ×6, ×8, ×12, ×16, ×20 (7. gün "Şans'ın günü"), sonra her gün ×6, 7. gün ×20 (2026-10-21; çevrimdışı küçülünce eski ×5…×50 Milyoner'i bir sınıf öne çekiyordu). Tutar günün ilk açılışında sabitlenir; gün kaçırmak ceza değil. Reklamla ×2. Reklamlarla aynı anda açılır (bir yönetici ve ilk çevrimdışı kartı).

### 4.14 Yatırım: Rıza Amca'nın fırsatları (`config/investments.ts`)

Orta Sınıf'ta açılır. Üç vade: güvenli 1 sa +%5, dengeli 4 sa +%20, cesur 8 sa %60 +%70 ya da %40 −%20 (sonuç yatırırken çekilir). Aynı anda tek yatırım, en çok **24 aylık gelir** (2026-10-21; önce 60). Vade dolunca bildirim. Bağlı oyuncuda paranın ~%10'u.

## 5. Tempo hedefleri ve simülasyon (`npm run sim`)

Bot her an en kısa sürede kendini ödeyen alımı yapar (optimal); daha çok kazandıran ve eksiği yalnız eşya olan işi eşyasıyla alır, kurs yokken daha iyi bir iş açan en ucuz kursu başlatır. Profiller: bağlı (1. gün 30 + 10 + 7 dk, sonra 6 × 7 dk; hedefler buna göre), gündelik (3 × 5 dk), reklam izleyen, fularlı, reklam + fular + yakut. Hedefler yaşa bağlı (`sim/report.ts`):

| Kilometre taşı | Hedef | Bağlı bot | Gündelik bot |
| --- | --- | --- | --- |
| İlk satın alma | ≤ 1 dk | 20 sn | 22 sn |
| İlk işletme | 2–6 dk | 3 dk 11 sn | 4 dk 29 sn |
| İlk yönetici | 8–25 dk | 12 dk 49 sn | 14 dk 49 sn |
| Gündelikçi | 4–15 dk | 4 dk 37 sn | 5 dk 54 sn |
| İşçi Sınıfı | 20 dk – 1 sa | 33 dk 54 sn | 30 dk |
| Orta Sınıf | 21–26 yaş | 21 yaş (1 sa 11 dk, 2. gün) | 20 yaş (4. gün) |
| Milyoner | 26–35 yaş | 26 yaş (2 sa 28 dk, 4. gün) | 23 yaş (7. gün) |
| Milyarder | 50–72 yaş | 70 yaş (14 sa 9 dk, 21. gün) | 55 yaş (41. gün) |
| Multimilyarder | 70'ten önce değil | 1. nesilde yok | yok |
| En Zengin | 1. nesilde yok | yok | yok |
| 80 yaş | 19–31. gün | 24. gün | 45 günde yok |

- **His kontrolleri:** ilk tur ≥ 5 şişe ($25 / $10), işletmelerin gelirdeki payı Gündelikçi anında, ilk oturum sonunda ve 1. nesil ortancasında ≥ %50 (%56 / %65 / %98).
- **Paranın kaynakları (bağlı, 45 gün):** çevrimdışı %44, oynarken işletme ve maaş %33, yatırım %10, günlük ödül %6, olay kartı %5, Şans %2, tören ve hayat anı hediyeleri %0,2, hedefler %0,1, şişe ~%0.
- **Reklam izleyen:** Milyoner 23, Milyarder 54 yaş (~%30 erken).
- Komutlar: `npm run sim -- --config`, `--timeline`, `--purchases`, `--sessions`, `--daily-claims`.

## 6. Simülasyondan öğrenilenler

1. **Çevrimdışı kazanç takvimi bozar.** Yaş yalnız oynarken akınca, oyun kapalıyken kazanılan para yaşa göre ölçülen her hedefi öne çeker; %50 / 2 saatte paranın %76'sı oradan geliyordu. %20 / 1 saatle %44 (§4.2).
2. **En ucuz işletmenin şubesi her şeyi yutar.** Şube son seviye fiyatına ve ×1,15'le satılınca Çiçek Tezgâhı şubeleri Milyoner'e kadar gelirin %80'iydi; şube sıfırdan bir mağaza kadar pahalı ve ×1,4 (§4.3).
3. **Toplu ödüller takvimle büyür.** Çevrimdışı küçülünce günlük ödül ve yatırım oransal olarak büyüdü (günün ödülü Milyoner'i bir sınıf öne çekti); ikisi de küçültüldü (§4.13, §4.14).
4. **Erken meslekler ucuz kısayol olmasın.** Yalnız eşya isteyen bir iş (fotoğraf makinesiyle sokak fotoğrafçılığı) 3. dakikada geliri üçe katlıyordu; başlangıç işlerinin hepsi 6 ay el ilanı deneyimi ister.
5. **Kariyer maaşı kartopu yapmaz:** maaş gerçek aylık ve bonus yok; ömür boyu gelirde işletmelerin payı ~%94.
6. **Tempo hedefleri hissi garanti etmez:** his kontrolleri (§5) ilk turun ve işletme payının ne olduğunu da bekler.

## 7. Kod yapısı (karar 2026-10-20, kullanıcı: "kıdemli yazılımcı gibi, SOLID")

- **Saf çekirdek** `src/game/core/` (React yok); simülatör aynı çekirdeği oynar.
- **Veri ile kural ayrı:** işletme, seviye, meslek, kurs, eşya, ev, hedef birer config satırı (`core/config/`); yenisi bir satır.
- **Sistem başına modül** `core/economy/`: `business.ts` (seviye, şube, tur, aşama görseli, yönetici fiyatı), `career.ts` (açık işler, kurslar, "neyi açar"), `income.ts` (`INCOME_SOURCES`: işletmeler, maaş, kira; toplam, çevrimdışı, gelir dökümü), `multipliers.ts`, `legacy.ts`, `manual.ts` (şişe, Şans). `formulas.ts` bunları dışa verir; durum geçişleri `state.ts`.
- **Ortak şart sistemi** `core/requirements.ts`: tek değerlendirici, her ekranda aynı şart satırı ve "Git" (`ui/career/Requirements.tsx`, `requirementText.ts`).
- **İçerik bayrakları** `core/config/content.ts`: lansmanın neyi içerdiği tek yerde (§4.10).
- **Kayıt** (`runtime/storage.ts`): kararlı string kimlikler (işletme seviyesi sayıyla: `{ level, branches, managed }`), yeni alan varsayılanla, şema yalnız `migrate()` adımıyla. Şema 2 (2026-10-21): şema 1 kayıt bir kez sıfırdan başladı (yalnız mağaza alımları ve bildirim cevabı kaldı, eski kayıt `prestige_life_v2_pre_rebuild`'de); **yayından sonra bu bir daha yapılmaz** (session-handoff "Kayıt uyumluluğu").
- **Ekran çekirdeği bilmez:** ekranlar `core`'dan okur, ekonomi hesaplamaz.

## 8. Sonraya bırakılanlar ve açık konular

- **Görseller:** 32 işletme aşaması + 4 yönetici ([art-prompts-businesses.md](./art-prompts-businesses.md)), 51 meslek + 4 eşya ikonu ([art-prompts-jobs.md](./art-prompts-jobs.md)).
- **Her işletmeye kendi seviye tablosu** (bugün 13'ü Çiçek Tezgâhı'nın biçiminde); Fabrika'dan Medya'ya ~8,5 saat yeni işletme yok.
- **2. nesil:** devir, mirasın sıfırlamasız anlamı, Ada ve Lumen içeriği (§4.10).
- **Gece Vardiyası IAP'ı** yeni çevrimdışı oranına göre (monetization §5).
- **Eşyalar meslek dışında bir şey açmıyor** (olay, yer); araç sayısı 12'de (yeni araç sahne kesimi ve zincir yeri ister).
- **Telefonda bakılacak:** gerçek oyuncunun kurs yolu (bot en ucuzunu seçiyor), tezgâh ve şişenin ilk hissi, iş panosunun uzunluğu.
- Açık tasarım konuları: [discussion-notes.md](./discussion-notes.md); oyuncuyu tutma önerileri: [engagement-strategy-v2.md](./engagement-strategy-v2.md).

## 9. Rapordan sapmalar

[report-v2.md](./report-v2.md) büyük çoğunlukla uygulanıyor. Bilinçli olarak farklı yapılanlar:

| Konu | Rapor | v2 kararı | Gerekçe |
| --- | --- | --- | --- |
| Ekonomi | AdVenture Capitalist tarzı üstel üreticiler | Gerçekçi takvim, seviye + şube işletmeler, şartlı meslekler, gerçek fiyatlı eşyalar (§4.2–4.5) | Katlanan fiyatlar gerçek dışıydı ($3,1B iş, $200B smokin); "her zaman yapacak şey" (karar 2026-10-20) |
| Sınıf eşiği | Net servet | Nesil kazancı, harcayınca düşmez (§4.1) | Alışveriş yapan oyuncu sınıf kaybetmesin |
| İlk "en zengin" | 2–3 hafta (2–4 nesil) | 1. nesilde yok; torunla (§4.1) | Gerçekçi takvim; uzun vade 2. nesille |
| Hanedan | Emeklilik → varis sık ve erken, sıfırlama | Lansmanda devir yok; sonra torun her şeyle devam eder (§4.10) | Hikâye tek kahramanın hayatında; sıfırlama "kaldığı yerden devam" kararıyla çelişiyor (2026-10-20) |
| Konut | Tek ev kavramı | Kirala → satın al → kiraya ver (§4.6) | Erken oyunda kiralamak ilerleme hissi |
| Sağlık / mutluluk | Tek "Yaşam Kalitesi" göstergesi | Yok | Angarya riski (karar 2026-10-07) |
| Dokunarak kazanma | "Dokun" düğmesi | Sahnede şişe (Orta Sınıf'ta biter), Şans, olay kartları, yöneticisiz işletmede "Çalıştır" (§4.7) | Sahnede canlılık |
| Monetizasyon | "Altın Kaşık" paketi, gem | Rahat Paket, Başlangıç Paketi (fular), yakut tasma; gem yok ([monetization-v2.md](./monetization-v2.md)) | Sıfırdan yükselen kahramanın tonu |
| Görseller | Mevcut görseller ve animasyon boru hattı | Görsel roman: durağan pozlar, portreler, balonlar ([story-v2.md §8](./story-v2.md)) | Kodla zıplatma yapay duruyordu (2026-10-08) |
