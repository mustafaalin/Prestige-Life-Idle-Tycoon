/*
  # Add Daily Claim Limits System

  1. New Columns
    - `last_claim_reset_date` (date) - Last date when daily claim counter was reset (UTC+0)
    - `daily_claimed_total` (bigint) - Total amount claimed today
    - `claim_locked_until` (timestamptz) - Timestamp when claim will be unlocked (8-hour cooldown)

  2. Changes
    - Update `claim_accumulated_money` function to enforce daily limits
    - Users can only claim up to their hourly_income amount per day
    - After reaching daily limit, 8-hour cooldown is applied
    - Daily counter resets at midnight UTC

  3. Business Rules
    - Maximum daily claim = hourly_income
    - Cooldown period = 8 hours after reaching limit
    - Counter resets daily at 00:00 UTC
    - All validations are server-side for security
*/

-- Add new columns to player_profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'player_profiles' AND column_name = 'last_claim_reset_date'
  ) THEN
    ALTER TABLE player_profiles ADD COLUMN last_claim_reset_date date DEFAULT CURRENT_DATE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'player_profiles' AND column_name = 'daily_claimed_total'
  ) THEN
    ALTER TABLE player_profiles ADD COLUMN daily_claimed_total bigint DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'player_profiles' AND column_name = 'claim_locked_until'
  ) THEN
    ALTER TABLE player_profiles ADD COLUMN claim_locked_until timestamptz;
  END IF;
END $$;

-- Drop the existing function
DROP FUNCTION IF EXISTS claim_accumulated_money(uuid, boolean);

-- Recreate the function with daily limit logic
CREATE OR REPLACE FUNCTION claim_accumulated_money(
  p_profile_id uuid,
  is_triple boolean DEFAULT false
)
RETURNS TABLE (
  id uuid,
  total_money numeric,
  lifetime_earnings numeric,
  last_claim_time timestamptz,
  hourly_income numeric,
  is_locked boolean,
  locked_until timestamptz,
  daily_claimed numeric,
  daily_limit numeric
)
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
  v_profile_id uuid;
  v_last_claim timestamptz;
  v_hourly_income numeric;
  v_current_money numeric;
  v_current_lifetime numeric;
  v_elapsed_minutes numeric;
  v_max_minutes numeric := 60;
  v_clamped_minutes numeric;
  v_income_rate numeric;
  v_accumulated numeric;
  v_final_amount numeric;
  v_last_reset_date date;
  v_daily_claimed numeric;
  v_claim_locked_until timestamptz;
  v_today_utc date;
  v_new_daily_total numeric;
  out_id uuid;
  out_total_money numeric;
  out_lifetime_earnings numeric;
  out_last_claim_time timestamptz;
  out_hourly_income numeric;
  out_is_locked boolean;
  out_locked_until timestamptz;
  out_daily_claimed numeric;
  out_daily_limit numeric;
