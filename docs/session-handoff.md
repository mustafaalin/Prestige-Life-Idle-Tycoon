# Session Handoff

Bu dosya, yeni bir sohbette çalışmaya hızlı devam etmek için hazırlanmıştır.
Amaç: Uzun uzun geçmişi anlatmadan, tek bir kısa prompt ile kaldığımız yerden devam edebilmek.

## Kısa Resume Prompt

Yeni sohbette bunu yazman yeterli:

```text
Bu projede daha önce birlikte local-first migration yapıyorduk. Önce lütfen şu dosyaları okuyup kaldığımız yerden devam et:

docs/session-handoff.md
docs/local-storage-transition.md
docs/database-schema.md
docs/game-rules.md
docs/rpc-reference.md
docs/quest-progression.md
docs/mobile-ad-integration.md
docs/bank-investment-system.md
docs/bank-expansion-plan.md

Amacımız Supabase bağımlılığını kaldırıp oyunu localStorage tabanlı, mobil öncelikli çalışır hale getirmekti. Önce mevcut durumu özetle, sonra sıradaki en mantıklı adımdan devam et.
```

## Projenin Ana Amacı

- Oyun şu anda Supabase bağımlı.
- Supabase limitleri geliştirmeyi bloke ettiği için oyun local-first mimariye geçiriliyor.
- Nihai amaç:
  - oyunu Supabase olmadan çalıştırmak
  - localStorage ile ilerlemeyi saklamak
  - ileride istersek kendi backend'e temiz geçiş yapabilmek
- UI yaklaşımı:
  - mobil öncelikli olmalı

## Şu Ana Kadar Yapılanlar

### Dokümantasyon

Oyun hafızası ayrıştırıldı:

- `docs/database-schema.md`
- `docs/game-rules.md`
- `docs/rpc-reference.md`
- `docs/local-storage-transition.md`
- `docs/quest-progression.md`
- `docs/mobile-ad-integration.md`
- `docs/bank-investment-system.md`
- `docs/bank-expansion-plan.md`

Bu dosyalara kullanıcıdan alınan canlı tablo/RPC bilgileri işlendi.

### Local auth / bootstrapping

Tamamlandı:

- `src/hooks/useAuth.ts`
  - Supabase auth yerine local device identity kullanıyor
- `src/lib/deviceIdentity.ts`
  - profile id için local device id dönüyor
- `src/hooks/useGameState.ts`
  - Supabase yükleme başarısız olursa local profile bootstrap ediyor

### Local seed / local data layer

Tamamlandı:

- `src/data/local/jobs.ts`
- `src/data/local/businesses.ts`
- `src/data/local/characters.ts`
- `src/data/local/outfits.ts`
- `src/data/local/storage.ts`
- `src/data/local/economy.ts`
- `src/data/local/rewards.ts`

### Local fallback eklenen servisler

Kısmen tamamlandı:

- `src/services/jobService.ts`
- `src/services/businessService.ts`
- `src/services/rewardService.ts`
- `src/services/purchaseService.ts`
- `src/services/itemService.ts`

Ek olarak:

- outfit satın alma ve seçme local mode'a taşındı
- starter outfit local profilde otomatik owned + selected kuruluyor
- local prestij helper eklendi ve job/business/house/car/outfit değişimlerinde çalışıyor
- `business_prestige_points` satırları local seed'e taşındı
- `businesses` gerçek satırları da local seed'e taşındı
- business prestiji artık gerçek business UUID'leri ve gerçek level tabloları ile hesaplanıyor

Bu servislerde Supabase hata verirse local state ile fallback çalışıyor.

### Quest sistemi

Başlandı:

- `docs/quest-progression.md`
  - chapter bazlı `100 görev` hedef planı dokümante edildi
- local-first görev sistemi eklendi
  - aktif quest datası artık `100 görev` planının tamamını içeriyor
  - görevler chapter mantığına çevrildi: `10 görev = 1 chapter`
  - açık chapter içindeki görevler paralel tamamlanabiliyor
  - tamamlanan ama claim edilmemiş görevler quest ikonunda dikkat işareti çıkarıyor
  - chapter tamamlanınca chapter reward claim edilip sonraki chapter açılıyor
  - footer'daki `Quest` butonu ile chapter tablı `Quest List` modalı açılıyor
  - para ödülünde merkez popup -> header para alanına uçuş -> header tween akışı var
  - elmas ödülünde merkez popup -> sağ üst gem alanına uçuş -> gem sayacı tween akışı var
  - quest reward reklam boost kuralı:
    - para ödülü `x2`
    - gem ödülü `2x` değil, sabit `+2 gem`

### UI düzenlemeleri

Tamamlandı:

- `src/components/JobsModal.tsx`
  - görünüm `BusinessModal` / `ShopModal` çizgisine yaklaştırıldı
  - İngilizce metinlere geçirildi
- `src/components/StuffModal.tsx`
  - mobil öncelikli tam panel yapıya taşındı
