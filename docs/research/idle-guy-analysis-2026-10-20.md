# Idle Guy: Life Simulator incelemesi (rakip analizi)

Tarih: 2026-10-20 · Durum: **araştırma; öneriler kullanıcı kararı bekliyor**. Kaynak: kullanıcının oyundan aldığı 56 ekran görüntüsü (proje kökü, `idle-guy-life-sim oyun ekran görüntüleri/`) ve mağaza sayfası (Heatherglade, Google Play 10M+ indirme, 435K+ yorum, 4,5 yıldız). Bağlam: [engagement-strategy-v2.md](../engagement-strategy-v2.md).

Kullanıcının gözlemi: "Hep yapacak bir şey var. Bir şey yapmak için başka şeyleri de yapmanı istiyor, adım adım. Bizim oyun kadar hızlı zengin olmuyorsun. Daha çok ekran ve menü var."

## 1. Ekranlarda ne var

| Sistem | Nasıl çalışıyor (görüntülerden) |
| --- | --- |
| **İş ağacı** (Job) | Seviye seviye (lvl 14–17) dallanan meslekler: Reseller, Junior Manager, Assistant Accountant, Office Manager, Editor. Her işte "ustalaşma" (%100) var; sınavda "FAIL → Replay" olabiliyor. |
| **İş şartları** (Editor penceresi) | Editor olmak için: Şans 3, Mutluluk 60, Ev en az 5. seviye, Yemek 4, Ulaşım 4, önceki işte ustalaşma %100, Güç 12. Her satırda ✓ ya da "GO". **Kullanıcının dediği "başka şeyleri de yapmanı istiyor" mekanizması bu.** |
| **Beceriler** (Skills) | Güç, IQ, Karizma, Çekicilik, Şans, Dayanıklılık (+ Stres direnci, Hırs, Yaratıcılık, ??). Her biri **gerçek zamanlı sayaçla** seviye atlar (22 dk – 3 sa), aylık ücreti var. 3 enerji pili = aynı anda en çok 3 beceri çalışılır. Reklamla "+2 seviye", Boost düğmesi, ücretli "Life Hack Book". |
| **Hobiler** (Activities) | Koşu, oyun, spor salonu, gece hayatı, kayak: 0/400 ilerleme çubuğu, yıldız seviyesi, aylık ücret, mutluluk/sağlık üretir. Seviye atlarken "6,5/m → 1,6/m" önce-sonra penceresi. Anlık yenileme: ada tatili (reklam), kumarhane (para). |
| **Durum etkileri** | Hobiden rastgele kart: "Runner's High +1,8 mutluluk/ay", "Sore Muscles −0,6 sağlık/ay". "Info" sekmesinde etkin etkiler listesi. |
| **İhtiyaçlar** | Mutluluk ve sağlık sürekli düşer (−13,4/ay). Yemek, ev, ulaşım, kıyafet aylık para alır, mutluluk/sağlık verir ya da götürür. Mutluluk düşünce "Depresyondayım… Mutluluğu artır!" uyarısı. |
| **Barınma / Ulaşım / Kıyafet** | Seviyeli listeler (Glamping, Street Racing Car…), her birinde ücret + aylık gider + mutluluk/sağlık etkisi; iş şartlarına bağlı ("her işe uygun, 49. seviyeye kadar"). Kıyafette parça parça giydirme. |
| **İlişkiler** (Meet) | Kadın karakterler, aşama etiketiyle: Nefret → Kayıtsızlık → Tanıdık → Arkadaş bölgesi… Bazıları premium. Ana ekranda sevgili yanında duruyor. |
| **Yatırım: Banka** | 3 dakikalık mevduat +%10, 1 günlük +%50, 1 günlük reklamlı +%100; tutar kaydırıcısı, "kâr: +110k". Harcamaya %2 cashback (dolunca "Claim"). Premium kart ×2. |
| **Yatırım: Hisse** | Gerçek markaların parodileri (Teslo, StarBux, Coka-Koala…), fiyat grafiği, şirket payı (2500/250000), 3 saatte bir temettü, "Max" alım, %10 komisyon. Ücretsiz rastgele hisse paketi (reklam), ücretli otomatik alım. |
| **Yatırım: Emlak** | Yeni Zelanda, İzlanda, Kanada… evleri; yıldızla yükseltme (6 yıldız), her yükseltmede "kira +533/ay", piyasa değeri ve **satış**. |
| **Prestij** | Prestij seviyesi = görev listesi: "Tüm görevleri bitir 11/14 → mini oyunlar açılır". Görevler: Şans'ı 4'e çıkar, 5 ay gece hayatı, 20. seviye iş. Ayrıca Günlük görevler ve Başarımlar sekmeleri. Ana ekranda tek görev şeridi ("Raise Luck to 4 · 1/4"). |
| **Karakter penceresi** | Bütün statlar tek bakışta; aylık gelir/gider dökümü (para, mutluluk, sağlık için ayrı sütun). Elmasla kalıcı yükseltmeler: maaş, işletme kârı, ev geliri, en yüksek çevrimdışı gelir, beceri hızı… |
| **Mini oyunlar** | Para tabancası, garaj, şans oyunu, slot (biletle). |
| **Takvim ve yaş** | Oyun içi tarih ilerliyor; "27 yaşında, 52 yıl kaldı". Her şey "/ay" ile. |
| **Para kazandırma** | Çok yoğun: zamanlı indirim (sayaçlı), ölümsüzlük iksiri, +10 yıl ömür, zaman ×5 hızlandırma, reklamsız paketler, bilet, elmas, fiş, "Vincent" kaz (reklam bonusu karakteri). |

