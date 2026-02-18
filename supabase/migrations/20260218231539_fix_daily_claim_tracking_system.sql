/*
  # Fix Daily Claim Tracking and Limit System

  1. Problem
    - claim_accumulated_money function does NOT update daily_claimed_total column
    - Wrong daily limit check using COUNT(*) instead of actual claimed amount
    - Missing daily reset mechanism (should reset at UTC midnight)
    - Missing 8-hour lock mechanism when daily limit is reached
    - x3 reward logic not properly tracked (should only add original amount to daily_claimed_total)

  2. How the System Should Work
    
    **Daily Limit**:
    - Equals hourly_income (e.g., if hourly_income = 1000, daily limit = 1000)
    - When limit is reached, 8-hour lock starts
    
    **Accumulated**:
    - Maximum accumulation: hourly_income / 2 in 60 minutes
    - Example: hourly_income = 1000 → max accumulated = 500 in 60 minutes
    
    **Claim Rules**:
    - Normal claim: accumulated amount added to both total_money and daily_claimed_total
    - x3 claim (ad reward): 3x accumulated added to total_money, but only original amount added to daily_claimed_total
    - This is a reward for watching ads
    
    **Daily Reset**:
    - Every UTC midnight: daily_claimed_total resets to 0
    - last_claim_reset_date updates to current date
    - claim_locked_until clears

  3. Changes
    - Drop existing claim_accumulated_money function
    - Create new version with proper daily tracking logic:
      * Daily reset check at function start
      * 8-hour lock check
      * Proper daily limit check: daily_claimed_total + accumulated >= hourly_income
      * Update daily_claimed_total with original amount (not x3)
      * Set claim_locked_until when limit is reached
    
  4. Function Logic Flow
    1. Check if daily reset needed (last_claim_reset_date < CURRENT_DATE)
    2. Check if 8-hour lock is active (claim_locked_until > now())
    3. Calculate accumulated amount (max 60 minutes)
    4. Check daily limit: daily_claimed_total + accumulated >= hourly_income
    5. Update player:
       - total_money += (accumulated * (x3 ? 3 : 1))
       - daily_claimed_total += accumulated (original amount only)
       - last_claim_time = now()
       - If limit reached: claim_locked_until = now() + 8 hours
    6. Return success with claimed_amount and new_total

  5. Security
    - SECURITY DEFINER with secure search_path
    - Row-level locking with FOR UPDATE
    - UTC-based daily tracking
    - Proper validation at each step
*/

-- Drop existing function
DROP FUNCTION IF EXISTS claim_accumulated_money(p_player_id uuid, p_is_triple boolean);

-- Create new version with proper daily tracking
CREATE OR REPLACE FUNCTION claim_accumulated_money(
  p_player_id uuid,
  p_is_triple boolean DEFAULT false
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_player_record record;
  v_time_difference interval;
  v_minutes_passed numeric;
  v_max_minutes numeric := 60; -- Maximum 1 hour accumulation
  v_clamped_minutes numeric;
  v_base_rate_per_minute numeric;
  v_accumulated_money bigint;
  v_final_amount bigint;
  v_new_total_money bigint;
  v_current_date date;
  v_lock_hours interval := interval '8 hours';
BEGIN
  -- Lock player record for atomic update
  SELECT * INTO v_player_record
  FROM player_profiles
  WHERE id = p_player_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Player not found'
    );
  END IF;

  -- Get current UTC date
  v_current_date := CURRENT_DATE;

  -- Check if daily reset is needed
  IF v_player_record.last_claim_reset_date IS NULL OR v_player_record.last_claim_reset_date < v_current_date THEN
    -- Reset daily tracking
    UPDATE player_profiles
    SET
      daily_claimed_total = 0,
      last_claim_reset_date = v_current_date,
      claim_locked_until = NULL
    WHERE id = p_player_id;
    
    -- Refresh player record after reset
    SELECT * INTO v_player_record
    FROM player_profiles
    WHERE id = p_player_id;
  END IF;

  -- Check if 8-hour lock is active
  IF v_player_record.claim_locked_until IS NOT NULL AND v_player_record.claim_locked_until > now() THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Daily limit reached. Try again later.'
    );
  END IF;

  -- Calculate time difference in minutes
  v_time_difference := now() - v_player_record.last_claim_time;
  v_minutes_passed := EXTRACT(EPOCH FROM v_time_difference) / 60;

  -- Clamp to maximum minutes (60 = 1 hour)
  v_clamped_minutes := LEAST(v_minutes_passed, v_max_minutes);

  -- Calculate base rate per minute: (hourly_income / 2) / 60
  -- This gives half of hourly income per hour, divided into per-minute rate
  v_base_rate_per_minute := (v_player_record.hourly_income / 2.0) / 60.0;

  -- Calculate accumulated money
  v_accumulated_money := FLOOR(v_base_rate_per_minute * v_clamped_minutes)::bigint;

  IF v_accumulated_money <= 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'No money to claim yet'
    );
  END IF;

  -- Check daily limit BEFORE claiming
  -- If claiming would exceed daily limit, reject the claim
  IF (COALESCE(v_player_record.daily_claimed_total, 0) + v_accumulated_money) > v_player_record.hourly_income THEN
    -- Calculate remaining claimable amount
    DECLARE
      v_remaining bigint := v_player_record.hourly_income - COALESCE(v_player_record.daily_claimed_total, 0);
    BEGIN
      IF v_remaining <= 0 THEN
        RETURN jsonb_build_object(
          'success', false,
          'error', 'Daily limit reached. Try again later.'
        );
      ELSE
        -- Allow partial claim up to limit
        v_accumulated_money := v_remaining;
      END IF;
    END;
  END IF;

  -- Apply triple multiplier if requested (for ad-based claims)
  -- Only affects total_money, NOT daily_claimed_total (this is the reward)
  IF p_is_triple THEN
    v_final_amount := v_accumulated_money * 3;
  ELSE
    v_final_amount := v_accumulated_money;
  END IF;

  -- Calculate new total
  v_new_total_money := v_player_record.total_money + v_final_amount;

  -- Check if this claim will reach the daily limit
  IF (COALESCE(v_player_record.daily_claimed_total, 0) + v_accumulated_money) >= v_player_record.hourly_income THEN
    -- Set 8-hour lock
    UPDATE player_profiles
    SET
      total_money = v_new_total_money,
      daily_claimed_total = COALESCE(daily_claimed_total, 0) + v_accumulated_money,
      last_claim_time = now(),
      claim_locked_until = now() + v_lock_hours
    WHERE id = p_player_id;
  ELSE
    -- Normal update without lock
    UPDATE player_profiles
    SET
      total_money = v_new_total_money,
      daily_claimed_total = COALESCE(daily_claimed_total, 0) + v_accumulated_money,
      last_claim_time = now()
    WHERE id = p_player_id;
  END IF;

  -- Return success response
  RETURN jsonb_build_object(
    'success', true,
    'claimed_amount', v_final_amount,
    'new_total', v_new_total_money
  );
END;
$$;
