/*
  # Income & Expense System with Investment Properties
  
  ## Overview
  This migration creates a comprehensive income and expense tracking system for the game.
  Players will have multiple income sources (job, businesses, investments) and expenses (house rent, vehicle maintenance).
  
  ## Changes Made
  
  ### 1. New Tables
  
  #### investment_properties (Master data for investment properties)
  - `id` (uuid, primary key) - Unique identifier for each investment property type
  - `name` (text) - Display name (e.g., "Studio Apartment Investment #1", "Luxury Villa #3")
  - `description` (text) - Detailed description of the investment property
  - `category` (text) - Property category: 'apartment', 'villa', 'commercial'
  - `base_price` (bigint) - Initial purchase price in game currency
  - `base_rental_income` (bigint) - Hourly rental income at level 1
  - `unlock_order` (integer) - Sequential unlock order (1-40), determines which properties are available
  - `icon_name` (text) - Lucide icon name for UI display
  - `image_url` (text, nullable) - Optional image URL for the property
  - `created_at` (timestamptz) - Record creation timestamp
  
  #### player_investments (Player's owned investment properties)
  - `id` (uuid, primary key) - Unique identifier
  - `player_id` (uuid) - Foreign key to player_profiles (auth.users)
  - `investment_id` (uuid) - Foreign key to investment_properties
  - `is_unlocked` (boolean) - Whether this investment is unlocked for purchase
  - `current_level` (integer, 1-6) - Current upgrade level, max 6
  - `current_rental_income` (bigint) - Current hourly rental income (increases with upgrades)
  - `total_invested` (bigint) - Total money invested (purchase + all upgrades)
  - `purchased_at` (timestamptz, nullable) - When the property was initially purchased
  - `last_upgrade_at` (timestamptz, nullable) - When the property was last upgraded
  - Unique constraint: (player_id, investment_id) - Each player can own each property once
  
  ### 2. Updated Tables
  
  #### player_profiles - New Income & Expense Columns
  - `job_income` (numeric, default 0) - Hourly income from active job
  - `business_income` (numeric, default 0) - Total hourly income from all owned businesses
  - `investment_income` (numeric, default 0) - Total hourly rental income from all investment properties
  - `house_rent_expense` (numeric, default 0) - Hourly rent expense for current residence
  - `vehicle_expense` (numeric, default 0) - Hourly maintenance cost for current vehicle
  - `other_expenses` (numeric, default 0) - Other miscellaneous expenses (future use)
  - `gross_income` (numeric, default 0) - Total income before expenses (job + business + investment)
  - `total_expenses` (numeric, default 0) - Total expenses (house + vehicle + other)
  - `hourly_income` (numeric, existing) - Net income per hour (gross_income - total_expenses)
  - Removed: `money_per_second` - No longer used, replaced by detailed income tracking
  
  #### houses - Residence System (Player's Living Place)
  - Removed: `price` column - Players don't purchase houses, they just select and pay rent
  - Removed: `passive_income_bonus` column - No longer provides income
  - Added: `hourly_rent_cost` (numeric, default 0) - Hourly rent expense for living here
  - Note: Players select a house to live in, which adds to their hourly expenses
  
  #### cars - Vehicle System
  - Added: `hourly_maintenance_cost` (numeric, default 0) - Hourly maintenance/fuel cost
  
  ### 3. New Functions
  
  #### calculate_player_income(p_player_id uuid)
  Central function that calculates all income and expenses for a player.
  Called automatically after any action that affects income/expenses.
  
  Calculations:
  1. Job Income: Gets hourly_income from active job (is_active=true in player_jobs)
  2. Business Income: Sums current_hourly_income from all player_businesses
  3. Investment Income: Sums current_rental_income from all player_investments
  4. House Rent Expense: Gets hourly_rent_cost from selected house
  5. Vehicle Expense: Gets hourly_maintenance_cost from selected car
  6. Gross Income = job + business + investment
  7. Total Expenses = house_rent + vehicle + other
  8. Net Hourly Income = gross_income - total_expenses
  
  Updates player_profiles with all calculated values.
  Also updates current_job_id based on active job.
  
  #### purchase_investment(p_player_id uuid, p_investment_id uuid)
  Allows player to purchase an investment property.
  
  Validations:
  - Checks if player has enough money
  - Checks sequential unlock order (must unlock in order)
  - Prevents duplicate purchases
  
  Actions:
  - Deducts purchase price from player's money
  - Creates player_investments record with level 1
  - Calls calculate_player_income() to update income
  
  Returns: success boolean, message text, new_balance bigint
  
  #### upgrade_investment(p_player_id uuid, p_investment_id uuid)
  Upgrades an owned investment property to increase rental income.
  
  Validations:
  - Checks ownership
  - Checks max level (6)
  - Checks sufficient funds
  
  Upgrade Cost Formula:
  - Level 2: current_income × 30
  - Level 3: current_income × 60
  - Level 4: current_income × 120
  - Level 5: current_income × 180
  - Level 6: current_income × 240
  
  Income Increase: current_rental_income × 1.25 per level
  
  Actions:
  - Deducts upgrade cost from player's money
  - Increases level by 1
  - Increases rental income by 25%
  - Updates total_invested
  - Calls calculate_player_income()
  
  Returns: success boolean, message text, new_balance bigint, new_income bigint
  
  #### get_player_investments(p_player_id uuid)
  Returns all investment properties owned by the player with full details.
  
  #### get_all_investments(p_player_id uuid)
  Returns all available investment properties with player's ownership status.
  Shows which are locked/unlocked and ownership details if owned.
  
  ### 4. Updated Functions
  
  All existing functions that previously modified hourly_income directly now call
  calculate_player_income() instead to ensure all income/expenses are recalculated properly.
  
  Updated functions:
  - selectJob: Now calls calculate_player_income() after job change
  - purchase_business: Calls calculate_player_income() after purchase
  - upgrade_business: Calls calculate_player_income() after upgrade
  - purchaseItem: 
    - For houses: Only updates selected_house_id, no money deduction
    - For cars: Updates selected_car_id, deducts money
    - Both call calculate_player_income()
  
  ### 5. Data Fixes
  
  Fixes existing player data:
  - Sets current_job_id based on active job (is_active=true)
  - Recalculates all income/expenses using calculate_player_income()
  - Ensures data consistency across all players
  
  ### 6. Security (RLS Policies)
  
  #### investment_properties
  - Anyone can view (public master data)
  
  #### player_investments
  - Players can only view their own investments
  - Players can only insert their own investments (through functions)
  - Players can only update their own investments (through functions)
  - No direct DELETE (managed by reset functions)
  
  ## Important Notes
  
  1. **Sequential Unlocking**: Investment properties must be unlocked in order (unlock_order 1, 2, 3, etc.)
  2. **No Direct Updates**: All income/expense changes go through calculate_player_income()
  3. **House Selection**: Players don't buy houses, they select them and pay hourly rent
  4. **Investment ROI**: Higher level investments provide better returns
  5. **Game Balance**: Net income = all income sources - all expenses
  
  ## Example Calculations
  
  Player with:
  - Job (Cashier): +$1,400/hour
  - 3 Businesses: +$165/hour total
  - 5 Investments: +$2,300/hour total
  - House (2+1 Apartment): -$1,200/hour rent
  - Car (BMW): -$150/hour maintenance
  
  Calculation:
  - Gross Income: $1,400 + $165 + $2,300 = $3,865/hour
  - Total Expenses: $1,200 + $150 = $1,350/hour
  - Net Hourly Income: $3,865 - $1,350 = $2,515/hour
*/

