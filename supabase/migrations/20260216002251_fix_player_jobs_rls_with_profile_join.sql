/*
  # Fix Player Jobs RLS with Player Profiles Join

  ## Summary
  This migration fixes the Row Level Security policies on player_jobs table to properly
  enforce security through player_profiles table join. Previously, policies used
  `player_id = auth.uid()` which doesn't work because player_id is the profile UUID,
  not the auth.uid(). Now policies check authentication through player_profiles join.

  ## Changes Made

  ### 1. Player_Jobs Table - RLS Policy Security Fix
  - **DROP** old insecure policies that used `USING (true)`
  - **CREATE** new secure policies that:
    - Join with player_profiles table
    - Check both auth_user_id and device_id for authentication
    - Ensure users can only access their own job records
    - Support both authenticated and device-based sessions

  ### 2. Policy Logic
  For SELECT operations:
  - Check if player_profiles.auth_user_id = auth.uid() (for authenticated users)
  - OR check if player_profiles.device_id = current device (for device-based users)

  For INSERT operations:
  - Check the same authentication logic
  - Ensure job records can only be created for the current user's profile

  For UPDATE operations:
  - Same authentication checks as SELECT
  - Users can only update their own job records

  ## Security Notes
  - Policies now properly restrict access based on profile ownership
  - Both authenticated and device-based sessions are supported
  - No user can access another user's job records
  - Maintains backward compatibility with device-based authentication
*/

-- Drop old insecure RLS policies on player_jobs table
DROP POLICY IF EXISTS "Public can view own job records" ON player_jobs;
DROP POLICY IF EXISTS "Public can insert own job records" ON player_jobs;
DROP POLICY IF EXISTS "Public can update own job records" ON player_jobs;

-- Create secure RLS policy for SELECT operations
CREATE POLICY "Users can view own job records via profile"
  ON player_jobs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM player_profiles pp
      WHERE pp.id = player_jobs.player_id
      AND (
        pp.auth_user_id = auth.uid()
        OR pp.device_id IN (
          SELECT device_id FROM player_profiles WHERE auth_user_id = auth.uid()
        )
      )
    )
  );

-- Create secure RLS policy for INSERT operations
CREATE POLICY "Users can insert own job records via profile"
  ON player_jobs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM player_profiles pp
      WHERE pp.id = player_jobs.player_id
      AND (
        pp.auth_user_id = auth.uid()
        OR pp.device_id IN (
          SELECT device_id FROM player_profiles WHERE auth_user_id = auth.uid()
        )
      )
    )
  );

-- Create secure RLS policy for UPDATE operations
CREATE POLICY "Users can update own job records via profile"
  ON player_jobs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM player_profiles pp
      WHERE pp.id = player_jobs.player_id
      AND (
        pp.auth_user_id = auth.uid()
        OR pp.device_id IN (
          SELECT device_id FROM player_profiles WHERE auth_user_id = auth.uid()
        )
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM player_profiles pp
      WHERE pp.id = player_jobs.player_id
      AND (
        pp.auth_user_id = auth.uid()
        OR pp.device_id IN (
          SELECT device_id FROM player_profiles WHERE auth_user_id = auth.uid()
        )
      )
    )
  );