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

## 4. Ömür modeli: kalan ayar işi

Yaş ve ömür kararı verildi (2026-10-08) ve [game-design-v2.md §4.9](./game-design-v2.md)'a taşındı: yaş sadece oyun açıkken ilerler, 1 dk = 1 ay, 17 → 97, ömür sonunda emeklilik ve devir; ömür içinde sıfırlama yok. En Zengin'den sonrası şimdilik bekliyor (kullanıcı: "ileride bakarız").

**Çözüldü (2026-10-08):** Multimilyarder ($100B) eklendi, orta oyun yavaşlatıldı, geç oyun hızlandırıldı; yaşlar 19 / 21 / 24 / 39 / 46, 8/8 hedef ([game-design-v2.md §4.1, §5](./game-design-v2.md)). Aşağıdaki not eski durumu anlatıyor.

**Eski durum: sınıf aralıkları ve tempo.** Simülasyonda (engaged) yaşlar: Milyoner 19, Multimilyoner 21, Milyarder 23, En Zengin 48. Multimilyoner → Milyarder 21 dakika oyun, Milyarder → En Zengin 5 saat; ilk Milyarder 2. gün akşam geliyor (hedef 3–6. gün). Neden: sınıf eşikleri eşit aralıklı değil (1K, 100K, 1M, 100M, 1B, 1T).

Claude'un önerileri (birlikte düşünülmeli):

1. Milyarder ile En Zengin arasına bir sınıf eklemek (ör. "Multibillionaire", $100B): 25 yıllık boşluğa bir hikâye anı girer (ör. annenin villası, Bülent Bey'in şirketi).
2. Orta oyunu (Lojistik, Fabrika kademeleri) yavaşlatıp üst kademeleri hızlandırmak: yaşlar daha düzgün dağılır (hedef örnek: Milyarder ~30, En Zengin ~45–50).
3. Hikâye anlarını sınıfa değil yaşa da bağlamak (evlilik ~30, çocuk ~32).

## 5. Yaş ve ömür: açık ayrıntılar

Ana kurallar kararlaştırıldı ([game-design-v2.md §4.9](./game-design-v2.md)). Kalanlar:

- **Gelir aylık mı gösterilsin?** $/ay = $/sn × 60. Maaş gibi okunur ve tasarım belgesi §8'deki "ilk tezgâh $0,1, küçük kesirler" sorununu çözer. Bedeli: bütün ekranlardaki gelir metinleri değişir.
- **Hikâye anlarında yaş dursun mu?** Öneri: tam ekran tören ve önsözde durur (1.10, 1.18 ile).
- **Ömür sonu uyarısı:** "65 yaşındasın, 32 yılın kaldı" gibi bir hatırlatma, ve zirveye ulaşmamış oyuncunun "sonu göremedim" hissi.
- **Gönüllü erken emeklilik:** Şimdilik yok (kullanıcı: erken devir olmasın).

## 6. Çevrimdışı tavan

GPT Astra: 2 saat tavan ve %50 oran uyuyan oyuncu için cimri; 8 saat uyuyana 1 saatlik tam gelir düşüyor, "işim bensiz çalışıyor" vaadine ters.

**Simülasyon (2026-10-08, `--offline-cap 4` ve `8`):** Engaged oyuncuda ilk Milyarder 2. gün 23:00'e, ilk En Zengin 6. güne çekiliyor; iki geç hedef tutmuyor (4 ve 8 saat aynı sonucu veriyor; engaged profilin en uzun arası gece ~9 saat). Tavanı yükseltmek mümkün ama orta ve geç oyun yeniden ayarlanmalı (ör. oran düşer, ya da üst kademeler yavaşlar). §4–5 kararlarıyla birlikte ele alınacak.

## 7. Faz 2.1 hanedan soruları ([story-v2.md §6](./story-v2.md))

Varis artık ömrün sonunda devralıyor (game-design-v2 §4.9). Kalan sorular:

1. **Varisin cinsiyeti.** Öneri: oyuncu seçsin (doğum sahnesinde tek seçim). 1. nesilde kahraman sabit erkek; seçim kitleyi genişletir. Bedeli: 2. nesil kıyafetleri iki kat çizim. Bütçe kısıtlıysa: varis her zaman kız ("babasının izinden giden kız"), seçim sonra eklenir.
2. **2. neslin açılış sahnesi.** Öneri: küçük yurt odası veya kiralık oda, sokak değil. Ünlü ailenin çocuğu sokakta inandırıcı değil, aynı sahneyi tekrarlamak mirasın ödülünü küçültür. "Para yok ama ad var" Aile İtibarı ile örtüşür.
3. **2. nesil kıyafet ve poz seti.** Öneri: aynı yaşam aşaması sayısında yeni, daha genç tarzda set. Ek fikir: babadan kalan bir aile yadigârı (saat veya Şans'ın tasması) varisin üzerinde hep görünsün.

## 8. Simülatörün sınırları (GPT Astra incelemesi, doğrulandı)

- Bot yöneticisiz işletmeleri %60 verimle çalışıyor sayıyor (`ACTIVE_UNMANAGED_EFFICIENCY`); gerçek oyunda sadece oyuncunun başlattığı döngü ödenir. Erken tempo (ilk yönetici, Milyoner) gerçek oyuncuda daha yavaş olabilir. Ekranlar artık sadece otomatik geliri gösteriyor (2026-10-08).
- Bot açgözlü ve optimal; menü okuma, hikâye izleme, kararsızlık yok. "Gerçek oyuncu 1,3–1,8 kat yavaş" ölçülmüş değil, tahmin.
- Önerilen ek profiller: reklamsız rahat oyuncu, ilk 2 dakikada çıkan, yöneticiyi geciktiren, günde iki kez dönen, 24 saat ara veren.
- Gerçek doğrulama oyun testiyle (plan 1.14–1.15).
