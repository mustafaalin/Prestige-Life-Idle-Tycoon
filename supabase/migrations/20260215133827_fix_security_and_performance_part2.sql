/*
  # Fix Security and Performance Issues - Part 2

  Recreates all functions with secure search_path to prevent manipulation attacks
*/

-- =====================================================
-- RECREATE FUNCTIONS WITH SECURE SEARCH_PATH
-- =====================================================

-- Fix claim_accumulated_money
CREATE OR REPLACE FUNCTION claim_accumulated_money(p_player_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_player_record record;
  v_accumulated_money numeric;
  v_new_total_money bigint;
  v_time_difference interval;
  v_max_claims_per_day int := 50;
  v_claim_count int;
BEGIN
  SELECT * INTO v_player_record
  FROM player_profiles
  WHERE id = p_player_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Player not found'
    );
  END IF;

  v_time_difference := now() - v_player_record.last_claim_time;
  
  IF v_time_difference < interval '10 seconds' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Must wait at least 10 seconds between claims'
    );
  END IF;

  SELECT COUNT(*) INTO v_claim_count
  FROM player_profiles
  WHERE id = p_player_id
    AND last_claim_time >= date_trunc('day', now() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC'
    AND last_claim_time < date_trunc('day', now() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC' + interval '1 day';

  IF v_claim_count >= v_max_claims_per_day THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Daily claim limit reached'
    );
  END IF;

  v_accumulated_money := v_player_record.hourly_income * 
    LEAST(EXTRACT(EPOCH FROM v_time_difference) / 3600, 24);

  v_new_total_money := v_player_record.total_money + v_accumulated_money::bigint;

  UPDATE player_profiles
  SET 
    total_money = v_new_total_money,
    last_claim_time = now()
  WHERE id = p_player_id;

  RETURN jsonb_build_object(
    'success', true,
    'claimed_amount', v_accumulated_money,
    'new_total', v_new_total_money
  );
END;
$$;

-- Fix claim_ad_reward
CREATE OR REPLACE FUNCTION claim_ad_reward(p_player_id uuid, p_reward_type text, p_reward_amount numeric)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_player_record record;
  v_new_money bigint;
  v_new_gems bigint;
  v_max_ads_per_day int := 20;
  v_ad_count int;
BEGIN
  SELECT * INTO v_player_record
  FROM player_profiles
  WHERE id = p_player_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Player not found'
    );
  END IF;

  SELECT COUNT(*) INTO v_ad_count
  FROM player_profiles
  WHERE id = p_player_id
    AND last_ad_watch_time >= date_trunc('day', now() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC'
    AND last_ad_watch_time < date_trunc('day', now() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC' + interval '1 day';

  IF v_ad_count >= v_max_ads_per_day THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Daily ad limit reached'
    );
  END IF;

  IF p_reward_type = 'money' THEN
    v_new_money := v_player_record.total_money + p_reward_amount::bigint;
    v_new_gems := v_player_record.gems;
  ELSIF p_reward_type = 'gems' THEN
    v_new_money := v_player_record.total_money;
    v_new_gems := v_player_record.gems + p_reward_amount::bigint;
  ELSE
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Invalid reward type'
    );
  END IF;

  UPDATE player_profiles
  SET 
    total_money = v_new_money,
    gems = v_new_gems,
    last_ad_watch_time = now()
  WHERE id = p_player_id;

  RETURN jsonb_build_object(
    'success', true,
    'reward_type', p_reward_type,
    'reward_amount', p_reward_amount,
    'new_money', v_new_money,
    'new_gems', v_new_gems
  );
END;
$$;

