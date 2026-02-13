/*
  # Idle Guy: Life Sim - Initial Database Schema

  ## Overview
  This migration creates the complete database schema for the Idle Guy life simulation game.
  Players start poor and gradually become rich through clicking and passive income.

  ## New Tables

  ### 1. `characters`
  Stores all available character options (male/female with different appearances)
  - `id` (uuid, primary key) - Unique character identifier
  - `name` (text) - Character name
  - `gender` (text) - Character gender (male/female)
  - `description` (text) - Short character description
  - `image_url` (text) - URL to character image
  - `price` (bigint) - Cost to unlock (0 for starter)
  - `unlock_order` (integer) - Order in which characters become available
  - `created_at` (timestamptz) - Record creation timestamp

  ### 2. `houses`
  Progression system of homes from street to mansion
  - `id` (uuid, primary key) - Unique house identifier
  - `name` (text) - House name (Street, Tent, Small Apartment, etc.)
  - `description` (text) - House description
  - `image_url` (text) - URL to house image
  - `price` (bigint) - Purchase price
  - `passive_income_bonus` (numeric) - Money earned per second
  - `level` (integer) - House tier/level
  - `created_at` (timestamptz) - Record creation timestamp

  ### 3. `cars`
  Vehicle progression from bicycle to supercar
  - `id` (uuid, primary key) - Unique car identifier
  - `name` (text) - Car name
  - `description` (text) - Car description
  - `image_url` (text) - URL to car image
  - `price` (bigint) - Purchase price
  - `prestige_points` (integer) - Prestige/status points
  - `level` (integer) - Car tier/level
  - `created_at` (timestamptz) - Record creation timestamp

  ### 4. `player_profiles`
  Stores each player's game state and progress
  - `id` (uuid, primary key, references auth.users) - Player identifier
  - `username` (text) - Player display name
  - `total_money` (bigint) - Current money balance
  - `lifetime_earnings` (bigint) - Total money earned all-time
  - `money_per_click` (numeric) - Money earned per click
  - `money_per_second` (numeric) - Passive income rate
  - `total_clicks` (bigint) - Lifetime click count
  - `prestige_points` (integer) - Total prestige accumulated
  - `selected_character_id` (uuid) - Currently equipped character
  - `selected_house_id` (uuid) - Currently owned house
  - `selected_car_id` (uuid) - Currently owned car
  - `created_at` (timestamptz) - Account creation timestamp
  - `last_played_at` (timestamptz) - Last activity timestamp

  ### 5. `player_purchases`
  Tracks all items purchased by players
  - `id` (uuid, primary key) - Unique purchase record
  - `player_id` (uuid, references player_profiles) - Buyer identifier
  - `item_type` (text) - Type: character, house, or car
  - `item_id` (uuid) - ID of purchased item
  - `purchase_price` (bigint) - Amount paid
  - `purchased_at` (timestamptz) - Purchase timestamp

  ### 6. `game_stats`
  Global or per-player statistics
  - `id` (uuid, primary key) - Stats record identifier
  - `player_id` (uuid, references player_profiles) - Player identifier
  - `play_time_seconds` (bigint) - Total time played
  - `highest_combo` (integer) - Best click combo achieved
  - `achievements_unlocked` (jsonb) - Array of achievement IDs
  - `daily_login_streak` (integer) - Consecutive daily logins
  - `last_daily_reward` (timestamptz) - Last daily reward claim
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## Security
  - Enable Row Level Security (RLS) on all tables
  - Players can only read their own profile and purchases
  - Players can read all items (characters, houses, cars) but not modify
  - Only authenticated users can play the game

  ## Notes
  1. Money values stored as bigint to handle large numbers
  2. Default starting values ensure new players can begin immediately
  3. Timestamps track player activity and enable time-based features
  4. Foreign keys ensure data integrity
  5. Indexes added for common query patterns
*/

-- Create characters table
CREATE TABLE IF NOT EXISTS characters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  gender text NOT NULL CHECK (gender IN ('male', 'female')),
  description text NOT NULL,
  image_url text NOT NULL,
  price bigint NOT NULL DEFAULT 0,
  unlock_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create houses table
