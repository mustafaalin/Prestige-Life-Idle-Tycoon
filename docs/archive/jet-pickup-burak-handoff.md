# Jet, bordo pikap ve Burak B1 — kaynak teslimi

2026-10-17. Üretim sırasının ilk iki işi ve Burak B1 kılavuzu hazır. B1 kullanıcı onayında; B2/B3 ve Ada’nın 55 görseli henüz üretilmedi. Runtime/kod değişmedi.

| Kaynak | Doğal boyut | Durum |
| --- | --- | --- |
| `art/pilot/10-life/life-jet-family.png` | 941×1672 | Dört kişi ve uyuyan Şans; anne pencere kenarında, kutu Defne’de |
| `art/pilot/17-lumen/lumen-vehicle-pickup.png` | 1536×1024 | Bordo, açık kasalı; seçili yeni pikap |
| `art/pilot/16-dynasty/burak-sheet.png` | 1536×1024 | Tek görünüm, üç tam boy ve smile/smug/cold/shaken; kullanıcı onayı bekliyor |

Her kaynak yanında `-prompt.txt` var. Pikap ve Burak’ın son düzeltmeleri ayrıca `-correction-prompt.txt` dosyalarında. Jetin karakter referans panosu `art/pilot/reviews/jet-family-cast-reference.png`; yalnız referans amacıyla birleştirildi. Görünen eller yakın planda kontrol edildi.

Pikap: bir kez öne çevirme düzeltmesi yapıldı; açık kasa, iki sandık ve branda korunuyor. Yaklaşık siluet genişlik/yükseklik oranı 1,6, hedef 1,49; kesin kesim oranı ve gerçek sahne uyumu Claude tarafından kontrol edilmeli. Daha önden açı kasayı gizleme riski taşıyor. Önceki yeşil seçili dosya `lumen-vehicle-pickup-before-burgundy.png`; ilk bordo deneme `lumen-vehicle-pickup-burgundy-v1.png`. Bu denemeler oyuna bağlanmayacak.

Jet: 1080 genişlik WebP’ye çevrilirken 941 px kaynaktan büyütüldüğü dikkate alınmalı. `public/assets/story/life/jet.webp` ve `lifeScript.ts` içindeki `picture('jet')` bağlantısı Claude’da.

Burak onaylanınca B2 ortaklık ve B3 kazık karelerinde bu kılavuz kullanılacak. Ardından Ada seti belgede yazan sırayla ilerleyecek; her yeni kıyafetin kılavuzu pozlarından önce onaylanacak.
