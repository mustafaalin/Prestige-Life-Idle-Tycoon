# Prestige Life v2 — Reklam ve Uygulama İçi Satın Alma (IAP) Önerisi

Tarih: 2026-10-08 · Durum: **kararlaştırıldı (2026-10-08); reklam altyapısı hazır, reklam yerleri ve IAP bekliyor** · İlgili: [report-v2.md](./report-v2.md) §Monetizasyon, [rebuild-plan.md](./rebuild-plan.md) 2.9, [discussion-notes.md](./discussion-notes.md) §5 (ekonomi ayarı)

Kullanıcının isteği: "Ödüllü reklam için detaylı düşün; oyun tasarımı reklam izletmeye uygun olsun. Reklamla bazı şeyleri verebiliriz, IAP ile bir şeyler satabiliriz."

---

## 1. Özet

- **Gelirin ana kaynağı ödüllü reklam olsun, zorla reklam (interstitial) lansmanda hiç olmasın.** Ödüllü reklam türün en iyi çalışan biçimi; rakiplerin en büyük şikâyeti aşırı reklam.
- **Her reklam ödülü "X dakikalık gelir" olsun.** v1'deki "tek reklam = 18 saatlik maaş" hatası tekrar etmesin; reklam oyunu ezmesin, hızlandırsın.
- **Reklam, oyuncunun ihtiyaç anında teklif edilsin.** Çevrimdışı dönüş, Şans'ın bulduğu cüzdan, sıradaki hayale az kalmışken. Sektör verisi: ihtiyaç anında teklif %38, rastgele araya koyma %24 dönüşüm.
- **Lansman IAP'ı 4 ürün:**
  1. Reklamsız paket: ödüller reklamsız alınır.
  2. Kalıcı ×2 gelir: Şans'ın Altın Tasması, sahnede de görünür.
  3. Başlangıç paketi.
  4. Çevrimdışı ekip: tavan ve oran artışı.
  
  Elmas gibi bir premium para birimi lansmanda yok; canlı etkinliklerle birlikte gelir.
- **Uyum şartları lansman öncesi zorunlu:** AdMob izin ekranı (UMP; AB, Birleşik Krallık, İsviçre), iOS ATT, "Satın alımları geri yükle" düğmesi, reklam öncesi ödülün açıkça yazılması.

## 2. İlkeler

1. **Reklamsız oyun da tatmin edici olmalı.** Simülatör hedefleri reklam izlemeyen oyuncu için tutmalı. Reklam izleyen yaklaşık %20–30 hızlı ilerlesin; oyunu ikiye katlamasın.
2. **Her reklam isteğe bağlı ve tek tek seçilir.** AdMob politikası: oyuncu her reklamı açıkça kendisi seçer. Reklamdan önce ne kazanacağı yazılır ("Reklam izle: +$4,2 Bin"). Reklam kapatılabilir.
3. **İlk oturumda reklam teklifi yok.** İlk teklif oyuncu ilk yöneticisini aldıktan ve bir kez çevrimdışı döndükten sonra gelir. Rich Inc.'in onboarding'de reklam öğretmesi yorucu bulunmuştu.
4. **Ödüller gelire oranlı ve günlük sınırlı.** Ekonomi ayarı (discussion-notes §5) yapılırken reklam ödülleri de simülatöre girer.
5. **Satılan şey hız, konfor ve kozmetik; cezadan kaçış değil.** v1'deki "gem ile gider atlama" hatası tekrar etmez. Oyunda ceza veren sistem yok, olmayacak.
6. **Şeffaflık.** "Reklamsız" paketin neyi kaldırdığı açıkça yazılır: ödüllü reklamları ödülüyle birlikte atlatır. Rastgele ödül (çark, kutu) varsa ihtimaller gösterilir; lansmanda yok.
7. **Ton.** Satın almalar hikâyeyle uyumlu adlar taşır. "Altın Kaşık" adı "sıfırdan kendi hayatını kuran" kahramanla çelişir (GPT Astra incelemesi); onun yerine Şans ve ekip temalı adlar.
8. **Kumar benzeri mini oyun yok.** Rich Inc.'te reklamla "kazanma ihtimali ×2" veren bir slot makinesi var. Simüle kumar yaş sınırını yükseltir ve tonumuza uymaz.

