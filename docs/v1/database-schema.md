# Database Schema

Bu dosya, Supabase tarafındaki tablo yapılarının kalıcı referansıdır.

## Kaynaklar

- `supabase/migrations/`
- `src/lib/database.types.ts`
- Kullanıcının dashboard ekran görüntüleri

Not:
- `src/lib/database.types.ts` tablo tiplerini içeriyor.
- RPC tipleri burada üretilmemiş; `Functions` alanı şu an boş.

## Ana Tablolar

### `player_profiles`

- `id`: uuid, not null
- `username`: text, not null
- `total_money`: bigint, not null
- `lifetime_earnings`: bigint, not null
- `money_per_click`: numeric, not null
- `total_clicks`: bigint, not null
- `prestige_points`: integer, not null
- `selected_character_id`: uuid, nullable
- `selected_house_id`: uuid, nullable
- `selected_car_id`: uuid, nullable
- `created_at`: timestamptz, nullable
- `last_played_at`: timestamptz, nullable
- `device_id`: uuid, nullable
- `display_name`: text, not null
- `auth_user_id`: uuid, nullable
- `linked_at`: timestamptz, nullable
- `hourly_income`: numeric, not null
- `current_job_id`: uuid, nullable
- `gems`: bigint, not null
- `last_claim_time`: timestamptz, nullable
- `last_claim_reset_date`: date, nullable
- `daily_claimed_total`: bigint, nullable
- `claim_locked_until`: timestamptz, nullable
- `last_ad_watch_time`: timestamptz, nullable
- `times_reset`: integer, nullable
- `last_reset_at`: timestamptz, nullable
- `job_income`: numeric, nullable
- `business_income`: numeric, nullable
- `investment_income`: numeric, nullable
- `house_rent_expense`: numeric, nullable
- `vehicle_expense`: numeric, nullable
- `other_expenses`: numeric, nullable
- `gross_income`: numeric, nullable
- `total_expenses`: numeric, nullable
- `selected_outfit_id`: uuid, nullable

### `jobs`

- `id`: uuid, not null
- `name`: text, not null
- `description`: text, not null
- `hourly_income`: numeric, not null
- `unlock_requirement_money`: bigint, not null
- `level`: integer, not null
- `is_default_unlocked`: boolean, not null
- `icon_name`: text, not null
- `created_at`: timestamptz, nullable
- `icon_url`: text, nullable
- `prestige_points`: integer, not null

Not:
- `unlock_requirement_money` kolonu şemada duruyor ama aktif oyun kuralında kullanılmıyor.

### `player_jobs`

- `id`: uuid, not null
- `player_id`: uuid, not null
- `job_id`: uuid, not null
- `is_unlocked`: boolean, not null
- `is_active`: boolean, not null
- `times_worked`: integer, not null
- `total_earned`: bigint, not null
- `unlocked_at`: timestamptz, nullable
- `created_at`: timestamptz, nullable
- `total_time_worked_seconds`: integer, not null
- `last_work_started_at`: timestamptz, nullable
- `is_completed`: boolean, not null

### `businesses`

- `id`: uuid, not null
- `name`: text, not null
- `description`: text, not null
- `category`: text, not null
- `base_price`: bigint, not null
- `base_hourly_income`: bigint, not null
- `unlock_order`: integer, not null
- `icon_name`: text, not null
- `created_at`: timestamptz, nullable
- `icon_url`: text, nullable
- `prestige_points`: integer, not null

### `player_businesses`

- `id`: uuid, not null
- `player_id`: uuid, not null
- `business_id`: uuid, not null
- `is_unlocked`: boolean, not null
- `current_level`: integer, not null
- `current_hourly_income`: bigint, not null
- `total_invested`: bigint, not null
- `purchased_at`: timestamptz, nullable
- `last_upgrade_at`: timestamptz, nullable
- `created_at`: timestamptz, nullable

### `business_prestige_points`

- `business_id`: uuid, not null
- `base_points`: integer, not null
- `level1_points`: integer, not null
- `level2_points`: integer, not null
- `level3_points`: integer, not null
- `level4_points`: integer, not null
- `level5_points`: integer, not null
- `level6_points`: integer, not null
- `updated_at`: timestamptz, not null

## Diğer Bilinen Tablolar

- `characters`
- `houses`
- `cars`
- `character_outfits`
- `game_stats`
- `investment_properties`
- `player_investments`
- `player_outfits`
- `player_purchases`
- `player_reset_history`
- `player_transactions`
- `purchase_packages`
- `income_expense_documentation`

### `characters`

Mevcut gerçek içerik notu:

- Şu an tabloda tek karakter var.
- Adı: `Mike`
- `gender`: `male`
- `price`: `0`
- `unlock_order`: `1`

Not:
- Bu tablo tasarım gereği çoklu karaktere açık bırakılmış ama aktif oyunda herkes tek varsayılan karakterle başlıyor.

### `character_outfits`

Aktif kullanım notları:

- Başlangıç outfit'i `unlock_order = 1` olan kayıt ve varsayılan görünüm olarak seçili gelir.
- `unlock_type` ve `unlock_value` kolonları mevcut oyunda kullanılmıyor.
- Satın alma para ile yapılır; outfit envantere eklenir.
- Prestij hesabında tüm sahip olunan outfit'ler değil, yalnızca seçili outfit kullanılır.

Gerçek içerik notu:

- Şu an `Mike` karakterine bağlı 20 outfit var.
- `code` alanları `ch-1` ile `ch-20` arasında ilerliyor.
- `name` alanları:
  - `Starter Outfit`
  - `Outfit 2` ... `Outfit 20`
- `Starter Outfit`:
  - `price = 0`
  - `prestige_points = 0`
  - `unlock_order = 1`
- Sonraki outfit'lerde fiyat ve prestij kademeli artıyor.

### `player_outfits`

Görülen aktif kolonlar:

- `player_id`
- `outfit_id`
- `is_unlocked`
- `unlocked_at`
- `is_owned`
- `purchased_at`
- `created_at`

Aktif kullanım notları:

- Oyuncunun sahip olduğu outfit'ler burada tutuluyor.
- Başlangıç outfit'i burada sahip/unlocked olarak bulunmalı.
- Aynı oyuncu için aynı outfit tekrar satın alınamaz; pratikte `(player_id, outfit_id)` benzersiz davranıyor.

## Genel Notlar

- Oyuncu ana para alanı `money` değil `total_money`.
- Ev sistemi kira bazlı; önemli kolon `hourly_rent_cost`.
- Araç gideri için önemli kolon `hourly_maintenance_cost`.
- `player_businesses.total_invested` ve `player_investments.total_invested` ekonomi takibi için önemli.
