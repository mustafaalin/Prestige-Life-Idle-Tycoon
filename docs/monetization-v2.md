# Prestige Life v2 — Reklam ve Uygulama İçi Satın Alma (IAP)

Tarih: 2026-10-08 · Son güncelleme: 2026-10-15 · Durum: **reklam yerleri 1–5 ve IAP 1. adım (Mağaza, Rahat Paket, Başlangıç Paketi) oyunda; IAP 2. adım (Yakut Tasma, Gece Vardiyası) bekliyor** · İlgili: [report-v2.md](./report-v2.md) §Monetizasyon, [rebuild-plan.md](./rebuild-plan.md) 2.9, [discussion-notes.md](./discussion-notes.md) §4 (ekonomi)

Kullanıcının isteği: "Ödüllü reklam için detaylı düşün; oyun tasarımı reklam izletmeye uygun olsun. Reklamla bazı şeyleri verebiliriz, IAP ile bir şeyler satabiliriz."

---

## 1. Özet

- **Gelirin ana kaynağı ödüllü reklam olsun, zorla reklam (interstitial) lansmanda hiç olmasın.** Ödüllü reklam türün en iyi çalışan biçimi; rakiplerin en büyük şikâyeti aşırı reklam.
- **Her reklam ödülü "X dakikalık gelir" olsun.** v1'deki "tek reklam = 18 saatlik maaş" hatası tekrar etmesin; reklam oyunu ezmesin, hızlandırsın.
- **Reklam, oyuncunun ihtiyaç anında teklif edilsin.** Çevrimdışı dönüş, Şans'ın bulduğu cüzdan, sıradaki hayale az kalmışken. Sektör verisi: ihtiyaç anında teklif %38, rastgele araya koyma %24 dönüşüm.
- **Lansman IAP'ı 4 ürün:**
  1. Reklamsız paket: ödüller reklamsız alınır.
  2. Kalıcı gelir bonusu: Şans'ın Yakut Tasması (+%50, 2026-10-15; önce ×2 ve "Altın Tasma"ydı), sahnede de görünür.
  3. Başlangıç paketi.
  4. Çevrimdışı ekip: tavan ve oran artışı.
  
  Elmas gibi bir premium para birimi lansmanda yok; canlı etkinliklerle birlikte gelir.
- **Uyum şartları lansman öncesi zorunlu:** AdMob izin ekranı (UMP; AB, Birleşik Krallık, İsviçre), iOS ATT, "Satın alımları geri yükle" düğmesi, reklam öncesi ödülün açıkça yazılması.

## 2. İlkeler

