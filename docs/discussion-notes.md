# Tartışma notları (sonra konuşulacak)

Kararı henüz verilmemiş konular ve Claude'un önerileri. **Karar verilince ilgili belgeye (plan, hikâye, tasarım, monetizasyon) taşınır ve buradan silinir**; burada yalnızca açık konular durur.

Son güncelleme: 2026-10-15 (AAB 28 telefon testi bulguları §9; okşama pozunda tasma §1)

## 1. Görsel

Yaklaşım (görsel roman) ve stil (yarı 3D) kararlaştı: [story-v2.md §8](./story-v2.md). Açık kalanlar:

- **Fular bütün pozlarda görünmüyor (GPT görsel incelemesi, 2026-10-14; kodla doğrulandı):** ücretli kırmızı fular yalnız oturan Şans'ın üstüne çiziliyor (`Scene.tsx` `hasScarf`). Cüzdanlı Şans, uyuyan Şans (çevrimdışı kartı) ve kahramanın okşama pozlarında yok; satın alınan aksesuar kayboluyor. Öneri: önce aynı fular görselini poz başına boyun noktasına yerleştirmeyi denemek (yeni üretim yok); boyun açısı uymazsa 2–3 açı varyantı. Yakut tasma gelince aynı soru onun için de geçerli. **Güncel (2026-10-15):** bindirme yerine fuların çizildiği 15 görsel (5 tasma × 3 poz) üretilecek; GPT görevi [tamamlanan GPT görevi](./archive/gpt-sans-scarf-task.md).
- **Okşama pozunda Şans hep ip tasmalı (AAB 28 telefon testi):** `hero-*-pet-sans.webp` kahramanla Şans'ı tek resimde çiziyor; fular da sınıf tasmaları (deri, gümüş, altın) da okşarken kayboluyor, ip tasma geri geliyor. Kullanıcı fularlı Şans'a dokununca fark etti. Bir üstteki maddeyle aynı iş: boyun noktasına bindirme ya da poz başına tasma varyantı.
- **İki çizim dili:** önsöz, sokak kahramanı, ana kadro portreleri ve fal.ai'nin lüks anı kareleri çizgili ve düz boyalı; evler, kıyafetler, tören kareleri ve mağaza parlak 3D. En görünür yer önsöz (ilk 40 saniye) ile ana ekranın farkı. Önsözün 3D denemesi hazır (`art/pilot/04-prologue/prologue-4-door-3d.png`, karşılaştırma `art/pilot/reviews/prologue-door-style-comparison.jpg`); kullanıcının kararı bekleniyor. Uygunsa kalan beş kare, sonra sokak kahramanı.
- **Lükslerin kesim kalıntıları:** sürat teknesi ve yatın sol altında gri gölge, jetin ve helikopterin bazı kenarlarında açık gri. Yeni tasarım değil, kesim temizliği; beyaz gövdeler delinmeden.
- **Lüks oyuncaklar sahnede (plan 2.6):** jet ve helikopter ara sıra geçer, yat sahil evinde, tekne göl evinde. Mağaza görselleri 3/4 açıyla çizildi; önce yerleşim denemesi, gerekirse uçuş ve su üstü açıları.
- **Kahraman yaşlanmıyor (kullanıcı: şimdilik kalsın):** 31'inde baba, 59'unda En Zengin olan kahraman 23'lük görünüyor. Seçenekler: 3 görünüm (genç, yetişkin, kır saçlı) ya da yalnız portreler yaşlanır. Yedi kıyafet ve bütün kareler genç yüzle üretildi; yaşlanan görünüm onların da yeniden üretilmesi demek. Yaş temposu (§2) değişirse sorun küçülür.
- **Oyun testinden sonra:** annenin mesajında telefona bakan kahraman pozu (kıyafet başına bir görsel); apartman evlerinde iç mekân (şimdilik dış mekân, çünkü araç görünmeli). Önerilmeyen: araca yaslanma gibi araca bağlı pozlar (12 aracın boyu farklı).
- **Özel anlar için video (isteğe bağlı):** 2–3 büyük anda kısa yapay zekâ videosu (Higgsfield MCP: `claude mcp add --transport http higgsfield https://mcp.higgsfield.ai/mcp`; yedek fal.ai). Her üretimden önce maliyet söylenir. İskeletli 2D (Spine / Rive) ancak oyun testi "karakter hareketi şart" derse.
- **Remotion (React ile video):** mağaza tanıtım videosu ve reklamlar (TR/EN, dikey/yatay) için yayından önce repoda ayrı bir `video/` klasöründe kurulsun; oyun içinde gerek yok.

## 2. Zirveden sonrası (plan 2.12, Faz 2; kullanıcı 2026-10-15)

En Zengin'den ömür sonuna (80 yaş) kadar yeni hedef yok: reklamsız bağlı oyuncuda ~6,5 saat oyun (En Zengin 10 sa 21 dk, ömür 16 sa 48 dk), reklam + fular + yakut oyuncusunda ~12 saat (En Zengin 4 sa 28 dk, jet 6 sa 2 dk). Ödeyen oyuncu, en değerli oyuncu, oyunu en erken bitiriyor. Kullanıcı yakutu %50'de tuttu; çözüm içerik. Adaylar (karar yok):

