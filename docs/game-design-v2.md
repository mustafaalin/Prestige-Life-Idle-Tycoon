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
- Her sınıf töreni kahramanı bir sonraki eve taşır (kiracı, bedava), kıyafetini ve Şans'ın tasmasını verir; Milyoner'de taşındığı ev onun olur, Milyarder'de ilk otel ve yöneticisi Bülent Bey hediye (§4.5, §4.6). Önden alan elindekini korur.
- Orta Sınıf $1M ve Milyoner $10M (karar 2026-10-08): Milyoner gerçekten milyonlar demek.

### 4.2 Gerçekçi takvim (karar 2026-10-20/21)

Bir oyun ayı 80 sn, bir yıl 16 dk. **Aylık tutarlar gerçek hayata yakın**: el ilanı dağıtan ayda $300, CEO $60K; çiçek tezgâhı ayda $400, çiçekçi mağazası $6.400; fabrika ayda milyonlar. Yavaşlık fiyatların katlanmasından değil, büyük işlerin geri dönüşünün uzamasından gelir: tezgâh kendini 1,25 ayda, Teknoloji Girişimi 360 ayda (30 yıl) öder. Eşyalar gerçek fiyatlı (bisiklet $150, ilk kendi ev $300K, jet $60M) ve gelire bonus vermez; değerleri açtıkları meslekler ve gösterdikleri hayattır.

Bunun için çevrimdışı kazanç küçük tutulur (%20, en çok 1 sa; §4.8): yaş yalnız oyun açıkken akar, %50 ve 2 saatte paranın %76'sı oyun kapalıyken geliyor ve takvim fiilen 4 kat hızlı işliyordu.

### 4.3 İşletmeler (`config/businesses.ts`, `core/economy/business.ts`)

Bir işletme tek kart: **açılır, seviye seviye büyür, son seviyede şube açar** (karar 2026-10-20, kullanıcı: "73. çiçek tezgâhını almak yerine tezgâhımı dükkâna çevirdim"). Adet, ×10/Maks, kilometre taşları ve eski üçlü yükseltmeler yok.

