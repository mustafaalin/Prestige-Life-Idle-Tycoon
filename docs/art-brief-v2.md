# Görsel Brifi v2: Sahne aşamaları ve hikâye kareleri

Son güncelleme: 2026-10-10 · İlgili: [story-v2.md §4, §8](./story-v2.md), [discussion-notes.md §7](./discussion-notes.md), kod `src/game/ui/scene/stages.ts`, `src/game/ui/story/ceremonyScript.ts`

Bu belge, oyunun görsellerini üretecek kişiye ya da modele (GPT dahil) verilir. Neyin, hangi boyutta, hangi referansla ve hangi komutla üretileceğini anlatır. Üretilen dosyalar `art/pilot/` altına konur. Oyuna sıkıştırıp bağlamayı Claude yapar (webp, kesim, konum ayarı). Evler ve araçlar için doğrudan yapıştırılacak İngilizce komutlar: [art-prompts-v2.md](./art-prompts-v2.md).

## 1. Ne değişiyor

Ana ekran iki şeyi gösterir (karar 2026-10-10):

- **Yer = oyuncunun oturduğu ev.** Mağazada 12 ev var; her biri sahnede ayrı bir arka plan. Taşınınca arka plan değişir. Sınıf töreni kahramanı hikâyenin evine taşır (Gündelikçi → minibüs, İşçi → eski kiralık daire...).
- **En iyi araç evin önünde park eder.** Mağazada 10 araç var, yeni hayat araçsız başlar; yenisi alınınca sahneye kayarak gelir.
- **Kahraman sahip olduğu en iyi kıyafeti giyer** (mağazada 4 kıyafet; sınıf töreni sınıfınkini bedava verir). **Yerdeki toplanacaklar ve Şans'ın tasması sınıfı izler** (tablo aşağıda).

