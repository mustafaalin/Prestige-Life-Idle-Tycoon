# Bank Investment System

Bu doküman `Investments` içindeki ikinci sekmenin `Bank` olarak açılması için ürün ve ekonomi kuralını tanımlar.
Amaç: oyuncuya mevcut bakiyesinin bir kısmını belirli süreli mevduata bağlama seçeneği vermek.

## Hedef

- `Real Estate` yanında ikinci açık sekme `Bank` olacak.
- Oyuncu mevcut bakiyesinin belirli bir kısmını vadeli yatırıma bağlayabilecek.
- Vade bitene kadar bu para kullanılamayacak.
- Vade bitince ana para + kar birlikte claim edilecek.
- Sistem online ve offline sürede ilerlemeye devam edecek.

## Neden Var

- `Investments` ekranını sadece property sistemi olmaktan çıkarır.
- Oyuncuya "bekleyen parayı çalıştırma" hissi verir.
- Reklamlı ödül için doğal ve isteğe bağlı bir kullanım alanı yaratır.
- Property sistemini bozmadan ikinci bir yatırım katmanı açar.

## Sekme Yapısı

- `Real Estate`
- `Bank`
- üçüncü sekme şimdilik kilitli kalabilir

## Ana Kural

- Oyuncu aynı anda birden fazla aktif banka yatırımı açabilir.
- Ancak her plan türünde aynı anda sadece `1` aktif yatırım olabilir.
- Yani:
  - `Quick` aktifken ikinci `Quick` açılamaz
  - `Growth` aktifken ikinci `Growth` açılamaz
  - `Premium Ad` aktifken ikinci `Premium Ad` açılamaz
- Buna karşılık oyuncu aynı anda:
  - `1 Quick`
  - `1 Growth`
  - `1 Premium Ad`
  yatırımı tutabilir.
- Yatırılan para anında ana bakiyeden düşer.
- Vade dolmadan geri çekme yoktur.
- Vade dolunca oyuncu ilgili yatırımı `Collect` ile alır.

Sistem dengesi artık `tek slot` ile değil, plan bazlı yüzde sınırları ve vade süreleri ile korunacaktır.

## Yatırım Paketleri

### 1. Quick Deposit

- Süre: `3 dakika`
- Getiri: `+10%`
- Maksimum yatırım: mevcut bakiyenin `%20`'si
- Reklam gerekmez

Örnek:

- bakiye `10,000`
- yatırılabilecek maksimum `2,000`
- vade sonunda alınacak toplam `2,200`

### 2. Growth Deposit

- Süre: `1 saat`
- Getiri: `+50%`
- Maksimum yatırım: mevcut bakiyenin `%35`'i
- Reklam gerekmez

Örnek:

- bakiye `10,000`
- yatırılabilecek maksimum `3,500`
- vade sonunda alınacak toplam `5,250`

### 3. Premium Ad Deposit

- Süre: `12 saat`
- Getiri: `+100%`
- Reklam gerekir
- Maksimum yatırım: mevcut bakiyenin `%50`'si

Bu pakette `%25` üst sınır fazla düşük kalıyordu. `%50` daha anlamlı çünkü:

- 12 saat bekleme süresi zaten uzun
- reklam şartı var
- oyuncu bunu sık kullanamaz
- tek aktif mevduat kuralı sistemi dengede tutar

Örnek:

- bakiye `10,000`
- yatırılabilecek maksimum `5,000`
- vade sonunda alınacak toplam `10,000`

## Reklam Kuralı

Sadece `Premium Ad Deposit` reklam gerektirir.

Önerilen akış:

1. oyuncu premium paketi seçer
2. yatırmak istediği miktarı girer
3. `Watch Ad To Start` butonuna basar
4. rewarded ad başarıyla tamamlanırsa yatırım başlatılır
5. reklam tamamlanmazsa yatırım başlamaz ve para düşülmez

Yani reklam, ödülü claim ederken değil yatırımı başlatırken istenir.
Bu daha temizdir; çünkü oyuncu 12 saat bekledikten sonra claim anında yeni sürtünme yaşamaz.

## Çoklu Mevduat Kuralı

- Oyuncu aynı anda farklı planlarda birden fazla yatırım açabilir.
- Aynı plan kendi içinde üst üste açılamaz.
- Her kayıt ayrı `started_at` ve `matures_at` ile tutulur.
- Claim işlemi yatırım bazlı yapılır; toplu claim sonradan eklenebilir.

