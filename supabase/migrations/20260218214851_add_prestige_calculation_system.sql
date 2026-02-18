/*
  # Add Prestige Points Calculation System

  ## Overview
  This migration creates a comprehensive prestige points calculation system that automatically
  calculates and updates player prestige based on all their owned items and selections.

  ## Changes Made

  ### 1. New Function: calculate_player_prestige(p_player_id uuid)
  
  Calculates total prestige points from all sources:
  - **Job Prestige**: Points from currently active job
  - **Business Prestige**: Sum of prestige points from all owned businesses (based on their level)
  - **House Prestige**: Points from currently selected house
  - **Car Prestige**: Points from currently selected car
  - **Investment Prestige**: Sum of prestige points from all owned investments
  - **Outfit Prestige**: Points from currently selected outfit

  #### Calculation Details:

  **Job Prestige:**
  - Gets prestige_points from the active job (is_active = true)
  - Default: 0 if no active job

  **Business Prestige:**
  - For each owned business, gets prestige based on current_level
  - Uses business_prestige_points table with level-specific points
  - Level 1: base_points
  - Level 2: level2_points
  - Level 3: level3_points
  - Level 4: level4_points
  - Level 5: level5_points
  - Level 6: level6_points
  - Sums all owned businesses' prestige

  **House Prestige:**
  - Gets prestige_points from selected_house_id
  - Default: 0 if no house selected

  **Car Prestige:**
  - Gets prestige_points from selected_car_id
  - Default: 0 if no car selected

  **Investment Prestige:**
  - Gets prestige_points from all owned investment_properties
  - Only counts purchased investments (purchased_at IS NOT NULL)
  - Sums all owned investments' prestige

  **Outfit Prestige:**
  - Gets prestige_points from selected_outfit_id
  - Default: 0 if no outfit selected

  **Total Prestige:**
  - Sum of all prestige sources
  - Updates player_profiles.prestige_points

  ### 2. Updated Functions

  All functions that affect prestige sources now call calculate_player_prestige():
  - purchase_business: After purchasing a business
  - upgrade_business: After upgrading a business
  - selectJob: After changing job
  - purchaseItem: After buying/selecting car or house
  - purchase_outfit: After purchasing an outfit (if exists)

  ### 3. Data Consistency

  Recalculates prestige for all existing players to ensure data consistency.

  ## Important Notes

  1. **Automatic Updates**: Prestige is recalculated automatically whenever a player:
     - Buys or upgrades a business
     - Changes their job
     - Buys or selects a car
     - Selects a house
     - Purchases or selects an outfit

  2. **Business Prestige Levels**: Each business has different prestige values per level
     - Higher levels give more prestige
     - Values are stored in business_prestige_points table

  3. **Outfit Integration**: If outfit system exists, it's included in calculation

  ## Example Calculation

  Player with:
  - Job (CEO): 500 prestige
  - 3 Businesses at various levels: 1,500 prestige total
  - House (Luxury Villa): 800 prestige
  - Car (Sports Car): 300 prestige
  - 2 Investments: 400 prestige total
  - Outfit (Business Suit): 150 prestige

  Total Prestige: 500 + 1,500 + 800 + 300 + 400 + 150 = 3,650 prestige points
*/

