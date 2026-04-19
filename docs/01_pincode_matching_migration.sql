-- PART 1: Update Bookings Table
-- Ensure pincode exists (Your app may already use 'pinCode' / 'pincode', this guarantees existence)
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS pincode TEXT;

-- PART 2: Update Partners Table
-- Add service_pincodes to store an array of discovered 6-digit pincodes from the India Post API
ALTER TABLE public.primary_partners ADD COLUMN IF NOT EXISTS service_areas TEXT[];
ALTER TABLE public.primary_partners ADD COLUMN IF NOT EXISTS service_pincodes TEXT[];

ALTER TABLE public.secondary_partners ADD COLUMN IF NOT EXISTS service_areas TEXT[];
ALTER TABLE public.secondary_partners ADD COLUMN IF NOT EXISTS service_pincodes TEXT[];
