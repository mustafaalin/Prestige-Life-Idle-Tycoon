# Tartışma notları (sonra konuşulacak)

Kararı henüz verilmemiş konular ve Claude'un önerileri. Karar verilince ilgili belgeye (plan, hikaye, tasarım) taşınır ve buradan silinir.

Son güncelleme: 2026-10-08

## 1. Görsel ve animasyon yaklaşımı

**Karar (2026-10-08):** Görsel roman yaklaşımı. Kahraman ve kadro tutarlı durağan pozlar, ifade portreleri ve konuşma balonlarıyla anlatılır; önsöz çizgi roman kareleriyle. Ayrıntı [story-v2.md §8](./story-v2.md), plan 1.16. Kodla zıplatma/esnetme karakter animasyonu sayılmaz (değişmedi). İlk sürüm böyle çıkar, gerekirse sonra gerçek animasyona geçilir.

Gerekçe: Rich Inc. açılışı (2026-10-07 ekran görüntüleri) hiç animasyonsuz, konuşanı aydınlatıp diğerini karartan görsel roman diliyle duyguyu net veriyor. Yapay zekâ görsel modelleri karakter referansıyla tutarlı durağan pozu videodan çok daha iyi üretiyor; ayak kayması, yeşil hale, döngü atlaması yok; dosyalar küçük.

**Açık kalanlar:**

- **Sanat stili denemesi:** Mevcut Pixar benzeri yarı 3D (`ch-8-1.png`) ile kalın konturlu düz çizgi film stili yan yana: kahraman 4 poz + 3 ifade, Şans, sokak arka planı. Kullanıcı telefonda seçer. Düz stilde tutarlılık daha kolay.
- **Özel anlar için video (isteğe bağlı, sonra):** "Eski evimizi geri aldım" gibi 2–3 büyük anda kısa yapay zekâ videosu. Yol: Higgsfield MCP (`claude mcp add --transport http higgsfield https://mcp.higgsfield.ai/mcp`, `/mcp` ile giriş; Kling 3.0, Seedance 2.0, Veo 3.1, Soul ID), yedek fal.ai MCP. Her üretimden önce kredi maliyeti söylenir. Kabul ölçütü klip fiyatı değil, kabul edilen bir animasyonun toplam maliyeti (deneme, temizleme, entegrasyon).
- **İskeletli 2D (Spine / Rive):** Oyun testi "karakter hareketi şart" demezse gerek yok. Rig işi editörde elle yapılır.

## 2. Remotion (github.com/remotion-dev/remotion)

**Ne:** React ile kodla video üretme çerçevesi. Yeni görüntü üretmez, var olan görselleri düzenler. Karakter animasyonu sorununu çözmez.

**Lisans:** Bireyler ve en fazla 3 çalışanlı şirketler için ticari kullanım dahil ücretsiz; daha büyük şirkete Company License gerekir.

**Faydalı olabileceği yerler:**

| Kullanım | Değer | Zaman |
| --- | --- | --- |
| Mağaza tanıtım videosu ve reklamlar (Play Store, TikTok, Reels, Shorts); TR/EN, dikey/yatay otomatik | Yüksek | Yayından önce (Faz 3) |
| Mağaza ekran görüntüleri (her dil ve cihaz boyutu) | Orta | Yayından önce |
| "Hayat hikayen" paylaşım videosu (oyuncunun yolculuğu, sosyal medyada paylaşılır) | Deneysel | Faz 2+ |
| Yapay zekâ kliplerini müzik ve yazıyla tanıtım filmine çevirmek | Orta | Yayından önce |
| Oyun içi tören ve hikaye kartları | Düşük (oyun zaten React; video dosyası uygulamayı şişirir) | Gerekmez |

**Öneri:** Yayından önce repoda ayrı bir `video/` klasöründe tanıtım videoları için kurulsun.

## 3. Konut modeli

Karar verildi (2026-10-07) ve [game-design-v2.md §4.8](./game-design-v2.md)'e taşındı. Açık kalan tek şey: taşınma bedeli seçenek B ile başladı (bugünkü fiyat eğrisi = taşınma bedeli, satın alma = ×25). Kullanıcı oyun testinde nasıl hissettirdiğine bakıp tekrar değerlendirecek. Alternatif A: bedel = fiyatın %4'ü, fiyatlar eski eğride (ilk evler bedavaya yakın olur).