## 2. Neden "hep yapacak bir şey var"? Dört mekanizma

1. **Sistemler birbirinin şartı.** Bir terfi beceri, ev, yemek, ulaşım ve önceki işte ustalaşma istiyor. Böylece her sistem ötekine sebep oluyor: "Editor olmak için Güç 12 lazım → spor salonu → mutluluk düşüyor → hobi". Oyuncu hep bir sonraki eksik satırı tamamlıyor; **şart listesi kendiliğinden bir yapılacaklar listesi.**
2. **Farklı uzunlukta paralel sayaçlar.** 3 dk mevduat, 20 dk – 3 sa beceri, 400 birimlik hobi, 3 saatlik temettü, 1 günlük mevduat. Oyuncu ne zaman dönerse dönsün, en az bir sayaç bitmiş oluyor. Bizde dönüşte bitmiş olan tek şey çevrimdışı para (ve varsa 1/4/8 saatlik yatırım).
3. **Sınırlı yuva.** 3 enerji pili: her şeyi aynı anda çalıştıramazsın, **ne çalıştıracağını seçmek bir karar.** Bitince yuvayı yeniden doldurmak oturum başına bir eylem.
4. **Bakım baskısı.** Mutluluk ve sağlık sürekli düşüyor, ihtiyaçları gidermek gerekiyor. Bu da sürekli iş üretiyor, ama cezayla (depresyon uyarısı).

"Yavaş zenginleşme" asıl sebep değil, yan etki: para lineer akıyor (511K → 1,06M uzun sürüyor) çünkü ilerlemeyi para değil şartlar kısıtlıyor. **Biz para hızını düşürmeden aynı etkiyi şartlarla alabiliriz.** Bizim boşluğumuzun yeri belli: Milyarder → Multimilyarder (2–8. gün) ve Multimilyarder → En Zengin (8–15. gün). Orada oyuncu sadece eşiğe kadar beklemekte.

## 3. Bizde ne var, ne yok

