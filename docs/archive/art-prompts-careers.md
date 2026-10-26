# Meslek ağacının yeni ikonları: GPT komutları

Tarih: 2026-10-21 · İlgili: [career-redesign.md](./career-redesign.md), kurallar [game-design-v2.md §4.4](../game-design-v2.md). Önceki 63 ikonun komutları: [archive/art-prompts-jobs.md](./art-prompts-jobs.md).

Meslek ağacı 104 mesleğe çıktı; **41'inin ikonu yok**. Her ikon tek bir nesne ya da küçük bir nesne grubudur (öncekiler gibi: kasiyerde yazar kasa, garsonda çay tepsisi); insan yok, el yok. Kurslar ikon kullanmıyor (kep simgesi), sekme ikonları kodda; GPT'den yalnız bu 41 meslek ikonu gerekiyor.

## Kurallar

- **Sıra:** önce §1 (2–6. satır, oyuncu ilk saatlerde görür), sonra §2.
- **Kayıt:** `art/pilot/11-careers/{kimlik}.png`, yanına `{kimlik}-prompt.txt`.
- **Ayırt edilmeli:** ağaçta yan yana duran meslekler (Pilot / Kaptan Pilot, Avukat / Kıdemli Avukat / Hukuk Direktörü, Marangoz Çırağı / Marangoz / Usta Marangoz) farklı nesneyle anlatılır. Komutlar eski 63 ikonun nesnelerinden (kule ve anahtar, pusula, kask ve plan, küre, dişliler, megafon, piyonlar) kaçınacak şekilde yazıldı; 48 px'te ayırt edilmeli.
- **Oyuna bağlama (Claude):** 384 px webp → `public/assets/jobs/v2/{kimlik}.webp` (`config/careers.ts` yolu zaten bekliyor), sonra `npm run backup`.

## Ortak blok

Her komutun başı aynen şudur, sonuna tablodaki `Subject:` cümlesi eklenir:

> Generate from scratch ONE completely ORIGINAL polished 3D CG mobile idle-game ICON for Prestige Life Idle Tycoon v2. NO reference image, no copying/reusing earlier asset composition or objects. Soft dimensional animated-feature prop aesthetic, tactile materials, rounded clear shapes, neutral warm upper-left studio light, restrained highlights, NO ink outlines, NO cel shading, no hyperreal photograph. Prioritize clean silhouette and meaning at 32–64px; limit small details. Square canvas, whole silhouette fully inside with 10% clear margin. TRUE transparent alpha background, no ground plane, baked shadow, glow/vignette, badge frame, text, letters, numbers, watermarks or collage. NO people, NO hands. One finished icon only. Subject: {KONU}

## 1. İlk satırlar (12)

