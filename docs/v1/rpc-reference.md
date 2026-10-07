# RPC Reference

Bu dosya Supabase fonksiyonları ve uygulamadaki davranışlarını toplar.

## Frontend'de Kullanılan RPC'ler

- `get_all_businesses(p_player_id uuid)`
- `purchase_business(p_player_id uuid, p_business_id uuid)`
- `upgrade_business(p_player_id uuid, p_business_id uuid)`
- `get_daily_reward_status(p_player_id uuid)`
- `claim_daily_reward(p_player_id uuid)`
- `claim_accumulated_money(p_player_id uuid)`
- `claim_ad_reward(p_player_id uuid)`
- `calculate_player_income(p_player_id uuid)`
- `calculate_prestige_total(p_player_id uuid)`
- `calculate_player_prestige(p_player_id uuid)`
- `purchaseitem(p_player_id uuid, p_item_id uuid, p_item_type text)`
- `select_character(p_player_id uuid, p_character_id uuid)`
- `select_house(p_player_id uuid, p_house_id uuid)`
- `select_car(p_player_id uuid, p_car_id uuid)`
- `reset_player_progress(p_player_id uuid)`
- `get_money_packages(p_player_id uuid)`
- `get_gem_packages()`
- `create_purchase_transaction(...)`
- `complete_demo_purchase(p_transaction_id uuid, p_player_id uuid)`
- `purchase_outfit(p_player_id uuid, p_outfit_id uuid, p_set_as_selected boolean)`

## `upgrade_business`

Kullanıcı tarafından verilen RPC içeriğine göre:

- Oyuncu bulunamazsa başarısız döner.
- Oyuncu işletmeye sahip değilse upgrade yapılamaz.
- Maksimum level `6`.
- Mevcut level'e göre upgrade cost çarpanları:
  - level 1 -> 2: `current_hourly_income * 30`
  - level 2 -> 3: `current_hourly_income * 60`
  - level 3 -> 4: `current_hourly_income * 120`
  - level 4 -> 5: `current_hourly_income * 180`
  - level 5 -> 6: `current_hourly_income * 240`
- Yeni gelir: `floor(current_hourly_income * 1.25)`
- `player_profiles.total_money` upgrade cost kadar azaltılır.
- `player_businesses.current_level` 1 artırılır.
- `player_businesses.current_hourly_income` yeni gelire güncellenir.
- `player_businesses.total_invested` upgrade cost kadar artırılır.
- `player_businesses.last_upgrade_at` güncellenir.
- Ardından:
  - `calculate_player_income(p_player_id)`
  - `calculate_player_prestige(p_player_id)`
  çağrılır.

## `purchase_business`

Kullanıcı tarafından verilen RPC içeriğine göre:

- Oyuncu bulunamazsa başarısız döner.
- İşletme bulunamazsa başarısız döner.
- Oyuncu işletmeye zaten sahipse tekrar satın alamaz.
- İşletmeler sıra ile açılır.
- Sıralı unlock kontrolü:
  - oyuncunun sahip olduğu en yüksek `businesses.unlock_order` bulunur
  - hedef işletmenin `unlock_order` değeri bunun en fazla `+1` fazlası olabilir
- Oyuncunun `total_money` miktarı `base_price` kadar değilse satın alma başarısız olur.
- Satın alma başarılıysa:
  - `player_profiles.total_money` değerinden `base_price` düşülür
  - `player_businesses` tablosuna yeni kayıt eklenir
  - başlangıç değerleri:
    - `is_unlocked = true`
    - `current_level = 1`
    - `current_hourly_income = base_hourly_income`
    - `total_invested = base_price`
    - `purchased_at = now()`
- Ardından:
  - `calculate_player_income(p_player_id)`
  - `calculate_player_prestige(p_player_id)`
  çağrılır.

## `calculate_player_income`

Kullanıcı tarafından verilen RPC içeriğine göre:

- Auth guard vardır:
  - `auth.uid()` doluysa, yalnızca kendi profili için hesap yapılabilir
- Oyuncu profili yoksa exception fırlatır

Hesap sırası:

1. İş geliri
- `player_jobs.is_active = true` olan aktif iş bulunur
- `jobs.hourly_income` değeri alınır
- aktif işin `job_id` değeri `current_job_id` olarak kaydedilir

2. İşletme geliri
- `player_businesses` içinden `purchased_at is not null` olan kayıtların
  `current_hourly_income` toplamı alınır

3. Yatırım geliri
- `player_investments` içinden `purchased_at is not null` olan kayıtların
  `current_rental_income` toplamı alınır

4. Ev gideri
- `player_profiles.selected_house_id` ile `houses.hourly_rent_cost` okunur

5. Araç gideri
- `player_profiles.selected_car_id` ile `cars.hourly_maintenance_cost` okunur

6. Diğer giderler
- `player_profiles.other_expenses` okunur

Toplamlar:

