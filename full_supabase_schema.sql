-- =============================================================
-- ULTIMATE FULL SUPABASE SQL SCHEMA FOR SOFIYAN HOME SERVICE
-- =============================================================
-- This file provides the full, unified database schema categorized
-- category-by-category to store all active features of your website:
-- Customer Panel, Reminders & Customer Follow-up System, Blogs,
-- Primary Partner Panel, Admin Panel, and Influencer/Referral System.
--
-- REMOVED: Unused general CRM table (`leads`)
-- REMOVED: Web development specific tags (`web_dev_leads`)
-- RETAINED & RENAMED: Follow-up / Reminders system for home services -> `customer_followups`
-- ADDED: Automatic synchronization trigger for booking prices (price <-> total_price)
--

-- Enable UUID Extension for robust unique IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- =============================================================
-- CATEGORY 1: CUSTOMER PANEL DATA
-- =============================================================

CREATE TABLE IF NOT EXISTS customers (
    -- Primary Identity
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Personal Contact Details
    full_name TEXT NOT NULL,
    phone_number TEXT UNIQUE NOT NULL,
    email TEXT,
    
    -- Service Location Defaults
    address TEXT,
    city TEXT,
    pincode TEXT,
    
    -- Audit Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone_number);


-- =============================================================
-- CATEGORY 2: PRIMARY PARTNERS DATA (Self-Registered & Managed Supply)
-- =============================================================

CREATE TABLE IF NOT EXISTS primary_partners (
    -- Primary Identity
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Personal Details
    name TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    email TEXT UNIQUE NOT NULL,
    phone TEXT UNIQUE NOT NULL,
    alt_phone TEXT,
    gender TEXT,
    age INTEGER,
    
    -- Geographic Details & Coverage
    city TEXT,
    address TEXT,
    pincode TEXT,
    lat NUMERIC,
    lng NUMERIC,
    service_areas JSONB DEFAULT '[]',     -- JSON array of locality names covered
    service_pincodes JSONB DEFAULT '[]',  -- JSON array of zip codes covered
    
    -- Experience & Expertise
    categories JSONB DEFAULT '[]',        -- JSON array of operational job categories
    sub_categories JSONB DEFAULT '[]',    -- JSON array of specialty skills
    experience TEXT,                      -- Years of experience or statement
    
    -- Identity & Verification Profile
    aadhar_number TEXT,                   -- Store 12-digit Aadhaar number for security
    id_proof_url TEXT,                    -- Reference to uploaded verification document
    
    -- Professional Stats & Reputation
    status TEXT DEFAULT 'available' CHECK (status IN ('pending', 'available', 'busy', 'on_hold', 'blocked')),
    rating NUMERIC DEFAULT 5.0 CHECK (rating >= 1.0 AND rating <= 5.0), -- Average rating 1 to 5
    review_count INTEGER DEFAULT 0,       -- Count of total completed ratings
    earnings NUMERIC DEFAULT 0,           -- Total earnings payouts
    completed_jobs INTEGER DEFAULT 0,     -- Total completed orders
    
    -- Audit Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_primary_partners_phone ON primary_partners(phone);
CREATE INDEX IF NOT EXISTS idx_primary_partners_status ON primary_partners(status);


-- =============================================================
-- CATEGORY 3: BOOKINGS & LEAD TRANSITION DATA (Orders Panel)
-- =============================================================

CREATE TABLE IF NOT EXISTS bookings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    
    -- Customer Profile snapshot at booking time
    customer_name TEXT NOT NULL,
    contact_number TEXT NOT NULL,
    
    -- Venue & Routing Coordinates
    address TEXT NOT NULL,
    area TEXT,
    city TEXT,
    pin_code TEXT,
    location_link TEXT,
    lat NUMERIC,
    lng NUMERIC,
    
    -- Service Specifics
    service_category TEXT,                -- Primary category of service
    sub_service_name TEXT,                -- Formatted readable summary of sub-services list
    cart_items JSONB DEFAULT '[]',        -- Detailed configuration and quantities of services
    description TEXT,
    
    -- Scheduling
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    
    -- Pricing, Discounts & Payment
    price NUMERIC NOT NULL DEFAULT 0,      -- Booking price after discounts
    total_price NUMERIC DEFAULT 0,         -- Matches price for Influencer Portal / stat aggregation
    discount_amount NUMERIC DEFAULT 0,
    commission_paid BOOLEAN DEFAULT FALSE,
    applied_referral_code TEXT,
    coupon_used TEXT,
    
    -- Partner Assignment & State Tracker
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'completed', 'cancelled', 'Forwarded', 'on_hold')),
    assigned_partner_id UUID REFERENCES primary_partners(id) ON DELETE SET NULL,
    assigned_partner_name TEXT,
    assigned_partner_phone TEXT,
    assigned_partner_area TEXT,
    
    -- Technician Rating for this booking (1 to 5)
    partner_rating INTEGER CHECK (partner_rating >= 1 AND partner_rating <= 5),
    
    -- Audit Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(date);
