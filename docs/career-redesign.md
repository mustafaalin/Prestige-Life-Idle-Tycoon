# Kariyerin yeniden tasarımı (öneri 2, 2026-10-21)

Durum: **onaylandı (2026-10-21); 1. adım (veri, kurallar, simülatör) kodda.** Geçerli kurallar ve sayılar artık [game-design-v2.md §4.4](./game-design-v2.md)'te ve `config/careers.ts`'te; aşağıdaki §2–3 öneri hâlidir, uygulamada değişenler §8'de. Ekran (§4) ve görseller sırada; bitince bu belge [archive/](./archive/)'e gider. İlk öneri (13 basamaklı merdiven) beğenilmedi: kısa soluklu ve az meslekliydi. Karar verilince kurallar [game-design-v2.md §4.4](./game-design-v2.md)'e taşınır, bu belge [archive/](./archive/)'e gider.

## 1. Araştırma

**Referans oyun (Idle Guy), kullanıcının ekran görüntüleri ve mağaza/başarım sayfaları:**
- İş ekranı **dört sekme**: Worker (kova ikonu), masabaşı (dosya), kürsü, roket. Her sekme bir **ağaç**: satırlar iş seviyesi (lvl 14, 15, 16…), işler kutu, aralarında çizgiler. Bir iş birden çok yerden gelebilir, dallar birleşir.
- Kutunun durumu: **ACCEPT** (girilebilir), **RETURN** (önceden yapılmış, geri dönülebilir), **Done** (şimdiki), **???** (kilitli: adı ve maaşı gizli), FAIL/REPLAY (sınav).
- **Ustalık:** her işte %0 → %100. Bir sonraki işin şartı önceki işte %100 ustalık (Editor: "Master the job: Office manager (100%)").
- **Şart penceresi:** ustalığın yanında 4–6 şart (Editor: Şans 3, Mutluluk 60, Ev en az 5. seviye, Yemek 4, Ulaşım 4, Güç 12), her satırda ✓ ya da **GO**. Şart listesi oyuncunun yapılacaklar listesi olur; bütün sistemleri birbirine bağlar.
- **Uzun soluk:** başarımlar 12., 27., 43., 52. ve **112. seviye** işten söz ediyor; "bir işte 36 ay kal", "araba işinde kariyere başla". Mağaza açıklaması: işsiz başlayıp en sonunda "Dünya Bankası başkanı".
- Çevrimiçi rehberlerde ilk işler: kapıcı, güvenlik görevlisi, kıdemli güvenlik görevlisi; şartlar "barınma, kıyafet, yemek, eğitim, ehliyet ve sertifika".

**Bizim simülatör (bağlı oyuncu, bugünkü ekonomi):** 1. nesil 17 → 80 yaş ~24 gün (bir yıl 16 dk oyun). Aylık gelir: 21 yaş ~$31K, 26 ~$90K, 32 ~$210K, 42 ~$480K, 55 ~$850K, 70 ~$2M. Bugün maaş gelirin %5–9'u, CEO 44 yaşta (11. gün) ve kariyer orada bitiyor.

