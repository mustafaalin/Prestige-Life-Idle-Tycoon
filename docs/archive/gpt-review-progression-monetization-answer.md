# GPT'nin görüşü: ilerleme, geç oyun ve monetizasyon

Tarih: 2026-10-14 · Durum: **inceleme ve öneri; tasarım kararı değildir.** Kod ve mevcut karar belgeleri değiştirilmedi.

İstem belgesini, `game-design-v2.md`, `monetization-v2.md`, `discussion-notes.md` §8–9 ve `story-v2.md` belgelerini; mevcut durum için handoff ve planı okudum. Gelir formüllerini ve botun satın alma seçimini kontrol ettim; `npm run sim -- --purchases --timeline` çalıştırdım. Gerçek cihazda reklam/IAP testi yapmadım. Rakip örneklerini aşağıda birincil kaynaklarla verdim.

## 1. Ana değerlendirme

Teşhisin yönüne katılıyorum: geç oyunda para üretimi sürüyor, fakat hayatın değişimi ve satın almaların anlamı aynı hızda devam etmiyor. Bunun çözümü yalnızca yeni bir sayaç veya daha yüksek gelir değildir. Oyuncu bir sonraki satın almanın neyi değiştireceğini görmeli ve aldıktan sonra karşılığını yaşamalı.

Önerilen altı başlığın çoğu değerli. Ancak **Servet + liste, mevcut tanımıyla jeti satın almaya teşvik etmiyor.** Ayrıca geç oyun boşluğu, yalnızca ilk neslin problemi değil: yaklaşık 1.800 miras puanı sonraki nesle ×19 civarı gelir veriyor. Reklam veya IAP eklemeden de aynı içerik hızla tüketiliyor. Nesil temposunu değerlendirmeden kalıcı hız paketlerini tamamlamak sorunu büyütebilir.

### Simülatörde doğrulananlar ve sınırlar

Güncel çalışma ağacındaki sonuçlar:

| İlk nesil | Bağlı, reklamsız bot | Bağlı + reklam botu |
| --- | --- | --- |
| En Zengin | 16. gün, 10 sa 35 dk aktif oyun | 11. gün, 7 sa 5 dk |
| Sürat teknesi | 6. gün, 4 sa 10 dk | 5. gün, 3 sa 9 dk |
| Mega yat | 17. gün, 11 sa 24 dk | 11. gün, 7 sa 33 dk |
| Helikopter | 24. gün, 16 sa 39 dk | 16. gün, 10 sa 58 dk |
| Jet | İlk nesilde alınmıyor | 19. gün, 13 sa 9 dk |
| Ömür sonu | 16 sa 48 dk aktif oyun | — |

Dolayısıyla “jet hiç alınmıyor” ifadesi **reklamsız bağlı botun ilk nesli** için doğru; bütün oyuncu profilleri için doğru değil. Helikopter reklamsız profilde yaklaşık 9 dakika kala geliyor. Reklamlı profilin jeti alabilmesi, ücretsiz deneyimin hedeflerini erişilebilir kılma ihtiyacını ortadan kaldırmıyor.

Simülatör bir tempo hedefini kaçırıyor: reklamsız bağlı bot Multimilyarder'e 7. gün 21:00'de ulaşıyor; hedef 8. günden başlıyor. Bu mevcut ve belgelenmiş durum; incelemede değişiklik yapmadım.

Bot `bekleme süresi + fiyat / ek gelir` hesabıyla seçim yapıyor (`src/game/sim/simulator.ts`). Bu yerel bir yatırım sezgisidir; bütün ömrü optimize eden bir çözüm veya gerçek oyuncu tercihinin kanıtı değildir. Hikâye ve koleksiyon değeri de modelde yok. “Bot almıyor” ekonomik teşhisi destekler; “hiçbir oyuncu istemez” sonucunu kanıtlamaz.

### Gelir hesabında iki düzeltme

