# Meslek ve eşya ikonları: GPT komutları

Tarih: 2026-10-21 · İlgili: [economy-rebuild.md §5](./economy-rebuild.md) (63 meslek, şartlar), mevcut 12 meslek ikonu `art/pilot/11-careers/` (her birinin komutu yanında `-prompt.txt`)

Meslek panosu 63 mesleğe çıktı; 12'sinin ikonu var. Gereken: **51 meslek ikonu** ve meslek açan **4 eşya ikonu** (toplam 55). Oyunda şimdilik kariyer simgesi (meslekler) ve mağaza simgesi (eşyalar) duruyor. Her ikon tek bir nesne ya da küçük nesne grubudur (mevcutlar gibi: kasiyerde yazar kasa, bulaşıkçıda tabak yığını); insan yok.

## Kurallar

- **Sıra:** önce erken oyunun meslekleri ve 4 eşya (oyuncu ilk saatte görür: tablonun ilk 16 satırı), sonra kalanlar.
- **Kayıt:** meslekler `art/pilot/11-careers/{kimlik}.png`, eşyalar `art/pilot/12-icons/{kimlik}.png`, yanına `-prompt.txt`.
- **Birbirinden ayrılmalı:** aynı alandaki meslekler (ör. aşçı, aşçıbaşı yardımcısı, aşçıbaşı) farklı nesneyle anlatılır; 48 px'te ayırt edilmeli.
- **Oyuna bağlama (Claude):** 256 px webp → `public/assets/jobs/v2/{kimlik}.webp` (eşyalar `public/assets/items/v2/`), `config/careers.ts` `JOB_ART`'a kimlik eklenir (eşyalarda `config/lifestyle.ts` `image`). `npm run backup`.

## Ortak blok

Her komut `Subject:` cümlesiyle biter; komutun başı aynen şudur:

> Generate from scratch ONE completely ORIGINAL polished 3D CG mobile idle-game ICON for Prestige Life Idle Tycoon v2. NO reference image, no copying/reusing earlier asset composition or objects. Soft dimensional animated-feature prop aesthetic, tactile materials, rounded clear shapes, neutral warm upper-left studio light, restrained highlights, NO ink outlines, NO cel shading, no hyperreal photograph. Prioritize clean silhouette and meaning at 32–64px; limit small details. Square canvas, whole silhouette fully inside with 10% clear margin. TRUE transparent alpha background, no ground plane, baked shadow, glow/vignette, badge frame, text, letters, numbers, watermarks or collage. NO people, NO hands. One finished icon only. Subject: {KONU}

## 1. Erken meslekler ve eşyalar (16)

| Kimlik | Ad (TR / EN) | {KONU} |
| --- | --- | --- |
| `gadget-phone` | Akıllı Telefon / Smartphone | `A modern smartphone standing slightly tilted, rounded corners, a glowing blank colorful home screen with simple app shapes, a soft coral case.` |
| `gadget-toolbox` | Alet Çantası / Toolbox | `An open red metal toolbox with a top tray: a hammer, a screwdriver and a yellow tape measure sticking out.` |
| `gadget-camera` | Fotoğraf Makinesi / Camera | `A chunky retro-modern camera in black and tan leather with a big lens and a neck strap curled beside it.` |
| `gadget-laptop` | Dizüstü Bilgisayar / Laptop | `An open silver laptop seen from the front three-quarter, a glowing blue screen with simple abstract shapes, a small sticker of a star on the lid edge.` |
| `bike-courier` | Bisikletli Kurye / Bike Courier | `A bright orange insulated courier backpack box with a reflective stripe, a bicycle helmet resting on top.` |
| `line-cook` | Aşçı / Line Cook | `A sizzling black frying pan with two fried eggs and a spatula resting on its rim, a little steam.` |
| `shop-assistant` | Mağaza Satış Danışmanı / Shop Assistant | `A neat stack of three folded sweaters in pastel colors with a paper price tag without text hanging from the top one.` |
| `construction-laborer` | İnşaat İşçisi / Construction Laborer | `A yellow wheelbarrow holding a few red bricks and a trowel.` |
| `apprentice-electrician` | Çırak Elektrikçi / Apprentice Electrician | `A coil of red and blue electrical wire with a pair of yellow-handled pliers lying across it.` |
| `office-clerk` | Büro Memuru / Office Clerk | `A tidy stack of manila folders with a rubber stamp and a round ink pad beside it.` |
| `hospital-porter` | Hastane Görevlisi / Hospital Porter | `A light-blue hospital wheelchair seen from the front three-quarter, folded blanket on the seat.` |
| `street-photographer` | Sokak Fotoğrafçısı / Street Photographer | `A small easel board pinned with four blank instant photos in a grid, a camera strap hanging from the corner.` |
| `social-media-assistant` | Sosyal Medya Asistanı / Social Media Assistant | `A ring light on a short stand with a phone clipped in its center, floating simple heart and thumbs-up bubbles above.` |
| `taxi-driver` | Taksi Şoförü / Taxi Driver | `A classic yellow taxi roof light (the sign box) without letters, with a small checker band, resting on its own.` |
| `nursing-assistant` | Hasta Bakıcı / Nursing Assistant | `A white first-aid kit box with a red cross, a rolled bandage and a thermometer beside it.` |
| `junior-web-developer` | Stajyer Web Geliştirici / Junior Web Developer | `A small laptop with colorful code-like bars on the screen (no readable characters) and a coffee mug with a plant-green stripe beside it.` |

## 2. Kalan meslekler (39)

