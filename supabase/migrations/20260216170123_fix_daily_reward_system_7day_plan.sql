/*
  # Fix Daily Reward System - Restore 7-Day Reward Plan

  ## Problem
  The daily reward system was inconsistent between migrations:
  - Original system used 7-day special reward plan with UTC date tracking
  - Later migration changed to simple streak multiplier
  - Frontend expects 7-day plan with hours_until_reset field
  - Response format mismatch (TABLE vs JSONB)

  ## Solution
  1. Restore 7-day special reward plan ($1K, $3K, $7K, $15K, $30K, $60K, $100K)
  2. Use UTC-based date tracking with last_claim_date
  3. Return TABLE format for frontend compatibility
  4. Add hours_until_reset calculation
  5. Fix next_reward_day to cycle 1-7

  ## Changes
  - Drop and recreate get_daily_reward_status function
  - Drop and recreate claim_daily_reward function
*/

-- =====================================================
-- 1. FIX get_daily_reward_status FUNCTION
-- =====================================================

DROP FUNCTION IF EXISTS get_daily_reward_status(uuid);

CREATE OR REPLACE FUNCTION get_daily_reward_status(p_player_id uuid)
RETURNS TABLE (
  can_claim boolean,
  current_streak int,
  next_reward_day int,
  hours_until_reset numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_stats record;
  v_today_utc date;
  v_last_claim_utc date;
  v_can_claim boolean;
  v_next_reward_day int;
  v_hours_until_reset numeric;
BEGIN
  -- Get current date in UTC
  v_today_utc := DATE(now() AT TIME ZONE 'UTC');
  
  -- Get player stats
  SELECT * INTO v_stats
  FROM game_stats
  WHERE player_id = p_player_id;

  -- If stats not found, return default values
  IF NOT FOUND THEN
    RETURN QUERY SELECT 
      true::boolean,
      0::int,
      1::int,
      24.0::numeric;
    RETURN;
  END IF;

  -- Get last claim date
  v_last_claim_utc := v_stats.last_claim_date;

  -- Check if can claim (never claimed before OR last claim was before today)
  v_can_claim := (v_last_claim_utc IS NULL OR v_last_claim_utc < v_today_utc);

  -- Calculate next reward day (1-7 cycling)
  IF v_stats.daily_login_streak >= 7 THEN
    v_next_reward_day := 7;  -- Stay at day 7 for maximum reward
  ELSE
    v_next_reward_day := v_stats.daily_login_streak + 1;
  END IF;

  -- Calculate hours until reset (hours until next UTC midnight)
  v_hours_until_reset := EXTRACT(EPOCH FROM (
    date_trunc('day', now() AT TIME ZONE 'UTC') + interval '1 day' - (now() AT TIME ZONE 'UTC')
  )) / 3600;

  -- Return result
  RETURN QUERY SELECT 
    v_can_claim,
    v_stats.daily_login_streak,
    v_next_reward_day,
    v_hours_until_reset;
END;
$$;

-- =====================================================
-- 2. FIX claim_daily_reward FUNCTION
-- =====================================================

DROP FUNCTION IF EXISTS claim_daily_reward(uuid);

CREATE OR REPLACE FUNCTION claim_daily_reward(p_player_id uuid)
RETURNS TABLE (
  success boolean,
  message text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_stats record;
  v_today_utc date;
  v_last_claim_utc date;
  v_can_claim boolean;
  v_new_streak int;
  v_reward_amount bigint;
  v_reward_day int;
  v_reward_amounts bigint[] := ARRAY[1000, 3000, 7000, 15000, 30000, 60000, 100000];
BEGIN
  -- Get current date in UTC
  v_today_utc := DATE(now() AT TIME ZONE 'UTC');
  
  -- Get player stats with lock
  SELECT * INTO v_stats
  FROM game_stats
  WHERE player_id = p_player_id
  FOR UPDATE;

  -- If stats not found, return error
  IF NOT FOUND THEN
    RETURN QUERY SELECT 
      false::boolean,
      'Player stats not found'::text;
    RETURN;
  END IF;

  -- Get last claim date
  v_last_claim_utc := v_stats.last_claim_date;

  -- Check if can claim
  v_can_claim := (v_last_claim_utc IS NULL OR v_last_claim_utc < v_today_utc);

  IF NOT v_can_claim THEN
    RETURN QUERY SELECT 
      false::boolean,
      'Daily reward already claimed today'::text;
    RETURN;
  END IF;

  -- Calculate new streak
  IF v_last_claim_utc IS NULL OR v_last_claim_utc < v_today_utc - interval '1 day' THEN
    -- First claim or streak broken
    v_new_streak := 1;
  ELSIF v_last_claim_utc = v_today_utc - interval '1 day' THEN
    -- Consecutive day
    IF v_stats.daily_login_streak >= 7 THEN
      v_new_streak := 7;  -- Stay at day 7
    ELSE
      v_new_streak := v_stats.daily_login_streak + 1;
    END IF;
  ELSE
    -- Should not happen, but handle it
    v_new_streak := 1;
  END IF;

  -- Get reward amount based on streak
  v_reward_day := LEAST(v_new_streak, 7);
  v_reward_amount := v_reward_amounts[v_reward_day];

  -- Update player money
  UPDATE player_profiles
  SET total_money = total_money + v_reward_amount,
      lifetime_earnings = lifetime_earnings + v_reward_amount
  WHERE id = p_player_id;

  -- Update game stats
  UPDATE game_stats
  SET 
    daily_login_streak = v_new_streak,
    last_claim_date = v_today_utc,
    last_daily_reward = now()
  WHERE player_id = p_player_id;

  -- Return success
  RETURN QUERY SELECT 
    true::boolean,
    format('Claimed $%s for day %s!', v_reward_amount, v_reward_day)::text;
END;
$$;