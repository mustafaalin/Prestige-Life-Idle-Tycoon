# Görsel Komutları: Devir (dede, yetişkin kız, torun, yadigârlar)

Son güncelleme: 2026-10-16 · İlgili: [story-v2.md §4c, §6, §8](./story-v2.md), [game-design-v2.md §4.5](./game-design-v2.md), [art-brief-v2.md](./art-brief-v2.md) (genel kurallar, ekran haritası), [discussion-notes.md §3](./discussion-notes.md)

**Üretim durumu (2026-10-16): Tamam.** Beş ayrı kılavuz (Ada 7/17 ayrı), üç dede pozu, üç hayat anı ve dört yadigâr ikonu: toplam 15 seçili PNG ve yanlarında kullanılan `-prompt.txt` dosyaları hazır. Dosya listesi, doğal boyutlar ve entegrasyon notları: [dynasty-art-handoff.md](./dynasty-art-handoff.md). Kılavuzlar 1536×1024; ayakta pozlar 887×1774, P3 1024×1536; hikâye kareleri 941×1672; ikonlar gerçek alfa kanallı 1254×1254. P3'te eğilmiş karakter yaklaşık 1380 px yüksekliğinde; 1500 px hedefinin altında, yapay büyütme yapılmadı. Eller yakın planda ve ikonlar 56 px'te kontrol edildi. Runtime entegrasyonu bu üretim kapsamında yapılmadı.

Bu belge GPT'ye (VS Code'da) verilir. Devrin hikâye anları ve Aile sekmesi için gereken **15 görselin** (Ada yaşları ayrıldıktan sonraki toplam) sırasını, referanslarını, kayıt yerini ve doğrudan yapıştırılacak İngilizce komutlarını içerir. Oyuna bağlama (kesim, webp, kod) Claude'un işidir (§6).

## 0. GPT için çalışma kuralları

1. **Sırayla üret.** Önce dört kılavuz (§2). Her kılavuz kullanıcı onaylamadan sonrakine geçilmez, çünkü sonraki görseller onu referans alır. Yüz tutarlılığı buna bağlı.
2. **Referansları her üretime ekle.** Her komutun altında hangi dosyaların ekleneceği yazılı. Tek referansla stil 2D'ye kayıyor.
3. **Kayıt:** Görsel tablodaki yola PNG olarak kaydedilir; yanına aynı adla `-prompt.txt` dosyasına kullanılan komut yazılır (mevcut düzen, örnek `art/pilot/07-story/c7-mansion-cake-prompt.txt`). Denemeler `-v1`, `-v2` diye adlandırılır, seçilen tablodaki adı alır.
4. **Kontrol:** Eller tam çözünürlükte kontrol edilir: iki kol, iki el, beşer parmak. Fazla el ya da parmak çıkarsa düzeltmeye çalışılmaz, daha sade pozla yeniden üretilir. Görselde yazı, tabela ya da logo olmaz.
5. `art/` git'te değil. Bittiğinde `npm run backup` (Drive yedeği).

## 1. Ortak bilgiler

**Yaşlar** (story §4c): Kahraman ile Defne aynı yaşta. Kızları Elif, kahraman 31 yaşındayken doğar. Torun Ada, kahraman 63 yaşındayken doğar. Dede görünümü 60 yaşından sonra başlar.

| An | Kahraman (dede) | Defne | Elif (kızı) | Ada (torun) |
| --- | --- | --- | --- | --- |
| Torunun doğumu | 63 | 63 | 32 | yeni doğmuş |
| Dede ve torun | 70 | 70 | 39 | 7 |
| Devir | 80 | 80 | 49 | 17 |

**Değişmeyen işaret: babanın saati.** Kahraman takım elbise kıyafetinden beri sol bileğinde **altın kasalı, krem kadranlı, kahverengi deri kayışlı klasik bir saat** takıyor (`art/pilot/08-outfits/outfit-4-sheet.png`). Bu saat babası Mehmet'ten kalma ve Aile sekmesindeki ilk yadigâr ("Mehmet'in saati"). Dedede aynı saat durur. Devir karesinde dede saati torununa verir. Ada'nın kılavuzunda saat, bileğine bol gelen erkek saati olarak durur. Her görselde saatin tarifi aynı kalır.

