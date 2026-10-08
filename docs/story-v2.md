# Prestige Life v2 — Hikaye ve Karakterler

Son güncelleme: 2026-10-09 · İlgili: [game-design-v2.md](./game-design-v2.md), [rebuild-plan.md](./rebuild-plan.md)

Bu belge hikayenin, karakterlerin ve tonun tek kaynağıdır. Dayanağı [rapor](./report-v2.md) §6 (fakirlikten zenginliğe hissi) ve §7'dir (hanedan, olay kartları).

## 0. Kapsam: önce küçük, testten sonra büyür (karar 2026-10-09)

Türde hikâye azdır: Idle Guy'da olay örgüsü yok, Rich Inc.'te tek bir açılış sahnesi var, AdVenture Capitalist ve Idle Miner'da hiç yok. Hikâyeyi ürünün kendisi yapan oyunlar (Homescapes, Merge Mansion) idle değil ve sürekli içerik yazan ekipleri var. Hikâye bizim farkımız ([rapor](./report-v2.md) §2), ama oyuncunun okuyup okumadığı henüz ölçülmedi.

Bu yüzden Faz 1'de hikâye **sadece kesin gelen tetiklere** bağlı ve küçük: önsöz, 8 sınıf töreni (her biri 1–3 cümle), annenin kısa mesajları. Toplam ~40 balon, 1–2 yeni görsel. Tek merak sorusu var (babanın defteri); diğer törenler sevinç ve sahne değişimidir. Geri kalan fikirler §7'de bekler ve oyun testinden sonra açılır.

