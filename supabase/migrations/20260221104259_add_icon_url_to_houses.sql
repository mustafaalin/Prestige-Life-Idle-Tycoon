/*
  # Add icon_url column to houses table

  1. Changes
    - Add `icon_url` (text, nullable) column to `houses` table
    - Populate icon_url for all 25 house levels using a consistent URL pattern
*/

ALTER TABLE houses ADD COLUMN IF NOT EXISTS icon_url text;

UPDATE houses SET icon_url = 'https://dtanvjjdiyrunnavkxwe.supabase.co/storage/v1/object/public/game-assets/houses/icons/house-' || level || '.webp';