-- Fix get_money_packages
CREATE OR REPLACE FUNCTION get_money_packages()
RETURNS TABLE (
  id uuid,
  base_amount bigint,
  display_order int,
  price_usd numeric,
  is_popular boolean,
  is_best_value boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    mp.id,
    mp.base_amount,
    mp.display_order,
    mp.price_usd,
    mp.is_popular,
    mp.is_best_value
  FROM purchase_packages mp
  WHERE mp.is_active = true AND mp.package_type = 'money'
  ORDER BY mp.display_order ASC;
END;
$$;

-- Fix get_gem_packages
CREATE OR REPLACE FUNCTION get_gem_packages()
RETURNS TABLE (
  id uuid,
  gem_amount int,
  display_order int,
  price_usd numeric,
  is_popular boolean,
  is_best_value boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    gp.id,
    gp.gem_amount,
    gp.display_order,
    gp.price_usd,
    gp.is_popular,
    gp.is_best_value
  FROM purchase_packages gp
  WHERE gp.is_active = true AND gp.package_type = 'gem'
  ORDER BY gp.display_order ASC;
END;
$$;

-- Fix create_purchase_transaction
CREATE OR REPLACE FUNCTION create_purchase_transaction(
  p_player_id uuid,
  p_package_id uuid,
  p_amount_usd numeric
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_transaction_id uuid;
BEGIN
  INSERT INTO player_transactions (
    player_id,
    package_id,
    amount_paid,
    transaction_status
  ) VALUES (
    p_player_id,
    p_package_id,
    p_amount_usd,
    'pending'
  )
  RETURNING id INTO v_transaction_id;

  RETURN jsonb_build_object(
    'success', true,
    'transaction_id', v_transaction_id
  );
END;
$$;

-- Fix complete_demo_purchase
CREATE OR REPLACE FUNCTION complete_demo_purchase(
  p_transaction_id uuid,
  p_player_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_transaction record;
  v_package record;
  v_new_money bigint;
  v_new_gems bigint;
BEGIN
  SELECT * INTO v_transaction
  FROM player_transactions
  WHERE id = p_transaction_id AND player_id = p_player_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Transaction not found'
    );
  END IF;

  IF v_transaction.transaction_status != 'pending' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Transaction already processed'
    );
  END IF;

  SELECT * INTO v_package
  FROM purchase_packages
  WHERE id = v_transaction.package_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Package not found'
    );
  END IF;

  IF v_package.package_type = 'money' THEN
    UPDATE player_profiles
    SET total_money = total_money + v_package.base_amount
    WHERE id = p_player_id
    RETURNING total_money, gems INTO v_new_money, v_new_gems;

  ELSIF v_package.package_type = 'gem' THEN
    UPDATE player_profiles
    SET gems = gems + v_package.gem_amount
    WHERE id = p_player_id
    RETURNING total_money, gems INTO v_new_money, v_new_gems;
  ELSE
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Invalid package type'
    );
  END IF;

  UPDATE player_transactions
  SET 
    transaction_status = 'completed',
    completed_at = now()
  WHERE id = p_transaction_id;

  INSERT INTO player_purchases (player_id, item_id, item_type, purchase_price)
  VALUES (p_player_id, v_transaction.package_id, v_package.package_type::text, v_transaction.amount_paid::bigint);

  RETURN jsonb_build_object(
    'success', true,
    'new_money', v_new_money,
    'new_gems', v_new_gems
  );
END;
$$;