**Şans:** Ölüm gösterilmediği için karelerdeki köpek Şans'ın aynısıdır (`sans-sheet.png`, altın tasma). Hikâyede onu Şans'ın yavrusu olarak okumak mümkün (yadigârdaki "tasması yavrusuna geçti"), ama görselde ayrı bir köpek tasarlanmaz.

**Annen, Rıza Amca, Nevin Hanım** bu karelerde görünmez. Varlıkları eşyalarla sürer: erik reçeli kavanozu, çiçek tezgâhı, kurabiye.

**Stil paragrafı.** Aşağıdaki komutlara zaten eklenmiş durumda, ayrıca eklemeye gerek yok:

> Art style (match the reference exactly): stylized semi-3D animated-film look, soft key light from the upper left, warm palette, soft shadows, clean readable shapes for a small phone screen, eye-level camera. No text, no labels, no logos, no watermark.

## 2. Kılavuzlar (önce bunlar, sırayla)

Sayfa düzeni Defne kılavuzu (`art/pilot/03-cast/defne-sheet.png`) ile aynı: yatay sayfa, açık gri zemin, solda üç tam boy (önden, dörtte üç, yandan), sağda 2×2 ifade portresi (omuzdan yukarı). Portreler oyunda yuvarlak kesilir, bu yüzden her birinin etrafında boşluk bırakılır.

| # | Dosya | Kim | Portreler (sol üstten sağ alta) |
| --- | --- | --- | --- |
| K1 | `art/pilot/16-dynasty/grandpa-sheet.png` | Dede (kahraman ~70) | happy, soft, determined, worried |
| K2 | `art/pilot/16-dynasty/defne-old-sheet.png` | Yaşlı Defne (~70) | smile, shy, surprised, laugh |
| K3 | `art/pilot/16-dynasty/elif-sheet.png` | Elif, kızı (~32) | smile, teary, surprised, laugh |
| K4a | `art/pilot/16-dynasty/ada-17-sheet.png` | Ada, torun (17) | smile, determined, surprised, laugh |
| K4b | `art/pilot/16-dynasty/ada-7-sheet.png` | Ada, çocukluk (7) | smile, determined, surprised, laugh |

Portre ifadeleri koddaki ifade adlarıyla aynı seçildi. Dede kahramanın dört ifadesini, yaşlı Defne genç Defne'ninkileri kullanıyor, böylece konuşma satırları değişmeden çalışır.

### K1 Dede kılavuzu

Referanslar: `art/pilot/01-hero-sheet/A1-semi3d.png` (yüz), `art/pilot/08-outfits/outfit-4-sheet.png` (saat, yetişkin yüz), `art/pilot/03-cast/defne-sheet.png` (sayfa düzeni), `art/pilot/03-cast/riza-sheet.png` (aynı stilde yaşlı bir yüzün nasıl çizildiği).

```
Character sheet of the SAME man from reference 1 and reference 2, now about 70 years old: a warm, lively grandfather. Keep his identity unmistakable: same face shape, same brown eyes, same eyebrows, same nose and smile, same slim build; he must read instantly as the same hero, only older. Hair: thick and still a little tousled like when he was young, now silver-grey. Clean-shaven with soft laugh lines and crow's feet, kind tired eyes, a gentle confident smile. Thin round gold wire-rimmed reading glasses. Outfit: soft cream button shirt with sleeves rolled to the forearm, a dark olive-brown knitted vest, charcoal wool trousers, brown leather shoes. On his LEFT wrist the exact same classic watch from reference 2: gold case, cream dial, brown leather strap. Posture upright and relaxed, only very slightly stooped; healthy and active, not frail, no cane.
Layout exactly like reference 3: landscape sheet on a plain light grey background. Left side: three full-body views (front, three-quarter, side), neutral standing pose, arms relaxed at the sides, feet visible, exactly two arms and two hands each. Right side: a 2x2 grid of head-and-shoulders expression portraits with space around each: top-left happy (warm open smile), top-right soft (tender, moved, gentle smile), bottom-left determined (focused, chin up, a wise little smile), bottom-right worried (brows raised, concerned).
Art style (match the reference exactly): stylized semi-3D animated-film look, soft key light from the upper left, warm palette, soft shadows, clean readable shapes for a small phone screen, eye-level camera. No text, no labels, no logos, no watermark.
```

