/*
  # Simplify Player Jobs RLS Policies

  ## Summary
  This migration simplifies the Row Level Security policies on player_jobs table.
  Instead of complex device_id subqueries, we now use a simple auth_user_id check
  via the player_profiles table.

  ## Changes Made

  ### 1. Player_Jobs Table - Simplified RLS Policies
  - **DROP** old complex policies with device_id subqueries
  - **CREATE** new simple policies that:
    - Join with player_profiles table
    - Check only auth_user_id = auth.uid()
    - Much simpler and more performant

  ## Security Notes
  - Policies properly restrict access based on auth_user_id
  - Anonymous users must have auth_user_id set in player_profiles
  - No user can access another user's job records
*/

-- Drop old complex RLS policies on player_jobs table
DROP POLICY IF EXISTS "Users can view own job records via profile" ON player_jobs;
DROP POLICY IF EXISTS "Users can insert own job records via profile" ON player_jobs;
DROP POLICY IF EXISTS "Users can update own job records via profile" ON player_jobs;

-- Create simple RLS policy for SELECT operations
CREATE POLICY "Users can view own jobs"
  ON player_jobs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM player_profiles pp
      WHERE pp.id = player_jobs.player_id
      AND pp.auth_user_id = auth.uid()
    )
  );

-- Create simple RLS policy for INSERT operations
CREATE POLICY "Users can insert own jobs"
  ON player_jobs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM player_profiles pp
      WHERE pp.id = player_jobs.player_id
      AND pp.auth_user_id = auth.uid()
    )
  );

-- Create simple RLS policy for UPDATE operations
CREATE POLICY "Users can update own jobs"
  ON player_jobs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM player_profiles pp
      WHERE pp.id = player_jobs.player_id
      AND pp.auth_user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM player_profiles pp
      WHERE pp.id = player_jobs.player_id
      AND pp.auth_user_id = auth.uid()
    )
  );
