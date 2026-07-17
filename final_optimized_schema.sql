-- ==============================================================================
-- CLEAN, FUNCTIONAL SUPABASE MIGRATION SCRIPT (ONLY REQUIRED TABLES & COLUMNS)
-- This script contains exactly the 4 functional tables (Customers, Partners, Bookings, Blog Posts)
-- with no extra unused columns, matching your website's data flow precisely.
-- ==============================================================================

-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 1. CUSTOMERS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    full_name TEXT NOT NULL,
    phone_number TEXT UNIQUE NOT NULL,
    address TEXT,
    city TEXT,
    pincode TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- 2. PRIMARY PARTNERS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.primary_partners (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    email TEXT UNIQUE NOT NULL,
    phone TEXT UNIQUE NOT NULL,
    password TEXT,
    alt_phone TEXT,
    gender TEXT,
    age INTEGER,
    city TEXT,
    pincode TEXT,
    service_pincodes JSONB DEFAULT '[]'::jsonb,
    categories JSONB DEFAULT '[]'::jsonb,
    sub_categories JSONB DEFAULT '[]'::jsonb,
    experience TEXT,
    aadhar_number TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'available', 'busy', 'on_hold', 'blocked')),
    rating NUMERIC DEFAULT 5.0 CHECK (rating >= 1.0 AND rating <= 5.0),
    review_count INTEGER DEFAULT 0,
    earnings NUMERIC DEFAULT 0,
    completed_jobs INTEGER DEFAULT 0,
    registration_fee_paid BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_primary_partners_phone ON public.primary_partners(phone);
CREATE INDEX IF NOT EXISTS idx_primary_partners_email ON public.primary_partners(email);

-- ==============================================================================
-- 3. BOOKINGS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    contact_number TEXT NOT NULL,
    address TEXT NOT NULL,
    area TEXT,
    city TEXT,
    pin_code TEXT,
    cart_items JSONB NOT NULL,
    price NUMERIC NOT NULL DEFAULT 0,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'completed', 'cancelled', 'rescheduled', 'in_progress', 'Forwarded', 'on_hold', 'admin_review')),
    service_category TEXT,
    sub_service_name TEXT,
    location_link TEXT,
    lat NUMERIC,
    lng NUMERIC,
    discount_amount NUMERIC DEFAULT 0,
    applied_referral_code TEXT,
    commission_paid BOOLEAN DEFAULT false,
    commission_screenshot TEXT,
    assigned_partner_id UUID REFERENCES public.primary_partners(id) ON DELETE SET NULL,
    assigned_partner_name TEXT,
    assigned_partner_phone TEXT,
    assigned_partner_area TEXT,
    partner_rating INTEGER CHECK (partner_rating >= 1 AND partner_rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON public.bookings(date);

-- ==============================================================================
-- 4. BLOG POSTS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content TEXT NOT NULL,
    sub_heading TEXT,
    target_locations JSONB DEFAULT '[]'::jsonb,
    meta_description TEXT,
    image_url TEXT,
    status TEXT DEFAULT 'published',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts(slug);

-- ==============================================================================
-- REALTIME SUBSCRIPTIONS
-- ==============================================================================
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime;
COMMIT;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.primary_partners;

-- ==============================================================================
-- TIMESTAMPS TRIGGERS
-- ==============================================================================
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_primary_partners_updated_at ON public.primary_partners;
CREATE TRIGGER set_primary_partners_updated_at BEFORE UPDATE ON public.primary_partners FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

DROP TRIGGER IF EXISTS set_bookings_updated_at ON public.bookings;
CREATE TRIGGER set_bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

DROP TRIGGER IF EXISTS set_customers_updated_at ON public.customers;
CREATE TRIGGER set_customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.primary_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public full access" ON public.customers;
CREATE POLICY "Public full access" ON public.customers FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access" ON public.primary_partners;
CREATE POLICY "Public full access" ON public.primary_partners FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access" ON public.bookings;
CREATE POLICY "Public full access" ON public.bookings FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access" ON public.blog_posts;
CREATE POLICY "Public full access" ON public.blog_posts FOR ALL USING (true) WITH CHECK (true);