### K2 Yaşlı Defne kılavuzu

Referanslar: `art/pilot/03-cast/defne-sheet.png` (yüz, düzen), K1 `grandpa-sheet.png` (yaşlandırmanın aynı dozda olması), `art/pilot/03-cast/nevin-sheet.png` (aynı stilde yaşlı bir kadın).

```
Character sheet of the SAME woman from reference 1, now about 70 years old: a warm, graceful grandmother. Keep her identity unmistakable: same face shape, same brown eyes, same light freckles across the nose, same kind smile. Hair: shoulder-length, softly wavy, silver-grey with a few dark-brown strands, tucked behind one ear. Gentle laugh lines, aged to the same degree as the man in reference 2. Outfit echoing her young self: a mustard-yellow knitted cardigan over a cream blouse, dark blue straight trousers, comfortable white sneakers, a small pair of pearl stud earrings. Upright, lively posture.
Layout exactly like reference 1: landscape sheet on a plain light grey background. Left side: three full-body views (front, three-quarter, side), neutral standing pose, arms relaxed, feet visible, exactly two arms and two hands each. Right side: a 2x2 grid of head-and-shoulders expression portraits with space around each: top-left smile, top-right shy (blushing, eyes lowered, small smile), bottom-left surprised, bottom-right laugh (eyes closed, big laugh).
Art style (match the reference exactly): stylized semi-3D animated-film look, soft key light from the upper left, warm palette, soft shadows, clean readable shapes for a small phone screen, eye-level camera. No text, no labels, no logos, no watermark.
```

### K3 Elif kılavuzu (kahramanın kızı, torunun annesi)

Referanslar: `art/pilot/08-outfits/outfit-4-sheet.png` (babası), `art/pilot/03-cast/defne-sheet.png` (annesi, düzen), `art/pilot/01-hero-sheet/A1-semi3d.png`.

```
Character sheet of a NEW character: Elif, about 32 years old, the grown daughter of the man in reference 1 and the woman in reference 2. She must look like their child: her father's dark tousled hair and eyebrows, her mother's face shape, brown eyes and light freckles. Hair: dark brown, chin-length bob, slightly messy in the same way as her father's hair. Warm, capable, a little restless energy; same style and body proportions as the references. Outfit: a sage-green linen shirt with rolled sleeves tucked into high-waisted cream trousers, tan leather loafers, a thin gold necklace. No watch.
Layout exactly like reference 2: landscape sheet on a plain light grey background. Left side: three full-body views (front, three-quarter, side), neutral standing pose, arms relaxed, feet visible, exactly two arms and two hands each. Right side: a 2x2 grid of head-and-shoulders expression portraits with space around each: top-left smile, top-right teary (eyes shining with happy tears, trembling smile), bottom-left surprised, bottom-right laugh.
Art style (match the reference exactly): stylized semi-3D animated-film look, soft key light from the upper left, warm palette, soft shadows, clean readable shapes for a small phone screen, eye-level camera. No text, no labels, no logos, no watermark.
```

### K4 Ada kılavuzları — yaşlar ayrı sayfalarda

**Kullanıcı düzeltmesi (2026-10-16):** 7 ve 17 yaş aynı kılavuzda bulunmayacak. İki ayrı kılavuz üretildi; her biri yalnızca kendi yaşının üç tam boy görünümünü (ön, dörtte üç, yan) ve dört ifade portresini (smile, determined, surprised, laugh) içerir. İki PNG de 1536×1024.

- **17 yaş:** `art/pilot/16-dynasty/ada-17-sheet.png`; komut: `ada-17-sheet-prompt.txt`. Yüksek dağınık at kuyruğu, çiller, petrol mavisi kot ceket, beyaz tişört, siyah kot, kırmızı ayakkabılar, tek omuzda koyu gri çanta. Altın kasa/krem kadran/kahverengi deri kayışlı Mehmet'in saati yalnızca sol bilekte.
- **7 yaş:** `art/pilot/16-dynasty/ada-7-sheet.png`; komut: `ada-7-sheet-prompt.txt`. Çocuk oranları, iki kısa kuyruk, çiller, sarı tişört, mavi kot tulum, kırmızı ayakkabılar. Saat, takı ve sırt çantası yok.

