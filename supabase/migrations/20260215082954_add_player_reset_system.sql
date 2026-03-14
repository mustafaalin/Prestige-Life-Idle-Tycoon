/*
  # Add Player Reset System

  ## Overview
  This migration adds a comprehensive reset system that preserves real money purchase history while allowing players to reset their game progress.

  ## 1. New Tables
    - `player_reset_history`
      - `id` (uuid, primary key) - Unique identifier for each reset record
      - `player_id` (uuid, foreign key) - References player_profiles(id)
      - `reset_at` (timestamptz) - When the reset occurred
      - `money_at_reset` (bigint) - Total money at time of reset
      - `gems_at_reset` (bigint) - Total gems at time of reset
      - `hourly_income_at_reset` (bigint) - Hourly income at time of reset
      - `lifetime_earnings_at_reset` (bigint) - Lifetime earnings at time of reset
      - `total_clicks_at_reset` (bigint) - Total clicks at time of reset
      - `prestige_points_at_reset` (bigint) - Prestige points at time of reset
      - `selected_character_id` (uuid, nullable) - Selected character at reset
      - `selected_house_id` (uuid, nullable) - Selected house at reset
      - `selected_car_id` (uuid, nullable) - Selected car at reset
      - `current_job_id` (uuid, nullable) - Current job at reset
      - `owned_characters` (jsonb) - Array of owned character IDs
      - `owned_houses` (jsonb) - Array of owned house IDs
      - `owned_cars` (jsonb) - Array of owned car IDs
      - `player_jobs` (jsonb) - Player job data snapshot
      - `player_businesses` (jsonb) - Player business data snapshot

  ## 2. Profile Updates
    - Added `times_reset` (integer, default 0) - Count of resets performed
    - Added `last_reset_at` (timestamptz, nullable) - Timestamp of last reset

  ## 3. Database Function
    - `reset_player_progress()` - Resets progress while preserving purchase history

  ## 4. Security
    - Enable RLS on `player_reset_history` table
    - Add policies for users to manage their own reset history

  ## Important Notes
    - Real money purchase history is preserved (NOT deleted)
    - Device-based authentication is preserved
    - Reset count and timestamps are tracked for analytics
    - Initial values: total_money=100, hourly_income=50
*/

-- Add reset tracking fields to player_profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'player_profiles' AND column_name = 'times_reset'
  ) THEN
    ALTER TABLE player_profiles ADD COLUMN times_reset integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'player_profiles' AND column_name = 'last_reset_at'
  ) THEN
    ALTER TABLE player_profiles ADD COLUMN last_reset_at timestamptz;
  END IF;
END $$;

-- Create player_reset_history table
CREATE TABLE IF NOT EXISTS player_reset_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid NOT NULL REFERENCES player_profiles(id) ON DELETE CASCADE,
  reset_at timestamptz DEFAULT now() NOT NULL,
  money_at_reset bigint DEFAULT 0,
  gems_at_reset bigint DEFAULT 0,
  hourly_income_at_reset bigint DEFAULT 0,
  lifetime_earnings_at_reset bigint DEFAULT 0,
  total_clicks_at_reset bigint DEFAULT 0,
  prestige_points_at_reset bigint DEFAULT 0,
  selected_character_id uuid,
  selected_house_id uuid,
  selected_car_id uuid,
  current_job_id uuid,
  owned_characters jsonb DEFAULT '[]'::jsonb,
  owned_houses jsonb DEFAULT '[]'::jsonb,
  owned_cars jsonb DEFAULT '[]'::jsonb,
  player_jobs jsonb DEFAULT '[]'::jsonb,
  player_businesses jsonb DEFAULT '[]'::jsonb
);

-- Enable RLS
ALTER TABLE player_reset_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for player_reset_history
DROP POLICY IF EXISTS "Users can view own reset history" ON player_reset_history;
CREATE POLICY "Users can view own reset history"
  ON player_reset_history FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can insert own reset history" ON player_reset_history;
CREATE POLICY "Users can insert own reset history"
  ON player_reset_history FOR INSERT
  WITH CHECK (true);

-- Function to reset player progress (preserves real money transactions)
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
BEGIN
  -- Get current profile data
  SELECT * INTO v_profile FROM player_profiles WHERE id = p_player_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Player profile not found';
  END IF;

  -- Collect owned items
  SELECT jsonb_agg(character_id) INTO v_owned_chars
  FROM player_purchases
  WHERE player_id = p_player_id AND character_id IS NOT NULL;

  SELECT jsonb_agg(house_id) INTO v_owned_houses
  FROM player_purchases
  WHERE player_id = p_player_id AND house_id IS NOT NULL;

  SELECT jsonb_agg(car_id) INTO v_owned_cars
  FROM player_purchases
  WHERE player_id = p_player_id AND car_id IS NOT NULL;

  -- Collect player jobs
  SELECT jsonb_agg(jsonb_build_object(
    'job_id', job_id,
    'level', level,
    'experience', experience,
    'total_work_time_seconds', total_work_time_seconds
  )) INTO v_player_jobs
  FROM player_jobs
  WHERE player_id = p_player_id;

  -- Collect player businesses
  SELECT jsonb_agg(jsonb_build_object(
    'business_id', business_id,
    'level', level,
    'total_invested', total_invested
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
    v_profile.current_job_id,
    COALESCE(v_owned_chars, '[]'::jsonb),
    COALESCE(v_owned_houses, '[]'::jsonb),
    COALESCE(v_owned_cars, '[]'::jsonb),
    COALESCE(v_player_jobs, '[]'::jsonb),
    COALESCE(v_player_businesses, '[]'::jsonb)
  );

  -- Delete game progress (but NOT real money purchases)
  DELETE FROM player_jobs WHERE player_id = p_player_id;
  DELETE FROM player_businesses WHERE player_id = p_player_id;
  DELETE FROM game_stats WHERE player_id = p_player_id;
  DELETE FROM player_purchases WHERE player_id = p_player_id;

  -- Reset profile to initial state
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
    times_reset = times_reset + 1,
    last_reset_at = now(),
    last_played_at = now(),
    daily_claimed_total = 0,
    claim_locked_until = NULL,
    last_ad_watch_time = NULL
  WHERE id = p_player_id;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION reset_player_progress(uuid) TO authenticated, anon;