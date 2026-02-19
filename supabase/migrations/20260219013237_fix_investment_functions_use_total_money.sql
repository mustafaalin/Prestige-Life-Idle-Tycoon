/*
  # Fix purchase_investment and upgrade_investment: use total_money column

  ## Problem
  Both functions referenced a column named `money` on `player_profiles`, but the
  actual column is `total_money`. This caused all balance checks and deductions to
  silently fail (NULL comparisons, no-op UPDATEs).

  ## Changes
  1. purchase_investment
     - SELECT total_money (was: money)
     - UPDATE ... SET total_money = total_money - price (was: money = money - price)
     - Final balance SELECT uses total_money; UPDATE uses RETURNING to confirm the row
       was actually modified

  2. upgrade_investment
     - Same three substitutions as purchase_investment
     - UPDATE ... SET total_money = total_money - cost RETURNING total_money
*/

-- ── purchase_investment ──────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.purchase_investment(
  p_player_id uuid,
  p_investment_id uuid
)
RETURNS TABLE(success boolean, message text, new_balance bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_player_money bigint;
  v_investment_price bigint;
  v_investment_income bigint;
  v_investment_name text;
  v_unlock_order integer;
  v_already_owned boolean;
  v_max_unlocked_order integer;
BEGIN
  -- Get player's current money
  SELECT total_money INTO v_player_money
  FROM player_profiles
  WHERE id = p_player_id;

  IF v_player_money IS NULL THEN
    RETURN QUERY SELECT false, 'Player not found', 0::bigint;
    RETURN;
  END IF;

  -- Get investment details
  SELECT base_price, base_rental_income, name, unlock_order
  INTO v_investment_price, v_investment_income, v_investment_name, v_unlock_order
  FROM investment_properties
  WHERE id = p_investment_id;

  IF v_investment_price IS NULL THEN
    RETURN QUERY SELECT false, 'Investment property not found', v_player_money;
    RETURN;
  END IF;

  -- Check if already owned
  SELECT EXISTS(
    SELECT 1 FROM player_investments
    WHERE player_id = p_player_id
      AND investment_id = p_investment_id
      AND purchased_at IS NOT NULL
  ) INTO v_already_owned;

  IF v_already_owned THEN
    RETURN QUERY SELECT false, 'You already own this investment property', v_player_money;
    RETURN;
  END IF;

  -- Check sequential unlock order
  SELECT COALESCE(MAX(ip.unlock_order), 0)
  INTO v_max_unlocked_order
  FROM player_investments pi
  INNER JOIN investment_properties ip ON ip.id = pi.investment_id
  WHERE pi.player_id = p_player_id
    AND pi.purchased_at IS NOT NULL;

  IF v_unlock_order > (v_max_unlocked_order + 1) THEN
    RETURN QUERY SELECT
      false,
      'You must unlock investment properties in order. Complete #' || (v_max_unlocked_order + 1) || ' first.',
      v_player_money;
    RETURN;
  END IF;

  -- Check if player has enough money
  IF v_player_money < v_investment_price THEN
    RETURN QUERY SELECT false, 'Not enough money to purchase this investment property', v_player_money;
    RETURN;
  END IF;

  -- Deduct money from player (RETURNING confirms the row was updated)
  UPDATE player_profiles
  SET total_money = total_money - v_investment_price
  WHERE id = p_player_id
  RETURNING total_money INTO v_player_money;

  -- Create or update investment record
  INSERT INTO player_investments (
    player_id,
    investment_id,
    is_unlocked,
    current_level,
    current_rental_income,
    total_invested,
    purchased_at,
    last_upgrade_at
  )
  VALUES (
    p_player_id,
    p_investment_id,
    true,
    1,
    v_investment_income,
    v_investment_price,
    now(),
    now()
  )
  ON CONFLICT (player_id, investment_id)
  DO UPDATE SET
    is_unlocked = true,
    current_level = 1,
    current_rental_income = v_investment_income,
    total_invested = v_investment_price,
    purchased_at = now(),
    last_upgrade_at = now();

  -- Recalculate player income
  PERFORM calculate_player_income(p_player_id);

  -- Recalculate prestige
  PERFORM calculate_player_prestige(p_player_id);

  -- Return updated balance (already captured via RETURNING above)
  RETURN QUERY SELECT
    true,
    'Successfully purchased ' || v_investment_name || '! You now earn $' || v_investment_income || '/hour from this investment.',
    v_player_money;
END;
$$;

-- ── upgrade_investment ───────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.upgrade_investment(
  p_player_id uuid,
  p_investment_id uuid
)
RETURNS TABLE(success boolean, message text, new_balance bigint, new_income bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_player_money bigint;
  v_current_level integer;
  v_current_income bigint;
  v_upgrade_cost bigint;
  v_new_income bigint;
  v_investment_name text;
  v_total_invested bigint;
  v_cost_multiplier integer;
BEGIN
  -- Get player's current money
  SELECT total_money INTO v_player_money
  FROM player_profiles
  WHERE id = p_player_id;

  IF v_player_money IS NULL THEN
    RETURN QUERY SELECT false, 'Player not found', 0::bigint, 0::bigint;
    RETURN;
  END IF;

  -- Get current investment details
  SELECT
    pi.current_level,
    pi.current_rental_income,
    pi.total_invested,
    ip.name
  INTO
    v_current_level,
    v_current_income,
    v_total_invested,
    v_investment_name
  FROM player_investments pi
  INNER JOIN investment_properties ip ON ip.id = pi.investment_id
  WHERE pi.player_id = p_player_id
    AND pi.investment_id = p_investment_id
    AND pi.purchased_at IS NOT NULL;

  IF v_current_level IS NULL THEN
    RETURN QUERY SELECT false, 'You do not own this investment property', v_player_money, 0::bigint;
    RETURN;
  END IF;

  -- Check max level
  IF v_current_level >= 6 THEN
    RETURN QUERY SELECT false, 'This investment is already at maximum level (6)', v_player_money, v_current_income;
    RETURN;
  END IF;

  -- Calculate upgrade cost based on level
  v_cost_multiplier := CASE v_current_level
    WHEN 1 THEN 30
    WHEN 2 THEN 60
    WHEN 3 THEN 120
    WHEN 4 THEN 180
    WHEN 5 THEN 240
    ELSE 30
  END;

  v_upgrade_cost := v_current_income * v_cost_multiplier;

  -- Check if player has enough money
  IF v_player_money < v_upgrade_cost THEN
    RETURN QUERY SELECT
      false,
      'Not enough money to upgrade. Cost: $' || v_upgrade_cost,
      v_player_money,
      v_current_income;
    RETURN;
  END IF;

  -- Calculate new income (25% increase)
  v_new_income := FLOOR(v_current_income * 1.25);

  -- Deduct money from player (RETURNING confirms the row was updated)
  UPDATE player_profiles
  SET total_money = total_money - v_upgrade_cost
  WHERE id = p_player_id
  RETURNING total_money INTO v_player_money;

  -- Update investment
  UPDATE player_investments
  SET
    current_level = current_level + 1,
    current_rental_income = v_new_income,
    total_invested = total_invested + v_upgrade_cost,
    last_upgrade_at = now()
  WHERE player_id = p_player_id
    AND investment_id = p_investment_id;

  -- Recalculate player income
  PERFORM calculate_player_income(p_player_id);

  -- Recalculate prestige
  PERFORM calculate_player_prestige(p_player_id);

  -- Return updated balance (already captured via RETURNING above)
  RETURN QUERY SELECT
    true,
    'Upgraded ' || v_investment_name || ' to level ' || (v_current_level + 1) || '! Income increased to $' || v_new_income || '/hour',
    v_player_money,
    v_new_income;
END;
$$;
