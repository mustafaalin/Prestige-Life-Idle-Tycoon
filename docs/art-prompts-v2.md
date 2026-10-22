# Hazır görsel komutları v2

Son güncelleme: 2026-10-22 · Kurallar ve boyutlar: [art-brief-v2.md §2–3](./art-brief-v2.md) · Stil kılavuzu: [story-v2.md §8](./story-v2.md)

Her komut GPT'ye olduğu gibi yapıştırılır; stil paragrafı içinde. Üretilen görsel komuttaki dosya adıyla konur (yanına `-prompt.txt`); denemeler `-v1`, `-v2`, seçilmeyenler silinir. Bu belgede yalnızca **üretilmeyi ya da seçilmeyi bekleyen** işler durur; bitenler arşive taşınır.

**Arşiv:** 1. neslin bütün komutları [archive/art-prompts-v2-gen1.md](./archive/art-prompts-v2-gen1.md), işletme aşamaları [archive/art-prompts-businesses.md](./archive/art-prompts-businesses.md), meslek ikonları [archive/art-prompts-jobs.md](./archive/art-prompts-jobs.md), devir [archive/art-prompts-dynasty.md](./archive/art-prompts-dynasty.md), para serisi [archive/art-prompts-money.md](./archive/art-prompts-money.md). 2. nesil: [Lumen](./art-prompts-lumen.md), [Ada](./art-prompts-ada.md) (yayından sonra).

## 0. Dede kareleri: 60 yaştan sonra oynayan hikâye anları (2026-10-23, lansmandan önce)

**Neden:** Milyarder töreni bağlı oyuncuda ~67 yaşta, jet ~70'te gelir; tekne, yat ve helikopter de geç alınabilir. Sahnede kahraman 60'tan sonra dede, ama bu karelerde genç. Her karenin dede sürümü üretilir; kod 60 yaştan sonra (o an oynarken) bunu ve dedenin portresini kullanır (`ui/story/lateLook.ts`, `LATE_READY`'ye anahtar eklenince açılır). Yat karesinde Rıza Amca yok (story-v2 §6: yan karakterler 60'tan sonra görünmez); yerine annenin denizde doğum günü.

Her komut GPT'ye olduğu gibi yapıştırılır, referanslar sırasıyla eklenir. Çıktı `art/pilot/...` altına komuttaki adla (yanına `-prompt.txt`); Claude webp'ye çevirip bağlar (1080 px genişlik).

**Ortak dede tarifi** (her komutta geçiyor; kılavuz `art/pilot/16-dynasty/grandpa-sheet.png`): silver tousled hair, round gold glasses, cream shirt with rolled sleeves, olive-brown knitted vest, dark grey trousers, brown shoes, gold watch with brown leather strap on the LEFT wrist.

### L1 Milyarder töreni → `art/pilot/07-story/c5-restaurant-old.png`

Referanslar: 1 `art/pilot/07-story/c5-restaurant.png` (yer ve yerleşim), 2 `art/pilot/16-dynasty/grandpa-sheet.png`, 3 `art/pilot/03-cast/bulent-sheet.png`.

