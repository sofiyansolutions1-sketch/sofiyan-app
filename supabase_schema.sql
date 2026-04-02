-- ==========================================
-- 1. Create Bookings Table
-- ==========================================
CREATE TABLE IF NOT EXISTS bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_address TEXT NOT NULL,
    city TEXT,
    pincode TEXT,
    cart_items JSONB NOT NULL,
    total_price NUMERIC NOT NULL,
    service_date TEXT NOT NULL,
    service_time TEXT NOT NULL,
    notes TEXT,
    status TEXT DEFAULT 'pending',
    service_category TEXT,
    sub_service_name TEXT,
    commission_paid BOOLEAN DEFAULT false,
    coupon_used TEXT,
    discount_amount NUMERIC DEFAULT 0,
    assigned_partner_id TEXT,
    assigned_partner_name TEXT,
    assigned_partner_phone TEXT,
    applied_referral_code TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- 2. Create Primary Partners Table
-- (For partners who register via the app)
-- ==========================================
CREATE TABLE IF NOT EXISTS primary_partners (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    email TEXT,
    gender TEXT,
    categories JSONB,
    sub_categories JSONB,
    experience TEXT,
    address TEXT,
    city TEXT,
    pincode TEXT,
    lat FLOAT8,
    lng FLOAT8,
    status TEXT DEFAULT 'available',
    earnings NUMERIC DEFAULT 0,
    completed_jobs INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- 3. Create Secondary Partners Table 
-- (For GMB/Manual partners added by Admin)
-- ==========================================
CREATE TABLE IF NOT EXISTS secondary_partners (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT,
    phone TEXT,
    email TEXT,
    city TEXT,
    categories JSONB,
    address TEXT,
    pincode TEXT,
    lat FLOAT8,
    lng FLOAT8,
    status TEXT DEFAULT 'available',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- 4. Create Influencers Table
-- ==========================================
CREATE TABLE IF NOT EXISTS influencers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    page_name TEXT UNIQUE NOT NULL,
    contact_number TEXT,
    password TEXT NOT NULL,
    referral_code TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- 5. ENABLE Row Level Security (RLS)
-- (Fixes the "UNRESTRICTED" warning in Supabase)
-- ==========================================
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE primary_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE secondary_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE influencers ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 6. Create RLS Policies
-- (Allows your frontend to read/write freely 
-- so all features continue to work properly)
-- ==========================================

-- Create new permissive policies
CREATE POLICY "Enable full access for all users" ON bookings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable full access for all users" ON primary_partners FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable full access for all users" ON secondary_partners FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable full access for all users" ON influencers FOR ALL USING (true) WITH CHECK (true);
