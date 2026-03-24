# Bank Expansion Plan

Bu doküman, mevcut `Bank` investment sekmesine eklenecek iki yeni sistemi tanımlar:

- `Cashback`
- `Premium Bank Card`

Amaç:

- Bank sekmesini sadece mevduat yatırımı ekranı olmaktan çıkarmak
- oyuncuya bankayı daha sık ziyaret ettiren ikinci ve üçüncü değer kaynağı eklemek
- ekonomi dengesini bozmadan uzun vadeli ilerleme hissi vermek

Bu doküman plan ve ürün tasarımı içindir.
Buradaki sistemler henüz aktif oyun kuralı değildir; koda geçirildikten sonra ilgili maddeler `docs/game-rules.md` içine taşınmalıdır.

## Neden Bu 2 Sistem

Mevcut bank sistemi şu anda:

- para yatır
- süre bekle
- ana para + karı claim et

akışıyla çalışıyor.

Bu yapı temiz ama tek katmanlı kalıyor.
Referans oyundaki bank sayfasında dikkat çeken şey ise yalnızca mevduat kartları değil, bankaya bağlı ek meta sistemler olması.

Bizim oyunda en doğal iki genişleme:

1. `Cashback`
2. `Premium Bank Card`

Sebep:

- mevcut harcama ekonomisiyle doğal bağ kuruyorlar
- sade UI ile anlatılabiliyorlar
- oyuncuya bank sekmesine tekrar dönme nedeni veriyorlar
- para ve reklam sistemleriyle kolay bağlanıyorlar

## Tasarım İlkeleri

Bu iki özellik tasarlanırken şu kurallar korunmalı:

- bank ekranı sade kalmalı
- yatırım kartlarının üstüne aşırı metin yüklenmemeli
- yeni sistemler anlaşılır ve tek bakışta okunabilir olmalı
- oyuncuya pasif değil, kontrollü ve net fayda vermeli
- erken oyunu kırmamalı
- local-first veri modeliyle rahat saklanabilmeli

## Sistem 1: Cashback

### Hedef

Oyuncu oyun içinde para harcadıkça küçük bir kısmı `cashback pool` içine birikir.
Bu birikim bank sekmesinden manuel olarak claim edilir.

Bu sistem oyuncuya şu hissi verir:

- harcama yaptıkça tamamen kaybetmiyorum
- bank kullanmak yatırım dışı da avantaj sağlıyor
- büyük satın almalardan sonra bankaya dönmek mantıklı

### Temel Mantık

- cashback anında ana paraya geri dönmez
- bunun yerine `claim edilebilir cashback bakiyesi` içine yazılır
- oyuncu bank sekmesinden istediği zaman `Claim Cashback` yapar
- claim sonrası cashback havuzu sıfırlanır

### Cashback Kaynakları

İlk sürümde sadece para azaltan büyük harcamalar cashback üretmelidir.

Uygun kaynaklar:

- business satın alma
- business upgrade
- car satın alma
- outfit satın alma
- investment property satın alma
- investment property upgrade
- bank premium card satın alma

İlk sürümde dahil edilmemesi önerilenler:

- house selection
  - çünkü house satın alma değil seçim
- accumulated money claim
- daily reward
- ad reward
- quest reward
- bank deposit collect

Sebep:

- cashback sadece gerçek `spending` davranışına bağlı kalır
- ödülden ödül üretip ekonomi şişirmez

### Cashback Formülü

İlk sürüm için basit ve sabit oran önerisi:

- temel cashback oranı: `%2`

Formül:

- `cashback_earned = floor(spent_amount * cashback_rate)`

Örnek:

- oyuncu `50,000` harcadı
- `%2` cashback ile `1,000` cashback pool'a eklenir

### Claim Kuralı

- cashback havuzu `>= 1` ise claim edilebilir
- claim edildiğinde:
  - `total_money` artar
  - `lifetime_earnings` artmaz
- sebep:
  - bu sistem gerçek üretim değil, harcamanın bir kısmının geri dönüşüdür
  - lifetime earnings’i yapay biçimde şişirmemek daha temiz olur

### Neden `lifetime_earnings` Yazılmıyor

Cashback teknik olarak yeni gelir değil, geri ödemedir.
Bu yüzden daha doğru yaklaşım:

- toplam para artsın
- ama `lifetime_earnings` içine yazılmasın

Bu karar ileride istenirse değiştirilebilir, ama ilk sürümde ekonomi okumasını daha dürüst tutar.

### Cashback Cap Kuralı

Sistemin sınırsız birikip unutulan bir kasa gibi davranmaması için üst limit önerilir.

İlk sürüm cap önerisi:

- `cashback_pool_cap = current hourly_income * 6`

Fallback:

- hourly income çok düşükse minimum cap `5,000`

Formül:

- `max(5000, floor(hourly_income * 6))`

Sebep:

