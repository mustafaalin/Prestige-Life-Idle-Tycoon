/*
  # Add Custom Icon URLs to Small Businesses

  1. Changes
    - Add `icon_url` column to businesses table if it doesn't exist
    - Update all 20 small businesses with their custom icon URLs from Supabase storage
  
  2. Business Icon Mappings
    - Bakery → bakery.png
    - Barber Shop → barber-shop.png
    - Beauty Salon → beauty-salon.png
    - Bookstore → bookstore.png
    - Car Wash → car-wash.png
    - Cleaning Service → cleaning-service.png
    - Coffee Shop → coffee-shop.png
    - Flower Shop → flower-shop.png
    - Gift Shop → gift-shop.png
    - Grocery Mini Mart → grocery-mini-market.png
    - Hardware Store → hardware-store.png
    - Ice Cream Shop → ice-cream-shop.png
    - Juice Bar → juice-bar.png
    - Laundry Service → laundry-service.png
    - Mobile Phone Repair → mobile-phone-repair.png
    - Pet Grooming Salon → pet-grooming-shop.png
    - Sandwich Shop → sandwich-shop.png
    - Shoe Repair Shop → shoe-repair-shop.png
    - Tailor Shop → tailor-shop.png
    - Vape Shop → vape-shop.png
*/

-- Add icon_url column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'businesses' AND column_name = 'icon_url'
  ) THEN
    ALTER TABLE businesses ADD COLUMN icon_url text;
  END IF;
END $$;

-- Update all small businesses with their custom icon URLs
UPDATE businesses SET icon_url = 'https://dtanvjjdiyrunnavkxwe.supabase.co/storage/v1/object/public/game-assets/businesses/bakery.png' WHERE name = 'Bakery';
UPDATE businesses SET icon_url = 'https://dtanvjjdiyrunnavkxwe.supabase.co/storage/v1/object/public/game-assets/businesses/barber-shop.png' WHERE name = 'Barber Shop';
UPDATE businesses SET icon_url = 'https://dtanvjjdiyrunnavkxwe.supabase.co/storage/v1/object/public/game-assets/businesses/beauty-salon.png' WHERE name = 'Beauty Salon';
UPDATE businesses SET icon_url = 'https://dtanvjjdiyrunnavkxwe.supabase.co/storage/v1/object/public/game-assets/businesses/bookstore.png' WHERE name = 'Bookstore';
UPDATE businesses SET icon_url = 'https://dtanvjjdiyrunnavkxwe.supabase.co/storage/v1/object/public/game-assets/businesses/car-wash.png' WHERE name = 'Car Wash';
UPDATE businesses SET icon_url = 'https://dtanvjjdiyrunnavkxwe.supabase.co/storage/v1/object/public/game-assets/businesses/cleaning-service.png' WHERE name = 'Cleaning Service';
UPDATE businesses SET icon_url = 'https://dtanvjjdiyrunnavkxwe.supabase.co/storage/v1/object/public/game-assets/businesses/coffee-shop.png' WHERE name = 'Coffee Shop';
UPDATE businesses SET icon_url = 'https://dtanvjjdiyrunnavkxwe.supabase.co/storage/v1/object/public/game-assets/businesses/flower-shop.png' WHERE name = 'Flower Shop';
UPDATE businesses SET icon_url = 'https://dtanvjjdiyrunnavkxwe.supabase.co/storage/v1/object/public/game-assets/businesses/gift-shop.png' WHERE name = 'Gift Shop';
UPDATE businesses SET icon_url = 'https://dtanvjjdiyrunnavkxwe.supabase.co/storage/v1/object/public/game-assets/businesses/grocery-mini-market.png' WHERE name = 'Grocery Mini Mart';
UPDATE businesses SET icon_url = 'https://dtanvjjdiyrunnavkxwe.supabase.co/storage/v1/object/public/game-assets/businesses/hardware-store.png' WHERE name = 'Hardware Store';
UPDATE businesses SET icon_url = 'https://dtanvjjdiyrunnavkxwe.supabase.co/storage/v1/object/public/game-assets/businesses/ice-cream-shop.png' WHERE name = 'Ice Cream Shop';
UPDATE businesses SET icon_url = 'https://dtanvjjdiyrunnavkxwe.supabase.co/storage/v1/object/public/game-assets/businesses/juice-bar.png' WHERE name = 'Juice Bar';
UPDATE businesses SET icon_url = 'https://dtanvjjdiyrunnavkxwe.supabase.co/storage/v1/object/public/game-assets/businesses/laundry-service.png' WHERE name = 'Laundry Service';
UPDATE businesses SET icon_url = 'https://dtanvjjdiyrunnavkxwe.supabase.co/storage/v1/object/public/game-assets/businesses/mobile-phone-repair.png' WHERE name = 'Mobile Phone Repair';
UPDATE businesses SET icon_url = 'https://dtanvjjdiyrunnavkxwe.supabase.co/storage/v1/object/public/game-assets/businesses/pet-grooming-shop.png' WHERE name = 'Pet Grooming Salon';
UPDATE businesses SET icon_url = 'https://dtanvjjdiyrunnavkxwe.supabase.co/storage/v1/object/public/game-assets/businesses/sandwich-shop.png' WHERE name = 'Sandwich Shop';
UPDATE businesses SET icon_url = 'https://dtanvjjdiyrunnavkxwe.supabase.co/storage/v1/object/public/game-assets/businesses/shoe-repair-shop.png' WHERE name = 'Shoe Repair Shop';
UPDATE businesses SET icon_url = 'https://dtanvjjdiyrunnavkxwe.supabase.co/storage/v1/object/public/game-assets/businesses/tailor-shop.png' WHERE name = 'Tailor Shop';
UPDATE businesses SET icon_url = 'https://dtanvjjdiyrunnavkxwe.supabase.co/storage/v1/object/public/game-assets/businesses/vape-shop.png' WHERE name = 'Vape Shop';