-- Fix get_player_businesses
CREATE OR REPLACE FUNCTION get_player_businesses(p_player_id uuid)
RETURNS TABLE (
  business_id uuid,
  business_name text,
  business_description text,
  base_price bigint,
  base_hourly_income bigint,
  unlock_order int,
  icon_name text,
  icon_url text,
  current_level int,
  total_invested bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id as business_id,
    b.name as business_name,
    b.description as business_description,
    b.base_price,
    b.base_hourly_income,
    b.unlock_order,
    b.icon_name,
    b.icon_url,
    COALESCE(pb.current_level, 0) as current_level,
    COALESCE(pb.total_invested, 0) as total_invested
  FROM businesses b
  LEFT JOIN player_businesses pb ON pb.business_id = b.id AND pb.player_id = p_player_id
  ORDER BY b.unlock_order, b.base_price;
END;
$$;

-- Fix reset_player_progress
CREATE OR REPLACE FUNCTION reset_player_progress(p_player_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_player_record record;
  v_default_character_id uuid;
BEGIN
  SELECT * INTO v_player_record
  FROM player_profiles
  WHERE id = p_player_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Player not found'
    );
  END IF;

  SELECT id INTO v_default_character_id FROM characters ORDER BY unlock_order LIMIT 1;

  DELETE FROM player_businesses WHERE player_id = p_player_id;
  DELETE FROM player_jobs WHERE player_id = p_player_id;
  DELETE FROM player_purchases WHERE player_id = p_player_id;

  INSERT INTO player_reset_history (
    player_id,
    money_at_reset,
    gems_at_reset,
    hourly_income_at_reset,
    lifetime_earnings_at_reset,
    total_clicks_at_reset,
    prestige_points_at_reset,
    selected_character_id,
    selected_house_id,
    selected_car_id
  ) VALUES (
    p_player_id,
    v_player_record.total_money,
    v_player_record.gems,
    v_player_record.money_per_second::bigint,
    v_player_record.lifetime_earnings,
    v_player_record.total_clicks,
    v_player_record.prestige_points,
    v_player_record.selected_character_id,
    v_player_record.selected_house_id,
    v_player_record.selected_car_id
  );

  UPDATE player_profiles
  SET 
    total_money = 0,
    lifetime_earnings = 0,
    money_per_click = 1,
    money_per_second = 0,
    total_clicks = 0,
    prestige_points = 0,
    selected_character_id = v_default_character_id,
    selected_house_id = NULL,
    selected_car_id = NULL,
    gems = 0,
    hourly_income = 1000,
    last_claim_time = now(),
    times_reset = COALESCE(times_reset, 0) + 1,
    last_reset_at = now()
  WHERE id = p_player_id;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Player progress has been reset successfully'
  );
END;
$$;

