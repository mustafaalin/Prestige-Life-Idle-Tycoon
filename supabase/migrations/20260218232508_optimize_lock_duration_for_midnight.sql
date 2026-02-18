/*
  # Optimize Lock Duration for UTC Midnight

  1. Problem
    - When daily limit is reached near end of day (e.g., 23:00), user is locked for full 8 hours
    - This causes lock to extend into next day unnecessarily
    - Better UX: lock until next UTC midnight instead of fixed 8 hours

  2. Solution
    - Calculate time until next UTC midnight: (CURRENT_DATE + INTERVAL '1 day')
    - Calculate 8 hours from now: (now() + INTERVAL '8 hours')
    - Use whichever comes first: LEAST(8_hours, midnight)
    
  3. Examples
    - 23:00 UTC limit reached → Lock until 00:00 (1 hour) instead of 8 hours
    - 16:00 UTC limit reached → Lock for 8 hours (doesn't cross midnight)
    - 17:00 UTC limit reached → Lock until 00:00 (7 hours) instead of 8 hours

  4. Changes
    - Update claim_accumulated_money function
    - Replace fixed 8-hour lock with smart lock duration
    - Only affects line 184: claim_locked_until calculation
*/

-- Drop existing function
DROP FUNCTION IF EXISTS claim_accumulated_money(p_player_id uuid, p_is_triple boolean);

-- Create updated version with optimized lock duration
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
    -- Set smart lock: minimum of 8 hours OR until next UTC midnight
    -- This prevents unnecessarily long locks when limit is reached near end of day
    UPDATE player_profiles
    SET
      total_money = v_new_total_money,
      daily_claimed_total = COALESCE(daily_claimed_total, 0) + v_accumulated_money,
      last_claim_time = now(),
      claim_locked_until = LEAST(now() + INTERVAL '8 hours', (CURRENT_DATE + INTERVAL '1 day')::timestamp with time zone)
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