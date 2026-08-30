ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS payment_verification_code VARCHAR(10);
