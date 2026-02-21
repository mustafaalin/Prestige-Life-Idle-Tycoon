/*
  # Fix get_all_businesses to include prestige_points column

  ## Changes
  - Drop and recreate `get_all_businesses(p_player_id uuid)` function to include `prestige_points` in return type and SELECT query
  - No other changes made
*/

DROP FUNCTION IF EXISTS public.get_all_businesses(uuid);

CREATE OR REPLACE FUNCTION public.get_all_businesses(p_player_id uuid)
RETURNS TABLE(
  id uuid,
  name text,
  description text,
  category text,
  icon_name text,
  icon_url text,
  base_price bigint,
  base_hourly_income bigint,
  unlock_order integer,
  prestige_points integer,
  is_owned boolean,
  can_unlock boolean,
  current_level integer,
  current_hourly_income bigint,
  total_invested bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
RETURN QUERY
SELECT
b.id,
b.name,
b.description,
b.category,
b.icon_name,
b.icon_url,
b.base_price,
b.base_hourly_income,
b.unlock_order,
b.prestige_points,
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
$function$;