CREATE TABLE IF NOT EXISTS houses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  image_url text NOT NULL,
  price bigint NOT NULL DEFAULT 0,
  passive_income_bonus numeric(10,2) NOT NULL DEFAULT 0,
  level integer NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

-- Create cars table
CREATE TABLE IF NOT EXISTS cars (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  image_url text NOT NULL,
  price bigint NOT NULL DEFAULT 0,
  prestige_points integer NOT NULL DEFAULT 0,
  level integer NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

-- Create player_profiles table
CREATE TABLE IF NOT EXISTS player_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text NOT NULL DEFAULT 'Player',
  total_money bigint NOT NULL DEFAULT 0,
  lifetime_earnings bigint NOT NULL DEFAULT 0,
  money_per_click numeric(10,2) NOT NULL DEFAULT 1,
  money_per_second numeric(10,2) NOT NULL DEFAULT 0,
  total_clicks bigint NOT NULL DEFAULT 0,
  prestige_points integer NOT NULL DEFAULT 0,
  selected_character_id uuid REFERENCES characters(id),
  selected_house_id uuid REFERENCES houses(id),
  selected_car_id uuid REFERENCES cars(id),
  created_at timestamptz DEFAULT now(),
  last_played_at timestamptz DEFAULT now()
);

-- Create player_purchases table
CREATE TABLE IF NOT EXISTS player_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid NOT NULL REFERENCES player_profiles(id) ON DELETE CASCADE,
  item_type text NOT NULL CHECK (item_type IN ('character', 'house', 'car')),
  item_id uuid NOT NULL,
  purchase_price bigint NOT NULL,
  purchased_at timestamptz DEFAULT now()
);

-- Create game_stats table
CREATE TABLE IF NOT EXISTS game_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid NOT NULL REFERENCES player_profiles(id) ON DELETE CASCADE,
  play_time_seconds bigint NOT NULL DEFAULT 0,
  highest_combo integer NOT NULL DEFAULT 0,
  achievements_unlocked jsonb DEFAULT '[]'::jsonb,
  daily_login_streak integer NOT NULL DEFAULT 0,
  last_daily_reward timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_player_purchases_player_id ON player_purchases(player_id);
CREATE INDEX IF NOT EXISTS idx_player_purchases_item_type ON player_purchases(item_type);
CREATE INDEX IF NOT EXISTS idx_game_stats_player_id ON game_stats(player_id);
CREATE INDEX IF NOT EXISTS idx_characters_unlock_order ON characters(unlock_order);
CREATE INDEX IF NOT EXISTS idx_houses_level ON houses(level);
CREATE INDEX IF NOT EXISTS idx_cars_level ON cars(level);

-- Enable Row Level Security on all tables
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE houses ENABLE ROW LEVEL SECURITY;
ALTER TABLE cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies for characters (read-only for all authenticated users)
CREATE POLICY "Anyone can view characters"
  ON characters FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for houses (read-only for all authenticated users)
CREATE POLICY "Anyone can view houses"
  ON houses FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for cars (read-only for all authenticated users)
CREATE POLICY "Anyone can view cars"
  ON cars FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for player_profiles
CREATE POLICY "Players can view own profile"
  ON player_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Players can insert own profile"
  ON player_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Players can update own profile"
  ON player_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- RLS Policies for player_purchases
CREATE POLICY "Players can view own purchases"
  ON player_purchases FOR SELECT
  TO authenticated
  USING (auth.uid() = player_id);

CREATE POLICY "Players can insert own purchases"
  ON player_purchases FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = player_id);

-- RLS Policies for game_stats
CREATE POLICY "Players can view own stats"
  ON game_stats FOR SELECT
  TO authenticated
  USING (auth.uid() = player_id);

CREATE POLICY "Players can insert own stats"
  ON game_stats FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = player_id);

CREATE POLICY "Players can update own stats"
  ON game_stats FOR UPDATE
  TO authenticated
  USING (auth.uid() = player_id)
  WITH CHECK (auth.uid() = player_id);