| Idle Guy | Prestige Life v2 bugün |
| --- | --- |
| İş ağacı + çok sistemli şart | Kariyer: tek hat, **yalnız para** ile terfi |
| Beceriler (sayaçlı) | Yok |
| Hobiler, durum etkileri | Yok (olay kartları yakın akraba) |
| İhtiyaçlar (mutluluk/sağlık düşer) | Yok, bilinçli olarak: alışveriş = güçlenme, oyuncu hiç kaybetmez |
| Barınma/ulaşım/kıyafet seviyeleri | Var: ev (kirala → satın al → kiraya ver), 12 araç, 7 kıyafet, lüksler; hepsi kalıcı gelir bonusu |
| İlişki aşamaları | Hikâye karakterleri (Rıza, Defne, Burak…) olay kartları ve törenlerle; aşama göstergesi yok |
| Banka 3 dk / 1 gün, hisse, emlak yükseltme | Rıza'nın fırsatları 1/4/8 sa; ev kiraya verme |
| Prestij görev listesi, günlük görev, başarım | 3 hedef kartı (ilk saat yazılı, sonra kilometre taşları); günlük ödül; sınıf **yalnız nesil kazancıyla** atlanır |
| Karakter penceresi, gelir/gider dökümü | Gelir ayrıntısı penceresi (`IncomeSheet`) |
| Mini oyunlar | Yok |
| Yoğun IAP, sayaçlı indirim | Hafif: 4 ödüllü reklam, Konfor Paketi, Başlangıç Paketi |

Bizim artımız: hikâye, törenler, sahnenin değişmesi, üstel sayıların "vay" anı, hanedan. Onların artısı: **sistemlerin birbirine bağlı olması ve dönüşte hep bitmiş bir sayacın beklemesi.**

## 4. Ne alalım, neyi dönüştürelim, neyi almayalım

### Alalım / dönüştürelim (önerilen sırayla)

**A. Terfi şartları (en ucuz, en etkili; yeni ekran yok).** Bazı terfiler paranın yanında bizim mevcut sistemlerimizden bir şart ister. Örnek: Satış Temsilcisi = "$590K + kendi aracın olsun (bisiklet yetmez)"; Takım Lideri = "+ 3 işletmede 50 birim"; Direktör = "+ kendi evinde otur"; CEO = "+ bir işletmede 100 birim". Kariyer kartı Editor penceresi gibi şart listesi gösterir; her satırda ✓ ya da mevcut "Git" düğmemiz (`ui/home/focus.ts`). Kurallar:
- Şartlar oyuncunun zaten yapacağı şeylerden seçilir, kilitlemez, **sırayı ve dikkati yönlendirir.** Simülatör hiçbir hedefin kaymadığını göstermeli.
- Kaybedilen ve kalkan şart olmaz (kayıt uyumluluğu: eski kayıtta zaten terfi etmiş oyuncu terfisini korur).
- Aynı fikir sınıflara **uygulanmaz**: sınıf nesil kazancıyla atlanır, hikâye ve tören eşikleri bozulmasın.