| Kimlik | Ad (TR / EN) | {KONU} |
| --- | --- | --- |
| `porter` | Hamal / Porter | `A sturdy wooden hand truck (two-wheel dolly) tilted back, loaded with two stacked brown cardboard boxes tied with a thick rope.` |
| `cleaner` | Temizlik Görevlisi / Cleaner | `A bright blue mop bucket on small wheels with a wringer, a mop standing in it and a green spray bottle beside it.` |
| `warehouse-worker` | Depo İşçisi / Warehouse Worker | `A red manual pallet jack seen three-quarter, its forks under a short stack of three taped cardboard boxes.` |
| `carpenter-apprentice` | Marangoz Çırağı / Carpenter's Apprentice | `A small rough pine plank with curly wood shavings on it, a flat red carpenter's pencil and a folding yellow ruler lying across.` |
| `security-guard` | Güvenlik Görevlisi / Security Guard | `A navy security guard cap with a blank silver shield-shaped badge, a black flashlight and a walkie-talkie radio beside it.` |
| `carpenter` | Marangoz / Carpenter | `A wooden handsaw resting on a sturdy sawhorse with a half-cut plank, a little sawdust below.` |
| `call-center-agent` | Çağrı Merkezi Temsilcisi / Call Center Agent | `A retro-modern mint-green desk telephone with a coiled cord and a row of blank glowing line buttons, a small sticky-note pad beside it.` |
| `senior-security-guard` | Kıdemli Güvenlik Görevlisi / Senior Security Guard | `A compact console with three small security monitors showing simple building corridors in blue, a big ring of keys hanging from its edge.` |
| `master-carpenter` | Usta Marangoz / Master Carpenter | `A beautifully finished honey-colored wooden chair with curved back slats, a steel hand plane resting on its seat.` |
| `furniture-workshop-chief` | Mobilya Atölyesi Şefi / Furniture Workshop Chief | `A miniature cozy wooden workshop facade with a big open double door, a finished walnut cabinet visible inside and wood shavings at the doorstep; a blank wooden sign board above the door.` |
| `paramedic` | Paramedik / Paramedic | `A red emergency medical backpack with reflective silver stripes and a white cross, a compact orange defibrillator with two paddles beside it.` |
| `executive-assistant` | Yönetici Asistanı / Executive Assistant | `An open leather day planner with colorful tab markers, a slim tablet and a sleek desk organizer cup with pens.` |

## 2. Orta ve üst satırlar (29)

| Kimlik | Ad (TR / EN) | {KONU} |
| --- | --- | --- |
| `real-estate-agent` | Emlak Danışmanı / Real Estate Agent | `A cute miniature house model with a brass key on a ring hanging from its chimney, a small blank wooden for-sale sign on a post beside it.` |
| `hr-specialist` | İK Uzmanı / HR Specialist | `A clipboard holding three blank resume cards, each with a plain round avatar circle (no faces) and grey lines, a paperclip on top.` |
| `teacher` | Öğretmen / Teacher | `A small green chalkboard on a wooden easel with simple chalk shapes (a star, a circle, no letters), a red apple and two chalk sticks on its tray.` |
| `food-beverage-manager` | Yiyecek-İçecek Müdürü / Food & Beverage Manager | `A small round silver bar tray with a dark wine bottle without label, two stemmed glasses and a polished cocktail shaker.` |
| `office-manager` | Ofis Müdürü / Office Manager | `A sleek modern desk lamp bending over a neat desk set: a closed laptop, a potted succulent and a small tray of documents.` |
| `lawyer` | Avukat / Lawyer | `Polished brass scales of justice on a dark wooden base, a closed thick leather book with a ribbon bookmark beside it.` |
| `contractor` | Müteahhit / Contractor | `A chunky yellow excavator in three-quarter view with its arm raised and the bucket full of brown soil.` |
| `architect` | Mimar / Architect | `A white architectural scale model of a modern building with curved balconies on a small base, a drafting compass standing beside it.` |
| `specialist-doctor` | Uzman Doktor / Specialist Doctor | `A glowing wall light box with a blue X-ray film of a rib cage clipped to it, a small silver reflex hammer below.` |
| `veterinarian` | Veteriner / Veterinarian | `A light-blue pet carrier with a paw-print shape on its side, a stethoscope draped over the top and a bone-shaped dog treat beside it.` |
| `national-sales-manager` | Ülke Satış Müdürü / National Sales Manager | `A display stand with a large golden bar chart of four rising bars and a small flagpole with a blank teal flag on top.` |
| `hr-manager` | İK Müdürü / HR Manager | `A standing presentation board with an organization chart of connected rounded cards (plain circles, no faces, no text), one gold card at the top.` |
| `senior-lawyer` | Kıdemli Avukat / Senior Lawyer | `A heavy oxblood leather briefcase with brass locks beside a stack of three thick books tied with a red ribbon.` |
| `pilot` | Pilot / Pilot | `A navy pilot's cap with a blank gold wings badge, resting on a pair of aviator sunglasses.` |
| `editor-in-chief` | Yayın Yönetmeni / Editor-in-Chief | `A fanned stack of glossy magazines with blank colorful covers, a gold fountain pen lying on top.` |
| `supply-chain-manager` | Tedarik Zinciri Müdürü / Supply Chain Manager | `A neat stack of three shipping containers in red, blue and teal with a small crane hook and cable hanging above them.` |
| `marketing-manager` | Pazarlama Müdürü / Marketing Manager | `A miniature billboard on two legs showing a bright abstract poster (colored shapes, no text), two small spotlights at its base.` |
| `judge` | Hâkim / Judge | `A dark wooden gavel resting on its round sound block, a folded black judge's robe beside it.` |
| `professor` | Profesör / Professor | `A black graduation cap with a gold tassel on top of a stack of thick academic books, round reading glasses leaning against them.` |
| `captain` | Kaptan Pilot / Captain | `An airplane cockpit control yoke in front of a curved panel of glowing round instrument dials.` |
| `chief-architect` | Başmimar / Chief Architect | `A grand bridge scale model with elegant white arches and thin cables on a dark display base.` |
| `portfolio-manager` | Portföy Yöneticisi / Portfolio Manager | `A tablet showing a colorful pie chart, a neat tower of gold coins beside it.` |
| `legal-director` | Hukuk Direktörü / Legal Director | `A tall dark-wood bookcase of matching burgundy leather volumes with a small golden scale ornament on the top shelf.` |
| `rector` | Rektör / Rector | `A ceremonial golden university mace with a blank crest shape, lying on a burgundy velvet cushion with gold tassels.` |
| `airline-ops-director` | Havayolu Operasyon Direktörü / Airline Operations Director | `A miniature airport control tower with green glass windows, a small white passenger jet parked beside it.` |
| `coo` | Genel Müdür Yardımcısı (COO) / Chief Operating Officer | `A tall golden chess queen standing on the corner of a dark marble chessboard, two silver pawns behind her.` |
| `board-member` | Yönetim Kurulu Üyesi / Board Member | `A miniature long polished boardroom table with dark leather chairs around it and a glass water carafe in the middle.` |
| `fund-founder` | Yatırım Fonu Kurucusu / Investment Fund Founder | `A small golden tree with gold coins as leaves growing from a sleek dark round pot.` |
| `board-chair` | Yönetim Kurulu Başkanı / Chair of the Board | `A grand high-backed chairman's chair in burgundy leather with gold studs and carved dark wood arms.` |
