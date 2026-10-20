# Prestige Life: ilerleme, ekonomi ve hikâye stratejisi

20 Ekim 2026. Araştırma ve tasarım önerisidir; mevcut kararların veya `game-design-v2.md` belgesinin yerine geçmez. Oyun kodu değiştirilmedi. İnceleme v2 kaynak kodu, güncel tasarım/hikâye belgeleri, mevcut simülatör ve dış kaynaklara dayanır. Telefon üzerinde oyun testi ve gerçek oyuncu analitiği yapılmadı.

## 1. Tasarım yönü

Ana vaat: **Önce kendi hayatını düzelt; sonra sevdiğin insanların hayatını değiştirecek güce ulaş.**

Servetin büyümesi dört ayrı kanaldan hissedilmeli:

1. **Alım gücü:** Önceden dakikalarca çalışarak aldığım şeyi artık kolayca alıyorum.
2. **Özgürlük:** Daha önce kendim yaptığım işi çalışanlarım yapıyor; ben daha büyük kararlar veriyorum.
3. **Görünür hayat:** Ev, insanların davranışı, aile ve işletmeler değişiyor.
4. **Etki:** Anneme oda almakla başlayan yol, Rıza'nın atölyesini ve mahalleyi dönüştürmeye uzanıyor.

Oyuncunun her saniye tıklaması gerekmez. Açıkken anlamlı bir uğraşı, çıkarken tamamlanmış bir işi, dönerken beklediği somut bir sonucu olmalı. Idle oyun için iyi bir oturum sonu başarısızlık değildir.

## 2. Koddan doğrulanan sorunlar

| Bulgu | Kaynak | Tasarıma etkisi |
|---|---|---|
| Toplama Orta Sınıf'ta tamamen biter | `core/config/scene.ts` | Sık yapılan bir eylem ortadan kalkar. |
| İlk olay 60–90 sn, sonraki olay 240–360 sn; Şans 300–600 sn | `core/config/events.ts`, `scene.ts` | Satın alımlar da pahalılaştığında sahnede uzun boşluk oluşabilir. Tam boşluk süresi henüz ölçülmedi. |
| Açılan işletme 10, sonraki sınıfta 25, sonra 50 adetle sınırlı | `core/config/businesses.ts` | Para olsa da geliştirme durabilir. Kilitler birlikte kapanınca sınıf beklemek gerekir. |
| Kâr kilometre taşları yalnız 25/50/75; işletme başına üç yükseltme | `economy.ts`, `upgrades.ts` | İleride yeni karar ve sıçrama kaynakları azalır. |
| Yazılı görevlerden sonra yalnız mevcut işletmelerin 25/50/75 hedefleri üretilir | `core/state.ts: activeQuests` | Üretilen görevler sınırlı; hedefler tükenebilir. Sınıf sınırını aşan hedefin gizlenmesi doğru ama alternatif üretmez. |
| 10 olay, iki cevap, kalıcı sonuç yok | `core/config/events.ts` | Metin çeşitliliği var; stratejik çeşitlilik sınırlı. |
| Lumen aynı fiyatlar ve kimlikler üstünde görsel/ad değişimi | `runtime/city.ts` | Yeni şehir tek başına yeni oynama biçimi getirmiyor. |
| Zirvede erken devir zaten var | `core/state.ts: canHandOverEarly` | “Erken reset ekleyelim” yeni bir çözüm değil. Asıl ihtiyaç devir öncesi ve sonrası anlamlı seçenekler. |

Bu bulgular, kullanıcının boşluk gözlemiyle uyumlu bir açıklama oluşturuyor; hangi aşamanın oyuncu kaybettirdiğini göstermek için ölçüm gerekir.

### Güncel simülasyon

Komut: `npm run sim -- --sessions`, 45 gün. Bağlı oyuncunun mevcut 15 tempo/his kontrolünün tamamı geçti.

