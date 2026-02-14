/*
  # Fix Foreign Key Constraint for Player Businesses

  ## Problem
  The `player_businesses` table has an incorrect foreign key constraint that references `auth.users.id`.
  This causes errors for device-based authenticated players who exist in `player_profiles` but not in `auth.users`.

  ## Changes
  1. Drop the incorrect foreign key constraint `player_businesses_player_id_fkey`
  2. Add correct foreign key constraint that references `player_profiles.id`
  3. Use `ON DELETE CASCADE` to automatically clean up when a player is deleted

  ## Impact
  - Business purchases will now work for device-based authenticated users
  - Maintains referential integrity with the correct player table
*/

-- Drop the incorrect foreign key constraint
ALTER TABLE player_businesses 
DROP CONSTRAINT IF EXISTS player_businesses_player_id_fkey;

-- Add the correct foreign key constraint pointing to player_profiles
ALTER TABLE player_businesses
ADD CONSTRAINT player_businesses_player_id_fkey 
FOREIGN KEY (player_id) 
REFERENCES player_profiles(id) 
ON DELETE CASCADE;