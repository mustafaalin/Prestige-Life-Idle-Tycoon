# Game Rules

Bu dosya oyunun gerçek işleyiş kurallarını tutar.
Şema alanlarıyla çelişki varsa gerçek oyun kuralı önceliklidir.

## Genel

- Oyunda gelir kaynakları: iş, işletme, yatırım.
- Oyunda gider kaynakları: ev kirası, araç gideri, diğer giderler.
- Net kazanç `hourly_income` üzerinden ilerliyor.
- Kıyafet sistemi prestije etki edebiliyor.
- Günlük ödül, birikmiş para claim ve reklam ödülü ayrı sistemler.
- Karakter sistemi şu an fiilen tek karakterli çalışıyor.
- Oyuna başlayan herkes otomatik olarak varsayılan karakteri seçmiş kabul edilmeli.
- Çoklu karakter seçimi ileride gelebilir ama mevcut oyunda zorunlu başlangıç seçimi yok.

## Karakter ve Outfit Sistemi

- Başlangıç outfit'i oyuna ilk girişte otomatik seçili gelmelidir.
- Başlangıç outfit'i aynı zamanda sahip olunmuş ve unlocked durumda olmalıdır.
- Oyuncu parası yettiği sürece istediği outfit'i satın alabilir.
- Satın alınan outfit envantere eklenir ve daha sonra tekrar giyilebilir.
- Oyuncunun toplam prestijine tüm satın aldığı outfit'ler değil, sadece o anda giydiği outfit'in `prestige_points` değeri eklenir.
- Yani outfit prestiji `selected_outfit_id` üzerinden hesaplanmalıdır.
- `character_outfits.unlock_type` ve `character_outfits.unlock_value` kolonları şemada mevcut olsa da aktif oyun kuralında kullanılmıyor.
- Outfit satın alma sırasında satın alınan outfit istenirse anında seçili hale getirilebilir.

## Prestij Sistemi

- Toplam prestij yalnızca quest ilerlemesinden hesaplanır.
- Prestij kaynakları:
  - Her claim edilen quest: +1 prestige
  - Chapter reward'ları: ayrıca bonus prestige verir
  - Reset bonusu: her reset'te `reset_prestige_bonus` alanında birikir, kalıcıdır
- `bonus_prestige_points` = quest prestige + reset_prestige_bonus
- `prestige_points` = `bonus_prestige_points` ile eşit
- İş, işletme, ev, araç, outfit'in prestige katkısı yoktur — bu alanlar eski sistemden kalan kalıntıdır.
- `syncQuestPrestige()` fonksiyonu quest ilerlemesini ve reset bonusunu birleştirerek prestige'i günceller.

## İş Sistemi

- Bir sonraki işin açılması için para şartı yok.
- `jobs.unlock_requirement_money` aktif oyun kuralı değil.
- Bir oyuncu mevcut işte en az 3 dakika çalışınca bir sonraki işin kilidi açılır.
- Oyuncu bir sonraki işe başladığında önceki iş `completed` olur.
- `completed` olan işe geri dönülemez.
- İlerleme işten işe doğrusal akar; eski işe dönüş yoktur.

## İşletme Sistemi

- İşletmeler oyunun pasif gelir kaynaklarından biridir.
- İşletmeler sırayla açılır; oyuncu `unlock_order` sırasını atlayamaz.
- İlk işletme, para yeterliyse doğrudan satın alınabilir.
- Bir işletme satın alındığında:
  - başlangıç level `1` olur
  - başlangıç geliri `base_hourly_income` olur
  - `base_price` kadar para düşer
- İşletme upgrade sistemi:
  - max level `6`
  - upgrade maliyeti mevcut `current_hourly_income` üzerinden hesaplanır
  - çarpanlar sırayla `30 / 60 / 120 / 180 / 240`
  - yeni gelir `floor(current_hourly_income * 1.25)` formülüyle artar
- İşletme upgrade sonrası net gelir ve prestij merkezi fonksiyonlarla yeniden hesaplanır.

## Gelir ve Gider Sistemi

- Aktif iş geliri, yalnızca `is_active = true` olan işten gelir.
- İşletme geliri, satın alınmış işletmelerin `current_hourly_income` toplamıdır.
- Yatırım geliri, satın alınmış yatırımların `current_rental_income` toplamıdır.
- Ev gideri, seçili evin `hourly_rent_cost` değerinden gelir.
- Araç gideri, seçili aracın `hourly_maintenance_cost` değerinden gelir.
- Diğer giderler `other_expenses` alanından gelir.
- Brüt gelir:
  - `job_income + business_income + investment_income`
