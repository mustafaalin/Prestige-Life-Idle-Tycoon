/*
  # Add total_invested Field to get_all_businesses Function

  ## Overview
  Fixes the purchase button functionality by adding the missing `total_invested` field to the `get_all_businesses` function.
  This field is required by the BusinessModal component to display investment information.

  ## Changes
  - Drops and recreates `get_all_businesses` function to include `total_invested` field
  - For owned businesses: returns actual total_invested from player_businesses
  - For unowned businesses: returns base_price as a preview of initial investment

  ## Fields Returned
  - id, name, description, category, icon_name (business info)
  - base_price, base_hourly_income, unlock_order (game mechanics)
  - is_owned, can_unlock (ownership status)
  - current_level, current_hourly_income (player progress)
  - total_invested (NEW - total amount invested in this business)

  ## Impact
  This fix allows the purchase button to work correctly by ensuring all required fields are available after purchase.
*/

-- Drop existing function
DROP FUNCTION IF EXISTS get_all_businesses(uuid);

-- Recreate get_all_businesses function with total_invested field
CREATE OR REPLACE FUNCTION get_all_businesses(p_player_id uuid)
RETURNS TABLE (
  id uuid,
  name text,
  description text,
  category text,
  icon_name text,
  base_price bigint,
  base_hourly_income bigint,
  unlock_order integer,
  is_owned boolean,
  can_unlock boolean,
  current_level integer,
  current_hourly_income bigint,
  total_invested bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    b.id,
    b.name,
    b.description,
    b.category,
    b.icon_name,
    b.base_price,
    b.base_hourly_income,
    b.unlock_order,
    pb.id IS NOT NULL AS is_owned,
    (b.unlock_order = 1 OR EXISTS(
      SELECT 1 FROM player_businesses pb2
      JOIN businesses b2 ON pb2.business_id = b2.id
      WHERE pb2.player_id = p_player_id AND b2.unlock_order = b.unlock_order - 1
    )) AS can_unlock,
    COALESCE(pb.current_level, 1) AS current_level,
    COALESCE(pb.current_hourly_income, b.base_hourly_income) AS current_hourly_income,
    COALESCE(pb.total_invested, b.base_price) AS total_invested
  FROM businesses b
  LEFT JOIN player_businesses pb ON b.id = pb.business_id AND pb.player_id = p_player_id
  ORDER BY b.unlock_order;
END;
$$;
