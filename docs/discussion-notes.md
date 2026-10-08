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

Kararlaştırılanlar (2026-10-08, story §6): varis 17 yaşında bir torun, ölüm gösterilmez, 4. perde oynanabilir bir vakıf projesi, eş Nevin Hanım'ın torunu.

1. **Torunun cinsiyeti.** Öneri: oyuncu seçsin (tek seçim). Bütçe kısıtlıysa sabit, seçim sonra.
2. **2. neslin açılış sahnesi.** Öneri: küçük yurt odası veya kiralık oda, sokak değil. "Para yok ama ad var" Aile İtibarı ile örtüşür.
3. **2. nesil kıyafet ve poz seti.** Öneri: aynı yaşam aşaması sayısında yeni set; babadan kalan bir yadigâr (saat veya Şans'ın tasması) hep görünsün.
4. **Varis çok hızlı:** 1. ömür ~3.000 miras puanı (×31 gelir) bırakıyor; 2. nesil dakikalar içinde Milyoner ve üstü. Miras formülüyle birlikte ele alınacak.

## 5. Ekonomi ayarı (kullanıcının gözlemleri, 2026-10-08; acil değil, sıradaki büyük konu)

Kullanıcı telefonda oynayınca: **"Ekonomi çok hızlı büyüyor. Çevrimdışı ödül miktarı çok fazla geldi. Kiralık evlerin bonusları fazla geldi."** Erken tempo 2026-10-08'de yavaşlatıldı, hedefler ve işletme yükseltmeleri eklendi; aynı gün yavaşlatma kazançtan fiyatlara taşındı (Çalıştır turda $0,01 veriyordu; işletme artık ana gelir, game-design §4.2, §5). Aşağıdakiler hâlâ açık. Reklam ödülleriyle (çevrimdışı ×2, 1 saatlik ×2 hızlandırıcı, 15 dk gelir) ve kalıcı ×2 IAP'ıyla birlikte ayarlanmalı ([monetization-v2.md §4–5](./monetization-v2.md)).

Konuşmadan önce hazırlanacaklar:

- **Gerçek oynanış ile bot farkı:** Yeni tempo telefonda denenmeli; hâlâ hızlı mı, şimdi yavaş mı?
- **Çevrimdışı:** Tavan artık sınıfla büyüyor (10 dk → 2 sa) ama 3 dk oynayıp dönen oyuncu cebindeki paranın onlarca katını buluyordu (~$27K; yeni işletme ayarıyla yeniden ölçülecek). Seçenekler: oranı düşürmek (%50 → %25), tavanı oynama süresine bağlamak, ilk dönüşü ayrıca sınırlamak. Geç oyunda uyuyan oyuncu için 4–8 saat sorusu (GPT Astra: 2 saat cimri) hâlâ açık; simülasyonda 4/8 saat geç hedefleri bozuyordu.
- **Ev bonusları:** Yaşanan ev +%5 × (n−1) (9. ev +%40, 25. ev +%120) ve araç/kıyafet bonusları. Kiralık evin bonusu satın alınanla aynı. Seçenek: kiralık evde bonus yarı, satın alınca tam; ya da bonus adımı küçülür.
- **Taşınma bedeli:** Seçenek B ile başladı (bugünkü fiyat eğrisi = taşınma bedeli, satın alma = ×25). Alternatif A: bedel = fiyatın %4'ü, fiyatlar eski eğride.
- **Simülatöre yeni profiller:** reklam izleyen (günde birkaç hızlandırıcı, her dönüşte ×2), ödeyen (kalıcı ×2), reklamsız rahat oyuncu. Hedef: reklam izleyen %20–30 hızlı, reklamsız oyuncu hedeflerin içinde.

## 6. Simülatörün sınırları (GPT Astra incelemesi, doğrulandı)

- Bot yöneticisiz işletmeleri %60 verimle çalışıyor sayıyor (`ACTIVE_UNMANAGED_EFFICIENCY`); gerçek oyunda sadece "Çalıştır"la başlatılan döngü ödenir.
- Bot açgözlü ve optimal; menü okuma, hikâye izleme, kararsızlık yok. "Gerçek oyuncu 1,3–1,8 kat yavaş" ölçülmüş değil, tahmin; kullanıcının gözlemi ise tersine "hızlı" (§5).
- Önerilen ek profiller: ilk 2 dakikada çıkan, yöneticiyi geciktiren, günde iki kez dönen, 24 saat ara veren (+ §5'teki reklam/ödeme profilleri).
- Gerçek doğrulama oyun testi ve analitikle (plan 1.14–1.15).

## 7. Ana ekranın hikâyeyle birlikte değişmesi (kullanıcı, 2026-10-08; sıradaki konu)

Kullanıcı: "Şu an hep eski kirli arka sokak ve üşüyor pozunda duran kahraman. Ve aynı kıyafet. Hikâye ile birlikte burayı da eş zamanlı değiştirelim." Sonra: ev ve araç seçimi ana ekrandaki ortamı değiştirmeli.

**Katman önerisi (Claude):** her katmanı tek bir şey belirler. Arka plan = oturulan ev (dış mekân); araç = seçili araç, evin önünde park hâlinde; kıyafet = o anki kıyafet; poz/duruş = sınıf; hikâye anları = sınıf töreni. Annenin evi ayrı (kendi merdiveni, story §5).

**Kullanıcının yönü (2026-10-08), ayrıntı konuşulacak:**

- **Kıyafet 4–5 tane** (20 değil). Hikâye görsellerinde (ör. Orta Sınıf'taki çatı katı) kahraman o anki kıyafetiyle görünmeli; bu yüzden törendeki kıyafet belli olmalı. Kullanıcının fikri: oyuncu o kıyafeti almaya mecbur bırakılabilir.
  - Claude'un görüşü: mecbur bırakmak yerine **kıyafeti sınıf töreni versin** ("Önce / Şimdi" kartında yeni kıyafet). Sonuç aynı (törende kıyafet kesin) ama sınıf harcamaya bağlanmaz (sınıf kazanılan toplamdan gelir, game-design §4.1) ve oyuncu "kıyafet alamadım, ilerleyemiyorum" diye takılmaz. Öneri eşleme: 1 sokak kapüşonlusu (Sokak, Gündelikçi) · 2 temiz iş kıyafeti (İşçi) · 3 şık günlük (Orta Sınıf, Milyoner) · 4 takım elbise (Milyarder, Multimilyarder) · 5 en şık (En Zengin). Kıyafetlerin gelir bonusu ev/araca ya da aksesuara (saat, Şans'ın tasması) kayar; ekonomi `npm run sim` ile.
  - Sonuç: çatı katı görseli (`art/pilot/07-story/milyoner-attic-v1.png`) kapüşonluyla üretildi; 3. kıyafet tasarlanınca o kıyafetle yeniden üretilir.
- **Ev sayısı 10–12** (25 değil), çok sık taşınma olmasın; her sınıfın belli evleri olsun ki sınıf atlayınca herkes aynı evde olsun ve hikâye güçlü anlatılsın.
  - Claude'un görüşü: katılıyorum. Bugün bot ilk 30 dakikada 9 kez taşınıyor (`npm run sim -- --purchases`). Öneri: her sınıfa 1–2 ev. **Tören oyuncuyu o sınıfın ilk evine taşır** (herkes aynı yerde; story §4'teki "İşçi: ilk kiralık daire" yeniden geçerli olur). Sınıf içinde ikinci, daha iyi ev isteğe bağlı alım olarak kalır (seçim ve para harcama yeri korunur); satın alma / kiraya verme orta sınıflardan itibaren. Ev bonusu ve taşınma bedeli değişeceği için ekonomi yeniden simüle edilir.
- **Arka plan denemesi:** Gündelikçi için ilk yer "eski minibüs": aynı ara sokak sabah ışığında, minibüs ev olmuş, yanında ocak ve tencere ("ilk sıcak yemek" anıyla örtüşür). `art/pilot/05-scene/home-1-van-v1.png` (ara sokakla aynı kamera ve zemin; alt yarı karakterler için boş). $0,15. Çöp torbaları kaldı, istenirse düzeltilir.

**Ev taslağı (Claude, 2026-10-08, konuşulacak; sınıflar Orta Sınıf değişikliğiyle güncel):**

| Sınıf | Ev(ler) |
| --- | --- |
| Sokak | Ara sokak (çadır) |
| Gündelikçi | Eski minibüs (deneme görseli var) |
| İşçi Sınıfı | Eski kiralık daire → yeni kiralık daire |
| Orta Sınıf | Modern daire (site) |
| Milyoner | İlk müstakil ev → bahçeli ev |
| Milyarder | Villa → cam ev |
| Multimilyarder | Çatı katı (penthouse) → sahil malikânesi |
| En Zengin | Kır malikânesi → şato |

Bugünkü kod: 25 ev (`config/housing.ts`), 9'u sadece kiralık, yaşanan ev +%5 × (n−1) bonus, taşınma bedeli $200 × 2,75ⁿ; bot ilk 30 dakikada 9 kez taşınıyor (`npm run sim -- --purchases`). Değişiklik ekonomiyi etkiler (ev bonusu, taşınma bedeli, kira), simülatörle yapılır. 20 kıyafet (`config/lifestyle.ts`) 4–5'e inerken gelir bonusları da yeniden dağıtılır.

Konuşulacaklar: sınıf → ev eşlemesi (yukarıdaki taslak), apartman evlerinde dış mekân mı (bina girişi/avlu) iç mekân mı (iç mekânda araç görünmez), sınıf yükseldikçe dokunulan şeyin ne olacağı (şişe → ?), ara anlar ("yemek").