- Toplam gider:
  - `house_rent_expense + vehicle_expense + other_expenses`
- Net saatlik gelir:
  - `gross_income - total_expenses`
- Net gelir negatif olabilir; oyun bunu sıfıra zorlamaz.

## Ev ve Araç Sistemi

- Evler satın alınmaz, sadece seçilir.
- Ev değiştirince para düşülmez.
- Ev seçimi sonrası kira gideri yeniden hesaplanır.
- Seçili ev prestiji toplam prestije eklenir.
- Oyuncu daha yüksek level bir eve geçtiğinde daha düşük level evlere geri dönemez.
- Arabalar satın alınır.
- Araba satın alındığında para düşülür ve seçili araç o olur.
- Araba seçimi/satın alımı sonrası araç gideri yeniden hesaplanır.
- Seçili araç prestiji toplam prestije eklenir.
- Oyuncu daha yüksek level bir aracı seçtiğinde daha düşük level araçlara geri dönemez.

## Investment Sistemi

- Investment sistemi şu anda:
  - `Real Estate`
  - `Bank`
  - bir adet kilitli gelecek sekme
  ile çalışır.
- Investment modalı 3 sekmeli olacak:
  - `Real Estate` açık
  - `Bank` açık
  - diğer 1 sekme şimdilik kilitli
- Real Estate sistemi oyuncunun yatırım amaçlı ev satın almasını sağlar.
- Bu evler, yaşam alanı olarak seçilen `houses` sisteminden ayrıdır.
- Real Estate market listesi yaklaşık `40-50` ev içerecek.
- Fiyat aralığı yaklaşık `50,000` ile `250,000,000` arasında kademeli artacaktır.
- Market başta tüm yatırım evlerini gösterecektir; sırayla unlock olmayacaktır.
- Oyuncu parası yettiği sürece istediği evi doğrudan satın alabilir.
- Market ekranında evler liste halinde gösterilir.
- Her ev kartında:
  - ev görseli
  - fiyat
  - bölge / konum bilgisi
  bulunur.
- Market ekranında fiyat artan / azalan sıralama seçeneği olmalıdır.
- Bir ev kartına tıklanınca detay modalı açılır.
- Detay modalında:
  - ev görseli
  - fiyat
  - satın alma butonu
  bulunur.
- Satın alma akışı ikinci bir onay / özet modalı ile tamamlanır.
- Bu özet ekranında:
  - location
  - ev fiyatı
  - saatlik kira getirisi
  gösterilir.
- Satın alma tamamlanınca ev `My Properties` sekmesine geçer.
- `My Properties` sadece satın alınmış yatırım evlerini gösterir.
- Satın alınan yatırım evleri oyuncuya saatlik kira getirisi sağlar.
- Investment geliri toplam ekonomik hesapta `investment_income` olarak ana profile eklenmelidir.
- Başlangıç saatlik kira getirisi ev fiyatı ile orantılıdır:
  - `base hourly rental income = floor(price / 200)`
- Satın alınmış evin detayında 5 upgrade seçeneği bulunur:
  - evi boya
  - beyaz esya koy
  - mobilya koy
  - internet baglat
  - otopark yap
- Yapılmış upgrade'ler ev görselinin altında küçük ikonlar ile gösterilir.
- Upgrade maliyetleri ev fiyatına oranlıdır:
  - 1. upgrade: `price / 10`
  - 2. upgrade: `price / 4`
  - 3. upgrade: `price / 3`
  - 4. upgrade: `price / 2`
  - 5. upgrade: `price`
- Upgrade'ler sırayla yapılmalıdır.
- Oyuncu 1. upgrade'i yapmadan 2.'yi, 2.'yi yapmadan 3.'yü alamaz.
- Her upgrade kira getirisini artırır.
- Upgrade kira artışları yüzdesel olarak tasarlanabilir.
- İlk uygulama için önerilen kira artış oranları:
  - 1. upgrade: `+20%`
  - 2. upgrade: `+40%`
  - 3. upgrade: `+75%`
  - 4. upgrade: `+100%`
  - 5. upgrade: `+150%`
- Bu artışlar kümülatif olarak mevcut kira değerinin üstüne eklenmez.
- Her upgrade seviyesi, evin `base_rental_income` değeri üzerinden yeni toplam kira seviyesini belirler.
  - Örnek: base rent `150` ise 4. upgrade sonrası kira `300` olur.