| Dönüm noktası | Bağlı bot | Gündelik bot |
|---|---|---|
| İlk işletme | 2 dk 5 sn aktif | 2 dk 14 sn aktif |
| İlk yönetici | 6 dk 31 sn aktif | 6 dk 57 sn aktif |
| Orta Sınıf | 1. gün, 30 dk aktif | 2. gün, 25 dk aktif |
| Milyoner | 1. gün, 40 dk aktif | 2. gün, 32 dk aktif |
| Milyarder | 2. gün 23:00 | 4. gün 21:00 |
| Multimilyarder | 8. gün 12:00 | 14. gün 13:00 |
| En Zengin | 15. gün 21:04 | 28. gün 09:00 |
| Ömür sonu | 18. gün 08:02 | 37. gün 21:03 |

Bağlı bot ilk gün 30+10+7 dakika, sonraki günler 6×7 dakika; gündelik bot sonraki günler 3×5 dakika oynuyor. Bunlar davranış varsayımlarıdır, gerçek kullanıcı dağılımı değildir. Varsayılan simülasyon ömrü tamamlar; erken devir ayrı seçenektir.

Bot optimal alım yapar, elle işletmeyi yaklaşık modeller, olayları beklenen değerle hesaplar; okuma ve tereddüdü modellemez. Simülasyondan tutma oranı veya eğlence sonucu çıkarılamaz.

## 3. İlk yapılacak sistem: kısa iş / anlaşma

Orta Sınıf'ta toplama biterken oyuncunun rolü de değişsin: yerde para aramak → müşteri edinmek → ekip yönetmek → anlaşma yapmak.

Tek bir yeniden kullanılabilir sistem yeterli:

- Aynı anda bir aktif iş, iki teklif.
- Teklifte istenen hazırlık, süre, maliyet ve sonuç açık.
- İş başlarken koşullar ve ödül sabitlenir; ödeme anındaki büyük gelir artışından sınırsız yararlanılmaz.
- İş çevrimdışında da tamamlanır, ödül oyuncuyu bekler; teklif kaçırma cezası yok.
- Pasif işletme geliri iş boyunca kesilmez.
- Aktif oyuncu bir hazırlık kararıyla sonucu geliştirebilir. Yüzlerce dokunuş istenmez.
- Aynı iki seçenek her durumda aynı cevabı vermemeli; oyuncunun yakın hedefi ve sahip olduğu işletme seçimi değiştirmeli.

### İlk örnek: Selin'in etkinlik siparişi

“Üniversiteden toplu sipariş geldi. Arabayı bugün oraya götürelim mi?”

**A: Hızlı servis.** 60 saniye sonra küçük, garantili nakit.

**B: Tanıtım masası.** 90 saniye hazırlık, daha az nakit; bir sonraki kahve işinde bir defalık avantaj ve masanın görsel değişimi.

Oyuncu yönetici parasına çok yakınsa A, kahve zincirini büyütmek istiyorsa B anlamlıdır. Bu değerler prototip içindir; test edilmeden nihai denge kabul edilmez.

İlk sürümde çiçek/ kahve/ fırın için üç şablon, her biri iki seçenek yeterli. Milyarderlikte aynı arayüz “toplu sipariş” yerine “şirket anlaşması” anlatır. Her sınıf için ayrı mini oyun üretmek bakım maliyetini gereksiz büyütür.

### Önerilen oturum ritmi

| Ölçek | İşlev | İlk deneme hedefi |
|---|---|---|
| 15–30 sn | İsteğe bağlı küçük etkileşim / hazırlık | Oyuncunun yaptığı şey sonuçta görünür |
| 45–90 sn | İş veya anlamlı seçim | Aktif kalmak isteyen için alternatif |
| 3–8 dk | Bir oturum hedefi | Sipariş zinciri, terfi hazırlığı, ev projesi adımı |
| Birkaç oturum | Büyük hayat hedefi | Annemin evi, yeni işletme, mahalle projesi |
| Bir nesil | Kimlik ve miras | Ne kurdum, ne bıraktım, varis nasıl farklı oynar? |