| Kimlik | Ad (TR / EN) | {KONU} |
| --- | --- | --- |
| `sous-chef` | Aşçıbaşı Yardımcısı / Sous Chef | `A wooden cutting board with a chef's knife and neatly chopped colorful vegetables in small piles.` |
| `head-chef` | Aşçıbaşı / Head Chef | `A tall white chef's toque hat standing beside a gleaming silver serving cloche.` |
| `restaurant-manager` | Restoran Müdürü / Restaurant Manager | `A leather-bound reservation book lying open with a golden pen and a small brass service bell.` |
| `hotel-manager` | Otel Müdürü / Hotel Manager | `A brass hotel key with a burgundy tassel fob beside a polished reception desk bell.` |
| `hospitality-director` | Konaklama Direktörü / Hospitality Director | `A gold-trimmed luggage cart with two elegant suitcases and a hat box.` |
| `senior-sales` | Kıdemli Satış Temsilcisi / Senior Sales Representative | `A tan leather briefcase with a car key and a handshake-shaped golden pin resting on it.` |
| `store-manager` | Mağaza Müdürü / Store Manager | `A ring of shop keys on a large key ring hanging from a small wooden clipboard with a checklist of blank lines.` |
| `regional-sales-manager` | Bölge Satış Müdürü / Regional Sales Manager | `A small folded paper map with three colorful location pins standing in it.` |
| `chief-commercial-officer` | Satış Genel Müdürü / Chief Commercial Officer | `A tall golden upward-arrow trophy on a dark marble base.` |
| `truck-driver` | Tır Şoförü / Truck Driver | `The front of a big cabover truck cab in teal and white, unbranded, seen three-quarter.` |
| `dispatcher` | Sevkiyat Sorumlusu / Dispatcher | `A headset with a microphone resting on a clipboard with a route map of colored lines.` |
| `warehouse-supervisor` | Depo Şefi / Warehouse Supervisor | `A small orange forklift carrying one pallet with three brown boxes.` |
| `logistics-coordinator` | Lojistik Koordinatörü / Logistics Coordinator | `A tablet showing a simple map with a dotted route between two pins, three small boxes stacked beside it.` |
| `operations-manager` | Operasyon Müdürü / Operations Manager | `Three interlocking gears in steel, teal and gold.` |
| `logistics-director` | Lojistik Direktörü / Logistics Director | `A small globe on a stand with a cargo ship and a plane circling it on thin arcs.` |
| `senior-engineer` | Kıdemli Yazılım Mühendisi / Senior Software Engineer | `Two monitors side by side on stands with colorful abstract code bars, a mechanical keyboard in front.` |
| `engineering-manager` | Mühendislik Müdürü / Engineering Manager | `A whiteboard on an easel with a simple flowchart of colored boxes and arrows, a marker on the tray.` |
| `cto` | Teknoloji Direktörü / Chief Technology Officer | `A glowing blue circuit-chip shaped crystal on a sleek dark pedestal.` |
| `bank-teller` | Banka Veznedarı / Bank Teller | `A neat stack of banknotes with a paper band, a small coin tray and a banknote counting machine.` |
| `accountant` | Muhasebeci / Accountant | `A chunky desk calculator with a long paper tape curling out, a sharpened pencil beside it.` |
| `financial-analyst` | Finansal Analist / Financial Analyst | `A monitor showing a rising green line chart and a falling red one, a small potted plant beside it.` |
| `finance-manager` | Finans Müdürü / Finance Manager | `A dark green ledger book with a gold-edged bookmark and a fountain pen lying across it.` |
| `investment-banker` | Yatırım Bankacısı / Investment Banker | `A golden bull figurine standing on a small stack of gold bars.` |
| `cfo` | Finans Direktörü / Chief Financial Officer | `A heavy round bank-vault door, half open, with a gleam of gold inside.` |
| `electrician` | Elektrikçi / Electrician | `A yellow multimeter with red and black test leads and a lit light bulb beside it.` |
| `master-electrician` | Usta Elektrikçi / Master Electrician | `An open grey electrical panel with neat rows of switches and color-coded wires.` |
| `site-foreman` | Şantiye Ustabaşı / Site Foreman | `A yellow hard hat on top of a rolled blueprint tied with a string.` |
| `site-manager` | Şantiye Şefi / Site Manager | `A small scale model of a half-built building with a tiny crane beside it.` |
| `construction-project-manager` | İnşaat Proje Müdürü / Construction Project Manager | `An unrolled blueprint held flat by a hard hat and a measuring tape, a small tower outline drawn on it.` |
| `content-creator` | İçerik Üreticisi / Content Creator | `A compact vlogging camera on a mini tripod with a fluffy microphone on top.` |
| `journalist` | Gazeteci / Journalist | `A notepad with a pencil and a retro handheld voice recorder beside a folded newspaper with blank columns.` |
| `editor` | Editör / Editor | `A stack of paper pages with red correction marks (shapes, no letters) and a red pen.` |
| `tv-producer` | TV Yapımcısı / TV Producer | `A black-and-white film clapperboard without writing, partly open, beside a director's megaphone.` |
| `media-director` | Medya Direktörü / Media Director | `A large professional TV studio camera on a pedestal with a red tally light.` |
| `nurse` | Hemşire / Nurse | `A light-blue stethoscope coiled around a white clipboard with a small red cross.` |
| `head-nurse` | Başhemşire / Head Nurse | `A white nurse's cap with a red cross beside a small medicine cart with drawers.` |
| `doctor` | Doktor / Doctor | `A white doctor's coat folded neatly with a stethoscope draped over it and a pen in the pocket.` |
| `surgeon` | Cerrah / Surgeon | `A round surgical operating lamp with several glowing lenses, green surgical cap beside it.` |
| `hospital-director` | Başhekim / Hospital Director | `A small modern hospital building model with a red cross on the facade.` |

## 3. Sonra

Lumen'in (2. nesil) meslekleri aynı kimliklerle aynı ikonları kullanır; ayrı set gerekmez.
