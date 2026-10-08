# Prestige Life v2 — Hikaye ve Karakterler

Son güncelleme: 2026-10-08 · İlgili: [game-design-v2.md](./game-design-v2.md), [rebuild-plan.md](./rebuild-plan.md)

Bu belge hikayenin, karakterlerin ve tonun tek kaynağıdır. Dayanağı [rapor](./report-v2.md) §6 (fakirlikten zenginliğe hissi) ve §7'dir (hanedan, olay kartları).

**Kararlar (2026-10-07):**

- Kahraman: genç bir adam; adını oyuncu verir. Görünüşü yarı 3D yeni tasarım (kılavuz `art/pilot/01-hero-sheet/A1-semi3d.png`, §8).
- Yoldaş: sokak köpeği Şans (İng. Lucky).
- Ton: sıcak ve umutlu, olay kartlarında hafif mizah.
- Görseller: özellikler görsel beklemez, yer tutucuyla yapılır.

**Kararlar (2026-10-08):**

- Görsel roman yaklaşımı: durağan pozlar, ifade portreleri, konuşma balonları; önsöz çizgi roman kareleriyle (§8). Karakter ve mekân görselleri sıfırdan üretilir.
- Önsöz: kahraman işten kovulur, annesiyle lojmandan çıkarılır; anne teyzenin yanına gider, kahraman sokakta kalır (§4). Anne sokakta değildir.
- Annenin evi kendi merdiveniyle ilerler; zirvesi konak ("seni saraylarda yaşatacağım", §5).
- Ana sahne dış mekân; kirli bir ara sokakta başlar, şişe ve kutular sahnede dokunarak toplanır (§4).
- Hikâye tek kahramanın hayatında tamamlanır; varis ömrün sonunda (97 yaş) devralır, erken değil (§6, [game-design-v2.md §4.9](./game-design-v2.md)).
- Kovulma nedeni (kullanıcı, 2026-10-08): kahraman annesinin doğum gününde servis sırasında onu arar; Bülent Bey yakalar, kovar ve lojmanı boşaltmalarını ister. Önsöz oyunda (1.18).
- Şans'a dokunmak para vermez; ara sıra bulduğu cüzdanı getirir, kahraman sahibine geri verir ve teşekkür ödülü alır (§3).
- Her işletmenin kendi yöneticisi var: kahramanın yolda tanıştığı insanlar (§3).

**Kararlar (2026-10-08, hikâye omurgası; kullanıcı onayı, GPT incelemesiyle sadeleşti):**

- **Zincir kuralı:** Ana hikâye sadece sınıf törenlerine bağlanır (her oyuncu sınıfları aynı sırayla ve mutlaka geçer, sınıf geri alınmaz). Oyuncunun yapıp yapmayacağı belli olmayan şeyler (bir alım, cüzdan sayısı, yönetici, kilometre taşı) ana zinciri tetiklemez; onlara bağlı anlar kendi içinde kapalı yan anlardır. Böylece "denk getirme" ve ek yönlendirme gerekmez (§4).
- **Babanın defteri ve Rıza Amca:** İşçi Sınıfı'nda annenin cümlesi merakı açar; Orta Sınıf töreninde eski ev kendiliğinden geri alınır, çatı katında defter bulunur, içinden baba ile genç Rıza'nın fotoğrafı düşer. Rıza babanı tanıyordu ama senin onun oğlu olduğunu bilmiyordu; ilk yardımı karşılıksızdı (§3, §4).
- **Anne mesajları** takvime değil hikâyedeki duruma (sınıfa) bağlıdır; günlük sınır sadece sunumu düzenler, gelinmeyen günlerin mesajları birikip arka arkaya gösterilmez (§3).
- **Yönetici anları** önce 3 yöneticiyle (Rıza, Selin, Hüseyin Usta) denenir; her biri kilometre taşına bağlı tek an, zincire bağlı değil (§3).
- **Faz 2'ye kalanlar (ilke kararı alındı, ayrıntı ilk testten sonra):** Eş, Şans'ın cüzdanını bulduğu Nevin Hanım'ın torunu; tanışma zenginlikten önce, düğün Milyoner'de. Varis 17 yaşında bir torun. Ölüm hiç gösterilmez. 4. perde (54 → 97 yaş) oynanabilir bir vakıf projesi (§6).

---

## 1. Tek cümle

**Her şeyini kaybetmiş genç bir adam, sokakta bulduğu köpeği ve annesine verdiği sözle sıfırdan dünyanın en zengini olur; sonra servetini değil, hikayesini çocuğuna bırakır.**

## 2. Ton kuralları

- **Sıcak ve umutlu.** Oyuncu kahramanın iyiliğini ister. Zafer anları duygusaldır, utandırıcı değildir.
- **Evsizlikle dalga geçilmez.** Sokak zor ama onurlu anlatılır. Mizah kahramanın acizliğinden değil, durumların absürtlüğünden gelir ("Kuzenin üçüncü kez kripto fırsatı öneriyor").
- **Mizah olay kartlarında ve konuşma balonlarında,** törenlerde değil.
- **Kısa metin.** Konuşma balonu en fazla 2 satır; tören metni en fazla 3 kısa cümle. 10 saniyede okunur.
- **İki dilde birlikte yazılır** (Türkçe ve İngilizce). Karakter adları yerelleştirilir; birebir çeviri değil, aynı duyguyu veren karşılık aranır.

