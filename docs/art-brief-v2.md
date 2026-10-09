# Görsel Brifi v2: Sahne aşamaları ve hikâye kareleri

Son güncelleme: 2026-10-09 · İlgili: [story-v2.md §4, §8](./story-v2.md), [discussion-notes.md §7](./discussion-notes.md), kod `src/game/ui/scene/stages.ts`, `src/game/ui/story/ceremonyScript.ts`

Bu belge, oyunun görsellerini üretecek kişiye ya da modele (GPT dahil) verilir. Neyin, hangi boyutta, hangi referansla ve hangi komutla üretileceğini anlatır. Üretilen dosyalar `art/pilot/` altına konur. Oyuna sıkıştırıp bağlamayı Claude yapar (webp, kesim, konum ayarı).

## 1. Ne değişiyor

Ana ekran sınıfı izler: her sınıf töreni kahramanı yeni bir yere, yeni bir kıyafetle taşır (karar 2026-10-09). Mağazadaki evler ve kıyafetler şimdilik sahneyi değiştirmez.

| Sınıf | Kahramanın yaşı | Arka plan | Kıyafet | Yerdeki toplanacaklar | Şans'ın tasması |
| --- | --- | --- | --- | --- | --- |
| 0 Sokakta Yaşayan | 17 | Ara sokak (**var**) | 1 kapüşonlu (**var**) | Şişe, kutu (**var**) | İp (**var**) |
| 1 Gündelikçi | 17 | Eski minibüs (**var**, `art/pilot/05-scene/home-1-van-v1.png`) | 1 kapüşonlu | Şişe, kutu | İp |
| 2 İşçi Sınıfı | 18 | Kiralık daire önü | 2 iş kıyafeti | Bozuk para | İp |
| 3 Orta Sınıf | 19 | Modern site avlusu | 3 şık günlük | Bozuk para | Deri |
| 4 Milyoner | 20 | Bahçeli müstakil ev | 3 şık günlük | Kâğıt para destesi | Deri |
| 5 Milyarder (ve sonrası, şimdilik) | 22–24 | Villa | 4 takım elbise | Para destesi, altın | Altın |

Yaşlar `npm run sim` sonucundan alındı. Kapalı testte oyuncular 11 günde en fazla Milyarder olur. Multimilyarder ve En Zengin şimdilik villayı kullanır.

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
| Arka plan | 9:16 dikey, en az 1536×2752 | Dolu | Ara sokakla **aynı kamera yüksekliği ve zemin çizgisi**. Alt orta boş kalır: karakterler x %35–70'te durur, ayaklar yüksekliğin %73'ünde; toplanacaklar yüksekliğin %69–85'i arasındaki zemine düşer. Üst %15'e ve alt %10'a önemli bir şey konmaz (üst bar ve alt menü kapatır). |
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

### 4.2 Arka planlar (A)

Hepsinde birinci referans `art/pilot/05-scene/alley-clean.png` (kamera ve zemin için). Komutun başı:
> Keep EXACTLY the same camera height, ground line and perspective as the first reference; keep the lower-center foreground clear and empty (characters will stand there). Morning or late-afternoon warm light. {yer tarifi}. A frame from a 3D CG animated feature film, NO ink outlines, NO cel shading, NO flat 2D cartoon. NO people, NO animals. {stil paragrafı}

| Sınıf | Dosya | Yer tarifi |
| --- | --- | --- |
| 2 İşçi | `art/pilot/05-scene/home-2-flat.png` | Eski ama bakımlı bir apartmanın giriş önü: birkaç basamak, ahşap kapı, saksılar, bisiklet, yan tarafta küçük bir dükkân vitrini. Mahalle sıcaklığı. |
| 3 Orta Sınıf | `art/pilot/05-scene/home-3-complex.png` | Modern bir sitenin avlusu: düzgün taş zemin, genç ağaçlar, bank, arkada balkonlu yeni bloklar. |
| 4 Milyoner | `art/pilot/05-scene/home-4-house.png` | Bahçeli müstakil bir evin ön bahçesi: çim, taş yol, verandada iki sandalye, çiçekler, beyaz çit. |
| 5 Milyarder | `art/pilot/05-scene/home-5-villa.png` | Modern bir villanın girişi: geniş taş avlu, havuzun bir köşesi, palmiye ya da zeytin ağaçları, büyük camlar. Gösterişli ama sıcak. |

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

## 5. Toplam

| Öncelik | Görseller | Adet |
| --- | --- | --- |
| A | 3 kıyafet kılavuzu, 12 poz, 4 arka plan, 2 toplanacak sayfası, 2 karakter kılavuzu, 3 hikâye karesi (H1–H3) | 26 |
| B | 4 Şans tasması, 3 hikâye karesi (H4–H6) | 7 |

Önerilen sıra: kıyafet 2 kılavuzu → 2'nin 4 pozu → İşçi arka planı → bozuk paralar. Bu ilk set oyunda denenince stil oturur, sonra kalanlar.

## 6. Oyuna bağlama (Claude)

Görsel `art/pilot/...` altına konunca: arka planı silinir (karakterler ve nesneler), webp'ye çevrilir (`public/assets/scene/`, `public/assets/story/`), `stages.ts`'te o aşamanın satırı doldurulur, konum ve boy telefonda ayarlanır. Bir aşamanın görseli eksikken o aşama bir öncekinin görsellerini kullanır, oyun bozulmaz. Portreler karakter kılavuzlarından kesilir (`public/assets/story/portraits/`).
