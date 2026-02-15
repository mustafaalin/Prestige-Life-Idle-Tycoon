/*
  # Add Job Work Time Tracking System

  ## Summary
  This migration adds work time tracking to the jobs system, allowing players to 
  track how long they've worked at each job. This enables requirements like 
  "must work 3 minutes at current job before unlocking next level job".

  ## Changes Made

  ### 1. Add Columns to player_jobs Table
  - `total_time_worked_seconds` (integer, NOT NULL, default 0)
    - Tracks total accumulated work time in seconds for this job
    - Only counts time while player is online and tab is active
    - Persists across multiple work sessions
  
  - `last_work_started_at` (timestamptz, nullable)
    - Timestamp when player started working at this job (became active)
    - NULL when job is not currently active
    - Used to calculate elapsed time for current work session

  ### 2. Performance Optimization
  - Add composite index on (player_id, job_id) for faster queries
  - This index speeds up lookups when checking work time requirements

  ## Security Notes
  - Uses existing RLS policies (public access for device-based auth)
  - No new security concerns introduced
  - Time tracking is client-driven but validated server-side

  ## Important Notes
  - Time only counts while player is actively playing (tab visible, online)
  - Offline/background time is NOT counted
  - Auto-saves every 30 seconds to prevent data loss
  - 3-minute (180 seconds) minimum required to unlock next level job
*/

-- Add total_time_worked_seconds column to track accumulated work time
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'player_jobs' AND column_name = 'total_time_worked_seconds'
  ) THEN
    ALTER TABLE player_jobs 
    ADD COLUMN total_time_worked_seconds integer NOT NULL DEFAULT 0;
  END IF;
END $$;

-- Add last_work_started_at column to track when current work session began
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'player_jobs' AND column_name = 'last_work_started_at'
  ) THEN
    ALTER TABLE player_jobs 
    ADD COLUMN last_work_started_at timestamptz;
  END IF;
END $$;

-- Add composite index for better query performance
CREATE INDEX IF NOT EXISTS idx_player_jobs_player_job_id 
ON player_jobs(player_id, job_id);

-- Initialize existing records with zero work time
UPDATE player_jobs 
SET total_time_worked_seconds = 0 
WHERE total_time_worked_seconds IS NULL;

-- Set last_work_started_at to now for currently active jobs
UPDATE player_jobs 
SET last_work_started_at = now() 
WHERE is_active = true AND last_work_started_at IS NULL;