## 3. Karakterler

| Karakter | TR / EN | Rolü | Nerede görünür |
| --- | --- | --- | --- |
| Kahraman | Oyuncu verir (varsayılan **Can** / **Alex**) | Oyuncunun kendisi | Sahnenin merkezi, her şey |
| Köpek | **Şans** / **Lucky** | Sadık yoldaş, sevimlilik ve paylaşılabilirlik | Sahnede her zaman |
| Akıl hocası | **Rıza Amca** / **Old Ray** | Sokakta yol gösteren yaşlı adam; ilk yönetici; babanın eski dostu (Orta Sınıf'ta ortaya çıkar) | Rehber (onboarding), Çiçek Tezgâhı yöneticisi, olay kartları |
| Baba | **Mehmet** / **Martin** | Vefat etmiş; sadece defteri ve eski fotoğrafla var | Orta Sınıf töreni (defter, fotoğraf) |
| Anne | **Annen** / **Mom** | Duygusal çapa; verilen söz | Önsöz, telefon/mektup balonları, annenin evi merdiveni (§5) |
| Eski patron | **Bülent Bey** / **Mr. Bryce** | Önsözde kahramanı kovan restoran zinciri sahibi; lojmanın da sahibi | Önsöz, Milyarder töreni, Otel Zinciri yöneticisi, olay kartları |
| Kuzen | **Kuzen** / **Cousin** | Kripto esprili, kendinden fazla emin kuzen (mizah) | Teknoloji Girişimi yöneticisi, olay kartları (§7) |
| Eş | Oyuncu verir (varsayılan **Elif** / **Emma**) | Aile kurmak; Nevin Hanım'ın torunu (Faz 2) | Milyoner töreni (düğün), olay kartları |
| Nevin Hanım | **Nevin Hanım** / **Mrs. Nell** (öneri) | Şans'ın cüzdanını bulduğu yaşlı kadın; eşin babaannesi (Faz 2) | Cüzdan anları, eşle tanışma |
| Torun (varis) | Faz 2'de belirlenecek | 17 yaşında devralır; 2. neslin kahramanı | Emeklilik töreni, 2. nesil |

### Kahraman

- Genç (17 yaşında başlar), koyu saçlı, gri kapüşonlu ve sırt çantalı; yarı 3D yeni tasarım. Sokak aşamasının 4 pozu oyunda (§8).
- Geçmiş: babasının küçük mahalle dükkânı yıllar önce battı; borçlar yüzünden aile evini kaybettiler. Baba yok (vefat etmiş; oyunda hiç ayrıntıya girilmez). Kahraman, Bülent Bey'in restoran zincirinde garson; annesiyle restoranın üstündeki personel lojmanında mütevazı ama düzenli bir hayatları var. Önsözde kovulur ve lojmandan çıkarılırlar (§4).
- Söz: *"Anne, bir gün seni saraylarda yaşatacağım."* Oyunun duygusal omurgası.
- İsim: ilk satın almadan hemen sonra sorulur (oyun önce eğlendirir, sonra sorar). Varsayılan dolu gelir, tek dokunuşla geçilir. En fazla 16 karakter.
- Duruş sınıfla değişir: sokakta üşüyen, kambur → çalışan, dik → zengin, kendinden emin (poz seti, §8).

### Şans (köpek)

- Karışık cins, kırpık kulaklı, tüyleri dağınık bir sokak köpeği. İlk sahnede kahramanın çadırına sokulur.
- Her zaman sahnede, kahramanın yanında. Zenginleştikçe aksesuarı değişir: ip → deri tasma → altın tasma → elmas tasma ve küçük bir yelek.
- Çevrimdışı dönüşte kapının önünde uyurken uyanır ve sevinir ("Tekrar hoş geldin" ekranı).
- Ona dokunmak para vermez: kahraman onu okşar, kalp çıkar. Ama 5–10 dakikada bir ağzında bulduğu bir cüzdanla gelir; oyuncu 12 sn içinde dokunursa kahraman cüzdanı sahibine verir ve teşekkür ödülü alır (karar 2026-10-08, game-design §4.7). Şans parayı vermez, fırsatı getirir; kahraman bulduğu parayı cebine koymaz.

### İşletme yöneticileri (karar 2026-10-08)

**Yönetici anları (karar 2026-10-08):** Önce 3 yöneticiyle denenir; her biri işletmesinin bir kilometre taşına bağlı tek bir an (portre + 1–2 balon, yeni görsel yok). Oyuncu oraya gelmezse hiçbir şey kopmaz. Beğenilirse diğer yöneticilere yayılır.

| Yönetici | An (taslak) |
| --- | --- |
| Rıza Amca | Tezgâh büyüyünce: *"Sen birine çok benziyorsun evlat. Neyse... Çiçekler iyi satıyor."* (Orta Sınıf'taki açıklamaya ipucu) |
| Selin | Kahve Arabası büyüyünce: mezuniyet. *"Diplomamı aldım! Ama arabayı bırakmıyorum, burası benim kahve dükkânım olacak."* |
| Hüseyin Usta | Fırın büyüyünce: *"Gençken bir bakkalda çıraktım. Ustam Mehmet'ti, 'Bir gün kendi fırınını açacaksın' derdi."* Kahraman: *"Mehmet... Babam mı?"* Fırının duvarına babanın bir fotoğrafı asılır. Ne zaman görülürse görülsün aynı an (koşul yok). |

Her işletmenin kendi yöneticisi var: kahramanın yolda tanıştığı insanlar ("işini sen yokken yürüten dostların"). Oyunda sadece yuvarlak portre görünür; işe alınınca kısa bir kart ve karakterin cümlesi, yöneticili kartta portreye dokununca iki cümleden biri (`i18n` → `managers.<işletme>`; portreler `public/assets/managers/`, kaynak `art/pilot/06-managers/`).

| İşletme | Yönetici | Not |
| --- | --- | --- |
| Çiçek Tezgâhı | Rıza Amca / Old Ray | İlk yönetici, akıl hocası |
| Kahve Arabası | Selin / Sally | Üniversiteli barista |
| Fırın | Hüseyin Usta / Baker Hank | Usta fırıncı; gençken babanın dükkânında çıraktı (yönetici anında ortaya çıkar) |
| Oto Yıkama | Kemal / Kevin | Neşeli genç usta |
| Mini Market | Ayten Abla / Aunt Annie | Mahallenin bakkalı, anneyi tanır |
| Güzellik Salonu | Derya / Dana | İddialı kuaför |
| Lojistik Deposu | Burak / Brad | Düzen takıntılı depo şefi |
| Fabrika | Nermin Hanım / Nora | Mühendis, "önce güvenlik" |
| Otel Zinciri | Bülent Bey / Mr. Bryce | Eski patron; Milyarder töreni sonrası (§3 Bülent Bey) |
| Teknoloji Girişimi | Kuzen / Cousin | Kripto esprili kuzen (§7) |

### Rıza Amca (Old Ray)

- 60'larında, gri sakallı, bereli, eski bir marangoz. O da atölyesini kaybetmiş ama umudunu kaybetmemiş.
- **Rehber:** ilk 3 dakikada konuşma balonlarıyla yol gösterir: "Boş şişeleri topla evlat, depozitosu var." → "Şu çiçek tezgâhını al." → "İşe gir, düzenli para lazım."
- **İlk yönetici:** Çiçek Tezgâhı'nın yöneticisi odur. "Tezgâhı ben beklerim, sen büyük düşün." Oyuncunun ilk "param benim için çalışıyor" anı bir dostlukla gelir.
- **Babanın dostu (karar 2026-10-08):** Rıza, kahramanın babası Mehmet'in en yakın arkadaşıydı (baba dükkânının raflarını o yapmıştı). Ama sokakta yardım ettiği gencin Mehmet'in oğlu olduğunu bilmiyordu: ilk yardımı karşılıksız bir iyiliktir. Önceden ufak ipuçları verir (*"Sen birine çok benziyorsun evlat."*). Orta Sınıf töreninde defterden düşen fotoğrafla ikisi de öğrenir: *"Bu... Mehmet'in dükkânı. Sen onun oğlu musun?"*
- İşçi Sınıfı töreninde vedalaşma; sonra olay kartlarında arada bir uğrar. Multimilyarder töreninde atölyesi, babanın adını taşıyan bir markaya dönüşür; Rıza'nın hikâyesi orada tamamlanır (kahraman ~41, Rıza ~85 yaşında). Sonrasında yaptığı eserlerle ve fotoğraflarla sürer.

### Annen (Mom)

- Önsözde görünür; sonra memlekette kız kardeşinin (kahramanın teyzesi) yanında kalır. Oyunda telefon ve mektup balonlarıyla konuşur (portre + 3 ifade: endişeli, gülümseyen, ağlayan-mutlu).
- Sokakta değildir: oyuncu kendine araba alırken annesinin sokakta olduğunu düşünmemeli (karar 2026-10-08).
- Sınıf atlamalarında kısa bir mesaj atar. Evi kendi merdiveniyle ilerler (§5); her basamakta tepkisi bir görsel roman anıdır.
- **Mesaj kuralı (karar 2026-10-08):** Mesajlar takvime veya yaşa değil, hikâyedeki duruma göre seçilir: her sınıfın kendi küçük havuzu var, oyuncunun henüz yaşamadığı bir şeyden söz edilmez (ev alınmadıysa bahçeden bahsedilmez). Günde en fazla bir mesaj gösterilir (oturum açılışında). Birkaç gün gelmeyen oyuncuya birikmiş mesajlar arka arkaya gösterilmez, sadece sıradaki gelir. Çevrimdışı para arttığı ama yaş artmadığı için iki oyuncunun 7. günü çok farklı olabilir; seçim bu yüzden duruma bağlı.

### Bülent Bey (Mr. Bryce)

- Kahramanın garson olarak çalıştığı restoran zincirinin sahibi; personel lojmanı da onun. Kibirli, bağırgan, komik derecede kendini beğenmiş (mizahın güvenli hedefi); gerçek bir kötü değil.
- Önsözde kahramanı haksız yere kovar: annesinin doğum gününde onu aradığı için ("Müşteriler bekliyor, sen telefonda mısın?!") ve lojmanı boşaltmalarını ister.
- Milyarder töreninde kahraman onun şirketini satın alır. Kötü son yok: Bülent Bey'e kahraman iş teklif eder ("Bulaşıkhane senin, şaka şaka"). Ton intikam değil, büyüme.

### Eş

- Adını oyuncu verir. Düğün Milyoner töreninde (düğün fotoğrafı).
- **Faz 2 (ilke kararı 2026-10-08):** Eş, Şans'ın cüzdanını bulduğu Nevin Hanım'ın torunudur. Nevin Hanım ilk cüzdanla tanıtılır; sonraki karşılaşmalar farklılaşır (mahallede selamlaşma, küçük bir yardım, bir davet), aynı cüzdan defalarca kaybolmaz. Torunla tanışma zenginlikten önce, ilişki zamanla büyür; eş servet eşiğinde beliren bir ödül gibi hissettirmemeli, kendi işi ve hedefi olur. Bu bir yan zincirdir (cüzdan sayısına bağlı), ana zinciri bekletmez: Milyoner töreni tanışma gerçekleşmemiş olsa da çalışmalı. Ayrıntı ilk oyun testinden sonra.

## 4. Nesil 1 hikaye akışı

### Önsöz (görsel roman, ~40 saniye, geçilebilir; oyunda, plan 1.18)

6 tam ekran kare; her karede 1–3 balon, isim etiketi (kahraman mor, anne turuncu, Bülent Bey kırmızı; telefondan konuşan için telefon simgesi). Dokununca sıradaki balon; köşede "Geç". Kareler yavaş kamera itişiyle (hafif yakınlaşma) ve yumuşak geçişle değişir; son kareden sonra siyaha geçip oyun başlar. Geliştirici menüsünden tekrar oynatılır; ileride albümden. Metinler `src/game/i18n/messages/*` → `prologue`. Görseller `public/assets/story/prologue/`, kaynakları `art/pilot/04-prologue/`.

1. **Restoran:** Kahraman garson, tepsiyle servis yapıyor; önlüğünün cebinde telefon. *"Bugün annemin doğum günü. Servisten sonra pasta alacağım."*
2. **Telefon:** Mutfak kapısının yanındaki koridorda annesini arıyor: *"İyi ki doğdun anne! Akşam pasta bende."* Anne (telefondan): *"Ah oğlum... Sen bana yetersin."* Arkada, koridorun ucunda Bülent Bey belirmiş.
3. **Kovulma:** Bülent Bey salonun ortasında bağırıyor, kapıyı gösteriyor: *"Müşteriler bekliyor, sen telefonda mısın?!"* Kahraman: *"Annemin doğum günü, efendim. Bir dakika sür..."* Bülent Bey: *"Kovuldun! Lojmanı da yarın boşaltıyorsun."*
4. **Kapı önü:** Sabah, lojmanın kapısı; iki eski bavul, birinin üstünde kurdeleli pasta kutusu. Anne: *"Benim yüzümden oldu oğlum..."* Kahraman: *"Hayır anne. Senin hiçbir suçun yok."* Anne: *"Biz neler atlattık. Bunu da atlatırız."*
5. **Otogar:** Gün batımı, otobüsün yanında sarılıyorlar. Anne: *"Teyzende kalırım. Sen kendine iyi bak, olur mu?"* Kahraman: *"Anne, bir gün seni saraylarda yaşatacağım."*
6. **Gece, ara sokak:** Yağmur, eski çadır, kahraman kartonun üstünde üşüyor; ıslak bir köpek sokuluyor (Şans). Anlatı: *"O gece yağmur hiç dinmedi."* → *"Ama artık yalnız değildi."*

Ton: hüzünlü ama onurlu; haksızlık sıcak bir anın ortasında gelir (doğum günü), annenin suçluluğunu oğul üstlenir. İntikam değil söz. Sonra oyun hemen başlar.

### Açılış (ilk 30 saniye)

Kirli bir ara sokak. Kahraman eski bir çadırın önünde üşüyor, yanında Şans. Oyuncunun ilk dokunuşu şişe toplamaktır.

**Oyunda (2026-10-08):** Ara sokakta 4 şişe/kutu ile başlanır, 2,5 sn'de bir yenisi belirir. Dokununca nesne kaybolur, altın paralar kavisle üst bardaki bakiyeye uçar, "+$" yazısı ve şıngırtı gelir, telefon hafif titrer; kahraman eğilip toplama pozuna geçer. Ara sıra Şans cüzdanla gelir (§3). Karakter zıplatılmaz; poz değişir, nesneler hareket eder.

**Bekleyenler:** Rıza Amca'nın ilk dakikalardaki rehber balonları ("Boş şişeleri topla evlat, depozitosu var.", 1.12), yağmur sesi, sınıf yükseldikçe dokunulan şeyin değişmesi (şişe → tezgâh müşterisi → ...).

### 8 sınıf, 8 hikaye anı

| # | Sınıf | Hikaye anı (tören) | Sahnede değişen | Mekanik |
| --- | --- | --- | --- | --- |
| 0 | Sokakta Yaşayan | Şans ile tanışma, Rıza Amca'nın ilk dersi | Çadır, soğuk mavi ışık | Şişe toplama |
| 1 | Gündelikçi ($1K) | İlk sıcak yemek; annesini arar: "Merak etme anne, iyiyim." | Gece → sabah | — |
| 2 | İşçi Sınıfı ($100K) | Sokaktan çıkış: ilk kiralık daire. Rıza Amca'yla vedalaşma. Annenin mesajı merakı açar: *"Babanın defteri eski evde kalmıştı... Keşke yanımıza alabilseydik."* | İlk kapalı ev | — |
| 3 | Orta Sınıf ($1M, ~19 yaş, 30. dk) | **Eski aile evi kendiliğinden geri alınır** (satın alma değil, tören verir; §5): "Eski evimizi geri aldım anne." Annenin ağlayan-mutlu mesajı. Çatı katında babanın defteri; içinden baba, küçük kahraman ve genç Rıza'nın dükkân önündeki fotoğrafı düşer. Rıza: *"Bu... Mehmet'in dükkânı. Sen onun oğlu musun?"* İlk oturumun zirvesi. | Eski fotoğraf sahnede çerçevede | — |
| 4 | Milyoner ($10M, ~20 yaş, dönüş oturumu) | Kendi ilk müstakil evi; annesini arar: *"Anne... Milyoner oldum."* Düğün (Faz 2, eş zinciriyle) | Kendi evi, düğün fotoğrafı | — |
| 5 | Milyarder ($1B, ~24 yaş) | Bülent Bey'in şirketini satın alma | Dergi haberi: "Garsondan patrona" | — |
| 6 | Multimilyarder ($100B, ~41 yaş) | Rıza Amca'nın atölyesi, babanın adını taşıyan bir markaya dönüşür ("Mehmet & Rıza"); Rıza'nın hikâyesi tamamlanır | Markanın ilk mobilyası / atölye fotoğrafı | — |
| 7 | Dünyanın En Zengini ($1T, ~54 yaş) | Söz tutulur: annene konak (§5). Dergi kapağı; annenin mesajı: "Baban seninle gurur duyardı." | Konağın fotoğrafı, dergi kapağı | — |

**Zincir kuralı (karar 2026-10-08):** Yukarıdaki tablo ana zincirdir ve sadece sınıf geçişleriyle ilerler. Merak sorusu İşçi Sınıfı'nda (~15. dk) açılır, Orta Sınıf'ta (~30. dk, ilk oturumun sonu) kapanır; aynı törende Rıza'nın açıklaması gelir. (2026-10-08'de Multimilyoner kalktı, İşçi ile Milyoner arasına Orta Sınıf girdi; Milyoner $10M dönüş oturumunda.) Ayrı bir "sayfa açma" sistemi yok: defter tek bir an olarak kalır. Ana zincirin dışındaki her şey (annenin mesajları, yönetici anları, annenin evi ara basamakları, hayaller) yan andır: kendi koşulu gerçekleşirse görünür, gerçekleşmezse hiçbir şey kopmaz, başka bir anı açmaz.

Zaman çizelgesi (`npm run sim`, 2026-10-08): ilk oturumda önsöz + 3 tören. Sonra engaged oyuncuda Milyoner 1. günün dönüş oturumunda, Milyarder 3. gün, Multimilyarder 7. gün, En Zengin 11. gün, ömür sonu 23. gün; casual oyuncuda Milyoner 2., Milyarder 4–5., Multimilyarder 14. gün. Törenler arasındaki günleri anne mesajları ve yan anlar doldurur; bunun D7'yi yükselttiği varsayım, oyun testiyle ölçülecek.

Tören yapısı (1.10): eski sahne çıkar → yeni sahne gelir → hikaye kartı (portre + 1–3 cümle) → "Önce / Şimdi" kartı → konfeti, ses, haptik.

## 5. Hayaller (duygusal hedefler)

Hayaller panosu (1.8) iki tür hedef gösterir:

1. **Statü eşyaları:** sıradaki ev, araç, kıyafet (mevcut tasarım; gelir bonusu verir).
2. **Hikaye hayalleri:** tek seferlik, küçük bir mikro hikaye ve karakter tepkisi açan alımlar. Gelir bonusu yok ya da çok küçük; asıl ödül an.

| Hayal | Yaklaşık sınıf | Ödül anı |
| --- | --- | --- |
| Sıcak bir çorba | Sokak | Kahraman ilk kez gülümser |
| Şans'a mama ve tasma | Sokak | Şans'ın ilk tasması |
| Annene telefon kontörü | Gündelikçi | Annenin ilk sesli mesajı |
| Rıza Amca'ya yeni mont | İşçi Sınıfı | Vedalaşma anı |
| Annenin evi (merdiven, aşağıda) | İşçi Sınıfı → En Zengin | Her basamak bir an; Orta Sınıf'ta eski aile evi |
| Düğün | Milyoner | Milyoner töreniyle birleşir |
| Bülent Bey'in şirketi | Milyarder | Milyarder töreniyle birleşir |
| Mahalleye kütüphane (vakıf) | En Zengin | Emekliliğe köprü |

Denge: hikaye hayallerinin fiyatları o sınıfın birkaç dakikalık geliri kadar olacak. 1.8'de simülatöre eklenip tempo hedefleri yeniden kontrol edilecek.

### Annenin evi merdiveni (karar 2026-10-08)

Oyuncunun duygusu: *"Ben de anneme en güzel evi alacağım, onu saraylarda yaşatacağım."* Bu yüzden annenin evi tek bir alım değil, kendi merdiveni. Her basamak bir görsel roman anı (annenin portresi + mesajı) ve sahnede çerçeveli bir fotoğraf olarak kalır.

| # | Annenin evi | Yaklaşık sınıf | An |
| --- | --- | --- | --- |
| 1 | Teyzenin yanında misafir odası | Başlangıç | Önsözde otogar vedası |
| 2 | Memlekette kiralık küçük daire | İşçi Sınıfı | "Kendi kapım var oğlum." |
| 3 | Eski aile evi (geri alınır) | Orta Sınıf | "Eski evimizi geri aldım anne." Orta Sınıf töreni verir (zincir), satın alınmaz |
| 4 | Bahçeli ev | Milyoner | Annenin bahçesi |
| 5 | Deniz kenarında villa | Multimilyarder | |
| 6 | Konak | En Zengin | Söz tutulur: "Seni saraylarda yaşatacağım." En Zengin töreni verir (zincir), satın alınmaz |

- Sözün başı ve sonu (3. ve 6. basamak) törenle gelir, böylece her oyuncu görür. Ara basamaklar (2, 4, 5) hayaller panosunda isteğe bağlı alımdır (yan an).
- Fiyatlar kahramanın ev fiyat eğrisinden bağımsızdır ve simülatörle belirlenir (GPT Astra'nın bulduğu çelişki: ilk satın alınabilir kendi evi ~$16,4M, Orta Sınıf eşiği $1M).
- Gelir bonusu küçük ya da yok; asıl ödül an. Bonus verilecekse "Annenin duası" gibi tek bir küçük çarpan.

## 6. Hanedan anlatısı (Faz 2)

- **Ne zaman:** ömrün sonunda, erken değil (97 yaş, karar 2026-10-08; [game-design-v2.md §4.9](./game-design-v2.md)).
- **Emeklilik = servetini vakfa bağışlamak.** Kahraman "kütüphane/vakıf" çizgisini tamamlar; çocuğuna para değil **adını ve öğrettiklerini** bırakır.
- **Miras puanı arayüzde "Aile İtibarı" (Family Legacy)** olarak geçer. Her puan +%1 gelir: "Soyadın kapıları açıyor."
- **Varis 17 yaşında bir torundur (karar 2026-10-08).** Kahraman 97'de devrettiğinde çocuğu ~65 yaşında olurdu. Torun kendini kanıtlamak için sıfırdan başlar; dede ona, Rıza Amca'nın kendisine öğrettiği gibi ilk işini öğretir. Hikâyenin kapanışı bu ayna: başta Rıza sana öğretir, sonda sen bir gence.
- **Ölüm hiç gösterilmez (karar 2026-10-08).** Uzun ömürde anne, Rıza ve Şans da yaşlanır. Sözün tutulduğu konak (En Zengin) annenin son büyük anıdır; sonrasında annenin, Rıza'nın varlığı fotoğraflar, mektuplar ve bıraktıkları eserlerle (atölye markası, vakfın adı) sürer. Şans'ın yavruları erken gelir (öneri Milyarder dolayları), yoldaş soyu nesiller boyu sürer.
- **4. perde: Miras (54 → 97 yaş, şu an içeriği yok).** Metinle doldurulmaz; oyuncunun tamamladığı somut bir proje olur: kütüphaneyi açmak, burs programını büyütmek, genç bir girişimciyi yetiştirmek. Sahne değişir, ilerleme görünür, final yaklaşır. Ayrıntı Faz 2.1.
- Açık sorular (Faz 2.1'de karar): torunun cinsiyeti (oyuncu seçimi mi?), 2. neslin açılış sahnesi (yurt odası, kiralık oda?), 2. nesil kıyafet seti, Şans'ın yavrularının zamanı.

## 7. Olay kartlarına karakter bağları (Faz 2.4)

Kartların bir kısmı bu kadrodan gelir; böylece "tanıdık yüzler geri döner":

- Rıza Amca: "Eski atölyeyi yeniden açmak istiyorum, ortak olur musun?"
- Annen: "Komşunun oğlu iş arıyor, bir bakar mısın?"
- Bülent Bey: "Restoranımı sana satayım, ama bir şartım var..."
- Eşin: "Tatile mi çıksak, yoksa yeni bir yatırım mı?"
- Kuzen: "Bu kripto kesin uçacak!" (tekrar eden mizah karakteri)

## 8. Görsel ihtiyaç listesi

**Yaklaşım: görsel roman (karar 2026-10-08).** Karakterler tutarlı durağan pozlar ve ifade portreleriyle anlatılır; konuşanlar balonla. Hareket yerine davranış: yaşam aşamasına göre farklı pozlar (üşüyen-kambur, çalışan, Şans'ı okşayan, koltukta kahve içen). Pozlar arasında yumuşak geçiş. Durağan resmi kodla zıplatmak/esnetmek karakter animasyonu sayılmaz. Gerçek animasyon en fazla 2–3 büyük an için ve isteğe bağlı ([discussion-notes.md](./discussion-notes.md) §1).

**Stil: yarı 3D animasyon filmi görünümü (karar 2026-10-08, kullanıcı A1'i seçti).** Kahraman genç görünür (17 yaştan başlayan ömürle örtüşür).

**Stil kılavuzu (her üretimde uyulur):**

- Araç: fal.ai, `fal-ai/nano-banana-pro/edit` ($0,15/görsel). Arka plan silme `fal-ai/bria/background/remove` ($0,018).
- Referans görseller, her üretime eklenir: kahraman kılavuzu `art/pilot/01-hero-sheet/A1-semi3d.png`, Şans kılavuzu `art/pilot/02-poses/sans-sheet.png`. Yeni bir karakter önce kendi kılavuzunu alır; kahramanın kılavuzu yanına verilir, boy ve stil eşleşir.
- Her komutun sonuna aynen eklenen stil paragrafı: *"Art style (match the reference exactly): stylized semi-3D animated-film look, soft key light from the upper left, warm palette, soft shadows, clean readable shapes for a small phone screen, eye-level camera. No text, no labels, no logos, no watermark."*
- Karakterler ve nesneler düz açık gri zeminde üretilir, sonra arka planı silinir. Arka planlar 9:16, 2K; komuta *"a frame from a 3D CG animated feature film, NO ink outlines, NO cel shading, NO flat 2D cartoon"* eklenir (yoksa stil 2D'ye kayıyor).
- Hayvanlar için *"real four-legged dog, quadruped, NOT anthropomorphic"* şart (ilk Şans denemesi iki ayak üstünde çıktı).
- Sahne ve önsöz kareleri için üç referans verilir: kahraman kılavuzu + bir kahraman pozu + yarı 3D bir arka plan (`art/pilot/02-poses/alley.png`). Tek referansla stil 2D'ye kayıyor (ilk restoran karesi).
- Eller ve nesneler: komuta *"exactly two arms and two hands"* eklenir; bir elde nesne, öbüründe başka nesne gibi karışık pozlardan kaçınılır. Her görselin elleri tam çözünürlükte kontrol edilir (restoran karesinde önce havada tepsi, sonra üç el çıktı; düzenleme modeli fazla eli silemedi, sade pozla sıfırdan üretmek işe yaradı).
- Kadro kılavuzları: `art/pilot/03-cast/` (anne, Rıza Amca, Bülent Bey); yeni üretimlerde ilgili kılavuz da referans verilir.
- Görsellere yazı, tabela, logo gömülmez (TR/EN).
- Oyunda: karakter görselleri stüdyo ışığında; gece sahnelerinde sahnenin ışığına uydurmak için hafif soğuk renk tonu ve sıcak kenar ışığı uygulanır (deneme: `art/pilot/scene-mock-alley.png`).

**Karakter ve mekân görselleri sıfırdan üretilir (karar 2026-10-08):** mevcut görseller yeni hikâyeye uymuyor (20 kıyafetin hepsinde poz aynı, 13–20 arası telefonda ayırt edilmiyor; ev arka planları aynı kompozisyon). İlk üretim küçük tutulur.

**Faz 1 (dikey dilim):**

| Görsel | Adet | Not |
| --- | --- | --- |
| Kahraman: 3 yaşam aşaması (sokak, toparlanma, rahat) × 4 poz | 12 | **Sokak aşaması tamam** (bekleme, toplama, sevinç, Şans'ı okşama; oyunda). Diğer 2 aşama bekliyor |
| Kahraman ifade portreleri | 4–5 | Mutlu, üzgün, kararlı, şaşkın, gururlu (her duyguda aynı gülümseme olmasın) |
| Şans: 3 poz | 3 | **Oturan ve cüzdanlı tamam.** Sevinen, uyuyan (çevrimdışı dönüş) ve tasmalar bekliyor |
| Rıza Amca portre | 3 ifade | Kadro sayfasında 4 ifade var; gülümseyen yüz yönetici portresi olarak oyunda |
| Annen portre | 3 ifade | Kadro sayfasında 4 ifade var; oyunda henüz kullanılmadı |
| Bülent Bey portre | 2 ifade | Kadro sayfasında 4 ifade var; gülümseyen yüz yönetici portresi olarak oyunda |
| Önsöz kareleri | 6 | **Tamam** (2026-10-08): restoran, telefon, kovulma, kapı önü, otogar, ara sokakta Şans (§4) |
| Kirli ara sokak arka planı | 1 | **Tamam** (şişesiz temiz sürüm, `public/assets/scene/alley.webp`) |
| Ev arka planları (sahne) | 10–12 | Oturulan eve göre (discussion-notes §7). **Deneme:** Gündelikçi için eski minibüs, `art/pilot/05-scene/home-1-van-v1.png` (ara sokakla aynı kamera ve zemin, sabah ışığı; çöp torbaları kaldı). $0,15. Stil kılavuzu: arka plan üretiminde ara sokak (`alley-clean`) birinci referans, "Keep EXACTLY the same camera height... keep the lower-center foreground clear" cümlesi kompozisyonu tutturdu |
| Şişe, kutu | 3 | **Tamam** (yeşil/kahverengi şişe, kutu). Çuval gerekmedi: paralar bakiyeye uçuyor |
| Yönetici portreleri | 10 | **Tamam** (§3; `public/assets/managers/`) |
| Annenin evi fotoğrafları | 6 | Merdiven basamakları (§5); çerçeve içinde küçük |
| Orta Sınıf anı: çatı katı ve eski fotoğraf | 2 | **Tamam (deneme, 2026-10-08):** `art/pilot/07-story/milyoner-attic-v1.png` (9:16; kahraman defterle, Şans fotoğrafı kokluyor) ve `old-photo-v2.png` (4:3; baba, omzunda küçük kahraman, genç Rıza, dolu bakkal). v1 fotoğraf 2D'ye kaydı ve dükkân boştu; v2'de çatı katı görseli üçüncü stil referansı olarak verildi. Fotoğraf hâlâ hafif çizgili, "eski fotoğraf" olduğu için kabul edilebilir. 3 üretim, $0,45 |
| Para fiziksel hali: cüzdan → kasa → banka kasası → altın oda | 4 | Rapor §6.3 |

**Faz 2:** eş portresi ve düğün fotoğrafı, dergi kapakları, kütüphane/vakıf, varis seti, Şans'ın yavrusu, olay kartı ikonları.

Üretim yolu: fal.ai ile, yukarıdaki stil kılavuzuna göre. Kaynak dosyalar `art/pilot/` (git'te değil, 184 MB), oyundaki sıkıştırılmış hâlleri `public/assets/`. Harcama ve tur geçmişi: plan 1.16.

## 9. Metin ihtiyacı (TR + EN)

- Önsöz: 13 balon (tamam, `prologue`)
- Yönetici cümleleri: 10 × 3 (tamam, `managers`)
- Şans'ın cüzdanı, çevrimdışı kartı, yönetici işe alma kartı (tamam)
- 8 tören hikaye kartı (1–3 cümle; Orta Sınıf'ta defter + Rıza açıklaması dahil)
- Yönetici anları: 3 (Rıza, Selin, Hüseyin Usta; §3)
- Rehber: ~8 Rıza Amca balonu
- Anne mesajları: sınıf başına küçük havuz, toplam ~10–15 (+ annenin evi merdiveni: 6 an; §3 mesaj kuralı)
- Hayal mikro hikayeleri: 8
- Karakter balonları (terfi, alım tepkileri): ~30
- Olay kartları: 60 (Faz 2)

Metinler `src/game/i18n/` içine, ilgili özellik yazılırken eklenir.

## 10. Mekaniğe etkisi (planla bağ)

| Plan maddesi | Hikaye eklemesi |
| --- | --- |
| 1.6 Sahne | Kirli ara sokak; şişe/kutu toplama ve Şans'ın cüzdanı (tamam, §4). Sahnenin hikâyeyle birlikte değişmesi sıradaki konu (discussion-notes §7) |
| 1.7 İşletmeler | Her işletmeye kendi yöneticisi (tamam, §3) |
| 1.18 Önsöz | Görsel roman: kovulma, lojmandan çıkış, otogar, Şans (tamam, §4) |
| 1.8 Hayaller panosu | Hikaye hayalleri + statü eşyaları + annenin evi merdiveni (§5) |
| 1.10 Sınıf töreni | Her sınıfta hikaye kartı; ana zincir (defter, Rıza, eski ev, konak) sadece burada ilerler (§4) |
| Yeni: hikâye anları | Anne mesajları (sınıfa bağlı, günde en fazla 1) ve 3 yönetici anı; önsözün balon bileşeniyle (§3) |
| 1.12 Onboarding | Rehber Rıza Amca; isim sorma ilk satın almadan sonra |
| 1.13 Çevrimdışı kartı | Kart hazır; Şans'ın kapıda uyanması bekliyor |
| 2.1 Hanedan | Vakıf ve "Aile İtibarı" anlatısı (§6) |
| 2.4 Olay kartları | Kadro kartları (§7) |
