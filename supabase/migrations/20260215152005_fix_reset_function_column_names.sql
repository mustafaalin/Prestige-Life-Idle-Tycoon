/*
  # Fix reset_player_progress function column names
  
  1. Changes
    - Update reset_player_progress function to use correct column name `purchase_price` instead of `price_paid`
    - This fixes the NULL constraint violation error when resetting player progress
  
  2. Notes
    - The player_purchases table uses `purchase_price` column, not `price_paid`
    - This ensures default items are properly added to owned items after reset
*/

-- Drop existing function
DROP FUNCTION IF EXISTS reset_player_progress(uuid);

-- Recreate with correct column name
CREATE FUNCTION reset_player_progress(p_player_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_default_character_id uuid;
  v_default_house_id uuid;
BEGIN
  -- Find default character (Mike or first free male character)
  SELECT id INTO v_default_character_id
  FROM characters
  WHERE name = 'Mike'
  LIMIT 1;

  IF v_default_character_id IS NULL THEN
    SELECT id INTO v_default_character_id
    FROM characters
    WHERE gender = 'male' AND price = 0
    ORDER BY unlock_order
    LIMIT 1;
  END IF;

  -- Find default house (first free house)
  SELECT id INTO v_default_house_id
  FROM houses
  WHERE price = 0
  ORDER BY level
  LIMIT 1;

  -- Delete all player data except profile
  DELETE FROM player_purchases WHERE player_id = p_player_id;
  DELETE FROM player_jobs WHERE player_id = p_player_id;
  DELETE FROM player_businesses WHERE player_id = p_player_id;

  -- Save current progress to history
  INSERT INTO player_reset_history (
    player_id,
    money_before_reset,
    lifetime_earnings_before_reset,
    prestige_points_earned,
    reset_at
  )
  SELECT 
    id,
    total_money,
    lifetime_earnings,
    prestige_points,
    now()
  FROM player_profiles
  WHERE id = p_player_id;

  -- Reset profile to default values
  UPDATE player_profiles
  SET
    total_money = 100,
    lifetime_earnings = 0,
    money_per_click = 1,
    money_per_second = 0,
    hourly_income = 0,
    total_clicks = 0,
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
    INSERT INTO player_purchases (player_id, item_type, item_id, purchase_price, purchased_at)
    VALUES (p_player_id, 'character', v_default_character_id, 0, now());
  END IF;

  IF v_default_house_id IS NOT NULL THEN
    INSERT INTO player_purchases (player_id, item_type, item_id, purchase_price, purchased_at)
    VALUES (p_player_id, 'house', v_default_house_id, 0, now());
  END IF;

  -- Re-add default job
  INSERT INTO player_jobs (player_id, job_id, is_unlocked, is_active, unlocked_at, last_work_started_at)
  SELECT p_player_id, id, true, true, now(), now()
  FROM jobs
  WHERE is_default_unlocked = true
  LIMIT 1;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION reset_player_progress(uuid) TO authenticated, anon;
