/*
  # Cleanup and Consolidate claim_accumulated_money Function

  1. Problem
    - Multiple versions of claim_accumulated_money exist in the database:
      * claim_accumulated_money(is_triple boolean) - AUTH-based, returns TABLE
      * claim_accumulated_money(p_player_id uuid) - Legacy, returns JSONB
      * claim_accumulated_money(p_player_id uuid, p_is_triple boolean) - Current, returns JSONB
    - Only the third version is used by the frontend
    - Other versions are migration artifacts causing confusion

  2. Changes
    - Drop all three existing versions
    - Create single consolidated version that matches frontend expectations
    - Keep exact function signature: (p_player_id uuid, p_is_triple boolean)
    - Keep exact return type: JSONB
    - Keep all existing business logic (formulas, limits, security)

  3. Function Signature
    - Parameters: p_player_id uuid, p_is_triple boolean DEFAULT false
    - Returns: JSONB with structure:
      * success: boolean
      * claimed_amount: bigint (if success)
      * new_total: bigint (if success)
      * error: text (if not success)

  4. Business Logic (unchanged)
    - Maximum accumulation: 60 minutes (1 hour)
    - Base rate per minute: (hourly_income / 2) / 60
    - Triple multiplier: 3x for ad-based claims
    - Daily claim limit: 50 claims per day
    - Minimum claim: Must have accumulated money > 0

  5. Security
    - SECURITY DEFINER with secure search_path
    - Row-level locking with FOR UPDATE
    - UTC-based daily limit tracking
*/

-- Drop all existing versions of claim_accumulated_money
DROP FUNCTION IF EXISTS claim_accumulated_money(is_triple boolean);
DROP FUNCTION IF EXISTS claim_accumulated_money(p_player_id uuid);
DROP FUNCTION IF EXISTS claim_accumulated_money(p_player_id uuid, p_is_triple boolean);

-- Create single consolidated version
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

  -- Check daily claim limit (UTC-based)
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

  -- Apply triple multiplier if requested (for ad-based claims)
  IF p_is_triple THEN
    v_final_amount := v_accumulated_money * 3;
  ELSE
    v_final_amount := v_accumulated_money;
  END IF;

  -- Calculate new total
  v_new_total_money := v_player_record.total_money + v_final_amount;

  -- Update player profile atomically
  UPDATE player_profiles
  SET
    total_money = v_new_total_money,
    last_claim_time = now()
  WHERE id = p_player_id;

  -- Return success response
  RETURN jsonb_build_object(
    'success', true,
    'claimed_amount', v_final_amount,
    'new_total', v_new_total_money
  );
END;
$$;