**Testte ölçülecek** (plan 1.14–1.15): törenlerin ne kadarı "Geç"le atlanıyor; Orta Sınıf'a ulaşan oyuncu ertesi gün dönüyor mu. Okunuyorsa §7'den eklenir; okunmuyorsa hikâye sahne değişimine bırakılır (ev, kıyafet, Şans'ın tasması).

**Kural:** Her yeni hikâye anı için tetik, metin ve görsel maliyeti baştan yazılır. İsteğe bağlı oyuncu eylemine bağlı an (denk getirme gerektiren) Faz 1'e girmez.

## 1. Tek cümle

**Her şeyini kaybetmiş genç bir adam, sokakta bulduğu köpeği ve annesine verdiği sözle sıfırdan dünyanın en zengini olur; sonra servetini değil, hikayesini çocuğuna bırakır.**

## 2. Ton kuralları

- **Sıcak ve umutlu.** Oyuncu kahramanın iyiliğini ister. Zafer anları duygusaldır, utandırıcı değildir.
- **Evsizlikle dalga geçilmez.** Sokak zor ama onurlu anlatılır. Mizah kahramanın acizliğinden değil, durumların absürtlüğünden gelir.
- **İntikam yok.** Güç kahramana geçtiğinde nasıl biri olduğunu davranışıyla gösterir (Bülent Bey, §4).
- **Mizah konuşma balonlarında ve olay kartlarında,** törenlerin duygusal anında değil.
- **Kısa metin.** Konuşma balonu en fazla 2 satır; tören metni en fazla 3 kısa cümle. 10 saniyede okunur.
- **Karakter yardım metni değildir.** "Menüye git, şuna bas" demez; eylemi arayüz işareti taşır, karakter duyguyu.
- **İki dilde birlikte yazılır** (Türkçe ve İngilizce). Karakter adları yerelleştirilir; birebir çeviri değil, aynı duyguyu veren karşılık aranır.

## 3. Karakterler

| Karakter | TR / EN | Faz 1'deki rolü |
| --- | --- | --- |
| Kahraman | Oyuncu verir (varsayılan **Can** / **Alex**) | Sahnenin merkezi |
| Köpek | **Şans** / **Lucky** | Her zaman sahnede; cüzdan getirir |
| Akıl hocası | **Rıza Amca** / **Old Ray** | Rehber (onboarding), Çiçek Tezgâhı yöneticisi; babanın eski dostu (Orta Sınıf'ta ortaya çıkar) |
| Anne | **Annen** / **Mom** | Önsöz, törenler, kısa mesajlar |
| Baba | **Mehmet** / **Martin** | Vefat etmiş; sadece defter ve eski fotoğrafla var |
| Eski patron | **Bülent Bey** / **Mr. Bryce** | Önsöz, Milyarder töreni, Otel Zinciri yöneticisi |
| Kuzen | **Kuzen** / **Cousin** | Teknoloji Girişimi yöneticisi (kripto esprili) |

Eş, Nevin Hanım ve varis Faz 2'de (§7).

### Kahraman

- Genç (17 yaşında başlar), koyu saçlı, gri kapüşonlu ve sırt çantalı; yarı 3D. Sokak aşamasının 4 pozu oyunda (§8).
- Geçmiş: babasının küçük mahalle dükkânı yıllar önce battı, aile evini kaybettiler; baba vefat etmiş (ayrıntıya girilmez). Kahraman Bülent Bey'in restoran zincirinde garson, annesiyle restoranın üstündeki personel lojmanında yaşıyor. Önsözde kovulur ve lojmandan çıkarılırlar.
- Söz: *"Anne, bir gün seni saraylarda yaşatacağım."* Oyunun duygusal omurgası.
- İsim: ilk satın almadan hemen sonra sorulur. Varsayılan dolu gelir, tek dokunuşla geçilir. En fazla 16 karakter.
- Duruş sınıfla değişir: sokakta üşüyen, kambur → çalışan, dik → zengin, kendinden emin (§8).

### Şans (köpek)

- Karışık cins, kırpık kulaklı, tüyleri dağınık bir sokak köpeği. Her zaman sahnede, kahramanın yanında. Zenginleştikçe tasması değişir: ip → deri → altın → elmas.
- Ona dokunmak para vermez: kahraman onu okşar. 5–10 dakikada bir ağzında bir cüzdanla gelir; oyuncu 12 sn içinde dokunursa kahraman cüzdanı sahibine verir ve teşekkür ödülü alır (oyunda; game-design §4.7). Kahraman bulduğu parayı cebine koymaz.
- Çevrimdışı dönüşte kapının önünde uyurken uyanır (bekliyor; uyuyan poz görseli gerekiyor).

### Rıza Amca (Old Ray)

- 60'larında, gri sakallı, bereli, eski bir marangoz; atölyesini kaybetmiş ama umudunu kaybetmemiş.
- **Rehber:** ilk dakikalarda kısa balonlarla ("Boş şişeleri topla evlat, depozitosu var.", plan 1.12).
- **İlk yönetici:** Çiçek Tezgâhı. "Tezgâhı ben beklerim evlat, sen büyük düşün." (oyunda)
- **Babanın dostu:** Babanın en yakın arkadaşıydı ama sokakta yardım ettiği gencin Mehmet'in oğlu olduğunu bilmiyordu; ilk yardımı karşılıksız bir iyilik. Gündelikçi töreninde tek bir ipucu verir, Orta Sınıf töreninde fotoğrafla ikisi de öğrenir (§4).

### Annen (Mom)

- Önsözde görünür; sonra memlekette kız kardeşinin yanında kalır. Sokakta değildir. Portre + 3 ifade (endişeli, gülümseyen, ağlayan-mutlu).
- "Sen bana yetersin" diyen biri: büyük ev istemez; sözü kahraman verir, anne evleri yaşanmış yerlere dönüştürür ("Bahçeye iki sandalye koydum").
- **Mesajlar:** sınıfa bağlı küçük havuzlar, toplam ~10. Oyuncunun henüz yaşamadığı bir şeyden söz edilmez. Günde en fazla bir mesaj (oturum açılışında); birikenler arka arkaya gösterilmez.

### Bülent Bey (Mr. Bryce)

- Restoran zincirinin ve lojmanın sahibi. Kibirli, bağırgan, komik derecede kendini beğenmiş; gerçek bir kötü değil.
- Önsözde kahramanı annesinin doğum gününde telefonla konuştuğu için kovar.
- Milyarder töreninde kahraman şirketini satın alır. Dramatik soru intikam değil, *"Ben de onun gibi mi olacağım?"*: kahraman personelin işini korur, Bülent Bey'e de iş teklif eder.

### İşletme yöneticileri (oyunda)

Her işletmenin kendi yöneticisi var: kahramanın yolda tanıştığı insanlar. Oyunda yuvarlak portre; işe alınınca kısa kart ve cümle, portreye dokununca iki cümleden biri (`i18n` → `managers.<işletme>`; portreler `public/assets/managers/`, kaynak `art/pilot/06-managers/`).

| İşletme | Yönetici | Not |
| --- | --- | --- |
| Çiçek Tezgâhı | Rıza Amca / Old Ray | İlk yönetici, akıl hocası |
| Kahve Arabası | Selin / Sally | Üniversiteli barista |
| Fırın | Hüseyin Usta / Baker Hank | Usta fırıncı |
| Oto Yıkama | Kemal / Kevin | Neşeli genç usta |
| Mini Market | Ayten Abla / Aunt Annie | Mahallenin bakkalı, anneyi tanır |
| Güzellik Salonu | Derya / Dana | İddialı kuaför |
| Lojistik Deposu | Burak / Brad | Düzen takıntılı depo şefi |
| Fabrika | Nermin Hanım / Nora | Mühendis, "önce güvenlik" |
| Otel Zinciri | Bülent Bey / Mr. Bryce | Eski patron; Milyarder töreninden sonra |
| Teknoloji Girişimi | Kuzen / Cousin | Kripto esprili kuzen |

## 4. Nesil 1 hikaye akışı

### Önsöz (görsel roman, ~40 saniye, geçilebilir; oyunda, plan 1.18)

6 tam ekran kare; her karede 1–3 balon, isim etiketi (kahraman mor, anne turuncu, Bülent Bey kırmızı; telefondan konuşan için telefon simgesi). Dokununca sıradaki balon; köşede "Geç". Metinler `src/game/i18n/messages/*` → `prologue`. Görseller `public/assets/story/prologue/`, kaynakları `art/pilot/04-prologue/`.

1. **Restoran:** Kahraman garson, tepsiyle servis yapıyor. *"Bugün annemin doğum günü. Servisten sonra pasta alacağım."*
2. **Telefon:** Koridorda annesini arıyor: *"İyi ki doğdun anne! Akşam pasta bende."* Anne: *"Ah oğlum... Sen bana yetersin."* Arkada Bülent Bey belirmiş.
3. **Kovulma:** Bülent Bey: *"Müşteriler bekliyor, sen telefonda mısın?!"* Kahraman: *"Annemin doğum günü, efendim. Bir dakika sür..."* Bülent Bey: *"Kovuldun! Lojmanı da yarın boşaltıyorsun."*
4. **Kapı önü:** İki eski bavul, üstünde kurdeleli pasta kutusu. Anne: *"Benim yüzümden oldu oğlum..."* Kahraman: *"Hayır anne. Senin hiçbir suçun yok."* Anne: *"Biz neler atlattık. Bunu da atlatırız."*
5. **Otogar:** Gün batımı, sarılıyorlar. Anne: *"Teyzende kalırım. Sen kendine iyi bak, olur mu?"* Kahraman: *"Anne, bir gün seni saraylarda yaşatacağım."*
6. **Gece, ara sokak:** Yağmur, eski çadır; ıslak bir köpek sokuluyor (Şans). *"O gece yağmur hiç dinmedi."* → *"Ama artık yalnız değildi."*

### Açılış (oyunda)

Kirli bir ara sokak; kahraman çadırın önünde üşüyor, yanında Şans. 4 şişe/kutu ile başlanır, 2,5 sn'de bir yenisi belirir; dokununca paralar kavisle bakiyeye uçar, kahraman toplama pozuna geçer. Ara sıra Şans cüzdanla gelir.

**Bekleyenler:** Rıza Amca'nın rehber balonları (1.12), yağmur sesi.

### 8 sınıf töreni (Faz 1)

Tören yapısı (plan 1.10): eski sahne çıkar → yeni sahne gelir → hikaye kartı (portre + 1–3 cümle, önsözün balon bileşeni) → "Önce / Şimdi" kartı → konfeti, ses, haptik. Tören sırasında yaş durur. Her oyuncu sınıfları aynı sırayla geçtiği için hiçbir şey denk getirilmez.

| # | Sınıf | Tören (taslak metin) | Sahnede kalan iz |
| --- | --- | --- | --- |
| 0 | Sokakta Yaşayan | Tören yok; önsöz ve açılış | Çadır, soğuk mavi ışık |
| 1 | Gündelikçi ($1K, ~4,5 dk) | İlk sıcak yemek. Anneyi arar: *"Merak etme anne, iyiyim."* Rıza: *"Sen birine çok benziyorsun evlat."* | Gece → sabah, yeni yer |
| 2 | İşçi Sınıfı ($100K, ~15 dk) | İlk kiralık daire. Anne: *"Babanın defteri eski evde kalmıştı... Keşke yanımıza alabilseydik."* (merak açılır) | İlk kapalı ev |
| 3 | Orta Sınıf ($1M, ~30 dk, ilk oturumun sonu) | Eski aile evi geri alınır (tören verir, satın alınmaz): *"Eski evimizi geri aldım anne."* Annenin ağlayan-mutlu mesajı. Çatı katında babanın defteri; içinden baba, küçük kahraman ve genç Rıza'nın dükkân önündeki fotoğrafı düşer. Rıza: *"Bu... Mehmet'in dükkânı. Sen onun oğlu musun?"* (merak kapanır) | Eski fotoğraf çerçevede |
| 4 | Milyoner ($10M, dönüş oturumu) | Kendi ilk evi. *"Anne... Milyoner oldum."* Anne: *"Bahçeye iki sandalye koydum. Geldiğinde burada otururuz."* | Kendi evi |
| 5 | Milyarder ($1B, ~3. gün) | Bülent Bey'in şirketini alır. Personel: *"İşimiz ne olacak?"* Kahraman: *"Hiçbir şey değişmiyor. Maaşlar artıyor."* Bülent Bey'e: *"Bir işim var sana."* | Otel Zinciri'nin yöneticisi Bülent Bey |
| 6 | Multimilyarder ($100B, ~7. gün) | Rıza'nın atölyesi yeniden açılır. Rıza: *"Mehmet görseydi..."* | (görsel isteğe bağlı) |
| 7 | Dünyanın En Zengini ($1T, ~11. gün) | Söz tutulur: annene konak. Anne eski evden getirdiği saksıyı pencereye koyar: *"Baban seninle gurur duyardı."* | Konak, pencerede saksı |

Zaman çizelgesi (`npm run sim`, 2026-10-08): ilk oturumda önsöz + 3 tören. Engaged oyuncuda Milyoner 1. günün dönüş oturumunda, Milyarder 3. gün, Multimilyarder 7. gün, En Zengin 11. gün, ömür sonu 23. gün; casual oyuncuda Milyoner 2., Milyarder 4–5., Multimilyarder 14. gün. Törenler arasındaki günleri annenin mesajları doldurur.

**Annenin evi:** Faz 1'de iki basamak, ikisi de törenle: eski aile evi (Orta Sınıf; küçük bir bahçesi var, Milyoner'deki "iki sandalye" mesajı oraya bağlı) ve konak (En Zengin). Fiyatı yok, gelir bonusu yok. Ara basamaklar §7'de.

## 5. Hayaller panosu (plan 1.8)

Faz 1'de pano sadece statü eşyalarını gösterir (sıradaki ev, araç, kıyafet; gelir bonusu verir). Hikaye hayalleri (küçük mikro hikâyeli tek seferlik alımlar) §7'de bekler.

## 6. Hanedan (Faz 2, ilke kararları)

- Varis ömrün sonunda (97 yaş) devralır, erken değil ([game-design-v2.md §4.9](./game-design-v2.md)). Varis 17 yaşında bir torun; sıfırdan başlar, dede ona Rıza'nın kendisine öğrettiği gibi ilk işini öğretir.
- Emeklilik = servetini vakfa bağışlamak; çocuğuna para değil adını bırakır. Miras puanı arayüzde **"Aile İtibarı"** (Family Legacy): her puan +%1 gelir.
- Ölüm hiç gösterilmez; anne, Rıza ve Şans'ın varlığı fotoğraflar ve bıraktıkları eserlerle sürer.
- Açık sorular: [discussion-notes.md §4](./discussion-notes.md).

## 7. Sonra: testten sonra ya da Faz 2 (fikir havuzu)

Karar değil, havuz. Test sonucuna göre seçilir; her biri açılırken tetik ve maliyet yeniden yazılır.

- **Babanın mektubu ve atölye hayali** (2026-10-09, Claude + GPT): mektup defterle birlikte gelir (*"Rıza'yla bir atölye açacaktık. Ben yapamadım."*), Rıza Milyoner'de çizimleri getirir. Fabrika işletmesi "Mehmet & Rıza Atölyesi" olur; kilometre taşlarında küçük anlar (ilk sipariş), Multimilyarder'de marka. Ekonomi değişmez, işletmenin adı ve görseli değişir.
- **Defterin içeriği:** hesapların yanında çizimler, notlar; bazı isimlerin yanına "ödendi" yazılmış (*"Annem, onların aslında ödeyemediğini söyledi."*). Babayı insanileştirir, kahramanın cüzdanları geri vermesiyle örtüşür.
- **Yönetici anları:** kilometre taşına bağlı tek anlar. Taslaklar: Selin'in mezuniyeti (*"Diplomamı aldım! Ama arabayı bırakmıyorum."*); Hüseyin Usta'nın babanın çırağı çıkması (*"Ustam Mehmet'ti..."*, fırının duvarına babanın fotoğrafı).
- **Annenin evi ara basamakları:** memlekette kiralık daire (İşçi), bahçeli ev (Milyoner), deniz kenarında villa (Multimilyarder); hayaller panosunda isteğe bağlı alım, fiyatlar simülatörle.
- **Hikaye hayalleri:** sıcak bir çorba, Şans'a tasma, annene telefon kontörü, Rıza Amca'ya yeni mont, mahalleye kütüphane. Fiyatı o sınıfın birkaç dakikalık geliri.
- **Eş ve cüzdan zinciri:** eş, Şans'ın cüzdanını bulduğu Nevin Hanım'ın torunu; tanışma zenginlikten önce, düğün Milyoner'de. Milyoner töreni tanışma olmadan da çalışmalı.
- **4. perde (54 → 97 yaş):** oynanabilir vakıf projesi (kütüphane, burs, genç bir girişimciyi yetiştirmek).
- **Olay kartlarında tanıdık yüzler (Faz 2.4):** Rıza (*"Eski atölyeyi yeniden açmak istiyorum, ortak olur musun?"*), annen (*"Komşunun oğlu iş arıyor."*), Bülent Bey (*"Restoranımı sana satayım, ama bir şartım var..."*), kuzen (*"Bu kripto kesin uçacak!"*).
- **Şans'ın yavruları** (öneri Milyarder dolayları), dergi kapakları ("Garsondan patrona").

## 8. Görsel ihtiyaç listesi

**Yaklaşım: görsel roman (karar 2026-10-08).** Karakterler tutarlı durağan pozlar ve ifade portreleriyle anlatılır; konuşanlar balonla. Hareket yerine davranış: yaşam aşamasına göre farklı pozlar. Durağan resmi kodla zıplatmak/esnetmek karakter animasyonu sayılmaz. Gerçek animasyon en fazla 2–3 büyük an için ve isteğe bağlı ([discussion-notes.md](./discussion-notes.md) §1).

**Stil: yarı 3D animasyon filmi görünümü (karar 2026-10-08).** Kahraman genç görünür.

**Stil kılavuzu (her üretimde uyulur):**

- Araç: fal.ai, `fal-ai/nano-banana-pro/edit` ($0,15/görsel). Arka plan silme `fal-ai/bria/background/remove` ($0,018).
- Referans görseller, her üretime eklenir: kahraman kılavuzu `art/pilot/01-hero-sheet/A1-semi3d.png`, Şans kılavuzu `art/pilot/02-poses/sans-sheet.png`. Yeni bir karakter önce kendi kılavuzunu alır; kahramanın kılavuzu yanına verilir, boy ve stil eşleşir.
- Her komutun sonuna aynen eklenen stil paragrafı: *"Art style (match the reference exactly): stylized semi-3D animated-film look, soft key light from the upper left, warm palette, soft shadows, clean readable shapes for a small phone screen, eye-level camera. No text, no labels, no logos, no watermark."*
- Karakterler ve nesneler düz açık gri zeminde üretilir, sonra arka planı silinir. Arka planlar 9:16, 2K; komuta *"a frame from a 3D CG animated feature film, NO ink outlines, NO cel shading, NO flat 2D cartoon"* eklenir (yoksa stil 2D'ye kayıyor).
- Hayvanlar için *"real four-legged dog, quadruped, NOT anthropomorphic"* şart.
- Sahne ve hikâye kareleri için üç referans: kahraman kılavuzu + bir kahraman pozu + yarı 3D bir arka plan (`art/pilot/02-poses/alley.png`). Tek referansla stil 2D'ye kayıyor.
- Arka plan üretiminde ara sokak (`alley-clean`) birinci referans; *"Keep EXACTLY the same camera height... keep the lower-center foreground clear"* cümlesi kompozisyonu tutturuyor.
- Eller: komuta *"exactly two arms and two hands"* eklenir; karışık el pozlarından kaçınılır, her görselin elleri tam çözünürlükte kontrol edilir (fazla eli düzenleme modeli silemedi, sade pozla sıfırdan üretmek işe yaradı).
- Kadro kılavuzları: `art/pilot/03-cast/` (anne, Rıza Amca, Bülent Bey); yeni üretimlerde ilgili kılavuz da referans verilir.
- Görsellere yazı, tabela, logo gömülmez (TR/EN).
- Oyunda: gece sahnelerinde karakterlere hafif soğuk renk tonu ve sıcak kenar ışığı (deneme: `art/pilot/scene-mock-alley.png`).

**Faz 1:**

| Görsel | Adet | Durum |
| --- | --- | --- |
| Önsöz kareleri | 6 | **Tamam** |
| Kirli ara sokak arka planı | 1 | **Tamam** (`public/assets/scene/alley.webp`) |
| Şişe, kutu | 3 | **Tamam** |
| Yönetici portreleri | 10 | **Tamam** (`public/assets/managers/`) |
| Kahraman: sokak aşaması 4 poz | 4 | **Tamam** (bekleme, toplama, sevinç, Şans'ı okşama) |
| Kahraman: diğer yaşam aşamaları × 4 poz | 8 | Bekliyor; kıyafet kararına bağlı (discussion-notes §7) |
| Şans: oturan, cüzdanlı | 2 | **Tamam**. Uyuyan (çevrimdışı dönüş) ve tasmalar bekliyor |
| Tören portreleri: anne (3 ifade), Rıza, Bülent Bey | — | Kadro sayfalarında var (`art/pilot/03-cast/`); kesilip oyuna alınacak |
| Orta Sınıf: çatı katı ve eski fotoğraf | 2 | **Tamam (deneme):** `art/pilot/07-story/milyoner-attic-v1.png`, `old-photo-v2.png`. Kahraman kapüşonlu; 3. kıyafet tasarlanınca çatı katı yeniden üretilir |
| En Zengin: konak, pencerede saksı | 1 | Bekliyor (~$0,15) |
| Ev arka planları (sahne) | 10–12 | Oturulan eve göre (discussion-notes §7). Deneme: Gündelikçi minibüsü `art/pilot/05-scene/home-1-van-v1.png` |

Kaynak dosyalar `art/pilot/` (git'te değil), oyundaki sıkıştırılmış hâlleri `public/assets/`. Harcama: plan 1.16.

## 9. Metin ihtiyacı (TR + EN, Faz 1)

| Metin | Adet | Durum |
| --- | --- | --- |
| Önsöz | 13 balon | Tamam (`prologue`) |
| Yönetici cümleleri | 10 × 3 | Tamam (`managers`) |
| Cüzdan, çevrimdışı ve işe alma kartları | — | Tamam |
| Tören kartları | 7 tören × 1–3 cümle (~20) | §4 taslakları |
| Anne mesajları | ~10 | Sınıfa bağlı havuz |
| Rıza Amca rehber balonları | ~8 | Plan 1.12 |

Metinler `src/game/i18n/` içine, ilgili özellik yazılırken eklenir.

## 10. Mekaniğe etkisi (planla bağ)

| Plan maddesi | Hikaye eklemesi |
| --- | --- |
| 1.6 Sahne | Ara sokak, şişe toplama, Şans'ın cüzdanı (tamam). Sahnenin törenle değişmesi: discussion-notes §7 |
| 1.7 İşletmeler | Her işletmeye kendi yöneticisi (tamam) |
| 1.8 Hayaller panosu | Faz 1'de sadece statü eşyaları (§5) |
| 1.10 Sınıf töreni | 7 tören kartı, defter merakı, annenin evi iki basamağı (§4) |
| 1.10 ile | Anne mesajları (sınıfa bağlı, günde en fazla 1), aynı balon bileşeniyle |
| 1.12 Onboarding | Rehber Rıza Amca; isim sorma ilk satın almadan sonra |
| 1.13 Çevrimdışı kartı | Kart hazır; Şans'ın kapıda uyanması bekliyor |
| 1.14–1.15 Analitik, test | Tören atlama oranı, Orta Sınıf'a ulaşanın ertesi gün dönüşü (§0) |
| 1.18 Önsöz | Tamam |
| Faz 2 | Hanedan (§6), olay kartları ve fikir havuzu (§7) |