1. İşletmelerin gelirin %96'sını üretmesi, lüks bonusunu etkisiz yapmıyor. Bonus işletmeler dahil global gelire uygulanıyor.
2. +%10, mevcut toplam gelire bağımsız ×1,10 değil, **statü bonusuna +10 yüzde puan**. Kod: `globalMultiplier = (1 + careerBonus) × (1 + statusBonus) × legacyMultiplier`. Mevcut statü bonusu S ise gerçek artış `0,10 / (1 + S)`. Örneğin S = 2 olduğunda gelir artışı yaklaşık %3,33'tür.

$9M/sn sabit gelirde $1T yaklaşık 30,9 saatlik üretimdir. Bağımsız %10 artış varsayımıyla geri dönüş yaklaşık 309 saat; yukarıdaki örnekte yaklaşık 926 saattir. Bunlar sabit gelirli açıklama hesaplarıdır, gerçek satın alma tahmini değildir: gelir sonraki yatırımlarla büyüyor; çevrimdışı gelir üretirken yaş ilerlemiyor. Aktif oyun saatini, takvim süresini ve eşdeğer üretim saatini karıştırmamak gerekir.

## 2. A — Servet

**Koşullu olarak katılıyorum; ilk sürüm için zorunlu görmüyorum.** Nakit ile ekonomik büyüklüğü ayırır, harcamanın parayı yok etmek yerine varlığa çevirdiğini anlatır. Fakat sınıf zaten harcamayla düşmüyor. Oyuncuda harcama korkusu olduğu henüz ölçülmüş değil.

En önemli düzeltme: $1T nakit → $1T jet, toplam serveti değiştirmez. Listeye bu yüzden doğrudan sıra kazandıramaz. Jeti alış fiyatından yüksek değerlemek ise satın alma kararını yapay bir puan hilesine çevirir.

Hesap tanımı da sandığından kapsamlı: kiralık ev sahip olunan varlık değildir; taşınma bedeli tapu değeri değildir; tüketilen hızlandırıcı varlık değildir. İşletmelerin geometrik fiyatında son birim fiyatını bütün adetlerle çarpmak, gerçek para kazanılmadan serveti şişirebilir. Bedava tören varlıkları, yöneticiler, yükseltmeler ve eski kayıtların geçmiş alış maliyetleri için açık kurallar gerekir. Bütün harcamalar servete eklenirse sayı büyük ölçüde nesil kazancının yeniden adlandırılmış hâli olur.

**Basit alternatif:** İlk listeyi mevcut nesil kazancına bağla ve “bu hayatta kazanılan toplam” diye açıkla. Yeni ekonomik muhasebe eklemeden fikrin işe yarayıp yaramadığını gör. Servet özellikle istenirse, hesap kapsamı ve emeklilikte sıfırlanması önce belirlenmeli.

## 3. B — Kurgusal zenginler listesi

**Katılıyorum; oyunun vaadine iyi uyuyor.** Ama satın alma motivasyonu ile sıra motivasyonu ayrı işlevlerdir. Liste “ne kadar ilerledim?”, lüks “bu parayla nasıl bir hayat kurdum?” sorusunu cevaplasın.

Binlerce kişilik görünür liste yerine, hesaplanan sıra yanında sıradaki rakip ve 8–12 anlamlı dönüm noktası yeterli olabilir. Büyük geçişlerde kısa bir haber veya karakter tepkisi verilebilir. Her sıra için para ödülü vermek gereksiz enflasyon ve bildirim yükü yaratır. Kullanıcı kurgusal bir liste olduğunu bilmeli; gerçek oyuncu rekabeti izlenimi verilmemeli.

İlk sürümde sabit rakip eşikleri tercih ederim. Hareketli rakipler ve haftalık sezonlar ek sistem yüküdür. Bülent Bey zaten Milyarder töreninde işine alınmış durumda: onu sonraki saatlerde hâlâ aşılması gereken güçlü patron gibi sunmak mevcut hikâyeyle çelişebilir.

