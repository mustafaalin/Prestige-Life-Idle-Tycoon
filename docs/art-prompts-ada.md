# Görsel Komutları: Ada (2. neslin kahramanı)

2026-10-17 · Hikâye: [story-v2.md §6](./story-v2.md) · Genel kurallar: [art-brief-v2.md](./art-brief-v2.md) · İlk kahramanın aynı işi: [archive/art-prompts-v2-gen1.md §4, §5, §9](./archive/art-prompts-v2-gen1.md) · Ada'nın kılavuzu: [art-prompts-dynasty.md K4a](./art-prompts-dynasty.md)

Bu belge GPT'ye verilir. Lumen'de (çift nesiller) sahnede hâlâ ilk kahraman duruyor; bu set onun yerine Ada'yı koyar. İlk kahramanın yedi kıyafet basamağının aynısı: her basamakta kılavuz, üç sahne pozu (bekleme, sevinç, Şans'ı okşama) ve dört ifade portresi.

| Ne | Adet |
| --- | --- |
| Kıyafet kılavuzu (1. kıyafetin kılavuzu hazır: `ada-17-sheet.png`) | 6 |
| Sahne pozu (7 × 3) | 21 |
| İfade portresi (7 × 4) | 28 |
| **Toplam** | **55** |

## 0. Çalışma kuralları