CREATE INDEX IF NOT EXISTS idx_bookings_pincode ON bookings(pin_code);


-- =============================================================
-- CATEGORY 4: CUSTOMER FOLLOW-UPS & REMINDERS (Home Services CRM)
-- =============================================================

CREATE TABLE IF NOT EXISTS customer_followups (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    contact_number TEXT NOT NULL,
    service_type TEXT NOT NULL,
    service_charge NUMERIC DEFAULT 0,
    amount_paid NUMERIC DEFAULT 0,
    requirement TEXT,
    follow_up_datetime TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    address TEXT,
    city TEXT,
    location_url TEXT,
    
    -- Categorized Status metrics
    status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Contacted', 'Agreed', 'Declined')),
    project_status TEXT DEFAULT 'Lead' CHECK (project_status IN ('Lead', 'In Progress', 'Built', 'Delivered')),
    payment_status TEXT DEFAULT 'Unpaid' CHECK (payment_status IN ('Unpaid', 'Partial', 'Paid')),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- =============================================================
-- CATEGORY 5: CMS BLOG POSTS DATA
-- =============================================================

CREATE TABLE IF NOT EXISTS blog_posts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    image_url TEXT,
    author TEXT DEFAULT 'Admin',
    author_name TEXT DEFAULT 'Admin',
    sub_heading TEXT,
    target_keywords TEXT,
    target_locations JSONB DEFAULT '[]', -- Cities/Areas targeted
    service_category TEXT,
    related_service TEXT,
    meta_title TEXT,
    meta_description TEXT,
    published BOOLEAN DEFAULT true,
    status TEXT DEFAULT 'published',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);


-- =============================================================
-- CATEGORY 6: INFLUENCERS & BOOKING REFERRALS PROGRAM
-- =============================================================