> Create ONE finished vertical 9:16 cinematic story panel for a mobile game: in a warm restaurant at evening, an elderly man who has just bought the restaurant chain reassures its worried staff and kindly offers his very old former boss a place. Reference 1 is AUTHORITATIVE for the LOCATION and the blocking: the same restaurant with copper pendant lamps, tall dark-wood framed windows with a blue evening city outside, honey-colored wooden tables and chairs, wooden plank floor; keep the same four-person arrangement, but do NOT copy the young man in the navy suit. Reference 2 is AUTHORITATIVE for the HERO, now a grandfather in his late sixties: silver tousled hair, round gold glasses, cream shirt with rolled sleeves, olive-brown knitted vest, dark grey trousers, brown shoes, gold watch with brown leather strap on the LEFT wrist; same kind face as the guide. Reference 3 is the FORMER BOSS, now very old, around ninety: keep his face, thick brows and moustache, but his hair and moustache are now fully white, his face deeply wrinkled, he is slightly stooped and leans on a dark wooden walking cane with his right hand; the same navy three-piece suit now a little loose on him, white shirt, red tie with a gold pattern, white pocket square. Blocking: the grandfather CENTER-RIGHT, calm and warm, one hand open palm-up at waist toward the staff; the old boss CENTER-LEFT facing him, surprised and humbled, eyes wide, mouth slightly open, not angry. Two restaurant employees slightly behind the old boss at LEFT, a young woman and an adult man in white shirts, black waistcoats and black aprons, worried but listening with cautious hope. Exactly FOUR people, no guests, no trays, no handshakes, no papers. Exactly two arms and two hands per person, natural five-finger hands, the cane clearly held by one hand.
>
> CRITICAL mobile framing: all four people entirely in the upper 65% of the image, heads around y=22%, feet around y=62%, figures about 40% of the canvas height. The bottom 35% is empty quiet wooden floor for a dialogue overlay, no furniture and no objects there. Requested size 1536x2752 or larger, vertical 9:16.
>
> A polished frame from a 3D CG animated feature film, NO ink outlines, NO cel shading, NO flat 2D cartoon. Art style (match the reference exactly): stylized semi-3D animated-film look, soft key light from the upper left, warm palette, soft shadows, clean readable shapes for a small phone screen, eye-level camera. No text, no labels, no logos, no watermark.

### L2 Tekne → `art/pilot/10-life/life-boat-old.png`

Referanslar: 1 `art/pilot/10-life/life-boat-luxury-v2.png` (tekne ve göl), 2 `art/pilot/16-dynasty/grandpa-sheet.png`, 3 `art/pilot/03-cast/mom-sheet.png`, 4 `art/pilot/02-poses/sans-sheet.png`.

> Create ONE finished vertical 9:16 cinematic story panel for a mobile game: an elderly man takes his very old mother on her first speedboat ride on a wide blue lake under a bright summer sky, pine-covered hills on the far shore. Reference 1 is AUTHORITATIVE for the BOAT and the LAKE: the same polished wooden speedboat with cream leather seats, chrome-framed windshield, white wake; the same camera, but do NOT copy the young man. Reference 2 is AUTHORITATIVE for the HERO, a grandfather in his sixties: silver tousled hair, round gold glasses, cream shirt with rolled sleeves, olive-brown knitted vest, gold watch with brown leather strap on the LEFT wrist; he wears an orange life vest over his clothes. Reference 3 is his MOTHER, now very old, around ninety: keep her kind face, but her hair is a white bun, her face softly wrinkled; dusty-pink long dress and a light cardigan, an orange life vest. Reference 4 is the dog: a scruffy sandy mixed-breed dog with cropped ears and a gold collar, real four-legged dog, quadruped, NOT anthropomorphic. Scene: the grandfather drives at the wheel on the RIGHT, glancing at his mother with a soft proud smile; the mother sits on the LEFT, one hand on her chest, laughing with surprise and delight, wind in a few loose strands of hair; the dog stands on the back seat between them, tongue out, ears in the wind. Exactly two people and one dog, exactly two arms and two hands per person.
>
> CRITICAL mobile framing: both faces, hands, the wheel and the dog in the upper 60% of the image, faces around y=25–35%. The bottom 35% is calm: the boat's wooden deck and windshield frame only, nothing important there, for a dialogue overlay. Requested size 1536x2752 or larger, vertical 9:16.
>
> A polished frame from a 3D CG animated feature film, NO ink outlines, NO cel shading, NO flat 2D cartoon. Art style (match the reference exactly): stylized semi-3D animated-film look, soft key light from the upper left, warm palette, soft shadows, clean readable shapes for a small phone screen, eye-level camera. No text, no labels, no logos, no watermark.

### L3 Yat: annenin denizde doğum günü → `art/pilot/10-life/life-yacht-old.png`

Referanslar: 1 `art/pilot/10-life/life-yacht.png` (yat ve deniz), 2 `art/pilot/16-dynasty/grandpa-sheet.png`, 3 `art/pilot/03-cast/mom-sheet.png`, 4 `art/pilot/16-dynasty/defne-old-sheet.png`, 5 `art/pilot/02-poses/sans-sheet.png`.

