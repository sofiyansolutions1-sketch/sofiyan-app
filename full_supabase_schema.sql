-- ==========================================
-- FULL SUPABASE SQL SCHEMA FOR HOME SERVICES
-- ==========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. CUSTOMERS (Customer Panel)
-- ==========================================
CREATE TABLE IF NOT EXISTS customers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    full_name TEXT NOT NULL,
    phone_number TEXT UNIQUE NOT NULL,
    email TEXT,
    address TEXT,
    city TEXT,
    pincode TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 2. BOOKINGS (Customer & Admin Panel)
-- ==========================================
CREATE TABLE IF NOT EXISTS bookings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    contact_number TEXT NOT NULL,
    address TEXT NOT NULL,
    location_link TEXT,
    city TEXT,
    area TEXT,
    pin_code TEXT,
    lat NUMERIC,
    lng NUMERIC,
    description TEXT,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    service_category TEXT,
    sub_service_name TEXT,
    cart_items JSONB DEFAULT '[]',
    price NUMERIC,
    discount_amount NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'pending',
    assigned_partner_id UUID,
    assigned_partner_name TEXT,
    assigned_partner_phone TEXT,
    commission_paid BOOLEAN DEFAULT FALSE,
    applied_referral_code TEXT,
    coupon_used TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 3. LEADS (Today's Follow-ups / CRM)
-- ==========================================
CREATE TABLE IF NOT EXISTS leads (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    service_interested TEXT NOT NULL,
    follow_up_date DATE,
    notes TEXT,
    status TEXT DEFAULT 'pending',
    source TEXT DEFAULT 'website',
    city TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 4. BLOG POSTS (Blogs)
-- ==========================================
CREATE TABLE IF NOT EXISTS blog_posts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    image_url TEXT,
    author_name TEXT DEFAULT 'Admin',
    target_locations JSONB DEFAULT '[]',
    service_category TEXT,
    meta_title TEXT,
    meta_description TEXT,
    published BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 5. PRIMARY PARTNERS (Partner Panel)
-- ==========================================
CREATE TABLE IF NOT EXISTS primary_partners (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    phone TEXT UNIQUE NOT NULL,
    email TEXT,
    gender TEXT,
    city TEXT,
    address TEXT,
    pincode TEXT,
    service_areas JSONB DEFAULT '[]',
    service_pincodes JSONB DEFAULT '[]',
    categories JSONB DEFAULT '[]',
    sub_categories JSONB DEFAULT '[]',
    experience TEXT,
    status TEXT DEFAULT 'available',
    lat NUMERIC,
    lng NUMERIC,
    earnings NUMERIC DEFAULT 0,
    completed_jobs INTEGER DEFAULT 0,
    rating NUMERIC DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 6. SECONDARY PARTNERS (Admin Panel)
-- ==========================================
CREATE TABLE IF NOT EXISTS secondary_partners (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    phone TEXT UNIQUE NOT NULL,
    email TEXT,
    gender TEXT,
    city TEXT,
    address TEXT,
    pincode TEXT,
    service_areas JSONB DEFAULT '[]',
    service_pincodes JSONB DEFAULT '[]',
    categories JSONB DEFAULT '[]',
    sub_categories JSONB DEFAULT '[]',
    experience TEXT,
    status TEXT DEFAULT 'available',
    lat NUMERIC,
    lng NUMERIC,
    earnings NUMERIC DEFAULT 0,
    completed_jobs INTEGER DEFAULT 0,
    rating NUMERIC DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 7. ADMINS (Admin Panel)
-- ==========================================
CREATE TABLE IF NOT EXISTS admins (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT DEFAULT 'superadmin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 8. INFLUENCERS (Influencer Panel)
-- ==========================================
CREATE TABLE IF NOT EXISTS influencers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    platform TEXT,
    handle TEXT,
    phone_number TEXT UNIQUE NOT NULL,
    email TEXT,
    referral_code TEXT UNIQUE NOT NULL,
    commission_rate NUMERIC DEFAULT 10.0,
    total_earnings NUMERIC DEFAULT 0,
    total_referrals INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 9. INFLUENCER REFERRALS (Tracking)
-- ==========================================
CREATE TABLE IF NOT EXISTS influencer_referrals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    influencer_id UUID REFERENCES influencers(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    commission_earned NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'Pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 10. WEB DEV LEADS & CRM 
-- ==========================================
CREATE TABLE IF NOT EXISTS web_dev_leads (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    contact_number TEXT NOT NULL,
    service_type TEXT NOT NULL,
    service_charge NUMERIC,
    amount_paid NUMERIC DEFAULT 0,
    requirement TEXT,
    follow_up_datetime TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    status TEXT DEFAULT 'Pending',
    project_status TEXT DEFAULT 'Lead',
    payment_status TEXT DEFAULT 'Unpaid',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================
-- Enable RLS on all tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE primary_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE secondary_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE influencers ENABLE ROW LEVEL SECURITY;
ALTER TABLE influencer_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE web_dev_leads ENABLE ROW LEVEL SECURITY;

-- Create basic policies to allow public/authenticated access for the MVP
-- Note: For a production app, you should restrict these using Supabase Auth (auth.uid())
CREATE POLICY "Allow public access to customers" ON customers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to bookings" ON bookings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to leads" ON leads FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to blog_posts" ON blog_posts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to primary_partners" ON primary_partners FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to secondary_partners" ON secondary_partners FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to admins" ON admins FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to influencers" ON influencers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to influencer_referrals" ON influencer_referrals FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to web_dev_leads" ON web_dev_leads FOR ALL USING (true) WITH CHECK (true);

-- Enable Realtime for all tables (so the dashboard updates instantly)
-- Note: supabase_realtime publication exists by default in Supabase.
ALTER PUBLICATION supabase_realtime ADD TABLE primary_partners;
ALTER PUBLICATION supabase_realtime ADD TABLE secondary_partners;
ALTER PUBLICATION supabase_realtime ADD TABLE bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE leads;
ALTER PUBLICATION supabase_realtime ADD TABLE blog_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE web_dev_leads;
