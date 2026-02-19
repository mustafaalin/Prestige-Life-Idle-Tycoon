/*
  # Fix calculate_player_income: SECURITY DEFINER + auth guard + business filter

  ## Changes
  1. Converts calculate_player_income from SECURITY INVOKER to SECURITY DEFINER
     - Previously ran as the calling user, so RLS blocked the UPDATE inside parent
       SECURITY DEFINER functions where auth.uid() is NULL
  2. Adds an ownership guard: non-null authenticated callers can only update their own player
  3. Sets search_path = public to prevent search_path injection
  4. Adds purchased_at IS NOT NULL filter to business_income sum so only owned
     businesses are counted (matches behaviour of investment_income)
  5. Removes the negative net-income clamp (v_net_income < 0 → 0) so real deficits show
  6. Restricts EXECUTE to authenticated role only (revokes from PUBLIC)
*/

CREATE OR REPLACE FUNCTION public.calculate_player_income(p_player_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_job_income numeric := 0;
  v_business_income numeric := 0;
  v_investment_income numeric := 0;
  v_house_rent numeric := 0;
  v_vehicle_expense numeric := 0;
  v_other_expenses numeric := 0;
  v_gross_income numeric := 0;
  v_total_expenses numeric := 0;
  v_net_income numeric := 0;
  v_current_job_id uuid;
  v_profile_exists boolean;
BEGIN
  -- Ownership guard: authenticated users may only recalculate their own profile
  IF auth.uid() IS NOT NULL AND p_player_id <> auth.uid() THEN
    RAISE EXCEPTION 'Not allowed';
  END IF;

  -- Check if player profile exists
  SELECT EXISTS(SELECT 1 FROM player_profiles WHERE id = p_player_id)
  INTO v_profile_exists;

  IF NOT v_profile_exists THEN
    RAISE EXCEPTION 'Player profile not found for id: %', p_player_id;
  END IF;

  -- 1. Calculate Job Income (only from active job)
  SELECT
    COALESCE(j.hourly_income, 0),
    pj.job_id
  INTO
    v_job_income,
    v_current_job_id
  FROM player_jobs pj
  INNER JOIN jobs j ON j.id = pj.job_id
  WHERE pj.player_id = p_player_id
    AND pj.is_active = true
  LIMIT 1;

  v_job_income := COALESCE(v_job_income, 0);

  -- 2. Calculate Business Income (only purchased/owned businesses)
  SELECT COALESCE(SUM(current_hourly_income), 0)
  INTO v_business_income
  FROM player_businesses
  WHERE player_id = p_player_id
    AND purchased_at IS NOT NULL;

  -- 3. Calculate Investment Income (sum of all rental income from owned investments)
  SELECT COALESCE(SUM(current_rental_income), 0)
  INTO v_investment_income
  FROM player_investments
  WHERE player_id = p_player_id
    AND purchased_at IS NOT NULL;

  -- 4. Calculate House Rent Expense
  SELECT COALESCE(h.hourly_rent_cost, 0)
  INTO v_house_rent
  FROM player_profiles pp
  LEFT JOIN houses h ON h.id = pp.selected_house_id
  WHERE pp.id = p_player_id;

  v_house_rent := COALESCE(v_house_rent, 0);

  -- 5. Calculate Vehicle Expense
  SELECT COALESCE(c.hourly_maintenance_cost, 0)
  INTO v_vehicle_expense
  FROM player_profiles pp
  LEFT JOIN cars c ON c.id = pp.selected_car_id
  WHERE pp.id = p_player_id;

  v_vehicle_expense := COALESCE(v_vehicle_expense, 0);

  -- 6. Get other expenses
  SELECT COALESCE(other_expenses, 0)
  INTO v_other_expenses
  FROM player_profiles
  WHERE id = p_player_id;

  -- 7. Calculate totals (negative net income is allowed)
  v_gross_income := v_job_income + v_business_income + v_investment_income;
  v_total_expenses := v_house_rent + v_vehicle_expense + v_other_expenses;
  v_net_income := v_gross_income - v_total_expenses;

  -- 8. Update player profile
  UPDATE player_profiles
  SET
    job_income = v_job_income,
    business_income = v_business_income,
    investment_income = v_investment_income,
    house_rent_expense = v_house_rent,
    vehicle_expense = v_vehicle_expense,
    gross_income = v_gross_income,
    total_expenses = v_total_expenses,
    hourly_income = v_net_income,
    current_job_id = v_current_job_id,
    last_played_at = now()
  WHERE id = p_player_id;
END;
$$;

-- Restrict execution: revoke from PUBLIC, grant only to authenticated
REVOKE ALL ON FUNCTION public.calculate_player_income(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.calculate_player_income(uuid) TO authenticated;
-- Also grant to service_role so server-side admin calls still work
GRANT EXECUTE ON FUNCTION public.calculate_player_income(uuid) TO service_role;