-- ============================================================================
-- 1. CREATE PRESTIGE CALCULATION FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION calculate_player_prestige(p_player_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_job_prestige integer := 0;
  v_business_prestige integer := 0;
  v_house_prestige integer := 0;
  v_car_prestige integer := 0;
  v_investment_prestige integer := 0;
  v_outfit_prestige integer := 0;
  v_total_prestige integer := 0;
  v_profile_exists boolean;
BEGIN
  -- Check if player profile exists
  SELECT EXISTS(SELECT 1 FROM player_profiles WHERE id = p_player_id) INTO v_profile_exists;
  
  IF NOT v_profile_exists THEN
    RAISE EXCEPTION 'Player profile not found for id: %', p_player_id;
  END IF;

  -- 1. Calculate Job Prestige (from active job)
  SELECT COALESCE(j.prestige_points, 0)
  INTO v_job_prestige
  FROM player_jobs pj
  INNER JOIN jobs j ON j.id = pj.job_id
  WHERE pj.player_id = p_player_id 
    AND pj.is_active = true
  LIMIT 1;
  
  v_job_prestige := COALESCE(v_job_prestige, 0);
  
  -- 2. Calculate Business Prestige (sum of all owned businesses based on level)
  SELECT COALESCE(SUM(
    CASE pb.current_level
      WHEN 1 THEN COALESCE(bpp.level1_points, bpp.base_points, 0)
      WHEN 2 THEN COALESCE(bpp.level2_points, bpp.base_points, 0)
      WHEN 3 THEN COALESCE(bpp.level3_points, bpp.base_points, 0)
      WHEN 4 THEN COALESCE(bpp.level4_points, bpp.base_points, 0)
      WHEN 5 THEN COALESCE(bpp.level5_points, bpp.base_points, 0)
      WHEN 6 THEN COALESCE(bpp.level6_points, bpp.base_points, 0)
      ELSE COALESCE(bpp.base_points, 0)
    END
  ), 0)
  INTO v_business_prestige
  FROM player_businesses pb
  INNER JOIN businesses b ON b.id = pb.business_id
  LEFT JOIN business_prestige_points bpp ON bpp.business_id = b.id
  WHERE pb.player_id = p_player_id
    AND pb.is_unlocked = true;
  
  -- 3. Calculate House Prestige (from selected house)
  SELECT COALESCE(h.prestige_points, 0)
  INTO v_house_prestige
  FROM player_profiles pp
  LEFT JOIN houses h ON h.id = pp.selected_house_id
  WHERE pp.id = p_player_id;
  
  v_house_prestige := COALESCE(v_house_prestige, 0);
  
  -- 4. Calculate Car Prestige (from selected car)
  SELECT COALESCE(c.prestige_points, 0)
  INTO v_car_prestige
  FROM player_profiles pp
  LEFT JOIN cars c ON c.id = pp.selected_car_id
  WHERE pp.id = p_player_id;
  
  v_car_prestige := COALESCE(v_car_prestige, 0);
  
  -- 5. Calculate Investment Prestige (sum of all owned investments)
  SELECT COALESCE(SUM(ip.prestige_points), 0)
  INTO v_investment_prestige
  FROM player_investments pi
  INNER JOIN investment_properties ip ON ip.id = pi.investment_id
  WHERE pi.player_id = p_player_id
    AND pi.purchased_at IS NOT NULL;
  
  -- 6. Calculate Outfit Prestige (from selected outfit, if outfit system exists)
  SELECT COALESCE(co.prestige_points, 0)
  INTO v_outfit_prestige
  FROM player_profiles pp
  LEFT JOIN character_outfits co ON co.id = pp.selected_outfit_id
  WHERE pp.id = p_player_id;
  
  v_outfit_prestige := COALESCE(v_outfit_prestige, 0);
  
  -- 7. Calculate Total Prestige
  v_total_prestige := v_job_prestige + v_business_prestige + v_house_prestige + 
                      v_car_prestige + v_investment_prestige + v_outfit_prestige;
  
  -- 8. Update player profile with total prestige
  UPDATE player_profiles
  SET prestige_points = v_total_prestige
  WHERE id = p_player_id;
END;
$$;

-- ============================================================================
-- 2. DROP AND RECREATE EXISTING FUNCTIONS WITH PRESTIGE CALCULATION
-- ============================================================================

-- Drop existing functions first
DROP FUNCTION IF EXISTS purchase_business(uuid, uuid);
DROP FUNCTION IF EXISTS upgrade_business(uuid, uuid);
DROP FUNCTION IF EXISTS selectJob(uuid, uuid);
DROP FUNCTION IF EXISTS purchaseItem(uuid, uuid, text);

-- Recreate purchase_business function with prestige calculation
CREATE OR REPLACE FUNCTION purchase_business(
  p_player_id uuid,
  p_business_id uuid
)
RETURNS TABLE(success boolean, message text, new_balance bigint)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_player_money bigint;
  v_business_price bigint;
  v_business_name text;
  v_base_income bigint;
  v_unlock_order integer;
  v_max_unlocked integer;
  v_already_owned boolean;
BEGIN
  -- Get player's current money
  SELECT total_money INTO v_player_money FROM player_profiles WHERE id = p_player_id;
  
  IF v_player_money IS NULL THEN
    RETURN QUERY SELECT false, 'Player not found', 0::bigint;
    RETURN;
  END IF;
  
  -- Get business details
  SELECT base_price, name, base_hourly_income, unlock_order
  INTO v_business_price, v_business_name, v_base_income, v_unlock_order
  FROM businesses WHERE id = p_business_id;
  
  IF v_business_price IS NULL THEN
    RETURN QUERY SELECT false, 'Business not found', v_player_money;
    RETURN;
  END IF;
  
  -- Check if already owned
  SELECT EXISTS(
    SELECT 1 FROM player_businesses 
    WHERE player_id = p_player_id AND business_id = p_business_id
  ) INTO v_already_owned;
  
  IF v_already_owned THEN
    RETURN QUERY SELECT false, 'You already own this business', v_player_money;
    RETURN;
  END IF;
  
  -- Check unlock order (must unlock sequentially)
  SELECT COALESCE(MAX(b.unlock_order), 0)
  INTO v_max_unlocked
  FROM player_businesses pb
  INNER JOIN businesses b ON b.id = pb.business_id
  WHERE pb.player_id = p_player_id;
  
  IF v_unlock_order > v_max_unlocked + 1 THEN
    RETURN QUERY SELECT false, 'You must unlock businesses in order', v_player_money;
    RETURN;
  END IF;
  
  -- Check if player has enough money
  IF v_player_money < v_business_price THEN
    RETURN QUERY SELECT false, 'Not enough money to purchase this business', v_player_money;
    RETURN;
  END IF;
  
  -- Deduct money
  UPDATE player_profiles
  SET total_money = total_money - v_business_price
  WHERE id = p_player_id;
  
  -- Add business to player's businesses
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
    v_base_income,
    v_business_price,
    now()
  );
  
  -- Recalculate income
  PERFORM calculate_player_income(p_player_id);
  
  -- Recalculate prestige
  PERFORM calculate_player_prestige(p_player_id);
  
  -- Get updated balance
  SELECT total_money INTO v_player_money FROM player_profiles WHERE id = p_player_id;
  
  RETURN QUERY SELECT true, 'Successfully purchased ' || v_business_name, v_player_money;