- erken oyunda da anlamlı kalır
- geç oyunda da kontrolsüz sonsuza gitmez

### Cashback Overflow Davranışı

- yeni cashback eklenirken cap aşılırsa fazla kısım yazılmaz
- oyuncuya istersek ileride `Cashback pool full` uyarısı gösterilebilir
- ilk sürümde sessizce cap’e clamp etmek yeterlidir

### Cashback Upgrade Potansiyeli

İlk sürümde cashback oranı sabit kalmalı.
Ancak Premium Card ile ilişkili bonus için alan bırakılmalıdır.

Örnek ilerleme:

- base: `%2`
- premium card ile: `%3`

Bu bonus ilk sürüme dahil edilebilir, ama daha yüksek katmanlara çıkılmamalıdır.

## Sistem 2: Premium Bank Card

### Hedef

Oyuncuya bank sistemine bağlı kalıcı bir meta upgrade sunmak.

Bu sistem oyuncuya şu hissi verir:

- bank ekranında uzun vadeli yatırım hedefi var
- mevduat ve cashback sistemleri arasında sinerji oluşuyor
- tek seferlik veya premium satın alma bank sistemini daha anlamlı hale getiriyor

### Temel Ürün Kararı

İlk sürüm için en temiz yaklaşım:

- `tek kart`
- `tek satın alma`
- `kalıcı bonus`

Yani kart seviyesi, abonelik, çoklu tier gibi yapılar ilk sürüme dahil edilmez.

Bu kart örneğin:

- `Premium Bank Card`

olarak tekil bir unlock olur.

### Satın Alma Modeli

İki olası model vardı:

1. gerçek para / IAP
2. oyun içi premium para veya normal para

İlk sürüm için öneri:

- gerçek ödeme akışına bağlamamak
- oyun içi `gems` ile almak

Sebep:

- zaten gerçek ödeme sistemi local-first içinde netleşmiş değil
- gem kullanımı bu sisteme premium his verir
- dengelemesi daha kolay olur

Önerilen fiyat:

- `250 gems`

Bu sayı oyun testine göre revize edilebilir.

Alternatif:

- `150 gems`
- `300 gems`

Ama ilk prototip için `250 gems` iyi bir orta nokta.

### Premium Card Bonusları

İlk sürümde yalnızca 2 bonus önerilir:

1. cashback oranı artışı
2. bank deposit profit bonusu

Önerilen etkiler:

- cashback rate:
  - base `%2`
  - premium `%3`
- bank deposit profit bonus:
  - her planın kar oranına `+10% relative boost` değil
  - anlaşılması kolay olması için `+10% flat profit points` yaklaşımı

Önerilen yeni oranlar:

- Quick Deposit:
  - base `+10%`
  - premium `+20%`
- Growth Deposit:
  - base `+50%`
  - premium `+60%`
- Premium Ad Deposit:
  - base `+100%`
  - premium `+110%`

Sebep:

- oyuncunun farkı hissetmesi kolay olur
- kart satın alımı görünür değer üretir
- ama sistemi kıracak kadar büyük değildir

### Bonusların Sadelik Kuralı

İlk sürümde aşağıdakiler yapılmamalı:

- ek mevduat slotu
- erken claim
- cooldown düşürme
- reklamı kaldırma
- compound interest

Sebep:

- hem teknik karmaşıklık yaratırlar
- hem kartın değerini anlatmayı zorlaştırırlar
- hem de UI’ı gereksiz kalabalıklaştırırlar

### Sahiplik Kuralı

- oyuncu Premium Card’ı bir kez satın alır
- tekrar satın alamaz
- sahiplik kalıcıdır
- local save içinde boolean veya küçük bir object olarak saklanabilir

Örnek:

```ts
type BankPremiumCardState = {
  is_owned: boolean;
  purchased_at: string | null;
};
```

## İki Sistemin Birlikte Çalışması

### Hedef Sinerji

Oyuncu akışı şu şekilde olmalı:

1. oyunda harcama yapar
2. cashback pool dolar
3. bank sekmesinden cashback claim eder
4. bu parayı tekrar deposit’e yatırabilir
5. premium card varsa hem cashback hem deposit tarafında biraz daha iyi sonuç alır

Bu döngü oyuncuya yeni ama anlaşılır bir meta loop verir.

### Güvenli Denge

Bu sistemlerin oyunu kırmaması için:

- cashback düşük oranlı kalmalı
- cashback claim geliri `lifetime_earnings` üretmemeli
- premium card bonusları küçük ama hissedilir olmalı
- mevduat sisteminin temel limitleri korunmalı

## Veri Modeli Önerisi

Local game state içine aşağıdaki alanlar eklenebilir:

```ts
type BankSystemState = {
  cashback_pool: number;
  cashback_claimed_total: number;
  premium_card_owned: boolean;
  premium_card_purchased_at: string | null;
};
```

Alternatif daha açık model:

