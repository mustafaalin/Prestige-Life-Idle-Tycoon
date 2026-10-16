# GPT görevi: Şans'ın fularlı görselleri (15 görsel)

Tarih: 2026-10-15 · Durum: **pilot onaylandı (2026-10-15), kalan 14 görsel üretiliyor (1/15)** · Bağlam: [discussion-notes.md §1](../discussion-notes.md), [art-prompts-v2.md §11–12](../art-prompts-v2.md)

Pilot kullanıcı tarafından onaylandı; kalan 14 görsel de üretildi. Tüm 15 PNG ve prompt eşleri `art/pilot/05-scene/` altında. Görseller açık/koyu zeminde karşılaştırıldı, alfa ve en-boy oranları kontrol edildi. Kod, kesim ve WebP dönüşümü yapılmadı. Güncel teslim listesi: [sans-scarf-handoff.md](./sans-scarf-handoff.md).

Bu belge GPT için yazıldı; GPT buradan okuyup görselleri üretir. İş bitince belge `archive/` altına taşınır.

## 1. Ne isteniyor

Oyunda Şans adında bir köpek var. Tasması oyuncunun sınıfına göre değişiyor: ip, deri, gümüş, altın; bir de ücretli yakut tasma var. Ücretli Başlangıç Paketi Şans'a kırmızı puantiyeli bir fular veriyor. Fular bugün ayrı bir çıkartma olarak yalnız oturan köpeğin üstüne bindiriliyor: tasmanın üstünde yapışık duruyor, cüzdanlı ve uyuyan pozlarda hiç görünmüyor.

İstenen: fular gerçekten takılmış gibi çizilmiş **15 yeni görsel** (5 tasma × 3 poz: oturan, cüzdanlı, uyuyan).

**Kodlara dokunma, yalnız görsel üret.** Kesim (`scripts/cutout.sh`), webp dönüşümü ve oyuna bağlama Claude'un işi.

## 2. Önce bunlara bak

- Fular referansı: `art/pilot/02-poses/sans-scarf-src.png` (kesilmiş hâli `art/pilot/02-poses/sans-scarf.png`)
- Önceki tasma düzenlemelerinin komutları, üslup örneği olarak: `art/pilot/05-scene/sans-sit-ruby-prompt.txt`, `art/pilot/05-scene/sans-sit-silver-prompt.txt`
- Tablodaki referans görsellerin hepsi `art/pilot/05-scene/` altında.

## 3. Kurallar (15 görselin hepsinde)

- Her görsel, tablodaki referans görselin **düzenlemesi**. Köpeğin kimliği, yüzü, ifadesi, duruşu, kürkü, kulakları, kuyruğu, oranları, kamera açısı, çerçevesi ve yarı 3D çizim stili aynen kalır. Değişen tek şey fuların eklenmesi.
- **Fular:** sıcak kırmızı-turuncu, küçük beyaz puantiyeli pamuk bandana, boyna küçük bir düğümle bağlı. Boynu sarar, yanlarda kürkün arkasına girer, yumuşak kıvrımları var, köpekle aynı ışığı alır. Yapıştırılmış gibi değil, giyilmiş gibi durmalı.
- **Tasma** referanstaki gibi kalır ve fuların **üstünde** takılı olur; künye ya da sarkıt fuların önünde sallanır. Telefonda küçük boyda hem tasma hem fular seçilmeli.
- Gerçek saydam arka plan (alfa). Zemin, gölge, manzara, yazı, ek nesne yok. Tek köpek, dört ayaklı, bütün gövde kenar boşluklarıyla çerçevede. Referansın en-boy oranı korunur.

## 4. Sıra

1. Önce **yalnız pilot** görseli üret: oturan + altın (`sans-sit-gold-scarf.png`, tabloda 10. satır). Dur ve kullanıcıya göster. **Onay gelmeden devam etme.**
2. Onaydan sonra kalan 14 görseli üret. Pilotu her isteğe 3. referans olarak ver; fuların biçimi, deseni ve rengi hepsinde aynı olsun.

## 5. Görseller ve kayıt yerleri

Hepsi `art/pilot/05-scene/` altına kaydedilir; referanslar da aynı klasörde.

| # | Çıktı | Referans (düzenlenecek) | Poz komutu | `{COLLAR}` |
|---|---|---|---|---|
| 1 | `sans-sit-rope-scarf.png` | `sans-sit-cut.png` | Oturan | his simple frayed rope collar |
| 2 | `sans-wallet-rope-scarf.png` | `sans-wallet-cut.png` | Cüzdanla | his simple frayed rope collar |
| 3 | `sans-sleep-rope-scarf.png` | `sans-sleep-rope.png` | Uyuyan | his simple frayed rope collar |
| 4 | `sans-sit-leather-scarf.png` | `sans-sit-leather.png` | Oturan | his brown leather collar with its buckle and tag |
| 5 | `sans-wallet-leather-scarf.png` | `sans-wallet-leather.png` | Cüzdanla | his brown leather collar with its buckle and tag |
| 6 | `sans-sleep-leather-scarf.png` | `sans-sleep-leather.png` | Uyuyan | his brown leather collar with its buckle and tag |
| 7 | `sans-sit-silver-scarf.png` | `sans-sit-silver.png` | Oturan | his silver plate collar with its buckle and round tag |
| 8 | `sans-wallet-silver-scarf.png` | `sans-wallet-silver.png` | Cüzdanla | his silver plate collar with its buckle and round tag |
| 9 | `sans-sleep-silver-scarf.png` | `sans-sleep-silver.png` | Uyuyan | his silver plate collar with its buckle and round tag |
| 10 | `sans-sit-gold-scarf.png` (**pilot**) | `sans-sit-gold.png` | Oturan | his polished gold collar with its buckle and round tag |
| 11 | `sans-wallet-gold-scarf.png` | `sans-wallet-gold.png` | Cüzdanla | his polished gold collar with its buckle and round tag |
| 12 | `sans-sleep-gold-scarf.png` | `sans-sleep-gold.png` | Uyuyan | his polished gold collar with its buckle and round tag |
| 13 | `sans-sit-ruby-scarf.png` | `sans-sit-ruby.png` | Oturan | his gold collar set with small rubies and its round ruby pendant |
| 14 | `sans-wallet-ruby-scarf.png` | `sans-wallet-ruby.png` | Cüzdanla | his gold collar set with small rubies and its round ruby pendant |
| 15 | `sans-sleep-ruby-scarf.png` | `sans-sleep-ruby.png` | Uyuyan | his gold collar set with small rubies and its round ruby pendant |

