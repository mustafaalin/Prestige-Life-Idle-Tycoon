/*
  # Business Management System

  ## Overview
  Comprehensive business management system allowing players to purchase and upgrade 40 different businesses,
  from small local shops to large industrial operations. Each business generates passive hourly income
  and can be upgraded 5 times (Level 1-6) with increasing costs and returns.

  ## 1. New Tables
  
  ### `businesses`
  Master table containing all available businesses with base statistics
  - `id` (uuid, primary key)
  - `name` (text) - Display name of the business
  - `description` (text) - Short description
  - `category` (text) - Either 'small' or 'large'
  - `base_price` (bigint) - Initial purchase cost
  - `base_hourly_income` (bigint) - Starting hourly income at level 1
  - `unlock_order` (integer) - Sequential unlock order (1-40)
  - `icon_name` (text) - Lucide React icon name
  - `created_at` (timestamptz)

  ### `player_businesses`
  Tracks which businesses each player owns and their upgrade status
  - `id` (uuid, primary key)
  - `player_id` (uuid, foreign key to auth.users)
  - `business_id` (uuid, foreign key to businesses)
  - `is_unlocked` (boolean) - Whether player owns this business
  - `current_level` (integer) - Current upgrade level (1-6)
  - `current_hourly_income` (bigint) - Current income after upgrades
  - `total_invested` (bigint) - Total money invested (purchase + all upgrades)
  - `purchased_at` (timestamptz)
  - `last_upgrade_at` (timestamptz)
  - `created_at` (timestamptz)
  - UNIQUE constraint on (player_id, business_id)

  ## 2. Database Functions

  ### `purchase_business(p_business_id uuid)`
  Handles business purchase with atomic operations:
  - Validates sufficient balance
  - Checks sequential unlock (previous business must be owned)
  - Prevents duplicate purchases
  - Deducts cost from total_money
  - Creates player_businesses record
  - Updates player hourly_income

  ### `upgrade_business(p_business_id uuid)`
  Handles business upgrades with dynamic pricing:
  - Validates ownership and max level (< 6)
  - Calculates upgrade cost based on current income:
    - Level 2: income × 30
    - Level 3: income × 60
    - Level 4: income × 120
    - Level 5: income × 180
    - Level 6: income × 240
  - Calculates new income (current × 1.25, 25% increase)
  - Updates all relevant fields atomically
  - Updates player hourly_income

  ### `get_player_businesses(p_player_id uuid)`
  Returns all businesses owned by player with upgrade information

  ### `get_all_businesses(p_player_id uuid)`
  Returns all businesses with player's ownership status and unlock eligibility

  ## 3. Seed Data

  ### Small Businesses (20 items, unlock_order 1-20)
  Starting from $8,000 (Flower Shop, 45/hr) to $210,000 (Cleaning Service, 700/hr)
  
  ### Large Businesses (20 items, unlock_order 21-40)
  Starting from $600,000 (Logistics Warehouse, 900/hr) to $90,000,000 (Tech Startup, 180,000/hr)

  ## 4. Security
  - RLS enabled on all tables
  - Policies restrict access to authenticated users
  - Players can only view/modify their own business data
  - Business master data is readable by all authenticated users

  ## 5. Upgrade Economics Example (Tech Startup)
  - Level 1: $90M purchase, 180K/hr income
  - Level 2: $5.4M upgrade, 225K/hr income (+25%)
  - Level 3: $13.5M upgrade, 281K/hr income (+25%)
  - Level 4: $33.75M upgrade, 351K/hr income (+25%)
  - Level 5: $63.28M upgrade, 439K/hr income (+25%)
  - Level 6: $105.47M upgrade, 549K/hr income (+25%)
  - Total investment: ~$311M, Final income: 3x base income
*/

-- Create businesses master table
CREATE TABLE IF NOT EXISTS businesses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  category text NOT NULL CHECK (category IN ('small', 'large')),
  base_price bigint NOT NULL CHECK (base_price > 0),
  base_hourly_income bigint NOT NULL CHECK (base_hourly_income > 0),
  unlock_order integer NOT NULL UNIQUE CHECK (unlock_order > 0),
  icon_name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create player businesses table