```ts
type BankSystemState = {
  cashback_pool: number;
  cashback_claimed_total: number;
  premium_card: {
    is_owned: boolean;
    purchased_at: string | null;
  };
};
```

Ek yardımcı türetilmiş değerler:

- `cashback_rate`
- `cashback_pool_cap`
- `has_premium_bank_card`
- `deposit_profit_multiplier_by_plan`

### Persisted Alanlar

- cashback_pool
- cashback_claimed_total
- premium card sahipliği
- premium card purchase zamanı

### Derived Alanlar

- effective cashback rate
- cashback pool cap
- plan bazlı premium bonuslu profit oranları

## UI Planı

Bank ekranı sade kalmalı.
Bu yüzden yeni sistemler tek bakışta okunacak iki ayrı blok olarak düşünülmeli.

### Önerilen Sıralama

1. `Premium Bank Card` bloğu
2. `Cashback` bloğu
3. mevcut `Investment` kartları

Bu sıralama referans ekrandaki hisse de daha yakın durur.

### Premium Bank Card Bloğu

Kartın içinde yalnızca şunlar olmalı:

- kart adı
- 2 kısa fayda maddesi
- fiyat
- `Buy` veya `Owned` durumu

Örnek içerik:

- `+1% Cashback`
- `Boosts bank deposit returns`

Eğer owned ise:

- buton yerine `Owned`
- isteğe bağlı küçük bir tik/rozet

### Cashback Bloğu

Sade tutulmalı.
İçinde sadece:

- mevcut cashback rate
- claim edilebilir cashback miktarı
- `Claim` butonu

İsteğe bağlı küçük yardımcı satır:

- `Earn cashback when you spend money`

Bu alan sayısal olarak kısa ve okunur kalmalı.

### Investment Kartları

Mevcut yatırım kartları sade kalabilir.
Bu yeni iki blok, yatırım kartlarının üstünde durur ama kartların içine ek metin yüklenmez.

## Oyun Akışına Entegrasyon

### Cashback Yazılacak Aksiyonlar

Cashback eklenmesi gereken servis aksiyonları:

- business purchase
- business upgrade
- car purchase
- outfit purchase
- investment property purchase
- investment property upgrade
- premium card purchase

Not:

- cashback ekleme işlemi, ilgili para düşümünden sonra merkezi helper ile yapılmalıdır
- böylece tüm sistemlerde tek kural korunur

### Premium Card Etkisi Yazılacak Yerler

- cashback rate hesaplayıcısı
- bank deposit oluşturma helper’ı
- bank plan preview UI
- bank plan modal preview

## Merkezi Helper İhtiyacı

Kod tarafında dağınıklık olmaması için şu helper’lar önerilir:

- `getCashbackRate(profileOrState)`
- `getCashbackPoolCap(profileOrState)`
- `awardCashback(spentAmount, state)`
- `claimCashback(state)`
- `hasPremiumBankCard(state)`
- `getEffectiveBankDepositPlan(planId, state)`
- `purchasePremiumBankCard(state)`

Bu helper’lar bank sistemini UI’dan ayırır.

## Ekonomi Denge Notları

### Cashback İçin

- `%2` base güvenli başlangıçtır
- `%3` premium ile hâlâ güvenli kalır
- daha yüksek oranlar özellikle geç oyunda riskli olabilir

### Premium Card İçin

- gem ile alınması onu premium hissettirir
- kalıcı bonus verdiği için fiyatı çok ucuz olmamalı
- ama ulaşılamaz da olmamalı

İlk test hedefi:

- orta oyunda alınabilir olmalı
- erken oyunda zor ama hayal edilebilir görünmeli

## İlk Sürüm Kapsamı

İlk sürüme dahil:

- tek Premium Bank Card
- gem ile satın alma
- cashback pool
- cashback claim
- premium card owned state
- premium bonuslu cashback rate
- premium bonuslu deposit oranı

İlk sürüme dahil değil:

- çoklu card tier
- gerçek para ile banka kartı satın alma
- cashback görevleri
- cashback streak
- card level up
- cashback geçmiş listesi
- banka point sistemi

## Uygulama Sırası

1. type ve local storage modelini genişlet
2. bank helper fonksiyonlarını ekle
3. cashback yazılacak harcama aksiyonlarını merkezi hale getir
4. premium card satın alma akışını yaz
5. cashback claim akışını yaz
6. bank UI içine `Premium Card` ve `Cashback` bloklarını ekle
7. bank deposit oranlarını premium state ile canlı hesapla
8. ekonomi testi yap

## Sonraki Turda Kodlarken Dikkat

- önce helper ve state modeli yazılmalı
- sonra UI bağlanmalı
- mevcut bank mevduat sistemi bozulmamalı
- premium yoksa tüm sistem bugünkü davranışı korumalı
- mevcut save dosyaları için güvenli default değerler eklenmeli
