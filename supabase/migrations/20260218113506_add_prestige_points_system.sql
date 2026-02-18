/*
  # Add Prestige Points System to Game Items

  1. Schema Changes
    - Add prestige_points column to houses table
    - Add prestige_points column to jobs table
    - Add prestige_points column to investment_properties table
    - Add selected_outfit_id column to player_profiles table

  2. Data Updates
    - Calculate prestige_points for houses (hourly_rent_cost / 20)
    - Set default prestige_points (0) for jobs
    - Set default prestige_points (0) for investment_properties

  3. Purpose
    - Houses: Prestige points based on rent cost (more expensive houses = more prestige)
    - Jobs: Prestige points will be set later (default 0 for now)
    - Investment Properties: Prestige points will be set later (default 0 for now)
    - Player Profiles: Track which outfit is currently selected for prestige calculation

  4. Foreign Key Constraints
    - player_profiles.selected_outfit_id references character_outfits.id
*/

-- Add prestige_points column to houses table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'houses' AND column_name = 'prestige_points'
  ) THEN
    ALTER TABLE houses ADD COLUMN prestige_points integer NOT NULL DEFAULT 0;
  END IF;
END $$;

-- Add prestige_points column to jobs table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'jobs' AND column_name = 'prestige_points'
  ) THEN
    ALTER TABLE jobs ADD COLUMN prestige_points integer NOT NULL DEFAULT 0;
  END IF;
END $$;

-- Add prestige_points column to investment_properties table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'investment_properties' AND column_name = 'prestige_points'
  ) THEN
    ALTER TABLE investment_properties ADD COLUMN prestige_points integer NOT NULL DEFAULT 0;
  END IF;
END $$;

-- Add selected_outfit_id column to player_profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'player_profiles' AND column_name = 'selected_outfit_id'
  ) THEN
    ALTER TABLE player_profiles ADD COLUMN selected_outfit_id uuid;
  END IF;
END $$;

-- Add foreign key constraint for selected_outfit_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'player_profiles_selected_outfit_id_fkey'
  ) THEN
    ALTER TABLE player_profiles 
      ADD CONSTRAINT player_profiles_selected_outfit_id_fkey 
      FOREIGN KEY (selected_outfit_id) 
      REFERENCES character_outfits(id);
  END IF;
END $$;

-- Calculate and update prestige_points for houses (hourly_rent_cost / 20, rounded)
UPDATE houses
SET prestige_points = ROUND(CAST(hourly_rent_cost AS numeric) / 20)::integer
WHERE prestige_points = 0;

-- Jobs: Keep default 0 for now (will be set later)
-- Investment Properties: Keep default 0 for now (will be set later)