# Şans fular seti — görsel teslimi

Tarih: 2026-10-15. Tamamlandı: **15/15** (onaylı pilot + 14 yeni varyant). Yerleşik imagegen ile her mevcut tasma/poz kaynağı ayrı düzenlendi. Her istekte üçüncü referans onaylı `sans-sit-gold-scarf.png` pilotuydu. İkinci referans `sans-scarf-src.png`; birinci referans görev tablosundaki özgün tasma/poz kaynağı.

Kod, mevcut kaynaklar, kesim ve WebP dosyaları değiştirilmedi. Okşama pozları kapsam dışı. Bütün çıktılar `art/pilot/05-scene/` altında; her PNG yanında aynı köklü `-prompt.txt` bulunur.

## Dosya listesi

| PNG | Boyut | Durum |
|---|---|---|
| `sans-sit-rope-scarf.png` | 1007×1562 | Hazır |
| `sans-wallet-rope-scarf.png` | 1207×1303 | Hazır |
| `sans-sleep-rope-scarf.png` | 1536×1024 | Hazır |
| `sans-sit-leather-scarf.png` | 1007×1562 | Hazır |
| `sans-wallet-leather-scarf.png` | 1208×1302 | Hazır |
| `sans-sleep-leather-scarf.png` | 1536×1024 | Hazır |
| `sans-sit-silver-scarf.png` | 1007×1562 | Hazır |
| `sans-wallet-silver-scarf.png` | 1208×1302 | Hazır |
| `sans-sleep-silver-scarf.png` | 1881×836 | Hazır |
| `sans-sit-gold-scarf.png` | 1007×1562 | Onaylı pilot |
| `sans-wallet-gold-scarf.png` | 1208×1302 | Hazır |
| `sans-sleep-gold-scarf.png` | 1536×1024 | Hazır |
| `sans-sit-ruby-scarf.png` | 1007×1562 | Hazır |
| `sans-wallet-ruby-scarf.png` | 1208×1302 | Hazır |
| `sans-sleep-ruby-scarf.png` | 1882×836 | Hazır |

## Görsel kontrol

- Tasma türü, poza özgü yüz ifadesi, kulaklar, cüzdan ve uyku duruşu referanslarla görsel olarak karşılaştırıldı. Fular boynu sarıyor; tasma kumaşın üstünde, mevcut künye/taş önde görünür.
- 15 dosyada alfa kanalı ve saydam dış alan doğrulandı. Açık ve koyu yüzeye bindirilmiş önizlemelerde zemin, geniş halo veya döşenmiş gölge görülmedi. Bazı üretim çıktılarındaki uç dış piksellerde 1/255 alfa bulunabilir; mekanik kesim/kenar temizliği bu teslimde yapılmadı.
- Kaynak oranıyla fark en çok %0,23: üretim aracının tam sayı piksel yuvarlaması. Görseller gerilmedi veya yeniden kırpılmadı.
- İp tasmalı iki eski kaynak düşük çözünürlüklü ve daha sade çizilmiş; yeni çıktılar daha yüksek çözünürlükte olduğundan ince kürk çizgileri kaynakla piksel düzeyinde aynı değil. Bu ikisi entegrasyon öncesi özgün kaynakla yan yana son kontrol için işaretlendi. Genel ifade ve poz korunuyor.
- Uyuyan pozlarda üçgenin tamamının görünmemesi bilinçli: kumaş çene ve ön ayak arkasına giriyor. Kırmızı kumaş ve tasma görünür. Yakut sarkıtın kırmızı kumaşla ayrımını altın çerçeve taşıyor; gerçek telefon ölçeğinde son kontrol Claude tarafında.
- Bunların dışında yeniden üretim gerektiren belirgin bir hata saptanmadı. Oyun içi yerleşim testi yapılmadı.

## Önizlemeler

Satırlar: ip, deri, gümüş, altın, yakut. Sütunlar: oturan, cüzdanlı, uyuyan.

- `art/pilot/reviews/sans-scarf-light-preview.jpg`
- `art/pilot/reviews/sans-scarf-dark-preview.jpg`

## Claude için

Kaynaklar tablodaki dosyalar. WebP hedefleri görevdeki gibi `public/assets/scene/sans-{sit,wallet,sleep}-{rope,leather,silver,gold,ruby}-scarf.webp`. Tasma ve fular sahipliğine göre doğru varyantı seçme, eski fular bindirmesini kaldırma ve oyun içi ölçek kontrolü Claude'un işi. Yeni koda veya varlık eşlemesine bu teslimde müdahale edilmedi.

[Tamamlanan görev ve tam prompt şablonları](./gpt-sans-scarf-task.md).