1. **Sıra:** kıyafet 1'in pozları ve portreleri önce (kılavuzu hazır, oyuncu ilk onu görür). Sonra 2 → 7. Her kıyafette önce kılavuz; **kullanıcı onaylamadan o kıyafetin pozlarına geçilmez** (yüz ve kıyafet tutarlılığı).
2. Komutlar şablondur: `{...}` yerleri aşağıdaki kıyafet tablosundaki metinle **aynen** doldurulur, geri kalan kelimesi kelimesine kalır.
3. Her komutta yazan referansların hepsi eklenir (tek referansla stil 2D'ye kayıyor).
4. Kayıt: `art/pilot/18-ada/` altına PNG, yanına aynı adla `-prompt.txt` (doldurulmuş hâli). Denemeler `-v1`, `-v2`; seçilen tablodaki adı alır.
5. Eller tam çözünürlükte kontrol edilir: iki kol, iki el, beşer parmak. Bozuksa düzeltilmez, sade pozla yeniden üretilir. Yazı, logo yok.
6. `art/` git'te değil. Bitince `npm run backup`.

## 1. Ada'nın değişmeyenleri

- **Yüz:** `ada-17-sheet.png`'deki kız: kahverengi gözler, burnunda hafif çiller, kalın kaşlar, koyu kahve saç, alında dağınık kâkül. Annesi Elif'e ve dedesine benzer.
- **Yaş görünümü:** kıyafet 1–2'de 17–18; 3'te 19–20; 4'ten sonra yirmili yaşların ortası ve orada kalır (ilk kahraman gibi yaşlanmaz).
- **Saç:** 1–2'de yüksek dağınık at kuyruğu; 3'ten sonra daha derli toplu (alçak at kuyruğu ya da topuz), kâkül hep biraz dağınık.
- **Dedenin saati her kıyafette sol bilekte:** altın yuvarlak kasa, krem kadran, kahverengi deri kayış, bileğine biraz bol (erkek saati). Metal kordon değil, başka saat yok.
- **Rengi petrol mavisi (teal):** ilk kot ceketten gelir; her kıyafette küçük bir petrol mavisi ayrıntı kalır.
- **Şans:** aynı köpek (`sans-sheet.png`), tasması basamağa göre (tabloda).

## 2. Kıyafetler

| # | Sınıf (ilk kahramandaki karşılığı) | Kıyafet (TR / EN) | `{OUTFIT}`: komuta giren tarif | `{AGE}` | `{IDLE_POSE}` | Okşamada tasma `{COLLAR}` | `{HERO_REF}` (ölçek ve açı) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Başlangıç (kapüşonlu) | Kot Ceket / Denim Jacket | a faded TEAL denim jacket over a plain WHITE t-shirt, BLACK jeans, worn RED canvas sneakers and a small DARK-GREY backpack on ONE shoulder | 17 | one hand holding the backpack strap at her shoulder, the other arm relaxed at her side, weight on one leg, an eager hopeful smile | a plain brown ROPE collar | `art/pilot/08-outfits/hero-2-idle.png` |
| 2 | İşçi (iş kıyafeti) | Tezgâh Önlüğü / Florist Apron | an olive-green canvas work apron with one front pocket over a rust-orange long-sleeve t-shirt with the sleeves pushed up, BLACK jeans and the same worn RED canvas sneakers; a pair of small garden shears tucked in the apron pocket | 18 | both hands resting in the apron's front pocket area (fingers simple and readable), standing proud, a confident grin | a plain brown ROPE collar | `art/pilot/08-outfits/hero-2-idle.png` |
| 3 | Orta Sınıf (şık günlük) | Şık Günlük / Smart Casual | a relaxed sage-green blazer worn open over a white crew-neck t-shirt, light-blue wide-leg jeans, clean white leather sneakers, a thin TEAL hair tie | 20 | one hand in her trouser pocket (thumb outside), the other arm loose at her side, an easy closed-mouth smile | a brown LEATHER collar with a small round brass tag | `art/pilot/08-outfits/hero-3-idle.png` |
| 4 | Milyoner (deve tüyü palto) | Trençkot / Trench Coat | a long sand-beige belted trench coat worn open, a black fine-knit turtleneck, slim charcoal trousers, black leather ankle boots, a small TEAL silk scarf knotted at the neck | mid twenties | both hands in the coat pockets, turning her head slightly to the side, enjoying a bright cold day | a brown LEATHER collar with a small round brass tag | `art/pilot/08-outfits/hero-5-idle.png` |
| 5 | Takım elbise | Takım Elbise / Tailored Pantsuit | a tailored navy pantsuit (single-button jacket, straight trousers), a white silk blouse with an open collar, polished tan leather loafers, small gold stud earrings | mid twenties | buttoning her jacket with both hands in front of her waist, sure of herself, a calm smile | a polished GOLD collar with a small round gold tag | `art/pilot/08-outfits/hero-4-idle.png` |
| 6 | Multimilyarder (üç parçalı) | Üç Parçalı Takım / Three-Piece Suit | a tailored charcoal-grey three-piece trouser suit (jacket worn open over the buttoned matching waistcoat), a light-blue silk shirt, a deep TEAL silk neck scarf tied loosely, dark brown leather loafers | mid twenties | her RIGHT hand adjusting the cuff at her LEFT wrist next to the watch, glancing down at it with a satisfied closed-mouth smile | a polished GOLD collar with a small round gold tag | `art/pilot/08-outfits/hero-6-idle.png` |
| 7 | En Zengin (smokin) | Smokin / Tuxedo | a classic black tuxedo trouser suit with satin peak lapels, a crisp white shirt, a slim black silk bow tie, black satin-striped trousers, polished black patent loafers, a small TEAL pocket square | mid twenties | both hands loosely clasped in front of her at hip height, a calm warm smile: at the top, still the flower-stand girl | a polished GOLD collar with a small round gold tag | `art/pilot/08-outfits/hero-7-idle.png` |

Dosya adları: kılavuz `ada-{N}-sheet.png`, pozlar `ada-{N}-idle.png`, `ada-{N}-joy.png`, `ada-{N}-pet.png`, portreler `ada-{N}-{worried,soft,determined,happy}.png` (N = 1–7). Kıyafet 1'in kılavuzu `art/pilot/16-dynasty/ada-17-sheet.png`, yeniden üretilmez.

**Kontrol et (her görsel):** `ada-17-sheet.png`'deki kız mı (çiller, kaşlar, kâkül), saat sol bilekte ve tarifteki gibi mi, kıyafet kılavuzla aynı mı, iki kol iki el beşer parmak, ayakkabı tabanları aynı yatay çizgide, zeminde gölge yok, yazı yok. Boy ve ölçek ilk kahramanın aynı pozuna yakın mı (Ada biraz daha kısa; aynı kamera).

## 3. Şablonlar

Her şablonun sonuna stil paragrafı aynen eklenir:

> Art style (match the reference exactly): stylized semi-3D animated-film look, soft key light from the upper left, warm palette, soft shadows, clean readable shapes for a small phone screen, eye-level camera. No text, no labels, no logos, no watermark.

### A. Kılavuz (kıyafet 2–7) → `art/pilot/18-ada/ada-{N}-sheet.png`

```
Create a landscape character outfit turnaround sheet, 2400 × 1800 pixels. References from the project: (1) `art/pilot/16-dynasty/ada-17-sheet.png` — AUTHORITATIVE identity and rendering: the same girl, same face, brown eyes, light freckles across the nose, thick eyebrows, loose dark fringe, dark brown hair; (2) `art/pilot/16-dynasty/elif-sheet.png` — her mother, for adult female body proportions in this style; (3) `art/pilot/08-outfits/outfit-4-sheet.png` — the sheet layout and the softly illustrated semi-3D treatment. Depict the SAME young woman, age {AGE}. Hair: {HAIR}. Show only TWO full-body views side by side at equal scale: a straight front view on the left and a true side profile on the right, both standing neutrally with arms relaxed down, ample space between them, heads and shoes fully visible with margins. Each view has exactly two arms and two hands with five correct fingers; the far arm in profile is naturally hidden. No portraits, no other figures. Identical outfit in both views: {OUTFIT}. On her LEFT wrist the inherited man's classic watch: gold round case, cream dial, brown leather strap, slightly loose on her wrist; no metal bracelet, no other watch. Uniform flat light grey background (#d9d9d9), no scenery, only a minimal soft contact shadow under the shoes. Broad smooth tonal shapes, simplified matte materials, rounded volume, hair as simple sculpted colour masses; no fabric weave, no skin pores, no strong specular highlights. NO ink outlines, NO cel shading, NO flat 2D cartoon. Save the image as `art/pilot/18-ada/ada-{N}-sheet.png`.
```

`{HAIR}`: kıyafet 2 için `the same high messy ponytail`; 3–7 için `a neat low ponytail, the fringe still a little loose`.

### B. Bekleme (`idle`) → `art/pilot/18-ada/ada-{N}-idle.png`

```
Create a game character sprite. References from the project: (1) `art/pilot/16-dynasty/ada-17-sheet.png` — the PRIMARY facial identity and style authority; (2) `{SHEET}` — the approved outfit: reproduce it exactly ({OUTFIT}; the gold watch with cream dial and brown leather strap on her LEFT wrist); (3) `{HERO_REF}` — the earlier hero of this game in the same slot: match its camera, slight three-quarter angle, rendering, scale and the way the figure stands on the ground; do NOT copy his face, clothes or pose. The SAME young woman, age {AGE}. Pose: {IDLE_POSE}. Full body, exactly two arms and two hands, five correct fingers on every visible hand. Both shoes entirely visible including the soles, both planted flat on EXACTLY the same horizontal baseline, feet not overlapping. Generous margin around the head and the shoes. Broad smooth tonal shapes, simplified matte materials, rounded volume, hair as simple sculpted colour masses; no fabric weave, no skin pores, no strong specular highlights. NO ink outlines, NO cel shading, NO flat 2D cartoon. Background: absolutely uniform solid #d9d9d9, a flat unlit compositing plate, not a studio floor: NO cast shadow, NO ground shadow, NO contact shadow, NO darkening under or around the shoes, no texture, no gradient; the silhouette meets pure #d9d9d9 at every ground contact. "Soft shadows" in the style line below means only the shading inside the figure. Tall 1:2 canvas, highest resolution available, the figure at least 1500 pixels from head to sole. Only ONE figure. Save the image as `art/pilot/18-ada/ada-{N}-idle.png`.
```

`{SHEET}`: kıyafet 1 için `art/pilot/16-dynasty/ada-17-sheet.png`, diğerleri `art/pilot/18-ada/ada-{N}-sheet.png`.

### C. Sevinç (`joy`) → `art/pilot/18-ada/ada-{N}-joy.png`

B ile aynı komut; yalnız şu üç değişiklik:
- Referans (3)'te `{HERO_REF}` yerine aynı dosyanın `-joy` hâli (ör. `hero-2-joy.png`) ve `match its camera…` yerine `match its action, camera…`.
- `Pose: …` cümlesi yerine: `Pose: standing upright, laughing happily with relaxed eyebrows; ONE arm raised with a simple clenched celebratory fist above her head, the OTHER arm down at her side with a relaxed open hand; feet shoulder-width apart, no jumping, no tiptoe. The whole body and the raised fist are inside the frame.`
- Kayıt adı `ada-{N}-joy.png`.

### D. Şans'ı okşama (`pet`) → `art/pilot/18-ada/ada-{N}-pet.png`

```
Create a game sprite of a young woman petting her dog. References from the project: (1) `art/pilot/16-dynasty/ada-17-sheet.png` — the PRIMARY facial identity and style authority; (2) `{SHEET}` — the approved outfit: reproduce it exactly ({OUTFIT}; the gold watch with cream dial and brown leather strap on her LEFT wrist); (3) `{HERO_PET_REF}` — the earlier hero and the same dog in the game: match its composition, action, camera, rendering and the size of the dog next to the person; do NOT copy his face or clothes; (4) `art/pilot/02-poses/sans-sheet.png` — the dog: the SAME scruffy sandy mixed-breed dog with one bent ear. The SAME young woman, age {AGE}, crouching low on both feet beside the dog, ONE hand gently on top of the dog's head, the OTHER hand resting on her own knee; a warm, friendly smile, relaxed eyebrows, looking at the dog. The dog sits on her left as we see it, happy, tongue out, tail on the ground; a real four-legged dog, quadruped, NOT anthropomorphic, wearing {COLLAR}. Exactly two arms and two hands on the woman, five correct fingers on every visible hand. Both shoes fully visible and flat on EXACTLY the same horizontal baseline as the dog's paws, no kneeling, no lifted heel. Broad smooth tonal shapes, simplified matte materials, rounded volume, hair as simple sculpted colour masses; no fabric weave, no skin pores, no strong specular highlights. NO ink outlines, NO cel shading, NO flat 2D cartoon. Background: absolutely uniform solid #d9d9d9, a flat unlit compositing plate, not a studio floor: NO cast shadow, NO ground shadow, NO contact shadow, NO darkening under or around the shoes, no texture, no gradient; the silhouette meets pure #d9d9d9 at every ground contact. "Soft shadows" in the style line below means only the shading inside the figures. Landscape 4:3 canvas, highest resolution available, both figures entirely inside the frame with margins. Only ONE woman and ONE dog. Save the image as `art/pilot/18-ada/ada-{N}-pet.png`.
```

`{HERO_PET_REF}`: `{HERO_REF}` dosyasının `-pet` hâli (ör. `hero-2-pet.png`); kıyafet 1–2 için `hero-2-pet.png`.

### E. Dört portre → `art/pilot/18-ada/ada-{N}-{worried,soft,determined,happy}.png`

```
Create FOUR separate square images, 1024 × 1024 each, one at a time: four close-up expression portraits of the same young woman, for round dialogue avatars in a mobile game. References from the project: (1) `art/pilot/16-dynasty/ada-17-sheet.png` — AUTHORITATIVE identity: the same face, brown eyes, light freckles, thick eyebrows, loose dark fringe, skin tone, nose and ears; (2) `{SHEET}` — AUTHORITATIVE clothes and hair: {OUTFIT} (only the collar, the shoulders and the top of the clothes are in frame); (3) `public/assets/story/portraits/hero-suit-worried.webp`, `hero-suit-soft.webp`, `hero-suit-determined.webp`, `hero-suit-happy.webp` — the earlier hero's portraits: match their framing, head size, camera, background and rendering style exactly, and match each expression one to one; do NOT copy his face. She looks age {AGE}. Every image: head and shoulders only, straight front view, eyes to the camera, the face centred and large (the frame runs from just inside the top of the hair to the collar, shoulders cut by the left and right edges; a ponytail may be cut by the edge), nothing important in the corners because the image is cropped to a circle; plain flat light grey background (#d9d9d9), no vignette, no props, no hands in frame. Only the expression changes between the four images; the face, the hair and the clothes stay identical. Image 1 `ada-{N}-worried.png`: worried, eyebrows raised and drawn together, eyes wide, mouth slightly open and turned down. Image 2 `ada-{N}-soft.png`: soft and touched, relaxed raised brows, a small closed-mouth smile, warm eyes. Image 3 `ada-{N}-determined.png`: determined, lowered brows, steady gaze, lips pressed together, no anger. Image 4 `ada-{N}-happy.png`: happy, a wide open smile showing the upper teeth, raised brows, bright eyes. Save them under `art/pilot/18-ada/` with exactly those four file names.
```

İfadeler bilerek ilk kahramanınkilerle aynı adda (worried, soft, determined, happy): törenlerde "kahraman" konuşmacısı nesle göre Ada'nın portresine geçer, satırlar değişmez.

## 4. Oyuna bağlama (Claude)

- Kesim `scripts/cutout.sh`; sahne `public/assets/scene/ada-{N}-{idle,joy,pet-sans}.webp`, portreler `public/assets/story/portraits/ada-{N}-<ifade>.webp`.
- `stages.ts`: `HERO_ART`'ın yanına `ADA_ART` (aynı 7 basamak), `heroLook` nesle göre seçer (`cityOf(generation) === 'lumen'`); 3. nesil ilk kahramanın setine döner (story §6).
- Kıyafet adları şehir katmanında (`runtime/city.ts`) Ada'nınkiler olur; kimlikler ve fiyatlar aynı, kayıt değişmez.
- `HERO_PORTRAITS` nesle göre; okşama pozunda fular ve tasma sorunu ilk kahramandakiyle aynı ([discussion-notes.md §1](./discussion-notes.md)).

## 5. Bu belgede olmayanlar (sonra)

- Ada'nın tören kareleri: 2. neslin tören metinleri yazılınca.
- Burak'ın anahtar karesi (B4): Ada'nın son kıyafeti onaylanınca ([art-prompts-burak.md](./art-prompts-burak.md)).
- Yaşlı Ada (3. neslin büyükannesi) ve 3. nesilden itibaren Lojistik Deposu'nun yeni yöneticisi.