- `src/components/ShopModal.tsx`
  - daily reward artık local mode'da Supabase'siz çalışıyor
  - outfit tabı local mode'da Supabase'siz çalışıyor
  - daily reward claim, earnings claim, ad reward ve shop package purchase artık reward popup + header'a uçuş hissiyle çalışıyor
- `src/components/BottomNav.tsx`
  - dikkat gerektiren ekranlar için badge altyapısı eklendi
  - şu anda daily reward alınabilirken veya accumulated money claim barı doluyken `Shop` ikonunda yanıp sönen ünlem gösteriliyor

Son sprintte ayrıca:

- `src/components/InvestmentsModal.tsx`
  - bank ekranı yeniden sadeleştirildi
  - üstteki `Balance / Active / Ready` özet blokları kaldırıldı
  - `Cashback` ve `Premium Bank Card` blokları eklendi
  - deposit kartlarının padding ve iç hiyerarşisi yeniden düzenlendi
  - para kutusu ile süre kutusu ayrıldı
  - süre kutusunda artık yalnızca saat ikonu + kalan süre var
  - `INVEST`, `COLLECT`, `+10%`, `+50%`, `+100%` gibi yazılar küçültüldü
  - premium kart ile real estate `x2` etkisi property tarafında görünür hale getirildi
- `src/components/BusinessModal.tsx`
  - owned business kartları daha kompakt hale getirildi
  - büyük yatay income/upgrade bar yapısı yerine küçük income alanı + 5 yıldızlı upgrade görünümü eklendi
- `src/components/ShopModal.tsx`
  - daily reward alanı yeniden tasarlandı
  - ana shop ekranında daily reward daha sade bir summary kartına indirildi
  - detaylı 15 günlük görünüm ayrı bir popup içine alındı
  - gem ikonlarının react icon yerine lokal asset ile gösterilmesine başlandı
- `src/components/Header.tsx`
  - para ve saatlik gelir ikonları tekrar ayrıştırıldı; hourly income tarafı `money` ikonu kullanıyor
- `src/components/QuestRewardClaimModal.tsx`
  - daha küçük ve sade hale getirildi
- `src/components/OfflineEarningsModal.tsx`
  - quest reward modal çizgisine yakın sade tasarıma çekildi

### Mobile / Ads

Tamamlandı:

- Capacitor kuruldu
- Android ve iOS native projeleri oluşturuldu
- rewarded ad sistemi provider mimarisine ayrıldı
- web için mock rewarded ad modalı eklendi
- native için Capacitor AdMob provider eklendi
- Android / iOS test app id ve rewarded test ad unit konfigürasyonu yapıldı
- detay dokümanı: `docs/mobile-ad-integration.md`

### Bank Investment

Tamamlandı:

- `Investments` içinde `Bank` sekmesi açıldı
- çoklu aktif mevduat destekleniyor
- planlar:
  - `3 dk / +10% / max %20`
  - `1 saat / +50% / max %35`
  - `12 saat / +100% / ad required / max %50`
- premium plan mevcut rewarded ad altyapısına bağlandı
- bank claim mevcut para uçuş animasyonuna bağlandı
- vadesi dolmuş mevduat varsa `Investments` ikonunda dikkat badge'i çıkıyor
- aynı plan türünde ikinci mevduat açılamıyor; farklı planlar paralel açık olabiliyor

Genişletmeler:

- `Cashback` sistemi eklendi
  - belirli para harcamalarında cashback havuzu dolar
  - bank ekranından claim edilir
- `Premium Bank Card` eklendi
  - satın alma seçenekleri:
    - `$1.49`
    - `50 gems`
  - bonuslar:
    - `x2 Cashback`
    - `x2 Real Estate Income`
    - `x2 Deposit Income`
  - satın alma akışı ve bonus hesapları güçlendirildi
  - duplicate grant / yarış durumu riskleri azaltıldı
  - property ekranlarında premium etkisi görünür hale getirildi

### TypeScript durumu

Tamamlandı:

- local-first migration sonrası kalan tip çakışmaları temizlendi
- `BusinessModal` local `src/types/game.ts` tiplerine hizalandı
- `bonus_prestige_points` local profile tiplerine işlendi
- kullanılmayan import / state / parametre temizliği yapıldı
- `npm run typecheck` artık tamamen başarılı geçiyor

Son düzeltmeler:

- shop ad cooldown artık modal açık olmasa da gerçek zaman damgası üzerinden doğru ilerliyor
- accumulated money claim animasyonu tahmini miktarı değil, gerçek `claimed_amount` sonucunu gösteriyor
- quest ve gem/money tween animasyonlarının modal arkasında kalma sorunu çözüldü

## Kritik Oyun Kuralları

### Jobs

- Sonraki işi açmak için para gerekmiyor
- Mevcut işte en az 3 dakika çalışmak gerekiyor
- Yeni işe başlanınca eski iş `completed` oluyor
- Completed işe geri dönülmüyor

### Businesses

- Sıralı unlock var
- `purchase_business`:
  - `base_price`
  - başlangıç level `1`
  - başlangıç income `base_hourly_income`
- `upgrade_business`:
  - max level `6`
  - cost current income bazlı
  - çarpanlar: `30, 60, 120, 180, 240`
  - yeni income: `floor(current_hourly_income * 1.25)`

