# Görsel Komutları: Burak hattı

2026-10-16 · Hikâye ve metinler: [story-v2.md §6a](./story-v2.md) · Genel kurallar: [art-brief-v2.md](./art-brief-v2.md) · Aynı düzende önceki iş: [art-prompts-dynasty.md](./art-prompts-dynasty.md)

> **Bekletiliyor (2026-10-21):** Burak hikâyesi kaldırıldı, bu görseller şimdilik üretilmez ([story-v2.md §6a](./story-v2.md)).

Bu belge GPT'ye verilir. Burak, Lojistik Deposu'nun düzen takıntılı şefi; çalışarak zenginleşir, 45 yaşında kahramanın ortağı olur, 80 yaşında bütün şirketlerine el koyar, 2. neslin kötüsüdür. Yaşı hiçbir yerde söylenmez. Görselde tek bir görünümü var: **orta yaşlı, saçında ve sakalında kır düşmüş, takım elbiseli** (iki nesilde de aynı).

| # | Dosya | Ne | Durum |
| --- | --- | --- | --- |
| B1 | `art/pilot/16-dynasty/burak-sheet.png` | Kılavuz + 4 portre | Kaynak hazır; kullanıcı onayı bekliyor (2026-10-17) |
| B2 | `art/pilot/10-life/life-partner.png` | 45 yaş · Ortaklık (el sıkışma) | B1 onaylanınca |
| B3 | `art/pilot/10-life/life-betrayal.png` | 80 yaş · Kazık (gazete) | B1 onaylanınca |
| B4 | anahtar karesi (2. neslin son töreni) | | **Bekliyor:** yetişkin Ada'nın 2. nesil görünümü tasarlanınca yazılır |

## 0. Çalışma kuralları