CREATE TABLE IF NOT EXISTS player_businesses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  is_unlocked boolean DEFAULT true NOT NULL,
  current_level integer DEFAULT 1 NOT NULL CHECK (current_level >= 1 AND current_level <= 6),
  current_hourly_income bigint NOT NULL CHECK (current_hourly_income > 0),
  total_invested bigint NOT NULL CHECK (total_invested > 0),
  purchased_at timestamptz DEFAULT now(),
  last_upgrade_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(player_id, business_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_businesses_unlock_order ON businesses(unlock_order);
CREATE INDEX IF NOT EXISTS idx_businesses_category ON businesses(category);
CREATE INDEX IF NOT EXISTS idx_player_businesses_player_id ON player_businesses(player_id);
CREATE INDEX IF NOT EXISTS idx_player_businesses_business_id ON player_businesses(business_id);

-- Enable RLS
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_businesses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for businesses (read-only for all authenticated users)
CREATE POLICY "Authenticated users can view all businesses"
  ON businesses FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for player_businesses
CREATE POLICY "Players can view own businesses"
  ON player_businesses FOR SELECT
  TO authenticated
  USING (auth.uid() = player_id);

CREATE POLICY "Players can insert own businesses"
  ON player_businesses FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = player_id);

CREATE POLICY "Players can update own businesses"
  ON player_businesses FOR UPDATE
  TO authenticated
  USING (auth.uid() = player_id)
  WITH CHECK (auth.uid() = player_id);

CREATE POLICY "Players can delete own businesses"
  ON player_businesses FOR DELETE
  TO authenticated
  USING (auth.uid() = player_id);

-- Function to purchase a business
CREATE OR REPLACE FUNCTION purchase_business(p_business_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_player_id uuid;
  v_business_price bigint;
  v_business_income bigint;
  v_business_unlock_order integer;
  v_player_balance bigint;
  v_previous_owned boolean;
  v_already_owned boolean;
BEGIN
  -- Get player ID
  v_player_id := auth.uid();
  IF v_player_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
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
    WHERE player_id = v_player_id AND business_id = p_business_id
  ) INTO v_already_owned;

  IF v_already_owned THEN
    RETURN json_build_object('success', false, 'error', 'Already own this business');
  END IF;

  -- Check sequential unlock (skip for first business)
  IF v_business_unlock_order > 1 THEN
    SELECT EXISTS(
      SELECT 1 FROM player_businesses pb
      JOIN businesses b ON pb.business_id = b.id
      WHERE pb.player_id = v_player_id AND b.unlock_order = v_business_unlock_order - 1
    ) INTO v_previous_owned;

    IF NOT v_previous_owned THEN
      RETURN json_build_object('success', false, 'error', 'Must purchase previous business first');
    END IF;
  END IF;

  -- Get player balance
  SELECT total_money INTO v_player_balance
  FROM player_profiles
  WHERE id = v_player_id;

  IF v_player_balance < v_business_price THEN
    RETURN json_build_object('success', false, 'error', 'Insufficient balance');
  END IF;

  -- Perform purchase (atomic transaction)
  -- Deduct money
  UPDATE player_profiles
  SET total_money = total_money - v_business_price,
      hourly_income = hourly_income + v_business_income
  WHERE id = v_player_id;

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
    v_player_id,
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