Önemli denge notu:

- çoklu mevduat açık olsa da, her yeni yatırım anlık mevcut bakiyeye göre hesaplanır
- yani oyuncu aynı parayı birden fazla kez yatıramaz
- para bakiyeden anında düştüğü için sistem zincirleme suistimale daha kapalı kalır

## Tutar Belirleme Kuralı

- Oyuncu istediği miktarı girebilir ama plan üst limitini geçemez.
- Minimum yatırım limiti olmalı:
  - öneri: `1,000`
- Girilen tutar:
  - pozitif olmalı
  - mevcut bakiyeden büyük olamaz
  - planın yüzde limitini aşamaz

## Zaman Hesabı

- Bank yatırımı gerçek zamanlı ilerler.
- Oyun kapalıyken de sayaç devam eder.
- Süre hesabı `started_at` ve `matures_at` alanlarıyla yapılır.
- Süre dolunca claim hazır hale gelir.

## Claim Kuralı

- Claim edildiğinde ana para + kar birlikte `total_money` alanına döner.
- Kar kısmı ayrıca `lifetime_earnings` içine de eklenebilir.
- Teknik olarak daha temiz yaklaşım:
  - `principal + profit` bakiyeye eklenir
  - `profit` kadar değer `lifetime_earnings` içine yazılır

Bu yaklaşım oyuncunun "kazanç" metriğini daha doğru tutar.

## Önerilen Veri Modeli

`profile` veya local game state içinde yeni alan:

```ts
type ActiveBankDeposit = {
  id: string;
  plan_id: 'quick' | 'growth' | 'premium_ad';
  principal: number;
  profit: number;
  started_at: string;
  matures_at: string;
  ad_required: boolean;
  ad_completed: boolean;
};
```

Ek yardımcı alanlar:

- `active_bank_deposits: ActiveBankDeposit[]`
- ileride istenirse `bank_deposit_history`

## UI Akışı

### Bank Ana Ekranı

- üstte kısa özet
  - `Available Balance`
  - `Active Deposit` varsa kalan süre
- altta 3 yatırım kartı
  - süre
  - getiri
  - max yüzde
  - reklam gerekiyorsa badge

### Plan Seçim Ekranı

- seçilen planın büyük kartı
- mevcut bakiye
- bu plan için maksimum yatırım
- miktar inputu
- hızlı seçim butonları
  - `25%`
  - `50%`
  - `Max`

### Aktif Yatırımlar Alanı

- aktif yatırımlar liste halinde görünür
- her kartta:
  - plan adı
  - yatırılan ana para
  - vade sonunda alınacak toplam
  - kalan süre
  - durum:
    - `In Progress`
    - `Ready To Collect`

### Claim Anı

- `Collect` butonu
- mevcut para ödül animasyonuna bağlanır
- merkezde miktar görünür
- sonra header para alanına uçar

## Badge / Dikkat İşareti

Vade dolmuş ama claim edilmemiş banka yatırımı varsa:

- `Investments` ikonunda dikkat ünlemi gösterilebilir

Bu, mevcut `Shop` ve `Quest` dikkat işaretleriyle uyumludur.

## Ekonomi Denge Notları

Bu sistemi güvenli tutan ana frenler:

1. vade dolmadan erken çekim yok
2. plan bazlı yüzde sınırı var
3. para bakiyeden anında düşüyor
4. en güçlü paket reklam gerektiriyor
5. uzun vadeli plan süresi çok yüksek

Bu yüzden `%50` üst limitli premium plan kabul edilebilir.

## İlk Uygulama Kapsamı

İlk sürüm için yeterli olanlar:

- `Bank` sekmesini aç
- `3` planı göster
- çoklu aktif mevduat desteği
- local storage state
- offline süre ilerlemesi
- claim animasyonu
- vade dolunca `Investments` ikonunda badge

İlk sürüme dahil edilmeyecekler:

- erken bozma cezası
- birden fazla slot
- faiz geçmişi
- günlük banka görevleri
- banka özel prestij sistemi

## Uygulama Sırası

1. veri modeli ve local storage alanları
2. bank hesap helper fonksiyonları
3. `InvestmentsModal` içine `Bank` sekmesi
4. mevduat oluşturma akışı
5. claim akışı + para animasyonu
6. badge / dikkat işareti
7. denge testi
