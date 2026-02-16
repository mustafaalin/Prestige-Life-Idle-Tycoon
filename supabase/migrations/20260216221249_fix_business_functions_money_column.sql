/*
  # Fix Business Functions - money → total_money Column
  
  1. Problem
    - purchase_business and upgrade_business functions use wrong column name 'money'
    - Correct column name is 'total_money' in player_profiles table
    - Return type mismatch: frontend expects jsonb object, functions return TABLE
  
  2. Changes
    - Fix purchase_business function:
      * Change all 'money' references to 'total_money'
      * Change return type from TABLE to jsonb for better frontend compatibility
      * Return object format: {success, error, new_balance}
    
    - Fix upgrade_business function:
      * Change all 'money' references to 'total_money'
      * Change return type from TABLE to jsonb
      * Return object format: {success, error, new_balance, new_income}
  
  3. Impact
    - Only affects actively used functions (purchase_business, upgrade_business)
    - Other functions (purchase_investment, upgrade_investment) not modified (unused)
    - Frontend compatibility improved with consistent return format
  
  4. Security
    - Maintains existing SECURITY DEFINER
    - No RLS changes needed
*/

-- ============================================================================
-- Fix purchase_business function
-- ============================================================================

DROP FUNCTION IF EXISTS purchase_business(uuid, uuid);

CREATE OR REPLACE FUNCTION purchase_business(
  p_player_id uuid,
  p_business_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_player_money bigint;
  v_business_price bigint;
  v_business_income bigint;
  v_business_name text;
  v_unlock_order integer;
  v_already_owned boolean;
  v_max_unlocked_order integer;
BEGIN
  -- Get player's current money (FIXED: money → total_money)
  SELECT total_money INTO v_player_money 
  FROM player_profiles 
  WHERE id = p_player_id;
  
  IF v_player_money IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Player not found',
      'new_balance', 0
    );
  END IF;
  
  -- Get business details
  SELECT base_price, base_hourly_income, name, unlock_order
  INTO v_business_price, v_business_income, v_business_name, v_unlock_order
  FROM businesses
  WHERE id = p_business_id;
  
  IF v_business_price IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Business not found',
      'new_balance', v_player_money
    );
  END IF;
  
  -- Check if already owned
  SELECT EXISTS(
    SELECT 1 FROM player_businesses 
    WHERE player_id = p_player_id AND business_id = p_business_id
  ) INTO v_already_owned;
  
  IF v_already_owned THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'You already own this business',
      'new_balance', v_player_money
    );
  END IF;
  
  -- Check unlock order
  SELECT COALESCE(MAX(b.unlock_order), 0)
  INTO v_max_unlocked_order
  FROM player_businesses pb
  INNER JOIN businesses b ON b.id = pb.business_id
  WHERE pb.player_id = p_player_id;
  
  IF v_unlock_order > (v_max_unlocked_order + 1) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'You must unlock businesses in order',
      'new_balance', v_player_money
    );
  END IF;
  
  -- Check if player has enough money
  IF v_player_money < v_business_price THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Not enough money',
      'new_balance', v_player_money
    );
  END IF;
  
  -- Deduct money from player (FIXED: money → total_money)
  UPDATE player_profiles 
  SET total_money = total_money - v_business_price 
  WHERE id = p_player_id;
  
  -- Create player_businesses record
  INSERT INTO player_businesses (
    player_id, business_id, current_level, current_hourly_income, 
    total_invested, purchased_at, last_upgrade_at
  )
  VALUES (
    p_player_id, p_business_id, 1, v_business_income,
    v_business_price, now(), now()
  );
  
  -- Recalculate player income
  PERFORM calculate_player_income(p_player_id);
  
  -- Get updated balance (FIXED: money → total_money)
  SELECT total_money INTO v_player_money 
  FROM player_profiles 
  WHERE id = p_player_id;
  
  -- Return success with updated balance
  RETURN jsonb_build_object(
    'success', true,
    'error', null,
    'new_balance', v_player_money
  );
END;
$$;

-- ============================================================================
-- Fix upgrade_business function
-- ============================================================================

DROP FUNCTION IF EXISTS upgrade_business(uuid, uuid);

CREATE OR REPLACE FUNCTION upgrade_business(
  p_player_id uuid,
  p_business_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_player_money bigint;
  v_current_level integer;
  v_current_income bigint;
  v_upgrade_cost bigint;
  v_new_income bigint;
  v_business_name text;
  v_cost_multiplier integer;
BEGIN
  -- Get player's current money (FIXED: money → total_money)
  SELECT total_money INTO v_player_money 
  FROM player_profiles 
  WHERE id = p_player_id;
  
  IF v_player_money IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Player not found',
      'new_balance', 0,
      'new_income', 0
    );
  END IF;
  
  -- Get business ownership and details
  SELECT pb.current_level, pb.current_hourly_income, b.name
  INTO v_current_level, v_current_income, v_business_name
  FROM player_businesses pb
  INNER JOIN businesses b ON b.id = pb.business_id
  WHERE pb.player_id = p_player_id AND pb.business_id = p_business_id;
  
  IF v_current_level IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'You do not own this business',
      'new_balance', v_player_money,
      'new_income', 0
    );
  END IF;
  
  -- Check max level
  IF v_current_level >= 6 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Business is already at maximum level',
      'new_balance', v_player_money,
      'new_income', v_current_income
    );
  END IF;
  
  -- Calculate upgrade cost
  v_cost_multiplier := CASE v_current_level
    WHEN 1 THEN 30
    WHEN 2 THEN 60
    WHEN 3 THEN 120
    WHEN 4 THEN 180
    WHEN 5 THEN 240
    ELSE 30
  END;
  
  v_upgrade_cost := v_current_income * v_cost_multiplier;
  
  -- Check if player has enough money
  IF v_player_money < v_upgrade_cost THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Not enough money to upgrade',
      'new_balance', v_player_money,
      'new_income', v_current_income
    );
  END IF;
  
  -- Calculate new income
  v_new_income := FLOOR(v_current_income * 1.25);
  
  -- Deduct upgrade cost (FIXED: money → total_money)
  UPDATE player_profiles 
  SET total_money = total_money - v_upgrade_cost 
  WHERE id = p_player_id;
  
  -- Upgrade the business
  UPDATE player_businesses
  SET current_level = current_level + 1,
      current_hourly_income = v_new_income,
      total_invested = total_invested + v_upgrade_cost,
      last_upgrade_at = now()
  WHERE player_id = p_player_id AND business_id = p_business_id;
  
  -- Recalculate player income
  PERFORM calculate_player_income(p_player_id);
  
  -- Get updated balance (FIXED: money → total_money)
  SELECT total_money INTO v_player_money 
  FROM player_profiles 
  WHERE id = p_player_id;
  
  -- Return success with updated values
  RETURN jsonb_build_object(
    'success', true,
    'error', null,
    'new_balance', v_player_money,
    'new_income', v_new_income
  );
END;
$$;
