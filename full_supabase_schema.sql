-- =============================================================
-- ULTIMATE FULL SUPABASE SQL SCHEMA FOR SOFIYAN HOME SERVICE
-- =============================================================
-- This script safely drops existing tables to prevent schema cache mismatches,
-- enables required extensions, sets up core home-service tables, configures
-- triggers for automated timestamps, sets up live Supabase Realtime publishing,
-- and designates full, open client access through Row Level Security (RLS).
--
-- INSTRUCTION: Copy and paste the ENTIRETY of this file into your 
-- Supabase SQL Editor and click "Run" to perform a clean database reset.

-- =============================================================
-- SECTION 0: CLEAN SLATE RESET (SAFE DROPPING)
-- =============================================================
DROP TABLE IF EXISTS influencer_referrals CASCADE;
DROP TABLE IF EXISTS influencers CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS primary_partners CASCADE;
DROP TABLE IF EXISTS customer_followups CASCADE;
DROP TABLE IF EXISTS blog_posts CASCADE;
DROP TABLE IF EXISTS admins CASCADE;

-- Enable UUID Extension for robust primary key generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- =============================================================
-- SECTION 1: CUSTOMER PANEL DATA
-- =============================================================
CREATE TABLE customers (
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
-- SECTION 2: PRIMARY PARTNERS DATA (Self-Registered Supply Network)
-- =============================================================
CREATE TABLE primary_partners (
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
    registration_fee_paid BOOLEAN DEFAULT false,
    registration_fee_screenshot TEXT,
    
    -- Audit Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_primary_partners_phone ON primary_partners(phone);
CREATE INDEX IF NOT EXISTS idx_primary_partners_status ON primary_partners(status);


-- =============================================================
-- SECTION 3: BOOKINGS & LEAD TRANSITION DATA (Orders Panel)
-- =============================================================
CREATE TABLE bookings (
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
    commission_screenshot TEXT,
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
-- SECTION 4: CUSTOMER FOLLOW-UPS & REMINDERS (Home Services CRM)
-- =============================================================
CREATE TABLE customer_followups (
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
    
    -- Audit Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- =============================================================
-- SECTION 5: CMS BLOG POSTS DATA
-- =============================================================
CREATE TABLE blog_posts (
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
-- SECTION 6: INFLUENCERS & BOOKING REFERRALS PROGRAM
-- =============================================================
CREATE TABLE influencers (
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

CREATE TABLE influencer_referrals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    influencer_id UUID REFERENCES influencers(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    commission_earned NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Paid', 'Cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- =============================================================
-- SECTION 7: SYSTEM ADMISSIONS / SECURITY ROLE LEVELS
-- =============================================================
CREATE TABLE admins (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'manager')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- =============================================================
-- SECTION 8: DATABASE AUTOMATION SETUP (TRIGGERS & TIMESTAMP HANDLERS)
-- =============================================================
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Set Timestamps Auto-Update Triggers
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


-- Pricing Sync Automation Helper (Aligns total_price with price automatically on insertion)
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
-- SECTION 9: REAL-TIME DASHBOARD NOTIFICATIONS CONFIGURATION
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
-- SECTION 10: ROW LEVEL SECURITY RULES (RLS) FOR RAPID DATA TRANSITION
-- =============================================================
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE primary_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE influencers ENABLE ROW LEVEL SECURITY;
ALTER TABLE influencer_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_followups ENABLE ROW LEVEL SECURITY;

-- Setup full standard bypass policies for quick frontend client access
DROP POLICY IF EXISTS "Public full access customers" ON customers;
DROP POLICY IF EXISTS "Public full access bookings" ON bookings;
DROP POLICY IF EXISTS "Public full access blog_posts" ON blog_posts;
DROP POLICY IF EXISTS "Public full access primary_partners" ON primary_partners;
DROP POLICY IF EXISTS "Public full access admins" ON admins;
DROP POLICY IF EXISTS "Public full access influencers" ON influencers;
DROP POLICY IF EXISTS "Public full access influencer_referrals" ON influencer_referrals;
DROP POLICY IF EXISTS "Public full access customer_followups" ON customer_followups;

CREATE POLICY "Public full access customers" ON customers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access bookings" ON bookings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access blog_posts" ON blog_posts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access primary_partners" ON primary_partners FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access admins" ON admins FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access influencers" ON influencers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access influencer_referrals" ON influencer_referrals FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access customer_followups" ON customer_followups FOR ALL USING (true) WITH CHECK (true);
