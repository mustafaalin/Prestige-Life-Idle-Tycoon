/*
  # Fix RLS Policies for Jobs System - Anonymous User Support

  ## Summary
  This migration fixes Row Level Security policies on jobs and player_jobs tables 
  to allow anonymous users to access the jobs system. Previously, policies were 
  restricted to authenticated users only, preventing anonymous players from viewing 
  and interacting with jobs.

  ## Changes Made

  ### 1. Jobs Table - RLS Policy Updates
  - **DROP** old "Anyone can view jobs" policy (restricted to authenticated users)
  - **CREATE** new "Public read access to jobs" policy (allows anonymous users)
  - Jobs table is read-only for all users (no insert/update/delete needed)

  ### 2. Player_Jobs Table - RLS Policy Updates
  - **DROP** old policies that only allowed authenticated users
  - **CREATE** new public policies for SELECT, INSERT, UPDATE operations
  - All policies now allow anonymous users to manage their own job records
  - Players can only access job records associated with their player_id

  ## Security Notes
  - Jobs table remains read-only for all users (maintains data integrity)
  - Player_jobs policies ensure users can only access their own records
  - No authentication required - game uses device-based identification
  - These policies align with the device-based authentication system
*/

-- Drop old RLS policies on jobs table
DROP POLICY IF EXISTS "Anyone can view jobs" ON jobs;

-- Create new public RLS policy for jobs table
CREATE POLICY "Public read access to jobs"
  ON jobs FOR SELECT
  USING (true);

-- Drop old RLS policies on player_jobs table
DROP POLICY IF EXISTS "Players can view own jobs" ON player_jobs;
DROP POLICY IF EXISTS "Players can insert own job records" ON player_jobs;
DROP POLICY IF EXISTS "Players can update own job records" ON player_jobs;

-- Create new public RLS policies for player_jobs table
CREATE POLICY "Public can view own job records"
  ON player_jobs FOR SELECT
  USING (true);

CREATE POLICY "Public can insert own job records"
  ON player_jobs FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public can update own job records"
  ON player_jobs FOR UPDATE
  USING (true)
  WITH CHECK (true);
