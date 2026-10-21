# Hazır görsel komutları v2

Son güncelleme: 2026-10-22 · Kurallar ve boyutlar: [art-brief-v2.md §2–3](./art-brief-v2.md) · Stil kılavuzu: [story-v2.md §8](./story-v2.md)

Her komut GPT'ye olduğu gibi yapıştırılır; stil paragrafı içinde. Üretilen görsel komuttaki dosya adıyla konur (yanına `-prompt.txt`); denemeler `-v1`, `-v2`, seçilmeyenler silinir. Bu belgede yalnızca **üretilmeyi ya da seçilmeyi bekleyen** işler durur; bitenler arşive taşınır.

**Arşiv:** 1. neslin bütün komutları [archive/art-prompts-v2-gen1.md](./archive/art-prompts-v2-gen1.md), işletme aşamaları [archive/art-prompts-businesses.md](./archive/art-prompts-businesses.md), meslek ikonları [archive/art-prompts-jobs.md](./archive/art-prompts-jobs.md), devir [archive/art-prompts-dynasty.md](./archive/art-prompts-dynasty.md), para serisi [archive/art-prompts-money.md](./archive/art-prompts-money.md). 2. nesil: [Lumen](./art-prompts-lumen.md), [Ada](./art-prompts-ada.md) (yayından sonra).

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
