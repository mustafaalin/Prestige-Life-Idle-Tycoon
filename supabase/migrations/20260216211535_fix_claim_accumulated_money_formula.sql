/*
  # Fix Claim Accumulated Money Formula

  1. Problem
    - The claim_accumulated_money function was using `hourly_income * hours` instead of `(hourly_income / 2) * hours`
    - This caused players to receive 2x the expected amount (or 6x with triple multiplier instead of 3x)
    - Maximum wait time was 24 hours, should be 1 hour for idle earnings cap

  2. Changes
    - Fix formula: Use `(hourly_income / 2)` as the base rate per hour
    - Change maximum accumulation time from 24 hours to 1 hour (60 minutes)
    - Use minute-based calculation for more precision
    - Ensure triple multiplier works correctly (3x, not 6x)

  3. Formula Details
    - Base rate per minute: (hourly_income / 2) / 60
    - Maximum minutes: 60 (1 hour)
    - Accumulated = (base_rate_per_minute * minutes_passed)
    - Triple claim = accumulated * 3

  4. Example (hourly_income = 1000)
    - After 1 hour wait:
      - Normal claim: 500 (1000/2 * 1 hour)
      - Triple claim: 1500 (500 * 3)
*/

-- Drop and recreate claim_accumulated_money with correct formula
DROP FUNCTION IF EXISTS claim_accumulated_money(uuid, boolean);

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
  v_max_claims_per_day int := 50;
  v_claim_count int;
BEGIN
  -- Lock player record
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

  -- Check daily claim limit
  SELECT COUNT(*) INTO v_claim_count
  FROM player_profiles
  WHERE id = p_player_id
    AND last_claim_time >= date_trunc('day', now() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC'
    AND last_claim_time < date_trunc('day', now() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC' + interval '1 day';

  IF v_claim_count >= v_max_claims_per_day THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Daily claim limit reached'
    );
  END IF;

  -- Calculate time difference in minutes
  v_time_difference := now() - v_player_record.last_claim_time;
  v_minutes_passed := EXTRACT(EPOCH FROM v_time_difference) / 60;

  -- Clamp to maximum minutes (60 = 1 hour)
  v_clamped_minutes := LEAST(v_minutes_passed, v_max_minutes);

  -- Calculate base rate per minute: (hourly_income / 2) / 60
  -- hourly_income / 2 = income per hour
  -- divide by 60 = income per minute
  v_base_rate_per_minute := (v_player_record.hourly_income / 2.0) / 60.0;

  -- Calculate accumulated money
  v_accumulated_money := FLOOR(v_base_rate_per_minute * v_clamped_minutes)::bigint;

  IF v_accumulated_money <= 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'No money to claim yet'
    );
  END IF;

  -- Apply triple multiplier if requested (for ad-based claims)
  IF p_is_triple THEN
    v_final_amount := v_accumulated_money * 3;
  ELSE
    v_final_amount := v_accumulated_money;
  END IF;

  v_new_total_money := v_player_record.total_money + v_final_amount;

  -- Update player
  UPDATE player_profiles
  SET
    total_money = v_new_total_money,
    last_claim_time = now()
  WHERE id = p_player_id;

  RETURN jsonb_build_object(
    'success', true,
    'claimed_amount', v_final_amount,
    'new_total', v_new_total_money
  );
END;
$$;
