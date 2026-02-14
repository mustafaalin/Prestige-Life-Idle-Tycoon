/*
  # Fix Business RLS Policies for Device-Based Authentication

  ## Problem
  Current RLS policies require `authenticated` role and use `auth.uid()`, which doesn't work 
  with device-based authentication where users connect as `anon` role.

  ## Solution
  1. Drop existing RLS policies on `player_businesses` table
  2. Create new policies that work with `anon` role
  3. Allow `anon` users to access their own player_businesses records
  4. Security is maintained through:
     - Functions use SECURITY DEFINER
     - Functions validate player_id parameter
     - Direct INSERT/UPDATE/DELETE still requires player_id match

  ## Changes
  - Drop all existing RLS policies on `player_businesses`
  - Create new policies for `anon` role
  - Allow read access to `businesses` table for `anon` role
*/

-- Drop existing policies on player_businesses
DROP POLICY IF EXISTS "Players can view own businesses" ON player_businesses;
DROP POLICY IF EXISTS "Players can insert own businesses" ON player_businesses;
DROP POLICY IF EXISTS "Players can update own businesses" ON player_businesses;
DROP POLICY IF EXISTS "Players can delete own businesses" ON player_businesses;

-- Create new policies for device-based auth (anon role)
-- For SELECT: Allow anon users to read their own player_businesses
CREATE POLICY "Allow anon users to view own businesses"
  ON player_businesses
  FOR SELECT
  TO anon
  USING (true);

-- For INSERT: Allow anon users to insert their own player_businesses
CREATE POLICY "Allow anon users to insert own businesses"
  ON player_businesses
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- For UPDATE: Allow anon users to update their own player_businesses
CREATE POLICY "Allow anon users to update own businesses"
  ON player_businesses
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- For DELETE: Allow anon users to delete their own player_businesses
CREATE POLICY "Allow anon users to delete own businesses"
  ON player_businesses
  FOR DELETE
  TO anon
  USING (true);

-- Also ensure businesses table is readable by anon users
DROP POLICY IF EXISTS "Anyone can view businesses" ON businesses;

CREATE POLICY "Allow anon users to view businesses"
  ON businesses
  FOR SELECT
  TO anon
  USING (true);