## 3. Rakipler ve sektör verisi

| Oyun | Reklam | IAP | Ders |
| --- | --- | --- | --- |
| **AdVenture Capitalist** | İsteğe bağlı ×2 kâr, 4 saat; oyuncunun diğer çarpanlarına ekleniyor; günde gezegen başına en fazla 5 izleme ([wiki](https://adventure-capitalist.fandom.com/wiki/Opt-In_Boosts)) | Altın (premium para), kalıcı yükseltmeler | Uzun süreli ×2 hızlandırıcı türün klasiği; günlük sınır var |
| **Egg, Inc.** | Reklamla altın yumurta (premium para); ekranda uçan drone'a dokununca para/yumurta ([Wikipedia](https://en.wikipedia.org/wiki/Egg,_Inc.)) | **Pro Permit $9,99** tek seferlik: daha çok silo (çevrimdışı süre) ve aynı anda daha çok hızlandırıcı ([App Store](https://apps.apple.com/app/993492744)) | Çevrimdışı süreyi satmak iyi bir kalıcı IAP; drone = Şans'ın cüzdanının karşılığı |
| **Idle Miner Tycoon** | Dönüşte reklamla çevrimdışı parayı ×2; ekranda kalıcı "Boost!" düğmesi: reklamla geçici ×2 gelir, üst üste eklenir ([Pangle vaka çalışması](https://www.pangleglobal.com/resource/27816)) | No Ads Bundle: "oyunda hiçbir video reklam izleme ihtiyacını kaldırır" ([Kolibri yardım](https://kolibri-games.helpshift.com/hc/en/3-idle-miner-tycoon/faq/98-what-is-the-no-ads-bundle/?p=all)); "2x Income Forever"; Premium Pass $9,99, Double Cash $6,99 ([fiyatlar](https://apppricinglab.com/iap/apple/1116645064)) | Reklamsız paket ödülleri reklamsız verir; kalıcı ×2 gelir satılıyor |
| **Rich Inc.** (referans) | "Reklam izle +500" (günde 20, ×2), "reklamlar oyunu ücretsiz yapıyor, kapatmak için…" açıklaması, reklamlı slot | Reklam kaldırma, premium para | Ödül gelire göre çok büyük; onboarding'de reklam öğretiyor; kumar mini oyunu var. Bunları almıyoruz |
| **Idle Office Tycoon** (10M+ indirme) | Ödüllü + zorla reklam | Başlangıç paketi $1,99, reklamsız $15,99 ([App Store](https://apps.apple.com/us/app/idle-office-tycoon-money-game/id1617250285)) | Yorumlarda "$16 reklam kaldırma pahalı", "satın alınca oyun çok kolaylaştı" |
| **Exponential Idle** | Her 2 saatte bir reklamla kalıcı hızlandırma | Tek IAP: $1,99 aynı hızlandırma kalıcı | Reklam ve IAP aynı faydayı farklı yoldan verebilir |

**Sektör verisi (yönlendirici, kesin değil):**

- Appodeal 2025 (ABD Android, 10.000+ casual oyun): idle oyunlarda oyuncu başına ortalama ~73 ödüllü video ([rapor](https://appdevelopermagazine.com/mobile-casual-benchmarks-report-2025/)).
- Reklam, oyuncunun kaynağı bittiği anda teklif edilince %38,1; seviyeler arasında %23,8 dönüşüm. 15–20 reklam yerinden sonra artış duruyor ([GameDev Reports / Unity](https://gamedevreports.substack.com/p/weekly-gaming-reports-recap-september-249)).
- Zorla reklam ödüllüden daha çok oyuncu kaybettiriyor; iOS'ta daha belirgin (%15+, Android'de ~%10) ([PocketGamer.biz / Unity AdQuality](https://www.pocketgamer.biz/what-our-data-reveals-about-ad-quality-and-player-churn-in-mobile-games/)). Karşı örnek: bir casual oyunda tanışma döneminden sonra eklenen zorla reklam ilk satın almayı %40 artırmış, tutmayı düşürmemiş ([Unity vaka](https://activation.unity3d.com/fr/case-study/greener-grass)). İdle türüne özel çalışma bulamadım; kendi A/B testimiz gerekecek.
- Ödüllü video eCPM'i ABD Android'de ~$16–28 ([Appodeal Q4 2024](https://appodeal.com/the-mobile-ecpm-report-updated-q4-2024-view)). **Türkiye için güvenilir bir rakam bulamadım**; genel bölgesel tahminler çok daha düşük. Bu yüzden Türkiye'de IAP'ın payı görece daha önemli olabilir, ama ölçmeden bilemeyiz.
- Ödüllü reklam, tüketecek bir şeyi olmayan oyunda çalışmaz ([Megadigital](https://megadigital.ai/en/blog/how-to-increase-ltv/)). Bizde gelir, hızlandırıcı ve sıradaki hayal hep tüketilen şeyler; uygun.

## 4. Reklam yerleri (ödüllü video)

Hepsi isteğe bağlı. Ödül miktarı düğmede yazar. "Reklamsız paket" sahipleri aynı ödülü reklamsız alır.

| # | Yer | Ne zaman | Ödül | Sınır | Durum |
| --- | --- | --- | --- | --- | --- |
| 1 | **Çevrimdışı ×2** | "Tekrar hoş geldin" kartında, "Topla"nın yanında "Reklam izle: ×2" | Çevrimdışı kazancı ikiye katlar | Her dönüşte 1; en az 10 dk uzak kalınca | Kart hazır (`RewardCard`) |
| 2 | **Şans'ın bulduğu ×2** | Cüzdan kartında "Reklam izle: ×2" | Teşekkür ödülü ×2 | Her bulguda 1 | Kart hazır |
| 3 | **Gelir hızlandırıcı** | Üst barda kalıcı "×2" düğmesi; aktifken kalan süre görünür | Tüm gelir ×2, **1 saat** (gerçek zaman; çevrimdışında da sayar). Üst üste en fazla 4 saat | Günde 6 | Yeni |
| 4 | **Hayaline yardım** | Sıradaki hayal, terfi ya da işletme için az para kalmışken o kartta | **15 dakikalık gelir** (AdCap/Rich Inc.'teki "+para" düğmesinin gelire oranlı hâli) | Günde 5; sadece eksik tutar 15 dakikalık gelirden azken çıkar | Yeni |
| 5 | **Sınıf töreni hediyesi ×2** | Sınıf atlayınca (1.10 töreni) gelen hediyede | Hediye ×2 | Sınıf başına 1 | 1.10 ile |
| 6 | **Günlük hediye / çark** | Günlük ödülde ek çevirme | Ek ödül | Günde 1–2 | Faz 2.7 |
| 7 | **Olay kartında ikinci şans** | Kötü sonuçlu kartta "tekrar dene" | Yeniden seçim | Kart başına 1 | Faz 2.4 |

**Günlük toplam:** pratikte en fazla ~15–20 reklam. Sektör verisi 15–20 reklam yerinden sonra artışın durduğunu gösteriyor; asıl sınırlayıcı ödülün değeri.

**Zorla reklam (interstitial) ve banner:** lansmanda yok. 3. günden sonra, çok seyrek bir zorla reklamı yalnızca A/B testiyle deneriz; tutma düşerse kaldırırız.

**Ekonomiye etkisi:** 3 ve 4 numaralı yerler ilerlemeyi doğrudan hızlandırır. Simülatöre "reklam izleyen oyuncu" profili eklenir: günde birkaç hızlandırıcı, her dönüşte ×2. Hedef, reklam izleyenin sınıflara %20–30 erken ulaşması; reklamsız oyuncu hedeflerin içinde kalır. Bu ayar discussion-notes §5'teki ekonomi düzeltmesiyle birlikte yapılmalı.

## 5. IAP ürünleri

Fiyatlar ABD dolarıdır. Türkiye fiyatlarını Google Play ve App Store yerel fiyat katmanlarıyla düşürürüz; RevenueCat bunu yönetir.

| Ürün (öneri ad) | Tür | Fiyat | İçerik | Neden |
| --- | --- | --- | --- | --- |
| **Rahat Paket** (Reklamsız) | Kalıcı | $7,99 | Bütün ödüllü reklam ödülleri reklam izlemeden alınır (§4); ileride zorla reklam eklenirse o da kalkar; bonus olarak 2 saatlik ×2 hızlandırıcı | Idle Miner'ın No Ads Bundle'ı bu modeli kullanıyor. Rakiplerde $15,99 "pahalı" bulunmuş; $7,99 orta nokta |
| **Şans'ın Altın Tasması** | Kalıcı | $4,99 | Tüm gelir **kalıcı ×2**; Şans sahnede altın tasmayla görünür (kozmetik) | Türün en iyi satan tipi (Idle Miner "2x Income Forever", Double Cash $6,99). Hikâyeyle bağlı ve oyunda görünür; bonus veren köpek değil, onun aksesuarı |
| **Yeni Başlangıç Paketi** | Tek seferlik | $1,99 | 4 saatlik ×2 hızlandırıcı + 1 saatlik gelir + Şans'a kırmızı fular (kozmetik). Sadece ilk 3 günde, 1. sınıf atlamadan sonra gösterilir | Başlangıç paketi rakiplerin hepsinde var ($1,99–4,99). İlk ödemeyi düşük tutarla almak için |
| **Gece Vardiyası Ekibi** | Kalıcı | $3,99 | Çevrimdışı oran %50 → %100 ve tavan +2 saat | Egg, Inc.'in Pro Permit karşılığı ($9,99). Kullanıcının "çevrimdışı fazla" gözlemiyle birlikte ayarlanmalı (discussion-notes §5) |
| **Para çantası** (ileride) | Tüketilir | $0,99–4,99 | "X saatlik gelir"; gelire oranlı | v1'de vardı (dinamik ölçekli). Lansmanda isteğe bağlı |
| **Sezon bileti, VIP abonelik** | — | — | Lansmanda yok | GPT Astra: erken aşamada odak dağıtır. Canlı etkinliklerle (Faz 3) değerlendirilir. Haftalık abonelik ($7,99/hafta örnekleri) güven açısından riskli |

**Mevcut 8 ürün (v1):** 4 para + 4 elmas paketi (`com.prestigelife.*`). v2'de elmas yok. Önerim: bu ürünleri Play Console'da pasifleştirmek, yeni ürünleri yeni kimliklerle açmak. Daha önce satın alanların hakları (tüketilir ürünlerdi) açısından sorun çıkmıyor.

**Kalıcı ×2'nin dengesi:** Ödeyen oyuncu sınıflara yaklaşık yarı sürede ulaşır. Bu kabul edilebilir, çünkü ödeyen hız alır. Ama ömür (17 → 97) değişmediği için zirveye çok erken varırsa geç oyun boş kalır; simülatörde "ödeyen oyuncu" profiliyle kontrol edilir.

## 6. Oyunda nerede görünecek?

- **Üst bar:** ×2 hızlandırıcı düğmesi; aktifken parlayan "×2 · 42 dk" rozeti.
- **Ödül kartları:** "Topla" ve "Reklam izle ×2" yan yana. Reklamsız paket sahibinde ikinci düğme "×2 Topla" olur.
- **Hayal, terfi ve işletme kartları:** az para kalmışken küçük "Reklamla +15 dk gelir" düğmesi.
- **Mağaza:** Alt menüye 4. bir sekme yerine Alışveriş sekmesinin içinde "Özel" bölümü; yalnızca ilk sınıf atlamadan sonra açılır. Ayarlar ekranında "Satın alımları geri yükle".
- **Sahnede:** Altın tasmalı Şans ve başlangıç paketindeki fular; satın almanın görünür karşılığı.

## 7. Kurallar ve uyum (lansman öncesi zorunlu)

- **AdMob ödüllü reklam politikası:** Her reklamdan önce gerekli eylem ve ödül açıkça yazılır; oyuncu her reklamı tek tek kendisi seçer; reklam kapatılabilir olmalı. Rastgele ödülde ihtimaller ve bütün olası ödüller gösterilir ([AdMob politikası](https://support.google.com/admob/answer/7313578)).
- **AB, Birleşik Krallık, İsviçre izin ekranı:** Reklam kimliği kullanılmadan önce Google'ın UMP SDK'sı ile GDPR/TCF izni alınır; oyuncu izni sonradan geri alabilmeli (ayarlarda "Gizlilik seçenekleri") ([Google](https://developers.google.com/admob/ios/privacy/gdpr)).
- **iOS ATT:** Önce GDPR izni, sonra ATT izni; UMP ikisini sırayla gösterebilir. ATT'yi ilk açılışta değil, değeri anlatılabilen bir anda göstermek izin oranını artırır ([AppsFlyer](https://www.appsflyer.com/blog/tips-strategy/if-when-show-att-prompt/)).
- **Apple 3.1.1:** Dijital ürünler (kalıcı ×2, reklamsız paket) uygulama içi satın almayla satılır; dışarıya ödeme yönlendirmesi yok ([Apple forum](https://developer.apple.com/forums/thread/748871)). Kalıcı ürünler için **"Satın alımları geri yükle"** düğmesi gerekli.
- **Yaş sınıflandırması:** Simüle kumar yok. Hedef kitle çocuk değil (Families programına girmiyoruz); reklam içerikleri buna göre filtrelenir.
- **Kayıt:** Satın alınan kalıcı ürünler, kayıt silinse bile RevenueCat'ten geri yüklenebilmeli. Rakip yorumlarında "VIP'ye £60 verdim, hepsi gitti" şikâyeti var.

## 8. Uygulama sırası

1. **Ekonomi ayarı (discussion-notes §5) ile birlikte:** Reklam ödüllerini ve kalıcı ×2'yi simülatöre ekle; "reklamsız", "reklam izleyen" ve "ödeyen" profilleri; hedefler üçünde de mantıklı.
2. **Reklam altyapısını v2'ye taşı:** ✅ 2026-10-08: `src/game/runtime/ads.ts` (AdMob 8.2.1, UMP + ATT, web'de sahte reklam, Ayarlar'da gizlilik seçenekleri). Ayrıntı: [mobile-ad-integration.md](./mobile-ad-integration.md). AdMob konsolunda GDPR mesajı kullanıcı tarafından oluşturulacak.
3. **Reklam yerleri 1–4:** çevrimdışı ×2, Şans ×2, hızlandırıcı, hayaline yardım.
4. **IAP:** RevenueCat'te yeni ürünler; Rahat Paket, Altın Tasma, Başlangıç, Gece Vardiyası; geri yükleme; v1 ürünlerini pasifleştir.
5. **Analitik:** reklam teklif ve izleme, satın alma, sınıf atlama, oturum olayları. Analitik ilk oyuncu testinden önce gelmeli (GPT Astra).
6. **Sonra:** sınıf töreni ×2 (1.10), günlük hediye (2.7), olay kartı ikinci şans (2.4); zorla reklam ve fiyat A/B testleri (Faz 3).

## 9. Kararlar (kullanıcı, 2026-10-08)

Altı sorunun hepsi önerildiği gibi onaylandı: lansmanda zorla reklam yok (sonra A/B testi); reklam yerleri 1–4'ün hepsi; hızlandırıcı 1 saat ×2, en fazla 4 saat, günde 6; IAP listesi ve fiyatları (Rahat Paket $7,99, Şans'ın Altın Tasması $4,99, Yeni Başlangıç $1,99, Gece Vardiyası Ekibi $3,99) ve adları; lansmanda premium para birimi yok; v1'in 8 ürünü pasifleştirilip yenileri açılır.

Aşağıdaki sorular kayıt için duruyor.

1. **Zorla reklam:** Lansmanda hiç olmasın, sonra test edelim önerisi uygun mu?
2. **Reklam yerleri:** 1–4'ün hepsi olsun mu? Özellikle "Hayaline yardım" (ihtiyaç anında para) v1'deki "asıl para reklamdan" hissini geri getirebilir; 15 dakikalık gelirle sınırlı tutuyorum.
3. **Hızlandırıcı süresi:** 1 saatlik ×2, en fazla 4 saat, günde 6 uygun mu? AdCap'te 4 saat, Idle Miner'da 1 saat.
4. **IAP listesi ve fiyatlar:** Rahat Paket $7,99, Altın Tasma $4,99, Başlangıç $1,99, Gece Vardiyası $3,99 uygun mu? İsimler tona uyuyor mu?
5. **Premium para birimi:** Lansmanda elmas olmasın (daha sade, ürünler doğrudan satılır) önerisi uygun mu?
6. **Eski 8 ürün:** Pasifleştirip yenilerini açalım mı?