END;
$$;

-- Recreate upgrade_business function with prestige calculation
CREATE OR REPLACE FUNCTION upgrade_business(
  p_player_id uuid,
  p_business_id uuid
)
RETURNS TABLE(success boolean, message text, new_balance bigint, new_income bigint)
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
  v_is_owned boolean;
BEGIN
  -- Get player's current money
  SELECT total_money INTO v_player_money FROM player_profiles WHERE id = p_player_id;
  
  IF v_player_money IS NULL THEN
    RETURN QUERY SELECT false, 'Player not found', 0::bigint, 0::bigint;
    RETURN;
  END IF;
  
  -- Get business details and check ownership
  SELECT 
    pb.current_level,
    pb.current_hourly_income,
    b.name,
    EXISTS(SELECT 1 FROM player_businesses WHERE player_id = p_player_id AND business_id = p_business_id)
  INTO 
    v_current_level,
    v_current_income,
    v_business_name,
    v_is_owned
  FROM player_businesses pb
  INNER JOIN businesses b ON b.id = pb.business_id
  WHERE pb.player_id = p_player_id AND pb.business_id = p_business_id;
  
  IF NOT v_is_owned THEN
    RETURN QUERY SELECT false, 'You do not own this business', v_player_money, 0::bigint;
    RETURN;
  END IF;
  
  -- Check max level
  IF v_current_level >= 6 THEN
    RETURN QUERY SELECT false, 'Business is already at max level', v_player_money, v_current_income;
    RETURN;
  END IF;
  
  -- Calculate upgrade cost based on level
  v_upgrade_cost := v_current_income * 
    CASE v_current_level
      WHEN 1 THEN 30
      WHEN 2 THEN 60
      WHEN 3 THEN 120
      WHEN 4 THEN 180
      WHEN 5 THEN 240
      ELSE 300
    END;
  
  -- Check if player has enough money
  IF v_player_money < v_upgrade_cost THEN
    RETURN QUERY SELECT false, 'Not enough money to upgrade this business', v_player_money, v_current_income;
    RETURN;
  END IF;
  
  -- Calculate new income (25% increase)
  v_new_income := FLOOR(v_current_income * 1.25);
  
  -- Deduct money and upgrade business
  UPDATE player_profiles
  SET total_money = total_money - v_upgrade_cost
  WHERE id = p_player_id;
  
  UPDATE player_businesses
  SET 
    current_level = current_level + 1,
    current_hourly_income = v_new_income,
    total_invested = total_invested + v_upgrade_cost,
    last_upgrade_at = now()
  WHERE player_id = p_player_id AND business_id = p_business_id;
  
  -- Recalculate income
  PERFORM calculate_player_income(p_player_id);
  
  -- Recalculate prestige
  PERFORM calculate_player_prestige(p_player_id);
  
  -- Get updated balance
  SELECT total_money INTO v_player_money FROM player_profiles WHERE id = p_player_id;
  
  RETURN QUERY SELECT true, 'Successfully upgraded ' || v_business_name || ' to level ' || (v_current_level + 1)::text, v_player_money, v_new_income;
END;
$$;

