/*
  # Switch to Auth-First RLS Policies

  ## Summary
  This migration transitions from device-based authentication to Supabase Anonymous Auth
  as the single source of truth for player identity. The player_profiles.id now equals
  auth.uid(), and all RLS policies are simplified to use direct auth.uid() checks.

  ## Changes Made

  ### 1. Player_Profiles Table - Secure Auth-Based RLS
  - **DROP** "Public can read all profiles" - removes public read access
  - **DROP** "Anyone can insert profile with device_id" - removes device-based insert
  - **CREATE** SELECT policy: Users can only read their own profile (id = auth.uid())
  - **CREATE** INSERT policy: Users can only insert their own profile (id = auth.uid())
  - **KEEP** UPDATE policy: Already correct with USING and WITH CHECK
  - **KEEP** DELETE policy: Already correct

  ### 2. Player_Jobs Table - Simplified Direct Auth Check
  - **DROP** all complex join-based policies (6 duplicate policies)
  - **CREATE** simple policies using direct player_id = auth.uid() check
  - No joins needed since player_id now equals auth.uid()

  ## Security Improvements
  - Profile data is now private by default (no public read access)
  - Each user can only access their own data (strict USING clauses)
  - Insert operations require authenticated user ID match
  - Update operations validate both current and new state belong to user
  - No device_id based authentication bypass possible

  ## Important Notes
  - This is a breaking change for existing device-based profiles
  - New users must authenticate anonymously before creating profile
  - profile.id must be manually set to auth.uid() during profile creation
  - Backward compatibility for old device_id profiles is intentionally not included
*/

-- ============================================================================
-- PLAYER_PROFILES TABLE: Switch to Auth-First RLS
-- ============================================================================

-- Drop old permissive policies
DROP POLICY IF EXISTS "Public can read all profiles" ON player_profiles;
DROP POLICY IF EXISTS "Anyone can insert profile with device_id" ON player_profiles;

-- Create secure auth-based policies
CREATE POLICY "Users can read own profile"
  ON player_profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can create own profile"
  ON player_profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- Note: "Users can update own profile" already exists with correct USING and WITH CHECK
-- Note: "Users can delete own profile" already exists with correct USING

-- ============================================================================
-- PLAYER_JOBS TABLE: Simplify to Direct Auth Check
-- ============================================================================

-- Drop ALL existing policies (including duplicates)
DROP POLICY IF EXISTS "Users can view own jobs" ON player_jobs;
DROP POLICY IF EXISTS "Users can insert own jobs" ON player_jobs;
DROP POLICY IF EXISTS "Users can update own jobs" ON player_jobs;
DROP POLICY IF EXISTS "player_jobs_select_own" ON player_jobs;
DROP POLICY IF EXISTS "player_jobs_insert_own" ON player_jobs;
DROP POLICY IF EXISTS "player_jobs_update_own" ON player_jobs;

-- Create simple direct auth check policies
CREATE POLICY "Users can read own jobs"
  ON player_jobs FOR SELECT
  TO authenticated
  USING (player_id = auth.uid());

CREATE POLICY "Users can create own jobs"
  ON player_jobs FOR INSERT
  TO authenticated
  WITH CHECK (player_id = auth.uid());

CREATE POLICY "Users can modify own jobs"
  ON player_jobs FOR UPDATE
  TO authenticated
  USING (player_id = auth.uid())
  WITH CHECK (player_id = auth.uid());
