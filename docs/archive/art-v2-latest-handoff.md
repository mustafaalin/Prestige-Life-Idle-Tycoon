# Yeni görsel teslimi — 2026-10-13

Bu tur: 8 kahraman portresi, 1 atölye tören karesi, 4 lüks araç, 1 önsöz stil denemesi. Yerleşik imagegen kullanıldı. Her kaynağın yanında kullanılan `-prompt.txt` bulunur. Runtime dosyaları değiştirilmedi.

**Entegrasyon (Claude, 2026-10-13):** portreler, atölye karesi ve dört lüks oyunda; önsöz denemesi kullanıcı kararını bekliyor. Portreler 900 px'e kırpılarak (baş oyundaki setlerle aynı ölçekte) 240 px'e indirildi; lüksler `FUZZ=3.5 PALE=1 scripts/cutout-vehicle.sh` ile kesildi. Ayrıntı: [session-handoff.md](../session-handoff.md) "Son oturum".

## Portreler

Kaynaklar 1024×1024 PNG:

- `art/pilot/13-portraits/hero-smart-worried.png`
- `art/pilot/13-portraits/hero-smart-soft.png`
- `art/pilot/13-portraits/hero-smart-determined.png`
- `art/pilot/13-portraits/hero-smart-happy.png`
- `art/pilot/13-portraits/hero-suit-worried.png`
- `art/pilot/13-portraits/hero-suit-soft.png`
- `art/pilot/13-portraits/hero-suit-determined.png`
- `art/pilot/13-portraits/hero-suit-happy.png`

Claude'un baş ölçeği/saç/yaka değerlendirmesine göre üretildi: şık günlük endişeli portre kadrajı düzeltilerek setin sabit referansı yapıldı. Diğer ifadelerde yalnız yüz ifadesi değiştirildi. Takım elbiseli set de aynı kadrajdan türetildi. Baş dik ve tam önden; saç silueti, baş ölçeği ve yaka set içinde görsel olarak karşılaştırıldı. Hedef saç tepesinden çeneye yaklaşık %80 baş yüksekliği; ifadenin çeneyi hareket ettirmesi nedeniyle piksel düzeyinde birebir eşitlik iddiası yok. Şık günlükte gri lapel/krem yuvarlak yaka, takımda lacivert lapel/beyaz açık gömlek yakası ayrımı korunuyor. Yarı 3D boyama dili için kahraman kılavuzu birincil referans.

Önizlemeler:

- `art/pilot/reviews/hero-smart-suit-expressions-preview.jpg`
- `art/pilot/reviews/hero-smart-suit-circle-112-preview.png` — kaynaklara aynı daire maskesi uygulanmış önizleme; ayrı kadraj düzeltmesi uygulanmadı.

Önceki iş kıyafeti teslimi `hero-work-{worried,soft,determined,happy}-v2.png`; Claude bu dördünü oyuna alırken ayrı kırparak eşitlediğini bildirdi. Bu tur o entegrasyona dokunulmadı.

Claude: 240×240 WebP'ye dönüştür; tören sahnesinin gerçek kıyafetini seç. Hayat anı ve geri dönüşleri son kıyafetle otomatik ezme. Son kontrol gerçek 112 px yuvarlak avatar ve telefon ekranında yapılmalı.

## Atölye

`art/pilot/07-story/c6-workshop.png` — yerel üretim boyutu 941×1672. Rıza solda, takım elbiseli kahraman sağda, iki anahtar üst bölümde; alt yaklaşık %35 sessiz ahşap zemin. Tam iki kişi, köpek/yazı yok. Rıza'nın ve kahramanın kıyafetleri kılavuzlardan alındı. `public/assets/story/ceremony/workshop.webp`, 6. tören ve albüm için kaynak. Kadraj telefonun konuşma balonuyla kontrol edilmeli.

## Lüks araçlar

1536×1024 PNG, açık gri zemin; alpha üretimi değil, arka plan ayırma gerektirir:

- `art/pilot/14-luxury/speedboat.png`
- `art/pilot/14-luxury/mega-yacht.png`
- `art/pilot/14-luxury/private-helicopter.png`
- `art/pilot/14-luxury/private-jet.png`

Hepsi sağa dönük; bütün gövde/kanat/rotor kadrajda. Su, insan, logo/yazı yok. Tekne/yat tamamı görünen showroom nesnesi. Ortak stil referansları mevcut Grand Lüks ve hatchback görselleri; her nesne ayrı kompozisyonla üretildi, diğer lüks görsellerden kopyalanmadı. Belgede belirtilen `art/pilot/09-vehicles/vehicle-10.png` bulunmadığı için ilk referans olarak oyundaki `public/assets/vehicles/v2/vehicle-10.webp` kullanıldı.

Claude: arka planı ayırıp `public/assets/vehicles/v2/luxury-<ad>.webp` olarak `TOYS` eşlemesine bağla. Bu teslim mağaza görselidir; sahne uçuş/park animasyonu değildir.

## Önsöz karşılaştırması

`art/pilot/04-prologue/prologue-4-door-3d.png` — yerel üretim boyutu 941×1672. Prompt daha yüksek çözünürlük istedi ancak araç bu boyutta çıktı verdi; yapay büyütme uygulanmadı. Mevcut `prologue-4-door.png` ile karşılaştırmak için deneme: anne solda, kahraman sağda, iki bavul, soldaki bavul üstünde kırmızı kurdeleli beyaz pasta kutusu ve mevcut kapı/merdiven düzeni korunuyor. Yeni 3D film dili uygulanmış; yerleşim görsel olarak yakın, birebir piksel eşleşmesi iddiası yok. Diğer beş önsöz karesi bu tur üretilmedi.

Bu tek deneme kullanıcı stil kararı içindir; mevcut önsöz karesini otomatik değiştirme.