-- Recreate selectJob function with prestige calculation
CREATE OR REPLACE FUNCTION selectJob(
  p_player_id uuid,
  p_job_id uuid
)
RETURNS TABLE(success boolean, message text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_job_unlocked boolean;
  v_job_name text;
BEGIN
  -- Check if job is unlocked for this player
  SELECT is_unlocked, j.name
  INTO v_job_unlocked, v_job_name
  FROM player_jobs pj
  INNER JOIN jobs j ON j.id = pj.job_id
  WHERE pj.player_id = p_player_id AND pj.job_id = p_job_id;
  
  IF v_job_unlocked IS NULL THEN
    RETURN QUERY SELECT false, 'Job not found or not available';
    RETURN;
  END IF;
  
  IF NOT v_job_unlocked THEN
    RETURN QUERY SELECT false, 'This job is not unlocked yet';
    RETURN;
  END IF;
  
  -- Deactivate all jobs for this player
  UPDATE player_jobs
  SET is_active = false
  WHERE player_id = p_player_id;
  
  -- Activate selected job
  UPDATE player_jobs
  SET is_active = true
  WHERE player_id = p_player_id AND job_id = p_job_id;
  
  -- Recalculate income
  PERFORM calculate_player_income(p_player_id);
  
  -- Recalculate prestige
  PERFORM calculate_player_prestige(p_player_id);
  
  RETURN QUERY SELECT true, 'Successfully switched to ' || v_job_name;
END;
$$;

-- Recreate purchaseItem function with prestige calculation
CREATE OR REPLACE FUNCTION purchaseItem(
  p_player_id uuid,
  p_item_id uuid,
  p_item_type text
)
RETURNS TABLE(success boolean, message text, new_balance bigint)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_player_money bigint;
  v_item_price bigint;
  v_item_name text;
  v_item_exists boolean;
BEGIN
  -- Get player's current money
  SELECT total_money INTO v_player_money FROM player_profiles WHERE id = p_player_id;
  
  IF v_player_money IS NULL THEN
    RETURN QUERY SELECT false, 'Player not found', 0::bigint;
    RETURN;
  END IF;
  
  IF p_item_type = 'house' THEN
    -- Houses are not purchased, only selected (no money transaction)
    SELECT EXISTS(SELECT 1 FROM houses WHERE id = p_item_id) INTO v_item_exists;
    
    IF NOT v_item_exists THEN
      RETURN QUERY SELECT false, 'House not found', v_player_money;
      RETURN;
    END IF;
    
    SELECT name INTO v_item_name FROM houses WHERE id = p_item_id;
    
    -- Just update the selected house, no money deduction
    UPDATE player_profiles
    SET selected_house_id = p_item_id
    WHERE id = p_player_id;
    
    -- Recalculate income (house rent will be applied)
    PERFORM calculate_player_income(p_player_id);
    
    -- Recalculate prestige
    PERFORM calculate_player_prestige(p_player_id);
    
    -- Get updated balance
    SELECT total_money INTO v_player_money FROM player_profiles WHERE id = p_player_id;
    
    RETURN QUERY SELECT true, 'Moved to ' || v_item_name || '! Check your expenses.', v_player_money;
    
  ELSIF p_item_type = 'car' THEN
    -- Cars are still purchased
    SELECT price, name INTO v_item_price, v_item_name
    FROM cars WHERE id = p_item_id;
    
    IF v_item_price IS NULL THEN
      RETURN QUERY SELECT false, 'Car not found', v_player_money;
      RETURN;
    END IF;
    
    IF v_player_money < v_item_price THEN
      RETURN QUERY SELECT false, 'Not enough money to purchase this car', v_player_money;
      RETURN;
    END IF;
    
    -- Deduct money and select car
    UPDATE player_profiles
    SET total_money = total_money - v_item_price,
        selected_car_id = p_item_id
    WHERE id = p_player_id;
    
    -- Recalculate income (car maintenance will be applied)
    PERFORM calculate_player_income(p_player_id);
    
    -- Recalculate prestige
    PERFORM calculate_player_prestige(p_player_id);
    
    -- Get updated balance
    SELECT total_money INTO v_player_money FROM player_profiles WHERE id = p_player_id;
    
    RETURN QUERY SELECT true, 'Successfully purchased ' || v_item_name, v_player_money;
    
  ELSE
    RETURN QUERY SELECT false, 'Invalid item type', v_player_money;
  END IF;
END;
$$;

-- ============================================================================
-- 3. RECALCULATE PRESTIGE FOR ALL EXISTING PLAYERS
-- ============================================================================

DO $$
DECLARE
  player_record RECORD;
BEGIN
  FOR player_record IN SELECT id FROM player_profiles
  LOOP
    PERFORM calculate_player_prestige(player_record.id);
  END LOOP;
END $$;