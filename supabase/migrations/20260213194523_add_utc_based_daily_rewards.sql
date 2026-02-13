/*
  # UTC-Based Daily Reward System

  ## Overview
  This migration converts the daily reward system from client-side time tracking
  to server-side UTC-based calendar day tracking. This ensures fair gameplay
  across all timezones and prevents time manipulation.

  ## Changes

  ### 1. New Columns in `game_stats` Table
  - `claimed_reward_days` (jsonb) - Array of reward day numbers (1-7) that have been claimed in current streak
    - Used to prevent claiming the same reward twice
    - Resets when streak breaks
  - `last_claim_date` (date) - The UTC calendar date of the last reward claim
    - Used to determine if player can claim today
    - Used to calculate if streak continues or breaks

  ### 2. Helper Function: `get_daily_reward_status`
  Returns the current status of daily rewards for a player:
  - Whether player can claim today
  - Current streak count
  - Which reward day (1-7) can be claimed next
  - What rewards are available (money, gems)

  Logic:
  - If last_claim_date = today (UTC), cannot claim (already claimed today)
  - If last_claim_date = yesterday (UTC), streak continues, can claim today
  - If last_claim_date < yesterday (UTC), streak resets to 1, can claim today
  - If last_claim_date IS NULL, first time claiming, streak = 1

  ### 3. Main Function: `claim_daily_reward`
  Atomically claims the daily reward and updates player state:
  - Validates that claim is allowed
  - Calculates correct streak and reward day
  - Adds money and gems to player profile
  - Updates streak, claim date, and claimed days list
  - Returns success status and reward details

  ## Reward Schedule (7-day cycle)
  - Day 1: $1,000
  - Day 2: $3,000
  - Day 3: $10,000
  - Day 4: $15,000 + 5 gems
  - Day 5: $25,000
  - Day 6: $50,000
  - Day 7: $100,000

  ## Security
  - All operations are server-side using database time
  - RLS policies remain unchanged
  - Atomic operations prevent race conditions
  - Prevents duplicate claims within same day
*/

-- Add new columns to game_stats table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'game_stats' AND column_name = 'claimed_reward_days'
  ) THEN
    ALTER TABLE game_stats ADD COLUMN claimed_reward_days jsonb DEFAULT '[]'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'game_stats' AND column_name = 'last_claim_date'
  ) THEN
    ALTER TABLE game_stats ADD COLUMN last_claim_date date;
  END IF;
END $$;

-- Create function to get daily reward status
CREATE OR REPLACE FUNCTION get_daily_reward_status(p_player_id uuid)
RETURNS TABLE (
  can_claim boolean,
  current_streak integer,
  next_reward_day integer,
  reward_money bigint,
  reward_gems integer,
  hours_until_reset integer
) AS $$
DECLARE
  v_stats game_stats;
  v_today_utc date;
  v_yesterday_utc date;
  v_days_since_claim integer;
  v_new_streak integer;
  v_claimed_days jsonb;
  v_next_day integer;
  v_tomorrow_utc timestamptz;
  v_seconds_until_reset integer;
BEGIN
  -- Get current UTC date
  v_today_utc := DATE(now() AT TIME ZONE 'UTC');
  v_yesterday_utc := v_today_utc - INTERVAL '1 day';

  -- Get player stats
  SELECT * INTO v_stats FROM game_stats WHERE game_stats.player_id = p_player_id;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  -- Calculate if player can claim today
  IF v_stats.last_claim_date = v_today_utc THEN
    -- Already claimed today
    can_claim := false;
    current_streak := v_stats.daily_login_streak;
    next_reward_day := ((current_streak - 1) % 7) + 1;
  ELSIF v_stats.last_claim_date = v_yesterday_utc THEN
    -- Claimed yesterday, streak continues
    can_claim := true;
    v_new_streak := v_stats.daily_login_streak + 1;
    current_streak := v_new_streak;
    next_reward_day := ((v_new_streak - 1) % 7) + 1;
  ELSIF v_stats.last_claim_date IS NULL THEN
    -- First time claiming
    can_claim := true;
    current_streak := 1;
    next_reward_day := 1;
  ELSE
    -- Missed a day, streak resets
    can_claim := true;
    current_streak := 1;
    next_reward_day := 1;
  END IF;

  -- Get reward amounts for next claimable day
  CASE next_reward_day
    WHEN 1 THEN reward_money := 1000; reward_gems := 0;
    WHEN 2 THEN reward_money := 3000; reward_gems := 0;
    WHEN 3 THEN reward_money := 10000; reward_gems := 0;
    WHEN 4 THEN reward_money := 15000; reward_gems := 5;
    WHEN 5 THEN reward_money := 25000; reward_gems := 0;
    WHEN 6 THEN reward_money := 50000; reward_gems := 0;
    WHEN 7 THEN reward_money := 100000; reward_gems := 0;
  END CASE;

  -- Calculate hours until next day (UTC midnight)
  v_tomorrow_utc := DATE(v_today_utc + INTERVAL '1 day') AT TIME ZONE 'UTC';
  v_seconds_until_reset := EXTRACT(EPOCH FROM (v_tomorrow_utc - (now() AT TIME ZONE 'UTC')))::integer;
  hours_until_reset := CEIL(v_seconds_until_reset / 3600.0)::integer;

  RETURN NEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to claim daily reward