> Create ONE finished vertical 9:16 cinematic story panel for a mobile game: a very old mother's birthday party on the open sea, on the sunny rear deck of a large white yacht, calm turquoise sea and a soft golden late-afternoon sky. Reference 1 is AUTHORITATIVE for the YACHT and the SEA only (white deck, teak floor, rails, soft sofas); do NOT copy its people. Reference 2 is AUTHORITATIVE for the HERO, a grandfather in his sixties: silver tousled hair, round gold glasses, cream shirt with rolled sleeves, olive-brown knitted vest, gold watch with brown leather strap on the LEFT wrist. Reference 3 is his MOTHER, now very old, around ninety: kind face, white hair bun, soft wrinkles, dusty-pink dress and a light cardigan. Reference 4 is AUTHORITATIVE for his WIFE in her sixties (use the guide exactly). Reference 5 is the dog: a scruffy sandy mixed-breed dog with a gold collar, real four-legged dog, quadruped, NOT anthropomorphic. Scene: the mother sits CENTER on a cream deck sofa behind a small round table with a homemade birthday cake with a few lit candles; her eyes are wet and she smiles, both hands together near her chest. The wife sits on her LEFT, leaning in and laughing, shielding the candle flames from the sea breeze with one cupped hand. The grandfather stands on the RIGHT behind the sofa, one hand resting on his mother's shoulder, looking at her with a soft, proud smile. The dog sits on the deck beside the table looking up at the cake. Exactly THREE people and one dog, no other guests, no crew. Exactly two arms and two hands per person.
>
> CRITICAL mobile framing: faces, hands, the cake and the dog in the upper 60% of the image, faces around y=25–35%. The bottom 35% is calm empty teak deck only, for a dialogue overlay. Requested size 1536x2752 or larger, vertical 9:16.
>
> A polished frame from a 3D CG animated feature film, NO ink outlines, NO cel shading, NO flat 2D cartoon. Art style (match the reference exactly): stylized semi-3D animated-film look, soft key light from the upper left, warm palette, soft shadows, clean readable shapes for a small phone screen, eye-level camera. No text, no labels, no logos, no watermark.

### L4 Helikopter → `art/pilot/10-life/life-heli-old.png`

Referanslar: 1 `art/pilot/10-life/life-heli.png` (kabin ve şehir), 2 `art/pilot/16-dynasty/grandpa-sheet.png`, 3 `art/pilot/16-dynasty/defne-old-sheet.png`, 4 `art/pilot/02-poses/sans-sheet.png`.

> Create ONE finished vertical 9:16 cinematic story panel for a mobile game: inside a private helicopter flying over a sunny city, an elderly couple looks down at the old alley where the husband once lived in a tent. Reference 1 is AUTHORITATIVE for the HELICOPTER CABIN, the big curved window and the city far below with narrow old streets and a small green flower stand on one corner; keep the same camera, but do NOT copy its people. Reference 2 is AUTHORITATIVE for the HERO, a grandfather in his sixties: silver tousled hair, round gold glasses, cream shirt with rolled sleeves, olive-brown knitted vest, gold watch with brown leather strap on the LEFT wrist; he wears an aviation headset around his neck. Reference 3 is AUTHORITATIVE for his WIFE in her sixties (use the guide exactly), with a headset on. Reference 4 is the dog: a scruffy sandy mixed-breed dog with a gold collar, real four-legged dog, quadruped, NOT anthropomorphic, wearing small dog ear protectors. Scene: the grandfather sits by the window on the RIGHT, pointing down at the city with a soft, moved smile; the wife beside him on the LEFT, laughing and waving down at someone far below; the dog between them with its front paws on the seat, looking out of the window. Bright, cloudless blue sky. Exactly two people and one dog, no pilot visible. Exactly two arms and two hands per person.
>
> CRITICAL mobile framing: faces, hands, the window view and the dog in the upper 60% of the image, faces around y=25–35%. The bottom 35% is calm: seat cushions and cabin floor only, for a dialogue overlay. Requested size 1536x2752 or larger, vertical 9:16.
>
> A polished frame from a 3D CG animated feature film, NO ink outlines, NO cel shading, NO flat 2D cartoon. Art style (match the reference exactly): stylized semi-3D animated-film look, soft key light from the upper left, warm palette, soft shadows, clean readable shapes for a small phone screen, eye-level camera. No text, no labels, no logos, no watermark.