- Upgrade butonunda veya özetinde, yükseltme sonrası yeni kira gelirinin kaç olacağı oyuncuya gösterilmelidir.

### Bank Sistemi

- `Bank` investment sekmesi mevduat yatırımları içindir.
- Bank ekranında üstte ayrı `Balance / Active / Ready` özet kutuları yoktur; bilgi doğrudan ilgili kartlarda gösterilir.
- Oyuncu aynı anda birden fazla aktif banka yatırımı açabilir.
- Ancak aynı plan türünde aynı anda sadece `1` aktif yatırım olabilir.
- Farklı planlar paralel açık olabilir.
- Her yatırım ayrı sayaçla ilerler.
- Yatırılan para anında bakiyeden düşer.
- Vade dolmadan geri çekim yoktur.
- Vade dolunca `Collect` ile ana para + kar birlikte alınır.
- Bank planları:
  - `Quick Deposit`
    - `3 dakika`
    - `+10%`
    - max mevcut bakiyenin `%20`
  - `Growth Deposit`
    - `1 saat`
    - `+50%`
    - max mevcut bakiyenin `%35`
  - `Premium Ad Deposit`
    - `12 saat`
    - `+100%`
    - rewarded ad gerekir
    - max mevcut bakiyenin `%50`
- Premium plan reklamı claim anında değil, yatırımı başlatırken gösterilir.
- Bank claim edildiğinde:
  - `principal + profit` bakiyeye eklenir
  - sadece `profit` kısmı `lifetime_earnings` içine yazılır
- Vadesi dolmuş ama claim edilmemiş banka yatırımı varsa `Investments` ikonunda dikkat badge'i gösterilebilir.

### Bank Cashback Sistemi

- Bank sekmesinde ayrı bir `Cashback` sistemi vardır.
- Oyuncu aşağıdaki para harcamalarında cashback biriktirir:
  - business satın alma / upgrade
  - real estate satın alma / upgrade
  - car satın alma
  - character satın alma
  - outfit satın alma
- Base cashback oranı `2%`'dir.
- Cashback claim edildiğinde:
  - para ana bakiyeye eklenir
  - `lifetime_earnings` artmaz
- Cashback ayrı bir havuzda birikir ve bank ekranından manuel `Claim Cashback` ile toplanır.

### Premium Bank Card

- Bank ekranında `Premium Bank Card` sistemi vardır.
- Kart tek seferlik sahiplik mantığıyla çalışır; tekrar satın alınmaz.
- Kart iki satın alma yöntemi sunar:
  - `$1.49`
  - `50 gems`
- Premium kart aktif olduğunda şu bonuslar çalışır:
  - `x2 Cashback`
  - `x2 Real Estate Income`
  - `x2 Deposit Income`
- Bu bonuslar sadece yazıda değil, gerçek hesapta uygulanmalıdır.
- Premium kart etkisi real estate ekranlarında da görünür olmalıdır; oyuncu `base` gelir ile premium sonrası geliri ayırt edebilmelidir.

## Claim Sistemi

- Birikmiş para claim sistemi vardır.
- Claim hesabı `last_claim_time` ile şimdi arasındaki süreye göre yapılır.
- Birikim süresi en fazla `60 dakika` sayılır.
- Claim ve ad reward miktarları `prestige_points` odaklı scale tablosundan hesaplanır.
- Investment sistemi prestije doğrudan eklenmediği için sahip olunan investment sayısı reward scale'e küçük bonus etkisi verir.
- 60 dakikalık full claim havuzu scale tablosundan gelir.
- Günlük base claim limiti full claim havuzunun 2 katıdır.
- Triple claim ödülü mümkündür.
- Triple claim, oyuncuya verilen parayı 3x yapar ama günlük claim limitini 3x yapmaz.
- Günlük limite ulaşıldığında claim sistemi kilitlenir.
- Kilit süresi:
  - en fazla `8 saat`
  - ama UTC gece yarısı daha erkense orada açılır
- Yeni günde claim sayaçları resetlenir.
- UI tarafında gösterilen claim miktarı, tahmini değil gerçek claim edilebilir miktar olmalıdır.
- Claim animasyonu da tahmini değil, gerçek servis sonucunda dönen `claimed_amount` değerini göstermelidir.

## Günlük Ödül Sistemi

- Günlük ödül sistemi UTC güne göre çalışır.
- Oyuncu bir UTC gününde bir kez günlük ödül claim edebilir.
- Günlük akış 15 günlük plan şeklinde ilerler.
- UI'da gösterilen gün:
  - bugün zaten claim edilmişse bugünün günü gösterilir
  - bugün claim edilmediyse sıradaki claim günü gösterilir
