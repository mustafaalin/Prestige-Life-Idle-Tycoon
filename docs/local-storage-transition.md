# Local Storage Transition Plan

Bu dosya, projeyi Supabase bağımlılığından çıkarıp local-first çalışır hale getirmek için uygulanacak aşamaları tanımlar.

## Amaç

Kısa vadede:

- Oyun Supabase kapalıyken açılabilsin
- Oyuncu ilerlemesi local olarak saklanabilsin
- Geliştirme akışı dış servislere bağlı kalmadan devam edebilsin
- Mobil öncelikli UI yapısı korunabilsin

Orta vadede:

- Supabase servis çağrıları yerini local veri katmanına bıraksın
- Oyun kuralları TypeScript servislerinde çalışsın
- İleride backend'e geçiş için veri erişim katmanı soyut olsun

## Mevcut Bağımlılık Noktaları

Ana Supabase temas alanları:

- `src/hooks/useAuth.ts`
- `src/hooks/useGameState.ts`
- `src/hooks/useAutoSave.ts`
- `src/hooks/useJobTracking.ts`
- `src/services/profileService.ts`
- `src/services/itemService.ts`
- `src/services/jobService.ts`
- `src/services/businessService.ts`
- `src/services/purchaseService.ts`
- `src/services/rewardService.ts`
- `src/components/ShopModal.tsx`
- `src/components/CharacterSelector.tsx`
- `src/lib/deviceIdentity.ts`

## Geçiş Stratejisi

Tam rewrite yapılmayacak.

Onun yerine şu sıra izlenecek:

1. Uygulamayı local kimlikle açılır hale getir
2. Başlangıç verisini local seed + local save modelinden yükle
3. Profil, iş, işletme, claim gibi akışları local servis katmanına taşı
4. Supabase Storage görsellerini local asset path'lerine geçir
5. Kullanılmayan Supabase kodunu temizle

## Aşama 1: Uygulamayı Ayağa Kaldır

Hedef:

- Supabase auth olmadan uygulama açılmalı
- `Authentication Failed` ekranı kalkmalı

Yapılacaklar:

- `useAuth` içindeki Supabase auth akışını local oturum modeline çevir
- `deviceIdentity` üzerinden local `userId` üret
- App içinde `isAuthenticated` her zaman local oturumla `true` olabilsin
- Bu aşamada email/password auth devre dışı bırakılabilir veya no-op olabilir

Başarı ölçütü:

- Supabase kapalı olsa bile ana uygulama render almalı

## Aşama 2: Local Veri Kaynağı Kur

Hedef:

- Oyun state'i local saklanmalı
- Başlangıç seed verisi local dosyalardan yüklenmeli

Yapılacaklar:

- Yeni bir local veri katmanı oluştur:
  - örnek: `src/data/local/`
- Master data için local seed dosyaları oluştur:
  - jobs
  - businesses
  - houses
  - cars
  - characters
  - outfits
- Oyuncu save modeli tanımla:
  - profile
  - gameStats
  - playerJobs
  - playerBusinesses
  - playerPurchases
  - playerOutfits

Başarı ölçütü:

- `loadGameData` Supabase sorgusu olmadan local state kurabilmeli

## Aşama 3: Servis Katmanını Local'e Taşı

Hedef:

- Oyun kuralları TypeScript servislerinde çalışsın

Öncelik sırası:

1. `profileService`
2. `jobService`
3. `businessService`
4. `purchaseService`
5. `rewardService`
6. `statsService`

Bu aşamada:

- RPC mantıkları `docs/rpc-reference.md` içinden TypeScript'e taşınacak
- oyun kuralları `docs/game-rules.md` ile eşleştirilecek
- türetilmiş alanlar merkezi hesaplayıcılarla üretilecek

## Aşama 4: Local Hesap Motoru

Merkezi helper/modüller oluşturulmalı:

- `recalculateIncome`
- `recalculatePrestige`
- `getDailyRewardStatus`
- `claimDailyReward`
- `claimAccumulatedMoney`
- `purchaseBusiness`
- `upgradeBusiness`
- `selectOrPurchaseItem`
- `advanceJob`

Bu modüller tek doğru kaynak olacak.

Outfit geçişinde ayrıca:

