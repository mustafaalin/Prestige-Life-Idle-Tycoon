/*
  # Update Purchase Function to Set Last Played Time
  
  1. Changes
    - Update `complete_demo_purchase` function to set `last_played_at` when processing purchases
    - This prevents incorrect offline earnings calculation after purchases
    - Ensures user's active time is properly tracked
  
  2. Why This Fix
    - When user makes a purchase, they are actively playing
    - Without updating last_played_at, the next page load calculates offline earnings from old timestamp
    - This causes users to receive offline earnings even though they were just playing
*/

CREATE OR REPLACE FUNCTION complete_demo_purchase(
  p_transaction_id uuid,
  p_player_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_transaction record;
  v_package record;
  v_player_record record;
  v_money_to_add bigint := 0;
  v_gems_to_add integer := 0;
BEGIN
  -- Lock player record
  SELECT * INTO v_player_record
  FROM player_profiles
  WHERE id = p_player_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Player not found'
    );
  END IF;

  -- Get transaction
  SELECT * INTO v_transaction
  FROM player_transactions
  WHERE id = p_transaction_id AND player_id = p_player_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Transaction not found'
    );
  END IF;

  -- Check if already completed
  IF v_transaction.transaction_status != 'pending' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Transaction already processed'
    );
  END IF;

  -- Get package
  SELECT * INTO v_package
  FROM purchase_packages
  WHERE id = v_transaction.package_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Package not found'
    );
  END IF;

  -- Calculate amounts
  IF v_package.package_type = 'money' THEN
    v_money_to_add := v_package.amount_multiplier * COALESCE(v_player_record.hourly_income, 100);
  ELSIF v_package.package_type = 'gem' THEN
    v_gems_to_add := v_package.gem_amount;
  END IF;

  -- Update player balance and last_played_at
  UPDATE player_profiles
  SET 
    total_money = total_money + v_money_to_add,
    gems = gems + v_gems_to_add,
    last_played_at = now()
  WHERE id = p_player_id;

  -- Update transaction status
  UPDATE player_transactions
  SET 
    transaction_status = 'completed',
    completed_at = now(),
    items_received = jsonb_build_object(
      'money', v_money_to_add,
      'gems', v_gems_to_add
    ),
    amount_paid = v_package.price_usd
  WHERE id = p_transaction_id;

  RETURN jsonb_build_object(
    'success', true,
    'money_added', v_money_to_add,
    'gems_added', v_gems_to_add,
    'new_total_money', v_player_record.total_money + v_money_to_add,
    'new_gems', v_player_record.gems + v_gems_to_add
  );

EXCEPTION WHEN OTHERS THEN
  UPDATE player_transactions
  SET 
    transaction_status = 'failed',
    error_message = SQLERRM
  WHERE id = p_transaction_id;
  
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;
