/*
  # Add Shop Features - Daily Rewards and Claim System

  ## Overview
  This migration adds the necessary columns to support the shop modal features:
  - Gems/diamonds as a premium currency
  - Online claim system to collect accumulated money while playing
  - Daily login rewards tracking (using existing game_stats table)

  ## Changes to Tables

  ### player_profiles
  - `gems` (bigint) - Premium currency earned through daily rewards
    - Default value: 0
    - Used for future shop purchases
  - `last_claim_time` (timestamptz) - Last time player collected accumulated online money
    - Default value: current timestamp
    - Used to calculate how much money has accumulated while player is active

  ## Important Notes
  1. Daily login streak tracking already exists in game_stats table
  2. Claim system works only while player is online/active
  3. Money accumulates at half the hourly income rate (hourly_income / 2)
  4. Maximum accumulation is 60 minutes worth (hourly_income / 2)
  5. Gems are awarded on specific daily reward milestones
*/

-- Add gems column to player_profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'player_profiles' AND column_name = 'gems'
  ) THEN
    ALTER TABLE player_profiles ADD COLUMN gems bigint NOT NULL DEFAULT 0;
  END IF;
END $$;

-- Add last_claim_time column to player_profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'player_profiles' AND column_name = 'last_claim_time'
  ) THEN
    ALTER TABLE player_profiles ADD COLUMN last_claim_time timestamptz DEFAULT now();
  END IF;
END $$;

-- Set default values for existing players
UPDATE player_profiles 
SET gems = 0 
WHERE gems IS NULL;

UPDATE player_profiles 
SET last_claim_time = now() 
WHERE last_claim_time IS NULL;