Bunlar evrensel standart değil, prototip hipotezleridir. Ekranı aynı anda çağrı, hikâye, sipariş, günlük ödülle doldurmayın. Tek öncelikli eylem ve açılır iki alternatif yeterli.

## 4. Hedefleri üç katmana ayır

Mevcut hedefler, hayaller panosu ve aile albümü kullanılabilir; yeni bir menü yığını gerekmiyor.

1. **Şimdi:** “Selin'in ilk siparişini tamamla.”
2. **Bu oturum:** “Kahve arabasını otomatik çalıştır.”
3. **Hayat hedefim:** “Anneme bahçeli ev hazırla.”

Üretici kuralları: erişilebilirlik, ekonomik değer, tekrar sıklığı ve yakın hedefle ilişki. Birbirine bağlı üç kilitli görev aynı anda gösterilmemeli. Bütün ekonomik hedefler uzaktaysa ücretsiz bir hazırlık veya hikâye projesi adımı sunulmalı.

“İşletmeyi 76'dan 77'ye çıkar” tek başına anlamlı hedef değildir. Toplam gelirde fark, yeni yetenek, anlaşma veya görünür dönüşümle birleşmeli.

## 5. Zenginleşmeyi hissettir

### Hayat projeleri

**Annenin evi:** anahtar → yerleşme → bahçe. Üç aşamada üç kısa sahne detayı; mevcut tören hediyeleriyle çelişmeyecek biçimde “evin alınması” değil, hazırlığı ve yaşanması anlatılabilir.

**Rıza'nın atölyesi:** mekân → ekipman → ilk çırak. Oyuncunun yardım aldığı kişiye karşılık vermesi; iş sistemine bağlı özel sipariş.

**İlk şirket merkezi:** küçük ofis → ilk ekip → marka tabelası. Gelir kaynağındaki büyüme sahnede görünür.

Projeler yalnız para bağışı olmamalı. En az bir oyuncu kararı ve sonradan görünen bir sonuç taşımalı. İlk sürümde annenin evi ve Rıza'nın atölyesi yeterli; çok sayıda yeni para birimi eklenmemeli.

### Satın alma geri bildirimi

Önemli satın alımda üç bilgi:

- “Aylık gelir: 120K → 145K.”
- “Annenin bahçesi: yaklaşık 8 dk → 6 dk 40 sn.”
- Sahnedeki değişim veya müşterinin tepkisi.

ETA sabit gelir varsayımına dayalıysa “yaklaşık” yazılmalı. Aktif gelirle otomatik gelir karıştırılmamalı.

Eski zorluğun artık küçük olduğunu ara sıra gösterin: ilk bisikletin fiyatı, ilk tezgâhın görüntüsü, eskiden yardım eden kişinin yeni ofise gelişi. Her şeyin fiyatını anlık gelire endekslerseniz alım gücü hissi kaybolur. Kalıcı malların maliyeti içerik/sınıf eğrisine, tekrarlanabilir ödüller gelire bağlanabilir.

## 6. Hikâyeyi oynanışa bağla

Mevcut anneye verilen söz, Şans, Rıza, baba defteri ve eski patron omurgası korunmalı. İhtiyaç daha uzun metinden çok eylem–sonuç bağı.

| Perde | Oyuncunun sorusu | Oynadığı şey | Duygusal sonuç |
|---|---|---|---|
| Tutunmak | Bu geceyi nasıl çıkarırım? | İlk kazanç, sıcak yemek, barınak | Güvende hissetme |
| Ayakta durmak | Kendi düzenimi kurabilir miyim? | İlk müşteri, oda, yönetici | Özgüven |
| Yükselmek | Büyürken kim olacağım? | Ekip, aile, atölye, seçimler | Sorumluluk |
| İz bırakmak | Bu servet neyi değiştirdi? | Büyük proje, varis, devir | Anlam ve devam merakı |

Örnek kısa zincir:

1. Rıza: “Baban şu pencerenin yanında çalışırdı.”
2. Oyuncu atölye projesinde ilk siparişi tamamlar.
3. Sahneye bir tezgâh ve eski fotoğraf gelir.
4. Rıza: “Uzun zaman sonra ilk kez burası yine ahşap koktu.”

