/*
  # Fix Security and Performance Issues - Part 1

  This migration addresses security and performance concerns:

  ## 1. Add Missing Foreign Key Indexes
  ## 2. Remove Unused Indexes
  ## 3. Fix RLS Policies
  ## 4. Optimize Auth Function Calls in RLS
  ## 5. Drop functions for recreation in part 2
*/

-- =====================================================
-- 1. ADD MISSING FOREIGN KEY INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_player_profiles_current_job_id 
  ON player_profiles(current_job_id);

CREATE INDEX IF NOT EXISTS idx_player_profiles_selected_car_id 
  ON player_profiles(selected_car_id);

CREATE INDEX IF NOT EXISTS idx_player_profiles_selected_character_id 
  ON player_profiles(selected_character_id);

CREATE INDEX IF NOT EXISTS idx_player_profiles_selected_house_id 
  ON player_profiles(selected_house_id);

CREATE INDEX IF NOT EXISTS idx_player_reset_history_player_id 
  ON player_reset_history(player_id);

CREATE INDEX IF NOT EXISTS idx_player_transactions_package_id 
  ON player_transactions(package_id);

-- =====================================================
-- 2. REMOVE UNUSED INDEXES
-- =====================================================

DROP INDEX IF EXISTS idx_player_profiles_device_id;
DROP INDEX IF EXISTS idx_player_profiles_auth_user_id;
DROP INDEX IF EXISTS idx_player_transactions_status;
DROP INDEX IF EXISTS idx_player_businesses_business_id;
DROP INDEX IF EXISTS idx_player_jobs_player_job_id;

-- =====================================================
-- 3. FIX RLS POLICIES - game_stats
-- =====================================================

DROP POLICY IF EXISTS "Public can insert stats" ON game_stats;
DROP POLICY IF EXISTS "Public can update stats" ON game_stats;

CREATE POLICY "Users can insert own stats"
  ON game_stats
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (player_id = auth.uid());

CREATE POLICY "Users can update own stats"
  ON game_stats
  FOR UPDATE
  TO authenticated, anon
  USING (player_id = auth.uid())
  WITH CHECK (player_id = auth.uid());

-- =====================================================
-- 4. FIX RLS POLICIES - player_businesses
-- =====================================================

DROP POLICY IF EXISTS "Allow anon users to delete own businesses" ON player_businesses;
DROP POLICY IF EXISTS "Allow anon users to insert own businesses" ON player_businesses;
DROP POLICY IF EXISTS "Allow anon users to update own businesses" ON player_businesses;

CREATE POLICY "Users can delete own businesses"
  ON player_businesses
  FOR DELETE
  TO anon
  USING (player_id = auth.uid());

CREATE POLICY "Users can insert own businesses"
  ON player_businesses
  FOR INSERT
  TO anon
  WITH CHECK (player_id = auth.uid());

CREATE POLICY "Users can update own businesses"
  ON player_businesses
  FOR UPDATE
  TO anon
  USING (player_id = auth.uid())
  WITH CHECK (player_id = auth.uid());

-- =====================================================
-- 5. FIX RLS POLICIES - player_jobs
-- =====================================================

DROP POLICY IF EXISTS "Public can insert own job records" ON player_jobs;
DROP POLICY IF EXISTS "Public can update own job records" ON player_jobs;

CREATE POLICY "Users can insert own job records"
  ON player_jobs
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (player_id = auth.uid());

CREATE POLICY "Users can update own job records"
  ON player_jobs
  FOR UPDATE
  TO authenticated, anon
  USING (player_id = auth.uid())
  WITH CHECK (player_id = auth.uid());

-- =====================================================
-- 6. FIX RLS POLICIES - player_profiles
-- =====================================================

DROP POLICY IF EXISTS "Anyone can delete their device profile" ON player_profiles;
DROP POLICY IF EXISTS "Anyone can update their device profile" ON player_profiles;

CREATE POLICY "Users can delete own profile"
  ON player_profiles
  FOR DELETE
  TO authenticated, anon
  USING (id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON player_profiles
  FOR UPDATE
  TO authenticated, anon
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- =====================================================
-- 7. FIX RLS POLICIES - player_purchases
-- =====================================================

DROP POLICY IF EXISTS "Public can insert purchases" ON player_purchases;

CREATE POLICY "Users can insert own purchases"
  ON player_purchases
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (player_id = auth.uid());

-- =====================================================
-- 8. FIX RLS POLICIES - player_reset_history
-- =====================================================

DROP POLICY IF EXISTS "Users can insert own reset history" ON player_reset_history;

CREATE POLICY "Users can insert own reset history"
  ON player_reset_history
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (player_id = auth.uid());

-- =====================================================
-- 9. OPTIMIZE AUTH FUNCTION CALLS IN RLS
-- =====================================================

DROP POLICY IF EXISTS "Players can view own transactions" ON player_transactions;
DROP POLICY IF EXISTS "Players can create own transactions" ON player_transactions;

CREATE POLICY "Players can view own transactions"
  ON player_transactions
  FOR SELECT
  TO authenticated, anon
  USING (player_id = (SELECT auth.uid()));

CREATE POLICY "Players can create own transactions"
  ON player_transactions
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (player_id = (SELECT auth.uid()));

-- =====================================================
-- 10. DROP FUNCTIONS FOR RECREATION
-- =====================================================

DROP FUNCTION IF EXISTS get_money_packages();
DROP FUNCTION IF EXISTS get_gem_packages();
DROP FUNCTION IF EXISTS create_purchase_transaction(uuid, uuid, text, numeric);
DROP FUNCTION IF EXISTS complete_demo_purchase(uuid, uuid);
DROP FUNCTION IF EXISTS get_player_businesses(uuid);
DROP FUNCTION IF EXISTS reset_player_progress(uuid);
DROP FUNCTION IF EXISTS purchase_business(uuid, uuid);
DROP FUNCTION IF EXISTS upgrade_business(uuid, uuid);
DROP FUNCTION IF EXISTS get_all_businesses();
DROP FUNCTION IF EXISTS get_daily_reward_status(uuid);
DROP FUNCTION IF EXISTS claim_daily_reward(uuid);