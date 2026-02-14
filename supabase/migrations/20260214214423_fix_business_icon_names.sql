/*
  # Fix Business Icon Names
  
  ## Overview
  Update incorrect icon names in the businesses table to match Lucide React icon names
  
  ## Changes
  - Update 'IceCream' to 'IceCreamCone' to match correct Lucide React icon name
  
  ## Impact
  - Fixes icon rendering for Ice Cream Shop business
*/

UPDATE businesses
SET icon_name = 'IceCreamCone'
WHERE icon_name = 'IceCream';