Diyalog eylemi açıklayan kullanım kılavuzu değil, eylemin duygusal karşılığıdır. Hikâyeyi atlayan oyuncu da dönüşümü sahneden okuyabilmeli.

### Burak hattı için tasarım riski

İhanet ve ikinci neslin hesaplaşması mevcut karardır. Bunu yeniden yazma önerisi değil: oyuncunun bir ömürlük başarısının silindiği duygusu ayrıca test edilmeli.

Devir öncesinde kalıcı kalanlar açıkça gösterilmeli: albüm, yadigârlar, aile, yaptırılan projeler ve yeni neslin avantajları. “Her şeyi aldılar” diyaloguyla “başardığım hiçbir şey kalmadı” duygusu aynı şey olmamalı. Oyuncunun seçmediği bir ortaklık yüzünden mekanik ceza yediğini düşünmesi önlenmeli.

### İkinci nesil

Lumen görsellerinin yanına **tek yeni stratejik tercih** eklemek yeterli olabilir: örneğin hızlı yerel nakit sağlayan işletme ağı veya daha geç karşılık veren teknoloji anlaşmaları. Aynı sayıları yeni resimlerle tekrar etmek uzun vadeli keşif sağlamaz. İlk nesil düzelmeden büyük bir ikinci nesil sistemi öncelik olmamalı.

## 7. Ekonomiyi hangi ölçülerle ayarlamalı?

### Alınabilirlik ve geri ödeme farklıdır

`Bekleme = max(0, maliyet − nakit) / net otomatik gelir`

`Geri ödeme = maliyet / ek net gelir`

İkincisinde mevcut toplam geliri kullanmak hatadır. Döngüler, ücretler, kira, kilometre taşı ve çarpan değişimleri hesaba katılmalı. Gelir sıfırsa bekleme sonlu bir süre olarak gösterilmemeli.

`Etki = ek net gelir / mevcut net gelir`

Örnek: 10K/sn gelirde 300K'lık yükseltme +2K/sn getiriyorsa sıfır nakitten alınabilirlik 30 sn, geri ödeme 150 sn, gelir etkisi %20. Bunlar farklı soruları cevaplar. Ekonomik katkısı küçük olan alışveriş yine değerli olabilir: otomasyon, hikâye veya proje açıyorsa bunu açıkça gösterin.

### Üstel maliyetin duvarı

Mevcut işletme maliyeti `C₀ × rⁿ`; adet üretimi yaklaşık doğrusal, sıçramalar sonlu. Geç oyunda maliyetin üretimi geride bırakması beklenir. Sadece fiyat azaltmak duvarı erteler.

Çözüm adayı: geç işletme uzmanlaşması, bölgesel anlaşma, anlamlı bir otomasyon veya devir seçeneği. Sonsuz ×2 kilometre taşını kontrolsüz eklemek tüm ekonomiyi hızlandırır; her ekleme nesiller arası simülasyondan geçmeli.

Sınıf kilitleri mevcut kullanıcı kararıdır. İlk denemede bunları kaldırmak yerine kilit dışındaki iş/proje akışını test edin. Yine boşluk kalıyorsa aynı anda kilitlenen yükseltme sayısı incelenir.

### Aktif iş ödülü bütçesi

İlk hipotez: her 90 saniyelik işin **net** ödülü, kabul anındaki sürdürülebilir otomatik gelirin 15–25 saniyesi olsun. Örneğin 20/90 ≈ %22 ilave gelir. Giriş bedeli varsa net ödülden düşülür.

Bu yalnız iş sisteminin katkısıdır. Olaylar, Şans, görevler, reklamlar ve çarpanlarla birlikte toplam katkı ayrıca hesaplanmalı. İş ödülüne reklam çarpanı ilk prototipte eklenmemeli; eğlenceyi ve ekonomik etkiyi ayrı ölçmek daha kolay olur.

