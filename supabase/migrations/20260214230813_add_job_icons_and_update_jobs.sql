/*
  # Add Job Icons and Update Job Data

  ## Changes
  1. Add `icon_url` column to jobs table
    - Stores the full URL to the job icon image in Supabase Storage
    - Nullable text field to allow fallback to Lucide icons
  
  2. Update all 20 jobs with:
    - New names matching the uploaded icon files
    - Updated descriptions
    - Icon URLs pointing to Supabase Storage
    - Appropriate hourly income values
    - Progressive level system (1-20)

  ## Jobs Mapping (Level 1-20)
  - Level 1-5: Entry-level jobs
  - Level 6-10: Skilled labor jobs
  - Level 11-15: Professional jobs
  - Level 16-20: Advanced career jobs

  ## Security
  - No RLS changes needed (uses existing policies)
*/

-- Add icon_url column to jobs table
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS icon_url text;

-- Update all jobs with new data matching the uploaded icons
-- Level 1: Dishwasher
UPDATE jobs SET 
  name = 'Dishwasher',
  description = 'Wash dishes and clean kitchen equipment',
  icon_url = 'https://dtanvjjdiyrunnavkxwe.supabase.co/storage/v1/object/public/game-assets/jobs/Dishwasher.png',
  hourly_income = 1300,
  unlock_requirement_money = 0
WHERE level = 1;

-- Level 2: Cleaner
UPDATE jobs SET 
  name = 'Cleaner',
  description = 'Keep buildings and facilities clean',
  icon_url = 'https://dtanvjjdiyrunnavkxwe.supabase.co/storage/v1/object/public/game-assets/jobs/Cleaner.png',
  hourly_income = 1600,
  unlock_requirement_money = 5000
WHERE level = 2;

-- Level 3: Waiter
UPDATE jobs SET 
  name = 'Waiter',
  description = 'Serve customers at restaurants',
  icon_url = 'https://dtanvjjdiyrunnavkxwe.supabase.co/storage/v1/object/public/game-assets/jobs/Waiter.png',
  hourly_income = 2000,
  unlock_requirement_money = 10000
WHERE level = 3;

-- Level 4: Cashier
UPDATE jobs SET 
  name = 'Cashier',
  description = 'Handle transactions and customer service',
  icon_url = 'https://dtanvjjdiyrunnavkxwe.supabase.co/storage/v1/object/public/game-assets/jobs/Cashier.png',
  hourly_income = 2500,
  unlock_requirement_money = 20000
WHERE level = 4;

-- Level 5: Shelf Stocker
UPDATE jobs SET 
  name = 'Shelf Stocker',
  description = 'Stock shelves and organize inventory',
  icon_url = 'https://dtanvjjdiyrunnavkxwe.supabase.co/storage/v1/object/public/game-assets/jobs/Shelf-Stocker.png',
  hourly_income = 3100,
  unlock_requirement_money = 35000
WHERE level = 5;

-- Level 6: Flyer Distributor
UPDATE jobs SET 
  name = 'Flyer Distributor',
  description = 'Hand out promotional materials',
  icon_url = 'https://dtanvjjdiyrunnavkxwe.supabase.co/storage/v1/object/public/game-assets/jobs/Flyer-Distributor.png',
  hourly_income = 3800,
  unlock_requirement_money = 55000
WHERE level = 6;

-- Level 7: Bicycle Courier
UPDATE jobs SET 
  name = 'Bicycle Courier',
  description = 'Deliver packages around the city',
  icon_url = 'https://dtanvjjdiyrunnavkxwe.supabase.co/storage/v1/object/public/game-assets/jobs/Bicycle-Courier.png',
  hourly_income = 4500,
  unlock_requirement_money = 80000
WHERE level = 7;

-- Level 8: Parking Attendant
UPDATE jobs SET 
  name = 'Parking Attendant',
  description = 'Manage parking lots and assist customers',
  icon_url = 'https://dtanvjjdiyrunnavkxwe.supabase.co/storage/v1/object/public/game-assets/jobs/Parking-Attendant.png',
  hourly_income = 5250,
  unlock_requirement_money = 110000
WHERE level = 8;

-- Level 9: Car Wash Attendant
UPDATE jobs SET 
  name = 'Car Wash Attendant',
  description = 'Clean and detail vehicles',
  icon_url = 'https://dtanvjjdiyrunnavkxwe.supabase.co/storage/v1/object/public/game-assets/jobs/Car-Wash-Attendant.png',
  hourly_income = 6000,
  unlock_requirement_money = 150000