**En Zengin töreni ile #1 aynı ana bağlanmalı.** Biri kazanılan toplamı, diğeri serveti kullanırsa oyuncu “En Zengin” olduğu hâlde ikinci kalabilir. İki bağımsız bitiş çizgisi yerine tek tetik öneriyorum. Variste güncel sıra sıfırlanabilir; önceki neslin en iyi sırası mevcut aile albümünde saklanabilir. Bu öneridir, mevcut miras kararı değildir.

XP veya başka bir genel prestij para birimi eklemeye gerek görmüyorum. Mevcut miras/aile itibarı uzun vadeli ilerlemeyi taşıyabilir.

## 4. C — Lükslerin görünmesi ve hikâye karşılığı

**En güçlü öneri bu; uygulamada listeyle birlikte veya ondan önce gelmeli.** Her lüks için ilk satın almada kısa bir hayat anı, kalıcı bir görsel iz ve albüm kaydı yeterli bir ilk kapsamdır. Albüm zaten var; yeni bir koleksiyon sistemi şart değil.

Jet sürekli gökyüzünden geçerse oyuncu onu kendisine ait olarak algılamayabilir. İlk uçuşun açıkça sahiplik göstermesi ve sonrasında dokunulabilir bir görsel/hatıra olması daha anlamlı. Yat yalnızca sahil evinde görünüyorsa, taşındıktan sonra kaybolmuş hissi yaratmamak için albüm veya sahip olunanlar görünümü kullanılabilir.

Her lüksün kendini ömür içinde amorti etmesini zorunlu tutmam. İşletme ekonomik yatırım, lüks görünür başarı ve hayat deneyimi olabilir. Ancak erişilebilirlik şart: ücretsiz oyuncu jeti emeklilikten hemen önce alıyorsa, onunla yaşayacak zamanı kalmaz.

Önce hedef satın alma aralığını belirleyip fiyatı ve açılma zamanını simülatörde denemeyi öneririm. Bonusları çok büyütmek bütün sınıfları erkene çeker ve boşluğu artırabilir. Yeni şehir açma gibi büyük bağımlılıkları ilk jet sürümüne bağlamam; henüz olmayan içeriği vaat etmek yerine küçük, tamamlanmış bir karşılık verilmeli.

## 5. D — Reklam yerleri

Yeni yer eklemeden mevcut dört yer gerçek cihazda doğrulanmalı. Test reklamıyla başarı, erken kapatma, reklam bulunamaması, uygulamanın arka plana gitmesi ve ödülün yeniden açılışta ikinci kez verilmemesi kontrol edilmeli. Kod ve sahte reklam testi, gerçek cihaz doğrulamasının yerine geçmez.

Öneriler arasında ilk tercihim **mevcut tören/hayat anına bağlı hediye artırma**. Hikâye bittikten sonra sunulmalı; düğün konuşmasının arasına reklam çağrısı girmemeli. Tören ve hayat anı hediyelerini aynı ödül modeliyle kurmak iki ayrı sistemden daha basit.

“Şans'ı şimdi gönder” karaktere uyuyor, fakat yeni cüzdanın ardından bir de ×2 reklam sunmak aynı ödül için iki reklamlık akış yaratır. Atlatma sonrası ikinci teklifin nasıl davranacağı baştan belirlenmeli. Günde 2–3 sınırı bir başlangıç varsayımıdır, kanıtlanmış optimum değildir.

İkinci şans mevcut kartlarda hikâyeyi geri almıyor; kartlar yalnızca farklı parasal sonuçlar veriyor. Dolayısıyla önceki genel değerlendirmemdeki kalıcı hikâye riski burada mevcut değil. Yine de seçim dengesini değiştirir: 45 saniyelik kesin ödüle karşı cesurun beklenen değeri 55 saniye. Başarısızlıktan sonra bir yeniden denemede 10 saniyelik ilk ödül korunup yeni sonuç ona eklenirse beklenen toplam 82,5 saniye olur; ilk sonuç değiştirilirse 77,5 saniye olur. Reklamın fırsat maliyeti hariç bu fark, cesuru belirgin biçimde avantajlı yapar. Ödeme modeli ve ihtimal açık olmalı; kart başına tek deneme kayıtta korunmalı.

