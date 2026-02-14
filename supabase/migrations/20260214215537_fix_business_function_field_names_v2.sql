/*
  # Fix Business Function Field Names

  ## Overview
  Updates the `get_all_businesses` function to return field names that match the TypeScript interface.
  The function was returning prefixed field names (business_name, business_category, business_icon)
  but the TypeScript interface expects unprefixed names (name, category, icon_name).

  ## Changes
  - Drops and recreates `get_all_businesses` function to return:
    - `id` instead of `business_id`
    - `name` instead of `business_name`
    - `description` instead of `business_description`
    - `category` instead of `business_category`
    - `icon_name` instead of `business_icon`
  - Keeps all other fields unchanged (base_price, base_hourly_income, unlock_order, is_owned, can_unlock, current_level, current_hourly_income)

  ## Impact
  This fix allows BusinessModal to properly display businesses by matching database field names with TypeScript types.
*/

-- Drop existing function
DROP FUNCTION IF EXISTS get_all_businesses(uuid);

-- Recreate get_all_businesses function with correct field names
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
  current_hourly_income bigint
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
    COALESCE(pb.current_hourly_income, b.base_hourly_income) AS current_hourly_income
  FROM businesses b
  LEFT JOIN player_businesses pb ON b.id = pb.business_id AND pb.player_id = p_player_id
  ORDER BY b.unlock_order;
END;
$$;
