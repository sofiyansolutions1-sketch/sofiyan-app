-- 1. Rename columns back to what the frontend expects
ALTER TABLE public.bookings RENAME COLUMN customer_phone TO contact_number;
ALTER TABLE public.bookings RENAME COLUMN customer_address TO address;
ALTER TABLE public.bookings RENAME COLUMN pincode TO pin_code;
ALTER TABLE public.bookings RENAME COLUMN service_date TO date;
ALTER TABLE public.bookings RENAME COLUMN service_time TO time;
ALTER TABLE public.bookings RENAME COLUMN total_price TO price;

-- 2. Add missing columns
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL;