### Riskli kartlar

Mevcut cesur seçeneğin parasal beklenen değeri `0,5×130 − 0,5×20 = 55 sn`, güvenli seçeneğin 45 sn. Kayıp duyarlılığını sabit “iki kat” sayıp oyuncuların seçimlerinin dengelendiğini varsaymayın. Gerçek seçim oranlarını ölçün. Uzun vadede hep aynı cevabı seçtiren kartlar yerine nakit, ilerideki fırsat ve kalıcı görünüm arasında bağlama bağlı seçimler ekleyin.

### Çevrimdışı kazanç

Mevcut oran %50, tavan sınıfa göre 10 dk–2 saat. Geç aşamada 8 saat ara veren oyuncunun yalnız 2 saati sayılır. Bunu değiştirmeden önce günde 1/2/3/6 oturum ve 24/72 saat ara profillerini karşılaştırın.

4/8 saat tavan adayları doğrudan gelir patlaması yaratabilir. Tavan artışı tek başına uygulanmamalı; oran, döndüğünde yapılabilen alımlar ve atlanan hikâye aşamaları birlikte ölçülmeli. Tercih edilen sonuç, uzun aradan sonra anlamlı bir alım ve hatırlanabilir yeni hedeftir.

## 8. Uygulama sırası

### P0 — Ölçüm ve Orta Sınıf boşluğu

- Simülatöre “anlamlı eylem bulunmayan aktif süre” ekle.
- Sınıf, satın alınabilir seçenek ve sonraki hedef bekleme süresini kaydet.
- Orta Sınıf öncesi/sonrası aynı uzunlukta oturumları karşılaştır.
- İlk iş sistemi: üç şablon, iki seçim, tek aktif iş.
- Hedef rozetiyle “şimdi / oturum / hayat” görünümü; mevcut ekrana uyarlama.

### P1 — İlerlemeyi görünür yap

- Annenin evi ve Rıza'nın atölyesi için iki küçük proje.
- Önemli alımlarda önce/sonra gelir ve hedef etkisi.
- Sonuç bırakan olay zincirleri; görülmeden tekrar etmeyen uygun içerik havuzu.

### P2 — Geç oyun ve nesiller

- 75 sonrası işletme uzmanlaşması için tek prototip.
- Erken devir ekranında neyin kaldığını/ne açıldığını açık göster.
- Lumen'e bir yeni ekonomik tercih; yeni sistem yığını değil.

Yeni kalıcı alanlar varsayılanlarla açılmalı; eski kayıtlar geriye dönük onlarca görev/olayla doldurulmamalı. Kimlikler korunmalı. Denge değişince mevcut simülasyon, TR/EN metinler ve eski kayıt geçişi doğrulanmalı.

## 9. Doğrulama planı

**Araştırma soruları:** Oyuncu neden bekliyor? Sonraki hedefini biliyor mu? Yeni iş karar mı yaratıyor, angarya mı? Zenginleşme hangi anda hissediliyor?

### İlk tur: 6–8 kişiyle gözlem

Idle sevenlerle daha seyrek oynayanları birlikte kapsayın. Yeni oyunda kısa oturum ve standart Orta Sınıf/Milyarder kayıtları kullanın; ileri kayıtların hikâye bağlamını kısa anlatın. Kayıttan başlamak doğal yolculuğun yerine geçmez, yalnız geç aşama kullanılabilirliğini hızla inceler.

Oyuncuya hedefi söylemeden:

- “Buradan devam et; ne yapmak istediğini söyle.”
- “Şu anda ne için para biriktiriyorsun?”
- “Son satın aldığın şey neyi değiştirdi?”
- “Oyunu şimdi kapatsan ne için geri gelirdin?”
- “Kendini daha zengin hissettiğin son an hangisiydi?”

Sessiz kalıp davranışı gözleyin. “Bu görev eğlenceli değil mi?” gibi yönlendirici soru sormayın. Beğendiğini söylemesiyle yeniden oynaması ayrı veridir.