- `gross_income = job_income + business_income + investment_income`
- `total_expenses = house_rent_expense + vehicle_expense + other_expenses`
- `hourly_income = gross_income - total_expenses`

Önemli not:
- Negatif net gelir mümkündür; sıfıra clamp edilmez.

Fonksiyon sonunda `player_profiles` içinde şu alanlar güncellenir:

- `job_income`
- `business_income`
- `investment_income`
- `house_rent_expense`
- `vehicle_expense`
- `gross_income`
- `total_expenses`
- `hourly_income`
- `current_job_id`
- `last_played_at`

## `calculate_player_prestige`

Kullanıcı tarafından verilen RPC içeriğine göre:

- Önce `player_profiles` kaydının varlığı kontrol edilir.
- Oyuncu yoksa exception fırlatır.

Prestij bileşenleri:

1. İş prestiji

- Yalnızca aktif işten gelir.
- `player_jobs.is_active = true` olan kayıt ile `jobs.prestige_points` okunur.

2. İşletme prestiji

- Tüm unlocked işletmelerin toplamıdır.
- `player_businesses.current_level` değerine göre `business_prestige_points` tablosundaki seviye puanı okunur:
  - level 1 -> `level1_points`
  - level 2 -> `level2_points`
  - level 3 -> `level3_points`
  - level 4 -> `level4_points`
  - level 5 -> `level5_points`
  - level 6 -> `level6_points`
- Seviye puanı yoksa `base_points` fallback olarak kullanılır.

3. Ev prestiji

- Yalnızca seçili evden gelir.
- `player_profiles.selected_house_id` ile `houses.prestige_points` okunur.

4. Araç prestiji

- Yalnızca seçili araçtan gelir.
- `player_profiles.selected_car_id` ile `cars.prestige_points` okunur.

5. Yatırım prestiji

- Sahip olunan yatırımların toplam prestijidir.
- `player_investments` + `investment_properties.prestige_points`

6. Outfit prestiji

- Yalnızca seçili outfit'ten gelir.
- `player_profiles.selected_outfit_id` ile `character_outfits.prestige_points` okunur.

Toplam prestij:

- `job + business + house + car + investment + outfit`

Fonksiyon sonunda:

- `player_profiles.prestige_points = total_prestige`

## `purchaseitem`

Kullanıcı tarafından verilen RPC içeriğine göre:

Desteklenen tipler:

- `house`
- `car`

### `house`

- Evler satın alınmaz, sadece seçilir.
- Para düşülmez.
- Hedef ev `houses` içinde yoksa başarısız döner.
- Başarılı durumda:
  - `player_profiles.selected_house_id = p_item_id`
  - `calculate_player_income(p_player_id)` çağrılır
  - `calculate_player_prestige(p_player_id)` çağrılır
- Dönüş mesajı:
  - `Moved to {house_name}! Check your expenses.`

### `car`

- Arabalar satın alınır.
- `cars.price` kadar para gerekir.
- Yeterli para yoksa başarısız döner.
- Başarılı durumda:
  - `player_profiles.total_money` değerinden `cars.price` düşülür
  - `player_profiles.selected_car_id = p_item_id`
  - `calculate_player_income(p_player_id)` çağrılır
  - `calculate_player_prestige(p_player_id)` çağrılır

### Diğer

- Geçersiz `p_item_type` değeri başarısız döner.

## `claim_accumulated_money`

Kullanıcı tarafından verilen RPC içeriğine göre:

- Oyuncu kaydı `FOR UPDATE` ile kilitlenir.
- Oyuncu yoksa başarısız döner.

Günlük reset:

- `last_claim_reset_date` bugünden eskiyse veya null ise:
  - `daily_claimed_total = 0`
  - `last_claim_reset_date = CURRENT_DATE`
  - `claim_locked_until = NULL`

Lock kontrolü:

- `claim_locked_until > now()` ise claim reddedilir.

Zaman hesabı:

- `last_claim_time` ile şimdi arasındaki süre dakika bazında hesaplanır.
- Maksimum birikim süresi `60 dakika` ile clamp edilir.

Temel claim oranı:

- Dakika bazlı oran:
  - `(hourly_income / 2) / 60`
- Yani normal claim sistemi en fazla saatlik gelirin yarısını üretir.

Claim miktarı:

- `floor(base_rate_per_minute * clamped_minutes)`
- Sonuç `<= 0` ise claim başarısız olur.

Günlük limit:

- Günlük baz claim limiti `hourly_income`
- Eğer yeni claim bu limiti aşarsa:
  - kalan hak hesaplanır
  - kalan hak `<= 0` ise claim reddedilir
  - değilse claim miktarı kalan hakka düşürülür

Triple claim:

- `p_is_triple = true` ise oyuncuya verilen para `claim_amount * 3`
- Ancak `daily_claimed_total` yalnızca base claim miktarı kadar artar
- Yani triple ödül günlük claim limitini 3x büyütmez

