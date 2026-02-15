/*
  # Fix Shop Modal Functions
  
  1. Function Fixes
    - Fix `complete_demo_purchase`: Remove player_purchases insert that was causing constraint violation
    - Fix `claim_accumulated_money`: Add back is_triple parameter that was removed
    - Fix `claim_ad_reward`: Simplify to only require p_player_id, calculate reward internally
  
  2. Changes Made
    - complete_demo_purchase: Only updates player_profiles and player_transactions (no player_purchases)
    - claim_accumulated_money: Restored is_triple parameter with triple multiplier logic
    - claim_ad_reward: Auto-calculates reward as hourly_income/2, removed external parameters
  
  3. Security
    - All functions maintain SECURITY DEFINER
    - All functions maintain proper validation and error handling
    - All functions use FOR UPDATE locks to prevent race conditions
*/

-- =====================================================
-- Fix complete_demo_purchase
-- =====================================================
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
  v_player_record record;
  v_money_to_add bigint := 0;
  v_gems_to_add integer := 0;
BEGIN
  -- Lock player record
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

  -- Get transaction
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

  -- Check if already completed
  IF v_transaction.transaction_status != 'pending' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Transaction already processed'
    );
  END IF;

  -- Get package
  SELECT * INTO v_package
  FROM purchase_packages
  WHERE id = v_transaction.package_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Package not found'
    );
  END IF;

  -- Calculate amounts
  IF v_package.package_type = 'money' THEN
    v_money_to_add := v_package.amount_multiplier * COALESCE(v_player_record.hourly_income, 100);
  ELSIF v_package.package_type = 'gem' THEN
    v_gems_to_add := v_package.gem_amount;
  END IF;

  -- Update player balance
  UPDATE player_profiles
  SET 
    total_money = total_money + v_money_to_add,
    gems = gems + v_gems_to_add
  WHERE id = p_player_id;

  -- Update transaction status
  UPDATE player_transactions
  SET 
    transaction_status = 'completed',
    completed_at = now(),
    items_received = jsonb_build_object(
      'money', v_money_to_add,
      'gems', v_gems_to_add
    ),
    amount_paid = v_package.price_usd
  WHERE id = p_transaction_id;

  RETURN jsonb_build_object(
    'success', true,
    'money_added', v_money_to_add,
    'gems_added', v_gems_to_add,
    'new_total_money', v_player_record.total_money + v_money_to_add,
    'new_gems', v_player_record.gems + v_gems_to_add
  );

EXCEPTION WHEN OTHERS THEN
  UPDATE player_transactions
  SET 
    transaction_status = 'failed',
    error_message = SQLERRM
  WHERE id = p_transaction_id;
  
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;

-- =====================================================
-- Fix claim_accumulated_money - Add back is_triple parameter
-- =====================================================
CREATE OR REPLACE FUNCTION claim_accumulated_money(
  p_player_id uuid,
  p_is_triple boolean DEFAULT false
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_player_record record;
  v_time_difference interval;
  v_hours_passed numeric;
  v_accumulated_money bigint;
  v_final_amount bigint;
  v_new_total_money bigint;
  v_max_claims_per_day int := 50;
  v_claim_count int;
BEGIN
  -- Lock player record
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

  -- Check daily claim limit
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

  -- Calculate time difference
  v_time_difference := now() - v_player_record.last_claim_time;
  v_hours_passed := LEAST(EXTRACT(EPOCH FROM v_time_difference) / 3600, 24);

  -- Calculate accumulated money (hourly_income per hour)
  v_accumulated_money := (v_player_record.hourly_income * v_hours_passed)::bigint;

  IF v_accumulated_money <= 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'No money to claim yet'
    );
  END IF;

  -- Apply triple multiplier if requested
  IF p_is_triple THEN
    v_final_amount := v_accumulated_money * 3;
  ELSE
    v_final_amount := v_accumulated_money;
  END IF;

  v_new_total_money := v_player_record.total_money + v_final_amount;

  -- Update player
  UPDATE player_profiles
  SET 
    total_money = v_new_total_money,
    last_claim_time = now()
  WHERE id = p_player_id;

  RETURN jsonb_build_object(
    'success', true,
    'claimed_amount', v_final_amount,
    'new_total', v_new_total_money
  );
END;
$$;

-- =====================================================
-- Fix claim_ad_reward - Simplify parameters
-- =====================================================
CREATE OR REPLACE FUNCTION claim_ad_reward(p_player_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_player_record record;
  v_reward_amount bigint;
  v_new_money bigint;
  v_max_ads_per_day int := 20;
  v_ad_count int;
  v_cooldown_seconds int := 30;
  v_time_since_last_ad interval;
BEGIN
  -- Lock player record
  SELECT * INTO v_player_record
  FROM player_profiles
  WHERE id = p_player_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Player not found',
      'cooldown', 0
    );
  END IF;

  -- Check cooldown (30 seconds between ads)
  IF v_player_record.last_ad_watch_time IS NOT NULL THEN
    v_time_since_last_ad := now() - v_player_record.last_ad_watch_time;
    IF EXTRACT(EPOCH FROM v_time_since_last_ad) < v_cooldown_seconds THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', 'Please wait before watching another ad',
        'cooldown', v_cooldown_seconds - EXTRACT(EPOCH FROM v_time_since_last_ad)::int
      );
    END IF;
  END IF;

  -- Check daily limit
  SELECT COUNT(*) INTO v_ad_count
  FROM player_profiles
  WHERE id = p_player_id
    AND last_ad_watch_time >= date_trunc('day', now() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC'
    AND last_ad_watch_time < date_trunc('day', now() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC' + interval '1 day';

  IF v_ad_count >= v_max_ads_per_day THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Daily ad limit reached',
      'cooldown', 0
    );
  END IF;

  -- Calculate reward (hourly_income / 2)
  v_reward_amount := (v_player_record.hourly_income / 2)::bigint;
  IF v_reward_amount < 10 THEN
    v_reward_amount := 10; -- Minimum reward
  END IF;

  v_new_money := v_player_record.total_money + v_reward_amount;

  -- Update player
  UPDATE player_profiles
  SET 
    total_money = v_new_money,
    last_ad_watch_time = now()
  WHERE id = p_player_id;

  RETURN jsonb_build_object(
    'success', true,
    'reward', v_reward_amount,
    'new_total', v_new_money,
    'cooldown', v_cooldown_seconds
  );
END;
$$;