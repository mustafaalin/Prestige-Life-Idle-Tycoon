# Lumen — görsel teslimi

2026-10-17. A hafif fütüristik yönünde **46 yeni seçili kaynak PNG** hazır. İlk kapsül oda A ile toplam 47 kaynak. Bu belge kesim/WebP/runtime entegrasyonu için Claude Code’a teslimdir; oyun koduna dokunulmadı.

## Seçim ve üretim kuralları

- Evlerin tamamı farklı mahallelerle yenilendi. İlk serideki aynı ikiz yeşil kule ufku kullanılmıyor. Kapsül oda A ilk seçili ev olarak korunuyor.
- A bir mekân şablonu değil, yakın gelecek ve sıcak yarı3D görsel dilidir. Tekne evde kıyı/depolar, ortak yaşamda kapalı avlu, konteynerde atölyeler, aile evinde meyve bahçeleri, üst evlerde zeytinlik/çamlık/açık deniz/uzaktan çatı dokusu var.
- On yönetici insan; ayrı yaş, saç, ten ve iş aksesuarıyla tasarlandı. Çiftçinin fırıncıya benzeyen ilk yüzü yenilendi.
- Beş araç bağımsız gövde/jant tasarımlarıyla yenilendi. Pikap, keşif aracı ve grand tourer oranı daraltmak için daha önden gösteriliyor.
- Her seçili PNG yanında `-prompt.txt` vardır. Düzenleme komutları `-correction-prompt.txt`; yeşil balkonlu daire için son kadraj düzeltmesi `-correction-2-prompt.txt` dosyasındadır. İlk komut ve son düzeltme birlikte üretim kaydıdır.
- **Seçili dosyalar tablodaki sürüm eksiz adlardır.** `-v1`, `-v2`, `-v3` dosyaları denemelerdir, otomatik glob ile oyuna alınmamalı.

## Seçili kaynaklar

Tablodaki yollar `art/pilot/17-lumen/` altındadır. İlk ev ayrıca `art/pilot/05-scene/lumen-home-1-a.png` (941×1672). Çiçek Tezgâhı ikonu mevcut `public/assets/businesses/v2/flower-stand.webp` dosyasından kullanılacak; yeniden üretilmedi.

| Tür | Dosya | Doğal boyut |
| --- | --- | --- |
| Yönetici | `manager-flower-stand.png` | 1254×1254 |
| Yönetici | `manager-coffee-bar.png` | 1254×1254 |
| Yönetici | `manager-repair.png` | 1254×1254 |
| Yönetici | `manager-scooter.png` | 1254×1254 |
| Yönetici | `manager-farm.png` | 1254×1254 |
| Yönetici | `manager-vr.png` | 1254×1254 |
| Yönetici | `manager-drone.png` | 1254×1254 |
| Yönetici | `manager-solar.png` | 1254×1254 |
| Yönetici | `manager-biotech.png` | 1254×1254 |
| Yönetici | `manager-ai.png` | 1254×1254 |
| Ev | `lumen-home-2-houseboat.png` | 941×1672 |
| Ev | `lumen-home-3-coliving.png` | 941×1672 |
| Ev | `lumen-home-4-container.png` | 941×1672 |
| Ev | `lumen-home-5-green-flat.png` | 941×1672 |
| Ev | `lumen-home-6-complex.png` | 941×1672 |
| Ev | `lumen-home-7-modular.png` | 941×1672 |
| Ev | `lumen-home-8-family.png` | 940×1672 |
| Ev | `lumen-home-9-villa.png` | 941×1672 |
| Ev | `lumen-home-10-hilltop.png` | 941×1672 |
| Ev | `lumen-home-11-seafront.png` | 941×1672 |
| Ev | `lumen-home-12-sky.png` | 941×1672 |
| İşletme | `biz-coffee-bar.png` | 1254×1254 |
| İşletme | `biz-repair.png` | 1254×1254 |
| İşletme | `biz-scooter.png` | 1254×1254 |
| İşletme | `biz-farm.png` | 1254×1254 |
| İşletme | `biz-vr.png` | 1254×1254 |
| İşletme | `biz-drone.png` | 1254×1254 |
| İşletme | `biz-solar.png` | 1254×1254 |
| İşletme | `biz-biotech.png` | 1254×1254 |
| İşletme | `biz-ai.png` | 1254×1254 |
| Araç | `lumen-vehicle-1.png` | 1254×1254 |
| Araç | `lumen-vehicle-2.png` | 1254×1254 |
| Araç | `lumen-vehicle-3.png` | 1536×1024 |
| Araç | `lumen-vehicle-motorcycle.png` | 1536×1024 |
| Araç | `lumen-vehicle-4.png` | 1536×1024 |
| Araç | `lumen-vehicle-5.png` | 1536×1024 |
| Araç | `lumen-vehicle-pickup.png` | 1536×1024 |
| Araç | `lumen-vehicle-6.png` | 1536×1024 |
| Araç | `lumen-vehicle-7.png` | 1536×1024 |
| Araç | `lumen-vehicle-8.png` | 1536×1024 |
| Araç | `lumen-vehicle-9.png` | 1536×1024 |
| Araç | `lumen-vehicle-10.png` | 1536×1024 |
| Lüks | `lumen-luxury-1-hydrofoil.png` | 1536×1024 |
| Lüks | `lumen-luxury-2-solar-yacht.png` | 1536×1024 |
| Lüks | `lumen-luxury-3-helicopter.png` | 1536×1024 |
| Lüks | `lumen-luxury-4-jet.png` | 1536×1024 |

