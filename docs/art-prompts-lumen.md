# Lumen görselleri (2. nesil)

Son güncelleme: 2026-10-17 · İlgili: [story-v2.md §6](./story-v2.md), [game-design-v2.md](./game-design-v2.md) (2. nesil: 10 işletme, 10 yönetici, 12 ev, 12 araç, 4 lüks), [art-brief-v2.md §2–3](./art-brief-v2.md) (genel kurallar, ekran haritası), [art-prompts-v2.md](./art-prompts-v2.md) (1. neslin aynı türdeki komutları), [discussion-notes.md §3](./discussion-notes.md)

Bu belge GPT'ye (VS Code'da) verilir. 2. neslin şehri Lumen'in **46 görselinin** (yönetici 10, ev 11, işletme 9, araç 12, lüks 4) sırasını, referanslarını, kayıt yerini ve doğrudan yapıştırılacak İngilizce komutlarını içerir. Oyuna bağlama (kesim, webp, kod) Claude'un işidir (§7).

**Durum (2026-10-21): yayından sonra (2. nesil).** Lansmanda Lumen görünmez. Ekonominin yeniden kurulmasından sonra eksikler: dört yeni işletme (Restoran, Emlak Ofisi, İnşaat, Medya) ve yöneticileri, her işletmenin 2. ve 3. görünümü (Lumen'de şimdilik tek görünüm, yeni dört işletme eski şehrinkini gösterir); bunların komutları 2. nesille yazılır. Bordo pikap üretildi (`art/pilot/17-lumen/lumen-vehicle-pickup.png`, 2026-10-17), oyuna bağlanmadı.

**2026-10-17: 46/46 üretildi ve oyunda.** Kesim, webp ve şehir katmanı (`runtime/city.ts`) yapıldı; teslim notu [archive/lumen-art-handoff.md](./archive/lumen-art-handoff.md). **Yeniden üretilecek tek görsel: Elektrikli Pikap** (`lumen-vehicle-pickup.png`; komut §4.1): neredeyse önden çizildiği için kasası görünmüyor ve Keşif Aracı'yla aynı renk ve silüette (ikisi de zeytin yeşili, kutu gibi); kural her basamakta farklı silüet ve renk. Yeni komutta: kasası açıkça görünsün (önden dörtte üç, biraz daha yandan), Lumen araçlarında olmayan bir renk (öneri: bordo). Evlerin yerleşimi ve araç boyları telefonda bakılacak.

## 0. GPT için çalışma kuralları

- Her görsel ayrı bir istek. Komut, bölümün **ortak kuyruğuyla** birlikte yapıştırılır: önce görselin kendi paragrafı, sonra o bölümün kuyruğu (aynen), en sonda stil paragrafı (aynen).
- Kayıt: komuttaki dosya adıyla `art/pilot/17-lumen/` altına PNG; yanına kullanılan komut `<ad>-prompt.txt`. Denemeler `-v1`, `-v2`; seçilen sürüm tablodaki adı alır.
- Bir görselde tek bir şey tutmazsa (zemin çizgisi, kesik araç, yazı) aynı görsele "edit" ile yalnız o düzeltme istenir; ellerde ya da gövdede bozukluk varsa sıfırdan üretilir.
- **Sıra:** §1 yöneticiler (varis ilk tezgâhıyla birlikte onun yöneticisini alır) → §2 evler → §3 işletmeler → §4 araçlar → §5 lüksler.

**Lumen'in stil cümlesi (karar 2026-10-16: A).** Lumen'deki her yer ve her eşya şu çizgide kalır; komutlarda gerektiği yerde geçiyor:

> Lumen is a warm modern coastal city of today, only a few years ahead. Quiet future touches are integrated into ordinary life: solar roofs, occasional blue solar glass, energy-efficient materials and planted architecture. These are a palette of options, NOT landmarks required in every frame. Each neighborhood has its own landscape, skyline, paving and light. No recurring pair of towers. NO neon, NO holograms, NO flying cars, NO floating buildings.

**Stil paragrafı (her komutun en sonuna aynen):**

> Art style (match the reference exactly): stylized semi-3D animated-film look, soft key light from the upper left, warm palette, soft shadows, clean readable shapes for a small phone screen, eye-level camera. No text, no labels, no logos, no watermark.

## 1. Yöneticiler (10 portre)

Karar (2026-10-16, kullanıcı): Lumen'in yöneticileri de **insan**; robot yönetici fikri bırakıldı (robotlardan sonra 3. nesilde yeniden insan yönetici tutarsız durur; hikâye döngüsüz ilerleseydi düşünülebilirdi). 1. neslin yöneticileri gibi omuzdan yukarı, düz pastel zeminli kare portreler (oyunda yuvarlak kesilir; örnek `art/pilot/06-managers/sheet.png`). On kişi yaş, cinsiyet, saç ve ten olarak birbirinden ve 1. neslin yöneticilerinden ayrılır; her biri işletmesini tek bir kıyafet ya da aksesuarla söyler. Hepsi bugünün insanları; kıyafette fütürizm yok.

**Kontrol et:** 1. neslin portreleriyle aynı çizim ve kadraj mı, on kişi birbirinden ayırt ediliyor mu, her biri işletmesini tek bakışta söylüyor mu, 56 px'te okunuyor mu, yazı ya da logo var mı?

**Ortak kuyruk:**

> Head-and-shoulders portrait of ONE person, the manager of a business in a mobile idle life game, facing the viewer slightly turned, a warm friendly expression, centered, square 1:1 image. Plain flat pastel background in the color given. References from the project: `art/pilot/06-managers/sheet.png` and `art/pilot/06-managers/bakery.png` — match their art style, rendering, framing and finish exactly (the same set of manager portraits), but this is a NEW person who looks clearly different from all of them. Readable at 56 px: one clear accessory, no small clutter. Exactly the head and shoulders, no hands needed. No text, no letters, no numbers, no logos on clothing. Save the image as `art/pilot/17-lumen/{FILE}`.

| # | İşletme (TR / EN) | Dosya | Komut (kuyruktan önce) |
| --- | --- | --- | --- |
| 1 | Çiçek Tezgâhı / Flower Stand | `manager-flower-stand.png` | `A cheerful woman in her late fifties with short silver-streaked curly hair, a sage-green linen apron over a cream blouse, a small coral tulip tucked into the apron's chest pocket. Background: soft mint.` |
| 2 | Kahve Barı / Coffee Bar | `manager-coffee-bar.png` | `A young man in his early twenties with a neat black fade haircut and a small silver earring, a caramel-brown barista apron over a white T-shirt, a pencil behind one ear. Background: soft cream.` |
| 3 | Telefon Tamircisi / Phone Repair | `manager-repair.png` | `A woman in her thirties with a dark braid over one shoulder and freckles, a round magnifier lens flipped up on a band around her head, a sky-blue work shirt with rolled sleeves. Background: soft sky blue.` |
| 4 | E-Scooter Kiralama / E-Scooter Rental | `manager-scooter.png` | `An energetic young man around twenty with messy sandy hair, a lime-green open-face helmet pushed back on his head and a lime-and-white zip jacket. Background: soft lemon yellow.` |
| 5 | Dikey Tarla / Vertical Farm | `manager-farm.png` | `A calm man in his sixties with a short white beard and a straw sun hat, a leaf-green work vest over a checked shirt, a small sprig of basil in the vest pocket. Background: soft spring green.` |
| 6 | Sanal Gerçeklik Salonu / VR Arcade | `manager-vr.png` | `A playful young woman in her twenties with a bright violet bob haircut, a chunky VR headset pushed up on top of her head, a black hoodie with a violet trim. Background: soft lavender.` |
| 7 | Dron Kargo / Drone Delivery | `manager-drone.png` | `A broad-shouldered man in his forties with a shaved head and a warm smile, an orange high-visibility vest over a grey shirt, a headset with a small microphone around his neck. Background: soft peach.` |
| 8 | Güneş Santrali / Solar Farm | `manager-solar.png` | `A confident woman in her forties with a short dark pixie cut and sun-kissed skin, a bright yellow hard hat, a navy work jacket with a reflective stripe. Background: soft warm sand.` |
| 9 | Biyoteknoloji Laboratuvarı / Biotech Lab | `manager-biotech.png` | `A thoughtful man in his thirties with round tortoiseshell glasses and neat wavy hair, a white lab coat over a teal shirt, clear safety goggles resting on his forehead. Background: soft aqua.` |
| 10 | Yapay Zekâ Kampüsü / AI Campus | `manager-ai.png` | `An elegant woman in her fifties with a sleek grey-blonde bob, a tailored navy blazer over a white top, a small glowing-blue pin on the lapel; polished and calm, the most senior of all. Background: soft periwinkle.` |

## 2. Evler (11 arka plan; ev 1 hazır)

**Çevre çeşitliliği düzeltmesi (2026-10-16):** İlk seride A referansındaki kule silueti tekrarlandı; seçili üretimler farklı mahallelerle sıfırdan yenilenir. Eski seri `-v1` olarak saklanır. A yalnız görsel dilin yönüdür, başka evlere taşınacak bir mekân şablonu değildir. Ev üretiminde önceki sahne görselleri eklenmez; kamera ve stil metinle sabitlenir. Aşağıdaki çevreler ilgili evin kendi komutuna ve ortak kuyruğuna eklenir; kule/şehir şartı içeren eski ifadelerin yerini alır. Her evin gerçek kullanılan ayrıntılı İngilizce komutu kaynak PNG yanındaki `-prompt.txt` dosyasındadır.

| Ev | Ayrı çevre |
| --- | --- |
| 2 | Marina: alçak kayalık kıyı, sazlık ve eski depo çatıları; kule yok. |
| 3 | İç avlu: yakın alçak yapılar ve gökyüzü; şehir silueti yok. |
| 4 | Yaratıcı mahalle: tuğla atölyeler ve uzaktaki yuvarlak su deposu. |
| 5 | Ağaçlı kent sokağı: sıra apartmanlar, güneşli sabah; kule yok. |
| 6 | Site avlusu: park korusu ve kiremit çatılar, kule yok. |
| 7 | Yeni gelişen mahalle: badem ağaçları, alçak tepeler. |
| 8 | Aile mahallesi: meyve bahçeleri ve taş duvarlı sokaklar. |
| 9 | Akdeniz yamacı: zeytinlikler ve uzaktaki taş mahalle. |
| 10 | Tepedeki ev: çam sırtları, geniş körfez; kent çok küçük uzakta. |
| 11 | Özel kıyı: açık deniz, kireçtaşı burunlar, kent silueti yok. |
| 12 | Çatı tepesi: uzakta farklı yükseklikte yoğun şehir dokusu; ikiz kule yok. |

Sabah istenen kareler açık mavi gökyüzü ve sıcak sabah ışığı kullanır; hepsi turuncu gün batımına çevrilmez. Alt %45 boş ve kuru kalır; zemin malzemeleri de evden eve değişir.

1. neslin ev kuralları aynen ([archive/art-prompts-v2-gen1.md §1](./archive/art-prompts-v2-gen1.md), [art-brief §3](./art-brief-v2.md)): ufuk %37, zemin çizgisi en çok %55, altı boş ve kuru; evi tanıtan şey %15–37 bandında; yakın evlerde (2–6) giriş sol üçte birde, uzak evlerde (7–12) ev ortanın biraz solunda. Ev zenginleştikçe uzaklaşır. Önünde duran araçlar 1. nesille aynı zincirde (§4 tablosu). Işık evden eve değişir ama hep sıcak. **Kullanıcı düzeltmesi:** aynı yeşil kuleler ve aynı çevre tekrarlanmaz; kent silueti her karede görünmek zorunda değil. Her ev aşağıdaki ayrı mahalle/çevre tarifini kullanır. Hafif fütürizm çevredeki tek bir sessiz ayrıntıyla taşınabilir; dron da zorunlu değildir.

**Kontrol et:** 1. neslin kontrol listesi ([archive/art-prompts-v2-gen1.md §1](./archive/art-prompts-v2-gen1.md)) + şehir hâlâ "bugün, biraz ileride" mi (neon, hologram, uçan araç yok), ev bir öncekinden belirgin biçimde daha iyi mi?

| # | Ev (TR / EN) | Dosya |
| --- | --- | --- |
| 1 | Kapsül Oda / Capsule Room | `art/pilot/05-scene/lumen-home-1-a.png` (hazır) |
| 2 | Eski Tekne Ev / Old Houseboat | `lumen-home-2-houseboat.png` |
| 3 | Ortak Yaşam Odası / Co-living Room | `lumen-home-3-coliving.png` |
| 4 | Konteyner Daire / Container Flat | `lumen-home-4-container.png` |
| 5 | Yeşil Balkonlu Daire / Green-Balcony Flat | `lumen-home-5-green-flat.png` |
| 6 | Bahçeli Site / Garden Complex | `lumen-home-6-complex.png` |
| 7 | Modüler Ev / Modular House | `lumen-home-7-modular.png` |
| 8 | Yeşil Çatılı Aile Evi / Green-Roof Family House | `lumen-home-8-family.png` |
| 9 | Teras Villa / Terrace Villa | `lumen-home-9-villa.png` |
| 10 | Tepedeki Cam Ev / Hilltop Glass House | `lumen-home-10-hilltop.png` |
| 11 | Kıyı Malikânesi / Seafront Mansion | `lumen-home-11-seafront.png` |
| 12 | Kule Tepesi Malikânesi / Sky Mansion | `lumen-home-12-sky.png` |

**Ortak kuyruk** (`{LIGHT}` ve `{FILE}` her evin satırından):

> Lumen is a warm believable modern coastal city only a few years ahead, with quiet ordinary technology such as solar roofs, subtle blue solar glass and energy-efficient materials. Each home is in a DIFFERENT district with its own landscape, skyline, ground material and lighting as specified below. No repeated pair of green towers. Generate an entirely original scene from scratch. Do not attach earlier environment images as composition references: use the shared semi-3D style description and camera specification only, so their buildings, skyline and paving do not leak into the new scene. Camera: standing adult eye level1.6m, horizon at37%, looking straight ahead. Composition (important): the open ground fills the whole lower 45% of the image — the line where walls, steps, fences or planters meet the ground is no lower than 55% from the top, and from that line down to the bottom edge the ground is flat, dry and completely empty across the full width (two characters stand in the lower center, and a full-size car is parked behind them across the center and right, so leave about 7 metres of clear ground in front of the building). Whatever makes this home recognisable sits in the band between 15% and 37% from the top (above a standing person's eye level), because everything lower will be hidden. The ground is completely dry: no puddles, no wet reflections on the ground. Nothing important in the top 15% or the bottom 10% of the image. {LIGHT}. A frame from a 3D CG animated feature film, NO ink outlines, NO cel shading, NO flat 2D cartoon. NO neon, NO holograms, NO flying cars, NO floating buildings. NO people, NO animals, NO vehicles, NO boats, NO robots, NO bicycles, NO objects standing on the open ground, NO text, NO signs, NO logos. Save the image as `art/pilot/17-lumen/{FILE}`.

### Ev 2 · Eski Tekne Ev → `lumen-home-2-houseboat.png`

1. neslin minibüsünün karşılığı: içinde yaşanan eski bir taşıt. Tekne evin kendisi; kuyruktaki "NO boats" başka tekneler içindir.

> Create a NEW vertical 9:16 game background. Place: a quiet, forgotten corner of Lumen's marina, and an old houseboat moored there that someone has made into a tiny home: a faded pale-yellow wooden cabin on a flat hull, a round porthole window lit warmly, a small gangway with rope rails down to the quay, potted herbs and a string of small bulbs along the cabin roof. The houseboat lies at the back LEFT, beside the quay edge, filling roughly the left 40% of the image width; calm water only behind the quay edge, low harbor sheds and rocky headlands far behind. The near ground is a wide, plain, dry concrete quay. Humble, a little makeshift, but cosy. Light: `Soft dusk light with the warm glow of the bulbs`. *(+ ortak kuyruk; NO other boats)*

### Ev 3 · Ortak Yaşam Odası → `lumen-home-3-coliving.png`

> Create a NEW vertical 9:16 game background. Place: the small inner courtyard of a co-living building where young people rent single rooms. The building is close: only its ground floor is in view. At the back, a row of identical narrow pale-wood doors, each with a small round window; one of them, hers, has a potted lemon tree beside it and a small warm lamp above it. A shared green wall of climbing plants beside the doors, a long shared bench against the wall, a small solar canopy over the doorway. Simple, clean, a first door of her own. The entrance door is in the left third of the image (between 12% and 35% from the left edge). Light: `Warm late-afternoon light`. *(+ ortak kuyruk)*

### Ev 4 · Konteyner Daire → `lumen-home-4-container.png`

> Create a NEW vertical 9:16 game background. Place: the entrance of a small apartment block built from stacked, painted shipping containers, three high, each in a soft color (terracotta, sage, sand), with big windows cut into them and outdoor metal stairs zig-zagging up the side. Her flat is on the ground floor: a glass door with a wooden frame, a doormat, two potted plants, a small round wall lamp. Climbing plants on the stair rails. Young, cheap and cheerful, a step up. The entrance door is in the left third of the image (between 12% and 35% from the left edge); the camera is a few steps back so the stairs and two levels of containers are in view. Light: `Bright warm afternoon light`. *(+ ortak kuyruk)*

### Ev 5 · Yeşil Balkonlu Daire → `lumen-home-5-green-flat.png`

> Create a NEW vertical 9:16 game background. Place: the front of a freshly built five-storey apartment block with deep balconies overflowing with plants and small trees, warm wood soffits under the balconies, faintly blue solar glass on the balcony rails, a wide glass entrance door with a slim wooden canopy. A young tree and a wooden bench by the wall. New, bright and proud. The entrance door is in the left third of the image (between 12% and 35% from the left edge). Light: `Warm morning light`. *(+ ortak kuyruk)*

### Ev 6 · Bahçeli Site → `lumen-home-6-complex.png`

> Create a NEW vertical 9:16 game background. Place: the courtyard of a modern residential complex: smooth light paving, a row of young trees in round planters along the back, two mid-rise blocks with rooftop gardens and solar pergolas on top, a small glass security kiosk far back. Calm, safe, well kept: a family could live here. The blocks' entrance is in the left third of the image (between 12% and 35% from the left edge). Light: `Warm late-afternoon light`. *(+ ortak kuyruk)*

### Ev 7 · Modüler Ev → `lumen-home-7-modular.png`

1. neslin 7. evinden ders: ev düz zeminde arabanın arkasında kayboluyordu; bu yüzden bir metre yüksekte, önünde alçak duvar.

> Create a NEW vertical 9:16 game background. Place: her first house of her own: a small single-storey modular house of warm timber panels and big windows, a gently sloped roof covered in dark solar panels, seen whole from the end of its paved driveway about 12 metres away. The house sits about one metre higher than the driveway: a low stone wall with a simple white fence on top along the front, three steps up to a tiny front garden with lavender, one chair on the small porch. The base of the wall is about 46% from the top. Proud but modest. The house sits slightly left of center. Light: `Warm early-evening light, one window glowing`. *(+ ortak kuyruk)*

### Ev 8 · Yeşil Çatılı Aile Evi → `lumen-home-8-family.png`

> Create a NEW vertical 9:16 game background. Place: a two-storey family house with a living green grass roof and wide wooden decks, seen whole from the end of its broad paved driveway about 15 metres away. A green lawn beside the driveway, a stone path to the front door, colorful flower beds, a wooden swing hanging from a tree, a closed garage door with a slim charging post beside it. Spacious and happy. The house sits slightly left of center. Light: `Warm morning light`. *(+ ortak kuyruk)*

### Ev 9 · Teras Villa → `lumen-home-9-villa.png`

> Create a NEW vertical 9:16 game background. Place: a modern white villa stepping down a gentle slope in wide terraces, seen whole across its broad light stone courtyard about 25 metres away. One corner of an infinity pool far to the left beside the house, olive trees in large planters, faintly blue solar glass railings along the terraces, a tall wooden front door. Impressive but warm. The house sits slightly left of center. Light: `Warm late-afternoon light`. *(+ ortak kuyruk)*

### Ev 10 · Tepedeki Cam Ev → `lumen-home-10-hilltop.png`

> Create a NEW vertical 9:16 game background. Place: a modern house of glass and warm wood on a green hilltop above Lumen, seen whole from its wide gravel forecourt about 25 metres away. A long wooden deck along the front, tall pines on one side; behind and to the right, far below the hill, a tiny distant shoreline city and the broad sea. Peaceful and exclusive, the city at her feet. The house sits slightly left of center. Light: `Golden late-afternoon light`. *(+ ortak kuyruk)*

### Ev 11 · Kıyı Malikânesi → `lumen-home-11-seafront.png`

> Create a NEW vertical 9:16 game background. Place: a large white seafront mansion with flowing curved terraces covered in gardens, seen whole across a broad light stone forecourt about 35 metres away. Wide white stone stairs up to the entrance, tall palms, faintly blue solar glass along the upper terraces, a turquoise sea with a soft horizon behind the house and an empty private jetty far to the right. Luxurious, bright and airy. The house sits slightly left of center. Light: `Warm morning light`. *(+ ortak kuyruk; NO boats at the jetty)*

### Ev 12 · Kule Tepesi Malikânesi → `lumen-home-12-sky.png`

Oyunun en büyük evi bu şehirde gökte: Lumen'in en uzun yeşil kulesinin tepesi.

> Create a NEW vertical 9:16 game background. Place: a mansion on the very top of Lumen's tallest green tower, the biggest home in the game. The camera stands on a very wide, open rooftop forecourt of smooth light stone. At the far end, about 50 metres away, a grand glass-and-white-stone pavilion with tall glowing windows, a long reflecting pool in front of it close to the house, formal gardens of trimmed hedges and small trees on both sides. Beyond the rooftop edge, a low glass balustrade; past it only sky, a tiny irregular patchwork of varied city rooftops far below, and the sea at the horizon. Grand and triumphant, still warm and inviting. The house sits slightly left of center. Light: `Golden early-evening light`. *(+ ortak kuyruk; the reflecting pool is far back, not on the open ground)*

## 3. İşletmeler (9 ikon; Çiçek Tezgâhı 1. nesilden)

İlk işletme dedenin Çiçek Tezgâhı: 1. neslin ikonu (`public/assets/businesses/v2/flower-stand.webp`) kalır, yeni ikon üretilmez (dedenin tezgâhı aynı tezgâh). Basamak hissi ikonlarda: küçük kiosk → dükkân → ... → kampüs. 1. nesildeki gibi her ikon farklı bir siluet ve ana renk.

**Yörünge Oteli yerine Yapay Zekâ Kampüsü (öneri):** uzaydaki otel A kararıyla çelişiyor ("havada bina yok", bilim kurgu değil). Kullanıcı Yörünge Oteli'nde kalırsa 10. satır yeniden yazılır.

**Kontrol et:** şeffaf zemin gerçek mi (alfa kanalı), 76 px'te ne olduğu okunuyor mu, öbür ikonlardan ve 1. neslin on ikonundan ayırt ediliyor mu, yazı, harf, rakam ya da insan var mı?

**Ortak kuyruk:**

> Slight elevated front three-quarter inventory view, right side visible, square high-resolution canvas, the whole building or object centered with 10 percent clear padding on every side. It belongs to Lumen, a modern city of today only a few years ahead: believable, NOT sci-fi, no neon, no holograms. Strong compact silhouette, chunky readable simplified shapes for viewing at 76px, few large color groups instead of tiny details. Genuine transparent background, no scene, no street, no base platform, no ground plane, no contact shadow outside the object, no decorative frame. References from the project: `art/pilot/10-businesses/flower-stand-v1.png` and `art/pilot/10-businesses/tech-startup-v1.png` — match their icon framing, finish and level of detail exactly (the same set of game icons). Soft upper-left warm key light, smooth matte rounded materials, soft shading only inside the asset, stylized semi-3D animated-film game asset. NO ink outlines, NO cel shading, no photorealism. NO people, NO robots, NO animals, NO vehicles, NO text, NO letters, NO numbers, NO logos, NO watermark.

| # | İşletme (TR / EN) | Dosya | Komut (kuyruktan önce) |
| --- | --- | --- | --- |
| 2 | Kahve Barı / Coffee Bar | `biz-coffee-bar.png` | `Create ONE high-resolution square game business icon for "Coffee Bar", a small business in a mobile idle life game. A compact rounded coffee kiosk of warm wood and cream panels with a wide service window; behind the window, a simple chrome espresso machine with a small coffee cup under it. A short caramel-brown awning, two tall cups and a small plant on the counter, a gentle wisp of steam. Cosy and small.` |
| 3 | Telefon Tamircisi / Phone Repair | `biz-repair.png` | `Create ONE high-resolution square game business icon for "Phone Repair". A narrow one-storey corner workshop with a big glass shopfront and a sky-blue frame; inside, a workbench with an opened phone, a cracked tablet and a desk lamp; a large readable wrench-and-gear relief above the door (no letters). Pegboard with three big tools on the side wall.` |
| 4 | E-Scooter Kiralama / E-Scooter Rental | `biz-scooter.png` | `Create ONE high-resolution square game business icon for "E-Scooter Rental". A low rounded rental station: a lime-green and white canopy with solar panels on top sheltering a neat row of four identical lime-green electric kick scooters standing in charging docks, a small rounded kiosk at one end with a screen showing a simple lightning-bolt symbol.` |
| 5 | Dikey Tarla / Vertical Farm | `biz-farm.png` | `Create ONE high-resolution square game business icon for "Vertical Farm". A slender four-storey glass building whose every floor is filled with stacked green growing shelves under soft pink-violet grow lights, leafy greens and tomatoes clearly visible through the glass, a small wind turbine and a water tank on the roof, a warm wooden base storey with a wide door.` |
| 6 | Sanal Gerçeklik Salonu / VR Arcade | `biz-vr.png` | `Create ONE high-resolution square game business icon for "VR Arcade". A playful two-storey building with a bold rounded violet facade and a huge round window; through it, two empty padded play pods with chunky VR headsets hanging on hooks. A giant stylized VR headset sculpture mounted above the entrance as the sign (no letters). Warm violet and white with a coral accent.` |
| 7 | Dron Kargo / Drone Delivery | `biz-drone.png` | `Create ONE high-resolution square game business icon for "Drone Delivery Hub". A sturdy two-storey depot of orange and grey panels with a wide flat roof turned into a landing deck with three round landing pads; one chunky four-rotor delivery drone resting on a pad carrying a small brown parcel, a stack of parcels by a roller door below.` |
| 8 | Güneş Santrali / Solar Farm | `biz-solar.png` | `Create ONE high-resolution square game business icon for "Solar Farm". A compact diamond-shaped patch of land seen from above at an angle, holding neat rows of large tilted deep-blue solar panels, a small white control building with a yellow door at one corner and a thin power pylon; a little green grass between the rows. The land patch is part of the object, floating on the transparent background, with no shadow outside it.` |
| 9 | Biyoteknoloji Laboratuvarı / Biotech Lab | `biz-biotech.png` | `Create ONE high-resolution square game business icon for "Biotech Lab". A clean modern three-storey building of white panels and aqua glass, one curved glass wing showing a laboratory with tall glowing aqua sample tubes and a large microscope; a large readable double-helix relief on the white facade (no letters), a small rooftop garden.` |
| 10 | Yapay Zekâ Kampüsü / AI Campus | `biz-ai.png` | `Create ONE high-resolution square game business icon for "AI Campus", the biggest business in the city. A grand campus: a tall elegant tower of deep navy glass with balconies full of trees, linked by a glass bridge to a lower round white building with a green roof; a soft glowing blue ring around the top of the tower like a crown. Impressive, optimistic, plausible, the clear top of the ladder.` |

## 4. Araçlar (12 görsel)

**Üretim notu (2026-10-17):** İlk elektrikli, şehir arabası, pikap, keşif aracı ve grand tourer önceki araç ayrıntılarına yaklaşan ilk denemelerinin yerine bağımsız tasarımlarla üretildi. Bu beş araçta ve dört lükste önceki nesne görselleri eklenmedi; stil ve kamera metinle tarif edildi. Pikap, keşif aracı ve grand tourer sahne oranı için daha önden bir açıya ayrıca düzeltildi. Nihai kullanılan komutlar kaynakların yanındadır; eski denemeler `-v1`/`-v2` olarak korunur.

1. neslin araç kuralları aynen ([archive/art-prompts-v2-gen1.md §2](./archive/art-prompts-v2-gen1.md)): önden dörtte üç, önü sağa, ön yüz tam görünür; kamera 1,6 m, uzun objektif; düz açık gri zemin; tavanda yük ve anten yok. Başlıktaki oran, kesilmiş görselde **genişlik / yükseklik sınırıdır** (şerit 2,75 m ÷ gerçek boy); aşılırsa aynı komuta "more head-on" eklenir. Lumen'de arabaların hepsi elektrikli ama tanıdık: bugünün arabaları gibi tekerlekleri yerde, ızgarası kapalı ya da ince. Hangi evin önünde durdukları 1. nesille aynı:

| Ev | Önünde görülen araçlar |
| --- | --- |
| 1 Kapsül Oda | 1 E-bisiklet |
| 2 Tekne Ev | 1 E-bisiklet, 2 E-moped |
| 3 Ortak Yaşam | 2 E-moped, 3 İlk elektrikli, M Elektrikli motosiklet |
| 4 Konteyner Daire | M Elektrikli motosiklet, 4 Şehir arabası |
| 5 Yeşil Balkonlu Daire | 4 Şehir arabası, 5 Crossover |
| 6 Bahçeli Site | 5 Crossover, P Elektrikli pikap |
| 7 Modüler Ev | P Elektrikli pikap, 6 Makam sedanı |
| 8 Aile Evi | 6 Makam sedanı, 7 Spor coupe |
| 9 Teras Villa | 7 Spor coupe, 8 Keşif aracı |
| 10 Tepedeki Cam Ev | 8 Keşif aracı, 9 Hiper araba |
| 11 Kıyı Malikânesi | 9 Hiper araba, 10 Grand tourer |
| 12 Kule Tepesi | 10 Grand tourer |

**Kontrol et:** önü sağa mı, ön yüz tam görünüyor mu, oran sınırın altında mı, araç kadrajda tam mı, 1. neslin aynı basamaktaki aracından ve komşu basamaktan siluet ve renkle ayrılıyor mu, plaka, logo, yazı ya da insan var mı?

**Ortak kuyruk:**

> Parked, front three-quarter view: turned about 25 degrees from straight-on, front facing slightly RIGHT; the whole front fully visible and only part of the right side; the whole vehicle inside the frame with nothing cropped, near-side wheels fully visible. Camera at the eye height of a standing adult (1.6 m above the ground), long lens with little perspective distortion. It belongs to Lumen, a modern city of today only a few years ahead: an electric vehicle that looks believable and familiar, wheels on the ground, NOT sci-fi, NOT flying. References from the project: `art/pilot/09-vehicles/vehicle-4.png` — match its facing direction, framing, lighting, materials and art style (it is the same set of game props); `art/pilot/05-scene/lumen-home-1-a.png` — the city it belongs to. A single prop on a plain flat light grey background (#d9d9d9), soft contact shadow under the wheels only. A 3D CG animated-film prop, NO ink outlines, NO cel shading, NO flat 2D cartoon, NOT a photo. No people, no license plate (a blank surface where the plate would be), no brand logos, no badges, no text, no roof antenna, nothing on the roof, no glowing light strips. Save the image as `art/pilot/17-lumen/{FILE}`.

| # | Araç (TR / EN) · gerçek boy · oran sınırı | Dosya | Komut (kuyruktan önce) |
| --- | --- | --- | --- |
| 1 | E-bisiklet / City E-Bike · 1,10 m · — | `lumen-vehicle-1.png` | `A simple teal city e-bike with a slim battery in the frame, a front wooden crate basket and a step-through frame. Square 1:1.` |
| 2 | E-moped / Electric Moped · 1,28 m · — | `lumen-vehicle-2.png` | `A cute retro-modern electric moped in coral red with a cream seat, a round headlight and a small rear rack. Square 1:1.` |
| 3 | İlk Elektrikli / First-Gen Electric Car · 1,45 m · 1,90 | `lumen-vehicle-3.png` | `A tiny boxy first-generation electric city car, two doors, pale butter-yellow paint a little faded, one small dent on the bumper, tall narrow windows and small round headlights: old and humble but still running. Landscape 3:2.` |
| M | Elektrikli Motosiklet / Electric Motorcycle · 1,15 m · — | `lumen-vehicle-motorcycle.png` | `A naked-style electric motorcycle, matte graphite body with orange accents, a round LED headlight, a solid battery block where the engine would be. Landscape 3:2.` |
| 4 | Şehir Arabası / Electric City Car · 1,60 m · 1,72 | `lumen-vehicle-4.png` | `A modern compact electric hatchback, bubbly and friendly, soft sky-blue paint with a white roof, a smooth closed front with thin headlights. Landscape 3:2.` |
| 5 | Crossover / Electric Crossover · 1,65 m · 1,66 | `lumen-vehicle-5.png` | `A modern electric family crossover, tall and smooth, warm sand-beige paint with dark wheel arches, a bare roof, big wheels. Landscape 3:2.` |
| P | Elektrikli Pikap / Electric Pickup · 1,85 m · 1,49 | `lumen-vehicle-pickup.png` | `A rugged electric pickup truck with smooth slab sides and a flat closed front, sage-green paint, a covered flat load bed. Landscape 3:2.` |
| 6 | Makam Sedanı / Electric Executive Saloon · 1,45 m · 1,90 | `lumen-vehicle-6.png` | `A long elegant electric executive saloon, deep midnight-blue paint, a smooth flowing roofline, chrome-free clean surfaces, a slim full-width headlight line. Slightly more head-on (about 15–20 degrees) because it is long. Landscape 3:2.` |
| 7 | Spor Coupe / Electric Sports Coupe · 1,28 m · 2,15 | `lumen-vehicle-7.png` | `A low two-door electric sports coupe, bright tangerine-orange paint with a black glass roof, short nose, wide hips. Landscape 3:2.` |
| 8 | Keşif Aracı / Electric Expedition 4x4 · 1,90 m · 1,45 | `lumen-vehicle-8.png` | `A big boxy electric expedition 4x4, olive-green paint, chunky off-road tyres, square wheel arches, a spare wheel on the back; nothing on the roof. Landscape 3:2.` |
| 9 | Hiper Araba / Electric Hypercar · 1,12 m · 2,45 | `lumen-vehicle-9.png` | `A very low, wide electric hypercar, pearl-white paint with deep-blue accents, a teardrop glass canopy and sculpted air channels. Slightly more head-on (about 15–20 degrees) because it is long. Landscape 3:2.` |
| 10 | Grand Tourer / Electric Grand Tourer · 1,55 m · 1,77 | `lumen-vehicle-10.png` | `The final car: a long, stately electric grand tourer, champagne-gold paint over a dark lower body, a tall proud front with a slim lit grille line, large wheels. Slightly more head-on (about 15–20 degrees) because it is long. Landscape 3:2.` |

### 4.1 Pikabın yeniden üretimi (bordo kaynak hazır, 2026-10-17)

**Seçili kaynak:** `art/pilot/17-lumen/lumen-vehicle-pickup.png`, 1536×1024. Bordo boya, grafit alt gövde, kısa kabin ve uzun açık kasa; kasada iki küçük sandık ve katlı branda. Bir kez daha önden açı düzeltmesi yapıldı, kasa görünürlüğü korundu. Komut ve son düzeltme yanındadır. Görsel üzerinden yaklaşık siluet oranı 1,6; 1,49 hedefinin biraz üstünde, kesin ölçüm kesimden sonra yapılmalı. Ek açı daraltması kasayı yeniden gizleyebilir; sahnede kontrol edilmeden oranı tutuyor sayılmamalı. Eski yeşil kanonik kaynak `lumen-vehicle-pickup-before-burgundy.png` olarak korundu; mevcut `-v1` denemelerinin üstüne yazılmadı. Runtime dosyası değiştirilmedi.

İlk pikap neredeyse önden çizildi: kasası görünmüyor ve Keşif Aracı'yla aynı renk ve silüette. Komut (sonra §4'ün ortak kuyruğu aynen, en sonda stil paragrafı); dosya adı aynı, eski görsel `lumen-vehicle-pickup-v1.png` olarak kalır:

> A rugged mid-size electric pickup truck with smooth slab sides, a flat closed front with slim headlights, deep BURGUNDY-red paint over a dark graphite lower body and wheel arches, and an OPEN load bed at the back that is clearly visible: the camera looks a little more from the side than the other vehicles (about 30–35 degrees instead of 25), so the bed's side wall, tailgate and the inside of the bed read at a glance; a folded grey tarp and two small wooden crates sit low inside the bed, nothing sticks out above the cab. It must not look like a box-shaped 4x4: a lower roofline than the expedition 4x4, a long separate bed behind a short cab. Landscape 3:2.

Kontrol: kasa açıkça görünüyor mu, bordo mu (Lumen'de başka bordo araç yok), keşif aracından silüetle ayrılıyor mu, oran 1,49 sınırını çok aşıyor mu (aşarsa "slightly more head-on, keep the bed visible" ile bir kez daha).

## 5. Lüksler (4 görsel)

1. neslin lüksleriyle aynı biçim ([archive/art-prompts-v2-gen1.md §7](./archive/art-prompts-v2-gen1.md)): tek nesne, düz açık gri zemin, önden dörtte üç, burnu sağa, nesnenin tamamı kadrajda; tekne ve yat sudan çıkmış bir model gibi. Fiyatlar 1. nesille aynı ($5B, $50B, $200B, $1T).

**Ortak kuyruk:**

> It belongs to Lumen, a modern city of today only a few years ahead: believable and quietly electric, NOT sci-fi, no neon, no glowing strips. References from the project: `art/pilot/14-luxury/speedboat.png` and `art/pilot/09-vehicles/vehicle-10-front-right-v1.png` — match their facing direction, lighting, materials and art style (it is the same set of game props); `art/pilot/09-vehicles/vehicle-4.png` — the same camera and framing rules. A single prop on a plain flat light grey background (#d9d9d9), a soft contact shadow under it only. The whole object inside the frame with clear margins, nothing cropped. A 3D CG animated-film prop, NO ink outlines, NO cel shading, NO flat 2D cartoon, NOT a photo. No people, no water, no sky, no flags, no registration marks, no text, no logos. Save the image as `art/pilot/17-lumen/{FILE}`.

| # | Ad (TR / EN) | Dosya | Komut (kuyruktan önce) |
| --- | --- | --- | --- |
| 1 | Hidrofil Tekne / Electric Hydrofoil Boat | `lumen-luxury-1-hydrofoil.png` | `A sleek electric hydrofoil speedboat about 8 metres long: glossy white hull with a thin teal stripe, a low wraparound windscreen, cream seats, two slim foils folded down under the hull; shown whole out of the water like a showroom model, front three-quarter view with the bow facing RIGHT and slightly toward the camera.` |
| 2 | Güneş Yatı / Solar Yacht | `lumen-luxury-2-solar-yacht.png` | `A large modern three-deck yacht whose whole upper deck roof is a smooth curved canopy of deep-blue solar panels: long white hull with a warm wood rear deck and a tiny plunge pool, tinted panoramic windows; shown whole out of the water like a showroom model, front three-quarter view with the bow facing RIGHT and slightly toward the camera; proportions simplified and a little compact so the silhouette reads at thumbnail size.` |
| 3 | Elektrikli Helikopter / Electric Helicopter | `lumen-luxury-3-helicopter.png` | `A quiet private electric helicopter standing on its skids: pearl-white rounded body with a thin teal stripe, a large curved cockpit glass, five slim main rotor blades at rest, an enclosed tail rotor, cream leather seats visible through the glass; front three-quarter view with the nose facing RIGHT and slightly toward the camera; the full rotor span inside the frame. A real helicopter, NOT a drone and NOT a flying car.` |
| 4 | Süpersonik Jet / Supersonic Business Jet | `lumen-luxury-4-jet.png` | `A private supersonic business jet standing on its landing gear: a long needle nose, slender white fuselage with a thin deep-blue and gold stripe, sharp delta wings, two engines under the rear wings, small oval cabin windows, the door closed; front three-quarter view with the nose facing RIGHT and slightly toward the camera; both wingtips and the tail inside the frame.` |

## 6. Bu belgede olmayanlar

Lumen'e ait ama ayrı turda: 2. neslin kıyafet ve poz seti (varis Ada; story §6), Şans'ın yavrusu (öneri), toplanacaklar (rakamlar aynı olduğu için varisin de toplama aşaması varsa), Lumen törenlerinin hikâye kareleri (törenlerin metni yazılınca). Burak hikâyesi kaldırıldı ([archive/burak-story.md](./archive/burak-story.md)).

## 7. Oyuna bağlama (Claude)

Evler `public/assets/scene/lumen-home-N.webp` (1080 genişlik), araçlar `scripts/cutout-vehicle.sh` (beyaz gövdeler `FUZZ=3.5 PALE=1`), lüksler `scripts/cutout-pale.sh`, ikonlar 384 px webp, yönetici portreleri 256 px webp (`public/assets/managers/lumen/`). Ev yerleşimi `stages.ts` `HOME_ART`, araç oranları `VEHICLE_SHAPE`; sahne laboratuvarında ev ev bakılır.

## Ek: ilk ev karesinin komutu (hazır)

`art/pilot/05-scene/lumen-home-1-a.png` (doğal 941×1672; komut yanındaki `-prompt.txt`, üst boşluk düzeltmesi `lumen-home-1-a-correction-prompt.txt`). Elenen B (`lumen-home-1-b.png`) karşılaştırma için klasörde.

> Create a NEW vertical 9:16 game background. References from the project: (1) `art/pilot/05-scene/alley-clean.png` — use it ONLY for the camera: a standing adult's eye level, horizon at 37% from the top, looking straight ahead; (2) `art/pilot/05-scene/home-2-flat.png` — match its art style and level of detail. Keep the same camera height and horizon as reference (1), but with far more open ground than either reference. Place: a narrow side street in Lumen, a young modern coastal city, and the cheapest home in it: a small capsule-apartment block, four storeys of identical rounded pod windows stacked like drawers, plain white panels a little weathered, one pod window lit warmly, a simple glass entrance door with a keypad. It feels like a city of today, only a few years ahead: in the distance behind the block, a few slim towers with trees growing on their balconies and faintly blue solar glass, one small delivery drone far up in the sky. Everything else is ordinary: concrete, a street lamp, a recycling bin by the wall, potted plants. Humble, a fresh start, a little lonely but hopeful. The block sits slightly left of center. Composition (important): the open ground fills the whole lower 45% of the image — the line where walls, steps, fences or planters meet the ground is no lower than 55% from the top, and from that line down to the bottom edge the ground is flat, dry and completely empty across the full width (two characters stand in the lower center, and a full-size car is parked behind them across the center and right, so leave about 7 metres of clear ground in front of the building). Whatever makes this home recognisable sits in the band between 15% and 37% from the top (above a standing person's eye level), because everything lower will be hidden. The ground is completely dry: no puddles, no wet reflections. Nothing important in the top 15% or the bottom 10% of the image. Warm sunset light. NO neon, NO holograms, NO flying cars, NO floating buildings. A frame from a 3D CG animated feature film, NO ink outlines, NO cel shading, NO flat 2D cartoon. NO people, NO animals, NO vehicles, NO robots, NO bicycles, NO objects standing on the open ground, NO text, NO signs, NO logos. Save the image as `art/pilot/05-scene/lumen-home-1-a.png`.
