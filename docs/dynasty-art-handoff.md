# Devir görselleri — tasarım teslimi

2026-10-16. `art-prompts-dynasty.md` kapsamı tamamlandı: 15 seçili kaynak PNG. Ada'nın 7 ve 17 yaş kılavuzları ayrı. Her dosyanın yanında aynı kökten `-prompt.txt` bulunur. Kod, kesim ve WebP entegrasyonu bu çalışmada yapılmadı.

## Seçili dosyalar

| Kaynak (`art/pilot/` altında) | Doğal boyut | Kullanım |
| --- | --- | --- |
| `16-dynasty/grandpa-sheet.png` | 1536×1024 | Dede: happy, soft, determined, worried |
| `16-dynasty/defne-old-sheet.png` | 1536×1024 | Yaşlı Defne: smile, shy, surprised, laugh |
| `16-dynasty/elif-sheet.png` | 1536×1024 | Elif: smile, teary, surprised, laugh |
| `16-dynasty/ada-17-sheet.png` | 1536×1024 | Varis: smile, determined, surprised, laugh |
| `16-dynasty/ada-7-sheet.png` | 1536×1024 | Çocuk Ada; 17 yaş portreleriyle karıştırılmayacak |
| `16-dynasty/grandpa-idle.png` | 887×1774 | Dede bekleme |
| `16-dynasty/grandpa-joy.png` | 887×1774 | Dede sevinç |
| `16-dynasty/grandpa-pet.png` | 1024×1536 | Altın tasmalı Şans'ı okşama |
| `10-life/life-grandchild.png` | 941×1672 | 63 yaş: torunun doğumu |
| `10-life/life-grandpa.png` | 941×1672 | 70 yaş: Ada 7 ile çiçek tezgâhı |
| `10-life/life-handover.png` | 941×1672 | 80 yaş: Ada 17'ye saat teslimi |
| `12-icons/heirloom-watch.png` | 1254×1254 RGBA | Mehmet'in saati |
| `12-icons/heirloom-jam.png` | 1254×1254 RGBA | Erik reçeli |
| `12-icons/heirloom-notebook.png` | 1254×1254 RGBA | Rıza Amca'nın defteri |
| `12-icons/heirloom-collar.png` | 1254×1254 RGBA | Şans'ın tasması |

`12-icons/family-album.png` mevcut görselden kullanılacak. Eski birleşik `16-dynasty/ada-sheet.png` ve `10-life/life-handover-v1.png` seçili değil; yalnızca deneme kaydıdır. Yaşlı Defne'nin seçili PNG'sinde son düzeltme komutu `defne-old-sheet-correction-prompt.txt` ile kaydedilmiştir.

## Görsel kontrol ve sınırlar

- Yarı 3D hacim, sıcak ışık, karakter yüzleri/kıyafetleri ve Şans'ın altın tasması kontrol edildi. Hikâye karelerindeki görünen eller ayrıca yakın planda incelendi.
- Saat altın kasa, krem kadran, kahverengi deri kayışla sürer. Devir karesinde tek saat Ada'nın avucundadır; dedenin ve Ada'nın bilekleri boştur.
- Ada 7: iki kısa kuyruk, sarı tişört, kot tulum, saat yok. Ada 17: yüksek at kuyruğu, kot ceket, beyaz tişört, siyah kot, kırmızı ayakkabı, sırt çantası.
- Hikâye karelerinin alt yaklaşık %35'i sakin konuşma alanıdır. Saat ve yüzler bunun üstündedir. `life-handover-v1` bu alanı yeterince korumadığı için yeniden üretildi.
- Dört ikonun alfa aralığı 0–1 olarak doğrulandı; 56 px koyu zemin önizlemesinde siluetleri okunuyor. Önizlemeler kaynak PNG'yi değiştirmez.
- Doğal üretim boyutları korunmuştur. Hikâye kareleri istenen 1536 px genişliğin altında, 941 px genişliktedir. P3'te eğilmiş karakter yaklaşık 1380 px yüksekliğindedir; 1500 px hedefini karşılamaz. Yapay büyütmeyle ayrıntı iddiası yapılmadı.
- Gerçek telefon, 19.5:9 kırpma ve 112 px konuşma portresiyle son kontrol entegrasyon sırasında yapılmalı. Kareler için ek ortak zoom uygulamadan başlanmalı.

## Claude Code entegrasyonu

1. Kılavuzlardan portreleri `public/assets/story/portraits/{grandpa,defne-old,elif,ada}-<ifade>.webp` olarak kes; baş ölçeğini ve göz hizasını ifadeler arasında eşitle. Ada için 17 yaş sayfasını kullan.
2. Dede pozlarını açık gri zeminden kes; ayakkabılar, gözlük ve kol–gövde boşluklarını kontrol et. `public/assets/scene/hero-grandpa-{idle,joy,pet-sans}.webp`; `stages.ts` içindeki `GRANDPA_ART` bağlantıları.
3. Üç hayat karesini `public/assets/story/life/{grandchild,grandpa,handover}.webp` olarak bağla. 1080 px genişlik gerekirse bunun kaynak büyütmesi olduğunu dikkate al. `lifeScript.ts` / `PANELS_TO_COME` ve portre bekleme listelerini güncelle.
4. Yadigâr ikonlarını alfa korunarak 256 px WebP'ye dönüştür; `FamilyScreen.tsx` içindeki kutulara bağla. Aile albümü mevcut ikondan.
5. Telefonda konuşma balonu, portre, odak noktası ve alt boşluğu kontrol et. Runtime entegrasyonunu bu belgedeki kaynak üretim durumundan ayrı kaydet.

## Önizlemeler

- `art/pilot/reviews/dynasty-story-preview.jpg`
- `art/pilot/reviews/dynasty-heirlooms-preview.jpg`

## Yedek durumu

`npm run backup` 2026-10-16 tarihinde otomatik onay incelemesi tarafından reddedildi; Drive yedeği alınmadı. Gerekçe: komut `art`, `gpt-astra-inceleme` ve `rich inc oyun görselleri` klasörlerini sahipliği doğrulanmamış Google Drive hedefine topluca aktarıyor; bu hedef ve kapsam için açık yetkilendirme yetersiz bulundu. Yerel PNG'ler ve komut dosyaları tamamdır.
