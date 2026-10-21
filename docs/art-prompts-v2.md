# Hazır görsel komutları v2

Son güncelleme: 2026-10-22 · Kurallar ve boyutlar: [art-brief-v2.md §2–3](./art-brief-v2.md) · Stil kılavuzu: [story-v2.md §8](./story-v2.md)

Her komut GPT'ye olduğu gibi yapıştırılır; stil paragrafı içinde. Üretilen görsel komuttaki dosya adıyla konur (yanına `-prompt.txt`); denemeler `-v1`, `-v2`, seçilmeyenler silinir. Bu belgede yalnızca **üretilmeyi ya da seçilmeyi bekleyen** işler durur; bitenler arşive taşınır.

**Arşiv:** 1. neslin bütün komutları [archive/art-prompts-v2-gen1.md](./archive/art-prompts-v2-gen1.md), işletme aşamaları [archive/art-prompts-businesses.md](./archive/art-prompts-businesses.md), meslek ikonları [archive/art-prompts-jobs.md](./archive/art-prompts-jobs.md), devir [archive/art-prompts-dynasty.md](./archive/art-prompts-dynasty.md), para serisi [archive/art-prompts-money.md](./archive/art-prompts-money.md). 2. nesil: [Lumen](./art-prompts-lumen.md), [Ada](./art-prompts-ada.md) (yayından sonra).

## 1. Uygulama ikonu ve özellik grafiği (adaylar üretildi, seçim kullanıcıda)

Komutları her adayın yanında `-prompt.txt`; küçük boy karşılaştırması `art/pilot/reviews/store-icons-small-preview.png`.

- **İkon:** A "Yolculuk" (`art/store-v2/icon-a-ride.png`, kahraman ve Şans süper arabada; Claude'un önerisi, hikâyeyi taşıyor), B "Şans'ın altını" (`icon-b-lucky.png`, tek özne, 48 px'te en hızlı okunan), C "Dönüşüm" (`icon-c-transformation.png`). Şimdiki ikon hâlâ `icon-1024.png` (2026-10-09). Seçilen `icon-1024.png` / `icon-512.png` olur, eskisi `eski-2026-10-09/`'a; `node scripts/android-art.mjs` Android ikonlarını ve açılışı yeniden üretir. Adaptive icon maskesinde saç ve kulak ortadaki %70 daireye sığmayabilir; seçimden sonra kontrol edilir.
- **Özellik grafiği:** C "Sokaktan dönüşüm" (`feature-c-street-transformation.png`), D "İki kapı" (`feature-d-two-doorways.png`), 1024×500 kırpımları yanında. Seçilen `feature.mjs`'in arka planı olur, başlık ve slogan TR/EN üstüne konur (yazı görsele çizdirilmez).
