/*
  # Add In-App Purchase System
  
  1. New Tables
    - `purchase_packages`
      - Stores available purchasable packages (money and gems)
      - Includes dynamic pricing based on hourly income
      - Supports platform-specific product IDs for Stripe/Google Play/Apple
    
    - `player_transactions`
      - Tracks all purchase attempts and completions
      - Provides idempotency via unique transaction IDs
      - Logs payment provider details for reconciliation
      - Supports transaction states: pending, completed, failed, refunded
  
  2. RPC Functions
    - `create_purchase_transaction`: Creates a pending transaction record
    - `complete_demo_purchase`: Atomically completes demo purchases and credits player account
    - `get_money_packages`: Returns available money packages with dynamic amounts
    - `get_gem_packages`: Returns available gem packages
  
  3. Security
    - Enable RLS on all new tables
    - Players can only view their own transactions
    - Only authenticated/anonymous users can create transactions
    - Server-side validation prevents direct money/gem manipulation
    - Unique constraint on provider_transaction_id prevents double-spending
  
  4. Notes
    - Demo mode uses UUID-based transaction IDs
    - Production mode will use provider transaction IDs
    - All monetary operations are atomic to prevent partial updates
    - Transaction logging enables audit trail and dispute resolution
*/

-- Create purchase_packages table
CREATE TABLE IF NOT EXISTS purchase_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  package_type text NOT NULL CHECK (package_type IN ('money', 'gem')),
  base_amount bigint NOT NULL DEFAULT 0,
  amount_multiplier integer DEFAULT NULL, -- for money packages (e.g., 10x, 50x hourly income)
  gem_amount integer DEFAULT NULL, -- for gem packages
  price_usd numeric(10,2) NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  is_popular boolean DEFAULT false,
  is_best_value boolean DEFAULT false,
  platform_product_id text DEFAULT NULL, -- Stripe/Google Play/Apple product ID
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create player_transactions table
CREATE TABLE IF NOT EXISTS player_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid NOT NULL REFERENCES player_profiles(id) ON DELETE CASCADE,
  package_id uuid NOT NULL REFERENCES purchase_packages(id),
  transaction_status text NOT NULL CHECK (transaction_status IN ('pending', 'completed', 'failed', 'refunded')) DEFAULT 'pending',
  payment_provider text DEFAULT NULL, -- 'demo', 'stripe', 'google_play', 'apple'
  provider_transaction_id text DEFAULT NULL,
  amount_paid numeric(10,2) DEFAULT NULL,
  currency text DEFAULT 'USD',
  items_received jsonb DEFAULT NULL, -- {money: 1000, gems: 0}
  error_message text DEFAULT NULL,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz DEFAULT NULL,
  UNIQUE(provider_transaction_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_purchase_packages_type ON purchase_packages(package_type, display_order);
CREATE INDEX IF NOT EXISTS idx_player_transactions_player ON player_transactions(player_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_player_transactions_status ON player_transactions(transaction_status);

-- Enable RLS
ALTER TABLE purchase_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for purchase_packages
CREATE POLICY "Anyone can view active packages"
  ON purchase_packages FOR SELECT
  USING (is_active = true);

-- RLS Policies for player_transactions
CREATE POLICY "Players can view own transactions"
  ON player_transactions FOR SELECT
  USING (
    player_id IN (
      SELECT id FROM player_profiles 
      WHERE (device_id::text = (current_setting('request.jwt.claims', true)::json->>'device_id'))
      OR auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Players can create own transactions"
  ON player_transactions FOR INSERT
  WITH CHECK (
    player_id IN (
      SELECT id FROM player_profiles 
      WHERE (device_id::text = (current_setting('request.jwt.claims', true)::json->>'device_id'))
      OR auth_user_id = auth.uid()
    )
  );

-- Insert default money packages (dynamic based on hourly income)
INSERT INTO purchase_packages (package_type, base_amount, amount_multiplier, price_usd, display_order, is_popular, is_best_value)
VALUES 
  ('money', 0, 10, 0.99, 1, false, false),
  ('money', 0, 50, 2.99, 2, true, false),
  ('money', 0, 100, 4.99, 3, false, false),
  ('money', 0, 500, 9.99, 4, false, true),
  ('money', 0, 1000, 14.99, 5, false, false)
ON CONFLICT DO NOTHING;

-- Insert default gem packages
INSERT INTO purchase_packages (package_type, base_amount, gem_amount, price_usd, display_order, is_popular, is_best_value)
VALUES 
  ('gem', 0, 20, 0.99, 1, false, false),
  ('gem', 0, 50, 1.99, 2, true, false),
  ('gem', 0, 100, 2.99, 3, false, false),
  ('gem', 0, 250, 3.99, 4, false, true)
ON CONFLICT DO NOTHING;

-- RPC: Get money packages with calculated amounts based on player's hourly income
CREATE OR REPLACE FUNCTION get_money_packages(p_player_id uuid)
RETURNS TABLE (
  id uuid,
  amount_multiplier integer,
  calculated_amount bigint,
  price_usd numeric,
  display_order integer,
  is_popular boolean,
  is_best_value boolean
) 
SECURITY DEFINER
AS $$
DECLARE
  v_hourly_income bigint;
BEGIN
  -- Get player's hourly income
  SELECT hourly_income INTO v_hourly_income
  FROM player_profiles
  WHERE player_profiles.id = p_player_id;
  
  -- Return packages with calculated amounts
  RETURN QUERY
  SELECT 
    pp.id,
    pp.amount_multiplier,
    (pp.amount_multiplier * COALESCE(v_hourly_income, 100))::bigint as calculated_amount,
    pp.price_usd,
    pp.display_order,
    pp.is_popular,
    pp.is_best_value
  FROM purchase_packages pp
  WHERE pp.package_type = 'money' AND pp.is_active = true
  ORDER BY pp.display_order;
END;
$$ LANGUAGE plpgsql;

-- RPC: Get gem packages
CREATE OR REPLACE FUNCTION get_gem_packages()
RETURNS TABLE (
  id uuid,
  gem_amount integer,
  price_usd numeric,
  display_order integer,
  is_popular boolean,
  is_best_value boolean
) 
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pp.id,
    pp.gem_amount,
    pp.price_usd,
    pp.display_order,
    pp.is_popular,
    pp.is_best_value
  FROM purchase_packages pp
  WHERE pp.package_type = 'gem' AND pp.is_active = true
  ORDER BY pp.display_order;
END;
$$ LANGUAGE plpgsql;

-- RPC: Create purchase transaction
CREATE OR REPLACE FUNCTION create_purchase_transaction(
  p_player_id uuid,
  p_package_id uuid,
  p_payment_provider text,
  p_provider_transaction_id text DEFAULT NULL
)
RETURNS uuid
SECURITY DEFINER
AS $$
DECLARE
  v_transaction_id uuid;
BEGIN
  -- Validate player exists
  IF NOT EXISTS (SELECT 1 FROM player_profiles WHERE id = p_player_id) THEN
    RAISE EXCEPTION 'Player not found';
  END IF;
  
  -- Validate package exists
  IF NOT EXISTS (SELECT 1 FROM purchase_packages WHERE id = p_package_id AND is_active = true) THEN
    RAISE EXCEPTION 'Package not found or inactive';
  END IF;
  
  -- Create transaction record
  INSERT INTO player_transactions (
    player_id,
    package_id,
    transaction_status,
    payment_provider,
    provider_transaction_id
  ) VALUES (
    p_player_id,
    p_package_id,
    'pending',
    p_payment_provider,
    p_provider_transaction_id
  )
  RETURNING id INTO v_transaction_id;
  
  RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql;

-- RPC: Complete demo purchase (atomic operation)
CREATE OR REPLACE FUNCTION complete_demo_purchase(
  p_transaction_id uuid,
  p_player_id uuid
)
RETURNS jsonb
SECURITY DEFINER
AS $$
DECLARE
  v_package record;
  v_transaction record;
  v_money_to_add bigint := 0;
  v_gems_to_add integer := 0;
  v_hourly_income bigint;
  v_result jsonb;
BEGIN
  -- Get transaction details
  SELECT * INTO v_transaction
  FROM player_transactions
  WHERE id = p_transaction_id AND player_id = p_player_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Transaction not found';
  END IF;
  
  -- Check if already completed
  IF v_transaction.transaction_status != 'pending' THEN
    RAISE EXCEPTION 'Transaction already processed: %', v_transaction.transaction_status;
  END IF;
  
  -- Get package details
  SELECT * INTO v_package
  FROM purchase_packages
  WHERE id = v_transaction.package_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Package not found';
  END IF;
  
  -- Calculate amounts based on package type
  IF v_package.package_type = 'money' THEN
    -- Get player's hourly income
    SELECT hourly_income INTO v_hourly_income
    FROM player_profiles
    WHERE id = p_player_id;
    
    v_money_to_add := v_package.amount_multiplier * COALESCE(v_hourly_income, 100);
  ELSIF v_package.package_type = 'gem' THEN
    v_gems_to_add := v_package.gem_amount;
  END IF;
  
  -- Atomically update player balance and transaction status
  UPDATE player_profiles
  SET 
    total_money = total_money + v_money_to_add,
    gems = gems + v_gems_to_add
  WHERE id = p_player_id;
  
  -- Update transaction to completed
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
  
  -- Return result
  v_result := jsonb_build_object(
    'success', true,
    'money_added', v_money_to_add,
    'gems_added', v_gems_to_add,
    'transaction_id', p_transaction_id
  );
  
  RETURN v_result;
  
EXCEPTION WHEN OTHERS THEN
  -- Update transaction to failed
  UPDATE player_transactions
  SET 
    transaction_status = 'failed',
    error_message = SQLERRM
  WHERE id = p_transaction_id;
  
  RAISE;
END;
$$ LANGUAGE plpgsql;