Reklam etkisinde de ölçü tanımlanmalı: güncel botta En Zengin'e aktif süre 10 sa 35 dk → 7 sa 5 dk, yaklaşık **%33 daha kısa**. Bu, yaklaşık %49 daha yüksek ilerleme hızı demektir; “%20–30 hızlı” ile aynı ölçü değil. Mevcut reklam etkisi netleşmeden yeni yer eklemek hedef farkını büyütebilir. Yeni yerleri tek tek denemek daha sağlıklı. Belgelerdeki “15–20 yer” ile “günde 15–20 izleme” de ayrı ölçüler; bunları tasarım kotası olarak kullanmam.

## 6. E — IAP

Altın tasma çakışması doğru; fakat **kırmızı fular da başlangıç paketinde zaten var**. Kalıcı ×2 için yakut tasma gibi hem ücretsiz altın tasmadan hem başlangıç kozmetiğinden ayrılan bir seçenek seçilmeli.

Asıl denge riski yalnızca ×2 değildir: Gece Vardiyası, geç oyunda dolu bir dönüşün değerini `%50 × 2 saat`ten `%100 × 4 saat`e çıkarır; yaklaşık **×4**. Kalıcı ×2 ile birleşince yaklaşık ×8; çevrimdışı +%30 da alınırsa temel dolu karta göre ×10,4 olabilir. Bunlar aynı gelir ve yeterli uzak kalma süresi varsayımıyla kart tutarı oranlarıdır, sınıfa ulaşma süresi tahmini değildir. Erken sınıflarda +2 saatlik artışın oransal etkisi daha da büyüktür. Çevrimdışı kazanç zaten ekonominin baskın kaynağı olduğu için bu ürün özellikle test edilmeli.

Rahat Paket mantıklı ilk ürün. Reklam sınırlarını ve açılma koşullarını koruyarak ödülleri tek dokunuşla vermeli; sınırsız gelir kaynağı olmamalı. Başlangıç paketinin bir saatlik para miktarı teklif anında belirlenmeli; açılış anına ertelenerek değer büyütülmemeli. Gelecek nesillerde yeniden satılıp satılmadığı ve kalıcı hakların reset sonrası korunması açık olmalı.

İlk sürümde dört ürünü birden bağlamayı zorunlu görmüyorum. Konfor paketi ve net içerikli başlangıç paketiyle başlayıp kalıcı ×2/Gece Vardiyası'nı ücretli profil simülasyonlarından sonra değerlendirmek daha küçük kapsamdır. Para çantası ve ayrı kozmetik mağazasını ertelerim. Fiyatların uygunluğu tasarım belgesinden veya rakip fiyatından kesinleşmez; ürün vaadi ve yerel mağaza fiyatı birlikte değerlendirilmeli.

## 7. F — Gerçek liderlik tablosu

Ertelemeye katılıyorum. Kurgusal liste sunucu gerektirmeden vaadi destekler. Önce yerel başarımlar ve albüm kullanılabilir; Play Games/Game Center entegrasyonu bunlardan ayrı bir teknik aşamadır.

Etkinlik bazlı liderlik tablosu genel servete göre daha yönetilebilir bir kapsam verir, fakat **kendiliğinden hileyi veya ücretli üstünlüğü çözmez**. Ortak başlangıç, skor doğrulama, zaman kuralları ve satın alma avantajlarının etkinlikteki etkisi ayrıca belirlenmeli.

Capacitor 8 kullanımı `package.json` ile doğrulanıyor. Eski bir eklentinin uyumsuzluğu ise “kendi yerel eklentimizi yazmak zorundayız” sonucuna yetmez. Entegrasyon gerektiğinde mevcut seçenekler yeniden incelenmeli; bu incelemede eklenti uyumluluk araştırmasını tamamlamadım.

## 8. Somut rakip örnekleri