| Sınıf | Kahramanın yaşı | Kıyafet | Yerdeki toplanacaklar | Şans'ın tasması | Hikâyenin evi |
| --- | --- | --- | --- | --- | --- |
| 0 Sokakta Yaşayan | 17 | 1 kapüşonlu (**var**) | Şişe, kutu (**var**) | İp (**var**) | 1 Çadır |
| 1 Gündelikçi | 17 | 1 kapüşonlu | Şişe, kutu | İp | 2 Eski Minibüs |
| 2 İşçi Sınıfı | 18 | 2 iş kıyafeti (**var**) | Bozuk para (**var**) | İp | 4 Eski Kiralık Daire |
| 3 Orta Sınıf | 19 | 3 şık günlük | Bozuk para | Deri | 6 Sitede Daire |
| 4 Milyoner | 20 | 3 şık günlük | Kâğıt para destesi | Deri | 7 İlk Kendi Evin |
| 5 Milyarder (ve sonrası, şimdilik) | 22–24 | 4 takım elbise | Para destesi, altın | Altın | 9 Villa |

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
| Arka plan | 9:16 dikey, en az 1536×2752 | Dolu | Ara sokakla **aynı kamera yüksekliği ve zemin çizgisi**. Alt orta boş kalır: karakterler x %35–70'te durur, ayaklar yüksekliğin %73'ünde; toplanacaklar yüksekliğin %69–85'i arasındaki zemine düşer. **Sol taraf araç için boş, düz zemin:** araç gerçek boyunda, kahramanın bir adım gerisinde park eder (tavanı omuz hizasında): x %0–55, y %35–66 arası (tekerlekler %65'te). Üst %15'e ve alt %10'a önemli bir şey konmaz (üst bar ve alt menü kapatır). Arka planda araç olmaz (minibüs hariç: o evin kendisi). |
| Araç | Tek araç, gövde en az 1200 px genişlikte | Düz açık gri (#d9d9d9) | Arabalar **önden dörtte üç**: düz önden ~25–30° dönük, önü hafif sola, ön yüz tam görünür, hafif yukarıdan (çapa `art/pilot/09-vehicles/vehicle-4.png`); bisiklet ve skuter yandan dörtte üç. Araç kadraja tam sığar; yakın taraftaki tekerlekler kesilmez (karşı taraftakiler doğal olarak gizlenebilir). İnsan, plaka, logo, marka yok. |
| Kahraman pozu | Tek karakter, ayakta boy en az 1500 px | Düz açık gri (#d9d9d9) | Arka planı sonra silinir. Ayaklar görünür, kesilmez. Kamera göz hizasında, hafif yandan (mevcut sokak pozları gibi). |
| Toplanacaklar | Tek sayfada 3 nesne, aralarında boşluk | Düz açık gri | Her biri tek başına okunabilir, yukarıdan hafif açıyla. |
| Şans | Tek köpek | Düz açık gri | Mevcut `sans-sit-cut.png` ve `sans-wallet-cut.png` ile aynı poz ve ölçek, sadece tasma değişir. |
| Karakter kılavuzu | Yatay sayfa (mevcut `mom-sheet.png` gibi) | Düz açık gri | Önden tam boy + 4 ifade portresi (yakın plan, omuzdan yukarı). Portreler oyunda yuvarlak kesilir. |
| Hikâye karesi | 9:16 dikey, en az 1536×2752 | Dolu | Alt %35'e konuşma balonu biner; yüzler ve önemli nesneler üst %65'te. |

**Dosya adları ve yerler** aşağıdaki tablolarda. Kaynak `art/pilot/...` altına PNG olarak konur. Aynı görselin denemeleri `-v1`, `-v2` diye adlandırılır, seçilen sürüm söylenir.

## 4. Liste

**Öncelik:** A, AAB'den (kapalı teste çıkacak sürüm) önce gerekenler. B, olsa iyi olur.

### 4.1 Kahraman kıyafetleri (A)

Her kıyafet için önce bir kıyafet kılavuzu üretilir (önden ve yandan tam boy), onaylanınca 4 poz o kılavuzla üretilir. Böylece kıyafet pozlar arasında değişmez.

| Kıyafet | Kılavuz dosyası | Tasarım |
| --- | --- | --- |
| 2 İş kıyafeti (18 yaş) | `art/pilot/08-outfits/outfit-2-sheet.png` | Lacivert iş ceketi, düz t-shirt, koyu iş pantolonu, sağlam botlar. Sırt çantası yok. Saç daha düzgün, yüz temiz. Mütevazı ama gururlu. |
| 3 Şık günlük (19–20 yaş) | `art/pilot/08-outfits/outfit-3-sheet.png` | Açık renk ince triko ya da gömlek üstüne casual blazer, chino pantolon, temiz beyaz spor ayakkabı, sade bir saat. |
| 4 Takım elbise (22–24 yaş) | `art/pilot/08-outfits/outfit-4-sheet.png` | Lacivert, iyi dikilmiş takım elbise, beyaz gömlek, kravat yok (yaka açık), kahverengi deri ayakkabı. Biraz daha olgun yüz, aynı kişi. |

Kılavuz komutu (kıyafet tasarımını değiştirerek):
> Character turnaround sheet of the SAME young man from the reference sheet (same face, hair, skin tone and proportions), now age {18/19/23}, wearing {kıyafet tasarımı, İngilizce}. Front view and side view, full body, neutral standing pose, arms relaxed at the sides, exactly two arms and two hands. Plain light grey background. {stil paragrafı}

Her kıyafet için 4 poz: dosya `art/pilot/08-outfits/hero-{2|3|4}-{idle|collect|joy|pet}.png`.

| Poz | Ne yapıyor | Mevcut karşılığı (ölçek ve açı için referans) |
| --- | --- | --- |
| `idle` | Dik, rahat ayakta duruyor; kendinden emin, hafif gülümseme. Sokaktaki gibi üşümüyor. | `art/pilot/05-scene/hero-idle-cut.png` |
| `collect` | Eğilmiş, tek eliyle yerden bir şey alıyor. | `art/pilot/05-scene/hero-collect-cut.png` |
| `joy` | Sevinç: tek kol havada yumruk, gülüyor. | `art/pilot/05-scene/hero-joy-cut.png` |
| `pet` | Çömelmiş, yanında oturan Şans'ı okşuyor (Şans o aşamanın tasmasıyla: kıyafet 2 ip, kıyafet 3 deri, kıyafet 4 altın). | `art/pilot/05-scene/hero-pet-sans-cut.png` |

Poz komutu:
> The SAME young man from the outfit sheet, same outfit, {poz tarifi}. Full body, feet visible, eye-level camera, slight three-quarter view like the pose reference. Exactly two arms and two hands. Plain light grey background. {stil paragrafı}
>
> Referanslar: kıyafet kılavuzu + `A1-semi3d.png` + mevcut poz karşılığı.

### 4.2 Ev arka planları (A)

12 ev; her biri sahnede ayrı bir yer. Sokak, minibüs ve eski kiralık daire hazır. Kalan 9 ev şimdilik v1'in eski görselleriyle (2D'ye yakın, araç yeri yok) duruyor; yenileri gelince değiştirilir. Sıra önemli: oyuncu bunları sırayla görür, her biri bir öncekinden belirgin biçimde daha iyi olmalı.

Hepsinde birinci referans `art/pilot/05-scene/alley-clean.png` (kamera ve zemin için). Komutun başı:
> Keep EXACTLY the same camera height, ground line and perspective as the first reference; keep the lower-center foreground clear and empty (characters will stand there) and keep the lower-left ground flat and empty (a car will be parked there). Morning or late-afternoon warm light. {yer tarifi}. A frame from a 3D CG animated feature film, NO ink outlines, NO cel shading, NO flat 2D cartoon. NO people, NO animals, NO vehicles. {stil paragrafı}

| # | Ev | Dosya | Yer tarifi | Durum |
| --- | --- | --- | --- | --- |
| 1 | Sokak Çadırı | | Ara sokak | **Var** |
| 2 | Eski Minibüs | | Ara sokakta Rıza Amca'nın eski minibüsü | **Var** |
| 3 | Kiralık Oda | `art/pilot/05-scene/home-3-room.png` | Eski bir binanın arka avlusu, yarım bodrum katta tek pencereli küçük bir odanın kapısı; çamaşır ipi, saksıda fesleğen, birkaç basamak. Mütevazı ama temiz, ilk "kendi kapısı". | Bekliyor |
| 4 | Eski Kiralık Daire | | Eski ama bakımlı apartman girişi | **Var** |
| 5 | Yenice Kiralık Daire | `art/pilot/05-scene/home-5-newer-flat.png` | Yeni boyanmış 4–5 katlı bir apartmanın önü: cam giriş kapısı, balkonlarda çiçekler, kaldırımda genç bir ağaç ve bank. | Bekliyor |
| 6 | Sitede Daire | `art/pilot/05-scene/home-6-complex.png` | Modern bir sitenin avlusu: düzgün taş zemin, genç ağaçlar, bank, arkada balkonlu yeni bloklar, güvenlik kulübesi uzakta. | Bekliyor |
| 7 | İlk Kendi Evin | `art/pilot/05-scene/home-7-first-house.png` | Küçük, tek katlı müstakil bir ev: beyaz çit, minik ön bahçe, verandada bir sandalye, kapının önünde paspas. Gurur verici ama sade. | Bekliyor |
| 8 | Bahçeli Banliyö Evi | `art/pilot/05-scene/home-8-suburban.png` | İki katlı, geniş bahçeli banliyö evi: çim, taş yol, çiçek tarhları, bahçede salıncak, garaj kapısı. | Bekliyor |
| 9 | Villa | `art/pilot/05-scene/home-9-villa.png` | Modern bir villanın girişi: geniş taş avlu, havuzun bir köşesi, zeytin ağaçları, büyük camlar. Gösterişli ama sıcak. | Bekliyor |
| 10 | Göl Kenarında Cam Ev | `art/pilot/05-scene/home-10-lake.png` | Göl kıyısında camdan ve ahşaptan modern bir ev, arkada çam ormanı ve sakin göl, iskele. | Bekliyor |
| 11 | Sahil Malikânesi | `art/pilot/05-scene/home-11-beach.png` | Denize bakan beyaz bir malikâne: palmiyeler, geniş merdivenler, arkada turkuaz deniz. | Bekliyor |
| 12 | Büyük Malikâne | `art/pilot/05-scene/home-12-mansion.png` | Klasik, çok büyük bir malikâne: çeşme, simetrik bahçe, uzun giriş yolu, akşam ışığında yanan pencereler. Oyunun en büyük evi. | Bekliyor |

Not: annenin evleri (eski aile evi, konak) ayrı; mağazada yok, törenlerde hikâye karesi olarak görünür (§4.5).

### 4.3 Toplanacaklar ve Şans (A: toplanacaklar, B: Şans)

| Dosya | İçerik |
| --- | --- |
| `art/pilot/05-scene/items-coins.png` (A) | Üç nesne: tek parlak bozuk para, küçük bozuk para yığını, birkaç madeni para ve buruşuk tek banknot. |
| `art/pilot/05-scene/items-cash.png` (A) | Üç nesne: bantlı kâğıt para destesi, altın para, küçük altın külçe. |
| `art/pilot/05-scene/sans-sit-leather.png` + `sans-wallet-leather.png` (B) | Şans oturuyor / ağzında cüzdanla; kahverengi deri tasma. |
| `art/pilot/05-scene/sans-sit-gold.png` + `sans-wallet-gold.png` (B) | Aynısı, altın tasma. |

Şans için referans: `sans-sheet.png` + mevcut `sans-sit-cut.png` / `sans-wallet-cut.png`. Komut: *"The SAME dog as the reference, same pose, same scale; only change the collar to {a brown leather collar / a gold collar}. Real four-legged dog, quadruped, NOT anthropomorphic."*

### 4.4 Yeni karakterler: Nevin Hanım ve Defne (A)

İşçi Sınıfı töreninde cüzdanını Şans'ın bulduğu yaşlı kadın ve torunu teşekküre gelir (story §4). Defne, Faz 2'de kahramanın eşi olacak.

| Dosya | Tarif |
| --- | --- |
| `art/pilot/03-cast/nevin-sheet.png` | Nevin Hanım: 70'lerinde, ufak tefek, gümüş saç topuz, gözlük, hırka, sıcak ve biraz şakacı. İfadeler: gülümseyen, duygulanmış (gözleri dolu), şaşkın, kahkaha. |
| `art/pilot/03-cast/defne-sheet.png` | Defne: 18 yaşında, güler yüzlü, doğal güzellikte; koyu kumral, omuz hizasında saç, sade kazak ve kot. Abartılı değil, kahramanla aynı stil ve boy oranında. İfadeler: gülümseyen, utangaç, şaşkın, gülen. |

Komut: *"Character sheet: front full-body view plus four close-up expression portraits (head and shoulders) of {tarif}. Same style and proportions as the hero reference sheet. Plain light grey background."* Referans: `A1-semi3d.png` + `mom-sheet.png` (aynı sayfa düzeni için).

### 4.5 Hikâye kareleri

| # | Tören | Dosya | Sahne | Öncelik |
| --- | --- | --- | --- | --- |
| H1 | 2 İşçi | `art/pilot/07-story/c2-nevin-door.png` | Kiralık dairenin kapısı (4.2'deki apartman girişiyle aynı yer): Nevin Hanım elinde kurabiye tabağıyla, yanında Defne; kahraman (kıyafet 2) kapıda şaşkın ve mahcup; Şans kuyruk sallıyor. | A |
| H2 | 3 Orta Sınıf | `art/pilot/07-story/c3-attic-v2.png` | Mevcut çatı katı (`art/pilot/07-story/milyoner-attic-v1.png`) **kıyafet 3** ile yeniden: kahraman tozlu çatı katında eski defteri açmış, sayfalardan bir fotoğraf düşüyor. | A |
| H3 | 4 Milyoner | `art/pilot/07-story/c4-riza-garden.png` | Annenin eski evinin bahçesi, erik ağacının altında: Rıza Amca elinde eski fotoğrafla duygulanmış, kahraman (kıyafet 3) yanında. Arkada verandada iki sandalye. | A |
| H4 | 7 En Zengin | `art/pilot/07-story/c7-mansion-cake.png` | Konağın önü, büyük pencereler, pencerede saksı çiçekler: anne ağlayan-mutlu, kahraman (kıyafet 4) elinde kurdeleli pasta kutusu (önsözdekinin aynısı, `art/pilot/04-prologue/prologue-4-door.png`). | B |
| H5 | 5 Milyarder | `art/pilot/07-story/c5-restaurant.png` | Bülent Bey'in restoranı (önsözdeki restoran, `prologue-1-restaurant.png`): personel endişeli, Bülent Bey şaşkın, kahraman (kıyafet 4) sakin. | B |
| H6 | 1 Gündelikçi | `art/pilot/07-story/c1-soup.png` | Minibüsün önünde (4.2'deki minibüs), Rıza Amca ve kahraman (kapüşonlu) tencereden sıcak çorba içiyor, Şans bekliyor. | B |

Referanslar: sahnenin yeri (ilgili arka plan ya da önsöz karesi) + kahraman kıyafet kılavuzu + ilgili kadro kılavuzları + `alley.png` (stil). Komut, yer ve kişiler tarif edildikten sonra: *"Story panel, 9:16 vertical. Keep faces and key objects in the upper two thirds; the bottom third will be covered by a speech bubble."* + stil paragrafı + arka plan cümlesi.

### 4.6 Araçlar (A)

10 araç (karar 2026-10-11; önce 16'ydı, el arabası çıktı), evin önünde park eder (sol alt, kahramanın arkasında). Araç kahramanın solunda durur, arka kısmı onun arkasında kalabilir; arabalar önden dörtte üç (§3 Araç). Liste, sıra ve hazır komutlar: [art-prompts-v2.md §2](./art-prompts-v2.md). Önce hatchback (4) üretilir; diğerleri onu açı ve stil referansı olarak kullanır. İlk 5'i oyunda (2026-10-11, `public/assets/vehicles/v2/`); 6–10 v1 görselleriyle yer tutuyor. Kesim: arka plan silinir, aracın alt %30'undaki gri (gölge ve tekerlekler arasından görünen zemin) yarı saydam siyaha çevrilir (sahnede zemine basar); bisiklet ve skuterde tekerlek içindeki kapalı gri de silinir.

## 5. Toplam

| Öncelik | Görseller | Adet |
| --- | --- | --- |
| A | 3 kıyafet kılavuzu, 12 poz, 9 ev arka planı, 10 araç, 2 toplanacak sayfası, 2 karakter kılavuzu, 3 hikâye karesi (H1–H3) | 41 |
| B | 4 Şans tasması, 3 hikâye karesi (H4–H6) | 7 |

İlk set (kıyafet 2 kılavuzu ve 4 pozu, İşçi arka planı, bozuk paralar) 2026-10-09'da GPT ile üretildi ve oyuna bağlandı (`stages.ts` aşama 2). GPT'nin aracı ~1,57 MP veriyor: arka plan 941×1672 (1080 genişliğe büyütüldü, telefonda kabul edilebilir), pozlar 1000 px yüksekliğe yetiyor. Sıradaki: hatchback (araç çapası) ve bisiklet, ev 3 (Kiralık Oda) ve 5 (Yenice Kiralık Daire) — ilk oturumda görülenler; sonra kıyafet 3, ev 6–7, Nevin ve Defne kılavuzları.

## 6. Oyuna bağlama (Claude)

Görsel `art/pilot/...` altına konunca: arka planı silinir (`scripts/cutout.sh`; kol ile gövde arasındaki kapalı gri boşluklar ayrıca silinir, ilk sette bu adım elle yapıldı) (karakterler ve nesneler), webp'ye çevrilir (`public/assets/scene/`, `public/assets/story/`), `stages.ts`'te o sınıfın satırı doldurulur (ev arka planı ise `config/housing.ts`'te evin `image`'ı, gerekirse `stages.ts` `PARKING`'de park yeri; araç `public/assets/vehicles/`), konum ve boy telefonda ayarlanır. Bir aşamanın görseli eksikken o aşama bir öncekinin görsellerini kullanır, oyun bozulmaz. Portreler karakter kılavuzlarından kesilir (`public/assets/story/portraits/`).
