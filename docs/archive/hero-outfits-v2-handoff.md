# Kahraman: yeni kıyafet görselleri teslimi

Tarih: 2026-10-14 · Üretim: yerleşik ImageGen · Kapsam: art-prompts-v2.md §9.

[24 görselin önizlemesini aç](./hero-outfits-v2-preview.html).

## Kılavuz incelemesi

`art/pilot/01-hero-sheet/A1-semi3d.png` kimlik referansı; mevcut `outfit-4-sheet.png` yetişkin yüz ve gövde referansı olarak incelendi. Kahramanın kimliğini taşıyan özellikler büyük kahverengi gözler, kalın koyu kaşlar, yana açılan koyu kahverengi saç tutamları, belirgin kulaklar, uzun ve dar yüz, yumuşak burun ve ince uzun gövdedir. Sıcak ten rengi, küçük kapalı gülümseme ve kaşların ifade değişimi korunmalıdır. Yeni kıyafetlerde sakal, yaşlanma, kaslı gövde veya farklı saç kesimi eklenmedi.

Ana kılavuz çizgisel kenarlar içerirken mevcut takım seti daha yumuşak hacimlidir. Yeni set mevcut takım setinin yarı 3D görünümünü izler. Kumaş ve ciltte üretimin getirdiği ince doku vardır; tamamen dokusuz bir render olduğu iddia edilmez.

Şans referansında kum rengi dağınık tüy, beyaz göğüs/ağız, büyük kahverengi gözler ve bir bükük kulak kimliği incelendi. Poz referansı mevcut `hero-4-pet.png`; köpek solda, kahraman sağda çömelir, bir el başı okşar ve diğer el dizde durur.

## Seçili dosyalar

| Kıyafet | Kılavuz | Pozlar | Portreler |
| --- | --- | --- | --- |
| Palto | `art/pilot/08-outfits/outfit-5-sheet.png` | `hero-5-idle.png`, `hero-5-joy.png`, **`hero-5-pet-v2.png`** (aynı klasör) | `art/pilot/13-portraits/hero-coat-{worried,soft,determined,happy}.png` |
| Üç parçalı | `art/pilot/08-outfits/outfit-6-sheet.png` | `hero-6-{idle,joy,pet}.png` (aynı klasör) | `art/pilot/13-portraits/hero-threepiece-{worried,soft,determined,happy}.png` |
| Smokin | **`art/pilot/08-outfits/outfit-7-sheet-v2.png`** | `hero-7-{idle,joy,pet}.png` (aynı klasör) | `art/pilot/13-portraits/hero-tux-{worried,soft,determined,happy}.png` |

24 seçili görsel + 2 ilk deneme = 26 kaynak PNG. İlk denemeler karşılaştırma için korundu; palto pet ve smokin kılavuzunda yukarıdaki v2 dosyalarını kullanın.

Her PNG'nin yanında aynı gövde adıyla `-prompt.txt` bulunur. §9'daki komutlar ayrı görsellere uygulanmıştır; dört portre isteyen paragraf her çağrıda yalnızca ilgili ifadeyi üretme talimatıyla daraltılmıştır. Smokin pozları/portrelerinde tek düğme ve sivri saten yaka ayrıca vurgulanmıştır. Düzeltme promptları `hero-5-pet-v2-prompt.txt` ve `outfit-7-sheet-v2-prompt.txt` dosyalarında.

## Görsel kontrol ve düzeltmeler

Her çıktı tek tek açılıp yüz kimliği, kıyafet, poz, kol/el sayısı, saat tarafı, ayakkabıların kadrajda kalması, Şans'ın ölçeği ve ifade yönü incelendi.

- Palto setinde açık deve tüyü palto, siyah balıkçı yaka, kömür grisi pantolon, kahverengi Chelsea bot ve sol bilekte gümüş saat var. Pet ilk üretimde altın künye verdi; v2'de deri tasmanın künye ve halkası gümüşe düzeltildi.
- Üç parçalı takımda kömür grisi açık ceket ve yelek, açık mavi gömlek, bordo kravat/mendil, altın kol düğmeleri, sol bilekte altın saat ve kahverengi loafer var.
- Smokin ilk kılavuzunda ikinci düğme vardı; v2'de tek düğmeye düzeltildi ve sonraki üretimler bu kılavuzu kullandı. Siyah papyon, beyaz mendil, saten yaka ve siyah ayakkabı korundu.

## Teknik teslim sınırları

Bunlar **kaynak PNG** teslimidir. Oyun kodu, fiyatlar, sınıf kilitleri, tören kıyafetleri ve runtime dosyaları değiştirilmedi. Üretim boyutları aracın verdiği boyutlardır; prompttaki 2400×1800 / 1024×1024 değerlerine birebir uyulduğu varsayılmamalı.

Kaynaklarda gri arka plan hafif ton değişimi içeriyor; kusursuz sabit #d9d9d9 değildir. Şeffaf sprite teslimi yapılmadı. Runtime için arka plan kesimi, kenar/ayakkabı kontrolü, taban hizalama, ölçekleme ve WebP dışa aktarımı gerekir. Portrelerde daire kırpması telefon boyutunda kontrol edilmeli; smokin portreleri palto/üç parçalı portrelerden biraz daha fazla yaka gösteriyor.

Sahne ve telefon üzerinde entegrasyon testi yapılmadı. Önsözün diğer kareleri bu turun kapsamı değildir; belgede stil kararı bekliyor ve §5–7'nin kaynakları zaten mevcut.
