/*
  # Fix claim_accumulated_money Function - Variable Name Conflict

  1. Changes
    - Drop existing function
    - Recreate with proper variable naming to avoid ambiguity
    - Change RETURNING variables to have unique names (out_*)
  
  2. Fix
    - Resolves column reference ambiguity error
    - Ensures UPDATE statement works correctly
*/

-- Drop the existing function
DROP FUNCTION IF EXISTS claim_accumulated_money(uuid, boolean);

-- Recreate the function with fixed variable names
CREATE OR REPLACE FUNCTION claim_accumulated_money(
  p_profile_id uuid,
  is_triple boolean DEFAULT false
)
RETURNS TABLE (
  id uuid,
  total_money numeric,
  lifetime_earnings numeric,
  last_claim_time timestamptz,
  hourly_income numeric
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
  out_id uuid;
  out_total_money numeric;
  out_lifetime_earnings numeric;
  out_last_claim_time timestamptz;
  out_hourly_income numeric;
BEGIN
  -- Validate that profile exists
  IF p_profile_id IS NULL THEN
    RETURN;
  END IF;
  
  v_profile_id := p_profile_id;
  
  -- Get current profile data
  SELECT 
    pp.last_claim_time,
    pp.hourly_income,
    pp.total_money,
    pp.lifetime_earnings
  INTO
    v_last_claim,
    v_hourly_income,
    v_current_money,
    v_current_lifetime
  FROM player_profiles pp
  WHERE pp.id = v_profile_id;
  
  -- If profile not found, return empty
  IF NOT FOUND THEN
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
  
  -- Atomically update the profile and return new values
  UPDATE player_profiles pp
  SET
    total_money = pp.total_money + v_final_amount,
    lifetime_earnings = pp.lifetime_earnings + v_final_amount,
    last_claim_time = now()
  WHERE pp.id = v_profile_id
  RETURNING 
    pp.id,
    pp.total_money,
    pp.lifetime_earnings,
    pp.last_claim_time,
    pp.hourly_income
  INTO 
    out_id,
    out_total_money,
    out_lifetime_earnings,
    out_last_claim_time,
    out_hourly_income;
  
  -- Assign to return variables
  id := out_id;
  total_money := out_total_money;
  lifetime_earnings := out_lifetime_earnings;
  last_claim_time := out_last_claim_time;
  hourly_income := out_hourly_income;
  
  RETURN NEXT;
END;
$$;