- Her görselin yanına kullanılan komutla aynı adı taşıyan bir `-prompt.txt` kaydedilir (örnek: `sans-sit-gold-scarf-prompt.txt`).
- Mevcut dosyaların hiçbirinin üzerine yazılmaz.
- Denemeler `-v1`, `-v2` diye adlandırılır; seçilmeyenler sonunda silinir.

## 6. Poz komutları

`{COLLAR}` yerine tablodaki tarif yazılır. Referanslar: **Image 1** = tablodaki referans, **Image 2** = `art/pilot/02-poses/sans-scarf-src.png`, pilot onaylandıktan sonra **Image 3** = `art/pilot/05-scene/sans-sit-gold-scarf.png`. Image 3 verilince komutun sonuna şu cümle eklenir: *"Image 3 is an approved example of the same dog wearing this scarf: match its scarf shape, pattern, colour and the way the collar sits over it."*

### Oturan

> Precise edit. Image 1 is the edit target: the existing seated Şans dog sprite. Image 2 is a reference for a red bandana scarf only. Add the red scarf from image 2 to the dog: a warm red-orange cotton bandana with small white polka dots, tied around his neck with a small knot and two short ends at the front, the triangle hanging down over his white chest. It must wrap naturally AROUND the neck, following the neck's curve and volume, partly hidden behind the fur at the sides, with soft fabric folds and the same lighting and shading as the dog, so it looks worn, not pasted on. Keep {COLLAR} exactly as it is, worn OVER the scarf: the collar band sits on top of the scarf at the neck and its tag/pendant hangs in front of the scarf, both clearly visible. Preserve EVERYTHING else exactly: identity, face, expression, head tilt, asymmetrical ears, fur colours and strands, seated pose, paws, tail, proportions, camera angle, framing, semi-3D illustrated style and silhouette. One real quadruped dog, full body, small clear margins. True transparent alpha background, no floor, shadow, scenery, text or extra objects. Keep the original aspect ratio.

### Cüzdanla

> Precise edit. Image 1 is the edit target: the existing Şans dog sprite trotting with a brown wallet in his mouth. Image 2 is a reference for a red bandana scarf only. Add the red scarf from image 2 to the dog: a warm red-orange cotton bandana with small white polka dots, tied around his neck with a small knot, the triangle hanging under his chin over his chest and swinging slightly with his trot. It must wrap naturally AROUND the neck in this pose's angle, partly hidden behind the fur, with soft folds and the same lighting as the dog, so it looks worn, not pasted on. It must not cover the wallet. Keep {COLLAR} exactly as it is, worn OVER the scarf: the collar band on top of the scarf at the neck, its tag/pendant hanging in front, both clearly visible. Preserve EVERYTHING else exactly: identity, face, happy expression, ears, fur, trotting pose, raised tail, paws, the same wallet, proportions, camera angle, framing, semi-3D illustrated style and silhouette. One real quadruped dog, whole body, wallet, ears, tail and paws inside the frame with small margins. True transparent alpha background, no floor, shadow, scenery, text or extra objects. Keep the original aspect ratio.

### Uyuyan

> Precise edit. Image 1 is the edit target: the existing sleeping, curled-up Şans dog sprite. Image 2 is a reference for a red bandana scarf only. Add the red scarf from image 2 to the dog: a warm red-orange cotton bandana with small white polka dots, tied around his neck, the knot and the visible part of the triangle resting softly on his neck and chest as he sleeps, partly tucked under his chin and fur. It must follow the curled pose naturally, with soft folds and the same lighting as the dog, so it looks worn, not pasted on. Keep {COLLAR} exactly as it is, worn OVER the scarf and still visible. Preserve EVERYTHING else exactly: identity, closed eyes, face, coat, anatomy, curled sleeping pose, proportions, camera, lighting, semi-3D illustrated style and silhouette. One sleeping quadruped dog. True transparent alpha background, no floor, shadow, halo, text or extra objects. Keep the original aspect ratio.

## 7. Bitince

15 dosyanın listesini ver; beğenmediğin ya da emin olmadığın görselleri belirt. Kod, kesim ve webp işi yok; onları Claude yapacak.

**Kapsam dışı:** okşama pozları (`hero-*-pet-sans`, 7 kıyafet). Onlarda Şans hep ip tasmalı ve fularsız; ayrı bir çözüm konuşulacak ([discussion-notes.md §1](../discussion-notes.md)).