Lock yazımı:

- Claim sonrası günlük limite ulaşılırsa:
  - `claim_locked_until = min(now() + 8 hours, next UTC midnight)`
- Ulaşılmazsa lock yazılmaz

Başarılı update:

- `player_profiles.total_money` artar
- `player_profiles.daily_claimed_total` base claim kadar artar
- `player_profiles.last_claim_time = now()`
- gerekiyorsa `claim_locked_until` yazılır

Başarılı dönüş:

- `success`
- `claimed_amount`
- `new_total`

## `get_daily_reward_status`

Kullanıcı tarafından verilen RPC içeriğine göre:

- UTC tarih bazlı çalışır.
- `game_stats` tablosundan oyuncu kaydı okunur.
- Kayıt yoksa default dönüş:
  - `can_claim = true`
  - `daily_login_streak = 0`
  - `day_to_show = 1`
  - `hours_until_reset = 24`

Claim uygunluğu:

- `last_claim_date` bugünkü UTC tarihten eskiyse veya null ise `can_claim = true`

UI için gün hesabı:

- UI `next_reward_day` / gösterilecek günü bu fonksiyondan alır
- `can_claim = true` ise:
  - gösterilecek gün = `daily_login_streak + 1`
- `can_claim = false` ise:
  - gösterilecek gün = `daily_login_streak`
- Gün değeri `1..7` aralığında clamp edilir

Reset süresi:

- `hours_until_reset`, bir sonraki UTC gece yarısına kalan süredir

## `claim_daily_reward`

Kullanıcı tarafından verilen RPC içeriğine göre:

- UTC tarih bazlı çalışır.
- `game_stats` kaydı `FOR UPDATE` ile kilitlenir.
- `game_stats` kaydı yoksa başarısız döner.
- Oyuncu bugünün UTC tarihine göre zaten claim yaptıysa başarısız döner.

Streak mantığı:

- `last_claim_date` null ise veya dünden daha eskiyse:
  - streak `1` olur
- `last_claim_date = yesterday_utc` ise:
  - streak `1..7` döngüsünde ilerler
  - formül: `(daily_login_streak % 7) + 1`

Ödül tablosu:

- Gün 1: `1000`
- Gün 2: `3000`
- Gün 3: `7000`
- Gün 4: `15000`
- Gün 5: `30000`
- Gün 6: `60000`
- Gün 7: `100000`

Başarılı durumda:

- `player_profiles.total_money += reward_amount`
- `player_profiles.lifetime_earnings += reward_amount`
- `game_stats.daily_login_streak = new_streak`
- `game_stats.last_claim_date = today_utc`
- `game_stats.last_daily_reward = now()`

Başarılı mesaj:

- `Claimed $X for day Y!`

## `purchase_outfit`

Kullanıcı tarafından verilen RPC içeriğine göre:

- Önce `character_outfits` içinden hedef outfit okunur:
  - `price`
  - `prestige_points`
  - `unlock_type`
  - `unlock_value`
- Yalnızca `is_active = true` olan outfit satın alınabilir.
- Sonra `player_profiles` içinden oyuncunun:
  - `total_money`
  - `prestige_points`
  okunur.
- Oyuncu bulunamazsa başarısız döner.
- Outfit zaten owned ise başarısız döner.

Tarihsel SQL davranışı:

- `unlock_type = 'prestige'` ise `player_profiles.prestige_points >= unlock_value` kontrolü yapılır.
- `unlock_type = 'money'` ise `player_profiles.total_money >= unlock_value` kontrolü yapılır.

Not:

- Aktif oyun kuralına göre `unlock_type` ve `unlock_value` alanları kullanılmıyor.

Satın alma kontrolü:

- Oyuncunun `total_money` miktarı outfit fiyatından azsa satın alma başarısız olur.

Başarılı durumda:

- `player_profiles.total_money` değerinden outfit fiyatı düşülür.
- `p_set_as_selected = true` ise:
  - `player_profiles.selected_outfit_id = p_outfit_id`
- `player_profiles.last_played_at = now()`

`player_outfits` yazımı:

- Yeni kayıt:
  - `is_owned = true`
  - `is_unlocked = true`
  - `purchased_at = now()`
  - `unlocked_at = now()`
- Kayıt varsa `ON CONFLICT (player_id, outfit_id)` ile update edilir.

Ardından:

- `calculate_player_prestige(p_player_id)` çağrılır.

Başarılı dönüş:

- `success: true`
- `message: 'Outfit purchased successfully'`
- `prestige_earned`
- `money_spent`

## Notlar

- `database.types.ts` içinde RPC tipleri boş olduğu için fonksiyon gerçekleri migration'lar ve kullanıcıdan gelen canlı bilgilerle doğrulanır.
- Aynı fonksiyon migration geçmişinde birden fazla kez yeniden tanımlanmış olabilir; son geçerli sürüm baz alınmalıdır.