-- Function to upgrade a business
CREATE OR REPLACE FUNCTION upgrade_business(p_business_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_player_id uuid;
  v_current_level integer;
  v_current_income bigint;
  v_total_invested bigint;
  v_player_balance bigint;
  v_upgrade_cost bigint;
  v_new_income bigint;
  v_cost_multiplier integer;
BEGIN
  -- Get player ID
  v_player_id := auth.uid();
  IF v_player_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  -- Get current business state
  SELECT current_level, current_hourly_income, total_invested
  INTO v_current_level, v_current_income, v_total_invested
  FROM player_businesses
  WHERE player_id = v_player_id AND business_id = p_business_id;

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
  WHERE id = v_player_id;

  IF v_player_balance < v_upgrade_cost THEN
    RETURN json_build_object('success', false, 'error', 'Insufficient balance');
  END IF;

  -- Perform upgrade (atomic transaction)
  -- Deduct money and update hourly income
  UPDATE player_profiles
  SET total_money = total_money - v_upgrade_cost,
      hourly_income = hourly_income - v_current_income + v_new_income
  WHERE id = v_player_id;

  -- Update business
  UPDATE player_businesses
  SET current_level = current_level + 1,
      current_hourly_income = v_new_income,
      total_invested = total_invested + v_upgrade_cost,
      last_upgrade_at = now()
  WHERE player_id = v_player_id AND business_id = p_business_id;

  RETURN json_build_object(
    'success', true,
    'new_level', v_current_level + 1,
    'new_income', v_new_income,
    'upgrade_cost', v_upgrade_cost,
    'new_balance', v_player_balance - v_upgrade_cost
  );
END;
$$;

-- Function to get player's businesses with details
CREATE OR REPLACE FUNCTION get_player_businesses(p_player_id uuid)
RETURNS TABLE (
  business_id uuid,
  business_name text,
  business_category text,
  business_icon text,
  unlock_order integer,
  current_level integer,
  current_hourly_income bigint,
  total_invested bigint,
  next_upgrade_cost bigint,
  next_upgrade_income bigint,
  can_upgrade boolean,
  purchased_at timestamptz,
  last_upgrade_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    b.id,
    b.name,
    b.category,
    b.icon_name,
    b.unlock_order,
    pb.current_level,
    pb.current_hourly_income,
    pb.total_invested,
    CASE
      WHEN pb.current_level < 6 THEN
        pb.current_hourly_income * (CASE pb.current_level
          WHEN 1 THEN 30
          WHEN 2 THEN 60
          WHEN 3 THEN 120
          WHEN 4 THEN 180
          WHEN 5 THEN 240
        END)
      ELSE 0
    END AS next_upgrade_cost,
    CASE
      WHEN pb.current_level < 6 THEN FLOOR(pb.current_hourly_income * 1.25)
      ELSE pb.current_hourly_income
    END AS next_upgrade_income,
    pb.current_level < 6 AS can_upgrade,
    pb.purchased_at,
    pb.last_upgrade_at
  FROM player_businesses pb
  JOIN businesses b ON pb.business_id = b.id
  WHERE pb.player_id = p_player_id
  ORDER BY b.unlock_order;
END;
$$;

-- Function to get all businesses with player ownership status
CREATE OR REPLACE FUNCTION get_all_businesses(p_player_id uuid)
RETURNS TABLE (
  business_id uuid,
  business_name text,
  business_description text,
  business_category text,
  business_icon text,
  base_price bigint,
  base_hourly_income bigint,
  unlock_order integer,
  is_owned boolean,
  can_unlock boolean,
  current_level integer,
  current_hourly_income bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    b.id,
    b.name,
    b.description,
    b.category,
    b.icon_name,
    b.base_price,
    b.base_hourly_income,
    b.unlock_order,
    pb.id IS NOT NULL AS is_owned,
    (b.unlock_order = 1 OR EXISTS(
      SELECT 1 FROM player_businesses pb2
      JOIN businesses b2 ON pb2.business_id = b2.id
      WHERE pb2.player_id = p_player_id AND b2.unlock_order = b.unlock_order - 1
    )) AS can_unlock,
    COALESCE(pb.current_level, 1) AS current_level,
    COALESCE(pb.current_hourly_income, b.base_hourly_income) AS current_hourly_income
  FROM businesses b
  LEFT JOIN player_businesses pb ON b.id = pb.business_id AND pb.player_id = p_player_id
  ORDER BY b.unlock_order;
END;
$$;

-- Seed data: Small Businesses (1-20)
INSERT INTO businesses (name, description, category, base_price, base_hourly_income, unlock_order, icon_name) VALUES
  ('Flower Shop', 'Small local flower shop', 'small', 8000, 45, 1, 'Flower2'),
  ('Coffee Shop', 'Cozy neighborhood cafe', 'small', 10000, 55, 2, 'Coffee'),
  ('Barber Shop', 'Traditional barber shop', 'small', 12000, 65, 3, 'Scissors'),
  ('Bakery', 'Fresh bread and pastries', 'small', 15000, 75, 4, 'CakeSlice'),
  ('Grocery Mini Mart', 'Small convenience store', 'small', 18000, 90, 5, 'ShoppingBasket'),
  ('Sandwich Shop', 'Quick lunch spot', 'small', 22000, 105, 6, 'Sandwich'),
  ('Car Wash', 'Automated car wash', 'small', 28000, 130, 7, 'Car'),
  ('Mobile Phone Repair', 'Device repair shop', 'small', 35000, 155, 8, 'Smartphone'),
  ('Tailor Shop', 'Custom clothing alterations', 'small', 42000, 175, 9, 'Shirt'),
  ('Pet Grooming Salon', 'Professional pet care', 'small', 50000, 195, 10, 'PawPrint'),
  ('Laundry Service', 'Full service laundry', 'small', 60000, 220, 11, 'Sparkles'),
  ('Juice Bar', 'Fresh pressed juices', 'small', 70000, 250, 12, 'Apple'),
  ('Ice Cream Shop', 'Premium ice cream', 'small', 82000, 285, 13, 'IceCream'),
  ('Bookstore', 'Independent bookstore', 'small', 95000, 320, 14, 'BookOpen'),
  ('Gift Shop', 'Unique gifts and souvenirs', 'small', 110000, 360, 15, 'Gift'),
  ('Vape Shop', 'Vaping products store', 'small', 125000, 410, 16, 'Wind'),
  ('Shoe Repair Shop', 'Professional shoe repair', 'small', 140000, 460, 17, 'Hammer'),
  ('Beauty Salon', 'Full service beauty salon', 'small', 160000, 520, 18, 'Sparkle'),
  ('Hardware Store', 'Tools and supplies', 'small', 185000, 600, 19, 'Wrench'),
  ('Cleaning Service', 'Commercial cleaning', 'small', 210000, 700, 20, 'Waves')
ON CONFLICT (unlock_order) DO NOTHING;

-- Seed data: Large Businesses (21-40)
INSERT INTO businesses (name, description, category, base_price, base_hourly_income, unlock_order, icon_name) VALUES
  ('Logistics Warehouse', 'Large distribution center', 'large', 600000, 900, 21, 'Warehouse'),
  ('Manufacturing Factory', 'General manufacturing', 'large', 900000, 1300, 22, 'Factory'),
  ('Bottled Water Plant', 'Water bottling facility', 'large', 1200000, 1800, 23, 'Droplet'),
  ('Dairy Processing Plant', 'Milk and cheese production', 'large', 1600000, 2500, 24, 'Milk'),
  ('Textile Factory', 'Fabric manufacturing', 'large', 2100000, 3400, 25, 'Shirt'),
  ('Furniture Factory', 'Furniture production', 'large', 2800000, 4600, 26, 'Armchair'),
  ('Electronics Assembly Plant', 'Electronics manufacturing', 'large', 3600000, 6200, 27, 'Cpu'),
  ('Plastic Injection Factory', 'Plastic parts production', 'large', 4700000, 8300, 28, 'Container'),
  ('Steel Fabrication Plant', 'Steel manufacturing', 'large', 6200000, 11000, 29, 'Layers'),
  ('Automotive Parts Factory', 'Car parts production', 'large', 8100000, 14500, 30, 'Cog'),
  ('Food Processing Factory', 'Packaged food production', 'large', 10500000, 19000, 31, 'Package'),
  ('Pharmaceutical Plant', 'Medicine manufacturing', 'large', 13500000, 24000, 32, 'Pill'),
  ('Recycling Plant', 'Industrial recycling', 'large', 17000000, 30000, 33, 'Recycle'),
  ('Cement Plant', 'Cement production', 'large', 21500000, 38000, 34, 'Building'),
  ('Solar Panel Factory', 'Solar panel manufacturing', 'large', 27000000, 48000, 35, 'Zap'),
  ('Construction Company', 'Large construction firm', 'large', 34000000, 62000, 36, 'HardHat'),
  ('Supermarket Chain', 'Regional supermarket chain', 'large', 43000000, 80000, 37, 'ShoppingCart'),
  ('Hotel', 'Luxury hotel chain', 'large', 55000000, 105000, 38, 'Hotel'),
  ('Restaurant Franchise', 'Multi-location restaurant', 'large', 70000000, 135000, 39, 'UtensilsCrossed'),
  ('Tech Startup', 'Software company', 'large', 90000000, 180000, 40, 'Rocket')
ON CONFLICT (unlock_order) DO NOTHING;