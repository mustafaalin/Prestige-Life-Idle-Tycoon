# Görsel Brifi v2: Sahne aşamaları ve hikâye kareleri

Son güncelleme: 2026-10-15 · İlgili: [story-v2.md §4, §8](./story-v2.md), [discussion-notes.md §1](./discussion-notes.md), kod `src/game/ui/scene/stages.ts`, `src/game/ui/story/ceremonyScript.ts`

Bu belge, oyunun görsellerini üretecek kişiye ya da modele (GPT dahil) verilir. Neyin, hangi boyutta, hangi referansla ve hangi komutla üretileceğini anlatır. Üretilen dosyalar `art/pilot/` altına konur. Oyuna sıkıştırıp bağlamayı Claude yapar (webp, kesim, konum ayarı). Evler ve araçlar için doğrudan yapıştırılacak İngilizce komutlar: [art-prompts-v2.md](./art-prompts-v2.md).

## 1. Ne değişiyor

Ana ekran iki şeyi gösterir (karar 2026-10-10):

- **Yer = oyuncunun oturduğu ev.** Mağazada 12 ev var; her biri sahnede ayrı bir arka plan. Taşınınca arka plan değişir. Sınıf töreni kahramanı hikâyenin evine taşır (Gündelikçi → minibüs, İşçi → eski kiralık daire...).
- **Evin izin verdiği en iyi araç önünde park eder.** Mağazada 12 araç var (ev–araç zinciri, game-design §4.5), yeni hayat araçsız başlar; yenisi alınınca sahneye kayarak gelir.
- **Kahraman sahip olduğu en iyi kıyafeti giyer** (mağazada 4 kıyafet; sınıf töreni sınıfınkini bedava verir). **Yerdeki toplanacaklar ve Şans'ın tasması sınıfı izler** (tablo aşağıda).

| Sınıf | Kahramanın yaşı | Kıyafet | Yerdeki toplanacaklar | Şans'ın tasması | Hikâyenin evi |
| --- | --- | --- | --- | --- | --- |
| 0 Sokakta Yaşayan | 17 | 1 kapüşonlu (**var**) | Şişe, kutu (**var**) | İp (**var**) | 1 Çadır |
| 1 Gündelikçi | 17 | 1 kapüşonlu | Şişe, kutu | İp | 2 Eski Minibüs |
| 2 İşçi Sınıfı | 18 | 2 iş kıyafeti (**var**) | Bozuk para (**var**) | İp | 4 Eski Kiralık Daire |
| 3 Orta Sınıf | 19 | 3 şık günlük | Yok (toplama biter) | Deri | 6 Sitede Daire |
| 4 Milyoner | 20 | 3 şık günlük | Yok | Deri | 7 İlk Kendi Evin |
| 5 Milyarder (ve sonrası, şimdilik) | 22–24 | 4 takım elbise | Yok | Altın | 9 Villa |

Yaşlar `npm run sim` sonucundan alındı.

## 2. Herkes için kurallar (stil kılavuzu, story §8'den)

- **Stil:** yarı 3D animasyon filmi görünümü. Her komutun sonuna şu paragraf **aynen** eklenir:
  > Art style (match the reference exactly): stylized semi-3D animated-film look, soft key light from the upper left, warm palette, soft shadows, clean readable shapes for a small phone screen, eye-level camera. No text, no labels, no logos, no watermark.