Mevcut Ada'nın kimliği ve yarı 3D dili korunarak iki sayfa yeniden üretildi. Referanslar: eski birleşik Ada sayfası (kimlik/kıyafet), Elif (aile benzerliği), Defne (sayfa düzeni). Eller yakın planda, yaş ayrımı, kıyafet ve saat sürekliliği görsel olarak kontrol edildi.

Eski `ada-sheet.png` ve komutu ilk tasarım kaydı olarak korunuyor, yeni sahnelerde referans alınmayacak. Bundan sonra 7 yaş için K4b, 17 yaş için K4a kullanılır. Ada'nın başlangıç kahramanı ve konuşma portreleri 17 yaş sayfasından alınır. Runtime dosyalarına bu düzeltmede dokunulmadı.

## 3. Dede sahne pozları (3)

60 yaşından sonra ana sahnede kahramanın yerine dede durur (story §6). Ölçek ve açı mevcut kıyafet pozlarıyla aynı olmalı: ayakta boy en az 1500 px, ayaklar görünür, düz açık gri zemin (#d9d9d9), hafif dörtte üç açı.

| # | Dosya | Poz | Ölçek ve açı referansı |
| --- | --- | --- | --- |
| P1 | `art/pilot/16-dynasty/grandpa-idle.png` | Ayakta, rahat; elleri önde gevşekçe birleşmiş, sıcak gülümseme | `art/pilot/08-outfits/hero-4-idle.png` |
| P2 | `art/pilot/16-dynasty/grandpa-joy.png` | Sevinç: tek kol havada yumruk, gülüyor (gençliğindeki sevinç pozunun aynısı, yaşına uygun biraz daha alçak) | `art/pilot/08-outfits/hero-4-joy.png` |
| P3 | `art/pilot/16-dynasty/grandpa-pet.png` | Hafif eğilmiş (çömelmiyor), yanında oturan Şans'ın başını okşuyor; Şans altın tasmalı | `art/pilot/08-outfits/hero-4-pet.png` + `art/pilot/02-poses/sans-sheet.png` + `art/pilot/05-scene/sans-sit-gold.png` |

Her pozun referansları: K1 `grandpa-sheet.png` + tablodaki referans(lar).

```
The SAME grandfather from reference 1 (same face, silver hair, round gold glasses, cream shirt with rolled sleeves, olive-brown knitted vest, charcoal trousers, brown shoes, gold watch with brown leather strap on the LEFT wrist), {POSE}. Full body, feet visible, eye-level camera, slight three-quarter view, same scale and framing as reference 2. Exactly two arms and two hands. Plain flat light grey background (#d9d9d9), no floor line, no props.
Art style (match the reference exactly): stylized semi-3D animated-film look, soft key light from the upper left, warm palette, soft shadows, clean readable shapes for a small phone screen, eye-level camera. No text, no labels, no logos, no watermark.
```

`{POSE}` yerine:

- P1: `standing upright and relaxed, hands loosely clasped in front of him at belt height, warm proud smile`
- P2: `celebrating: one fist raised in the air above shoulder height, the other arm relaxed, laughing with his eyes crinkled`
- P3 (sona ekle: `Real four-legged dog, quadruped, NOT anthropomorphic.`): `bending forward slightly from the waist with one knee a little bent (not crouching), gently stroking the head of the dog from reference 3, who sits beside him on his right and looks up happily; the dog wears a gold collar, same dog and same scale as references 3 and 4`

## 4. Hikâye kareleri (3)

Kare kuralları (art-brief §3 "Hikâye karesi"): 9:16 dikey, en az 1536×2752 (GPT'nin aracı daha küçük verirse olduğu gibi kalır). Kare tam genişlikte gösterilir, kırpılmaz. **Alt %35'e konuşma balonu biner**: yüzler ve önemli nesneler üst %65'te kalır, alt kısım sakin bir zemin olur. Kayıt yeri `art/pilot/10-life/` (diğer hayat anlarıyla aynı yer).

Metinler henüz yazılmadı. Kareler aşağıdaki duygu ve geri dönüşlere göre kuruldu, metni Claude kareye göre yazacak.

| # | Dosya | An | Ne anlatıyor | Geri dönüş |
| --- | --- | --- | --- | --- |
| S1 | `art/pilot/10-life/life-grandchild.png` | 63 · Torunun doğumu | Hastane odası. Yatakta Elif bebeği tutuyor; dede bebeğe eğilmiş, gözleri dolu; Defne Elif'in omzunda. Komodinde erik reçeli kavanozu ve kır çiçekleri. | Kızının doğum karesinin (`life-birth.png`) aynı ışığı ve aynı kavanozu. Bebeği bu kez kızı tutuyor. |
| S2 | `art/pilot/10-life/life-grandpa.png` | 70 · Dede ve torun | Ara sokaktaki Çiçek Tezgâhı (dedenin ilk işi, Rıza'nın tezgâhı), sabah. 7 yaşındaki Ada çiçekleri kovalara diziyor, dede yanında çömelmiş gösteriyor; Şans izliyor. | Rıza'nın rehber cümlesi ("çiçekleri dizmek"); dede şimdi Rıza'nın yerinde. |
| S3 | `art/pilot/10-life/life-handover.png` | 80 · Devir | Otogar, gün batımı. 17 yaşındaki Ada sırt çantasıyla yeni şehre gidiyor; dede saatini bileğinden çıkarmış, Ada'nın avucuna koyuyor; arkada otobüs, Şans yanlarında. | Önsöz 5. kare (otogar, gün batımı, "Anne, bir gün seni saraylarda yaşatacağım"). Aynı yerden bu kez dede uğurluyor. |

### S1 Torunun doğumu

Referanslar: `art/pilot/10-life/life-birth.png` (oda, ışık, kavanoz, stil), K1 `grandpa-sheet.png`, K2 `defne-old-sheet.png`, K3 `elif-sheet.png`.

```
Create ONE finished 9:16 vertical cinematic story panel for a mobile game: a grandfather meets his first grandchild. Reference 1 is the AUTHORITATIVE room, light and style: the same warm sunlit hospital room with sheer curtains, wooden nightstand with a small vase of wildflowers and the same jar of orange-red plum jam with a plain blank label. Reference 2 AUTHORITATIVE grandfather (silver tousled hair, round gold glasses, cream shirt, olive-brown knitted vest, gold watch with brown leather strap on left wrist). Reference 3 AUTHORITATIVE grandmother (silver-grey wavy hair, freckles, mustard cardigan). Reference 4 AUTHORITATIVE young mother Elif (dark chin-length bob, freckles).
Scene: Elif sits up in the hospital bed on the RIGHT, tired and glowing, holding a newborn swaddled in a cream knitted blanket with a small knitted cap, presenting the baby toward her father. The grandfather on the LEFT leans in close over the baby, one hand on the bed rail, eyes shining with tears, the softest smile of his life. The grandmother stands behind Elif, one hand on her daughter's shoulder, smiling with happy tears. Exactly three adults and one baby; no dog. Realistic separate hands, exactly two arms and two hands per adult, the baby fully supported.
Composition: faces and the baby in the upper two thirds (faces around y=25-35%, baby around y=40%). The BOTTOM 35% is calm and empty: only the soft folds of the bed blanket and floor, no faces, hands or key objects, for a dialogue overlay. Eye-level camera, figures take about half of the canvas height.
A polished frame from a 3D CG animated feature film, NO ink outlines, NO cel shading, NO flat 2D cartoon. Soft dimensional shading, warm golden morning light through the curtains.
Art style (match the reference exactly): stylized semi-3D animated-film look, soft key light from the upper left, warm palette, soft shadows, clean readable shapes for a small phone screen, eye-level camera. No text, no labels, no logos, no watermark.
```

### S2 Dede ve torun

Referanslar: `art/pilot/05-scene/alley-clean.png` (yer ve stil; tezgâh bu sokakta), K1 `grandpa-sheet.png`, K4b `ada-7-sheet.png` (yalnız 7 yaş), `art/pilot/02-poses/sans-sheet.png`.

```
Create ONE finished 9:16 vertical cinematic story panel for a mobile game: a grandfather teaches his little granddaughter her first job. Reference 1 is the place and style: the same narrow city alley, but now clean, bright and cared for in fresh morning light, with potted plants and a tidy wall. Against the left wall stands a small, well-kept wooden flower stand painted in faded green, with zinc buckets full of roses, tulips and daisies, a hand-made wooden awning. No sign, no writing anywhere.
Reference 2 AUTHORITATIVE grandfather (silver tousled hair, round gold glasses, cream shirt with rolled sleeves, olive-brown knitted vest, gold watch with brown leather strap on left wrist). Reference 3 AUTHORITATIVE granddaughter: use ONLY the 7-year-old version (two short pigtails, freckles, yellow t-shirt, denim overalls, red sneakers). Reference 4 the dog.
Scene: the girl stands on her toes at the stand, placing a single red rose carefully into a bucket with both hands, tongue out in concentration. The grandfather kneels on one knee beside her at her height, pointing gently at the bucket and smiling with pride, as if quietly explaining how to arrange the flowers. The dog sits next to them on the right, wearing a gold collar, looking up at the girl with its head tilted. Exactly two people and one dog. Real four-legged dog, quadruped, NOT anthropomorphic. Exactly two arms and two hands per person.
Composition: faces, hands and flowers in the upper two thirds (faces around y=30-40%). The BOTTOM 35% is calm empty clean cobblestone with nothing important, for a dialogue overlay. Eye-level camera at the child's height, figures take about half of the canvas height.
A polished frame from a 3D CG animated feature film, NO ink outlines, NO cel shading, NO flat 2D cartoon. Soft dimensional shading, warm morning sunlight from the upper left.
Art style (match the reference exactly): stylized semi-3D animated-film look, soft key light from the upper left, warm palette, soft shadows, clean readable shapes for a small phone screen, eye-level camera. No text, no labels, no logos, no watermark.
```

### S3 Devir

Referanslar: `art/pilot/04-prologue/prologue-5-bus.png` (önsöz 5. kare: yer, gün batımı; çizim stili değil, önsözün stili henüz 2D), K1 `grandpa-sheet.png`, K4a `ada-17-sheet.png` (yalnız 17 yaş), `art/pilot/02-poses/sans-sheet.png`, `art/pilot/10-life/life-birth.png` (yarı 3D stil).

```
Create ONE finished 9:16 vertical cinematic story panel for a mobile game: an old man sends his granddaughter off to build her own life, at the same bus station where, sixty years ago, he said goodbye to his mother. Reference 1 gives ONLY the place, sunset light and mood (NOT its drawing style; render it in the semi-3D style of reference 5): the same bus station platform at golden sunset; a modern intercity coach waits behind them with its door open (no logo, no writing, no destination sign).
Reference 2 AUTHORITATIVE grandfather, about 80 (silver tousled hair, round gold glasses, cream shirt, olive-brown knitted vest, charcoal trousers). Reference 3 AUTHORITATIVE granddaughter: use ONLY the 17-year-old version (high messy ponytail, freckles, teal denim jacket, white t-shirt, black jeans, red sneakers, dark-grey backpack on one shoulder), here with a small worn suitcase standing beside her.
Scene: they face each other in profile-three-quarter view, grandfather LEFT, granddaughter RIGHT. He holds her right hand open, palm up, in his left hand, and with his right hand lays his classic gold watch with cream dial and brown leather strap into her palm; his left wrist is now bare. She looks down at the watch, surprised and moved, about to cry and smile at once. He smiles at her, proud and calm. The dog, wearing a gold collar, sits between them at their feet looking up at the girl. Exactly two people and one dog. Real four-legged dog, quadruped, NOT anthropomorphic. Exactly two arms and two hands per person; the watch clearly visible and readable as the same watch.
Composition: faces, hands and watch in the upper two thirds (faces around y=25-32%, the watch and hands around y=42%). The BOTTOM 35% is calm empty platform pavement with long sunset shadows and nothing important, for a dialogue overlay. Eye-level camera, figures take about half of the canvas height.
A polished frame from a 3D CG animated feature film, NO ink outlines, NO cel shading, NO flat 2D cartoon. Soft dimensional shading, warm golden backlight with long shadows.
Art style (match the reference exactly): stylized semi-3D animated-film look, soft key light from the upper left, warm palette, soft shadows, clean readable shapes for a small phone screen, eye-level camera. No text, no labels, no logos, no watermark.
```

## 5. Yadigâr ikonları (4)

Aile sekmesindeki renkli ikon kutularının yerine gelecek ikonlar. Mevcut ikon setiyle aynı kalıpta üretilir: komut kalıbı `art/pilot/12-icons/*-prompt.txt` ile aynı, referans görsel yok, kare tuval, gerçek şeffaf zemin, 56 px'te okunur. **Aile albümü yadigârı mevcut `art/pilot/12-icons/family-album.png` ikonunu kullanır**, yeniden üretilmez.

| # | Dosya | Yadigâr |
| --- | --- | --- |
| I1 | `art/pilot/12-icons/heirloom-watch.png` | Mehmet'in saati |
| I2 | `art/pilot/12-icons/heirloom-jam.png` | Annenin erik reçeli |
| I3 | `art/pilot/12-icons/heirloom-notebook.png` | Rıza Amca'nın defteri |
| I4 | `art/pilot/12-icons/heirloom-collar.png` | Şans'ın tasması |

Ortak baş (her ikonun başına aynen):

```
Generate from scratch ONE completely ORIGINAL polished 3D CG mobile idle-game ICON for Prestige Life Idle Tycoon v2. NO reference image, no copying/reusing earlier asset composition or objects. Independently design this specific subject. Soft dimensional animated-feature prop aesthetic, tactile materials, rounded clear shapes, neutral warm upper-left studio light, restrained highlights, NO ink outlines, NO cel shading, no hyperreal photograph. Prioritize clean silhouette and meaning at 32–64px; limit small details. Square canvas, whole silhouette fully inside with 10% clear margin. TRUE transparent alpha background, no ground plane, baked shadow, glow/vignette, badge frame, text, letters, numbers, watermarks or collage. One finished icon only. Subject:
```

Konular (başın sonuna eklenir):

- I1: `A classic vintage wristwatch lying at a slight angle: warm gold round case, cream dial with simple gold stick hands (no numerals), worn brown leather strap curling softly around it, one tiny gleam on the glass. Feels old, loved and passed down. No chain, no pocket watch, no money, no crown.`
- I2: `A plump glass jar of deep red-purple plum jam, gingham cloth cap in red and cream tied with twine, one small fresh dark plum with a green leaf leaning at its base. Homemade and warm. Plain jar with no label text.`
- I3: `A small thick worn notebook with a weathered tan leather cover and elastic band, a short carpenter's pencil tucked under the band, one pressed red rose petal peeking out from the pages. Old craftsman's notebook, no writing visible.`
- I4: `A dog collar laid in a soft loop: worn brown leather band with a small round gold tag shaped plainly with a tiny paw imprint, and an old frayed piece of rope tied around it as a keepsake. Readable as "a beloved dog's collar". No dog, no letters on the tag.`

## 6. Oyuna bağlama (Claude)

Görseller geldikten sonra Claude'un yapacakları:

| Kaynak | Oyunda | İş |
| --- | --- | --- |
| K1–K3 ve K4a portreleri | `public/assets/story/portraits/{grandpa,defne-old,elif,ada}-<ifade>.webp` | Kılavuzlardan yuvarlak kesim (Defne'ninki gibi) |
| P1–P3 | `public/assets/scene/hero-grandpa-{idle,joy,pet-sans}.webp` | `scripts/cutout.sh` ile kesim; 60 yaştan sonra sahnede kıyafet pozunun yerine geçer, `stages.ts` |
| S1–S3 | `public/assets/story/life/{grandchild,grandpa,handover}.webp` | 1080 px webp; `ui/story/lifeScript.ts`, metinler `moments.*` (TR + EN) |
| I1–I4 + `family-album.png` | `public/assets/icons/v2/heirloom-*.webp` | Kesim kontrolü, 256 px webp; `ui/family/FamilyScreen.tsx` renkli kutuların yerine |

Kod hazır (2026-10-16), görseller gelince yalnızca bekleme listelerinden çıkarılır: portreler `ui/story/ceremonyScript.ts` `PORTRAITS_TO_COME` (o zamana kadar konuşan yalnızca adıyla, dede smokinli kahramanın yüzüyle), kareler `ui/story/lifeScript.ts` `PANELS_TO_COME`, dede pozları `ui/scene/stages.ts` `GRANDPA_ART` (şimdilik `null`; 60 yaştan sonra 1. nesilde kullanılır).

Ayrıca: story §8 tablosu ve art-brief §5 güncellenir, `npm run backup`.