- `character_outfits` local seed'e taşınacak
- `player_outfits` local save modeline taşınacak
- başlangıç outfit'i otomatik owned + selected kurulacak
- prestij hesabı yalnızca giyili outfit'in puanını ekleyecek şekilde güncellenecek

Güncel durum:

- local outfit seed eklendi
- starter outfit local profilde otomatik owned + selected kuruluyor
- `ShopModal` outfit sekmesi local mode'da Supabase'siz çalışıyor
- outfit satın alma ve seçme local state üstünden çalışıyor
- local prestij hesabına seçili outfit katkısı eklendi
- `business_prestige_points` gerçek satırları local seed'e taşındı
- `businesses` gerçek satırları da local seed'e taşındı
- business prestiji artık gerçek business UUID'leri üzerinden eşleniyor

## Aşama 5: Asset Geçişi

Hedef:

- Supabase Storage URL'leri kalksın

Yapılacaklar:

- Görseller `public/assets/...` altına taşınacak
- hardcoded Supabase Storage URL'leri local path ile değişecek

Güncel durum:

- `public/assets/placeholders/` altında yerel SVG placeholder dosyaları eklendi
- `src/lib/localAssets.ts` içine ortak asset resolver eklendi
- `JobsModal`, `BusinessModal`, `StuffModal`, `ShopModal`, `CharacterDisplay`, `Shop`, `CharacterSelector` artık boş URL yerine local asset path kullanıyor
- Repo içinde gerçek görsel dosyaları henüz yok; şu an yerel placeholder'lar kullanılıyor
- Gerçek dosyalar eklendiğinde aynı resolver altyapısı üzerinden bağlanabilir

## Aşama 6: Investments

Hedef:

- `Real Estate` investment sistemi local-first çalışsın
- market, purchase, my properties ve upgrade akışı oluşsun

Plan:

1. `src/data/local/investments.ts`
   - 40-50 property seed
   - price, location, image, base rental income, prestige
2. `playerInvestments` local state
   - ownership
   - purchased_at
   - current_rental_income
   - applied upgrades
3. investment servisleri
   - list market properties
   - purchase property
   - upgrade property
   - recalculate `investment_income`
   - recalculate prestige
4. UI
   - `InvestmentsModal`
   - tabs: `Real Estate`, `Crypto (locked)`, `Stocks (locked)`
   - real estate subviews: `Market`, `My Properties`
   - property detail modal
   - purchase summary modal

## Persisted vs Derived Veri

Persisted olması gerekenler:

- `player_profiles` ana state alanları
- `game_stats`
- `player_jobs`
- `player_businesses`
- `player_purchases`
- `player_outfits`
- claim zaman alanları

Türetilmiş olarak yeniden hesaplanması tercih edilenler:

- `job_income`
- `business_income`
- `investment_income`
- `house_rent_expense`
- `vehicle_expense`
- `gross_income`
- `total_expenses`
- `hourly_income`
- `current_job_id`
- toplam prestij

Not:

- Local save içinde cache olarak saklanabilirler
- ama her kritik aksiyon sonrası yeniden hesaplanmaları gerekir

## Riskli Alanlar

- `useGameState` şu an hem veri yükleme hem mutasyon hem local cache yapıyor
- `player_purchases` ile ev mantığı arasında tarihsel çelişkiler olabilir
- investment sistemi tabloda var ama veri yok; geçişte devre dışı bırakılabilir
- Supabase auth kaldırılınca `user.id` kullanan yerler local profile id ile çalışmalı

## Kural Güvencesi

Geçiş boyunca sadece tablo şemasına bakarak ilerlenmeyecek.

Her değişiklikte öncelik sırası:

1. `docs/game-rules.md`
2. `docs/rpc-reference.md`
3. `docs/database-schema.md`

Özellikle:

- şemada olup oyunda kullanılmayan kolonlar gerçek kural kabul edilmemeli
- local helper'lar yazılırken RPC mantığı ve kullanıcı tarafından doğrulanan oyun davranışı esas alınmalı

## İlk Uygulanacak Teknik Adım

İlk kod değişikliği:

- `useAuth` local oturum modeline geçirilecek

Sebep:

- En küçük riskle uygulamayı açar
- Sonraki tüm local veri geçişi için temel kimliği sağlar