- **Arka planlara ayrıca:** *"a frame from a 3D CG animated feature film, NO ink outlines, NO cel shading, NO flat 2D cartoon"*. Bu olmadan stil 2D'ye kayıyor.
- **Karakterlere ayrıca:** *"exactly two arms and two hands"*. Ellerin her görselde tam çözünürlükte kontrol edilmesi gerekiyor; fazla el ya da parmak çıkan görsel düzeltilmeye çalışılmaz, sade pozla sıfırdan üretilir.
- **Şans için ayrıca:** *"real four-legged dog, quadruped, NOT anthropomorphic"*.
- **Yazı yok:** tabela, logo, yazı gömülmez (oyun Türkçe ve İngilizce).
- **Kahramanın yüzü her görselde aynı:** her kahraman görseline kılavuz `art/pilot/01-hero-sheet/A1-semi3d.png` referans olarak verilir. Tek referansla stil 2D'ye kayıyor; sahne ve hikâye karelerinde üç referans verilir: kahraman kılavuzu + bir kahraman pozu (`art/pilot/02-poses/hero-joy.png`) + yarı 3D bir arka plan (`art/pilot/02-poses/alley.png`).
- **Kadro kılavuzları:** anne `art/pilot/03-cast/mom-sheet.png`, Rıza Amca `art/pilot/03-cast/riza-sheet.png`, Bülent Bey `art/pilot/03-cast/bulent-sheet.png`, Şans `art/pilot/02-poses/sans-sheet.png`.

## 3. Teknik özellikler

