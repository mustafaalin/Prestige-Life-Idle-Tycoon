/*
  # Add Ad Watching System

  1. New Columns
    - `last_ad_watch_time` (timestamptz) - Last time user watched an ad

  2. New Function
    - `claim_ad_reward` - Claims reward for watching an ad
    - Gives half of hourly_income as reward
    - 5-minute cooldown between ad watches
    - Updates total_money and lifetime_earnings atomically

  3. Business Rules
    - Reward amount = hourly_income / 2
    - Cooldown = 5 minutes between watches
    - All validations are server-side for security
*/

-- Add new column to player_profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'player_profiles' AND column_name = 'last_ad_watch_time'
  ) THEN
    ALTER TABLE player_profiles ADD COLUMN last_ad_watch_time timestamptz;
  END IF;
END $$;

-- Create claim_ad_reward function
CREATE OR REPLACE FUNCTION claim_ad_reward(
  p_profile_id uuid
)
RETURNS TABLE (
  id uuid,
  total_money numeric,
  lifetime_earnings numeric,
  last_ad_watch_time timestamptz,
  reward_amount numeric,
  can_watch boolean,
  seconds_until_next numeric
)
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
  v_profile_id uuid;
  v_last_watch timestamptz;
  v_hourly_income numeric;
  v_current_money numeric;
  v_current_lifetime numeric;
  v_reward_amount numeric;
  v_cooldown_minutes numeric := 5;
  v_elapsed_minutes numeric;
  out_id uuid;
  out_total_money numeric;
  out_lifetime_earnings numeric;
  out_last_ad_watch_time timestamptz;
  out_reward_amount numeric;
  out_can_watch boolean;
  out_seconds_until_next numeric;
BEGIN
  -- Validate that profile exists
  IF p_profile_id IS NULL THEN
    RETURN;
  END IF;

  v_profile_id := p_profile_id;

  -- Get current profile data
  SELECT
    pp.last_ad_watch_time,
    pp.hourly_income,
    pp.total_money,
    pp.lifetime_earnings
  INTO
    v_last_watch,
    v_hourly_income,
    v_current_money,
    v_current_lifetime
  FROM player_profiles pp
  WHERE pp.id = v_profile_id;

  -- If profile not found, return empty
  IF NOT FOUND THEN
    RETURN;
  END IF;

  -- Calculate reward amount (half of hourly income)
  v_reward_amount := FLOOR(v_hourly_income / 2.0);

  -- Check if cooldown has passed
  IF v_last_watch IS NOT NULL THEN
    v_elapsed_minutes := EXTRACT(EPOCH FROM (now() - v_last_watch)) / 60.0;
    
    IF v_elapsed_minutes < v_cooldown_minutes THEN
      -- Still in cooldown, return current state with time remaining
      out_id := v_profile_id;
      out_total_money := v_current_money;
      out_lifetime_earnings := v_current_lifetime;
      out_last_ad_watch_time := v_last_watch;
      out_reward_amount := v_reward_amount;
      out_can_watch := false;
      out_seconds_until_next := CEIL((v_cooldown_minutes - v_elapsed_minutes) * 60);

      id := out_id;
      total_money := out_total_money;
      lifetime_earnings := out_lifetime_earnings;
      last_ad_watch_time := out_last_ad_watch_time;
      reward_amount := out_reward_amount;
      can_watch := out_can_watch;
      seconds_until_next := out_seconds_until_next;

      RETURN NEXT;
      RETURN;
    END IF;
  END IF;

  -- Cooldown has passed or first watch, give reward
  UPDATE player_profiles pp
  SET
    total_money = pp.total_money + v_reward_amount,
    lifetime_earnings = pp.lifetime_earnings + v_reward_amount,
    last_ad_watch_time = now()
  WHERE pp.id = v_profile_id
  RETURNING
    pp.id,
    pp.total_money,
    pp.lifetime_earnings,
    pp.last_ad_watch_time,
    v_reward_amount,
    false,
    v_cooldown_minutes * 60
  INTO
    out_id,
    out_total_money,
    out_lifetime_earnings,
    out_last_ad_watch_time,
    out_reward_amount,
    out_can_watch,
    out_seconds_until_next;

  -- Assign to return variables
  id := out_id;
  total_money := out_total_money;
  lifetime_earnings := out_lifetime_earnings;
  last_ad_watch_time := out_last_ad_watch_time;
  reward_amount := out_reward_amount;
  can_watch := out_can_watch;
  seconds_until_next := out_seconds_until_next;

  RETURN NEXT;
END;
$$;