Kaynaklar: [Idle Guy (App Store)](https://apps.apple.com/us/app/idle-guy-life-simulator-games/id1612163874), [başarımlar (Exophase)](https://www.exophase.com/game/idle-guy-android/achievements/), [iş başarımı](https://www.exophase.com/achievement/idle-guy-android/632636-get-a-job-as-an-agent/), [oyun rehberi (iofreeonline)](https://www.iofreeonline.com/IOS/game/Idle-Guy-Life-Simulator.html), [games-manuals](https://games-manuals.com/wiki/idle-guy-life-simulator-games-3659020); [rakip analizimiz](./research/idle-guy-analysis-2026-10-20.md).

## 2. Öneri: dört alanlı meslek ağacı

**97 meslek, 60 iş seviyesi, dört sekme.** Kariyer bütün 1. nesli kaplar: zirve (Yönetim Kurulu Başkanı) bağlı oyuncuda ~70 yaşta (~21. gün), gündelik oyuncuda hiç ya da ömrün sonunda. Bugünkü 63 mesleğin hepsi yerinde kalır (kayıt ve ikonlar), 34 yeni meslek eklenir.

| Sekme | Ne | Seviye | Meslek |
| --- | --- | --- | --- |
| **İşçi** | Beden işi: hamallık, mutfak, şantiye, depo, direksiyon, zanaat | 1–26 | 29 |
| **Ofis** | Masabaşı: kasa, satış, büro, banka, muhasebe, İK, müdürlükler | 4–34 | 25 |
| **Uzman** | Diploma isteyen: sağlık, yazılım, medya, hukuk, mimarlık, pilotluk, öğretmenlik | 6–38 | 29 |
| **Zirve** | Üst yönetim: direktörler, C seviyesi, CEO, yönetim kurulu | 36–60 | 14 |

### Kurallar

- **Ustalık:** her işte %0 → %100; süresi işin seviyesiyle uzar: `3 + 0,56 × (seviye − 1)` oyun ayı, en çok 36 ay (1. sv 3 ay, 20. sv ~14 ay, 40. sv ~25 ay, 60. sv 36 ay). İş kartının çevresinde dolan şerit; %100'de "Usta" rozeti, kalıcı.
- **Her mesleğin şartı:** önceki işlerinden **birinde** %100 ustalık (çizgiyle bağlı olanlar) **+ 2–3 ek şart**. Ek şart türleri: sınıf, ev seviyesi, araç seviyesi, kıyafet seviyesi, eğitim (kurs/diploma), eşya, işletme (açık ya da seviyesi), yöneticili işletme sayısı. Şartlar oyunun öbür sistemlerini sırayla çalıştırır: "Garson için iş kıyafeti", "Taksi için ehliyet ve emektar sedan", "CEO için 5 yöneticili işletme".
- **Geri dönüş yok:** çalışılmış işe dönülmez. Şimdiki işte %100 ustalık olmadan iş değiştirilemez; bir sonraki iş her zaman ona çizgiyle bağlı bir önceki işte ustalık ister. Her bıraktığın iş ustalaşılmış olur, dalları açık kalır, çıkmaz yol olmaz.
- **Görünürlük:** girilebilen ve yapılmış işlerin adı ve maaşı görünür; bir sonraki kilitli işlerin adı görünür, maaşı gizli; daha ötesi "???".
- **Sekmeler arası geçiş:** dallar sekmeleri aşar (İşçi'deki Sevkiyat Sorumlusu → Ofis'teki Lojistik Koordinatörü; İşçi'deki Aşçıbaşı → Ofis'teki Restoran Müdürü). Sokaktan masabaşına, oradan zirveye bir hayat hikâyesi çizilir.
- **Giriş ücreti yok.** Para eğitime, eşyalara ve işletmelere gider.
- **Deneyim reklamı:** her reklam 3 ay, her işte yalnız 1 kez (reklamsız pakette de aynı).

### Maaş eğrisi

**Yıllık zam + küçük iş adımları.** Aynı işte her tam oyun yılı maaş yaklaşık %10–15 artar ("Zam!" anı); zam ustalık %100 olunca durur (kalmak maaşı şişirmez, sonraki iş hep daha iyi kalır). Ustalığı 1 yıldan kısa ilk işlerde zam yok; onların maaşı daha yüksek başlar (~$800–1.000). Yeni işin başlangıç maaşı, önceki işin zamlı maaşından %10–25 yüksek; hiçbir iş geçişi bundan büyük sıçramaz. Yollar ~18–20 işe uzar (gerekirse ara meslekler eklenir). Hedef: maaş gelirin **%20–35'i** (referansta maaş ana gelir; bizde işletmeler ana gelir kalır ama iş değişimi gerçekten hissedilir). Kesin sayıları simülatör verir.

| Seviye | Maaş/ay | Ustalık | Bağlı oyuncu varışı (tahmin) |
| --- | --- | --- | --- |
| 1 | $300 | 3 ay | 17 |
| 10 | $1,3K | 10 ay | 19 |
| 20 | $7K | 18 ay | 24 |
| 30 | $36K | 26 ay | 31 |
| 40 | $190K | 34 ay | 42 |
| 50 (CEO) | ~$1,5M | 31 ay | ~55 |
| 60 (YK Başkanı) | ~$3M | 36 ay | ~70 |

(Tablodaki ustalık ve maaşlar eski tahmin; ustalık yeni formülle, maaşlar zamla birlikte simülatörden yeniden çıkar.) CEO ~$1,5M; CEO'dan sonraki adımlar her biri %10–25, zirve ~$3M (eski önerideki $1,5M → $6M sıçraması kaldırıldı). Yan etki: Milyarder 70 yaştan ~60'a çekilebilir; hikâyedeki "Milyarder töreni çok geç" sorununa iyi gelir.

## 3. Meslekler

`*` yeni meslek (ikonu GPT ile üretilecek). "Önceki" sütunu: bunlardan birinde %100 ustalık. Seviye maaşı belirler (yukarıdaki eğri).

### İşçi

| Sv | Meslek | Önceki | Ek şartlar |
| --- | --- | --- | --- |
| 1 | El İlanı Dağıtıcısı | — | — |
| 2 | Hamal* | El İlanı | — |
| 3 | Bulaşıkçı | El İlanı | Gündelikçi |
| 3 | Temizlik Görevlisi* | El İlanı | iş kıyafeti |
| 4 | Bisikletli Kurye | Hamal, El İlanı | bisiklet |
| 5 | Garson | Bulaşıkçı | iş kıyafeti, minibüs (ev 2) |
| 5 | Depo İşçisi* | Hamal | iş kıyafeti |
| 6 | İnşaat İşçisi | Hamal, Depo İşçisi | Gündelikçi |
| 6 | Marangoz Çırağı* (Rıza Amca'nın yanında) | Hamal, Temizlik | alet çantası |
| 7 | Güvenlik Görevlisi* | Temizlik, Depo İşçisi | ilk yardım |
| 7 | Hastane Görevlisi | Temizlik Görevlisi | kiralık oda |
| 8 | Kurye | Bisikletli Kurye | skuter, ehliyet |
| 9 | Aşçı | Bulaşıkçı, Garson | kiralık oda |
| 10 | Çırak Elektrikçi | İnşaat İşçisi | alet çantası |
| 10 | Taksi Şoförü | Kurye | emektar sedan |
| 11 | Marangoz* | Marangoz Çırağı | Çiçek Tezgâhı sv 5 |
| 12 | Kıdemli Güvenlik Görevlisi* | Güvenlik | İşçi Sınıfı |
| 13 | Tır Şoförü | Kurye, Taksi | ağır vasıta ehliyeti |
| 14 | Elektrikçi | Çırak Elektrikçi | elektrik sertifikası |
| 14 | Aşçıbaşı Yardımcısı | Aşçı | aşçılık okulu |
| 15 | Depo Şefi | Depo İşçisi, Tır Şoförü | İşçi Sınıfı |
| 16 | Şantiye Ustabaşı | İnşaat İşçisi, Elektrikçi | eski kiralık daire (ev 4) |
| 17 | Usta Marangoz* | Marangoz | şık günlük kıyafet |
| 18 | Usta Elektrikçi | Elektrikçi | araç sv 4 |
| 19 | Aşçıbaşı | Aşçıbaşı Yardımcısı | Restoran açık |
| 20 | Sevkiyat Sorumlusu | Depo Şefi | telefon |
| 22 | Şantiye Şefi | Şantiye Ustabaşı | Orta Sınıf |
| 24 | Mobilya Atölyesi Şefi* (babanın hayali) | Usta Marangoz | Orta Sınıf, Fırın sv 5 |
| 26 | Müteahhit* | Şantiye Şefi | İnşaat Şirketi açık |

### Ofis

| Sv | Meslek | Önceki | Ek şartlar |
| --- | --- | --- | --- |
| 4 | Kasiyer | El İlanı | iş kıyafeti |
| 7 | Mağaza Satış Danışmanı | Kasiyer | telefon |
| 8 | Çağrı Merkezi Temsilcisi* | Kasiyer, Garson | telefon, kiralık oda |
| 8 | Büro Memuru | Kasiyer, Çağrı Merkezi | akşam lisesi* |
| 10 | Banka Veznedarı | Büro Memuru | şık günlük kıyafet |
| 11 | Satış Temsilcisi | Mağaza Satış Danışmanı, Çağrı Merkezi | emektar sedan |
| 12 | Yönetici Asistanı* | Büro Memuru | şık günlük kıyafet |
| 14 | Muhasebeci | Banka Veznedarı, Büro Memuru | muhasebe sertifikası |
| 14 | Kıdemli Satış Temsilcisi | Satış Temsilcisi | araç sv 4 |
| 15 | İK Uzmanı* | Yönetici Asistanı | dizüstü |
| 16 | Sosyal Medya Asistanı | Büro Memuru, Çağrı Merkezi | dizüstü |
| 17 | Mağaza Müdürü | Kıdemli Satış | Orta Sınıf |
| 18 | Emlak Danışmanı* | Satış Temsilcisi | Orta Sınıf, telefon |
| 19 | Lojistik Koordinatörü | Sevkiyat Sorumlusu (İşçi), Büro Memuru | dizüstü |
| 20 | Finansal Analist | Muhasebeci | iktisat diploması |
| 21 | İçerik Üreticisi | Sosyal Medya Asistanı | fotoğraf makinesi |
| 22 | Ofis Müdürü* | İK Uzmanı, Yönetici Asistanı | deve tüyü palto |
| 24 | Operasyon Müdürü | Lojistik Koordinatörü, Ofis Müdürü | Mini Market açık |
| 24 | Bölge Satış Müdürü | Mağaza Müdürü, Kıdemli Satış | araç sv 5 |
| 26 | Finans Müdürü | Finansal Analist, Muhasebeci | sitede daire (ev 6) |
| 26 | İK Müdürü* | İK Uzmanı, Ofis Müdürü | takım elbise |
| 28 | Restoran Müdürü | Aşçıbaşı (İşçi), Mağaza Müdürü | Restoran sv 5 |
| 30 | Pazarlama Müdürü* | İçerik Üreticisi, Bölge Satış | Milyoner |
| 32 | Otel Müdürü | Restoran Müdürü | turizm işletmeciliği |
| 34 | Yatırım Bankacısı | Finans Müdürü | MBA |

### Uzman

| Sv | Meslek | Önceki | Ek şartlar |
| --- | --- | --- | --- |
| 6 | Sokak Fotoğrafçısı | El İlanı | fotoğraf makinesi |
| 12 | BT Destek Uzmanı | Büro Memuru, Çağrı Merkezi | BT sertifikası, dizüstü |
| 13 | Hasta Bakıcı | Hastane Görevlisi (İşçi), Güvenlik | ilk yardım |
| 15 | Stajyer Web Geliştirici | BT Destek | yazılım kampı |
| 16 | Hemşire | Hasta Bakıcı | hemşirelik okulu |
| 16 | Gazeteci | Sokak Fotoğrafçısı, İçerik Üreticisi | gazetecilik |
| 18 | Öğretmen* | Büro Memuru, Hasta Bakıcı | eğitim fakültesi* |
| 18 | Web Geliştirici | Stajyer Web Geliştirici | — |
| 22 | Yazılım Mühendisi | Web Geliştirici | bilgisayar mühendisliği |
| 22 | Editör | Gazeteci | Orta Sınıf |
| 24 | Avukat* | Yönetici Asistanı, Öğretmen | hukuk fakültesi* |
| 24 | Mimar* | Şantiye Şefi (İşçi), Web Geliştirici | mimarlık* |
| 24 | Veteriner* (Şans) | Hasta Bakıcı, Hemşire | veterinerlik*, Şans'ın gümüş tasması |
| 24 | Başhemşire | Hemşire | sitede daire |
| 26 | Doktor | Hemşire, Hasta Bakıcı | tıp fakültesi |
| 26 | Kıdemli Yazılım Mühendisi | Yazılım Mühendisi | — |
| 28 | Pilot* | Tır Şoförü (İşçi), Yazılım Mühendisi | pilotluk okulu* |
| 28 | Takım Lideri | Kıdemli Yazılım Mühendisi | takım elbise |
| 30 | TV Yapımcısı | Editör, İçerik Üreticisi | Milyoner |
| 30 | Kıdemli Avukat* | Avukat | ilk kendi evin |
| 30 | Profesör* | Öğretmen | doktora* |
| 32 | Cerrah | Doktor | cerrahi ihtisas* |
| 32 | Mühendislik Müdürü | Takım Lideri | Lojistik Deposu açık |
| 34 | İnşaat Proje Müdürü | Şantiye Şefi, Mimar | mühendislik |
| 34 | Kaptan Pilot* | Pilot | araç sv 7 |
| 36 | Hâkim* | Kıdemli Avukat | bahçeli ev |
| 36 | Rektör* | Profesör | Milyoner |
| 38 | Başmimar* | Mimar, İnşaat Proje Müdürü | Fabrika açık |
| 38 | Başhekim | Cerrah, Başhemşire | MBA |

### Zirve

| Sv | Meslek | Önceki | Ek şartlar |
| --- | --- | --- | --- |
| 36 | Satış Direktörü | Bölge Satış Müdürü, Pazarlama Müdürü | MBA |
| 36 | Lojistik Direktörü | Operasyon Müdürü | MBA |
| 38 | Konaklama Direktörü | Otel Müdürü | villa |
| 38 | Medya Direktörü | TV Yapımcısı | Medya Şirketi açık |
| 40 | Teknoloji Direktörü (CTO) | Mühendislik Müdürü | makam sedanı |
| 42 | Finans Direktörü (CFO) | Finans Müdürü, Yatırım Bankacısı | smokin |
| 42 | Satış Genel Müdürü | Satış Direktörü | 3 yöneticili işletme |
| 44 | Hukuk Direktörü* | Kıdemli Avukat, Hâkim | — |
| 44 | Havayolu Operasyon Direktörü* | Kaptan Pilot, Lojistik Direktörü | — |
| 46 | Genel Müdür Yardımcısı (COO)* | herhangi bir direktör | 4 yöneticili işletme |
| 50 | CEO | CTO, CFO, Satış Genel Müdürü, COO, Başhekim, Medya Direktörü, Konaklama Direktörü | Milyoner, MBA, 5 yöneticili işletme |
| 53 | Yönetim Kurulu Üyesi* | CEO | Milyarder |
| 56 | Yatırım Fonu Kurucusu* | CEO, Yatırım Bankacısı | Milyarder, Teknoloji Girişimi açık |
| 60 | Yönetim Kurulu Başkanı* | Yönetim Kurulu Üyesi, Yatırım Fonu Kurucusu | Milyarder, jet |

**Yeni kurslar/diplomalar:** akşam lisesi, eğitim fakültesi, hukuk fakültesi, mimarlık, veterinerlik, pilotluk okulu, doktora, cerrahi ihtisas. Kurslar sekmesinde "Eğitim" başlığıyla; çoğu Ofis ve Uzman işinin kapısı akşam lisesi.

**Yeni şart türleri:** araç seviyesi (sahip olunan en iyi araç), kıyafet seviyesi, yöneticili işletme sayısı. Ev seviyesi zaten var.

**Hikâye bağları:** Marangoz hattı Rıza Amca'nın yanında başlar, Mobilya Atölyesi Şefi babanın "Mehmet & Rıza Atölyesi" hayaline varır (hikâyedeki atölye sorunu kariyerle kapanabilir). Garson önsöze bağlanır. Veteriner Şans'a bağlanır. Annenin mesajları büyük terfileri anar.

## 4. Ekran (referansa benzer)

- **Dört sekme** üstte (ikonlu: kova, dosya, stetoskop/kalem, yıldız). Her sekme dikey bir ağaç: solda seviye etiketi ("Sv 14"), satırda o seviyenin işleri kutu olarak, kutular arası çizgiler; şimdiki iş ekranda ortalanmış açılır.
- **Kutu:** ikon, ad, maaş; altta düğme: **İşe gir** (yeşil), **Geri dön** (gri), **Şimdiki** (çevresinde ustalık şeridi ve %), **Usta** rozeti; kilitli: ad + "?" maaş; ötesi "???".
- **Şart penceresi:** kutuya dokununca; ikon, ad, maaş, ustalık süresi; şartlar ✓ / ○ ve eksiklerde **Git** (mağaza, kurs, işletme, ev). Referanstaki Editor penceresi gibi.
- **Kurslar sekmesi:** süren kurs ve kalan süre; açılabilir kurslar ("Açar: Avukat"); bitenler.
- **İş değişimi şovu:** arka plan kararır; eski işin kutusu ve maaşı ortada, sola kayıp çıkar; yeni iş sağdan gelir, ışınlar ve konfeti; maaş eskisinden yenisine sayarak artar, yanında "+$X/ay"; altta "Açtığı: …". Ustalık %100 olunca da küçük bir "Usta!" anı.
- **Kariyer düğmesinde "!":** girilebilir yeni bir iş ya da ustalık doldu.

## 5. Kayıt

- `careerId` ve `jobSeconds` aynen kalır; hiçbir id silinmez, değişmez. Ustalık `jobSeconds`'tan hesaplanır, yeni alan gerekmez.
- Eski oyuncunun önceki aylarının hepsi ustalığa sayılır; şimdiki işi olduğu yerde kalır. Ağaçta yeri olmayan id kalmaz (63 mesleğin hepsi ağaçta).
- Deneyim reklamının "işte bir kez" sınırı yeni bir `marks` anahtarı (varsayılan boş).
- `npm run savecheck` ile denenir.

## 6. İş planı (onaydan sonra)

1. Veri: seviyeler, sekmeler, önceki işler, şartlar, yeni şart türleri, yeni kurslar; `npm run sim` ile maaş eğrisi, zirve yaşı, sınıf yaşları (hedef: CEO ~55, YK Başkanı ~70; maaş payı %20–35).
2. Ekran: sekmeli ağaç, şart penceresi, Kurslar sekmesi, ustalık şeridi.
3. İş değişimi şovu ve "Usta!" anı, sesi.
4. Görseller: 41 meslek ikonu ([art-prompts-careers.md](./art-prompts-careers.md)); kurslar ve sekmeler kod simgesi kullanır.

## 7. Kararlar

Kullanıcı 2026-10-21'de onayladı:
1. Dört sekme (İşçi, Ofis, Uzman, Zirve) ve 97 meslek: **uygun.**
2. Maaşlar: iş geçişinde artış **%10–25**; CEO $1,5M → $6M sıçraması fazla. Çözüm (kullanıcının seçimi): **yıllık zam** (aynı işte her oyun yılı ~%10–15), yollar ~18–20 iş, CEO ~$1,5M, zirve ~$3M. Elenen seçenekler: 45 işlik uzun yollar (130+ meslek), düşük tavan (CEO ~$100K, maaş hissedilmez).
3. Eski işe geri dönüş (RETURN): **olmasın** (oyuncuya yararı yok). Yerine: şimdiki işte %100 ustalık olmadan iş değiştirilemez; sonraki iş her zaman bağlı önceki işte ustalık ister.
4. Rıza'nın atölyesi Mobilya Atölyesi Şefi ile kapanır: **uygun.**
5. En uzun ustalık **36 ay** (önceki öneri 50 aydı).
6. İlk işlerde (ustalık < 1 yıl) zam yok, başlangıç maaşları yükseltilir.

## 8. Uygulamada değişenler (1. adım, 2026-10-21; kullanıcı onayladı)

Kullanıcı: maaş işletmelerin yanında az kazandırıyor ama fazlası dengeyi bozuyorsa böyle kalsın.

- **60 seviye yerine 15 satır.** İş geçişi %10–25 kalsın diye bir işin bütün önceki işleri aynı satırda olmalı (iki satır atlayan bağ %40'ı geçer). Maaş satıra bağlı; bağlar hep bir satır yukarı. Ağaç buna göre yeniden dizildi; zincirleri doldurmak için **7 ara meslek** eklendi: Paramedik, Yiyecek-İçecek Müdürü, Uzman Doktor, Ülke Satış Müdürü, Yayın Yönetmeni, Tedarik Zinciri Müdürü, Portföy Yöneticisi. Toplam 104 meslek.
- **Ustalık satıra bağlı:** `min(36, 6 × satır − 3)` ay. İlk iki satırda 1 yıldan kısa (zam yok), 7. satırdan sonra 36 ay.
- **Maaş:** El İlanı $300 (ilk işletmenin temposu bozulmasın diye; $1.000 ilk dakikaları fazla hızlandırdı). Geçiş 2–5. satırlarda %10, sonra %25; yıllık zam %20 (önerideki %10–15 CEO'yu ~$80K'da bırakıyordu). CEO $208K → ustalıkta $360K, Yönetim Kurulu Başkanı $970K → $1,7M.
- **Bağlı bot:** CEO 51 yaşta, Yönetim Kurulu Başkanı 70 yaşta; bütün tempo hedefleri tuttu. Maaşın payı 23–45 yaş arasında %2–8 (işletmeler çok hızlı büyüyor), CEO'da %25.
- **Başhekim, Başmimar, Rektör, Hâkim'in yolu:** CEO'ya doğrudan değil, Genel Müdür Yardımcısı (COO) üzerinden gider.
- **Hedefler:** "Bulaşıkçı ol" ve "Garson ol" hedefleri o satırdaki herhangi bir işle tamamlanır.