- **Idle Miner Tycoon:** Resmî yardım sayfasına göre No Ads Bundle kalıcı; oyuncu boost düğmesine basmaya devam ediyor, ödül video izlemeden uygulanıyor. Rahat Paket için somut örnek bu: etkileşimi ve ödül anını koruyup reklam süresini kaldırmak. [Kolibri: No Ads Bundle](https://kolibri-games.helpshift.com/hc/en/3-idle-miner-tycoon/faq/98-what-is-the-no-ads-bundle/?p=all).
- **AdVenture Capitalist:** Resmî etkinlik yardımında etkinlik sonrası liderlik ödülleri ve şüpheli puan bildirme yolu bulunuyor. Etkinlik rekabetine örnek; aynı zamanda etkinliklerin hile sorununu ortadan kaldırmadığını gösteriyor. Bizim oyun için buradan çıkardığım öneri, yarışmayı belirli bir etkinlik kapsamında kurmak; hile çözülmüş varsaymak değil. [Hyper Hippo: Limited Time Events](https://screenzilla.helpshift.com/hc/en/5-adventure-capitalist/section/19-limited-time-events/).
- **Egg, Inc.:** Geliştiricinin yardım merkezi soul egg'lerin gelir bonusunu artırarak ilerlemeyi açtığını, kontratların co-op olarak oynandığını açıklıyor. Bizim için ders, mevcut mirasın kalıcı ilerleme görevini taşıyabileceği ve ileride genel servet yarışı dışında ortak hedefler de kurulabileceği. Bu, şimdi kontrat sistemi ekleme önerisi değil. [Auxbrain: General Help](https://auxbrain.freshdesk.com/support/solutions/folders/47000774544).

Hayat simülasyonu tarafında kurgusal zenginler listesinin bu oyunda tutmayı artıracağını kanıtlayan birincil kaynak bulmadım; bunu başarı garantisi değil, oyunun vaadine uygun tasarım hipotezi olarak görüyorum. Yukarıdaki kaynaklardan satış performansı veya optimum reklam sayısı sonucu çıkarmıyorum.

## 9. Önerdiğim sıra ve küçük ilk kapsam

1. **Mevcut reklamları cihazda doğrula; mevcut ücretsiz/reklamlı tempo farkını netleştir.** Yeni sistem geliştirmeden de ilerleyebilir.
2. **Geç oyunu küçük bir bütün olarak tasarla:** mevcut kazanç sayacına bağlı kurgusal liste, sıradaki rakip, jet/yat için görünür satın alma karşılığı. Ayrı XP, şehir veya para birimi yok. Servet istenirse aynı aşamada kurallarını yaz, fakat liste için önkoşul yapma.
3. **Lükslerin fiyat/erişilebilirliğini ve ikinci nesil temposunu simülatörde dene.** Sadece yatırım botu değil, lüks hedefi için biriktiren oyuncu davranışını da değerlendirmek gerekir; henüz bu profil yok.
4. **Tek bir yeni reklam yeri dene; ardından IAP'yi kademeli bağla.** Ücretli ürünleri tek tek ve birlikte incele. İkinci şansı teknik kolaylığı nedeniyle otomatik ilk sıraya koyma.
5. **Yerel başarımlar; sonra platform başarımları.** Gerçek rekabet ve etkinlik altyapısı daha sonra.

İlk kapsamın başarı ölçütleri: ücretsiz oyuncu son lüksü ömründe anlamlı süre kullanabiliyor mu; satın alma ana ekranda ve albümde fark yaratıyor mu; #1 ile En Zengin aynı an mı; reklam/ödeme sonrası içeriksiz bekleme ve varisin hızlı tüketimi artıyor mu? Gerçek oyuncuda mağaza görüntüleme → biriktirme → satın alma → sonraki oturuma dönme akışı da izlenmeli. Bot ekonomik erişilebilirliği ölçer, zenginleşme hissini ölçmez.

**Son önerim:** Listeyi ilerlemenin görünürlüğü, lüksleri kazanılan paranın yaşanan karşılığı olarak kur. Serveti bunları çözen sihirli bir sayı gibi ele alma. Az sistemle ilerlemek için önce mevcut kazanç, albüm, miras ve sahne üzerinde güçlü bir geç oyun oluştur.