### L5 Jet → `art/pilot/10-life/life-jet-old.png`

Referanslar: 1 `art/pilot/10-life/life-jet-family.png` (kabin ve yerleşim), 2 `art/pilot/16-dynasty/grandpa-sheet.png`, 3 `art/pilot/16-dynasty/defne-old-sheet.png`, 4 `art/pilot/16-dynasty/elif-sheet.png`, 5 `art/pilot/02-poses/sans-sheet.png`.

> Create ONE finished vertical 9:16 cinematic story panel for a mobile game: a family's first flight on their private jet, warm daylight, cream leather seats, a wooden side table, soft clouds and sun outside the oval windows. Reference 1 is AUTHORITATIVE for the CABIN, the blocking and the very old MOTHER by the window (white hair bun, floral dress, pink cardigan; keep her exactly); do NOT copy the young man in the navy suit or the young woman in the mustard sweater. Reference 2 is AUTHORITATIVE for the HERO, a grandfather in his late sixties: silver tousled hair, round gold glasses, cream shirt with rolled sleeves, olive-brown knitted vest, gold watch with brown leather strap on the LEFT wrist. Reference 3 is AUTHORITATIVE for his WIFE in her sixties (use the guide exactly). Reference 4 is AUTHORITATIVE for their DAUGHTER, a woman around forty (use the guide exactly). Reference 5 is the dog: a scruffy sandy mixed-breed dog with a gold collar, real four-legged dog, quadruped, NOT anthropomorphic. Scene, same as reference 1: the very old mother sits in the window seat on the LEFT, one hand flat against the window, looking out at the clouds with wonder and wet eyes; the wife sits facing her, laughing, holding out an open round tin of homemade cookies; the daughter leans in from the seat behind, looking toward her father; the grandfather stands in the aisle on the RIGHT, one hand on the back of his mother's seat, smiling softly at her; the dog sleeps curled up on the seat beside the mother. Exactly FOUR people and one dog. Exactly two arms and two hands per person.
>
> CRITICAL mobile framing: all four faces, visible hands, the cookie tin and the dog in the upper 64% of the image. The bottom 35% is calm: seat backs and cabin floor only, for a dialogue overlay. Requested size 1536x2752 or larger, vertical 9:16.
>
> A polished frame from a 3D CG animated feature film, NO ink outlines, NO cel shading, NO flat 2D cartoon. Art style (match the reference exactly): stylized semi-3D animated-film look, soft key light from the upper left, warm palette, soft shadows, clean readable shapes for a small phone screen, eye-level camera. No text, no labels, no logos, no watermark.

## 1. Uygulama ikonu ve özellik grafiği

**Durum (2026-10-22):** özellik grafiği tamam. İkon yeniden tasarlanıyor: A, B, C beğenilmedi. Yeni adaylar D ve E (aşağıda); ikisi de üretilip Play Console'daki mağaza girişi deneyiyle (Store listing experiments) karşılaştırılabilir.

Kurallar: 1024×1024 kare, köşeleri yuvarlatılmamış, çerçevesiz, arka plan kenara kadar dolu (Play köşeleri kendisi yuvarlar); önemli her şey ortadaki dairenin içinde (Android adaptive icon maskesi); yazı yok; 48 px'te tek bakışta okunmalı. Referanslar: kahraman kılavuzu `art/pilot/01-hero-sheet/A1-semi3d.png`, E için Şans kılavuzu `art/pilot/02-poses/sans-sheet.png`.

**D "İki yüz" (2026-10-22, kullanıcı: tek bölünmüş yüz yerine aynı adamın iki ayrı başı, yalnız baş ve boyun; üzgün ve kirli ↔ gülen ve altınlı):**

