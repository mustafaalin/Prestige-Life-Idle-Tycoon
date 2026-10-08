# Tartışma notları (sonra konuşulacak)

Kararı henüz verilmemiş konular ve Claude'un önerileri. **Karar verilince ilgili belgeye (plan, hikâye, tasarım, monetizasyon) taşınır ve buradan silinir**; burada sadece açık konular durur.

Son güncelleme: 2026-10-08 (temizlendi: görsel yaklaşım, konut modeli, ömür modeli, tempo, aylık gelir, ana ekran ve monetizasyon kararları ilgili belgelere taşındı)

## 1. Görsel: açık kalanlar

Görsel roman yaklaşımı ve yarı 3D stil kararlaştırıldı ([story-v2.md §8](./story-v2.md)). Açık kalanlar:

- **Özel anlar için video (isteğe bağlı, sonra):** "Eski evimizi geri aldım" gibi 2–3 büyük anda kısa yapay zekâ videosu. Yol: Higgsfield MCP (`claude mcp add --transport http higgsfield https://mcp.higgsfield.ai/mcp`, `/mcp` ile giriş; Kling 3.0, Seedance 2.0, Veo 3.1, Soul ID), yedek fal.ai. Her üretimden önce maliyet söylenir; kabul ölçütü kabul edilen bir animasyonun toplam maliyeti.
- **İskeletli 2D (Spine / Rive):** Oyun testi "karakter hareketi şart" demezse gerek yok.

## 2. Remotion (github.com/remotion-dev/remotion)

React ile kodla video üretme çerçevesi; yeni görüntü üretmez, var olanları düzenler. Bireyler ve en fazla 3 çalışanlı şirketler için ticari kullanım ücretsiz.

| Kullanım | Değer | Zaman |
| --- | --- | --- |
| Mağaza tanıtım videosu ve reklamlar (Play Store, TikTok, Reels; TR/EN, dikey/yatay) | Yüksek | Yayından önce (Faz 3) |
| Mağaza ekran görüntüleri (her dil ve cihaz boyutu) | Orta | Yayından önce |
| "Hayat hikâyen" paylaşım videosu | Deneysel | Faz 2+ |
| Oyun içi tören ve hikâye kartları | Düşük (oyun zaten React) | Gerekmez |

**Öneri:** Yayından önce repoda ayrı bir `video/` klasöründe tanıtım videoları için kurulsun.

## 3. Yaş ve ömür: açık ayrıntılar

Ana kurallar kararlaştırıldı ([game-design-v2.md §4.9](./game-design-v2.md)). Kalanlar:

- **Hikâye anlarında yaş dursun mu?** Öneri: tam ekran törende durur (1.10). Önsöz zaten oyun başlamadan oynar.
- **Ömür sonu uyarısı:** "65 yaşındasın, 32 yılın kaldı" gibi bir hatırlatma; zirveye ulaşmamış oyuncunun "sonu göremedim" hissi. Üst bar artık sadece yaşı gösteriyor ("kalan yıl" 2026-10-08'de kalktı).
- **En Zengin'den sonrası:** İçerik yok (kullanıcı: "ileride bakarız").
- **Gönüllü erken emeklilik:** Yok (kullanıcı: erken devir olmasın).

## 4. Faz 2.1 hanedan soruları ([story-v2.md §6](./story-v2.md))

1. **Varisin cinsiyeti.** Öneri: oyuncu seçsin (doğum sahnesinde tek seçim). Bütçe kısıtlıysa varis her zaman kız ("babasının izinden giden kız"), seçim sonra.
2. **2. neslin açılış sahnesi.** Öneri: küçük yurt odası veya kiralık oda, sokak değil. "Para yok ama ad var" Aile İtibarı ile örtüşür.
3. **2. nesil kıyafet ve poz seti.** Öneri: aynı yaşam aşaması sayısında yeni set; babadan kalan bir yadigâr (saat veya Şans'ın tasması) hep görünsün.
4. **Varis çok hızlı:** 1. ömür ~4.300 miras puanı (×43 gelir) bırakıyor; 2. nesil dakikalar içinde Multimilyoner. Miras formülüyle birlikte ele alınacak.

## 5. Ekonomi ayarı (kullanıcının gözlemleri, 2026-10-08; acil değil, sıradaki büyük konu)

Kullanıcı telefonda oynayınca: **"Ekonomi çok hızlı büyüyor. Çevrimdışı ödül miktarı çok fazla geldi. Kiralık evlerin bonusları fazla geldi."** Reklam ödülleriyle (çevrimdışı ×2, 1 saatlik ×2 hızlandırıcı, 15 dk gelir) ve kalıcı ×2 IAP'ıyla birlikte ayarlanmalı ([monetization-v2.md §4–5](./monetization-v2.md)).

Konuşmadan önce hazırlanacaklar:

- **Gerçek oynanış ile bot farkı:** Bot optimal oynuyor; kullanıcı ise hızlı buluyor. Hangi anlarda hızlı (ilk dakikalar mı, ilk dönüş mü, ev alımları mı) birlikte bakılacak.
- **Çevrimdışı:** Tavan artık sınıfla büyüyor (10 dk → 2 sa) ama 3 dk oynayıp dönen oyuncu yine ~$27K buluyor (cebindeki paranın ~90 katı). Seçenekler: oranı düşürmek (%50 → %25), tavanı oynama süresine bağlamak, ilk dönüşü ayrıca sınırlamak. Geç oyunda uyuyan oyuncu için 4–8 saat sorusu (GPT Astra: 2 saat cimri) hâlâ açık; simülasyonda 4/8 saat geç hedefleri bozuyordu.
- **Ev bonusları:** Yaşanan ev +%5 × (n−1) (9. ev +%40, 25. ev +%120) ve araç/kıyafet bonusları. Kiralık evin bonusu satın alınanla aynı. Seçenek: kiralık evde bonus yarı, satın alınca tam; ya da bonus adımı küçülür.
- **Taşınma bedeli:** Seçenek B ile başladı (bugünkü fiyat eğrisi = taşınma bedeli, satın alma = ×25). Alternatif A: bedel = fiyatın %4'ü, fiyatlar eski eğride.
- **Simülatöre yeni profiller:** reklam izleyen (günde birkaç hızlandırıcı, her dönüşte ×2), ödeyen (kalıcı ×2), reklamsız rahat oyuncu. Hedef: reklam izleyen %20–30 hızlı, reklamsız oyuncu hedeflerin içinde.

## 6. Simülatörün sınırları (GPT Astra incelemesi, doğrulandı)

- Bot yöneticisiz işletmeleri %60 verimle çalışıyor sayıyor (`ACTIVE_UNMANAGED_EFFICIENCY`); gerçek oyunda sadece "Çalıştır"la başlatılan döngü ödenir.
- Bot açgözlü ve optimal; menü okuma, hikâye izleme, kararsızlık yok. "Gerçek oyuncu 1,3–1,8 kat yavaş" ölçülmüş değil, tahmin; kullanıcının gözlemi ise tersine "hızlı" (§5).
- Önerilen ek profiller: ilk 2 dakikada çıkan, yöneticiyi geciktiren, günde iki kez dönen, 24 saat ara veren (+ §5'teki reklam/ödeme profilleri).
- Gerçek doğrulama oyun testi ve analitikle (plan 1.14–1.15).
