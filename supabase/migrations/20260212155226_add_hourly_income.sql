/*
  # Add Hourly Income System

  1. Changes to Tables
    - Add `hourly_income` column to `player_profiles` table
      - Stores money earned per hour (numeric)
      - Default value is 1000 (starting hourly income)
      - Replaces the per-second calculation with hourly calculation
    
  2. Important Notes
    - Hourly income of 1000 means 1000 dollars per hour
    - This will be converted to per-second income in the frontend
    - Example: 1000/hour = 1000/3600 = ~0.278 per second
    - Higher hourly income = faster money accumulation
*/

-- Add hourly_income column for hourly-based income calculation
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'player_profiles' AND column_name = 'hourly_income'
  ) THEN
    ALTER TABLE player_profiles ADD COLUMN hourly_income numeric(10,2) NOT NULL DEFAULT 1000;
  END IF;
END $$;

-- Update existing profiles to have default hourly income
UPDATE player_profiles 
SET hourly_income = 1000 
WHERE hourly_income IS NULL OR hourly_income = 0;