- **15 seviye, üç eşit aşama** (2026-10-21, kullanıcı; önce 10 seviye, görünüm 8 ve 10'da): 1–5 tezgâh, 6–10 dükkân, 11–15 mağaza. Aşama içinde her seviye turu biraz artırır; yeni binaya geçiş (6. ve 11. seviye) en pahalı adım ve turu ikiye katlar. O seviyeden önce kartta "Sıradaki seviye yeni bina: Küçük dükkân · tur ×2", "Geliştir" düğmesi altın renkte ve "×2" rozetli. Her seviyenin adı var (`businessLevels`, TR/EN, 15'er). Yeni binaya geçince kısa bir şov oynar (`ui/businesses/BusinessShow.tsx`): eski görsel parlar, beyaz bir patlama, yeni görsel büyüyerek gelir, seviye adı kurdelede, konfeti, tur geliri sayarak artar, `grow` sesi. Sıradan seviyede görselin üstünden ışık geçer, kazanç yukarı süzülür, `levelUp` sesi her seviyede biraz daha tiz çalar. Yönetici alımı da şovdur: spot ışığı, yönetici sahneye girer, adı kurdelede, ilk cümlesi yazılır, "OTOMATİK" mührü vurulur, `hire` sesi. Dokunmak şovu sonuna atlatır; azaltılmış harekette doğrudan son kart.
- **Seviye fiyatı ve turu** (1. seviyenin katı): fiyat 1; 0,5; 0,9; 1,5; 2,5 · 12; 5; 8; 12; 17 · 70; 28; 38; 50; 66; tur 1; 1,2; 1,4; 1,65; 1,9 · 3,8; 4,3; 4,9; 5,5; 6,2 · 12,4; 13,6; 15; 16,5; 18. Eski 10 seviyeli kayıtlar şema 3'te en az aynı turu ödeyen seviyeye taşınır (1→1, 2→3, 3→4, 4–5→6, 6→7, 7→9, 8–9→11, 10→14; `SCHEMA2_LEVEL_MAP`).
- **Kart:** seviye adı ve "Seviye n/15", 15 nokta (yeni görünümün başladığı seviye büyük nokta), "Seviye 6: Küçük dükkân" ipucu, "Geliştir" düğmesinde sıradaki seviyenin adı ve fiyatı, altında "Tur $130 → $200" (geri dönüş süresi 2026-10-21 kaldırıldı, kullanıcı). Açılmamış işletmede "Aç" ve "Açınca +$X/ay".
- **Şube:** son seviyede "Yeni şube aç". Şube başına gelir son seviyeninki kadar; ilk şube bütün seviyelerin toplamı kadar (sıfırdan bir mağaza), sonraki her biri ×1,4. Sınır sınıfla: açılış sınıfında 1, sonra 2, 4, 8, 16, 32, sonra sınırsız; tören "İşletmelerin daha çok şube açabilir" der. Ucuz işletmenin şubesi oyunun en iyi yatırımı olmasın diye (×1,15 ve son seviye fiyatında bot Milyoner'e kadar 30 çiçekçi açıyordu).
- **Tur 1 saniye** (2026-10-21, kullanıcı; önce 5–15 sn): her tur saniyelik geliri öder, gelir değişmedi. "Çalıştır"a her basış bir tur ve **basıldığı an ödenir**; ardından 1 sn dolmadan yeniden basılamaz. Yöneticili işletme her saniye öder. Her ödenen turda işletme resminin üstünden banknot ikonlu "+$5" baloncuğu yükselip söner (`ui/businesses/RunBubbles.tsx`; kartta en çok 3). Karttaki "$/tur" ile baloncuk aynı sayıdır: kampanya ve ×2 hızlandırıcı dahil (`runPay`), $100 altı tek ondalık, en yakına yuvarlanmış (`formatRunMoney`).
- **Yönetici:** açılışın 4 katı (Rıza Amca $5K), bütün şubeleri otomatik ve çevrimdışı çalıştırır. **Yöneticisiz işletme yalnız "Çalıştır"la tek tur döner ve aylık gelire sayılmaz**; yönetici gelince aylığa girer. Her işletmenin yöneticisi bir karakter (story-v2 §3).
- **Sınıfla açılış:** Çiçek Tezgâhı Sokak, Kahve Arabası Gündelikçi, Fırın ve Oto Yıkama İşçi, Mini Market, Restoran ve Güzellik Salonu Orta Sınıf, Emlak Ofisi, Lojistik, İnşaat ve Fabrika Milyoner, Otel, Medya ve Teknoloji Milyarder.
- **Görseller:** 14 işletmenin her birinin 3 aşama görseli ve yöneticisi oyunda (2026-10-21; `public/assets/businesses/v2/{id}.webp`, `{id}-2.webp`, `{id}-3.webp`; komutlar [archive/art-prompts-businesses.md](./archive/art-prompts-businesses.md)). Lumen'de işletme başına tek görünüm var; dört yeni işletme orada eski şehrin görseli ve yöneticisiyle görünür.

| İşletme | Açılış | Tur (1 sn), 1. → 15. sv | Aylık, 1. → 15. sv | Açılışın geri dönüşü | İlk şube | Yönetici |
| --- | --- | --- | --- | --- | --- | --- |
| Çiçek Tezgâhı | $1K | $5 → $90 | $400 → $7,2K | 1,25 ay | $157K | $5K |
| Kahve Arabası | $4K | $6,3 → $113 | $500 → $9K | 8 ay | $1,25M | $16K |
| Fırın | $30K | $13 → $241 | $1,07K → $19,3K | 28 ay | $9,4M | $120K |
| Oto Yıkama | $120K | $30 → $540 | $2,4K → $43K | 50 ay | $37,5M | $480K |
| Mini Market | $400K | $62 → $1,13K | $5K → $90K | 80 ay | $125M | $1,6M |
| Restoran | $800K | $90 → $1,64K | $7,3K → $131K | 110 ay | $250M | $3,2M |
| Güzellik Salonu | $1,5M | $134 → $2,4K | $10,7K → $193K | 140 ay | $469M | $6M |
| Emlak Ofisi | $3M | $221 → $4K | $17,7K → $318K | 170 ay | $937M | $12M |
| Lojistik Deposu | $10M | $833 → $15K | $66,6K → $1,2M | 150 ay | $3,1B | $40M |
| İnşaat Şirketi | $25M | $1,7K → $31K | $139K → $2,5M | 180 ay | $7,8B | $100M |
| Fabrika | $60M | $3,6K → $64K | $286K → $5,1M | 210 ay | $18,7B | $240M |
| Otel Zinciri | $150M | $7,5K → $135K | $600K → $10,8M | 250 ay | $46,9B | $600M |
| Medya Şirketi | $400M | $16,7K → $300K | $1,34M → $24M | 300 ay | $125B | $1,6B |
| Teknoloji Girişimi | $1B | $34,7K → $625K | $2,8M → $50M | 360 ay | $312B | $4B |

Çiçek Tezgâhı'nın seviyeleri tasarlanmış tablo ($1K, $250, $450, $750, $1,25K · $6K, $2,5K, $4K, $6K, $8,5K · $35K, $14K, $19K, $25K, $33K; tur $5 → $90); diğer 13 işletme şimdilik onun biçiminden üretiliyor (her birine kendi tablosu sonra).

### 4.4 Meslekler ve kurslar (`config/careers.ts`, `config/courses.ts`, `core/economy/career.ts`)

**Meslek ağacı** (karar 2026-10-21; süreç [career-redesign.md](./career-redesign.md)). 104 meslek, 54 satır, **satırda en çok 2 iş**. Sekmeler sırayla gelir: İşçi 1–15. satır (29 iş), Ofis 16–29 (28), Uzman 30–45 (32), Zirve 46–54 (15: direktörler, CTO/CFO, COO, CEO 52. satırda, Yönetim Kurulu Üyesi ve Yatırım Fonu Kurucusu, Yönetim Kurulu Başkanı 54. satırda). Her iş bir üstteki satırın iki işinden birinde ustalık ister (ikisi de çizgiyle bağlı).

- **Ustalık ve geçiş:** ustalık `min(8, 3 + ⌊(satır − 1) / 2⌋)` oyun ayı (1. satır 3 ay, 11. satırdan sonra 8 ay); yaklaşık her 8 ayda bir terfi. Şimdiki işte ustalık %100 olmadan iş değiştirilemez; bırakılan işe dönülmez. Seçilmeyen kardeş işler açık kalır: ustalık bitince onlara da girilebilir. Giriş ücreti yok.
- **Maaş:** satıra bağlı, iki iş aynı maaşı öder; her satır bir üsttekinin ×1,10 (2–5), ×1,13 (6–45), ×1,25 (46+). **Yıllık zam yok** (2026-10-21, kullanıcı: terfi zaten yılda bir zam gibi). El İlanı $300, 16. satır (Kasiyer) $1,7K, 30. satır $9,3K, CEO $278K, Yönetim Kurulu Başkanı $435K.
- **Görünürlük:** yapılmış işler, şimdiki iş, şartları tamam olanlar ("İşe gir"; şimdiki iş ustalaşmadıysa soluk) ve sıradaki satır tam görünür (ad, maaş, şartlar); onun altındaki tek satır siluet ve "???"; daha ötesi hiç çizilmez. Henüz ulaşılmayan sekme "Önceki sekmenin işlerinde ilerledikçe açılır" der.
- **Şartlar** (`core/requirements.ts`): önceki işte ustalık (`mastered`), kurs, eşya, araç (o araç ya da daha iyisi), adres, sınıf, işletme açık ya da seviyesi, yöneticili işletme sayısı, "şunlardan biri".
- **24 kurs**, en uzunu 2 yıl (2026-10-21'de kısa ustalığa göre kısaldı): İlk Yardım 1 ay, Ehliyet 2, Ağır Vasıta 4, Yazılım Kampı 4, BT, Gazetecilik, Muhasebe, Aşçılık, Elektrikçilik, Akşam Lisesi 6, Turizm, MBA, Hemşirelik, Eğitim, Pilotluk, Doktora, Cerrahi İhtisas 12, Bilgisayar, İktisat, Mühendislik, Hukuk, Mimarlık, Veteriner 18, Tıp 24.
- **Deneyim reklamı:** 3 ay ustalık, her işte bir kez, ustalık bitmeden.
- **Hedefler:** "Yeni işe geç: Bulaşıkçı" gibi hedefler o satırdaki ya da daha yukarıdaki herhangi bir işle tamamlanır.
- **Ekran** (`ui/career/`): üstte şimdiki iş, ustalık halkası, maaş; "Meslekler / Kurslar". Meslekler: İşçi / Ofis / Uzman / Zirve sekmeleri, satırlar ("Sv N") iki sütun, bağlar çizgiyle (ustalaşılan işten çıkan yeşil). Kutuya dokununca ortada küçük kart: maaş, ustalık süresi, şartlar ✓ / ○ ve "Git", açtığı işlerin adları, "İşe gir".
- **İş değişimi şovu** (`ui/career/JobShow.tsx`): eski iş ortada, sola kayıp çıkar; yenisi sağdan ışınlar ve konfetiyle gelir, `fanfare`; maaş eskisinden yenisine sayar, "+$X/ay", açtığı işler, "Harika!"; oyuncu kapatmazsa 3,5 sn sonra kendisi kapanır. **"Usta oldun!"** (`ui/career/MasteredToast.tsx`): ustalık %100 olunca hangi ekranda olursa olsun üstte 4 sn yeşil şerit, `unlock`; dokununca Kariyer açılır.
- **Bağlı botta** (`npm run sim`): Kasiyer 28, CEO 58, Yönetim Kurulu Başkanı 69 yaşında (Milyarder şartı). Maaşın gelirdeki payı 23–50 yaşta %1–7, CEO'da ~%24.
- **İkonlar:** 104 mesleğin hepsinin ikonu oyunda (`public/assets/jobs/v2/`; komutlar [archive/art-prompts-careers.md](./archive/art-prompts-careers.md)); resmi yüklenemeyen meslekte çanta simgesi.

### 4.5 Eşyalar (`config/lifestyle.ts`)

Gerçek fiyatlı, gelir bonusu yok (karar 2026-10-20); değerleri hayatı göstermek ve meslek açmak. Mağazada sıradaki her eşyanın altında "Açar: …".

| Tür | Liste ve fiyat | Not |
| --- | --- | --- |
| Araç (12) | Bisiklet $150, retro skuter $1,2K, emektar sedan $5K, motosiklet $8K, hatchback $18K, SUV $40K, pikap $55K, makam sedanı $90K, spor coupe $180K, lüks arazi aracı $250K, süper otomobil $500K, grand lüks $1,5M | Sırayla; her ev bir araç açar (§4.6). Sahnede evin önünde |
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
- **Ev–araç zinciri** (karar 2026-10-11; 2026-10-21'den beri birebir): **her ev tam bir araç açar** (çadır bisiklet, minibüs skuter, oda sedan, eski daire motosiklet, … malikâne grand lüks); evin aracı alınmadan sonraki eve geçilmez. Tören bu kuralın tek istisnası.
- **Tören bir sonraki eve taşır** (2026-10-21, kullanıcı: sabit hikâye evine atlamak 4 aracı birden açıyordu): her sınıf atlama kahramanı oturduğu evden bir üsttekine taşır, kiracı ve bedava; belli bir ev göstermez. **Milyoner** ("Bu sefer kendime bir ev aldım"): bir sonraki ev, o ev yalnız kiralanabiliyorsa satın alınabilir ilk ev (İlk Kendi Evin) sahipli olarak; atlanan evlerin araçları da hediye (`core/state.ts` `applyClassUp`).

### 4.7 Elle kazanç: Çalıştır, şişe, Şans, olay kartları (`config/scene.ts`, `config/events.ts`, `core/economy/manual.ts`)

- **"Çalıştır":** yöneticisiz işletmenin tek turu. Çiçek Tezgâhı'nın ilk turu $25, yani ~12 şişe (karar 2026-10-20: tek tezgâhın turu bir şişeden belirgin fazla).
- **Şişe ve kutular:** sınıfa göre sabit: Sokak $2, Gündelikçi $20, İşçi $50 (bozuk para; 2026-10-21/22, kullanıcı: önce $2 / $3 / $5; Sokak $2 kalır ki ilk tezgâh turu iki şişeden fazla etsin); gelirle büyümez, başta anlamlı, sonra süs. Ekranda en çok 4, 2,5 sn'de bir yenisi. Orta Sınıf'ta biter (kahraman bir daha yere eğilmez); yerini olay kartları alır.
- **Şans'ın bulduğu:** 5–10 dk'da bir (ilk yöneticiye kadar 1,5–2,5 dk) ağzında cüzdanla gelir ve alınana kadar bekler (2026-10-21; önceden 12 sn); ödül 15 şişe + 30 sn gelir.
- **Olay kartları** (Orta Sınıf töreninden sonra, oturumun ilk çağrısı 60–90 sn, sonra 4–6 dk'da bir): bir tanıdık arar. 50 kart, üç tür: sağlamcı / cesur (sağlamcı 45 sn gelir kesin, cesur %50 +130 sn ya da −20 sn, para gerçekten eksilir), teşekkür (45 sn) ve iki eşit seçenek (ikisi de 45 sn). Her yöneticinin üç kartı işletmenin üç görünümüne bağlı (story-v2 §4d). Yönetici kartları o yönetici işe alındıysa gelir. Kartlar deste gibi dağıtılır: açık olanların hepsi çalmadan kimse tekrar çalmaz (2026-10-21; 10 kartla aynı kişiler sürekli arıyordu; `runtime/eventDeck.ts`). Günlük sınır yok: uzun oturumda birkaç dakikada bir çağrı gelir (kullanıcı). Ayrıntı ve metinler story-v2 §4d.
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
- **Reklam izleyen** (19 reklam yeri, [monetization-v2.md §4](./monetization-v2.md)): Orta Sınıf 35 dk, Milyoner 1 sa 1 dk, Milyarder 7 sa 26 dk (%47 erken; karar 2026-10-21: %40–50).
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

- **Her işletmeye kendi seviye tablosu** (bugün 13'ü Çiçek Tezgâhı'nın biçiminde); Fabrika'dan Medya'ya ~8,5 saat yeni işletme yok.
- **2. nesil:** devir, mirasın sıfırlamasız anlamı, Ada ve Lumen içeriği (Lumen 10 işletme için çizildi; 14'e ve üç görünüme göre ek görsel) (§4.10).
- **Gece Vardiyası IAP'ı** yeni çevrimdışı oranına göre (monetization §5).
- **Eşyalar meslek dışında bir şey açmıyor** (olay, yer); araç sayısı 12'de (yeni araç sahne kesimi ve zincir yeri ister).
- **Telefonda bakılacak:** gerçek oyuncunun kurs yolu (bot en ucuzunu seçiyor), tezgâh ve şişenin ilk hissi, iş panosunun uzunluğu.
- Açık tasarım konuları ve oyuncuyu tutma önerileri: [discussion-notes.md](./discussion-notes.md).

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