- **Erken emeklilik:** En Zengin töreninden sonra "Devret" açılır, ömür sonu beklenmez. Kullanıcı "olabilir" dedi (2026-10-15); bugünkü kural (game-design §4.9: devir yalnız ömür sonunda; 2026-10-08'de "erken devir olmasın" denmişti) değişir. Miras puanı kazanılan paraya bağlı, erken devreden daha az puan alır: bir "erken devir" payı ya da puanın zirveye göre hesaplanması gerekir.
- **Servet yadigâra:** En Zengin'den sonra kazanılan para varise kalacak yadigârlara (plan 2.2) harcanır; boş saatler bir sonraki hayatı güçlendirir, ödeyenin hızı da oraya taşınır.
- **Vakıf zinciri:** annenin ve Rıza Amca'nın hikâyesine bağlı büyük hayaller (mahalle kütüphanesi, babanın adına burs, Rıza'nın atölyesi), her biri bir hayat anı. En duygusal, en pahalı (yazı ve kare). Hikâyenin "4. perde"si ([story-v2.md §7](./story-v2.md)).
- **Yaş temposu:** zirveye kadar yıllar yavaş (zirve ~40 yaş), sonra hızlı. İçerik eklemeden boş saatleri kısaltır; annenin (En Zengin'de ~87) ve Rıza'nın yaşını makul yapar; En Zengin karesinde ailenin yokluğu da daha az göze batar.
- **Claude'un önerisi:** erken emeklilik + servet yadigâra birlikte ("Şimdi devret" ya da "Kal, varisine biriktir"); ikisi de mevcut miras sistemine oturur, yeni hikâye yazmayı gerektirmez. Vakıf zinciri sonra hikâye katmanı olarak.
- **Aynı yerde duran küçük sorular:** annenin mesajları En Zengin'den sonra biter mi (kanal Defne ve kızına geçebilir); Şans'ın yerini yavrusu alır mı; "65 yaşındasın" gibi ömür sonu hatırlatması (zirveye varamamış oyuncunun "sonu göremedim" hissi).

## 3. Hanedan (plan 2.1; [story-v2.md §6](./story-v2.md))

Kararlaşanlar: varis 17 yaşında torun (kızının çocuğu), devir 80 yaşında, ölüm gösterilmez, eş Defne. Açıklar:

1. **Torunun cinsiyeti.** Öneri: oyuncu seçsin (tek seçim); bütçe kısıtlıysa sabit.
2. **2. neslin başlangıcı:** sıfırdan değil, biraz alttan (yön kararı 2026-10-11). Öneri: küçük yurt odası ya da kiralık oda ve dedesinin ilk tezgâhı; "para yok ama ad var" Aile İtibarı'yla örtüşür. Evler varise kalsın mı?
3. **2. nesil kıyafet ve poz seti:** aynı sayıda yeni set; babadan kalan bir yadigâr (saat ya da Şans'ın tasması) hep görünsün.
4. **Varis çok hızlı:** 1. ömür ~1.800 miras puanı (×19 gelir) bırakıyor, reklam izleyende ~3.800; 2. nesil dakikalar içinde Milyoner ve üstü. Miras formülü ve nesil içeriğiyle (2.3) birlikte.

## 4. Ekonomi

Kurallar ve sayılar [game-design-v2.md §4–5](./game-design-v2.md). Çevrimdışı oran ve tavan kararlaştı (%50, geç oyunda 2 sa; 2026-10-13). Açıklar:

- **Multimilyarder hedefi FAIL:** bağlı bot 7. gün 08:03'te (4 sa 20 dk oyun) varıyor, hedef 8. günden itibaren. Ucuz tezgâh, tören hediyesi, tasmalar ve günlük ödül (2026-10-15, ~10 saat) onu öne çekti. Seçenekler: (a) hedefin alt sınırını 7. gün sabahına çekmek (Claude'un önerisi; Milyarder'de de böyle yapıldı); (b) geç oyunu ~15–20 dakikalık oyun kadar yavaşlatmak. Tek bir geç işletmeyi %5–7 kısmak yetmedi.
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
- **Olay kartları:** ödül sayıları ve sıklık (45 / 100 / 10 sn gelir, 4–6 dk) telefonda denenmedi; kötü sonuçta reklamla "ikinci şans" (monetizasyon #7).

## 8. Diğer

- **Zenginler Listesi:** benzetme isimlerin hukuki riski (Claude'un notu: Hindistan'daki "Selmon Bhoi" davası; portre, şirket adı ve logo yok, ton alaycı değil; kullanıcı benzetme isimleri seçti). Düğmenin yeri ve kartın sıklığı telefonda bakılacak.
- **Başarımlar:** Google Play Games başarımları olarak yapılacak (kullanıcı, 2026-10-15; sonra), plan 2.13. Liderlik tablosu sonra.
- **Fiyat A/B testleri:** Başlangıç Paketi'nin normal fiyatı ($2,99) ve hoş geldin fiyatı ($1,49) ileride Remote Config ile denenebilir (Faz 3).

## 9. AAB 28 telefon testinden (kullanıcı, 2026-10-15)

- **Açıklama metinleri çok (kullanıcı: "azaltalım", yerlerini kendisi gösterecek):** kartların ve düğmelerin altındaki küçük açıklamalar. Kullanıcı yerleri söyleyince tek tek kısaltılacak ya da kaldırılacak.
- **Çevrimdışı kartı ve Rahat Paket:** kart 10 dakikadan kısa ayrılıkta ek teklif göstermiyor (`AD_OFFLINE_MIN_SECONDS`), bu yüzden testte yalnız "Topla" vardı. Kullanıcı, paket sahibine "+%30 senin" gibi bir şeyin açıkça söylenmesini istiyor; 10 dakika eşiği ve "Hemen al +%30" metni yeniden ele alınacak.

