# Hazır görsel komutları v2

Son güncelleme: 2026-10-21 · Kurallar ve boyutlar: [art-brief-v2.md §2–3](./art-brief-v2.md) · Stil kılavuzu: [story-v2.md §8](./story-v2.md)

Her komut GPT'ye olduğu gibi yapıştırılır; stil paragrafı içinde. Üretilen görsel komuttaki dosya adıyla konur (yanına `-prompt.txt`); denemeler `-v1`, `-v2`, seçilmeyenler silinir. Bu belgede yalnızca **üretilmeyi ya da seçilmeyi bekleyen** işler durur; bitenler arşive taşınır.

**Arşiv:** 1. neslin bütün komutları [archive/art-prompts-v2-gen1.md](./archive/art-prompts-v2-gen1.md), işletme aşamaları [archive/art-prompts-businesses.md](./archive/art-prompts-businesses.md), meslek ikonları [archive/art-prompts-jobs.md](./archive/art-prompts-jobs.md), devir [archive/art-prompts-dynasty.md](./archive/art-prompts-dynasty.md). 2. nesil: [Lumen](./art-prompts-lumen.md), [Ada](./art-prompts-ada.md) (yayından sonra).

## 1. Uygulama ikonu ve özellik grafiği (adaylar üretildi, seçim kullanıcıda)

Komutları her adayın yanında `-prompt.txt`; küçük boy karşılaştırması `art/pilot/reviews/store-icons-small-preview.png`.

- **İkon:** A "Yolculuk" (`art/store-v2/icon-a-ride.png`, kahraman ve Şans süper arabada; Claude'un önerisi, hikâyeyi taşıyor), B "Şans'ın altını" (`icon-b-lucky.png`, tek özne, 48 px'te en hızlı okunan), C "Dönüşüm" (`icon-c-transformation.png`). Şimdiki ikon hâlâ `icon-1024.png` (2026-10-09). Seçilen `icon-1024.png` / `icon-512.png` olur, eskisi `eski-2026-10-09/`'a; `node scripts/android-art.mjs` Android ikonlarını ve açılışı yeniden üretir. Adaptive icon maskesinde saç ve kulak ortadaki %70 daireye sığmayabilir; seçimden sonra kontrol edilir.
- **Özellik grafiği:** C "Sokaktan dönüşüm" (`feature-c-street-transformation.png`), D "İki kapı" (`feature-d-two-doorways.png`), 1024×500 kırpımları yanında. Seçilen `feature.mjs`'in arka planı olur, başlık ve slogan TR/EN üstüne konur (yazı görsele çizdirilmez).

## 2. Para serisi: miktara göre altı kademe (karar 2026-10-22)

**Neden:** kullanıcı: para ödülleri her zaman yeşil banknotla verilsin, büyük ödül daha büyük para olarak görünsün; IAP'a para satın alma paketleri de gelecek ve her paketin kendi para görseli olacak. Bugün tek görsel var (Başlangıç Paketi'nin üç destesi, `starter-cash`); büyük ödülde bu görsel üst üste bindiriliyor (geçici, `ui/CashAmount.tsx`). Bu seri onun yerine geçer.

**Nasıl:** her satır GPT'de ayrı bir görsel; hepsinde aynı ortak blok (aşağıda), sonuna tablodaki `{KONU}`. Ek: `art/pilot/15-iap/v2/starter-cash.png` (banknotların ve altın bantların aynısı, aynı ışık; altısı bir aile gibi durmalı).

**Kontrol et:** altısı yan yana konunca boyut sırası tek bakışta okunuyor mu (M1 en küçük, M6 en büyük); 48 px'te bile "para" okunuyor mu; banknotlarda dolar işareti, rakam, yazı yok mu; bozuk para yok mu (kullanıcı: yalnız yeşil banknot); arka plan gerçekten saydam mı?

**Oyuna bağlama (Claude):** webp (M1 96 px, diğerleri 256 px) → `public/assets/icons/v2/money-{1..6}.webp`. Kullanım: uçan para M1 (bugünkü `bill.webp`'nin yerine); ödül kartlarında tutarın yanında ödülün aylık gelire oranına göre M2 (bir aydan az), M3 (altı aya kadar), M4 (iki yıla kadar), M5 (daha fazla); Başlangıç Paketi M3, Rahat Paket M4; IAP para çantaları küçükten büyüğe M2–M6 (`config/iap.ts` CASH_BAGS bu yolları bekliyor; dosya yokken `ui/shop/CashBags.tsx` banknot yığını gösterir). `CashPile` bindirmesi kalkar.

| # | Kayıt | {KONU} |
| --- | --- | --- |
| M1 | `art/pilot/15-iap/v2/money-1.png` | `ONE single loose green banknote, slightly curved as if flying, seen at a gentle angle.` |
| M2 | `art/pilot/15-iap/v2/money-2.png` | `ONE neat bundle of green banknotes held with a narrow gold paper band.` |
| M3 | `art/pilot/15-iap/v2/money-3.png` | `A compact stack of three bundles of green banknotes with narrow gold paper bands, slightly offset.` |
| M4 | `art/pilot/15-iap/v2/money-4.png` | `A big pyramid-shaped stack of about ten bundles of green banknotes with narrow gold paper bands, wider at the bottom.` |
| M5 | `art/pilot/15-iap/v2/money-5.png` | `An open dark brown leather briefcase, lid up, packed full with bundles of green banknotes with gold paper bands, a few bundles stacked on top.` |
| M6 | `art/pilot/15-iap/v2/money-6.png` | `A heavy open steel vault door box overflowing with bundles of green banknotes with gold paper bands, bundles spilling out in front of it.` |

Ortak blok (her komutun başı aynen):

> ONE separate production icon for Prestige Life Idle Tycoon, part of a family of six money icons that grow in size from a single banknote to a vault; the reference image shows the exact banknotes and gold paper bands to use. Green banknotes only: NO coins, NO dollar sign, NO numbers, NO text or markings on the notes (plain blank centers). Slight three-quarter view, the same camera for the whole family. Style: match the existing game's warm soft illustrated semi-3D icon family exactly, rounded simple shapes, soft upper-left key light, restrained highlights, clean silhouette readable at 48 CSS pixels. No hyperreal textures, no ink outline. Actual transparent background with real alpha, NO checkerboard, NO solid backdrop, NO ground or cast shadow. Center the object in a square canvas, at least 12 percent fully transparent padding on ALL sides, nothing clipped. No labels, prices, typography, logos, people, animals or extra objects. Target 1024x1024 PNG. Subject: {KONU}

