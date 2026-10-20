# Uygulama ikonu adayları — 2026-10-17

İki aday built-in imagegen ile üretildi. Ana uygulama ikonu henüz değiştirilmedi.

- A: `art/store-v2/icon-a-ride.png` — kahraman ve Şans, sadeleştirilmiş turuncu araba, gözlüksüz ifade, altın tasma ve kırmızı fular.
- B: `art/store-v2/icon-b-lucky.png` — Şans ve yıldızlı altın para, mor/altın fon, altın tasma ve kırmızı fular.
- Her adayın `-512.png` sürümü, yerel üretim çözünürlüğündeki `-source.png` dosyası ve üretim/düzeltme metinlerini içeren `-prompt.txt` dosyası yanında bulunur. Ana adaylar 1024×1024, küçültülmüş sürümler 512×512 sRGB PNG'dir.
- Küçük boyut karşılaştırması: `art/pilot/reviews/store-icons-small-preview.png`. Üst sıra A, alt sıra B; soldan sağa 32, 48, 64 px.

Görsel değerlendirme: iki adayda yüzler 48 px'de seçiliyor; B tek özne sayesinde daha hızlı okunuyor. A oyunun insan hikâyesi ve Şans ile bağlılık temasını daha iyi taşıyor ve birincil öneri olmaya devam ediyor. 32 px'de tasma gibi ince detaylar kayboluyor. Önemli yüzler merkezde; bütün saç/kulak silueti merkez yüzde 70 daireye sığmıyor. Bu adaylar APK adaptive-icon foreground olarak doğrudan kullanılmadan önce ayrı maske kontrolü gerektirir.

Seçimden sonra Claude mevcut ana dosyayı arşivleyip seçileni `icon-1024.png` / `icon-512.png` olarak bağlayabilir. Bu çalışmada runtime ve Android kaynakları değiştirilmedi.
