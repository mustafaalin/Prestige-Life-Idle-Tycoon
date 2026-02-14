/*
  # Fix Business Functions for Device-Based Auth

  ## Overview
  Updates `purchase_business` and `upgrade_business` functions to accept `p_player_id` parameter
  instead of relying on `auth.uid()`, enabling them to work with device-based authentication.

  ## Changes Made

  ### 1. Updated Functions
  
  #### `purchase_business(p_business_id uuid, p_player_id uuid)`
  - Now accepts `p_player_id` as a required parameter
  - Removed `auth.uid()` dependency
  - Validates that player exists in player_profiles
  - All business logic remains the same
  - Security: Validates player_id exists before processing
  
  #### `upgrade_business(p_business_id uuid, p_player_id uuid)`
  - Now accepts `p_player_id` as a required parameter
  - Removed `auth.uid()` dependency
  - Validates that player exists in player_profiles
  - All upgrade logic remains the same
  - Security: Validates player_id exists before processing

  ## Security Notes
  - Functions still use SECURITY DEFINER for RLS bypass
  - Player validation ensures only valid players can transact
  - All atomic operations preserved
  - Business logic and constraints unchanged
*/

-- Drop existing functions
DROP FUNCTION IF EXISTS purchase_business(uuid);
DROP FUNCTION IF EXISTS upgrade_business(uuid);

-- Recreate purchase_business with player_id parameter
CREATE OR REPLACE FUNCTION purchase_business(
  p_business_id uuid,
  p_player_id uuid
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_business_price bigint;
  v_business_income bigint;
  v_business_unlock_order integer;
  v_player_balance bigint;
  v_previous_owned boolean;
  v_already_owned boolean;
BEGIN
  -- Validate player exists
  IF NOT EXISTS (SELECT 1 FROM player_profiles WHERE id = p_player_id) THEN
    RETURN json_build_object('success', false, 'error', 'Player not found');
  END IF;

  -- Get business details
  SELECT base_price, base_hourly_income, unlock_order
  INTO v_business_price, v_business_income, v_business_unlock_order
  FROM businesses
  WHERE id = p_business_id;

  IF v_business_price IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Business not found');
  END IF;

  -- Check if already owned
  SELECT EXISTS(
    SELECT 1 FROM player_businesses
    WHERE player_id = p_player_id AND business_id = p_business_id
  ) INTO v_already_owned;

  IF v_already_owned THEN
    RETURN json_build_object('success', false, 'error', 'Already own this business');
  END IF;

  -- Check sequential unlock (skip for first business)
  IF v_business_unlock_order > 1 THEN
    SELECT EXISTS(
      SELECT 1 FROM player_businesses pb
      JOIN businesses b ON pb.business_id = b.id
      WHERE pb.player_id = p_player_id AND b.unlock_order = v_business_unlock_order - 1
    ) INTO v_previous_owned;

    IF NOT v_previous_owned THEN
      RETURN json_build_object('success', false, 'error', 'Must purchase previous business first');
    END IF;
  END IF;

  -- Get player balance
  SELECT total_money INTO v_player_balance
  FROM player_profiles
  WHERE id = p_player_id;

  IF v_player_balance < v_business_price THEN
    RETURN json_build_object('success', false, 'error', 'Insufficient balance');
  END IF;

  -- Perform purchase (atomic transaction)
  -- Deduct money
  UPDATE player_profiles
  SET total_money = total_money - v_business_price,
      hourly_income = hourly_income + v_business_income
  WHERE id = p_player_id;

  -- Create business record
  INSERT INTO player_businesses (
    player_id,
    business_id,
    is_unlocked,
    current_level,
    current_hourly_income,
    total_invested,
    purchased_at
  ) VALUES (
    p_player_id,
    p_business_id,
    true,
    1,
    v_business_income,
    v_business_price,
    now()
  );

  RETURN json_build_object(
    'success', true,
    'new_balance', v_player_balance - v_business_price,
    'new_hourly_income', v_business_income
  );
END;
$$;

-- Recreate upgrade_business with player_id parameter
CREATE OR REPLACE FUNCTION upgrade_business(
  p_business_id uuid,
  p_player_id uuid
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_level integer;
  v_current_income bigint;
  v_total_invested bigint;
  v_player_balance bigint;
  v_upgrade_cost bigint;
  v_new_income bigint;
  v_cost_multiplier integer;
BEGIN
  -- Validate player exists
  IF NOT EXISTS (SELECT 1 FROM player_profiles WHERE id = p_player_id) THEN
    RETURN json_build_object('success', false, 'error', 'Player not found');
  END IF;

  -- Get current business state
  SELECT current_level, current_hourly_income, total_invested
  INTO v_current_level, v_current_income, v_total_invested
  FROM player_businesses
  WHERE player_id = p_player_id AND business_id = p_business_id;

  IF v_current_level IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Business not owned');
  END IF;

  IF v_current_level >= 6 THEN
    RETURN json_build_object('success', false, 'error', 'Maximum level reached');
  END IF;

  -- Calculate upgrade cost based on level
  v_cost_multiplier := CASE v_current_level
    WHEN 1 THEN 30
    WHEN 2 THEN 60
    WHEN 3 THEN 120
    WHEN 4 THEN 180
    WHEN 5 THEN 240
  END;

  v_upgrade_cost := v_current_income * v_cost_multiplier;
  v_new_income := FLOOR(v_current_income * 1.25);

  -- Get player balance
  SELECT total_money INTO v_player_balance
  FROM player_profiles
  WHERE id = p_player_id;

  IF v_player_balance < v_upgrade_cost THEN
    RETURN json_build_object('success', false, 'error', 'Insufficient balance');
  END IF;

  -- Perform upgrade (atomic transaction)
  -- Deduct money and update hourly income
  UPDATE player_profiles
  SET total_money = total_money - v_upgrade_cost,
      hourly_income = hourly_income - v_current_income + v_new_income
  WHERE id = p_player_id;

  -- Update business
  UPDATE player_businesses
  SET current_level = current_level + 1,
      current_hourly_income = v_new_income,
      total_invested = total_invested + v_upgrade_cost,
      last_upgrade_at = now()
  WHERE player_id = p_player_id AND business_id = p_business_id;

  RETURN json_build_object(
    'success', true,
    'new_level', v_current_level + 1,
    'new_income', v_new_income,
    'upgrade_cost', v_upgrade_cost,
    'new_balance', v_player_balance - v_upgrade_cost
  );
END;
$$;