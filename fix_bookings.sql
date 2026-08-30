DO $$ 
BEGIN
    -- Rename columns if they exist (handling the previous SQL I gave)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='customer_phone') THEN
        ALTER TABLE public.bookings RENAME COLUMN customer_phone TO contact_number;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='customer_address') THEN
        ALTER TABLE public.bookings RENAME COLUMN customer_address TO address;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='pincode') THEN
        ALTER TABLE public.bookings RENAME COLUMN pincode TO pin_code;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='service_date') THEN
        ALTER TABLE public.bookings RENAME COLUMN service_date TO date;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='service_time') THEN
        ALTER TABLE public.bookings RENAME COLUMN service_time TO time;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='total_price') THEN
        ALTER TABLE public.bookings RENAME COLUMN total_price TO price;
    END IF;
END $$;

ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL;