- Gösterilen gün değeri `1` ile `15` arasında tutulur.
- Reset zamanı UTC gece yarısıdır.
- Streak bozulursa günlük ödül 1. günden yeniden başlar.
- Oyuncu tam 1 UTC gününü kaçırdıysa reklam izleyerek streak'i kurtarabilir.
- Oyuncu 2 veya daha fazla UTC günü kaçırdıysa streak rescue hakkı düşer ve seri Day 1'e döner.
- Streak her gün ardışık claim ile 1..15 arasında döngüsel ilerler.
- Günlük ödül miktarları:
  - 1. gün: `1000`
  - 2. gün: `3000`
  - 3. gün: `7000`
  - 4. gün: `15000`
  - 5. gün: `20000`
  - 6. gün: `25000`
  - 7. gün: `30000 + 5 gem`
  - 8. gün: `40000`
  - 9. gün: `50000 + 1 gem`
  - 10. gün: `65000`
  - 11. gün: `75000`
  - 12. gün: `100000 + 5 gem`
  - 13. gün: `125000`
  - 14. gün: `150000 + 10 gem`
  - 15. gün: `200000 + 15 gem`
- Günlük ödül claim edildiğinde:
  - `total_money` artar
  - `lifetime_earnings` artar
  - varsa gem ödülü `gems` alanına eklenir
- Shop ekranında günlük ödül için ana ekran özeti sade tutulmalı; detaylı 15 günlük görünüm ayrı popup/modal içinde verilebilir.
- Günlük ödül görsellerinde gem simgesi için oyun içi lokal gem asset'i kullanılmalıdır.

## Quest Sistemi

- Görev tamamlanınca anında prestij verilmez.
- Her normal görev `claim` edildiğinde `+1 prestige` verir.
- Chapter tamamlanınca chapter reward ayrıca claim edilir ve ekstra chapter prestige orada eklenir.
- Toplam quest prestiji sadece claim edilmiş görevler ve claim edilmiş chapter reward'lar üzerinden hesaplanmalıdır.

## Reward Modal / UI Kuralları

- Quest reward claim modalı büyük ve detaylı değil; kompakt, hızlı okunur ve iki aksiyonu net gösteren yapıda olmalıdır.
- Offline earnings modalı da benzer şekilde sade ve kompakt olmalıdır.
- Para ve gem reward animasyonları ilgili modalın arkasında kalmamalı; modal üstünde görünmelidir.

## Açıkta Olan Kurallar

Henüz detaylandırılacak alanlar:

- Reklam ödülünün gerçek üretim kuralı
  - local fallback şu an çalışıyor ama canlı oyundaki kesin kural ayrıca doğrulanmalı
- Reset sistemi
- Investment sisteminin aşağıdaki detayları
  - upgrade ikon seti ve görsel isimlendirme düzeni
- Money/gem package sistemi
  - local demo akışı var
  - money package coin miktarları da prestige odaklı scale tablosundan hesaplanıyor

## Quest Balance Notları (2026-05-07 analiz)

- 100 static quest + generated job level quest'leri birlikte chapter'lara dağılmış
- Chapter başına gerçek quest sayısı: 10 (ch0), 11 (ch1-2), 14-16 (ch3-9)
- Chapter tamamlamak için o chapter'daki TÜM quest'ler gerekiyor (`every()`)
- Job quest'leri paralel ilerlediği için bottleneck en zorlu static quest'tir
- Quest 90 (rental income eşiği): $100K → $20K düzeltildi; orijinal $100K Chapter 8'de 12 investment ile ulaşılamazdı (~$32K max)
- `claimed_quest_count` mantığı doğru çalışıyor (eski "broken" notu geçersiz)
- Chapter 3'ten itibaren prestige doğal olarak dolduruluyor: Chapter 7 sonunda ~245 prestige → job 53 için gereken 206 prestige karşılanıyor

## Kural Önceliği Notları

- Şemada duran ama oyunda kullanılmayan alanlar gerçek kural sayılmamalıdır.
- Şu an bilinen örnekler:
  - `jobs.unlock_requirement_money`
  - `character_outfits.unlock_type`
  - `character_outfits.unlock_value`
- Kod tarafında karar verirken öncelik sırası:
  - bu dosyadaki gerçek oyun kuralı
  - sonra RPC davranışı
  - en son tablo şeması