## 4. Sıfırlama modeli: tek kahramanın ömrü (karar yönü 2026-10-08)

**Karar:** Erken emekli olup çocuğa devretmek yok. Hikâye (sokaktan En Zengin'e) tek kahramanın hayatında tamamlanır; hanedan geçişi ömrün sonunda gelir. Bugünkü "Multimilyoner'de emeklilik açılır" kuralı bu yüzden değişecek.

Neden: Hikâyenin duygusal sonu (Bülent Bey'in şirketi, vakıf, annenin konağı) Milyarder ve En Zengin'de; bugünkü ekonomide oyuncu 2. gün 100M'de emekli oluyor ve bu sonları hiç görmüyor. Her nesilde anneye aynı evi almak ve Şans'la yeniden tanışmak sürekliliği bozuyor (GPT Astra incelemesi §8).

**Simülasyon (2026-10-08, `npm run sim -- --life 60`, hiç emeklilik yok):**

| Sınıf | Engaged (oyun süresi / yaş) | Casual (oyun süresi / yaş) |
| --- | --- | --- |
| Milyoner | 28 dk / 19,4 | 20 dk / 18,7 (22:00 dönüşünde) |
| Multimilyoner | 54 dk / 21,5 | 35 dk / 19,9 |
| Milyarder | 1 sa 15 dk / 23,3 (D2) | 55 dk / 21,6 (D4) |
| En Zengin | 6 sa 16 dk / 48,3 (D9) | 4 sa 35 dk / 39,9 (D18) |
| 30. gün sonu | 21 sa oyun / 122 yaş | 7 sa 40 dk / 55 yaş |

Çıkarım: Mevcut ekonomide tek kahraman, hiç sıfırlamadan En Zengin'e engaged 9., casual 18. günde ulaşıyor; nesillerle olandan (7. / 13. gün) çok yavaş değil. Yani ömür içinde ayrı bir "yeni girişim" sıfırlamasına MVP'de gerek olmayabilir.

**Açık sorular:**

1. Ömür içinde sıfırlama olacak mı? Öneri: MVP'de yok; miras puanı sadece ömür sonunda. Uzun vadede gerekirse "yeni şehir, yeni girişim" (aynı kahraman; hikâye ilerlemesi, annenin evi ve Şans korunur).
2. Ekonomi yeniden ayarı: Multimilyoner → Milyarder arası çok hızlı (engaged 21 dk oyun), En Zengin'e geçiş çok uzun (5 saat). Sınıf eşikleri ve hikâye anları buna göre yeniden dağıtılmalı.
3. En Zengin'den sonra ne olur? Engaged oyuncu 48 yaşında zirvede; kalan yıllar için içerik (vakıf, aile, varisin büyümesi) ya da daha kısa ömür gerekiyor.

## 5. Yaş ve ömür (açık, kullanıcının sesli düşüncesi 2026-10-08)

**Fikir:** Üst barda yaş: 17'den başlar, örneğin 97'ye kadar ("80 yıl kaldı"). Ömür bitince oyun o kahraman için biter; ne kadar ilerlediysen. Gelir aylık maaş gibi gösterilir; 1 oyun ayı = 1 dakika, yani 12 dakikada 1 yaş. (Rich Inc.'te tarih birkaç dakikada aylarca ilerliyor.)

**Hesap:** 80 yıl × 12 dk = 16 saat oyun.

- Yaş çevrimdışı da ilerlerse oyuncu bir gecede ölür; olmaz. Yaş **sadece oyun açıkken** ilerlemeli; uzaktayken para birikir ama yaşlanmazsın.
- Engaged oyuncu (~45 dk/gün) 16 saati ~3 haftada, casual (~15–25 dk/gün) ~2 ayda doldurur.

**Claude'un önerisi:**

- Yaş sadece oyun açıkken ilerler.
- Ömrün sonu ölüm değil, sıcak bir "emeklilik ve vakıf" töreni; varis devralır. Ne kadar ilerlediysen miras o kadar büyük. Gönüllü emeklilik en erken 60 yaşta.
- Ömür uzunluğu simülatörle ayarlanır: ortalama oyuncu en az Milyarder'i görmeli. §4 tablosuna göre 1 dk/ay ile engaged oyuncu En Zengin'e 48, casual 40 yaşında varıyor.
- Aile anları yaşa bağlanabilir: evlilik ~30, çocuk ~32; kahraman 65–70 yaşına geldiğinde varis yetişkin olur, devir doğal görünür.
- Gelirin "aylık" gösterilmesi ($/ay = $/sn × ay süresi) tasarım belgesi §8'deki "ilk tezgâh $0,1, küçük kesirler" sorununu da çözer.

**Riskler:**

- Daha çok oynayan daha hızlı yaşlanır. Menüde ve hikâye sahnelerinde yaş akmalı mı? (Öneri: hikâye sahnesi ve tam ekran törenlerde durur.)
- Zirvede olmayan oyuncunun ömrü bitince "hikâyenin sonunu göremedim" hissi. Gerekirse ömür sonu yaklaşırken uyarı ("65 yaşındasın, 15 yılın kaldı").

**Karar için gereken:** Sim'e yaş/ömür modeli ve ömür sonu mirası eklenip 30–60 günlük tempo yeniden ölçülür (`--life` seçeneği ilk ölçümü yapıyor).

## 6. Çevrimdışı tavan

GPT Astra: 2 saat tavan ve %50 oran uyuyan oyuncu için cimri; 8 saat uyuyana 1 saatlik tam gelir düşüyor, "işim bensiz çalışıyor" vaadine ters.

**Simülasyon (2026-10-08, `--offline-cap 4` ve `8`):** Engaged oyuncuda ilk Milyarder 2. gün 23:00'e, ilk En Zengin 6. güne çekiliyor; iki geç hedef tutmuyor (4 ve 8 saat aynı sonucu veriyor; engaged profilin en uzun arası gece ~9 saat). Tavanı yükseltmek mümkün ama orta ve geç oyun yeniden ayarlanmalı (ör. oran düşer, ya da üst kademeler yavaşlar). §4–5 kararlarıyla birlikte ele alınacak.

## 7. Faz 2.1 hanedan soruları ([story-v2.md §6](./story-v2.md))

Varis artık ömrün sonunda devralıyor (§4). Kalan sorular:

1. **Varisin cinsiyeti.** Öneri: oyuncu seçsin (doğum sahnesinde tek seçim). 1. nesilde kahraman sabit erkek; seçim kitleyi genişletir. Bedeli: 2. nesil kıyafetleri iki kat çizim. Bütçe kısıtlıysa: varis her zaman kız ("babasının izinden giden kız"), seçim sonra eklenir.
2. **2. neslin açılış sahnesi.** Öneri: küçük yurt odası veya kiralık oda, sokak değil. Ünlü ailenin çocuğu sokakta inandırıcı değil, aynı sahneyi tekrarlamak mirasın ödülünü küçültür. "Para yok ama ad var" Aile İtibarı ile örtüşür.
3. **2. nesil kıyafet ve poz seti.** Öneri: aynı yaşam aşaması sayısında yeni, daha genç tarzda set. Ek fikir: babadan kalan bir aile yadigârı (saat veya Şans'ın tasması) varisin üzerinde hep görünsün.

## 8. Simülatörün sınırları (GPT Astra incelemesi, doğrulandı)

- Bot yöneticisiz işletmeleri %60 verimle çalışıyor sayıyor (`ACTIVE_UNMANAGED_EFFICIENCY`); gerçek oyunda sadece oyuncunun başlattığı döngü ödenir. Erken tempo (ilk yönetici, Milyoner) gerçek oyuncuda daha yavaş olabilir. Ekranlar artık sadece otomatik geliri gösteriyor (2026-10-08).
- Bot açgözlü ve optimal; menü okuma, hikâye izleme, kararsızlık yok. "Gerçek oyuncu 1,3–1,8 kat yavaş" ölçülmüş değil, tahmin.
- Önerilen ek profiller: reklamsız rahat oyuncu, ilk 2 dakikada çıkan, yöneticiyi geciktiren, günde iki kez dönen, 24 saat ara veren.
- Gerçek doğrulama oyun testiyle (plan 1.14–1.15).
