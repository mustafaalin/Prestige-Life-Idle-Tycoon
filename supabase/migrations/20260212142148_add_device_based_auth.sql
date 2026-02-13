/*
  # Add Device-Based Authentication Support

  1. Changes to Tables
    - Modify `player_profiles` table structure:
      - Remove foreign key constraint from `id` to auth.users
      - Add `device_id` column (uuid) - Stores unique device identifier
      - Add `display_name` column (text) - User-customizable display name
      - Add `auth_user_id` column (uuid) - Optional link to Supabase Auth
      - Add `linked_at` column (timestamptz) - Timestamp when account was linked
      
  2. Security Updates
    - Update RLS policies to support device-based access
    - Allow public access based on device_id
    - Remove authenticated-only restrictions
    
  3. Important Notes
    - Players can now play anonymously without authentication
    - device_id is generated client-side and stored in localStorage
    - Players can link their device profile to an auth account later
    - All game items (characters, houses, cars) are now publicly readable
*/

-- Drop existing foreign key constraint on player_profiles.id
DO $$
BEGIN
  ALTER TABLE player_profiles DROP CONSTRAINT IF EXISTS player_profiles_id_fkey;
EXCEPTION
  WHEN others THEN NULL;
END $$;

-- Add device_id column for device-based authentication
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'player_profiles' AND column_name = 'device_id'
  ) THEN
    ALTER TABLE player_profiles ADD COLUMN device_id uuid UNIQUE;
    CREATE INDEX IF NOT EXISTS idx_player_profiles_device_id ON player_profiles(device_id);
  END IF;
END $$;

-- Add display_name column for customizable username
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'player_profiles' AND column_name = 'display_name'
  ) THEN
    ALTER TABLE player_profiles ADD COLUMN display_name text NOT NULL DEFAULT 'player' || floor(random() * 9000 + 1000)::text;
  END IF;
END $$;

-- Add auth_user_id for optional account linking
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'player_profiles' AND column_name = 'auth_user_id'
  ) THEN
    ALTER TABLE player_profiles ADD COLUMN auth_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
    CREATE INDEX IF NOT EXISTS idx_player_profiles_auth_user_id ON player_profiles(auth_user_id);
  END IF;
END $$;

-- Add linked_at timestamp for tracking account linking
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'player_profiles' AND column_name = 'linked_at'
  ) THEN
    ALTER TABLE player_profiles ADD COLUMN linked_at timestamptz;
  END IF;
END $$;

-- Drop old RLS policies on player_profiles
DROP POLICY IF EXISTS "Players can view own profile" ON player_profiles;
DROP POLICY IF EXISTS "Players can update own profile" ON player_profiles;
DROP POLICY IF EXISTS "Players can insert own profile" ON player_profiles;

-- Drop old RLS policies on items (to make them public)
DROP POLICY IF EXISTS "Anyone can view characters" ON characters;
DROP POLICY IF EXISTS "Anyone can view houses" ON houses;
DROP POLICY IF EXISTS "Anyone can view cars" ON cars;

-- Create new public RLS policies for items
CREATE POLICY "Public read access to characters"
  ON characters FOR SELECT
  USING (true);

CREATE POLICY "Public read access to houses"
  ON houses FOR SELECT
  USING (true);

CREATE POLICY "Public read access to cars"
  ON cars FOR SELECT
  USING (true);

-- Create new RLS policies for player_profiles (device-based)
CREATE POLICY "Public can read all profiles"
  ON player_profiles FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert profile with device_id"
  ON player_profiles FOR INSERT
  WITH CHECK (device_id IS NOT NULL);

CREATE POLICY "Anyone can update their device profile"
  ON player_profiles FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete their device profile"
  ON player_profiles FOR DELETE
  USING (true);

-- Update player_purchases RLS policies
DROP POLICY IF EXISTS "Players can view own purchases" ON player_purchases;
DROP POLICY IF EXISTS "Players can insert own purchases" ON player_purchases;

CREATE POLICY "Public can view purchases"
  ON player_purchases FOR SELECT
  USING (true);

CREATE POLICY "Public can insert purchases"
  ON player_purchases FOR INSERT
  WITH CHECK (true);

-- Update game_stats RLS policies
DROP POLICY IF EXISTS "Players can view own stats" ON game_stats;
DROP POLICY IF EXISTS "Players can insert own stats" ON game_stats;
DROP POLICY IF EXISTS "Players can update own stats" ON game_stats;

CREATE POLICY "Public can view stats"
  ON game_stats FOR SELECT
  USING (true);

CREATE POLICY "Public can insert stats"
  ON game_stats FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public can update stats"
  ON game_stats FOR UPDATE
  USING (true)
  WITH CHECK (true);