### İkinci tur: 10–15 kişilik 7 günlük günlük çalışması

Günde tek kısa not: ne başardı, nerede sıkıldı, niçin döndü? Hikâyeyi hatırlama ve görev tekrarı özellikle izlenir. Bu örneklem nedenleri keşfetmek içindir; istatistiksel A/B üstünlüğü iddia etmek için yeterli kabul edilmez.

### Analitik

- `meaningful_action`: alımın gelir farkı, açtığı içerik veya proje ilerlemesi.
- `available_action_snapshot`: sınıf, erişilebilir seçenek sayısı, yaklaşık hedef bekleme süresi. Her karede değil, değişimde veya seyrek aralıklarla.
- `contract_start/complete/claim`: süre, tercih, net ödül, çevrimdışı tamamlanma.
- `goal_selected/completed`, `project_stage_completed`.
- Mevcut `story_view`, `class_up`, `session_start` ile ilişki.

Yeni ilk kabul hipotezleri: Orta Sınıf sonrası istekli aktif oyuncuda 90 saniyeyi aşan eylemsiz aralıkları azaltmak; 5–8 dakikalık oturumda en az bir tamamlanabilir hedef; oyuncunun sonraki hedefini yardım almadan anlatabilmesi.

D1/D7 geri dönüş, oturum başına tamamlanan hedef, eylemsiz süre P50/P90 ve çıkış öncesi durum birlikte izlenmeli. D1 kurulumdan sonraki takvim günü dönüş, D7 yedinci gün dönüş olarak açık tanımlanmalı. Hikâye/popup/arka plan süresi eylemsiz süreye katılmamalı. Reklam tıklaması, menü açıp kapama ve %0,01'lik sıradan artışlar otomatik olarak anlamlı eylem sayılmamalı.

## 10. Araçlar ve araştırma dayanağı

Şimdilik yeni MCP veya GitHub deposu gerekmiyor. Projenin saf TypeScript ekonomisi, simülatörü ve Firebase Analytics altyapısı bu çalışma için yeterli. Analitik sonuçlar mevcut bağlantıda erişilebilir değildi; bu rapor oyuncu verisi gördüğünü iddia etmez.

Harici repo eklemek mevcut ekonomi modeline ikinci bir doğruluk kaynağı sokabilir. İhtiyaç doğarsa belirli sorun için kütüphane değerlendirilir; örneğin sayılar gerçekten JavaScript sayısal sınırlarına yaklaşırsa büyük sayı çözümü. Bugünkü boşluk sorunu bununla ilgili değil.

Araştırmada kullanılan `design:user-research` skill'i gözlem, yönlendirmeyen sorular ve örneklem ayrımı için uygulandı.

Kaynaklar ve sınırlı çıkarımları:

1. [Anthony Pecorella — The Math of Idle Games, Part I](https://www.sirpinski.com/the-math-of-idle-games-part-i/): üstel maliyet, üretim, kilometre taşı ve optimal alım modelleri. Buradan çıkan temel kontrol, bir alımın yalnız verimli değil hissedilir etkiye de sahip olup olmadığıdır.
2. [Pecorella — Quest for Progress, GDC Europe 2016](https://media.gdcvault.com/gdceurope2016/presentations/Pecorella_Anthony_Quest%20for%20Progress.pdf): aktif yetenekler, eski üreticilerin ilgisini koruma, prestige sonrası güç hissi. Tasarım sunumudur; bu oyuna ait tutma verisi veya garanti değildir.
3. [Przybylski, Rigby, Ryan — A Motivational Model of Video Game Engagement, 2010](https://doi.org/10.1037/a0019440): yeterlik, özerklik ve ilişki ihtiyaçları üzerinden oyun motivasyonu çerçevesi. Buradaki uygulamamız: görünür ustalık, sonuç veren seçimler ve bağ kurulan karakterler.

Rapordaki süreler, ödül bütçesi ve içerik önerileri bu kaynaklardan alınmış endüstri normları değil, Prestige Life için doğrulanacak tasarım hipotezleridir.