**B. Kurs / okul: sayaçlı gelişim (yeni sistem, Kariyer sekmesinin içinde).** Idle Guy'ın becerilerinin bizim hikâyeye çevrilmiş hâli. Okulu bırakmış sokak çocuğu kendini yetiştiriyor: ehliyet, akşam lisesi, muhasebe kursu, İngilizce, MBA… Her biri gerçek zamanlı sürer (20 dk → 8 sa, sınıfa göre uzar), bitince **kalıcı küçük bonus** verir ve terfi şartı olur (A ile birleşir: "Web Geliştirici = $47.8M + yazılım kursu"). Kurallar:
- Tek yuva (Idle Guy'da 3 pil var); ikinci yuva ileride miras yadigârı ya da ödüllü reklamla. Yuva seçimi = oturum başına bir karar.
- Ücret yok ya da tek seferlik; **aylık gider yok** (bizim kuralımız: alışveriş güçlendirir).
- Mezuniyet zaten hikâyedeki hayat anlarından biri (story-v2 §4c "mezuniyet"): bir kurs törenini o ana bağlayabiliriz.
- Varis kursları sıfırdan alır; bu nesil 2'ye de iş çıkarır.

**C. Sayaç merdiveni ilkesi.** Tek tek sistem değil, bir tasarım kuralı: oyuncu 5 dk, 1 sa ya da 8 sa sonra dönse de en az bir şey bitmiş olmalı. Bizdeki basamaklar: iş teklifi 60–90 sn (strateji §4.1), kurs 20 dk – 8 sa (B), Rıza'nın fırsatları 1/4/8 sa (var), günlük ödül 24 sa (var). Strateji §4.0'daki "anlamlı eylem" ölçüsü bunu doğrudan sayar: "oturumu açınca bitmiş bir şey var mıydı?"

**D. İlişki aşamaları → karakterlerle bağ göstergesi.** Idle Guy'ın Meet ekranının (Nefret → Arkadaş) bizdeki karşılığı GPT'nin "ilk müşteri → düzenli → büyük anlaşma" merdiveni. İş tekliflerini veren karakterin (Selin, Rıza, Nevin…) yanında küçük bir bağ seviyesi; seviye arttıkça daha iyi teklif. Ayrı bir flört sistemi değil; strateji §4.1'in parçası.

**E. Hobi kartlarındaki önce-sonra satırı.** "6,5/m → 1,6/m" penceresi, bizim §4.4'teki "alımdan önce/sonra gelir" önerisinin aynısı. Bir rakipte çalışıyor olması öneriyi destekliyor.

**F. Emlak yükseltmesi (sonra).** Kiraya verilen evlere yıldız yükseltmesi ve "kira +X/sa" satırı. Orta ve geç oyunda ucuz içerik; boş dönemlere doğrudan gider. A ve B'den sonra, ölçüm boşluk gösterirse.

### Almayalım

- **İhtiyaçların düşmesi ve depresyon uyarısı.** Bakımı cezayla yaptırıyor; bizim "oyuncu hiç kaybetmez" ve rahat idle tonumuzla çelişiyor. Annenin mesajları zaten duygusal tarafı taşıyor.
- **Aylık giderler.** v1'de vardı (eksi net gelir), v2'de bilerek kaldırıldı.
- **Kumar mini oyunları (slot, bilet).** Google Play politika riski, hikâye tonu ("dürüst emekle zengin olmak") ile çelişiyor.
- **Gerçek marka parodileri** (Teslo, McDonnald's). Mağaza ve hukuk riski; Lumen şehrimizin kendi markaları var.
- **Bu yoğunlukta IAP** (sayaçlı indirim, ölümsüzlük iksiri, zaman ×5). Kararlarımız `monetization-v2.md`'de; burada değişen bir şey yok.
- **Çok menü.** Ekran sayısını artırmak kendi başına derinlik değil: Idle Guy'da 6 alt menü × 2–4 sekme var. Bizim kuralımız (alt menü 4–5 düğme, gerekirse ikinci sıra, açılana kadar kilitli) korunur; B Kariyer sekmesinin içine girer.
- **Hisse grafiği / temettü.** Eğlenceli ama ağır bir sistem; Rıza'nın fırsatları aynı ihtiyacı karşılıyor. Gen 2'nin "yeni stratejik seçim" adayı olarak §4.8'de durabilir.

## 5. Strateji belgesine etkisi

- A ve B, strateji §5 sırasında **3. adımdaki prototipe** eklenmeye aday (iş teklifleri + üç katmanlı hedef). Üçü birlikte boş dönemin üç ihtiyacını karşılar: oturum içi (teklif), oturumlar arası (kurs sayacı), hayat hedefi (terfi şartı).
- 1. adımdaki ölçüm A'yı önceden deneyebilir: botun terfi sırasını şartlarla kısıtlayıp hedeflerin kayıp kaymadığına ve boş oturumların azalıp azalmadığına bakılır. B'nin etkisi de "dönüşte bitmiş sayaç" sayısıyla ölçülür.
- Oyunun hızlı zenginleşmesi bir sorun olarak görünmüyor; sorun hız değil, eşikler arasındaki boşluk. Para tempoları değişmez, boşluk şartlarla doldurulur.

## Kaynaklar

- Kullanıcının 56 ekran görüntüsü (2026-10-20).
- Google Play: [Idle Guy: Life Simulator](https://play.google.com/store/apps/details?id=com.heatherglade.idleguy).
- App Store açıklaması: [Idle Guy (KR)](https://apps.apple.com/kr/app/idle-guy-%EC%9D%B8%EC%83%9D-%EC%8B%9C%EB%AE%AC%EB%A0%88%EC%9D%B4%EC%85%98-%EB%A6%AC%EC%B9%98-%EC%96%B5%EB%A7%8C%EC%9E%A5%EC%9E%90/id1612163874), [AppFollow US](https://apps.appfollow.io/ios/idle-guy-life-simulator-games/1612163874?country=us) (yaklaşık 70K yorum, 4,8).