-- Fix purchase_business
CREATE OR REPLACE FUNCTION purchase_business(
  p_player_id uuid,
  p_business_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_business record;
  v_player record;
  v_existing_business record;
BEGIN
  SELECT * INTO v_business FROM businesses WHERE id = p_business_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Business not found');
  END IF;

  SELECT * INTO v_player FROM player_profiles WHERE id = p_player_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Player not found');
  END IF;

  SELECT * INTO v_existing_business 
  FROM player_businesses 
  WHERE player_id = p_player_id AND business_id = p_business_id;

  IF FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Business already owned');
  END IF;

  IF v_player.total_money < v_business.base_price THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient funds');
  END IF;

  UPDATE player_profiles
  SET total_money = total_money - v_business.base_price,
      money_per_second = money_per_second + v_business.base_hourly_income
  WHERE id = p_player_id;

  INSERT INTO player_businesses (player_id, business_id, current_level, current_hourly_income, total_invested)
  VALUES (p_player_id, p_business_id, 1, v_business.base_hourly_income, v_business.base_price);

  RETURN jsonb_build_object(
    'success', true,
    'new_money', v_player.total_money - v_business.base_price,
    'new_income', v_player.money_per_second + v_business.base_hourly_income
  );
END;
$$;

-- Fix upgrade_business
CREATE OR REPLACE FUNCTION upgrade_business(
  p_player_id uuid,
  p_business_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_business record;
  v_player record;
  v_player_business record;
  v_upgrade_cost bigint;
  v_income_increase bigint;
  v_new_level int;
BEGIN
  SELECT * INTO v_business FROM businesses WHERE id = p_business_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Business not found');
  END IF;

  SELECT * INTO v_player FROM player_profiles WHERE id = p_player_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Player not found');
  END IF;

  SELECT * INTO v_player_business 
  FROM player_businesses 
  WHERE player_id = p_player_id AND business_id = p_business_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Business not owned');
  END IF;

  IF v_player_business.current_level >= 6 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Business already at maximum level');
  END IF;

  v_upgrade_cost := (v_business.base_price * power(1.5, v_player_business.current_level))::bigint;
  v_income_increase := (v_business.base_hourly_income * 0.5)::bigint;
  v_new_level := v_player_business.current_level + 1;

  IF v_player.total_money < v_upgrade_cost THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient funds');
  END IF;

  UPDATE player_profiles
  SET total_money = total_money - v_upgrade_cost,
      money_per_second = money_per_second + v_income_increase
  WHERE id = p_player_id;

  UPDATE player_businesses
  SET current_level = v_new_level,
      current_hourly_income = current_hourly_income + v_income_increase,
      total_invested = total_invested + v_upgrade_cost,
      last_upgrade_at = now()
  WHERE player_id = p_player_id AND business_id = p_business_id;

  RETURN jsonb_build_object(
    'success', true,
    'new_level', v_new_level,
    'new_money', v_player.total_money - v_upgrade_cost,
    'new_income', v_player.money_per_second + v_income_increase
  );
END;
$$;

-- Fix get_all_businesses
CREATE OR REPLACE FUNCTION get_all_businesses()
RETURNS TABLE (
  id uuid,
  name text,
  description text,
  base_price bigint,
  base_hourly_income bigint,
  unlock_order int,
  icon_name text,
  icon_url text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id,
    b.name,
    b.description,
    b.base_price,
    b.base_hourly_income,
    b.unlock_order,
    b.icon_name,
    b.icon_url
  FROM businesses b
  ORDER BY b.unlock_order, b.base_price;
END;
$$;

-- Fix get_daily_reward_status
CREATE OR REPLACE FUNCTION get_daily_reward_status(p_player_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_stats record;
  v_can_claim boolean;
  v_next_reward_day int;
BEGIN
  SELECT * INTO v_stats
  FROM game_stats
  WHERE player_id = p_player_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Player stats not found'
    );
  END IF;

  v_can_claim := (
    v_stats.last_daily_reward IS NULL OR
    date_trunc('day', v_stats.last_daily_reward AT TIME ZONE 'UTC') < 
    date_trunc('day', now() AT TIME ZONE 'UTC')
  );

  v_next_reward_day := LEAST(v_stats.daily_login_streak + 1, 7);

  RETURN jsonb_build_object(
    'success', true,
    'can_claim', v_can_claim,
    'current_streak', v_stats.daily_login_streak,
    'next_reward_day', v_next_reward_day,
    'last_claim', v_stats.last_daily_reward
  );
END;
$$;

-- Fix claim_daily_reward
CREATE OR REPLACE FUNCTION claim_daily_reward(p_player_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_stats record;
  v_can_claim boolean;
  v_new_streak int;
  v_reward_multiplier numeric;
  v_base_reward bigint := 1000;
  v_reward_amount bigint;
BEGIN
  SELECT * INTO v_stats
  FROM game_stats
  WHERE player_id = p_player_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Player stats not found'
    );
  END IF;

  v_can_claim := (
    v_stats.last_daily_reward IS NULL OR
    date_trunc('day', v_stats.last_daily_reward AT TIME ZONE 'UTC') < 
    date_trunc('day', now() AT TIME ZONE 'UTC')
  );

  IF NOT v_can_claim THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Daily reward already claimed today'
    );
  END IF;

  IF v_stats.last_daily_reward IS NULL OR
     date_trunc('day', v_stats.last_daily_reward AT TIME ZONE 'UTC') < 
     date_trunc('day', now() AT TIME ZONE 'UTC') - interval '1 day' THEN
    v_new_streak := 1;
  ELSE
    v_new_streak := LEAST(v_stats.daily_login_streak + 1, 7);
  END IF;

  v_reward_multiplier := v_new_streak;
  v_reward_amount := (v_base_reward * v_reward_multiplier)::bigint;

  UPDATE player_profiles
  SET total_money = total_money + v_reward_amount
  WHERE id = p_player_id;

  UPDATE game_stats
  SET 
    daily_login_streak = v_new_streak,
    last_daily_reward = now()
  WHERE player_id = p_player_id;

  RETURN jsonb_build_object(
    'success', true,
    'reward_amount', v_reward_amount,
    'new_streak', v_new_streak
  );
END;
$$;