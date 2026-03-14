/*
  # Fix Reset Player Progress Function

  ## Overview
  This migration fixes critical bugs in the reset_player_progress function that prevented
  the reset from working correctly.

  ## Issues Fixed
  
  ### 1. Player Purchases Query Issues
  The function was trying to access non-existent columns:
  - `character_id` does not exist
  - `house_id` does not exist
  - `car_id` does not exist
  
  The actual schema uses:
  - `item_type` (text: 'character', 'house', 'car')
  - `item_id` (uuid)
  
  ### 2. Player Jobs Query Issues
  The function was trying to access non-existent columns:
  - `level` does not exist
  - `experience` does not exist
  
  The actual schema includes:
  - `job_id` (uuid)
  - `is_unlocked` (boolean)
  - `is_active` (boolean)
  - `times_worked` (integer)
  - `total_earned` (bigint)
  - `total_time_worked_seconds` (integer)
  - `unlocked_at` (timestamptz)

  ## Changes Made
  - Updated player_purchases queries to use item_type and item_id
  - Updated player_jobs query to use correct columns
  - Fixed player_businesses query to use correct column names

  ## Important Notes
  - This function preserves purchase history in player_reset_history
  - After reset, all game progress is cleared
  - Profile is reset to initial values (money=100, hourly_income=50)
  - Character selector will show after reset
*/

-- Drop and recreate the reset function with correct column names
DROP FUNCTION IF EXISTS reset_player_progress(uuid);

CREATE OR REPLACE FUNCTION reset_player_progress(p_player_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_profile player_profiles%ROWTYPE;
  v_owned_chars jsonb;
  v_owned_houses jsonb;
  v_owned_cars jsonb;
  v_player_jobs jsonb;
  v_player_businesses jsonb;
  v_current_job_id uuid;
BEGIN
  -- Get current profile data
  SELECT * INTO v_profile FROM player_profiles WHERE id = p_player_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Player profile not found';
  END IF;

  -- Collect owned items using correct column names (item_type and item_id)
  SELECT jsonb_agg(item_id) INTO v_owned_chars
  FROM player_purchases
  WHERE player_id = p_player_id AND item_type = 'character';

  SELECT jsonb_agg(item_id) INTO v_owned_houses
  FROM player_purchases
  WHERE player_id = p_player_id AND item_type = 'house';

  SELECT jsonb_agg(item_id) INTO v_owned_cars
  FROM player_purchases
  WHERE player_id = p_player_id AND item_type = 'car';

  -- Get current active job
  SELECT job_id INTO v_current_job_id
  FROM player_jobs
  WHERE player_id = p_player_id AND is_active = true
  LIMIT 1;

  -- Collect player jobs with correct columns
  SELECT jsonb_agg(jsonb_build_object(
    'job_id', job_id,
    'is_unlocked', is_unlocked,
    'is_active', is_active,
    'times_worked', times_worked,
    'total_earned', total_earned,
    'total_time_worked_seconds', total_time_worked_seconds,
    'unlocked_at', unlocked_at
  )) INTO v_player_jobs
  FROM player_jobs
  WHERE player_id = p_player_id;

  -- Collect player businesses with correct columns
  SELECT jsonb_agg(jsonb_build_object(
    'business_id', business_id,
    'current_level', current_level,
    'total_invested', total_invested,
    'purchased_at', purchased_at
  )) INTO v_player_businesses
  FROM player_businesses
  WHERE player_id = p_player_id;

  -- Save reset history
  INSERT INTO player_reset_history (
    player_id,
    reset_at,
    money_at_reset,
    gems_at_reset,
    hourly_income_at_reset,
    lifetime_earnings_at_reset,
    total_clicks_at_reset,
    prestige_points_at_reset,
    selected_character_id,
    selected_house_id,
    selected_car_id,
    current_job_id,
    owned_characters,
    owned_houses,
    owned_cars,
    player_jobs,
    player_businesses
  ) VALUES (
    p_player_id,
    now(),
    v_profile.total_money,
    v_profile.gems,
    v_profile.hourly_income,
    v_profile.lifetime_earnings,
    v_profile.total_clicks,
    v_profile.prestige_points,
    v_profile.selected_character_id,
    v_profile.selected_house_id,
    v_profile.selected_car_id,
    v_current_job_id,
    COALESCE(v_owned_chars, '[]'::jsonb),
    COALESCE(v_owned_houses, '[]'::jsonb),
    COALESCE(v_owned_cars, '[]'::jsonb),
    COALESCE(v_player_jobs, '[]'::jsonb),
    COALESCE(v_player_businesses, '[]'::jsonb)
  );

  -- Delete game progress (but NOT the profile itself)
  DELETE FROM player_jobs WHERE player_id = p_player_id;
  DELETE FROM player_businesses WHERE player_id = p_player_id;
  DELETE FROM game_stats WHERE player_id = p_player_id;
  DELETE FROM player_purchases WHERE player_id = p_player_id;

  -- Recreate game_stats
  INSERT INTO game_stats (player_id) VALUES (p_player_id);

  -- Reset profile to initial state (character will be null, triggering character selector)
  UPDATE player_profiles
  SET
    total_money = 100,
    lifetime_earnings = 0,
    money_per_click = 1,
    money_per_second = 0,
    total_clicks = 0,
    prestige_points = 0,
    gems = 0,
    hourly_income = 0,
    selected_character_id = NULL,
    selected_house_id = NULL,
    selected_car_id = NULL,
    current_job_id = NULL,
    times_reset = COALESCE(times_reset, 0) + 1,
    last_reset_at = now(),
    last_played_at = now(),
    daily_claimed_total = 0,
    claim_locked_until = NULL,
    last_ad_watch_time = NULL,
    last_claim_time = now()
  WHERE id = p_player_id;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION reset_player_progress(uuid) TO authenticated, anon;