CREATE TABLE IF NOT EXISTS influencers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    page_name TEXT UNIQUE NOT NULL,        -- Handle or Instagram identifier
    contact_number TEXT UNIQUE NOT NULL,   -- Active WhatsApp communication line
    referral_code TEXT UNIQUE NOT NULL,    -- Custom promotional code (e.g., SOF20)
    password TEXT NOT NULL,                -- Profile control access password
    commission_rate NUMERIC DEFAULT 20.0,  -- default 20% cut for referred completed jobs
    total_earnings NUMERIC DEFAULT 0,
    total_referrals INTEGER DEFAULT 0,
    status TEXT DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS influencer_referrals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    influencer_id UUID REFERENCES influencers(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    commission_earned NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Paid', 'Cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- =============================================================
-- CATEGORY 7: SYSTEM ADMISSIONS / SECURITY ROLE LEVELS
-- =============================================================

CREATE TABLE IF NOT EXISTS admins (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'manager')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- =============================================================
-- DATABASE AUTOMATION SETUP (TRIGGERS & REPLICATIONS)
-- =============================================================

-- Auto Timestamp Generator Function
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Set Triggers for Auto-Updated values
DROP TRIGGER IF EXISTS set_bookings_updated_at ON bookings;
CREATE TRIGGER set_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

DROP TRIGGER IF EXISTS set_primary_partners_updated_at ON primary_partners;
CREATE TRIGGER set_primary_partners_updated_at BEFORE UPDATE ON primary_partners FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

DROP TRIGGER IF EXISTS set_customers_updated_at ON customers;
CREATE TRIGGER set_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

DROP TRIGGER IF EXISTS set_influencers_updated_at ON influencers;
CREATE TRIGGER set_influencers_updated_at BEFORE UPDATE ON influencers FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

DROP TRIGGER IF EXISTS set_customer_followups_updated_at ON customer_followups;
CREATE TRIGGER set_customer_followups_updated_at BEFORE UPDATE ON customer_followups FOR EACH ROW EXECUTE FUNCTION handle_updated_at();


-- Pricing Sync Automation helper (Aligns total_price with price automatically on insertion)
CREATE OR REPLACE FUNCTION sync_booking_total_price()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.total_price IS NULL OR NEW.total_price <= 0 THEN
        NEW.total_price := NEW.price;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_sync_booking_total_price ON bookings;
CREATE TRIGGER trigger_sync_booking_total_price BEFORE INSERT OR UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION sync_booking_total_price();


-- =============================================================
-- REAL-TIME DASHBOARD NOTIFICATIONS CONFIGURATION
-- =============================================================

-- Add live-action triggers to Supabase Realtime channel
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime;
COMMIT;

ALTER PUBLICATION supabase_realtime ADD TABLE bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE primary_partners;
ALTER PUBLICATION supabase_realtime ADD TABLE influencers;
ALTER PUBLICATION supabase_realtime ADD TABLE customer_followups;


-- =============================================================
-- ROW LEVEL SECURITY RULES (RLS) FOR FULL APP TRANSITIONS
-- =============================================================

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE primary_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE influencers ENABLE ROW LEVEL SECURITY;
ALTER TABLE influencer_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_followups ENABLE ROW LEVEL SECURITY;

-- Setup full read-write policy permissions for rapid client access
CREATE POLICY "Public full access customers" ON customers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access bookings" ON bookings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access blog_posts" ON blog_posts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access primary_partners" ON primary_partners FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access admins" ON admins FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access influencers" ON influencers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access influencer_referrals" ON influencer_referrals FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access customer_followups" ON customer_followups FOR ALL USING (true) WITH CHECK (true);


-- =============================================================
-- MIGRATION & CACHE ALIGNMENT (RUN THESE TO FIX CACHE/MISSING COLUMN ERRORS)
-- =============================================================
-- If you have an existing database, copy and run these ALTER TABLE statements
-- in your Supabase SQL Editor to make sure all expected fields are present:

-- 1. Fix blog_posts table columns (Expected by local BlogManager component)
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS author TEXT DEFAULT 'Admin';
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS author_name TEXT DEFAULT 'Admin';
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS sub_heading TEXT;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS target_keywords TEXT;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS related_service TEXT;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'published';

-- 2. Fix primary_partners table columns (Expected by self-registration & edit profiles)
ALTER TABLE primary_partners ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE primary_partners ADD COLUMN IF NOT EXISTS last_name TEXT;
ALTER TABLE primary_partners ADD COLUMN IF NOT EXISTS alt_phone TEXT;
ALTER TABLE primary_partners ADD COLUMN IF NOT EXISTS age INTEGER;
ALTER TABLE primary_partners ADD COLUMN IF NOT EXISTS service_areas JSONB DEFAULT '[]';
ALTER TABLE primary_partners ADD COLUMN IF NOT EXISTS service_pincodes JSONB DEFAULT '[]';
ALTER TABLE primary_partners ADD COLUMN IF NOT EXISTS categories JSONB DEFAULT '[]';
ALTER TABLE primary_partners ADD COLUMN IF NOT EXISTS sub_categories JSONB DEFAULT '[]';
ALTER TABLE primary_partners ADD COLUMN IF NOT EXISTS aadhar_number TEXT;
ALTER TABLE primary_partners ADD COLUMN IF NOT EXISTS id_proof_url TEXT;
ALTER TABLE primary_partners ADD COLUMN IF NOT EXISTS completed_jobs INTEGER DEFAULT 0;
ALTER TABLE primary_partners ADD COLUMN IF NOT EXISTS earnings NUMERIC DEFAULT 0;
ALTER TABLE primary_partners ADD COLUMN IF NOT EXISTS lat NUMERIC;
ALTER TABLE primary_partners ADD COLUMN IF NOT EXISTS lng NUMERIC;
ALTER TABLE primary_partners ADD COLUMN IF NOT EXISTS rating NUMERIC DEFAULT 5.0;
ALTER TABLE primary_partners ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;
ALTER TABLE primary_partners ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'available';

-- 3. Fix bookings table columns (For assigned technician service area tracking)
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS assigned_partner_area TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS area TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS city TEXT;

