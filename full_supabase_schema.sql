-- ==========================================
-- FULL SUPABASE SCHEMA FOR SOFIYAN HOME SERVICES
-- ==========================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. CUSTOMERS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS customers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT UNIQUE NOT NULL,
    email TEXT,
    address TEXT,
    city TEXT,
    pincode TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- 2. BOOKINGS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS bookings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
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
-- 3. PRIMARY PARTNERS TABLE (App Registered)
-- ==========================================
CREATE TABLE IF NOT EXISTS primary_partners (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    first_name TEXT,
    last_name TEXT,
    phone TEXT UNIQUE,
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
-- 4. SECONDARY PARTNERS TABLE (Admin Added)
-- ==========================================
CREATE TABLE IF NOT EXISTS secondary_partners (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
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
    earnings NUMERIC DEFAULT 0,
    completed_jobs INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- 5. INFLUENCERS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS influencers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    page_name TEXT UNIQUE NOT NULL,
    contact_number TEXT,
    password TEXT NOT NULL,
    referral_code TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- 6. BLOG POSTS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS blog_posts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    sub_heading TEXT,
    content TEXT,
    meta_description TEXT,
    target_keywords TEXT,
    target_locations TEXT,
    related_service TEXT,
    author TEXT DEFAULT 'Admin',
    status TEXT DEFAULT 'published',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- 7. ADMINS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS admins (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'superadmin',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- 8. ENABLE ROW LEVEL SECURITY (RLS)
-- ==========================================
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE primary_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE secondary_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE influencers ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 9. CREATE RLS POLICIES (Permissive for MVP)
-- ==========================================
-- Customers
CREATE POLICY "Allow all operations on customers" ON customers FOR ALL USING (true);

-- Bookings
CREATE POLICY "Allow all operations on bookings" ON bookings FOR ALL USING (true);

-- Primary Partners
CREATE POLICY "Allow all operations on primary_partners" ON primary_partners FOR ALL USING (true);

-- Secondary Partners
CREATE POLICY "Allow all operations on secondary_partners" ON secondary_partners FOR ALL USING (true);

-- Influencers
CREATE POLICY "Allow all operations on influencers" ON influencers FOR ALL USING (true);

-- Blog Posts
CREATE POLICY "Allow all operations on blog_posts" ON blog_posts FOR ALL USING (true);

-- Admins
CREATE POLICY "Allow all operations on admins" ON admins FOR ALL USING (true);
