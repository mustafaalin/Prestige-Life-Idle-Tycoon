/*
  # Fix purchaseItem Function - Column Name Error

  1. Changes
    - Recreate `purchaseItem()` function with correct column names
    - Replace all references from `money` to `total_money`
    - Fix 4 instances where the wrong column name was used

  2. Details
    - Line 988: SELECT money → SELECT total_money
    - Line 1015: SELECT money → SELECT total_money  
    - Line 1036: SET money = money - price → SET total_money = total_money - price
    - Line 1044: SELECT money → SELECT total_money

  3. Impact
    - Fixes "column money does not exist" error
    - Allows car purchases to work correctly
    - House selection will work (no money deduction)
*/

CREATE OR REPLACE FUNCTION purchaseItem(
  p_player_id uuid,
  p_item_id uuid,
  p_item_type text
)
RETURNS TABLE(success boolean, message text, new_balance bigint)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_player_money bigint;
  v_item_price bigint;
  v_item_name text;
  v_item_exists boolean;
BEGIN
  -- Get player's current money (FIXED: money → total_money)
  SELECT total_money INTO v_player_money FROM player_profiles WHERE id = p_player_id;
  
  IF v_player_money IS NULL THEN
    RETURN QUERY SELECT false, 'Player not found', 0::bigint;
    RETURN;
  END IF;
  
  IF p_item_type = 'house' THEN
    -- Houses are not purchased, only selected (no money transaction)
    SELECT EXISTS(SELECT 1 FROM houses WHERE id = p_item_id) INTO v_item_exists;
    
    IF NOT v_item_exists THEN
      RETURN QUERY SELECT false, 'House not found', v_player_money;
      RETURN;
    END IF;
    
    SELECT name INTO v_item_name FROM houses WHERE id = p_item_id;
    
    -- Just update the selected house, no money deduction
    UPDATE player_profiles
    SET selected_house_id = p_item_id
    WHERE id = p_player_id;
    
    -- Recalculate income (house rent will be applied)
    PERFORM calculate_player_income(p_player_id);
    
    -- Get updated balance (FIXED: money → total_money)
    SELECT total_money INTO v_player_money FROM player_profiles WHERE id = p_player_id;
    
    RETURN QUERY SELECT true, 'Moved to ' || v_item_name || '! Check your expenses.', v_player_money;
    
  ELSIF p_item_type = 'car' THEN
    -- Cars are still purchased
    SELECT price, name INTO v_item_price, v_item_name
    FROM cars WHERE id = p_item_id;
    
    IF v_item_price IS NULL THEN
      RETURN QUERY SELECT false, 'Car not found', v_player_money;
      RETURN;
    END IF;
    
    IF v_player_money < v_item_price THEN
      RETURN QUERY SELECT false, 'Not enough money to purchase this car', v_player_money;
      RETURN;
    END IF;
    
    -- Deduct money and select car (FIXED: money → total_money)
    UPDATE player_profiles
    SET total_money = total_money - v_item_price,
        selected_car_id = p_item_id
    WHERE id = p_player_id;
    
    -- Recalculate income (car maintenance will be applied)
    PERFORM calculate_player_income(p_player_id);
    
    -- Get updated balance (FIXED: money → total_money)
    SELECT total_money INTO v_player_money FROM player_profiles WHERE id = p_player_id;
    
    RETURN QUERY SELECT true, 'Successfully purchased ' || v_item_name, v_player_money;
    
  ELSE
    RETURN QUERY SELECT false, 'Invalid item type', v_player_money;
  END IF;
END;
$$;