| Tür | Boyut | Zemin | Not |
| --- | --- | --- | --- |
| Arka plan | 9:16 dikey, en az 1536×2752 | Dolu | Kamera ayakta duran yetişkinin göz hizasında, **ufuk yukarıdan %37'de** (her evde aynı). **Derin zemin:** duvarın, basamağın ya da çitin zemine değdiği çizgi en çok %55'te; altı boydan boya boş, düz, kuru zemin. Orada sırayla durur: araba (tekerlekler %62, x %13–89, kahramanın ~2,5 m arkası), bisiklet ve skuter (%70, sağda), kahraman (%73,5, x %40) ve Şans (x %66), toplanacaklar (%70–87). **Evi tanıtan şey %15–37 bandında** (göz hizasının üstü; onu hiçbir şey kapatmaz). Ev zenginleştikçe uzaklaşır: oda ve dairelerde yalnızca giriş, müstakil evden sonra evin tamamı görünür. Üst %15'e ve alt %10'a önemli bir şey konmaz (üst bar ve alt menü kapatır); yatay güvenli alan x %12–88. Arka planda araç olmaz (minibüs hariç: o evin kendisi). |
| Araç | Tek araç, gövde en az 1200 px genişlikte | Düz açık gri (#d9d9d9) | **Önden dörtte üç, önü sağa** (sahne aynalamaz), ön yüz tam görünür; kamera 1,6 m göz hizasında, uzun objektif (çapa `art/pilot/09-vehicles/vehicle-4.png`). Sahnede gerçek boyunda durur; araba şeridi 2,75 m olduğu için **kesilmiş görselin genişliği en çok 2,75 m ÷ aracın yüksekliği kadar olabilir** (araç başına sınır: [archive/art-prompts-v2-gen1.md §2](./archive/art-prompts-v2-gen1.md)); daha yandan çizilen araba küçültülür. Uzun arabalar biraz daha önden çizilir. Anten ve tavan yükü yok (boyu şişirir). Araç kadraja tam sığar; yakın taraftaki tekerlekler kesilmez. İnsan, plaka, logo, marka yok. |
| Kahraman pozu | Tek karakter, ayakta boy en az 1500 px | Düz açık gri (#d9d9d9) | Arka planı sonra silinir. Ayaklar görünür, kesilmez. Kamera göz hizasında, hafif yandan (mevcut sokak pozları gibi). |
| Toplanacaklar | Tek sayfada 3 nesne, aralarında boşluk | Düz açık gri | Her biri tek başına okunabilir, yukarıdan hafif açıyla. |
| Şans | Tek köpek | Düz açık gri | Mevcut `sans-sit-cut.png` ve `sans-wallet-cut.png` ile aynı ölçek; deri tasmada duruş aynı, altın tasmada ayrı (§4.3). |
| Karakter kılavuzu | Yatay sayfa (mevcut `mom-sheet.png` gibi) | Düz açık gri | Önden tam boy + 4 ifade portresi (yakın plan, omuzdan yukarı). Portreler oyunda yuvarlak kesilir. |
| Hikâye karesi | 9:16 dikey, en az 1536×2752 | Dolu | Alt %35'e konuşma balonu biner; yüzler ve önemli nesneler üst %65'te. |

### Sahne ölçeği ve ekran haritası (2026-10-11; kod `ui/scene/stages.ts`, `place.ts`, DEV → Sahne laboratuvarı)

Kahraman, Şans, araç ve ev her kombinasyonda aynı ölçekte ve birbirini kapatmadan durur:

- **Metre ölçeği:** kahraman 1,78 m = resim yüksekliğinin %40'ı; ayak çizgisinde (y %73,5) 1 m = %22,5. Ufuk göz hizasında (y %37); geriye gidince küçülme `(y − ufuk) / (ayak − ufuk)`.
- **Araba şeridi geride, gerçek boyda:** tekerlekler y %62 (kahramanın ~2,5 m arkası), şerit x %13–89 = 2,75 m. Bisiklet ve skuter kahramanın yanında (y %70).
- **Burundan hizalama, aynalama yok:** aracın burnu x %89'da, fazlası kahramanın arkasına gider; bütün araçlar önü sağa. Tek istisna çadır: iki teker solda, önü sola.
- **Boy gerçek yükseklikten:** `VEHICLE_SHAPE.metres` görselin kapsadığı her şeyin yüksekliği (anten, tavan rayı, aynalar dahil); 2,75 m'yi aşan görsel küçültülür (şimdi pikap ve arazi aracı, ×0,96).
- **Ev başına ayar:** araç şeridi, ışık ve kahramanın yatay yeri (`castX`) `HOME_ART`'ta; ev 2–5'te kahraman %7 sağda. Telefonda ev ev son ayar ve araç gölgesinin sahnede çizilmesi bekliyor (plan 1.6).

Ekran haritası (resmin oranı): üst %15 üst bar · %15–37 evin kimliği · en çok %55 duvarın zemine değdiği çizgi · %62 araba şeridi (x %13–89) · %70 iki teker şeridi · %73,5 kahraman (x %40) ve Şans (x %66) · %77–87 toplanacaklar · alt %10 menü · yatay güvenli alan x %12–88. Sol ve sağdaki yuvarlak düğmeler y %42 dolayında; hedef kartı sol üstte, tek satır.

**Dosya adları ve yerler** aşağıdaki tablolarda. Kaynak `art/pilot/...` altına PNG olarak konur. Aynı görselin denemeleri `-v1`, `-v2` diye adlandırılır; seçilen sürüm tablodaki adı alır, seçilmeyen denemeler silinir (kaynaklar Drive yedeğinde kalır).

## 4. Liste

**Öncelik:** A, AAB'den (kapalı teste çıkacak sürüm) önce gerekenler. B, olsa iyi olur. **Durum (2026-10-15):** listedeki görsellerin hepsi oyunda; açık kalanlar §5'te.

### 4.1 Kahraman kıyafetleri (A)

Her kıyafet için önce bir kıyafet kılavuzu üretilir (önden ve yandan tam boy), onaylanınca pozlar o kılavuzla üretilir; böylece kıyafet pozlar arasında değişmez. Yedi kıyafetin hepsi oyunda: aşağıdaki üçü 2026-10-12'de, deve tüyü palto, üç parçalı takım ve smokin 2026-10-14'te ([archive/art-prompts-v2-gen1.md §9](./archive/art-prompts-v2-gen1.md)); her birinin 4 ifade portresi de var.

| Kıyafet | Kılavuz dosyası | Tasarım |
| --- | --- | --- |
| 2 İş kıyafeti (18 yaş) | `art/pilot/08-outfits/outfit-2-sheet.png` | Lacivert iş ceketi, düz t-shirt, koyu iş pantolonu, sağlam botlar. Sırt çantası yok. Saç daha düzgün, yüz temiz. Mütevazı ama gururlu. |
| 3 Şık günlük (19–20 yaş) | `art/pilot/08-outfits/outfit-3-sheet.png` | Açık renk ince triko ya da gömlek üstüne casual blazer, chino pantolon, temiz beyaz spor ayakkabı, sade bir saat. |
| 4 Takım elbise (22–24 yaş) | `art/pilot/08-outfits/outfit-4-sheet.png` | Lacivert, iyi dikilmiş takım elbise, beyaz gömlek, kravat yok (yaka açık), kahverengi deri ayakkabı. Biraz daha olgun yüz, aynı kişi. |

Kılavuz komutu (kıyafet tasarımını değiştirerek):
> Character turnaround sheet of the SAME young man from the reference sheet (same face, hair, skin tone and proportions), now age {18/19/23}, wearing {kıyafet tasarımı, İngilizce}. Front view and side view, full body, neutral standing pose, arms relaxed at the sides, exactly two arms and two hands. Plain light grey background. {stil paragrafı}

Kıyafet 2 için 4 poz (oyunda), kıyafet 3 ve 4 için 3 poz (toplama Orta Sınıf'ta bittiği için `collect` yok; game-design §4.7): dosya `art/pilot/08-outfits/hero-{2|3|4}-{idle|collect|joy|pet}.png`.

| Poz | Ne yapıyor | Mevcut karşılığı (ölçek ve açı için referans) |
| --- | --- | --- |
| `idle` | Dik, rahat ayakta duruyor; kendinden emin, hafif gülümseme. Sokaktaki gibi üşümüyor. | `art/pilot/05-scene/hero-idle-cut.png` |
| `collect` (yalnızca kıyafet 2) | Eğilmiş, tek eliyle yerden bir şey alıyor. | `art/pilot/05-scene/hero-collect-cut.png` |
| `joy` | Sevinç: tek kol havada yumruk, gülüyor. | `art/pilot/05-scene/hero-joy-cut.png` |
| `pet` | Çömelmiş, yanında oturan Şans'ı okşuyor (Şans o aşamanın tasmasıyla: kıyafet 2 ip, kıyafet 3 deri, kıyafet 4 altın). | `art/pilot/05-scene/hero-pet-sans-cut.png` |

Hazır komutlar (kıyafet 3 ve 4): [archive/art-prompts-v2-gen1.md §4](./archive/art-prompts-v2-gen1.md). Bekleme pozu kıyafete göre ayrı bir duruş: şık günlükte rahat, bir eli cepte; takım elbisede kendinden emin, ceketini ilikliyor. Şablon:
> The SAME young man from the outfit sheet, same outfit, {poz tarifi}. Full body, feet visible, eye-level camera, slight three-quarter view like the pose reference. Exactly two arms and two hands. Plain light grey background. {stil paragrafı}
>
> Referanslar: kıyafet kılavuzu + `A1-semi3d.png` + mevcut poz karşılığı.

### 4.2 Ev arka planları (A)

12 ev; her biri sahnede ayrı bir yer. **Hepsi oyunda (2026-10-12)**: çadır eski görseliyle (önünde yalnızca bisiklet durur), ev 2–12 derin zeminli yeni görsellerle. Sıra önemli: oyuncu bunları sırayla görür, her biri bir öncekinden belirgin biçimde daha iyi olmalı. Her ev kendi iki aracına göre düşünülür (ev–araç zinciri, game-design §4.5); gelen görsele sahne laboratuvarında bakılır ve o eve özel yerleşim `stages.ts` `HOME_ART`'a yazılır.

Kurallar §3 "Arka plan" satırında; hazır komutlar [archive/art-prompts-v2-gen1.md §1](./archive/art-prompts-v2-gen1.md).

| # | Ev | Dosya | Yer tarifi | Durum |
| --- | --- | --- | --- | --- |
| 1 | Sokak Çadırı | | Ara sokak | Oyunda |
| 2 | Eski Minibüs | `art/pilot/05-scene/home-2-van.png` | Ara sokakta Rıza Amca'nın eski minibüsü; aynı yer, minibüs solda ve geride, önü açık. | Oyunda |
| 3 | Kiralık Oda | `art/pilot/05-scene/home-3-room.png` | Eski bir binanın arka avlusu, yarım bodrum katta tek pencereli küçük bir odanın kapısı; çamaşır ipi, saksıda fesleğen, birkaç basamak. Mütevazı ama temiz, ilk "kendi kapısı". | Oyunda |
| 4 | Eski Kiralık Daire | `art/pilot/05-scene/home-4-old-flat.png` | Eski ama bakımlı apartman girişi; mevcut görselin aynı yeri, kamera birkaç adım geride. | Oyunda |
| 5 | Yenice Kiralık Daire | `art/pilot/05-scene/home-5-newer-flat.png` | Yeni boyanmış 4–5 katlı bir apartmanın önü: cam giriş kapısı, balkonlarda çiçekler, kaldırımda genç bir ağaç ve bank. | Oyunda |
| 6 | Sitede Daire | `art/pilot/05-scene/home-6-complex.png` | Modern bir sitenin avlusu: düzgün taş zemin, genç ağaçlar, bank, arkada balkonlu yeni bloklar, güvenlik kulübesi uzakta. | Oyunda |
| 7 | İlk Kendi Evin | `art/pilot/05-scene/home-7-first-house.png` | Küçük, tek katlı müstakil bir ev, sürüş yolundan bir metre yukarıda: alçak taş duvar ve üstünde beyaz çit, birkaç basamak, minik ön bahçe, verandada bir sandalye. Gurur verici ama sade. | Oyunda (3. deneme) |
| 8 | Bahçeli Banliyö Evi | `art/pilot/05-scene/home-8-suburban.png` | İki katlı, geniş bahçeli banliyö evi: çim, taş yol, çiçek tarhları, bahçede salıncak, garaj kapısı. | Oyunda |
| 9 | Villa | `art/pilot/05-scene/home-9-villa.png` | Modern bir villanın girişi: geniş taş avlu, havuzun bir köşesi, zeytin ağaçları, büyük camlar. Gösterişli ama sıcak. | Oyunda |
| 10 | Göl Kenarında Cam Ev | `art/pilot/05-scene/home-10-lake.png` | Göl kıyısında camdan ve ahşaptan modern bir ev, arkada çam ormanı ve sakin göl, iskele. | Oyunda (sınırda: arazi aracı sol kanadı kapatıyor) |
| 11 | Sahil Malikânesi | `art/pilot/05-scene/home-11-beach.png` | Denize bakan beyaz bir malikâne: palmiyeler, geniş merdivenler, arkada turkuaz deniz. | Oyunda |
| 12 | Büyük Malikâne | `art/pilot/05-scene/home-12-mansion.png` | Klasik, çok büyük bir malikâne: çeşme, simetrik bahçe, uzun giriş yolu, akşam ışığında yanan pencereler. Oyunun en büyük evi. | Oyunda |

Not: annenin evleri (eski aile evi, konak) ayrı; mağazada yok, törenlerde hikâye karesi olarak görünür (§4.5).

### 4.3 Toplanacaklar ve Şans (A: toplanacaklar, B: Şans)

| Dosya | İçerik |
| --- | --- |
| `art/pilot/05-scene/items-coins.png` (A, oyunda) | Üç nesne: tek parlak bozuk para, küçük bozuk para yığını, birkaç madeni para ve buruşuk tek banknot. |
| `art/pilot/05-scene/sans-sit-leather.png` + `sans-wallet-leather.png` (B, oyunda) | Şans oturuyor / ağzında cüzdanla; kahverengi deri tasma, ipli olanla aynı duruş. Orta Sınıf'tan itibaren. |
| `art/pilot/05-scene/sans-sit-silver.png` + `sans-wallet-silver.png` + `sans-sleep-silver.png` (oyunda, 2026-10-15) | Gümüş tasma, altın tasmanın rahat duruşuyla. Milyoner'den itibaren. Komut [archive/art-prompts-v2-gen1.md §11](./archive/art-prompts-v2-gen1.md). |
| `art/pilot/05-scene/sans-sit-gold.png` + `sans-wallet-gold.png` (B, oyunda) | Altın tasma, ayrı duruş: rahat oturmuş, ağzı hafif açık ve mutlu; cüzdanı kuyruğu yukarıda, neşeli bir adımla getiriyor. Milyarder'den itibaren. |
| `art/pilot/05-scene/sans-sleep-{rope,leather,gold}.png` (oyunda) | Uyuyan Şans, sınıfın tasmasıyla; çevrimdışı kazanç kartında. |
| `art/pilot/05-scene/sans-*-ruby.png` (hazır, 2026-10-15) | Yakut tasma (ücretli ürün, IAP 2. adım); oturan, cüzdanlı, uyuyan. Oyundaki dosyalar `public/assets/scene/sans-*-ruby.webp`, bağlanmadı. |
| `public/assets/scene/sans-scarf.webp` (oyunda) | Başlangıç Paketi'nin kırmızı fuları, yalnız oturan Şans'ın üstüne çiziliyor; öbür pozlarda yok ([discussion-notes.md §1](./discussion-notes.md)). |

Şans için referans: `sans-sheet.png` + mevcut `sans-sit-cut.png` / `sans-wallet-cut.png`. Komut: *"The SAME dog as the reference, same pose, same scale; only change the collar to {a brown leather collar / a gold collar}. Real four-legged dog, quadruped, NOT anthropomorphic."*

### 4.4 Yeni karakterler: Nevin Hanım ve Defne (A, oyunda)

İşçi Sınıfı töreninde cüzdanını Şans'ın bulduğu yaşlı kadın ve torunu teşekküre gelir (story §4). Defne sonra kahramanın eşi olur (hayat anları, story §4c). İkisinin kılavuzu ve portreleri oyunda (2026-10-11).

| Dosya | Tarif |
| --- | --- |
| `art/pilot/03-cast/nevin-sheet.png` | Nevin Hanım: 70'lerinde, ufak tefek, gümüş saç topuz, gözlük, hırka, sıcak ve biraz şakacı. İfadeler: gülümseyen, duygulanmış (gözleri dolu), şaşkın, kahkaha. |
| `art/pilot/03-cast/defne-sheet.png` | Defne: 18 yaşında, güler yüzlü, doğal güzellikte; koyu kumral, omuz hizasında saç, sade kazak ve kot. Abartılı değil, kahramanla aynı stil ve boy oranında. İfadeler: gülümseyen, utangaç, şaşkın, gülen. |

Hazır komutlar: [archive/art-prompts-v2-gen1.md §3](./archive/art-prompts-v2-gen1.md). Özet: *"Character sheet: front full-body view plus four close-up expression portraits (head and shoulders) of {tarif}. Same style and proportions as the hero reference sheet. Plain light grey background."* Referans: `A1-semi3d.png` + `mom-sheet.png` (aynı sayfa düzeni için).

### 4.5 Hikâye kareleri

Yedisi de oyunda (2026-10-13, GPT; `public/assets/story/ceremony/`, 1080 px genişlik). Kareler tam genişlikte, üstten hizalı gösterilir (kırpma yok); alt üçte birin boş bırakılması bu yüzden şart. Her kare, töreninde aşağıdaki cümlelerin arkasında durur (`ceremonyScript.ts`).

| # | Tören | Kaynak → oyundaki dosya | Sahne | Arkasında durduğu cümleler |
| --- | --- | --- | --- | --- |
| H1 | 2 İşçi | `art/pilot/07-story/c2-nevin-door.png` → `nevin-door.webp` | Kiralık dairenin kapısı: Nevin Hanım elinde kurabiye tabağıyla, yanında Defne; kahraman (kıyafet 2) kapıda şaşkın ve mahcup; Şans kuyruk sallıyor. | Nevin, Defne ve kahramanın ilk cevabı. Anneyle telefon görselsiz. |
| H2 | 3 Orta Sınıf | `c3-attic-v2.png` → `attic.webp` (eskisinin yerine) | Çatı katı, **kıyafet 3**: kahraman eski defteri açmış, fotoğraf yere düşmüş; Şans deri tasmalı, yanında. | İki anlatım cümlesi. Ardından eski fotoğraf (`old-photo.webp`). |
| H3 | 4 Milyoner | `c4-riza-garden-v2.png` → `riza-garden.webp` | Annenin eski evinin bahçesi, erik ağacının altı: Rıza Amca elindeki fotoğrafa bakıyor (fotoğrafın yüzü ona dönük), ne gördüğü başının yanındaki anı balonunda; kahraman (kıyafet 3) yanında, verandada iki sandalye. | Rıza'nın iki cümlesi (önce eski fotoğrafın üstünde oynuyordu). İlk deneme `c4-riza-garden.png` kullanılmadı: fotoğrafın yüzü kameraya dönüktü. |
| H4 | 7 En Zengin | `c7-mansion-cake.png` → `mansion-cake.webp` | Konağın önü, pencerede saksı çiçekler: anne ağlayan-mutlu, kahraman (kıyafet 4) elinde kurdeleli pasta kutusu (önsözdekinin aynısı). | Törenin üç cümlesi. |
| H5 | 5 Milyarder | `c5-restaurant.png` → `restaurant.webp` | Bülent Bey'in restoranı (önsözdeki restoran): iki personel endişeli, Bülent Bey şaşkın, kahraman (kıyafet 4) sakin. | Törenin beş cümlesi. |
| H6 | 1 Gündelikçi | `c1-soup.png` → `soup.webp` | Minibüsün önünde Rıza Amca ve kahraman (kapüşonlu) sıcak çorba içiyor, Şans bekliyor. | Törenin dört cümlesi. |
| H7 | 6 Multimilyarder | `c6-workshop.png` → `workshop.webp` (2026-10-13) | Rıza Amca'nın atölyesi: kahraman anahtarları uzatıyor ([archive/art-prompts-v2-gen1.md §6](./archive/art-prompts-v2-gen1.md)). | Törenin üç cümlesi. |

Referanslar: sahnenin yeri (ilgili arka plan ya da önsöz karesi) + kahraman kıyafet kılavuzu + ilgili kadro kılavuzları + `alley.png` (stil). Komut, yer ve kişiler tarif edildikten sonra: *"Story panel, 9:16 vertical. Keep faces and key objects in the upper two thirds; the bottom third will be covered by a speech bubble."* + stil paragrafı + arka plan cümlesi.

### 4.6 Araçlar (A)

12 araç (karar 2026-10-11; önce 16'ydı; motosiklet ve pikap ev–araç zinciri için eklendi), evin önünde park eder; her evin önünde yalnızca kendi iki aracı görülür (tablo: art-prompts-v2-gen1 §2): araba kahramanın ~2,5 m arkasında, burnu sağda; bisiklet ve skuter kahramanın yanında, sağda. Hepsi önden dörtte üç, önü sağa (§3 Araç). Liste, sıra, araç başına oran sınırı ve hazır komutlar: [archive/art-prompts-v2-gen1.md §2](./archive/art-prompts-v2-gen1.md). Çapa hatchback (4). 12'si de yeni açıyla oyunda (2026-10-12, `public/assets/vehicles/v2/`). Sahnedeki boy aracın gerçek yüksekliğinden hesaplanır (`stages.ts` `VEHICLE_SHAPE`), görselin genişliğinden değil. Kesim: arka plan silinir, aracın alt %30'undaki gri (gölge ve tekerlekler arasından görünen zemin) yarı saydam siyaha çevrilir (sahnede zemine basar); bisiklet ve skuterde tekerlek içindeki kapalı gri de silinir.

### 4.7 İşletme ikonları (oyunda, 2026-10-13)

On işletmenin ikonu yeni stilde, GPT ile (`art/pilot/10-businesses/`, 1254 px kare, şeffaf zemin; her dosyanın yanında komutu `*-prompt.txt`). Oyunda `public/assets/businesses/v2/<işletme kimliği>.webp` (384 px), `core/config/businesses.ts`. Basamak hissi ikonlarda: açık tezgâh → el arabası → küçük dükkân → ... → cam kule. Kahve Arabası'nın iki denemesinden ikincisi (`coffee-cart-v2.png`, yeşil el arabası) kullanıldı: ilki Çiçek Tezgâhı'yla aynı ahşap tezgâhtı. v1'in 40 ikonu (`public/assets/businesses/small/`, `large/`) v1'de kalır.

**Aşamalar (2026-10-21):** işletmeler artık seviyeyle büyüyor; bu on ikon 1. aşamadır. 2. ve 3. aşama ile dört yeni işletmenin komutları [art-prompts-businesses.md](./art-prompts-businesses.md).

Yeni ikon komutu (özet): *"ONE high-resolution square game business icon for {işletme}. Slight three-quarter view, whole building visible, centered. Genuine transparent background, no ground plane, no frame. Chunky readable simplified shapes for viewing at 76px. NO people, NO text, NO logos."* + stil paragrafı.

## 5. Bekleyenler

Bu brifteki görsellerin hepsi oyunda. Devrin 15 görseli de oyunda (2026-10-16; beş kılavuzdan 20 portre, üç dede pozu, üç hikâye karesi, dört yadigâr ikonu; [story-v2.md §8](./story-v2.md)); komutlar: [art-prompts-dynasty.md](./art-prompts-dynasty.md). Reklam butonlarının ikonu `ad-reward` (önceden üretilmişti) 2026-10-16'da bağlandı. Yeni görsel gerekince önce GPT, sonra fal.ai. Fularlı Şans'ın 12 görseli (ip, deri, gümüş, altın × oturan, cüzdanlı, uyuyan) ve lükslerin gölgesiz yeni kesimi (`scripts/cutout-pale.sh`) 2026-10-16'da oyunda. Açık kalanlar ([discussion-notes.md §1](./discussion-notes.md)): okşama pozlarında tasma ve fular, önsözün stil kararı (3D denemesi hazır), lükslerin sahnede gösterimi (plan 2.6).

GPT'nin aracı ~1,57 MP veriyor: arka plan 941×1672 (1080 genişliğe büyütülüyor, telefonda kabul edilebilir), pozlar 1000 px yüksekliğe yetiyor.

## 6. Oyuna bağlama (Claude)

Görsel `art/pilot/...` altına konunca: arka planı silinir (`scripts/cutout.sh`; beyaz ayakkabılı ya da açık renkli görselde betiğin %7 toleransı ve alt şerit kuralı ayakkabıyı da siler, kıyafet 3'te %3 toleransla ve şeritsiz kesildi; kol ile gövde arasındaki kapalı gri boşluklar ayrıca silinir, ilk sette bu adım elle yapıldı) (karakterler ve nesneler), webp'ye çevrilir (`public/assets/scene/`, `public/assets/story/`), `stages.ts`'te o sınıfın satırı doldurulur (ev arka planı ise `config/housing.ts`'te evin `image`'ı, gerekirse `stages.ts` `HOME_ART`'ta yerleşim; araç `scripts/cutout-vehicle.sh` ile `public/assets/vehicles/v2/` ve `VEHICLE_SHAPE`), konum ve boy telefonda ayarlanır. Bir aşamanın görseli eksikken o aşama bir öncekinin görsellerini kullanır, oyun bozulmaz. Portreler karakter kılavuzlarından kesilir (`public/assets/story/portraits/`).