BEGIN
  -- Validate that profile exists
  IF p_profile_id IS NULL THEN
    RETURN;
  END IF;

  v_profile_id := p_profile_id;
  v_today_utc := CURRENT_DATE;

  -- Get current profile data
  SELECT
    pp.last_claim_time,
    pp.hourly_income,
    pp.total_money,
    pp.lifetime_earnings,
    pp.last_claim_reset_date,
    pp.daily_claimed_total,
    pp.claim_locked_until
  INTO
    v_last_claim,
    v_hourly_income,
    v_current_money,
    v_current_lifetime,
    v_last_reset_date,
    v_daily_claimed,
    v_claim_locked_until
  FROM player_profiles pp
  WHERE pp.id = v_profile_id;

  -- If profile not found, return empty
  IF NOT FOUND THEN
    RETURN;
  END IF;

  -- Reset daily counter if it's a new day (UTC)
  IF v_last_reset_date IS NULL OR v_last_reset_date < v_today_utc THEN
    v_daily_claimed := 0;
    v_claim_locked_until := NULL;

    UPDATE player_profiles
    SET
      last_claim_reset_date = v_today_utc,
      daily_claimed_total = 0,
      claim_locked_until = NULL
    WHERE id = v_profile_id;
  END IF;

  -- Check if claim is locked
  IF v_claim_locked_until IS NOT NULL AND now() < v_claim_locked_until THEN
    -- Return current state with lock info
    out_id := v_profile_id;
    out_total_money := v_current_money;
    out_lifetime_earnings := v_current_lifetime;
    out_last_claim_time := v_last_claim;
    out_hourly_income := v_hourly_income;
    out_is_locked := true;
    out_locked_until := v_claim_locked_until;
    out_daily_claimed := v_daily_claimed;
    out_daily_limit := v_hourly_income;

    id := out_id;
    total_money := out_total_money;
    lifetime_earnings := out_lifetime_earnings;
    last_claim_time := out_last_claim_time;
    hourly_income := out_hourly_income;
    is_locked := out_is_locked;
    locked_until := out_locked_until;
    daily_claimed := out_daily_claimed;
    daily_limit := out_daily_limit;

    RETURN NEXT;
    RETURN;
  END IF;

  -- Calculate elapsed time in minutes
  v_elapsed_minutes := EXTRACT(EPOCH FROM (now() - v_last_claim)) / 60.0;

  -- Clamp to max minutes (60 minutes = 1 hour)
  v_clamped_minutes := LEAST(v_elapsed_minutes, v_max_minutes);

  -- Calculate accumulated money
  -- hourly_income / 2 is the rate per hour, divide by 60 for per minute
  v_income_rate := v_hourly_income / 2.0;
  v_accumulated := (v_income_rate / 60.0) * v_clamped_minutes;

  -- Round down to whole number
  v_accumulated := FLOOR(v_accumulated);

  -- If nothing to claim, return empty
  IF v_accumulated <= 0 THEN
    RETURN;
  END IF;

  -- Apply triple multiplier if requested
  IF is_triple THEN
    v_final_amount := v_accumulated * 3;
  ELSE
    v_final_amount := v_accumulated;
  END IF;

  -- Calculate what the new daily total would be
  v_new_daily_total := v_daily_claimed + v_final_amount;

  -- Check if this claim would exceed the daily limit
  IF v_new_daily_total > v_hourly_income THEN
    -- Cap the claim amount to not exceed the limit
    v_final_amount := v_hourly_income - v_daily_claimed;
    v_new_daily_total := v_hourly_income;

    -- If already at limit, return locked state
    IF v_final_amount <= 0 THEN
      out_id := v_profile_id;
      out_total_money := v_current_money;
      out_lifetime_earnings := v_current_lifetime;
      out_last_claim_time := v_last_claim;
      out_hourly_income := v_hourly_income;
      out_is_locked := true;
      out_locked_until := v_claim_locked_until;
      out_daily_claimed := v_daily_claimed;
      out_daily_limit := v_hourly_income;

      id := out_id;
      total_money := out_total_money;
      lifetime_earnings := out_lifetime_earnings;
      last_claim_time := out_last_claim_time;
      hourly_income := out_hourly_income;
      is_locked := out_is_locked;
      locked_until := out_locked_until;
      daily_claimed := out_daily_claimed;
      daily_limit := out_daily_limit;

      RETURN NEXT;
      RETURN;
    END IF;
  END IF;

  -- Determine if we need to set a lock (when reaching the limit)
  IF v_new_daily_total >= v_hourly_income THEN
    v_claim_locked_until := now() + interval '8 hours';
  ELSE
    v_claim_locked_until := NULL;
  END IF;

  -- Atomically update the profile and return new values
  UPDATE player_profiles pp
  SET
    total_money = pp.total_money + v_final_amount,
    lifetime_earnings = pp.lifetime_earnings + v_final_amount,
    last_claim_time = now(),
    daily_claimed_total = v_new_daily_total,
    claim_locked_until = v_claim_locked_until,
    last_claim_reset_date = v_today_utc
  WHERE pp.id = v_profile_id
  RETURNING
    pp.id,
    pp.total_money,
    pp.lifetime_earnings,
    pp.last_claim_time,
    pp.hourly_income,
    pp.claim_locked_until IS NOT NULL AND now() < pp.claim_locked_until,
    pp.claim_locked_until,
    pp.daily_claimed_total,
    pp.hourly_income
  INTO
    out_id,
    out_total_money,
    out_lifetime_earnings,
    out_last_claim_time,
    out_hourly_income,
    out_is_locked,
    out_locked_until,
    out_daily_claimed,
    out_daily_limit;

  -- Assign to return variables
  id := out_id;
  total_money := out_total_money;
  lifetime_earnings := out_lifetime_earnings;
  last_claim_time := out_last_claim_time;
  hourly_income := out_hourly_income;
  is_locked := out_is_locked;
  locked_until := out_locked_until;
  daily_claimed := out_daily_claimed;
  daily_limit := out_daily_limit;

  RETURN NEXT;
END;
$$;