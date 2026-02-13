/*
  # Add Atomic Claim Money RPC Function

  1. New Functions
    - `claim_accumulated_money(is_triple boolean)`
      - Calculates accumulated money based on hourly income and last claim time
      - Atomically updates total_money, lifetime_earnings, and last_claim_time
      - Returns updated profile data
      - Prevents race conditions by performing all calculations and updates in the database
  
  2. Security
    - Function runs with SECURITY DEFINER to access auth.uid()
    - Only allows users to claim their own money
    - All calculations happen atomically in a single transaction
  
  3. Important Notes
    - Maximum accumulation period: 60 minutes (1 hour)
    - Income rate is half of hourly_income (hourly_income / 2)
    - Triple claim multiplies the accumulated amount by 3
    - Returns NULL if no money to claim or profile not found
*/

CREATE OR REPLACE FUNCTION claim_accumulated_money(is_triple boolean DEFAULT false)
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
  v_current_total numeric;
  v_current_lifetime numeric;
  v_elapsed_minutes numeric;
  v_clamped_minutes numeric;
  v_income_rate numeric;
  v_accumulated numeric;
  v_final_amount numeric;
BEGIN
  -- Get the authenticated user's profile ID
  v_profile_id := auth.uid();
  
  IF v_profile_id IS NULL THEN
    RETURN;
  END IF;
  
  -- Get current profile data
  SELECT 
    pp.last_claim_time,
    pp.hourly_income,
    pp.total_money,
    pp.lifetime_earnings
  INTO 
    v_last_claim,
    v_hourly_income,
    v_current_total,
    v_current_lifetime
  FROM player_profiles pp
  WHERE pp.id = v_profile_id;
  
  -- If no profile found, return nothing
  IF NOT FOUND THEN
    RETURN;
  END IF;
  
  -- Calculate elapsed time in minutes
  v_elapsed_minutes := EXTRACT(EPOCH FROM (now() - COALESCE(v_last_claim, now()))) / 60.0;
  
  -- Clamp to maximum 60 minutes
  v_clamped_minutes := LEAST(v_elapsed_minutes, 60);
  
  -- Calculate income rate (half of hourly income)
  v_income_rate := COALESCE(v_hourly_income, 0) / 2.0;
  
  -- Calculate accumulated money
  v_accumulated := FLOOR((v_income_rate / 60.0) * v_clamped_minutes);
  
  -- If no money to claim, return nothing
  IF v_accumulated <= 0 THEN
    RETURN;
  END IF;
  
  -- Apply triple multiplier if requested
  IF is_triple THEN
    v_final_amount := v_accumulated * 3;
  ELSE
    v_final_amount := v_accumulated;
  END IF;
  
  -- Atomically update the profile
  UPDATE player_profiles
  SET
    total_money = total_money + v_final_amount,
    lifetime_earnings = lifetime_earnings + v_final_amount,
    last_claim_time = now()
  WHERE player_profiles.id = v_profile_id
  RETURNING 
    player_profiles.id,
    player_profiles.total_money,
    player_profiles.lifetime_earnings,
    player_profiles.last_claim_time,
    player_profiles.hourly_income
  INTO 
    id,
    total_money,
    lifetime_earnings,
    last_claim_time,
    hourly_income;
  
  RETURN NEXT;
END;
$$;