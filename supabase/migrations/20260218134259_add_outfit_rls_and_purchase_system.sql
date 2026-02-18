/*
  # Add Outfit System RLS Policies and Purchase Function

  1. Security Changes
    - Add RLS policies for `character_outfits` table
      - Public SELECT policy (all outfits are viewable by everyone)
    - Add RLS policies for `player_outfits` table
      - Authenticated users can SELECT their own outfits
      - Authenticated users can INSERT their own outfits (via purchase function)

  2. New Functions
    - `purchase_outfit` - Atomic function to purchase an outfit
      - Validates player has enough money and prestige points
      - Deducts money from player
      - Adds prestige points to player
      - Creates player_outfits record
      - Updates selected_outfit_id if requested
      - Returns success/error status

  3. Important Notes
    - All operations are atomic within a transaction
    - Function validates unlock requirements before purchase
    - Prevents duplicate purchases
*/

-- RLS Policies for character_outfits (public read access)
CREATE POLICY "Anyone can view active outfits"
  ON character_outfits
  FOR SELECT
  USING (is_active = true);

-- RLS Policies for player_outfits (authenticated users only)
CREATE POLICY "Users can view own outfits"
  ON player_outfits
  FOR SELECT
  TO authenticated
  USING (
    player_id IN (
      SELECT id FROM player_profiles 
      WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own outfits"
  ON player_outfits
  FOR INSERT
  TO authenticated
  WITH CHECK (
    player_id IN (
      SELECT id FROM player_profiles 
      WHERE auth_user_id = auth.uid()
    )
  );

-- Function to purchase outfit atomically
CREATE OR REPLACE FUNCTION purchase_outfit(
  p_player_id UUID,
  p_outfit_id UUID,
  p_set_as_selected BOOLEAN DEFAULT false
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_outfit_price BIGINT;
  v_outfit_prestige_points INTEGER;
  v_outfit_unlock_type TEXT;
  v_outfit_unlock_value INTEGER;
  v_player_money BIGINT;
  v_player_prestige INTEGER;
  v_already_owned BOOLEAN;
BEGIN
  -- Get outfit details
  SELECT price, prestige_points, unlock_type, unlock_value
  INTO v_outfit_price, v_outfit_prestige_points, v_outfit_unlock_type, v_outfit_unlock_value
  FROM character_outfits
  WHERE id = p_outfit_id AND is_active = true;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Outfit not found or not active'
    );
  END IF;

  -- Get player details
  SELECT total_money, prestige_points
  INTO v_player_money, v_player_prestige
  FROM player_profiles
  WHERE id = p_player_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Player not found'
    );
  END IF;

  -- Check if already owned
  SELECT is_owned
  INTO v_already_owned
  FROM player_outfits
  WHERE player_id = p_player_id AND outfit_id = p_outfit_id;

  IF v_already_owned THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Outfit already owned'
    );
  END IF;

  -- Validate unlock requirements
  IF v_outfit_unlock_type = 'prestige' AND v_player_prestige < v_outfit_unlock_value THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Not enough prestige points to unlock'
    );
  END IF;

  IF v_outfit_unlock_type = 'money' AND v_player_money < v_outfit_unlock_value THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Not enough money to unlock'
    );
  END IF;

  -- Check if player has enough money to purchase
  IF v_player_money < v_outfit_price THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Not enough money to purchase outfit'
    );
  END IF;

  -- Deduct money and add prestige points
  UPDATE player_profiles
  SET 
    total_money = total_money - v_outfit_price,
    prestige_points = prestige_points + v_outfit_prestige_points,
    selected_outfit_id = CASE 
      WHEN p_set_as_selected THEN p_outfit_id 
      ELSE selected_outfit_id 
    END,
    last_played_at = now()
  WHERE id = p_player_id;

  -- Insert or update player_outfits
  INSERT INTO player_outfits (player_id, outfit_id, is_owned, is_unlocked, purchased_at, unlocked_at)
  VALUES (p_player_id, p_outfit_id, true, true, now(), now())
  ON CONFLICT (player_id, outfit_id)
  DO UPDATE SET
    is_owned = true,
    is_unlocked = true,
    purchased_at = now(),
    unlocked_at = now();

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Outfit purchased successfully',
    'prestige_earned', v_outfit_prestige_points,
    'money_spent', v_outfit_price
  );
END;
$$;