-- ============================================================================
-- 1. CREATE NEW TABLES
-- ============================================================================

-- Investment Properties (Master Data)
CREATE TABLE IF NOT EXISTS investment_properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  category text NOT NULL CHECK (category IN ('apartment', 'villa', 'commercial')),
  base_price bigint NOT NULL CHECK (base_price >= 0),
  base_rental_income bigint NOT NULL CHECK (base_rental_income >= 0),
  unlock_order integer NOT NULL UNIQUE CHECK (unlock_order > 0),
  icon_name text NOT NULL DEFAULT 'Building2',
  image_url text,
  created_at timestamptz DEFAULT now()
);

-- Player Investments
CREATE TABLE IF NOT EXISTS player_investments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  investment_id uuid NOT NULL REFERENCES investment_properties(id) ON DELETE CASCADE,
  is_unlocked boolean DEFAULT false,
  current_level integer DEFAULT 1 CHECK (current_level >= 1 AND current_level <= 6),
  current_rental_income bigint DEFAULT 0 CHECK (current_rental_income >= 0),
  total_invested bigint DEFAULT 0 CHECK (total_invested >= 0),
  purchased_at timestamptz,
  last_upgrade_at timestamptz,
  UNIQUE(player_id, investment_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_player_investments_player_id ON player_investments(player_id);
CREATE INDEX IF NOT EXISTS idx_player_investments_investment_id ON player_investments(investment_id);
CREATE INDEX IF NOT EXISTS idx_investment_properties_unlock_order ON investment_properties(unlock_order);

-- ============================================================================
-- 2. UPDATE EXISTING TABLES
-- ============================================================================

-- Update player_profiles: Add income/expense tracking columns
DO $$
BEGIN
  -- Add new income columns
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'player_profiles' AND column_name = 'job_income') THEN
    ALTER TABLE player_profiles ADD COLUMN job_income numeric DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'player_profiles' AND column_name = 'business_income') THEN
    ALTER TABLE player_profiles ADD COLUMN business_income numeric DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'player_profiles' AND column_name = 'investment_income') THEN
    ALTER TABLE player_profiles ADD COLUMN investment_income numeric DEFAULT 0;
  END IF;
  
  -- Add new expense columns
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'player_profiles' AND column_name = 'house_rent_expense') THEN
    ALTER TABLE player_profiles ADD COLUMN house_rent_expense numeric DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'player_profiles' AND column_name = 'vehicle_expense') THEN
    ALTER TABLE player_profiles ADD COLUMN vehicle_expense numeric DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'player_profiles' AND column_name = 'other_expenses') THEN
    ALTER TABLE player_profiles ADD COLUMN other_expenses numeric DEFAULT 0;
  END IF;
  
  -- Add calculation columns
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'player_profiles' AND column_name = 'gross_income') THEN
    ALTER TABLE player_profiles ADD COLUMN gross_income numeric DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'player_profiles' AND column_name = 'total_expenses') THEN
    ALTER TABLE player_profiles ADD COLUMN total_expenses numeric DEFAULT 0;
  END IF;
  
  -- Remove deprecated column
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'player_profiles' AND column_name = 'money_per_second') THEN
    ALTER TABLE player_profiles DROP COLUMN money_per_second;
  END IF;
