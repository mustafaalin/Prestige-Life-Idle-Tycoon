# Tartışma notları (sonra konuşulacak)

Kararı henüz verilmemiş konular ve Claude'un önerileri. **Karar verilince ilgili belgeye (plan, hikâye, tasarım, monetizasyon) taşınır ve buradan silinir**; burada yalnızca açık konular durur.

Son güncelleme: 2026-10-16 (oyunun baştan sona incelemesi: hanedan matematiği §3, hikâye §7; Burak hattı kararı story-v2 §6a)

## 1. Görsel

Yaklaşım (görsel roman) ve stil (yarı 3D) kararlaştı: [story-v2.md §8](./story-v2.md). Açık kalanlar:

- **Okşama pozunda tasma ve fular sabit (AAB 28 telefon testi):** `hero-*-pet-sans.webp` kahramanla Şans'ı tek resimde çiziyor; o resimdeki tasma (çoğunda ip, dedede altın) her zaman görünür, fular okşarken kaybolur. Oturan, cüzdanlı ve uyuyan Şans'ta fular ve tasma 2026-10-16'dan beri doğru (fularlı ikiz görseller). Seçenekler: poz başına tasma/fular varyantı (8 poz × 5 tasma, çok) ya da yalnız ücretli olanlar (fular, yakut) için varyant; karar bekliyor.
- **İki çizim dili:** önsöz, sokak kahramanı, ana kadro portreleri ve fal.ai'nin lüks anı kareleri çizgili ve düz boyalı; evler, kıyafetler, tören kareleri ve mağaza parlak 3D. En görünür yer önsöz (ilk 40 saniye) ile ana ekranın farkı. Önsözün 3D denemesi hazır (`art/pilot/04-prologue/prologue-4-door-3d.png`, karşılaştırma `art/pilot/reviews/prologue-door-style-comparison.jpg`); kullanıcının kararı bekleniyor. Uygunsa kalan beş kare, sonra sokak kahramanı.
- **Lüks oyuncaklar sahnede (plan 2.6):** jet ve helikopter ara sıra geçer, yat sahil evinde, tekne göl evinde. Mağaza görselleri 3/4 açıyla çizildi; önce yerleşim denemesi, gerekirse uçuş ve su üstü açıları.
- **Kahraman yaşlanmıyor:** 60 yaştan sonrası için dede görünümü kararlaştı (2026-10-15, §3). 31'inde baba, 59'unda En Zengin olan kahramanın 23'lük görünmesi şimdilik kalıyor; yaş temposu (§2) değişirse sorun küçülür.
- **Oyun testinden sonra:** annenin mesajında telefona bakan kahraman pozu (kıyafet başına bir görsel); apartman evlerinde iç mekân (şimdilik dış mekân, çünkü araç görünmeli). Önerilmeyen: araca yaslanma gibi araca bağlı pozlar (12 aracın boyu farklı).
- **Özel anlar için video (isteğe bağlı):** 2–3 büyük anda kısa yapay zekâ videosu (Higgsfield MCP: `claude mcp add --transport http higgsfield https://mcp.higgsfield.ai/mcp`; yedek fal.ai). Her üretimden önce maliyet söylenir. İskeletli 2D (Spine / Rive) ancak oyun testi "karakter hareketi şart" derse.
- **Remotion (React ile video):** mağaza tanıtım videosu ve reklamlar (TR/EN, dikey/yatay) için yayından önce repoda ayrı bir `video/` klasöründe kurulsun; oyun içinde gerek yok.

## 2. Zirveden sonrası (plan 2.12, Faz 2; kullanıcı 2026-10-15)

En Zengin'den ömür sonuna (80 yaş) kadar yeni hedef yok: reklamsız bağlı oyuncuda ~6,5 saat oyun (En Zengin 10 sa 21 dk, ömür 16 sa 48 dk), reklam + fular + yakut oyuncusunda ~12 saat (En Zengin 4 sa 28 dk, jet 6 sa 2 dk). Ödeyen oyuncu, en değerli oyuncu, oyunu en erken bitiriyor. Kullanıcı yakutu %50'de tuttu; çözüm içerik.