## Kontrol ve entegrasyon

- 46 seçili PNG/komut çifti dosya düzeyinde doğrulandı. Makine listesi `art/pilot/17-lumen/manifest.json`.
- 9 işletme ikonunun gerçek alfa kanalı ve alfa aralığı 0–1 doğrulandı. 76 px koyu zemin önizlemesinde işlev/siluet ayrımı kontrol edildi. Yuvarlak portreler için 56 px önizleme incelendi.
- Evlerin alt yaklaşık %45’i boş zemin olarak değerlendirildi. Tekne ev, konteyner, balkonlu daire ve çatı malikânesinin kadrajı ayrıca düzeltildi. Yüzde konumları üretim hedefidir; gerçek telefonda UI/karakter/araçla yerleşim son kontrolü gerekir.
- Araç ve lükslerin tamamı kadrajda, burunları sağa dönük; genişlik sınırı dar olan üç araç daha önden. Kesim yapılmadığı için kesin alfa-siluet genişlik/yükseklik ölçümü Claude tarafından kesimden SONRA yapılmalı. Kaynak tuval oranı, araç siluet oranı değildir.
- Evler 940 veya 941×1672; 1536 genişliğinde değiller. 1080 px WebP gerekiyorsa büyütülecek. Doğal çıktı korunmuştur. Portre/ikonlar 1254 kare, bisiklet/moped 1254 kare, diğer araç/lüksler 1536×1024.
- Açık gövdeli araç/lükslerde gri kesim toleransı ve beyaz gövdeyi koruma kontrolü gerekir; iç pencere, tekerlek arası, rotor ve hidrofil aralıkları kontrol edilmeli. Şeffaf işletmelerin kenarlarını açık/koyu zeminde incele.
- Kaynak ile runtime durumunu karıştırma: bu çalışma `public/assets` veya kod bağlantılarını değiştirmedi.

Hedefler: yönetici portreleri 256 px WebP `public/assets/managers/lumen/`; evler 1080 px genişlik `public/assets/scene/lumen-home-N.webp`; işletme ikonları 384 px alfa WebP; araç/lüksler mevcut kesim akışıyla. `stages.ts` ve araç oranları, telefon/sahne laboratuvarında sınanmalı.

## Önizlemeler

- `art/pilot/reviews/lumen-managers-preview.jpg`
- `art/pilot/reviews/lumen-homes-preview.jpg`
- `art/pilot/reviews/lumen-businesses-preview.jpg`
- `art/pilot/reviews/lumen-vehicles-preview.jpg`
- `art/pilot/reviews/lumen-luxury-preview.jpg`
- `art/pilot/reviews/lumen-managers-56px.png`
- `art/pilot/reviews/lumen-businesses-76px.png`

Görseller yerelde kayıtlıdır. Önceden reddedilen geniş Google Drive aktarımı bu çalışmada tekrar denenmedi.