1. **Reklamsız oyun da tatmin edici olmalı.** Simülatör hedefleri reklam izlemeyen oyuncu için tutmalı. Reklam izleyen yaklaşık %20–30 hızlı ilerlesin; oyunu ikiye katlamasın.
2. **Her reklam isteğe bağlı ve tek tek seçilir.** AdMob politikası: oyuncu her reklamı açıkça kendisi seçer. Reklamdan önce ne kazanacağı yazılır ("Reklam izle: +$4,2 Bin"). Reklam kapatılabilir.
3. **İlk oturumda reklam teklifi yok.** İlk teklif oyuncu ilk yöneticisini aldıktan ve bir kez çevrimdışı döndükten sonra gelir. Rich Inc.'in onboarding'de reklam öğretmesi yorucu bulunmuştu.
4. **Ödüller gelire oranlı ve günlük sınırlı.** Ekonomi ayarı (discussion-notes §4) yapılırken reklam ödülleri de simülatöre girer.
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
| 1 | **Çevrimdışı +%30** | "Tekrar hoş geldin" kartında, "Topla"nın üstünde "Reklam izle: +$X (+%30)" | Çevrimdışı kazanca %30 ekler (önce ×2'ydi; aşağıda) | Her dönüşte 1; en az 10 dk uzak kalınca | **Oyunda** |
| 2 | **Şans'ın bulduğu ×2** | Cüzdan kartında "Reklam izle: ×2" | Teşekkür ödülü ×2 | Her bulguda 1 | **Oyunda** |
| 3 | **Gelir hızlandırıcı** | Üst barda kalıcı "×2" düğmesi; aktifken kalan süre görünür | Tüm gelir ×2, **1 saat** (gerçek zaman; çevrimdışında da sayar). Üst üste en fazla 4 saat | Günde 6 | **Oyunda** (düğme ana sahnenin sağında) |
| 4 | **Hayaline yardım** | Sıradaki hayal, terfi ya da işletme için az para kalmışken o kartta | **Eksik tutar** (önce 15 dakikalık gelirdi; aşağıda) | Günde 5; sadece eksik tutar fiyatın %10'undan ve 5 dakikalık gelirden azken çıkar | **Oyunda** (terfi, sıradaki eşya, sıradaki eve taşınma, yönetici) |
| 5 | **Tören ve hayat anı hediyesi ×2** | Sınıf töreninin kapanış kartında ve yaşa bağlı üç hayat anının (buluşma, düğün, doğum) sonunda | Hediye ×2 (hediye: 10 dakikalık gelir) | Her anda 1 | **Oyunda** (2026-10-14) |
| 6 | **Günlük ödül ×2** | Günlük ödül kartında, "Topla"nın üstünde | Günün ödülü ×2 (game-design §4.12) | Günde 1 | **Oyunda** (2026-10-15; çark yerine) |
| 7 | **Olay kartında ikinci şans** | Kötü sonuçlu kartta "tekrar dene" | Yeniden seçim | Kart başına 1 | Kartlar oyunda (game-design §4.7); ikinci şans reklam yerleriyle |

**Günlük toplam:** pratikte en fazla ~15–20 reklam. Sektör verisi 15–20 reklam yerinden sonra artışın durduğunu gösteriyor; asıl sınırlayıcı ödülün değeri.

**Zorla reklam (interstitial) ve banner:** lansmanda yok. 3. günden sonra, çok seyrek bir zorla reklamı yalnızca A/B testiyle deneriz; tutma düşerse kaldırırız.

**Nasıl çalışıyor (oyunda, 2026-10-12; sayılar `core/config/ads.ts`, kurallar `runtime/adRewards.ts`, arayüz `ui/ads/`):**

- **Ne zaman açılır:** ilk oturumda teklif yok (§2.3). Teklifler, oyuncu bir yönetici işe aldıktan ve bir kez çevrimdışı kazanç topladıktan sonra başlar; dört yerin hepsi için aynı kural.
- **Çevrimdışı +%30 ve Şans ×2:** ödül kartında "Topla"nın üstünde turuncu "Reklam izle: +$X" düğmesi (ne kadar fazla verdiği yanında yazar). Reklam sonuna kadar izlenirse kart artırılmış tutarla toplanır; erken kapatılırsa kart yerinde kalır.
- **Hızlandırıcı:** ana sahnenin sağında "×2" düğmesi küçük bir kart açar. Bir reklam = 1 saat; kalan sürenin üstüne eklenir, 4 saati aşamaz, günde 6. Gerçek zamanda işler (oyun kapalıyken de); işletmelerin, maaşın ve kiranın getirdiği her şeyi, çevrimdışı kazancın o süreye düşen kısmını ikiye katlar. Elle kazançları (toplama, Şans, olay kartları, hedefler) değiştirmez. Aktifken üst bardaki gelir satırı "×2" ile gösterilir.
- **Biraz yardım:** satın alma düğmesinin altında, yalnızca eksik tutar fiyatın %10'undan ve 5 dakikalık otomatik gelirden azken çıkar ("Reklam izle: +$X", X = düğme çıktığında eksik olan). Tutar sabit kalır: gelir geldikçe aşağı saymaz; başka bir alışveriş eksik tutarı büyütürse yukarı çıkar. Reklam düğmede yazan tutarı verir (en fazla bu sınır).
- **Reklam yoksa:** düğmenin altında "Şu an reklam yok" yazar, ödül verilmez.
- Günlük sayaçlar oyuncunun telefonundaki takvim gününe göre sıfırlanır. Analitik: `ad_offer` (teklif göründü), `ad_watch` (yer, sonuç).

**Ekonomiye etkisi (simülatör, 2026-10-15):** simülatörde "engaged + ads" profili var: günde 3 hızlandırıcı, çevrimdışı reklamı, Şans ×2, günde 2 yardım (yönetici, terfi, eşya ya da ev beklerken eksik sınıra inince, eksik kadar). İlke reklam izleyenin %20–30 hızlı ilerlemesi (§2.1). Ödeyen profiller §5 sonunda.

| | Reklamsız | Reklam izleyen | Fark |
| --- | --- | --- | --- |
| Milyarder | 1 sa 22 dk (2. gün) | 1 sa 8 dk (2. gün) | −%17 |
| Multimilyarder | 4 sa 42 dk (7. gün) | 3 sa 21 dk (5. gün) | −%29 |
| En Zengin | 10 sa 21 dk (15. gün) | 7 sa 8 dk (11. gün) | −%31 |

**Tören ve hayat anı hediyesi (karar 2026-10-14, kullanıcı):** İşçi'den itibaren törenin "Önce / Şimdi" kartında ve buluşma, düğün, doğumun sonunda küçük bir kartta "Hediye: +$X" satırı, altında turuncu "Reklam izle: +$2X (×2)" (reklamlar açıldıktan sonra, diğer yerlerdeki kuralla) ve "Topla". Hediye, oyun içi gelirin (`incomePerSecond` active: yöneticiler, maaş, kira ve elle çalıştırılan işletmeler; üst bar yalnız otomatik geliri gösterir) **10 dakikası** (`config/economy.ts` `STORY_GIFT_SECONDS`, `formulas.ts` `storyGift`); lüks anlarında yok (oyuncu o an bir şey satın almış). Yalnızca hikâye gerçekten yaşanınca: albümden ya da DEV'den tekrar oynatmada hediye yok. Görüldü işaretiyle aynı adımda ödenir (`store.ts` `seeWithGift`): kart kapanmadan uygulama kapanırsa an yeniden oynar ve hediye yine gelir, iki kez ödenmez; Geri tuşu düz hediyeyi toplar. Analitik: `story_gift` (`kind`, `multiplier`, `amount`), reklamda `ad_watch` (`placement: story_gift_x2`). **Neden 30 değil 10 dakika:** kullanıcı 30'u seçti ama ilk sınıflar dakikalar arayla geldiği için 30 dakikalık gelir Milyoner'i (31 dk, hedef 35+) ve Milyarder'i (2. gün, hedef 3+) hedeflerin önüne çekiyordu; **Gündelikçi'de hediye yok** (kullanıcı, 2026-10-14; `STORY_GIFT_FROM_CLASS` = İşçi): ilk oturumda geliyor, reklam henüz açık değil ve hediye ilk yöneticinin parasını hemen veriyordu (4 dk 33 sn, hedef 5 dk+). Kullanıcı 10 dakikayı onayladı (çok gelirse 7–8). 10, 8 ve 7 dakikada sonuç aynı: Multimilyarder 7. gün 23:00 (hedef 8. gün), yani fark hediyenin büyüklüğünden değil botun oturum saatlerinden; oyun süresi olarak 11 dakika erken (5 sa 3 dk → 4 sa 52 dk). Kabul edildi; diğer bütün hedefler tutuyor. Reklam izleyen En Zengin'e %32 kısa sürede (önce %31).

**Çevrimdışı reklamı +%30, ×2 değil (karar 2026-10-13, kullanıcı):** bir ömürde kazanılan paranın %87'si çevrimdışı kartlardan geliyor (game-design §4.6), bu yüzden kartı ikiye katlamak oyunu yarıya indiriyordu (En Zengin 5 sa 34 dk, −%51; çevrimdışı ×2 tek başına 6 sa 30 dk). Hızlandırıcı ×2 ve Şans ×2 onaylandığı gibi kaldı; payları küçük (günde 3 hızlandırıcı tek başına −%14).

**Yardım eksik tutar kadar; fiyatın %10'u ve 5 dakikalık gelirle sınırlı; 15 dakikalık gelir değil (karar 2026-10-14, kullanıcı):** telefonda yöneticiyi aldıktan sonra ödülün büyük kısmı cüzdanda kalıyordu; düğmedeki tutarın her saniye azalması da rahatsız ediciydi. Yönetici fiyatı işletmenin taban fiyatının 12 katı, toplam gelirin yanında küçük; işletmeyi almak da parayı sıfırladığı için düğme hemen her işletmeden sonra çıkıyordu. Simülatör bu farkı göstermiyor: eski modelde yardım günde 2 kez oturum başında 15 dakikalık gelir veriyordu, yeni modelde gerçekteki gibi bekleme anında eksik kadar veriyor; sonuçlar ±%2 içinde. %10 tek başına geç terfi ve yöneticilerde 18–42 dakikalık gelire denk geliyordu (simülatör ölçümü), bu yüzden ikinci sınır 5 dakika. Reklamsız oyuncunun hedefleri değişmiyor.

## 5. IAP ürünleri

Fiyatlar ABD dolarıdır. Türkiye fiyatlarını Google Play ve App Store yerel fiyat katmanlarıyla düşürürüz; RevenueCat bunu yönetir.

| Ürün (öneri ad) | Tür | Fiyat | İçerik | Neden |
| --- | --- | --- | --- | --- |
| **Rahat Paket** (Reklamsız) | Kalıcı | $7,99 | Bütün ödüllü reklam ödülleri reklam izlemeden alınır (§4); ileride zorla reklam eklenirse o da kalkar; bonus olarak 2 saatlik ×2 hızlandırıcı | Idle Miner'ın No Ads Bundle'ı bu modeli kullanıyor. Rakiplerde $15,99 "pahalı" bulunmuş; $7,99 orta nokta |
| **Şans'ın Yakut Tasması** | Kalıcı | $4,99 | Tüm gelir **kalıcı +%50** (ayrı çarpan ×1,5; kullanıcı onayladı, 2026-10-15); Şans sahnede yakut tasmayla görünür (görseller hazır: `public/assets/scene/sans-*-ruby.webp`). Sınıf tasmasının bonusu sürer (yakut ayrı sayılır) | Türün en iyi satan tipi (Idle Miner "2x Income Forever", Double Cash $6,99). **2026-10-15:** altın tasma artık Milyarder'de bedava geliyor, ad ve görsel yakut oldu; ×2 yerine %50, çünkü ücretli bonus sonradan düşürülemez, yükseltilebilir. Bonus veren köpek değil, onun aksesuarı |
| **Yeni Başlangıç Paketi** | Tek seferlik | $2,99; ilk 3 gün hoş geldin fiyatı $1,49 | 4 saatlik ×2 hızlandırıcı + 1 saatlik gelir + Şans'a kırmızı fular: kalıcı +%10 gelir. 1. sınıf atlamadan sonra mağazada; ilk 3 gün $1,49 (geri sayım, "Sonra $2,99"), sonra $2,99'la satışta kalır (2026-10-15; önce yalnız 3 gün $1,99'du) | Başlangıç paketi rakiplerin hepsinde var ($1,99–4,99). İlk ödemeyi düşük tutarla almak için. "%50 indirim" ve üstü çizili fiyat yok: oyuncuya hiç uygulanmamış bir fiyattan indirim gibi görünür (AB Omnibus kuralı: indirim, son 30 günün en düşük fiyatına göre); "Hoş geldin fiyatı · Sonra $2,99" gerçeği söyler |
| **Gece Vardiyası Ekibi** | Kalıcı | $3,99 | Çevrimdışı oran %50 → %100 ve tavan +2 saat | Egg, Inc.'in Pro Permit karşılığı ($9,99). Kullanıcının "çevrimdışı fazla" gözlemiyle birlikte ayarlanmalı (discussion-notes §4) |
| **Para çantası** (ileride) | Tüketilir | $0,99–4,99 | "X saatlik gelir"; gelire oranlı | v1'de vardı (dinamik ölçekli). Lansmanda isteğe bağlı |
| **Sezon bileti, VIP abonelik** | — | — | Lansmanda yok | GPT Astra: erken aşamada odak dağıtır. Canlı etkinliklerle (Faz 3) değerlendirilir. Haftalık abonelik ($7,99/hafta örnekleri) güven açısından riskli |

**Mevcut 8 ürün (v1):** 4 para + 4 elmas paketi (`com.prestigelife.*`). v2'de elmas yok. Önerim: bu ürünleri Play Console'da pasifleştirmek, yeni ürünleri yeni kimliklerle açmak. Daha önce satın alanların hakları (tüketilir ürünlerdi) açısından sorun çıkmıyor.

**Ücretli aksesuarların dengesi (simülatör, 2026-10-15; sınıf tasmaları dahil):** ücretli aksesuarlar statü toplamına girmez, ayrı çarpandır ([game-design §4.4](./game-design-v2.md)). Oynanan süreyle:

| Profil | Milyarder | Multimilyarder | En Zengin | Fark (En Zengin) |
| --- | --- | --- | --- | --- |
| Bağlı, reklamsız | 1 sa 22 dk (2. gün 23:00) | 4 sa 42 dk (7. gün) | 10 sa 21 dk (15. gün) | — |
| + fular (+%10) | 1 sa 22 dk | 4 sa 17 dk (7. gün) | 9 sa 25 dk (14. gün) | −%9 |
| + reklam | 1 sa 8 dk | 3 sa 21 dk (5. gün) | 7 sa 8 dk (11. gün) | −%31 |
| + reklam + fular + yakut (+%50) | 53 dk (2. gün) | 2 sa 11 dk (4. gün) | 4 sa 28 dk (7. gün) | −%57 |

Fular küçük ve güvenli. Yakut %50 reklamla birleşince zirveyi yarıdan kısa sürede getiriyor ve ömrün kalan ~12 saati boş kalıyor. Yakutu %25'e indirmek bu oyuncuyu yalnız bir gün geciktiriyordu (7. gün yerine 8. gün), ürünü ise zayıflatıyordu. **Karar (kullanıcı, 2026-10-15): yakut %50 kalır, çözüm zirve sonrası içerik** (plan 2.12, Faz 2; adaylar [discussion-notes.md §2](./discussion-notes.md)). Simülatörde `RUBY_COLLAR_TRIAL`; ürün kodlanınca `config/iap.ts`'e taşınır.

## 6. Oyunda nerede görünecek?

- **Sahnenin sağında:** ×2 hızlandırıcı düğmesi (küçük bir kart açar); aktifken üst bardaki gelir satırında "×2".
- **Ödül kartları:** "Topla"nın üstünde turuncu "Reklam izle: +$X". Rahat Paket sahibinde aynı düğme hediye simgesiyle "Hemen al" olur.
- **Hayal, terfi ve işletme kartları:** az para kalmışken küçük "Reklam izle: +$X" düğmesi (X = eksik tutar).
- **Mağaza (karar 2026-10-14, kullanıcı):** ayrı bir Mağaza ekranı; sahnenin solundaki yuvarlak düğmelerin üçüncüsü (albüm, Zenginler Listesi, Mağaza), Gündelikçi töreninden sonra çıkar. Alt menüye 4. sekme eklenmedi. Sınırlı teklif varken düğmede kırmızı nokta. Alışveriş sekmesinin altında Mağaza'ya götüren bir şerit. Geri yükleme hem Mağaza'nın altında hem Ayarlar'da.
- **Hoş geldin kartı (karar 2026-10-14, kullanıcı):** Başlangıç Paketi'nin hoş geldin fiyatı sürerken bir kez, sakin bir anda (törenden ve bildirim sorusundan sonra, araya 2 dakika girer; açık sekme, kart ya da hikâye yokken) küçük bir kart: paketin görseli ve ödülleri, "Hoş geldin fiyatı: $1,49 · sonra $2,99", geri sayım, "Paketi incele" (Mağaza'yı açar, satın almaz) ve "Şimdi değil". Bir daha kendiliğinden çıkmaz.
- **Sahnede:** Başlangıç paketindeki fular (ileride yakut tasma); satın almanın görünür karşılığı. Sınıf tasmaları (deri, gümüş, altın) bedava ve törende ayrı kartla gösterilir.

## 7. Kurallar ve uyum (lansman öncesi zorunlu)

- **AdMob ödüllü reklam politikası:** Her reklamdan önce gerekli eylem ve ödül açıkça yazılır; oyuncu her reklamı tek tek kendisi seçer; reklam kapatılabilir olmalı. Rastgele ödülde ihtimaller ve bütün olası ödüller gösterilir ([AdMob politikası](https://support.google.com/admob/answer/7313578)).
- **AB, Birleşik Krallık, İsviçre izin ekranı:** Reklam kimliği kullanılmadan önce Google'ın UMP SDK'sı ile GDPR/TCF izni alınır; oyuncu izni sonradan geri alabilmeli (ayarlarda "Gizlilik seçenekleri") ([Google](https://developers.google.com/admob/ios/privacy/gdpr)).
- **iOS ATT:** Önce GDPR izni, sonra ATT izni; UMP ikisini sırayla gösterebilir. ATT'yi ilk açılışta değil, değeri anlatılabilen bir anda göstermek izin oranını artırır ([AppsFlyer](https://www.appsflyer.com/blog/tips-strategy/if-when-show-att-prompt/)).
- **Apple 3.1.1:** Dijital ürünler (kalıcı ×2, reklamsız paket) uygulama içi satın almayla satılır; dışarıya ödeme yönlendirmesi yok ([Apple forum](https://developer.apple.com/forums/thread/748871)). Kalıcı ürünler için **"Satın alımları geri yükle"** düğmesi gerekli.
- **Yaş sınıflandırması:** Simüle kumar yok. Hedef kitle çocuk değil (Families programına girmiyoruz); reklam içerikleri buna göre filtrelenir.
- **Kayıt:** Satın alınan kalıcı ürünler, kayıt silinse bile RevenueCat'ten geri yüklenebilmeli. Rakip yorumlarında "VIP'ye £60 verdim, hepsi gitti" şikâyeti var.
- **Play veri güvenliği beyanı (2026-10-15, AAB 28 için):** v2'nin veri gönderen SDK'ları AdMob, Firebase Analytics ve RevenueCat (Supabase v2 paketinde yok; kahramanın ve kızının adı telefonda kalır, analitiğe gitmez). Kaynaklar: [AdMob](https://developers.google.com/admob/android/privacy/play-data-disclosure) ("collects and shares"), [Google Analytics](https://support.google.com/analytics/answer/11582702), [RevenueCat](https://www.revenuecat.com/docs/platform-resources/google-platform-resources/google-plays-data-safety). Cevaplar: veri toplanıyor **evet**; aktarımda şifreli **evet**; hesap açma **yok**; silme isteği **evet**, e-postayla (gizlilik politikası §6, `mathgamesstudio@gmail.com`).

  | Veri türü | Toplanır | Paylaşılır | Amaç | Kaynak |
  | --- | --- | --- | --- | --- |
  | Konum → Yaklaşık konum | Evet | Evet | Reklam, Analiz, Dolandırıcılığı önleme | IP'den (AdMob, Analytics) |
  | Finansal bilgi → Satın alma geçmişi | Evet | Hayır | Uygulama işlevselliği, Analiz | RevenueCat, Analytics satın alma olayları |
  | Uygulama etkinliği → Uygulama etkileşimleri | Evet | Evet | Analiz, Reklam, Dolandırıcılığı önleme | Analytics olayları, AdMob |
  | Uygulama bilgisi ve performansı → Teşhis | Evet | Evet | Analiz, Dolandırıcılığı önleme | AdMob |
  | Cihaz veya diğer kimlikler | Evet | Evet | Reklam, Analiz, Dolandırıcılığı önleme, Uygulama işlevselliği | Reklam kimliği (AdMob, Analytics), uygulama örneği kimliği, RevenueCat anonim kimliği |

  Hepsi "zorunlu" (kullanıcı kapatamaz), "geçici değil". Toplanmayanlar: ad, e-posta, telefon, kesin konum, mesaj, fotoğraf, kişi, sağlık, dosya, takvim, web geçmişi. Paylaşım AdMob'dan (Google kendisi "shares" diyor); Analytics ve RevenueCat hizmet sağlayıcı sayıldığı için paylaşım değil. Fazla beyan sorun değil, eksik beyan Play'de ret sebebi.

## 8. Uygulama sırası

1. **Ekonomi ayarı (discussion-notes §4) ile birlikte:** ✅ reklam ödülleri ve "reklam izleyen" profili simülatörde (2026-10-12; sonuç §4 sonunda). ✅ 2026-10-15: "fular" ve "reklam + fular + yakut" profilleri (§5 sonunda).
2. **Reklam altyapısını v2'ye taşı:** ✅ 2026-10-08: `src/game/runtime/ads.ts` (AdMob 8.2.1, UMP + ATT, web'de sahte reklam, Ayarlar'da gizlilik seçenekleri). Ayrıntı: [mobile-ad-integration.md](./mobile-ad-integration.md). AdMob konsolunda GDPR mesajı kullanıcı tarafından oluşturulacak.
3. **Reklam yerleri 1–4:** ✅ 2026-10-12 (çevrimdışı +%30, Şans ×2, hızlandırıcı, biraz yardım).
4. **IAP, 1. adım:** ✅ kod 2026-10-14: Rahat Paket ve Yeni Başlangıç Paketi, geri yükleme (aşağıda "IAP nasıl çalışıyor"). Mağaza tarafı kullanıcıda. **2. adım:** Yakut Tasma (kalıcı +%50) ve Gece Vardiyası; ödeyen oyuncu simülasyonu yapıldı (§5), sıra Faz 2'de zirve sonrası içerikten sonra. v1 ürünleri pasifleştirilir.
5. **Analitik:** ✅ kod tamam (plan 1.14; `ad_watch`, sınıf atlama, oturum). Reklam teklifi ve satın alma olayları reklam yerleri ve IAP ile birlikte.
6. **Sonra:** ✅ tören ve hayat anı hediyesi ×2 (2026-10-14); ✅ günlük ödül ×2 (2026-10-15), olay kartı ikinci şans (2.4); zorla reklam ve fiyat A/B testleri (Faz 3).

### IAP nasıl çalışıyor (2026-10-14)

Kod: ürünler `core/config/iap.ts`, kurallar `runtime/purchases.ts`, mağaza `runtime/iap.ts` (RevenueCat, web'de geliştirme sırasında sahte mağaza), ekran `ui/shop/StoreSheet.tsx` (düğme, ekran, Alışveriş'teki şerit), hoş geldin kartı `ui/shop/OfferCard.tsx` (`StoryDirector` gösterir), geri yükleme `ui/shop/useRestore.ts`. Görseller `public/assets/iap/` (kaynak `art/pilot/15-iap/`).

**Görünüm (GPT tasarımı, 2026-10-14; [iap-store-design-handoff.md](./archive/iap-store-design-handoff.md)):** Başlangıç Paketi ve Rahat Paket'in kendi kartları var (`StoreSheet.tsx` `StarterCard`, `ComfortCard`, `ComfortActive`; parçalar `StoreParts.tsx`): rozet → ad → ana fayda + katmanlı görsel (Şans, para, madeni para, kum saati; kutu, kapak, madalyon; `public/assets/iap/v2/`, kırpılmadan, yerleşim yüzdeyle) → üç ödül kutucuğu ya da bonus şeridi → altın "Paketi al · fiyat" düğmesi. Hareket: kapak 3,6 sn'de hafifçe kalkıp iner, para destesi 3,2 sn'de yüzer, kart 200 ms'de belirir; `prefers-reduced-motion`'da hepsi durur. Renk ve ölçüler `mobile.css` `.v2-iap*` (yalnız mağaza; genel `Panel` ve `GameButton` değişmedi). Rahat Paket alınınca kompakt "Aktif" kartı; Başlangıç Paketi alınınca kart kalkar, üstte bir kez "Başlangıç Paketin hazır!" özeti. Satın alma sürerken düğmede "İşleniyor…", hata kartın altında. Hoş geldin kartı "Başlangıç teklifi" rozetiyle ve fiyatla ("Hoş geldin fiyatı: fiyat · sonra normal fiyat"; ücretli paket olduğu için "hediye" denmez), "Paketi incele" / "Şimdi değil", kapat düğmesi. Başlangıç Paketi'nin kartında hoş geldin fiyatı sürerken "Hoş geldin fiyatı" rozeti, geri sayım ve düğmenin altında "Sonra $2,99"; sonra "Tek seferlik" rozeti. Mağaza düğmesi 3D çanta. Yeni bir ürün kendi kartı yapılana kadar sade kartla görünür (`PlainCard`). Mağaza içi kısa ad TR "Başlangıç Paketi" (Play'deki ürün adı değişmedi).

**Ekranın düzeni (ileriye dönük, 2026-10-14):** ürünler bölümlere göre dizilir, boş bölüm görünmez: **Sınırlı teklif** (büyük kart, geri sayım; bugün Başlangıç Paketi, ileride etkinlik teklifleri), **Hep senin** (kalıcılar; bugün Rahat Paket, ileride Yakut Tasma ve Gece Vardiyası), **Para çantaları** (tüketilir, üçlü ızgara; bugün boş). Her üründe tür var: `permanent` (alınınca "Sahipsin" rozetiyle kalır), `once` (alınınca kaybolur), `consumable` (tekrar tekrar alınır, "sahip olunmaz", geri yüklenmez). Satışta olmayan ürün ekranda görünmez ("Yakında" kartı yok; karar 2026-10-14).

**Yeni ürün eklemek:** (1) `config/iap.ts`'te `ProductKey`'e ad ve `PRODUCTS`'a giriş (mağaza kimliği, tür, bölüm, görsel, madde sayısı, yedek fiyat, ödül, sınırlı süre), satışa çıkınca `PRODUCT_LIST`'e; (2) `public/assets/iap/<ad>.webp`; (3) `iap.<ad>.name` ve `line1..N` metinleri `en` ve `tr`'de; (4) Play Console ve RevenueCat'te ürün (tüketilir ürünse RevenueCat'te consumable). Ekran, fiyat, geri yükleme ve analitik kendiliğinden alır. Ürünün oyundaki etkisi (×2, çevrimdışı oranı) `runtime/purchases.ts` ve ilgili formüllerde ayrıca yazılır. Satıştan kalkan ürün `PRODUCT_LIST`'ten çıkar ama `PRODUCTS`'ta kalır: sahibinin kaydından silinmez, geri yüklenir.

| Ürün | Mağaza kimliği | Fiyat | İçerik |
| --- | --- | --- | --- |
| Rahat Paket | `v2_comfort_pack` | $7,99, kalıcı | Bütün ödüllü reklam düğmeleri reklamsız çalışır ("Hemen al", hediye simgesi; günlük sınırlar aynı); bir kez 2 saat ×2 |
| Yeni Başlangıç Paketi | `v2_starter_pack` ($2,99) ve hoş geldin fiyatı `v2_starter_pack_welcome` ($1,49) | tek seferlik; ikisinden biri alınınca paket alınmış sayılır | Bir kez 4 saat ×2 ve 1 saatlik gelir; Şans'a kırmızı fular: kalıcı +%10 gelir (`incomeBonus`, hayatlar boyunca; oturan Şans'ın üstüne çizilir, `sans-scarf.webp`). Kart, satın alma özeti ve paket satırı bonusu yazar |

- **Ne zaman görünür:** Mağaza Gündelikçi töreninden sonra açılır. Başlangıç Paketi o andan itibaren 3 gün hoş geldin fiyatıyla (`welcome`, ayrı mağaza ürünü: Play bir ürünü herkese aynı fiyatla satar, RevenueCat Play'in tek seferlik ürün indirimlerini henüz desteklemiyor), sonra normal fiyatla hep satışta; alınınca kaybolur. Kırmızı nokta ve hoş geldin kartı yalnız hoş geldin fiyatı sürerken. Herkese aynı anda indirim (kampanya) için yeni ürün gerekmez: Play Console'da fiyat değiştirilir; Rahat Paket alınınca "Sahipsin" rozetiyle kalır. Bu sürümden önce Gündelikçi'yi geçmiş oyuncuda 3 gün güncellemeden sonraki ilk açılışta başlar.
- **Ödüller:** hızlandırıcı süresi kalanın üstüne eklenir (4 saat tavanını aşabilir, ücretli); 1 saatlik gelir o anki oyun içi gelirle (yöneticiler, maaş, kira ve elle çalıştırılan işletmeler; 2026-10-14'e kadar yalnız otomatik gelirdi ve Gündelikçi'den hemen sonra $0'a yakın çıkıyordu). Bir ürün ikinci kez ödül vermez.
- **Kalıcılık:** satın alınan ürünler kayıtta (`purchases.owned`) ve hayatlar boyunca kalır. Her açılışta RevenueCat'e sorulur (`allPurchasedProductIdentifiers`; "Satın alımları geri yükle" de aynı listeyi ister). Kayıtta olmayan bir ürün listede çıkarsa **ödülleriyle** verilir (2026-10-14): ödendi ama uygulama kapandığı için kayda yazılmamış satın alma böylece eksiksiz gelir. Yeni telefonda ya da sıfır kayıtta tek seferlik ödüller bir kez daha gelir; bilerek kabul edildi.
- **Analitik:** `offer_view`, `offer_card` (`opened`), `purchase_start`, `purchase_result` (`purchased` / `cancelled` / `unavailable`), `purchase_applied` (`source`: `purchase` / `open` / `restore`; ödül kayda yazıldı), `purchase_revoked`, `purchase_restore`; reklamsız ödül `ad_watch` (`outcome: ad_free`). Firebase'de `purchase_result: purchased` ile `purchase_applied` (`source: purchase`) sayıları denk olmalı; fark teslimat sorunudur.
- **İade (2026-10-14, kapalı):** `REVOKE_REFUNDS` (`config/iap.ts`) açılınca RevenueCat'in listesinde artık olmayan ürün kayıttan çıkar: Rahat Paket'in reklamsızlığı ve fular gider, harcanmış ödüller kalır. Yalnızca gerçek mağazanın başarılı cevabıyla, hata ve sahte mağazada asla. **Açmadan önce:** lisans test hesabıyla satın al → Play Console'dan iade et → RevenueCat'te ürünün listeden düştüğünü gör; ayrıca uygulamayı silip yeniden yükle ve iade edilmemiş ürünün listede kaldığını doğrula (yeni anonim RevenueCat kimliği iade gibi görünmemeli).
- **Deneme:** DEV sürümü (`.dev` paketi) Play'de olmadığı için satın alma "Mağazaya ulaşılamadı" der; web geliştirmede sahte mağaza her zaman "evet" der. Gerçek deneme: Play'in dahili test kanalına yüklenen sürüm + lisans test hesabı (ücret alınmaz).

### Destek: "Ödedim ama gelmedi" (2026-10-14)

1. Oyuncudan Google'ın e-posta makbuzundaki **sipariş numarasını** (`GPA.…`; Google Play → profil → Ödemeler ve abonelikler → Bütçe ve geçmiş) ve **Ayarlar → Oyuncu kimliği**'ni iste (kopyala düğmesi var; RevenueCat'in anonim kimliği).
2. **Play Console → Para kazanma → Siparişler**'de sipariş numarasını ara: ödeme alındı mı, ürün, tarih, iade. Bulunmuyorsa iddia gerçek değil.
3. **RevenueCat → Customers**'ta oyuncu kimliğiyle ara: satın alma geçmişi. Kimlik yeniden yüklemede değişebilir; sipariş numarası her zaman geçerli.
4. Çözüm sırası: oyuncu **Satın alımları geri yükle**'ye basar (eksik ürün ödülleriyle gelir) → olmazsa **Play Console promosyon kodu** (uygulama içi ürün için; oyuncu Play Store'da kullanır, normal satın alma gibi gelir) → o da olmazsa siparişi Play Console'dan iade et. Oyunun sunucusu yok; uzaktan ödül göndermenin yolu promosyon kodu.
5. **RevenueCat → Firebase (Google Analytics):** RevenueCat gerçek satın almaları Firebase'e `purchase` (gelirle), iptal/iadeyi `rc_cancellation` olarak gönderir. Kod tarafı hazır (2026-10-14): açılışta oyuncunun Firebase kimliği RevenueCat'e verilir (`runtime/iap.ts`, `setFirebaseAppInstanceID`); bu olmadan olaylar Firebase'e ulaşmaz, yeni sürüm yüklenene kadar çalışmaz. Panel: RevenueCat → Integrations → Firebase → **Google Analytics** bölümü: Android uygulamasının **Firebase App ID**'si ve **Measurement Protocol API secret** (ikisi de Firebase konsolu → Analytics → Admin (Yönetici) → Data Streams (Veri akışları) → Android akışı), gelir para birimi ve brüt/net seçimi. **RevenueCat Firebase Extension** bölümü gerekmiyor (Firestore ve Blaze ücretli planı ister). Deneme: lisans hesabıyla satın al → Firebase → Realtime'da `purchase`.

**Mağaza kurulumu (kullanıcı):**

1. **Play Console** → uygulama → Para kazanma → Ürünler → Uygulama içi ürünler: `v2_comfort_pack` ($7,99), `v2_starter_pack` ($2,99) ve `v2_starter_pack_welcome` ($1,49), üçü de etkin (tanımlandı, 2026-10-15). Adlar ve açıklamalar TR/EN; ad en fazla 55, açıklama en fazla 200 karakter. Ürünlere görsel eklenmez; satın alma penceresi uygulama ikonunu ve ürün adını gösterir.

   | Ürün | Ad (TR / EN) | Açıklama (TR / EN) |
   | --- | --- | --- |
   | `v2_starter_pack` | Yeni Başlangıç Paketi / Fresh Start Pack | 4 saat ×2 gelir, hemen 1 saatlik gelir ve Şans için kırmızı fular: tüm gelire kalıcı +%10. Tek seferlik satın alma. / 4 hours of ×2 income, 1 hour of income right away, and a red scarf for Lucky: +10% to all income, for good. One-time purchase. |
   | `v2_starter_pack_welcome` | Yeni Başlangıç Paketi – Hoş Geldin Fiyatı / Fresh Start Pack – Welcome Price | Yukarıdakiyle aynı |
   | `v2_comfort_pack` | Rahat Paket / Comfort Pack | Reklam ödülleri reklamsız, bir kez 2 saat ×2 |
2. **RevenueCat** → proje → Products: üç ürünü Play (ve sonra App Store) için ekle, **tüketilmeyen (non-consumable)** olarak işaretle; yoksa Android'de satın alma tüketilir ve geri yükleme çalışmaz.
3. **Lisans testi:** Play Console → Ayarlar → Lisans testi'ne kendi Google hesabını ekle.
4. **App Store** (iOS sürümünde): aynı kimliklerle "Non-Consumable" ürünler.
5. v1'in 8 ürününü pasifleştir (§5).

## 9. Kararlar (kullanıcı, 2026-10-08)

Altı sorunun hepsi önerildiği gibi onaylandı (sonradan değişenler: Altın Tasma ×2 → Yakut Tasma +%50, Başlangıç Paketi $1,99 → $2,99 ve hoş geldin fiyatı $1,49, reklam yerine 5. olarak tören hediyesi; 2026-10-14/15): lansmanda zorla reklam yok (sonra A/B testi); reklam yerleri 1–4'ün hepsi; hızlandırıcı 1 saat ×2, en fazla 4 saat, günde 6; IAP listesi ve fiyatları (Rahat Paket $7,99, Şans'ın Altın Tasması $4,99, Yeni Başlangıç $1,99, Gece Vardiyası Ekibi $3,99) ve adları; lansmanda premium para birimi yok; v1'in 8 ürünü pasifleştirilip yenileri açılır.

Karar verilirken tartılan risk: "Hayaline yardım" (ihtiyaç anında para) v1'deki "asıl para reklamdan" hissini geri getirebilir; bu yüzden yalnızca eksik fiyatın %10'undan ve 5 dakikalık gelirden azken çıkar ve eksik tutarı verir (2026-10-14).
