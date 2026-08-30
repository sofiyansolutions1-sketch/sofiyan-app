-- Drop existing policies to avoid errors during recreation
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Enable read access for all users" ON public.primary_partners;
    DROP POLICY IF EXISTS "Enable insert for all users" ON public.primary_partners;
    DROP POLICY IF EXISTS "Enable update for all users" ON public.primary_partners;
    
    DROP POLICY IF EXISTS "Enable read access for all users" ON public.bookings;
    DROP POLICY IF EXISTS "Enable insert for all users" ON public.bookings;
    DROP POLICY IF EXISTS "Enable update for all users" ON public.bookings;

    DROP POLICY IF EXISTS "Enable read access for all users" ON public.areas;
    DROP POLICY IF EXISTS "Enable insert for all users" ON public.areas;
    DROP POLICY IF EXISTS "Enable update for all users" ON public.areas;

    DROP POLICY IF EXISTS "Enable read access for all users" ON public.customers;
    DROP POLICY IF EXISTS "Enable insert for all users" ON public.customers;
    DROP POLICY IF EXISTS "Enable update for all users" ON public.customers;

    DROP POLICY IF EXISTS "Enable read access for all users" ON public.blog_posts;
    DROP POLICY IF EXISTS "Enable insert for all users" ON public.blog_posts;
    DROP POLICY IF EXISTS "Enable update for all users" ON public.blog_posts;
    DROP POLICY IF EXISTS "Enable delete for all users" ON public.blog_posts;

    DROP POLICY IF EXISTS "Enable read access for all users" ON public.customer_followups;
    DROP POLICY IF EXISTS "Enable insert for all users" ON public.customer_followups;
    DROP POLICY IF EXISTS "Enable update for all users" ON public.customer_followups;
    DROP POLICY IF EXISTS "Enable delete for all users" ON public.customer_followups;
EXCEPTION WHEN OTHERS THEN
    -- Ignore errors
END $$;

-- 1. Create primary_partners table
CREATE TABLE IF NOT EXISTS public.primary_partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    phone TEXT UNIQUE,
    alt_phone TEXT,
    gender TEXT,
    age INTEGER,
    address TEXT,
    city TEXT,
    pincode TEXT,
    lat NUMERIC,
    lng NUMERIC,
    partner_type TEXT DEFAULT 'Primary',
    categories JSONB DEFAULT '[]'::jsonb,
    sub_categories JSONB DEFAULT '[]'::jsonb,
    service_areas JSONB DEFAULT '[]'::jsonb,
    service_pincodes JSONB DEFAULT '[]'::jsonb,
    experience TEXT,
    password TEXT,
    aadhar_number TEXT,
    id_proof_url TEXT,
    status TEXT DEFAULT 'pending',
    rating NUMERIC DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    earnings NUMERIC DEFAULT 0,
    completed_jobs INTEGER DEFAULT 0,
    registration_fee_paid BOOLEAN DEFAULT false,
    registration_fee_screenshot TEXT,
    wallet_balance NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.primary_partners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON public.primary_partners FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON public.primary_partners FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON public.primary_partners FOR UPDATE USING (true);

-- 2. Create bookings table
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_address TEXT NOT NULL,
    area TEXT,
    city TEXT,
    location TEXT,
    location_link TEXT,
    lat NUMERIC,
    lng NUMERIC,
    pincode TEXT NOT NULL,
    description TEXT,
    service_date TEXT NOT NULL,
    service_time TEXT NOT NULL,
    service_category TEXT NOT NULL,
    sub_service_name TEXT,
    cart_items JSONB DEFAULT '[]'::jsonb,
    total_price NUMERIC NOT NULL,
    status TEXT DEFAULT 'pending',
    assigned_partner_id UUID REFERENCES public.primary_partners(id),
    assigned_partner_name TEXT,
    assigned_partner_phone TEXT,
    assigned_partner_area TEXT,
    commission_paid BOOLEAN DEFAULT false,
    commission_screenshot TEXT,
    partner_rating INTEGER,
    coupon_used TEXT,
    discount_amount NUMERIC DEFAULT 0,
    applied_referral_code TEXT,
    booking_fee NUMERIC DEFAULT 0,
    booking_fee_paid BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON public.bookings FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON public.bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON public.bookings FOR UPDATE USING (true);

-- 3. Create customers table
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    phone_number TEXT NOT NULL UNIQUE,
    address TEXT,
    city TEXT,
    pincode TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON public.customers FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON public.customers FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON public.customers FOR UPDATE USING (true);

-- 4. Create blog_posts table
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    sub_heading TEXT,
    target_keywords TEXT,
    target_locations TEXT,
    meta_description TEXT,
    related_service TEXT,
    image_url TEXT,
    content TEXT,
    author TEXT,
    status TEXT DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON public.blog_posts FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON public.blog_posts FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON public.blog_posts FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON public.blog_posts FOR DELETE USING (true);

-- 5. Create customer_followups table
CREATE TABLE IF NOT EXISTS public.customer_followups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    contact_number TEXT NOT NULL,
    service_type TEXT,
    service_charge NUMERIC DEFAULT 0,
    amount_paid NUMERIC DEFAULT 0,
    requirement TEXT,
    follow_up_datetime TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    address TEXT,
    city TEXT,
    location_url TEXT,
    status TEXT DEFAULT 'Lead',
    project_status TEXT DEFAULT 'Lead',
    payment_status TEXT DEFAULT 'Unpaid',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.customer_followups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON public.customer_followups FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON public.customer_followups FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON public.customer_followups FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON public.customer_followups FOR DELETE USING (true);

-- 6. Create areas table (Static table, just in case)
CREATE TABLE IF NOT EXISTS public.areas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    pincodes JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.areas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON public.areas FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON public.areas FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON public.areas FOR UPDATE USING (true);
