/*
  # Assign Default Character and House After Reset

  ## Overview
  This migration updates the reset_player_progress function to automatically assign
  the default free character and house after a player resets their progress.

  ## Changes Made
  
  ### 1. Default Items Assignment
  - After reset, the function now finds the free character (price = 0)
  - Finds the free house (price = 0)
  - Automatically assigns these to the player profile
  - Creates player_purchases records so the player officially owns them
  
  ### 2. Prevents Blank Screen
  - Previously, selected_character_id and selected_house_id were set to NULL
  - This caused blank/white areas on the main screen
  - Now defaults are automatically assigned, providing a consistent experience
  
  ## Important Notes
  - Players will start with the free character and house immediately after reset
  - No character selector will appear since defaults are auto-assigned
  - Behavior is consistent with a fresh new game
*/

-- Drop and recreate the reset function with default item assignment
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
  v_default_character_id uuid;
  v_default_house_id uuid;
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

  -- Find default character (free character with price = 0)
  SELECT id INTO v_default_character_id
  FROM characters
  WHERE price = 0
  ORDER BY name
  LIMIT 1;

  -- Find default house (free house with price = 0)
  SELECT id INTO v_default_house_id
  FROM houses
  WHERE price = 0
  ORDER BY name
  LIMIT 1;

  -- Reset profile to initial state with default character and house
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
    selected_character_id = v_default_character_id,
    selected_house_id = v_default_house_id,
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

  -- Create player_purchases records for default items so player owns them
  IF v_default_character_id IS NOT NULL THEN
    INSERT INTO player_purchases (player_id, item_type, item_id, price_paid, purchased_at)
    VALUES (p_player_id, 'character', v_default_character_id, 0, now());
  END IF;

  IF v_default_house_id IS NOT NULL THEN
    INSERT INTO player_purchases (player_id, item_type, item_id, price_paid, purchased_at)
    VALUES (p_player_id, 'house', v_default_house_id, 0, now());
  END IF;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION reset_player_progress(uuid) TO authenticated, anon;