### Economy

- `hourly_income = gross_income - total_expenses`
- negatif net income mümkün
- gelir kaynakları: iş, işletme, yatırım
- gider kaynakları: ev, araç, diğer

### Houses / Cars

- House satın alınmaz, seçilir
- Car satın alınır
- Daha yüksek level house seçildikten sonra daha düşük levele geri dönülemez
- Daha yüksek level car seçildikten sonra daha düşük levele geri dönülemez

### Claim

- accumulated money:
  - max birikim `60 dakika`
  - baz oran `(hourly_income / 2) / 60`
  - günlük base claim limiti `hourly_income`
  - triple reward günlük limiti büyütmez
  - UI ve animasyon gerçek claim sonucu ile tutarlı olmalı; tahmini miktar gösterilip farklı miktar yazılmamalı

### Daily reward

- UTC gün bazlı
- 15 günlük döngü
- 1 gün kaçırılırsa reklam izleyerek streak rescue yapılabiliyor
- 2+ gün kaçırılırsa seri Day 1'e dönüyor
- daily reward artık gem ödüllerini de profile'a işliyor
- Shop modal daily reward kartı yeni gün/streak/milestone görünümüne taşındı
- Ana ekran özeti sade; detaylı 15 günlük görünüm ayrı popup içinde
- Tüm 15 gün tek bakışta görülebilecek grid yaklaşımı tercih edildi

### Quests

- Her normal görev `claim` edildiğinde `+1 prestige` verir
- Prestij görev tamamlandığı anda değil, claim anında eklenir
- Chapter bonus prestiji de chapter reward claim edilirken eklenir

## Şu An Muhtemel Açıklar

- `useGameState.loadGameData` içinde hâlâ bazı doğrudan Supabase sorguları var
- `ShopModal` içinde package tarafı demo/local fallback ile çalışıyor ama gerçek ödeme sistemi local-first için daha sonra netleştirilmeli
- asset URL'leri hâlâ Supabase Storage bağımlı olabilir
- görev sistemi ilk zincir ile başladı ama tüm `20+ / 100+` görev henüz koda taşınmadı
- `docs/quest-progression.md` içindeki `100 görev` planı artık kod tarafında da tanımlı
- mobile/native ad entegrasyonu başladı; test reklam altyapısı hazır ama gerçek cihaz doğrulaması henüz yapılmadı
- job progression hâlâ büyük ölçüde `3 dakika bekleme` kuralına dayanıyor; kullanıcı yeni unlock şartları düşünmek istiyor

## En Son Kaldığımız Yer

Şu an en güncel durum:

1. Son kodlar commit edildi ve push sorunu çözüldü
   - sebep: local `main` ile `origin/main` ayrışmıştı
   - `git pull --rebase origin main` + `git push origin main` ile düzeltildi
2. Daily reward, bank, claim ve reward UI tarafında son büyük polish turu tamamlandı
3. Kullanıcının gündemindeki bir sonraki önemli tasarım/oyun sistemi konusu:
   - job geçişine sadece `3 dakika` dışında ek şartlar düşünmek
   - oyunu daha motive edici hale getirecek unlock koşulları tasarlamak

## Yakın Ürün Backlog'u

Son konuşulan ve sonraki sprintlerde ele alınabilecek başlıklar:

1. `Investment > Bank` sekmesi
   - tamamlandı
   - detay kural dokümanı: `docs/bank-investment-system.md`
   - sonraki iyileştirmeler:
     - cashback sistemi
     - premium bank card sistemi
     - toplu claim
     - geçmiş mevduat listesi
     - üçüncü investment sekmesi tasarımı

2. Release readiness
   - görev zincirlerinin 1-100 arası gerçek oynanış testi
   - ekonomi denge testi
   - native ad testi
   - production store hazırlıkları

3. Job progression redesign
   - mevcut 3 dakika kuralına ek şartlar
   - stat / prestige / property / total work time / quest bağlı unlock seçenekleri
   - job category bazlı daha karakterli progression kurgusu

## Yeni Sohbette Beklenen İlk Davranış

Yeni sohbette ajan şunları yapmalı:

1. Önce bu dosyaları okusun:
   - `docs/session-handoff.md`
   - `docs/local-storage-transition.md`
   - `docs/database-schema.md`
   - `docs/game-rules.md`
   - `docs/rpc-reference.md`
   - `docs/quest-progression.md`
   - `docs/mobile-ad-integration.md`
2. Kaldığımız yeri 5-10 satırda özetlesin
3. Öncelikle Android native test aşamasından devam etsin; Android Studio ve telefon bağlantısı hazırsa rewarded ad doğrulamasına geçsin

## Kısa Kullanıcı Notu

Kullanıcının tercihleri:

- gereksiz uzun açıklama istemiyor
- önemli bilgilerin dosyalara yazılmasını istiyor
- mobil öncelikli geliştirme istiyor
- Supabase yerine local-first geçiş istiyor
- oyun kuralı ile şema çelişirse oyun kuralı öncelikli olmalı
