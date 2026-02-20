/*
  # Add is_completed column to player_jobs

  ## Changes
  - Adds `is_completed` boolean column to `player_jobs` table (default false)
  - This column tracks whether a player has "finished" a job level before switching to a new one

  ## Notes
  - No existing data is affected; all current rows default to false
  - No function changes needed since reset_player_progress already deletes all player_jobs rows
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'player_jobs' AND column_name = 'is_completed'
  ) THEN
    ALTER TABLE player_jobs ADD COLUMN is_completed boolean DEFAULT false NOT NULL;
  END IF;
END $$;