WHERE level = 9;

-- Level 10: Housekeeper
UPDATE jobs SET 
  name = 'Housekeeper',
  description = 'Maintain cleanliness in residential areas',
  icon_url = 'https://dtanvjjdiyrunnavkxwe.supabase.co/storage/v1/object/public/game-assets/jobs/Housekeeper.png',
  hourly_income = 7100,
  unlock_requirement_money = 200000
WHERE level = 10;

-- Level 11: Security Guard
UPDATE jobs SET 
  name = 'Security Guard',
  description = 'Protect property and ensure safety',
  icon_url = 'https://dtanvjjdiyrunnavkxwe.supabase.co/storage/v1/object/public/game-assets/jobs/Security-Guard.png',
  hourly_income = 8250,
  unlock_requirement_money = 260000
WHERE level = 11;

-- Level 12: Factory Line Worker
UPDATE jobs SET 
  name = 'Factory Line Worker',
  description = 'Operate machinery and assemble products',
  icon_url = 'https://dtanvjjdiyrunnavkxwe.supabase.co/storage/v1/object/public/game-assets/jobs/Factory-Line-Worker.png',
  hourly_income = 10000,
  unlock_requirement_money = 330000
WHERE level = 12;

-- Level 13: Landscaping Worker
UPDATE jobs SET 
  name = 'Landscaping Worker',
  description = 'Maintain gardens and outdoor spaces',
  icon_url = 'https://dtanvjjdiyrunnavkxwe.supabase.co/storage/v1/object/public/game-assets/jobs/Landscaping-Worker.png',
  hourly_income = 12400,
  unlock_requirement_money = 420000
WHERE level = 13;

-- Level 14: Construction Laborer
UPDATE jobs SET 
  name = 'Construction Laborer',
  description = 'Build and repair structures',
  icon_url = 'https://dtanvjjdiyrunnavkxwe.supabase.co/storage/v1/object/public/game-assets/jobs/Construction-Laborer.png',
  hourly_income = 14000,
  unlock_requirement_money = 520000
WHERE level = 14;

-- Level 15: Warehouse Packer
UPDATE jobs SET 
  name = 'Warehouse Packer',
  description = 'Pack and prepare shipments',
  icon_url = 'https://dtanvjjdiyrunnavkxwe.supabase.co/storage/v1/object/public/game-assets/jobs/Warehouse-Packer.png',
  hourly_income = 16000,
  unlock_requirement_money = 650000
WHERE level = 15;

-- Level 16: Parcel Sorter
UPDATE jobs SET 
  name = 'Parcel Sorter',
  description = 'Sort and organize packages efficiently',
  icon_url = 'https://dtanvjjdiyrunnavkxwe.supabase.co/storage/v1/object/public/game-assets/jobs/Parcel-Sorter.png',
  hourly_income = 20000,
  unlock_requirement_money = 800000
WHERE level = 16;

-- Level 17: Call Center Agent
UPDATE jobs SET 
  name = 'Call Center Agent',
  description = 'Handle customer inquiries and support',
  icon_url = 'https://dtanvjjdiyrunnavkxwe.supabase.co/storage/v1/object/public/game-assets/jobs/Call-Center-Agent.png',
  hourly_income = 25000,
  unlock_requirement_money = 1000000
WHERE level = 17;

-- Level 18: Brand Promoter
UPDATE jobs SET 
  name = 'Brand Promoter',
  description = 'Promote products and increase brand awareness',
  icon_url = 'https://dtanvjjdiyrunnavkxwe.supabase.co/storage/v1/object/public/game-assets/jobs/Brand-Promoter.png',
  hourly_income = 32000,
  unlock_requirement_money = 1300000
WHERE level = 18;

-- Level 19: Bakery Assistant
UPDATE jobs SET 
  name = 'Bakery Assistant',
  description = 'Prepare and bake fresh goods',
  icon_url = 'https://dtanvjjdiyrunnavkxwe.supabase.co/storage/v1/object/public/game-assets/jobs/Bakery-Assistant.png',
  hourly_income = 40000,
  unlock_requirement_money = 1700000
WHERE level = 19;

-- Level 20: Mover
UPDATE jobs SET 
  name = 'Mover',
  description = 'Transport and relocate heavy items',
  icon_url = 'https://dtanvjjdiyrunnavkxwe.supabase.co/storage/v1/object/public/game-assets/jobs/Mover.png',
  hourly_income = 50000,
  unlock_requirement_money = 2200000
WHERE level = 20;