1. Sırayla: önce B1. Kullanıcı onaylamadan B2 ve B3'e geçilmez (yüz tutarlılığı).
2. Her komutun altında yazan referansların hepsi her üretime eklenir (tek referansla stil 2D'ye kayıyor).
3. Kayıt: tablodaki yola PNG; yanına aynı adla `-prompt.txt`. Denemeler `-v1`, `-v2`; seçilen tablodaki adı alır.
4. Eller tam çözünürlükte kontrol edilir: iki kol, iki el, beşer parmak. Fazla el ya da parmak çıkarsa düzeltilmez, daha sade pozla yeniden üretilir.
5. **Yazı yok.** Gazetede bile okunur harf olmaz: sütunlar bulanık gri çizgiler, manşet yerine büyük bir fotoğraf.
6. `art/` git'te değil. Bitince `npm run backup`.

**Burak'ın değişmeyen işaretleri:** kahverengi gözler, kalın kaşlar, düzgün kesilmiş dolgun sakal (yönetici portresindeki yüz); saç geriye düzgünce taranmış, şakaklarda ve sakalda kır. Koyu antrasit ince çizgili takım, bordo kravat, beyaz gömlek, altın kol düğmeleri, ceket yakasında **küçük altın bir ördek rozeti** (olay kartındaki ördek sayımına gönderme; ufak ve zarif, karikatür değil). Her şey kusursuz yerli yerinde: kırışık yok, mendil üçgen katlı.

**Stil paragrafı** (komutlara eklenmiş durumda):

> Art style (match the reference exactly): stylized semi-3D animated-film look, soft key light from the upper left, warm palette, soft shadows, clean readable shapes for a small phone screen, eye-level camera. No text, no labels, no logos, no watermark.

## B1 Burak kılavuzu → `art/pilot/16-dynasty/burak-sheet.png`

**Üretim notu (2026-10-17):** 1536×1024 seçili PNG ve komutu hazır. Mevcut lojistik yöneticisinin yüzü, antrasit ince çizgili takım, bordo kravat ve küçük altın ördek rozeti korundu. Sakaldaki kırlar son düzeltmeyle belirginleştirildi (`burak-sheet-correction-prompt.txt`); ilk çıktı `burak-sheet-v1.png`. Eller yakın planda kontrol edildi. Kullanıcı ayrıca B1 onayından sonra B2/B3’e geçileceğini teyit etti; B2 ve B3 henüz üretilmedi.

Referanslar: `art/pilot/06-managers/logistics-warehouse.png` (yüz: oyundaki Burak), `art/pilot/03-cast/defne-sheet.png` (sayfa düzeni), `art/pilot/16-dynasty/grandpa-sheet.png` (aynı stilde yaşlanmış bir yüz), `art/pilot/03-cast/bulent-sheet.png` (takım elbiseli bir yetişkinin bu stilde çizimi).

Portreler (sol üstten sağ alta), koddaki ifade adlarıyla: **smile** (ortaklıktaki satıcı gülüşü: geniş ama gözler gülmüyor), **smug** (Zenginler Listesi'ndeki alaycı, kendinden emin), **cold** (tehditkâr, gözler kısık, dudaklar ince), **shaken** (son törende: kaşlar kalkmış, şaşkın, yenilmiş).

```
Character sheet of the SAME man from reference 1 (the logistics warehouse manager), now a rich, powerful businessman in his late forties to mid fifties. Keep his identity unmistakable: same face shape, same brown eyes, same thick eyebrows, same nose, same full beard, only neatly trimmed now; dark brown hair combed back perfectly, grey at the temples and grey streaks in the beard. Obsessively tidy and controlled: a dark charcoal pinstripe suit tailored to perfection, crisp white shirt, burgundy silk tie, gold cufflinks, a neatly folded white pocket square, polished black oxford shoes, and a small elegant gold rubber-duck-shaped pin on his left lapel. Upright, broad-shouldered, chin slightly raised, hands relaxed. He looks charming and trustworthy at first glance, with something calculating in his eyes; not a cartoon villain, no evil grin.
Layout exactly like reference 2: landscape sheet on a plain light grey background. Left side: three full-body views (front, three-quarter, side), neutral standing pose, arms relaxed at the sides, feet visible, exactly two arms and two hands each. Right side: a 2x2 grid of head-and-shoulders expression portraits with space around each: top-left smile (a wide salesman smile that does not reach his eyes), top-right smug (one eyebrow raised, self-satisfied half smile), bottom-left cold (eyes narrowed, thin lips, quietly threatening), bottom-right shaken (eyebrows up, eyes wide, mouth slightly open, defeated and stunned).
Art style (match the reference exactly): stylized semi-3D animated-film look, soft key light from the upper left, warm palette, soft shadows, clean readable shapes for a small phone screen, eye-level camera. No text, no labels, no logos, no watermark.
```

Kontrol: yönetici portresindeki adam mı (sakal, kaşlar)? Ördek rozeti küçük ve okunur mu? Gülüşü sevimli ama hafif soğuk mu (kötü adam karikatürü değil)?

## Hikâye kareleri (B2, B3)

Kare kuralları (art-brief §3): 9:16 dikey, en az 1536×2752 (araç daha küçük verirse olduğu gibi kalır). Kare tam genişlikte gösterilir. **Alt %35'e konuşma balonu biner**: yüzler ve önemli nesneler üst %65'te, alt kısım sakin zemin. Kayıt `art/pilot/10-life/`.

### B2 Ortaklık (45 yaş) → `art/pilot/10-life/life-partner.png`

Metin (story §6a): *"Burak artık ördek saymıyordu. Şehirdeki bütün kamyonlar onundu."* · Burak: *"Abi, sevkiyatı tek elden yönetelim. Senin şirketlerin, benim kamyonlarım."* · Kahraman güvenir. · Burak: *"Ortaklığa, abi. Her şey yerli yerinde olacak."*

Referanslar: B1 `burak-sheet.png`, `art/pilot/08-outfits/outfit-4-sheet.png` (kahraman, takım elbise, sol bilekte saat), `art/pilot/08-outfits/hero-4-idle.png` (kahramanın yarı 3D duruşu), `art/pilot/10-life/life-birth.png` (yarı 3D hikâye karesi stili).

```
Create ONE finished 9:16 vertical cinematic story panel for a mobile game: two men seal a business partnership, and only the viewer can feel something is off. Place: the loading yard of a huge, spotless modern logistics depot at golden hour; behind them long perfectly straight rows of identical clean white trucks and stacked shipping containers lined up with obsessive precision, warm sunset light. No logos, no writing, no signs anywhere.
Reference 1 AUTHORITATIVE partner (dark charcoal pinstripe suit, burgundy tie, gold rubber-duck lapel pin, trimmed full beard with grey streaks, hair combed back). Reference 2 and 3 AUTHORITATIVE hero (his tailored suit from reference 2, the classic gold watch with cream dial and brown leather strap on his LEFT wrist, his young tousled hair).
Scene: medium shot, the hero on the LEFT and the partner on the RIGHT, shaking hands firmly in the middle of the frame. The hero smiles openly and warmly, full of trust. The partner smiles wide, his left hand clapping the hero's shoulder like an old friend, but his eyes are cool and calculating, glancing past the hero at the rows of trucks. Exactly two people, exactly two arms and two hands each, one clear handshake.
Composition: faces and the handshake in the upper two thirds (faces around y=25-32%, the handshake around y=42%). The BOTTOM 35% is calm empty clean concrete yard with long golden shadows and nothing important, for a dialogue overlay. Eye-level camera, the two men take about half of the canvas height.
A polished frame from a 3D CG animated feature film, NO ink outlines, NO cel shading, NO flat 2D cartoon. Soft dimensional shading, warm golden backlight.
Art style (match the reference exactly): stylized semi-3D animated-film look, soft key light from the upper left, warm palette, soft shadows, clean readable shapes for a small phone screen, eye-level camera. No text, no labels, no logos, no watermark.
```

Kontrol: Burak'ın gözü gülmüyor ama yüz kötü adam gibi değil; tokalaşmada iki el, omuzda bir el; kamyonlarda yazı yok.

### B3 Kazık (80 yaş) → `art/pilot/10-life/life-betrayal.png`

Metin (story §6a): *"Gazete aynı sabah çıktı: 'Burak Holding, eski ortağının bütün şirketlerine el koydu.'"* · Defne: *"Her şeyi almış. Şirketleri, evi... Hepsini."* · Dede: *"Saati almamış. Tezgâhları da. Değersiz bulmuş."* · Dede: *"Para gider, Defne. Saat kaldı, tezgâh kaldı, biz kaldık."* Bu kare saat teslim karesinden (`life-handover.png`) hemen önce gelir; saat hâlâ dedenin bileğinde.

Referanslar: `art/pilot/07-story/c7-mansion-cake.png` (konak: En Zengin töreninin yeri), `art/pilot/16-dynasty/grandpa-sheet.png`, `art/pilot/16-dynasty/defne-old-sheet.png`, B1 `burak-sheet.png` (yalnız gazetedeki fotoğraf için), `art/pilot/02-poses/sans-sheet.png`.

```
Create ONE finished 9:16 vertical cinematic story panel for a mobile game: the morning an old couple learns they have lost everything, and the grandfather stays calm. Place: the same grand mansion from reference 1, but its big living room is being emptied: furniture covered with white sheets, a few stacked cardboard moving boxes, pale squares on the wall where paintings used to hang, soft cool morning light through tall windows.
Reference 2 AUTHORITATIVE grandfather, about 80 (silver tousled hair, round gold glasses, cream shirt, olive-brown knitted vest, and his classic gold watch with cream dial and brown leather strap still on his LEFT wrist). Reference 3 AUTHORITATIVE grandmother (silver-grey wavy hair, freckles, mustard cardigan).
Scene: the grandmother stands on the RIGHT holding an open newspaper toward him, upset, one hand at her mouth, eyes wet. The front page shows one large photo of the smiling businessman from reference 4 (beard with grey streaks, charcoal pinstripe suit); the rest of the page is only blurred grey illegible lines, NO readable letters, NO headline text. The grandfather sits on the LEFT on a sheet-covered armchair, calm and gentle, looking up at her with a small sad smile, his right hand resting over the watch on his left wrist. The dog with a gold collar lies at his feet with its head on his shoe. Exactly two people and one dog. Real four-legged dog, quadruped, NOT anthropomorphic. Exactly two arms and two hands per person.
Composition: faces, newspaper and watch in the upper two thirds (faces around y=25-35%, the watch around y=45%). The BOTTOM 35% is calm empty polished floor with soft window light and nothing important, for a dialogue overlay. Eye-level camera, figures take about half of the canvas height.
A polished frame from a 3D CG animated feature film, NO ink outlines, NO cel shading, NO flat 2D cartoon. Soft dimensional shading, cool morning light with a warm glow on the grandfather.
Art style (match the reference exactly): stylized semi-3D animated-film look, soft key light from the upper left, warm palette, soft shadows, clean readable shapes for a small phone screen, eye-level camera. No text, no labels, no logos, no watermark.
```

Kontrol: gazetede tek okunur harf yok; saat dedenin sol bileğinde (devir karesine kadar onda); Defne'nin iki eli: biri gazetede, biri ağzında.

## Oyuna bağlama (Claude)

Portreler B1'den `public/assets/story/portraits/burak-{smile,smug,cold,shaken}.webp`, yeni konuşmacı `burak` (`ceremonyScript.ts` `FACES`); kareler `public/assets/story/life/{partner,betrayal}.webp`. Ortaklık (`partner`, 45) ve kazık (`betrayal`, 80) anları, annenin uyarısı ve 70 yaş anına iki balon story §6a'daki metinlerle; kayıt kimlikleri yeni, eski kayıtlar için varsayılan "görülmedi".