**Kararlaşanlar (kullanıcı 2026-10-15; araştırma ve simülatör ölçümü: AdCap, Cookie Clicker, Egg, Inc., BitLife):**

- **1. Görünür miras ve seçim:** En Zengin'den sonra ekranda canlı "Varisine bırakacağın" sayacı (puan ve gelir etkisi); "Şimdi devret" ya da "Kal, biriktir". Bugünkü kural (game-design §4.9: devir yalnız ömür sonunda) değişir. Ölçüm: zirve sonrası ~7,5 saat toplam kazancı ~14 kat, miras puanını ~2,5 kat artırıyor ama oyuncu bunu görmüyor.
- **2. Yadigâr mağazası (plan 2.2):** miras puanı otomatik +%1 yerine kalıcı aile yadigârlarına harcanır; her yadigârın sınırı var, böylece varisin hızı da sınırlanır. Miras formülü aynı işte yeniden ayarlanır: varis zirveye dakikalarda değil birkaç saatte varsın (bugün 2. nesil 40 dk, 3. nesil 6,5 dk; erken devirde her nesil ~50 dk).
- **3. 2. nesil yeni şehirde (plan 2.3):** yeni işletmeler (kullanılmayan görsellerden), yeni evler, sınıf eşikleri ve fiyatlar şehirle yükselir; görevler, törenler ve hayat anları torunun.
- **Yayın:** 1, 2 ve 3 birlikte yayınlanır (erken devir tek başına aynı merdiveni ~1 saatte tekrar tırmandırıyor). 1 ve 2 önce yapılıp test edilir.
- **Erken devir, yıllar atlanır (kullanıcı onayladı):** "Şimdi devret" kalan yılları atlar; "Yıllar geçti…", sonra torunun doğumu (63), dede ve torun (70), devir (80) art arda. Neden: En Zengin 55–57 yaşta, torun 63'te doğuyor.
- Bütün kararların toplu hâli: [game-design-v2.md §4.5](./game-design-v2.md) (kurallar, ölçüm) ve [story-v2.md §6](./story-v2.md) (varisler, dede). Açık: yadigâr listesinin onayı (öneri §4.5'te).

Kalan adaylar (sonra):

- **Vakıf zinciri:** annenin ve Rıza Amca'nın hikâyesine bağlı büyük hayaller (mahalle kütüphanesi, babanın adına burs, Rıza'nın atölyesi), her biri bir hayat anı. En duygusal, en pahalı (yazı ve kare). Hikâyenin "4. perde"si ([story-v2.md §7](./story-v2.md)).
- **Yaş temposu (yapıldı 2026-10-16, §3.5: En Zengin'den sonra 4 kat hızlı; zirve yaşı 51'de kaldı):** zirveye kadar yıllar yavaş (zirve ~40 yaş), sonra hızlı. İçerik eklemeden boş saatleri kısaltır; annenin (En Zengin'de ~87) ve Rıza'nın yaşını makul yapar; En Zengin karesinde ailenin yokluğu da daha az göze batar.
- **Aynı yerde duran küçük sorular:** annenin mesajları En Zengin'den sonra biter mi (kanal Defne ve kızına geçebilir); Şans'ın yerini yavrusu alır mı; "65 yaşındasın" gibi ömür sonu hatırlatması (zirveye varamamış oyuncunun "sonu göremedim" hissi).

## 3. Hanedan (plan 2.1; [story-v2.md §6](./story-v2.md))

Kararlaşanlar: varis 17 yaşında torun (kızının çocuğu), devir 80 yaşında, ölüm gösterilmez, eş Defne. 2026-10-15: 2. nesil yeni şehirde (§2); kahramanın dede görünümü (aşağıda). Açıklar:

1. **Varislerin cinsiyeti kararlaştı (2026-10-15):** 2. nesil kız torun (sabit), 3. nesil erkek (ilk kahramanın görselleri), sonra sırayla ([story-v2.md §6](./story-v2.md)). Torunun varsayılan adı önerisi Ada.
2. **2. neslin başlangıcı ve şehri (2026-10-16):** karar: yöneticiler insan, Lumen'e özgü 10 yeni kişi (robot fikri bırakıldı, 2026-10-16); yönetici setleri nesiller arasında döner, dönen setin kişileri öncekilerin torunları, isimler nesil başına, olay kartları işletmeye bağlı; Burak'ın yeri 3. nesilden itibaren yeni bir yüz (story §3 "Nesiller boyunca yöneticiler"); 3. nesil eski şehre ve ilk kahramana döner, nesiller iki set arasında döner (story §6); v1 görseli kullanılmaz. Açık: işletme ve ev listesinin onayı (aşağıda öneri).
   - Karar (2026-10-16, kullanıcı): Lumen'in fütürizmi **A**: "bugünün modern şehri + birkaç gelecek dokunuşu" (yeşil kuleler, güneş camları, dronlar; neon ve uçan şehir yok), sıcak gün batımı ışığı; stil cümlesi [art-prompts-lumen.md](./art-prompts-lumen.md).
   - Karar (2026-10-16, kullanıcı): rakamlar 1. nesille aynı; varis kapsül odada, 2 Çiçek Tezgâhı ve yöneticisiyle başlar.
   - Öneri listesi: işletmeler Çiçek Tezgâhı, Kahve Barı, Telefon Tamircisi, E-Scooter Kiralama, Dikey Tarla, Sanal Gerçeklik Salonu, Dron Kargo, Güneş Santrali, Biyoteknoloji Laboratuvarı, Yörünge Oteli; evler kapsül oda → kulenin tepesinde malikâne (12). Robot geçen adlar çıktı (kullanıcı 2026-10-16: Kahve Barı, Telefon Tamircisi). Komutlar bu listeyle yazıldı ([art-prompts-lumen.md](./art-prompts-lumen.md)); öneri: Yörünge Oteli yerine Yapay Zekâ Kampüsü (uzay oteli A kararıyla çelişir).
3. **2. nesil kıyafet ve poz seti:** aynı sayıda yeni set; dededen kalan bir yadigâr (babanın saati) hep görünsün. Torunun yanında Şans'ın yavrusu (öneri).
4. **Rehber:** dede, toruna Rıza Amca'nın rolünü üstlenir (rehber balonları, olay kartları); annenin mesaj kanalı kızına ve dedeye geçer (öneri).
5. **Hanedan matematiği (karar 2026-10-16, kullanıcı: paket uygun; oyunda, kurallar game-design §4.5, §4.9):** inceleme, 200 günlük simülatör: yadigârlar varisi yavaşlattı ama döngü 3. nesilde duruyordu.
   - Hep erken devreden aile: puan 1.017 → 261 → 187 → 154 → 125, her nesil zirveye 4 sa 26 dk (hızlanma yok). Ömrünü dolduran: 2.531 → 6.647 puan, ama zirveden sonra 7,6 → 13 → 14 saat hedefsiz oyun. "Şimdi devret" ekonomide hep kaybettiriyordu (saat başı puan: erken devir ~110, zirve sonrası ~200).
   - Kök neden: puan ailenin bütün kazancının küpküküydü (geçmiş büyüdükçe yeni neslin payı küçülür) ve yadigâr fiyatı her seviyede ×2, etkisi toplamalı (saat +%30). AdVenture Capitalist'te melekler harcanmaz ve her biri bütün kazanca kalıcı +%2 verir, tur tur hızlanır.
   - **Uygulanan paket** (kopya simülatörde denendi, 240 gün): (1) puan her neslin kendi kazancından, `10 × (nesil kazancı / $1M)^(1/3)`; (2) yadigâr fiyatı her seviyede ×1,5 (×2 yerine); (3) En Zengin'den sonra yaş 4 kat hızlı akar.

     | Bağlı oyuncu | Bugün, ömrü doldurur | Bugün, hep erken devreder | Paket, ömrü doldurur | Paket, hep erken devreder |
     | --- | --- | --- | --- | --- |
     | 1. nesil (zirve / ömür / puan) | 9,2 / 16,8 sa / 2.531 | 9,2 sa / 1.017 | 9,2 / 11,1 sa / 1.242 | 9,2 sa / 1.017 |
     | 2. nesil | 3,9 / 16,8 sa / 6.647 | 4,4 sa / 261 | 4,0 / 7,2 sa / 2.479 | 4,0 sa / 1.011 |
     | 3. nesil | 3,3 / 16,8 sa / 3.181 | 4,4 sa / 187 | 3,4 / 6,8 sa / 3.143 | 3,4 sa / 1.019 |
     | 5. nesil | 3,1 / 16,8 sa / 1.846 | 4,3 sa / 125 | 2,7 / 6,3 sa / 3.782 | 2,9 sa / 1.020 |
     | 8. nesil | 3,1 / 16,8 sa / 1.173 | 4,3 sa / 85 | 2,4 / 6,0 sa / 4.271 | 2,7 sa / 1.000 |

     Paketle zirve sonrası boşluk 7,6–13,7 saatten ~3,5 saate iniyor; erken devir artık her nesil ~1.000 puan veriyor ve varisler yavaş yavaş hızlanıyor (4,0 → 2,7 sa). Ömrü doldurmak hâlâ saat başı daha çok puan veriyor (~460'a ~300), ama erken devir cezalandırılmıyor. Gündelik oyuncunun ilk ömrü 67 günden 35 güne, reklam + fular + yakut oyuncusununki 24 günden 11 güne iniyor (zirve sonrası 12,6 → 3,1 sa). Tek başına ×1,5 ya da tek başına yaş hızlanması yetmiyor (puan yine nesil nesil düşüyor). Etkiler: "İlk ömür sonu" hedefi 21–37. günden 15–21. güne çekildi (simülatör: bağlı 16. gün, gündelik 35. gün); eski kayıtlar güvenli (puan kayıtta toplam olarak durur; ×1,5'te alınmış seviyelerin bedeli düşer, oyuncu puan kazanır, kaybetmez). Yeni şehirde formüldeki $1M o şehrin ölçeğiyle değişir.
6. **Burak hattının açıkları (karar story-v2 §6a; hat yalnız ilk iki nesilde, 3. nesilde devam etmez, kullanıcı 2026-10-16):** Burak'ın yaşı kapandı (2026-10-16, kullanıcı: yaş söylenmez, eski çalışan olarak kalır, 2. nesilde orta yaşlı çizilir); tezgâh sayısı (2, yöneticili) ve Burak'ın serveti (rakamlar aynı, $950B) kapandı; Burak 2. nesilde olay kartı ya da anne mesajı kanalından da konuşur mu.

**Kahramanın dede görünümü (karar 2026-10-15, kullanıcı: B):** 60 yaştan sonra kahraman tek bir dede görünümüne geçer (kır saç, gözlük, yelek, babadan kalan saat): 3 sahne pozu (duruş, sevinç, Şans'ı sevme) + 4 portre. Kıyafetlerin gelir bonusu sürer, görünüm yaşa bağlı. Aynı dede 2. nesilde rehber. Torunla aynı üretim turunda yapılır (yüz tutarlılığı). Ayrıca gereken: yetişkin kızın kılavuz görseli (hiç tasarlanmadı); yaşlı Defne konuşacaksa 4 portre. 31 yaşındaki babanın 20'lik görünmesi şimdilik kalır (yetişkin dönemi her kıyafetin yeniden üretimi demek).

## 4. Ekonomi

Kurallar ve sayılar [game-design-v2.md §4–5](./game-design-v2.md). Çevrimdışı oran ve tavan kararlaştı (%50, geç oyunda 2 sa; 2026-10-13). Açıklar:

- **Faz 1 kapısı yeniden yazılmalı:** "ilk oturumda Orta Sınıf ≥ %60" güncel tempoda tutmuyor (botta Orta Sınıf 30. dk, 1. günün 2. oturumu; ilk oturumda Gündelikçi ve İşçi törenleri geliyor).
- **Erken oyun telefonda bakılacak:** ucuz tezgâh, $1K yönetici, ilk yöneticiye kadar sık gelen Şans. Elle çalışan tezgâhın geliri üst barda görünmüyor (kullanıcı: yönetici atanınca görünsün). Hâlâ boş geliyorsa yeni bir uğraş.
- **Çevrimdışı ödül erken sınıflarda:** kullanıcı erken oyunda fazla buluyor; erken sınıfların tavanları (10 dk → 1 sa) hiç denenmedi. Ölçüm: paranın ~%87'si çevrimdışı kartlardan geliyor; oran ve tavan payı pek oynatmıyor (%78–91), tempoyu ve "ne sıklıkla dönmeli" hissini belirliyor.
- **Kariyer / işletme dengesi:** ilk 4 dk gelir tamamen maaş, sonra hızla işletmelere geçiyor (ömür boyunca ortanca %95). "Başta kariyer" daha uzun sürsün mü?
- **"Biraz yardım" düğmesinin yazısı:** kullanıcı ilk bakışta anlamadı. Fikir: "Reklam izle, hemen al: +$X" (`ads.help`).
- **Yöneticisiz işletmeye dokunma:** AdCap modeli ("Çalıştır" → tek döngü). "Dokundukça hızlanır" alternatifi oyun testinden sonra.

## 5. Simülatörün sınırları (GPT Astra incelemesi, doğrulandı)

- Bot yöneticisiz işletmeleri %60 verimle çalışıyor sayıyor (`ACTIVE_UNMANAGED_EFFICIENCY`); gerçekte yalnız "Çalıştır"la başlatılan döngü ödenir.
- Bot açgözlü ve optimal; menü okuma, hikâye izleme, kararsızlık yok. "Gerçek oyuncu 1,3–1,8 kat yavaş" tahmin; kullanıcının gözlemi tersine "hızlı".
- Eklenebilecek profiller: ilk 2 dakikada çıkan, yöneticiyi geciktiren, günde iki kez dönen, 24 saat ara veren.
- Gerçek doğrulama oyun testi ve analitikle (plan 1.14–1.15).

## 6. İlerleme hissi (2026-10-11 gözlemi, güncellendi 2026-10-15)

Fakirlikten zenginliğe geçiş ilk ~2 saate sıkışıyor. O günden beri iyileşenler: İşçi töreni ilk oturuma girdi (25. dk), kapanış kartı gerçekten değişeni gösteriyor, tasma kartı ve hediye eklendi, lükslerin her biri bir an getiriyor, Zenginler Listesi geç oyunda sıra gösteriyor. Hâlâ açık:

1. **Erken evler çok kısa, son evler çok uzun:** kiralık oda ~5 dk, eski daire ~8 dk; büyük malikâne 8 saatten fazla.
2. **Zirveden sonrası boş** (§2).
3. **Hayaller panosu** (plan 1.8): ana ekranda zincirin sıradaki adımı hep belli olsun.
4. **Eksik his parçaları:** yağmur ve ortam sesi, müzik, paranın fiziksel hâli (cüzdan → kasa → altın oda), işletmeden uçan "+$1.2K".

## 7. Hikâye

- **İki anne mesajını kimse görmüyor:** İşçi ve Orta Sınıf mesajları (perdeler, basamak) hiçbir profile yetişmiyor (günde bir mesaj kuralı); "basamak"ın geçerliliği Milyoner'e uzatılırsa gündelik oyuncu görür. Şimdilik kabul edildi.
- **En Zengin karesinde aile yok:** kahraman o yaşta evli ve kızı 28 yaşında; karede ve metinde yalnız anne ve kahraman var, Şans da yok.
- **Hikâye ayrıntıları:** anne, eşinin en yakın arkadaşı Rıza'yı tanıyor olmalı; kahraman ona Rıza'dan hiç söz etmemiş gibi duruyor.
- **Şans'ın getirdiği şey sınıfa göre değişsin mi** (mekanik aynı): sokakta cüzdan, ileride başka şeyler.
- **Hayat anlarının izi ana ekranda:** Defne ve kızından mesajlar (öneri; [story-v2.md §7](./story-v2.md)).
- **Lüks anlarında yan karakterlerin yaşı (inceleme 2026-10-16):** lüksler paraya, yaş zamana bağlı; bağlı botta helikopter ~59, jet ~70 yaşta. Helikopterde Rıza (~105) tezgâhta el sallıyor, jette Rıza (~115) ve Nevin Hanım (~120) uçakta. Öneri (yalnız metin): helikopterde *"Tezgâh hâlâ yerinde"*; jette kurabiyeleri Defne getirir (*"Babaannemin tarifi"*), Rıza'nın sorusunu Elif sorar (*"Nereye gidiyoruz baba?"*). Ayrıca 60 yaştan sonraki karelerde kahraman genç, sahnede dede.
- **Babanın saati hikâyede hiç ortaya çıkmıyor:** devir ona dayanıyor ama kahramanın saati nereden bulduğu anlatılmıyor (takım elbiseden beri bileğinde). Öneri: Milyoner töreninde Rıza babayı tanıdığında tek balon: *"Mehmet bunu bana emanet etmişti. Sahibine döndü."* (takım elbise de Milyoner'de açılır).
- **Olay kartları çok tekrar ediyor (inceleme):** Orta Sınıf'tan ömür sonuna ~190 çağrı, 10 kart: her kart ~20 kez. Büyük set (2.4) gelene kadar: hepsi görülmeden tekrar yok, günde en fazla ~6 kart.
- **Olay kartları:** ödül sayıları ve sıklık (45 / 100 / 10 sn gelir, 4–6 dk) telefonda denenmedi; kötü sonuçta reklamla "ikinci şans" (monetizasyon #7).

## 8. Diğer

- **Zenginler Listesi:** benzetme isimlerin hukuki riski (Claude'un notu: Hindistan'daki "Selmon Bhoi" davası; portre, şirket adı ve logo yok, ton alaycı değil; kullanıcı benzetme isimleri seçti). Düğmenin yeri ve kartın sıklığı telefonda bakılacak.
- **Başarımlar:** Google Play Games başarımları olarak yapılacak (kullanıcı, 2026-10-15; sonra), plan 2.13. Liderlik tablosu sonra.
- **Fiyat A/B testleri:** Başlangıç Paketi'nin normal fiyatı ($2,99) ve hoş geldin fiyatı ($1,49) ileride Remote Config ile denenebilir (Faz 3).

## 9. AAB 28 telefon testinden (kullanıcı, 2026-10-15)

- **Açıklama metinleri çok (kullanıcı: "azaltalım", yerlerini kendisi gösterecek):** kartların ve düğmelerin altındaki küçük açıklamalar. Kullanıcı yerleri söyleyince tek tek kısaltılacak ya da kaldırılacak.
- **Çevrimdışı kartı ve Rahat Paket:** kart 10 dakikadan kısa ayrılıkta ek teklif göstermiyor (`AD_OFFLINE_MIN_SECONDS`), bu yüzden testte yalnız "Topla" vardı. Kullanıcı, paket sahibine "+%30 senin" gibi bir şeyin açıkça söylenmesini istiyor; 10 dakika eşiği ve "Hemen al +%30" metni yeniden ele alınacak.