END $$;

-- Update houses: Remove purchase price, add rent cost
DO $$
BEGIN
  -- Remove price column (houses are not purchased, only selected)
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'houses' AND column_name = 'price') THEN
    ALTER TABLE houses DROP COLUMN price;
  END IF;
  
  -- Remove passive_income_bonus (houses don't provide income anymore)
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'houses' AND column_name = 'passive_income_bonus') THEN
    ALTER TABLE houses DROP COLUMN passive_income_bonus;
  END IF;
  
  -- Add hourly rent cost
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'houses' AND column_name = 'hourly_rent_cost') THEN
    ALTER TABLE houses ADD COLUMN hourly_rent_cost numeric DEFAULT 0 CHECK (hourly_rent_cost >= 0);
  END IF;
END $$;

-- Update cars: Add maintenance cost
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cars' AND column_name = 'hourly_maintenance_cost') THEN
    ALTER TABLE cars ADD COLUMN hourly_maintenance_cost numeric DEFAULT 0 CHECK (hourly_maintenance_cost >= 0);
  END IF;
END $$;

-- ============================================================================
-- 3. CENTRAL INCOME CALCULATION FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION calculate_player_income(p_player_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_job_income numeric := 0;
  v_business_income numeric := 0;
  v_investment_income numeric := 0;
  v_house_rent numeric := 0;
  v_vehicle_expense numeric := 0;
  v_other_expenses numeric := 0;
  v_gross_income numeric := 0;
  v_total_expenses numeric := 0;
  v_net_income numeric := 0;
  v_current_job_id uuid;
  v_profile_exists boolean;
BEGIN
  -- Check if player profile exists
  SELECT EXISTS(SELECT 1 FROM player_profiles WHERE id = p_player_id) INTO v_profile_exists;
  
  IF NOT v_profile_exists THEN
    RAISE EXCEPTION 'Player profile not found for id: %', p_player_id;
  END IF;

  -- 1. Calculate Job Income (only from active job)
  SELECT 
    COALESCE(j.hourly_income, 0),
    pj.job_id
  INTO 
    v_job_income,
    v_current_job_id
  FROM player_jobs pj
  INNER JOIN jobs j ON j.id = pj.job_id
  WHERE pj.player_id = p_player_id 
    AND pj.is_active = true
  LIMIT 1;
  
  -- Default to 0 if no active job
  v_job_income := COALESCE(v_job_income, 0);
  
  -- 2. Calculate Business Income (sum of all businesses)
  SELECT COALESCE(SUM(current_hourly_income), 0)
  INTO v_business_income
  FROM player_businesses
  WHERE player_id = p_player_id;
  
  -- 3. Calculate Investment Income (sum of all rental income)
  SELECT COALESCE(SUM(current_rental_income), 0)
  INTO v_investment_income
  FROM player_investments
  WHERE player_id = p_player_id 
    AND purchased_at IS NOT NULL;
  
  -- 4. Calculate House Rent Expense
  SELECT COALESCE(h.hourly_rent_cost, 0)
  INTO v_house_rent
  FROM player_profiles pp
  LEFT JOIN houses h ON h.id = pp.selected_house_id
  WHERE pp.id = p_player_id;
  
  v_house_rent := COALESCE(v_house_rent, 0);
  
  -- 5. Calculate Vehicle Expense
  SELECT COALESCE(c.hourly_maintenance_cost, 0)
  INTO v_vehicle_expense
  FROM player_profiles pp
  LEFT JOIN cars c ON c.id = pp.selected_car_id
  WHERE pp.id = p_player_id;
  
  v_vehicle_expense := COALESCE(v_vehicle_expense, 0);
  
  -- 6. Get other expenses (future use)
  SELECT COALESCE(other_expenses, 0)
  INTO v_other_expenses
  FROM player_profiles
  WHERE id = p_player_id;
  
  -- 7. Calculate totals
  v_gross_income := v_job_income + v_business_income + v_investment_income;
  v_total_expenses := v_house_rent + v_vehicle_expense + v_other_expenses;
  v_net_income := v_gross_income - v_total_expenses;
  
  -- Ensure net income is not negative (minimum 0)
  IF v_net_income < 0 THEN
    v_net_income := 0;
  END IF;
  
  -- 8. Update player profile with all calculated values
  UPDATE player_profiles
  SET
    job_income = v_job_income,
    business_income = v_business_income,
    investment_income = v_investment_income,
    house_rent_expense = v_house_rent,
    vehicle_expense = v_vehicle_expense,
    gross_income = v_gross_income,
    total_expenses = v_total_expenses,
    hourly_income = v_net_income,
    current_job_id = v_current_job_id,
    last_played_at = now()
  WHERE id = p_player_id;
  
END;
$$;

-- ============================================================================
-- 4. INVESTMENT MANAGEMENT FUNCTIONS
-- ============================================================================

-- Purchase Investment Property
CREATE OR REPLACE FUNCTION purchase_investment(
  p_player_id uuid,
  p_investment_id uuid
)
RETURNS TABLE(success boolean, message text, new_balance bigint)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_player_money bigint;
  v_investment_price bigint;
  v_investment_income bigint;
  v_investment_name text;
  v_unlock_order integer;
  v_already_owned boolean;
  v_max_unlocked_order integer;
BEGIN
  -- Get player's current money
  SELECT money INTO v_player_money
  FROM player_profiles
  WHERE id = p_player_id;
  
  IF v_player_money IS NULL THEN
    RETURN QUERY SELECT false, 'Player not found', 0::bigint;
    RETURN;
  END IF;
  
  -- Get investment details
  SELECT base_price, base_rental_income, name, unlock_order
  INTO v_investment_price, v_investment_income, v_investment_name, v_unlock_order
  FROM investment_properties
  WHERE id = p_investment_id;
  
  IF v_investment_price IS NULL THEN
    RETURN QUERY SELECT false, 'Investment property not found', v_player_money;
    RETURN;
  END IF;
  
  -- Check if already owned
  SELECT EXISTS(
    SELECT 1 FROM player_investments 
    WHERE player_id = p_player_id 
      AND investment_id = p_investment_id
      AND purchased_at IS NOT NULL
  ) INTO v_already_owned;
  
  IF v_already_owned THEN
    RETURN QUERY SELECT false, 'You already own this investment property', v_player_money;
    RETURN;
  END IF;
  
  -- Check sequential unlock order
  -- Find the maximum unlocked order for this player
  SELECT COALESCE(MAX(ip.unlock_order), 0)
  INTO v_max_unlocked_order
  FROM player_investments pi
  INNER JOIN investment_properties ip ON ip.id = pi.investment_id
  WHERE pi.player_id = p_player_id
    AND pi.purchased_at IS NOT NULL;
  
  -- Player can only unlock the next in sequence
  IF v_unlock_order > (v_max_unlocked_order + 1) THEN
    RETURN QUERY SELECT 
      false, 
      'You must unlock investment properties in order. Complete #' || (v_max_unlocked_order + 1) || ' first.', 
      v_player_money;
    RETURN;
  END IF;
  
  -- Check if player has enough money
  IF v_player_money < v_investment_price THEN
    RETURN QUERY SELECT false, 'Not enough money to purchase this investment property', v_player_money;
    RETURN;
  END IF;
  
  -- Deduct money from player
  UPDATE player_profiles
  SET money = money - v_investment_price
  WHERE id = p_player_id;
  
  -- Create or update investment record
  INSERT INTO player_investments (
    player_id,
    investment_id,
    is_unlocked,
    current_level,
    current_rental_income,
    total_invested,
    purchased_at,
    last_upgrade_at
  )
  VALUES (
    p_player_id,
    p_investment_id,
    true,
    1,
    v_investment_income,
    v_investment_price,
    now(),
    now()
  )
  ON CONFLICT (player_id, investment_id)
  DO UPDATE SET
    is_unlocked = true,
    current_level = 1,
    current_rental_income = v_investment_income,
    total_invested = v_investment_price,
    purchased_at = now(),
    last_upgrade_at = now();
  
  -- Recalculate player income
  PERFORM calculate_player_income(p_player_id);
  
  -- Get updated balance
  SELECT money INTO v_player_money
  FROM player_profiles
  WHERE id = p_player_id;
  
  RETURN QUERY SELECT 
    true, 
    'Successfully purchased ' || v_investment_name || '! You now earn $' || v_investment_income || '/hour from this investment.', 
    v_player_money;
END;
$$;

-- Upgrade Investment Property
CREATE OR REPLACE FUNCTION upgrade_investment(
  p_player_id uuid,
  p_investment_id uuid
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
  v_investment_name text;
  v_total_invested bigint;
  v_cost_multiplier integer;
BEGIN
  -- Get player's current money
  SELECT money INTO v_player_money
  FROM player_profiles
  WHERE id = p_player_id;
  
  IF v_player_money IS NULL THEN
    RETURN QUERY SELECT false, 'Player not found', 0::bigint, 0::bigint;
    RETURN;
  END IF;
  
  -- Get current investment details
  SELECT 
    pi.current_level,
    pi.current_rental_income,
    pi.total_invested,
    ip.name
  INTO 
    v_current_level,
    v_current_income,
    v_total_invested,
    v_investment_name
  FROM player_investments pi
  INNER JOIN investment_properties ip ON ip.id = pi.investment_id
  WHERE pi.player_id = p_player_id
    AND pi.investment_id = p_investment_id
    AND pi.purchased_at IS NOT NULL;
  
  IF v_current_level IS NULL THEN
    RETURN QUERY SELECT false, 'You do not own this investment property', v_player_money, 0::bigint;
    RETURN;
  END IF;
  
  -- Check max level
  IF v_current_level >= 6 THEN
    RETURN QUERY SELECT false, 'This investment is already at maximum level (6)', v_player_money, v_current_income;
    RETURN;
  END IF;
  
  -- Calculate upgrade cost based on level
  -- Level 1→2: income × 30
  -- Level 2→3: income × 60
  -- Level 3→4: income × 120
  -- Level 4→5: income × 180
  -- Level 5→6: income × 240
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
    RETURN QUERY SELECT 
      false, 
      'Not enough money to upgrade. Cost: $' || v_upgrade_cost, 
      v_player_money, 
      v_current_income;
    RETURN;
  END IF;
  
  -- Calculate new income (25% increase)
  v_new_income := FLOOR(v_current_income * 1.25);
  
  -- Deduct money from player
  UPDATE player_profiles
  SET money = money - v_upgrade_cost
  WHERE id = p_player_id;
  
  -- Update investment
  UPDATE player_investments
  SET
    current_level = current_level + 1,
    current_rental_income = v_new_income,
    total_invested = total_invested + v_upgrade_cost,
    last_upgrade_at = now()
  WHERE player_id = p_player_id
    AND investment_id = p_investment_id;
  
  -- Recalculate player income
  PERFORM calculate_player_income(p_player_id);
  
  -- Get updated balance
  SELECT money INTO v_player_money
  FROM player_profiles
  WHERE id = p_player_id;
  
  RETURN QUERY SELECT 
    true,
    'Upgraded ' || v_investment_name || ' to level ' || (v_current_level + 1) || '! Income increased to $' || v_new_income || '/hour',
    v_player_money,
    v_new_income;
END;
$$;

-- Get Player's Investments
CREATE OR REPLACE FUNCTION get_player_investments(p_player_id uuid)
RETURNS TABLE(
  investment_id uuid,
  name text,
  description text,
  category text,
  current_level integer,
  current_rental_income bigint,
  total_invested bigint,
  purchased_at timestamptz,
  last_upgrade_at timestamptz,
  icon_name text,
  image_url text,
  unlock_order integer,
  can_upgrade boolean,
  upgrade_cost bigint,
  next_income bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_cost_multiplier integer;
BEGIN
  RETURN QUERY
  SELECT 
    pi.investment_id,
    ip.name,
    ip.description,
    ip.category,
    pi.current_level,
    pi.current_rental_income,
    pi.total_invested,
    pi.purchased_at,
    pi.last_upgrade_at,
    ip.icon_name,
    ip.image_url,
    ip.unlock_order,
    (pi.current_level < 6) as can_upgrade,
    CASE 
      WHEN pi.current_level >= 6 THEN 0
      WHEN pi.current_level = 1 THEN pi.current_rental_income * 30
      WHEN pi.current_level = 2 THEN pi.current_rental_income * 60
      WHEN pi.current_level = 3 THEN pi.current_rental_income * 120
      WHEN pi.current_level = 4 THEN pi.current_rental_income * 180
      WHEN pi.current_level = 5 THEN pi.current_rental_income * 240
      ELSE 0
    END as upgrade_cost,
    FLOOR(pi.current_rental_income * 1.25) as next_income
  FROM player_investments pi
  INNER JOIN investment_properties ip ON ip.id = pi.investment_id
  WHERE pi.player_id = p_player_id
    AND pi.purchased_at IS NOT NULL
  ORDER BY ip.unlock_order;
END;
$$;

-- Get All Available Investments
CREATE OR REPLACE FUNCTION get_all_investments(p_player_id uuid)
RETURNS TABLE(
  investment_id uuid,
  name text,
  description text,
  category text,
  base_price bigint,
  base_rental_income bigint,
  unlock_order integer,
  icon_name text,
  image_url text,
  is_owned boolean,
  is_unlocked boolean,
  current_level integer,
  current_rental_income bigint,
  can_purchase boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_max_unlocked_order integer;
BEGIN
  -- Get max unlocked order for this player
  SELECT COALESCE(MAX(ip.unlock_order), 0)
  INTO v_max_unlocked_order
  FROM player_investments pi
  INNER JOIN investment_properties ip ON ip.id = pi.investment_id
  WHERE pi.player_id = p_player_id
    AND pi.purchased_at IS NOT NULL;

  RETURN QUERY
  SELECT 
    ip.id as investment_id,
    ip.name,
    ip.description,
    ip.category,
    ip.base_price,
    ip.base_rental_income,
    ip.unlock_order,
    ip.icon_name,
    ip.image_url,
    (pi.purchased_at IS NOT NULL) as is_owned,
    COALESCE(pi.is_unlocked, false) as is_unlocked,
    COALESCE(pi.current_level, 0) as current_level,
    COALESCE(pi.current_rental_income, 0) as current_rental_income,
    (ip.unlock_order <= (v_max_unlocked_order + 1) AND pi.purchased_at IS NULL) as can_purchase
  FROM investment_properties ip
  LEFT JOIN player_investments pi ON pi.investment_id = ip.id AND pi.player_id = p_player_id
  ORDER BY ip.unlock_order;
END;
$$;

-- ============================================================================
-- 5. UPDATE EXISTING FUNCTIONS (DROP AND RECREATE)
-- ============================================================================

-- Drop existing functions that will change
DROP FUNCTION IF EXISTS selectJob(uuid, uuid);
DROP FUNCTION IF EXISTS purchase_business(uuid, uuid);
DROP FUNCTION IF EXISTS upgrade_business(uuid, uuid);
DROP FUNCTION IF EXISTS purchaseItem(uuid, uuid, text);

-- Recreate selectJob
CREATE OR REPLACE FUNCTION selectJob(p_player_id uuid, p_job_id uuid)
RETURNS TABLE(success boolean, message text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_job_exists boolean;
  v_player_exists boolean;
BEGIN
  -- Check if player exists
  SELECT EXISTS(SELECT 1 FROM player_profiles WHERE id = p_player_id) INTO v_player_exists;
  IF NOT v_player_exists THEN
    RETURN QUERY SELECT false, 'Player not found';
    RETURN;
  END IF;

  -- Check if job exists
  SELECT EXISTS(SELECT 1 FROM jobs WHERE id = p_job_id) INTO v_job_exists;
  IF NOT v_job_exists THEN
    RETURN QUERY SELECT false, 'Job not found';
    RETURN;
  END IF;

  -- Deactivate all current jobs
  UPDATE player_jobs
  SET is_active = false
  WHERE player_id = p_player_id;

  -- Insert or update the new job as active
  INSERT INTO player_jobs (player_id, job_id, is_active)
  VALUES (p_player_id, p_job_id, true)
  ON CONFLICT (player_id, job_id)
  DO UPDATE SET is_active = true;

  -- Recalculate all income and expenses
  PERFORM calculate_player_income(p_player_id);

  RETURN QUERY SELECT true, 'Job changed successfully';
END;
$$;

-- Recreate purchase_business
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
  v_business_income bigint;
  v_business_name text;
  v_unlock_order integer;
  v_already_owned boolean;
  v_max_unlocked_order integer;
BEGIN
  SELECT money INTO v_player_money FROM player_profiles WHERE id = p_player_id;
  
  IF v_player_money IS NULL THEN
    RETURN QUERY SELECT false, 'Player not found', 0::bigint;
    RETURN;
  END IF;
  
  SELECT base_price, base_hourly_income, name, unlock_order
  INTO v_business_price, v_business_income, v_business_name, v_unlock_order
  FROM businesses
  WHERE id = p_business_id;
  
  IF v_business_price IS NULL THEN
    RETURN QUERY SELECT false, 'Business not found', v_player_money;
    RETURN;
  END IF;
  
  SELECT EXISTS(
    SELECT 1 FROM player_businesses 
    WHERE player_id = p_player_id AND business_id = p_business_id
  ) INTO v_already_owned;
  
  IF v_already_owned THEN
    RETURN QUERY SELECT false, 'You already own this business', v_player_money;
    RETURN;
  END IF;
  
  SELECT COALESCE(MAX(b.unlock_order), 0)
  INTO v_max_unlocked_order
  FROM player_businesses pb
  INNER JOIN businesses b ON b.id = pb.business_id
  WHERE pb.player_id = p_player_id;
  
  IF v_unlock_order > (v_max_unlocked_order + 1) THEN
    RETURN QUERY SELECT false, 'You must unlock businesses in order', v_player_money;
    RETURN;
  END IF;
  
  IF v_player_money < v_business_price THEN
    RETURN QUERY SELECT false, 'Not enough money', v_player_money;
    RETURN;
  END IF;
  
  UPDATE player_profiles SET money = money - v_business_price WHERE id = p_player_id;
  
  INSERT INTO player_businesses (
    player_id, business_id, current_level, current_hourly_income, 
    total_invested, purchased_at, last_upgrade_at
  )
  VALUES (
    p_player_id, p_business_id, 1, v_business_income,
    v_business_price, now(), now()
  );
  
  PERFORM calculate_player_income(p_player_id);
  
  SELECT money INTO v_player_money FROM player_profiles WHERE id = p_player_id;
  
  RETURN QUERY SELECT true, 'Successfully purchased ' || v_business_name, v_player_money;
END;
$$;

-- Recreate upgrade_business
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
  v_cost_multiplier integer;
BEGIN
  SELECT money INTO v_player_money FROM player_profiles WHERE id = p_player_id;
  
  IF v_player_money IS NULL THEN
    RETURN QUERY SELECT false, 'Player not found', 0::bigint, 0::bigint;
    RETURN;
  END IF;
  
  SELECT pb.current_level, pb.current_hourly_income, b.name
  INTO v_current_level, v_current_income, v_business_name
  FROM player_businesses pb
  INNER JOIN businesses b ON b.id = pb.business_id
  WHERE pb.player_id = p_player_id AND pb.business_id = p_business_id;
  
  IF v_current_level IS NULL THEN
    RETURN QUERY SELECT false, 'You do not own this business', v_player_money, 0::bigint;
    RETURN;
  END IF;
  
  IF v_current_level >= 6 THEN
    RETURN QUERY SELECT false, 'Business is already at maximum level', v_player_money, v_current_income;
    RETURN;
  END IF;
  
  v_cost_multiplier := CASE v_current_level
    WHEN 1 THEN 30
    WHEN 2 THEN 60
    WHEN 3 THEN 120
    WHEN 4 THEN 180
    WHEN 5 THEN 240
    ELSE 30
  END;
  
  v_upgrade_cost := v_current_income * v_cost_multiplier;
  
  IF v_player_money < v_upgrade_cost THEN
    RETURN QUERY SELECT false, 'Not enough money to upgrade', v_player_money, v_current_income;
    RETURN;
  END IF;
  
  v_new_income := FLOOR(v_current_income * 1.25);
  
  UPDATE player_profiles SET money = money - v_upgrade_cost WHERE id = p_player_id;
  
  UPDATE player_businesses
  SET current_level = current_level + 1,
      current_hourly_income = v_new_income,
      total_invested = total_invested + v_upgrade_cost,
      last_upgrade_at = now()
  WHERE player_id = p_player_id AND business_id = p_business_id;
  
  PERFORM calculate_player_income(p_player_id);
  
  SELECT money INTO v_player_money FROM player_profiles WHERE id = p_player_id;
  
  RETURN QUERY SELECT true, 'Upgraded ' || v_business_name || ' to level ' || (v_current_level + 1), v_player_money, v_new_income;
END;
$$;

-- Recreate purchaseItem (house selection, car purchase)
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
  SELECT money INTO v_player_money FROM player_profiles WHERE id = p_player_id;
  
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
    
    -- Get updated balance (no change for houses)
    SELECT money INTO v_player_money FROM player_profiles WHERE id = p_player_id;
    
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
    SET money = money - v_item_price,
        selected_car_id = p_item_id
    WHERE id = p_player_id;
    
    -- Recalculate income (car maintenance will be applied)
    PERFORM calculate_player_income(p_player_id);
    
    -- Get updated balance
    SELECT money INTO v_player_money FROM player_profiles WHERE id = p_player_id;
    
    RETURN QUERY SELECT true, 'Successfully purchased ' || v_item_name, v_player_money;
    
  ELSE
    RETURN QUERY SELECT false, 'Invalid item type', v_player_money;
  END IF;
END;
$$;

-- ============================================================================
-- 6. RLS POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE investment_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_investments ENABLE ROW LEVEL SECURITY;

-- investment_properties: Public read (master data)
CREATE POLICY "Anyone can view investment properties"
  ON investment_properties FOR SELECT
  TO authenticated
  USING (true);

-- player_investments: Players can only see their own
CREATE POLICY "Players can view own investments"
  ON player_investments FOR SELECT
  TO authenticated
  USING (auth.uid() = player_id);

CREATE POLICY "Players can insert own investments"
  ON player_investments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = player_id);

CREATE POLICY "Players can update own investments"
  ON player_investments FOR UPDATE
  TO authenticated
  USING (auth.uid() = player_id)
  WITH CHECK (auth.uid() = player_id);

-- ============================================================================
-- 7. FIX EXISTING DATA
-- ============================================================================

-- Recalculate income for all existing players
DO $$
DECLARE
  player_record RECORD;
BEGIN
  FOR player_record IN SELECT id FROM player_profiles LOOP
    BEGIN
      PERFORM calculate_player_income(player_record.id);
    EXCEPTION WHEN OTHERS THEN
      -- Log error but continue with other players
      RAISE WARNING 'Failed to calculate income for player %: %', player_record.id, SQLERRM;
    END;
  END LOOP;
END $$;

-- ============================================================================
-- 8. DOCUMENTATION TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS income_expense_documentation (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL CHECK (category IN ('income', 'expense', 'calculation')),
  rule_name text NOT NULL,
  description text NOT NULL,
  formula text,
  example text,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Insert documentation
INSERT INTO income_expense_documentation (category, rule_name, description, formula, example, notes)
VALUES
  (
    'income',
    'Job Income',
    'Hourly income from the player''s active job. Only one job can be active at a time.',
    'job_income = jobs.hourly_income WHERE player_jobs.is_active = true',
    'Cashier job pays $1,400/hour',
    'When player changes job, the old job is deactivated and new job is activated. Income is recalculated immediately.'
  ),
  (
    'income',
    'Business Income',
    'Total hourly income from all businesses owned by the player. Each business can be upgraded up to level 6.',
    'business_income = SUM(player_businesses.current_hourly_income)',
    'Player owns 3 businesses earning $50, $65, $50 = $165/hour total',
    'Each business upgrade increases income by 25%. Upgrade costs increase with level (30x, 60x, 120x, 180x, 240x).'
  ),
  (
    'income',
    'Investment Income',
    'Total hourly rental income from all investment properties owned by the player. Properties can be upgraded up to level 6.',
    'investment_income = SUM(player_investments.current_rental_income)',
    'Player owns 5 investment properties earning $200, $300, $500, $600, $700 = $2,300/hour total',
    'Investment properties must be unlocked in sequential order. Each upgrade increases income by 25%.'
  ),
  (
    'expense',
    'House Rent Expense',
    'Hourly rent cost for the player''s current residence. Players select a house without purchasing it.',
    'house_rent_expense = houses.hourly_rent_cost WHERE id = selected_house_id',
    'Player lives in a 2+1 Apartment with $1,200/hour rent',
    'Houses are NOT purchased - players just select them and pay hourly rent. Better houses have higher rent but may unlock benefits.'
  ),
  (
    'expense',
    'Vehicle Expense',
    'Hourly maintenance and fuel cost for the player''s current vehicle.',
    'vehicle_expense = cars.hourly_maintenance_cost WHERE id = selected_car_id',
    'Player owns a BMW with $150/hour maintenance cost',
    'Vehicles ARE purchased (one-time payment) and then have ongoing hourly maintenance costs.'
  ),
  (
    'expense',
    'Other Expenses',
    'Placeholder for future expenses (food, entertainment, etc.)',
    'other_expenses = player_profiles.other_expenses',
    'Currently $0/hour',
    'Reserved for future game features.'
  ),
  (
    'calculation',
    'Gross Income',
    'Total income before expenses',
    'gross_income = job_income + business_income + investment_income',
    '$1,400 + $165 + $2,300 = $3,865/hour',
    'This is the total earning power before any costs.'
  ),
  (
    'calculation',
    'Total Expenses',
    'Sum of all hourly expenses',
    'total_expenses = house_rent_expense + vehicle_expense + other_expenses',
    '$1,200 + $150 + $0 = $1,350/hour',
    'These are ongoing costs that reduce net income.'
  ),
  (
    'calculation',
    'Net Hourly Income',
    'Final income after all expenses. This is what the player actually earns.',
    'hourly_income = gross_income - total_expenses (minimum 0)',
    '$3,865 - $1,350 = $2,515/hour',
    'This is the amount added to player money every hour. Cannot go below 0.'
  ),
  (
    'calculation',
    'Investment Upgrade Costs',
    'Cost to upgrade an investment property depends on current level',
    'Level 1→2: income × 30, Level 2→3: income × 60, Level 3→4: income × 120, Level 4→5: income × 180, Level 5→6: income × 240',
    'Investment earning $200/hour at level 1 costs $200 × 30 = $6,000 to upgrade to level 2',
    'Each upgrade increases rental income by 25%. Same formula applies to businesses.'
  ),
  (
    'calculation',
    'Sequential Unlocking',
    'Investment properties must be purchased in unlock_order sequence',
    'Can only purchase unlock_order N if player owns unlock_order (N-1)',
    'If player owns investments 1, 2, 3, they can only purchase investment 4 next',
    'Prevents players from jumping to high-tier investments. Same rule applies to businesses.'
  )
ON CONFLICT DO NOTHING;

-- Enable RLS on documentation
ALTER TABLE income_expense_documentation ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view documentation"
  ON income_expense_documentation FOR SELECT
  TO authenticated
  USING (true);