CREATE OR REPLACE FUNCTION claim_daily_reward(p_player_id uuid)
RETURNS TABLE (
  success boolean,
  message text,
  new_streak integer,
  reward_day integer,
  money_earned bigint,
  gems_earned integer
) AS $$
DECLARE
  v_stats game_stats;
  v_profile player_profiles;
  v_today_utc date;
  v_yesterday_utc date;
  v_new_streak integer;
  v_reward_day integer;
  v_reward_money bigint;
  v_reward_gems integer;
  v_claimed_days jsonb;
BEGIN
  -- Get current UTC date
  v_today_utc := DATE(now() AT TIME ZONE 'UTC');
  v_yesterday_utc := v_today_utc - INTERVAL '1 day';

  -- Lock and get player stats
  SELECT * INTO v_stats
  FROM game_stats
  WHERE game_stats.player_id = p_player_id
  FOR UPDATE;

  IF NOT FOUND THEN
    success := false;
    message := 'Player stats not found';
    RETURN NEXT;
    RETURN;
  END IF;

  -- Check if already claimed today
  IF v_stats.last_claim_date = v_today_utc THEN
    success := false;
    message := 'Already claimed today';
    new_streak := v_stats.daily_login_streak;
    reward_day := ((v_stats.daily_login_streak - 1) % 7) + 1;
    money_earned := 0;
    gems_earned := 0;
    RETURN NEXT;
    RETURN;
  END IF;

  -- Calculate new streak
  IF v_stats.last_claim_date = v_yesterday_utc THEN
    -- Streak continues
    v_new_streak := v_stats.daily_login_streak + 1;
    v_claimed_days := v_stats.claimed_reward_days;
  ELSIF v_stats.last_claim_date IS NULL THEN
    -- First time
    v_new_streak := 1;
    v_claimed_days := '[]'::jsonb;
  ELSE
    -- Streak broken (missed a day)
    v_new_streak := 1;
    v_claimed_days := '[]'::jsonb;
  END IF;

  -- Calculate reward day (1-7 cycle)
  v_reward_day := ((v_new_streak - 1) % 7) + 1;

  -- Get reward amounts
  CASE v_reward_day
    WHEN 1 THEN v_reward_money := 1000; v_reward_gems := 0;
    WHEN 2 THEN v_reward_money := 3000; v_reward_gems := 0;
    WHEN 3 THEN v_reward_money := 10000; v_reward_gems := 0;
    WHEN 4 THEN v_reward_money := 15000; v_reward_gems := 5;
    WHEN 5 THEN v_reward_money := 25000; v_reward_gems := 0;
    WHEN 6 THEN v_reward_money := 50000; v_reward_gems := 0;
    WHEN 7 THEN v_reward_money := 100000; v_reward_gems := 0;
  END CASE;

  -- Update player profile with rewards
  UPDATE player_profiles
  SET
    total_money = total_money + v_reward_money,
    lifetime_earnings = lifetime_earnings + v_reward_money,
    gems = gems + v_reward_gems
  WHERE id = p_player_id;

  -- Add current day to claimed days list
  v_claimed_days := jsonb_set(
    v_claimed_days,
    ARRAY[jsonb_array_length(v_claimed_days)::text],
    to_jsonb(v_reward_day)
  );

  -- Update game stats
  UPDATE game_stats
  SET
    daily_login_streak = v_new_streak,
    last_claim_date = v_today_utc,
    last_daily_reward = now(),
    claimed_reward_days = v_claimed_days,
    updated_at = now()
  WHERE player_id = p_player_id;

  -- Return success
  success := true;
  message := 'Reward claimed successfully';
  new_streak := v_new_streak;
  reward_day := v_reward_day;
  money_earned := v_reward_money;
  gems_earned := v_reward_gems;

  RETURN NEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;