> Mobile game app icon, square 1024x1024, full-bleed background, no rounded corners, no border, no frame. Two separate heads of the SAME man from the reference (same face shape, eyes, nose), shown only as head and neck, no shoulders, no body, no hands. The background is split by one sharp diagonal line from the top-right corner to the bottom-left corner. The POOR head sits in the lower-left half, the RICH head in the upper-right half, both large, close together and slightly turned toward each other, the rich head a little bigger and in front. Both heads stay inside the central circle of the icon. The contrast between them must be extreme and obvious at first glance.
>
> LOWER-LEFT = POOR AND SAD: cold dark blue-grey rainy night background, raindrops; his face dirty and grimy with soot smudges, messy stubble, tired eyes with dark circles, sad eyebrows, mouth turned down; an old, dirty, torn knit beanie with holes and loose threads; a ragged, stained collar of a torn hoodie around the neck.
>
> UPPER-RIGHT = RICH AND HAPPY: bright warm golden background with a sunburst and sparkles, a few green banknotes and gold coins flying; his face perfectly clean and fresh, clean-shaven, neatly styled glossy hair; a big laughing open-mouth smile with shining white teeth; gold-rimmed aviator sunglasses; a small gold stud earring; a thick shiny gold chain necklace around the neck.
>
> Saturated colors, very high contrast between cold-sad and warm-happy, simple bold shapes that read clearly at 48 pixels. Exactly two heads of one man, nothing else.
>
> Art style (match the reference exactly): stylized semi-3D animated-film look, soft key light from the upper left, warm palette, soft shadows, clean readable shapes for a small phone screen, eye-level camera. A frame from a 3D CG animated feature film, NO ink outlines, NO cel shading, NO flat 2D cartoon. No text, no labels, no logos, no watermark.

**E "Şans'ın iki hâli" (yedek; oyunun maskotu):**

> Mobile game app icon, square 1024x1024, full-bleed background, no rounded corners, no border, no frame. One close-up of Lucky the dog from the reference (real four-legged dog, quadruped, NOT anthropomorphic), head and chest, centered and large, filling about 75% of the icon; all key features inside the central circle. The image is split by one clean diagonal line from the top-right to the bottom-left corner. Left/lower side = POOR: cold blue-grey rainy night, raindrops, wet scruffy fur, a frayed rope as a collar. Right/upper side = RICH: bright warm golden glow with a soft sunburst, fluffy clean groomed fur, a shiny gold collar with a gem tag, a few green banknotes and gold coins flying behind. Both halves share ONE continuous happy expression: mouth open, tongue out, bright eyes looking at the viewer. Very high contrast between cold and warm sides, saturated colors, simple shapes readable at 48 pixels. Exactly one dog.
>
> Art style (match the reference exactly): stylized semi-3D animated-film look, soft key light from the upper left, warm palette, soft shadows, clean readable shapes for a small phone screen, eye-level camera. A frame from a 3D CG animated feature film, NO ink outlines, NO cel shading, NO flat 2D cartoon. No text, no labels, no logos, no watermark.

Seçilen `art/store-v2/icon-1024.png` / `icon-512.png` olur, eskisi `eski-2026-10-09/`'a; `node scripts/android-art.mjs` Android ikonlarını ve açılışı yeniden üretir; sonra adaptive maskede (daire) kesilme kontrol edilir.

### Eski adaylar (beğenilmedi, 2026-10-22)

Komutları her adayın yanında `-prompt.txt`; küçük boy karşılaştırması `art/pilot/reviews/store-icons-small-preview.png`.

- **İkon:** A "Yolculuk" (`art/store-v2/icon-a-ride.png`, kahraman ve Şans süper arabada; Claude'un önerisi, hikâyeyi taşıyor), B "Şans'ın altını" (`icon-b-lucky.png`, tek özne, 48 px'te en hızlı okunan), C "Dönüşüm" (`icon-c-transformation.png`). Şimdiki ikon hâlâ `icon-1024.png` (2026-10-09). Seçilen `icon-1024.png` / `icon-512.png` olur, eskisi `eski-2026-10-09/`'a; `node scripts/android-art.mjs` Android ikonlarını ve açılışı yeniden üretir. Adaptive icon maskesinde saç ve kulak ortadaki %70 daireye sığmayabilir; seçimden sonra kontrol edilir.
- **Özellik grafiği:** C "Sokaktan dönüşüm" (`feature-c-street-transformation.png`), D "İki kapı" (`feature-d-two-doorways.png`), 1024×500 kırpımları yanında. Seçilen `feature.mjs`'in arka planı olur, başlık ve slogan TR/EN üstüne konur (yazı görsele çizdirilmez).
