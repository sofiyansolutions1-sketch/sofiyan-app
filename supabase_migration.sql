-- ==============================================================================
-- COMPREHENSIVE SUPABASE MIGRATION SCRIPT
-- This script safely ensures the core tables exist, data types are correct,
-- and Row Level Security (RLS) is properly configured for the app to function.
-- Run this entire script in the Supabase SQL Editor.
-- ==============================================================================

-- Enable the UUID extension if it hasn't been enabled yet
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 1. PRIMARY PARTNERS TABLE
-- ==============================================================================
-- Ensures that the primary_partners table exists and has the correct schema.
CREATE TABLE IF NOT EXISTS public.primary_partners (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    email TEXT UNIQUE NOT NULL, -- UNIQUE ensures no duplicate email signups
    phone TEXT UNIQUE NOT NULL, -- UNIQUE ensures no duplicate phone signups
    password TEXT,
    alt_phone TEXT,
    gender TEXT,
    age INTEGER,
    city TEXT,
    address TEXT,
    pincode TEXT,
    lat NUMERIC,
    lng NUMERIC,
    service_areas JSONB DEFAULT '[]'::jsonb,
    service_pincodes JSONB DEFAULT '[]'::jsonb,
    categories JSONB DEFAULT '[]'::jsonb,
    sub_categories JSONB DEFAULT '[]'::jsonb,
    experience TEXT,
    aadhar_number TEXT,
    id_proof_url TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'available', 'busy', 'on_hold', 'blocked')),
    rating NUMERIC DEFAULT 5.0 CHECK (rating >= 1.0 AND rating <= 5.0),
    review_count INTEGER DEFAULT 0,
    earnings NUMERIC DEFAULT 0,
    completed_jobs INTEGER DEFAULT 0,
    registration_fee_paid BOOLEAN DEFAULT false,
    registration_fee_screenshot TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes to speed up queries on the partners table
CREATE INDEX IF NOT EXISTS idx_primary_partners_phone ON public.primary_partners(phone);
CREATE INDEX IF NOT EXISTS idx_primary_partners_email ON public.primary_partners(email);
CREATE INDEX IF NOT EXISTS idx_primary_partners_status ON public.primary_partners(status);


-- ==============================================================================
-- 2. BOOKINGS / LEADS TABLE
-- ==============================================================================
-- Bookings essentially track leads that are passed to partners.
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_id UUID,
    customer_name TEXT NOT NULL,
    contact_number TEXT NOT NULL,
    address TEXT NOT NULL,
    area TEXT,
    city TEXT,
    pin_code TEXT,
    cart_items JSONB NOT NULL,
    price NUMERIC NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'completed', 'cancelled', 'rescheduled', 'in_progress')),
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

-- Indexes to speed up bookings queries
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON public.bookings(date);


-- ==============================================================================
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
-- Enable RLS on both tables
ALTER TABLE public.primary_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Allow the website logic to freely read and write data to these tables.
-- (This ensures your JS app can insert new partner signups without permissions errors)
DROP POLICY IF EXISTS "Public full access" ON public.primary_partners;
CREATE POLICY "Public full access" ON public.primary_partners
    FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access" ON public.bookings;
CREATE POLICY "Public full access" ON public.bookings
    FOR ALL USING (true) WITH CHECK (true);


-- ==============================================================================
-- 4. TIMESTAMPS TRIGGERS
-- ==============================================================================
-- Automatically updates the 'updated_at' column whenever a row is modified.
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_primary_partners_updated_at ON public.primary_partners;
CREATE TRIGGER set_primary_partners_updated_at
    BEFORE UPDATE ON public.primary_partners
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

DROP TRIGGER IF EXISTS set_bookings_updated_at ON public.bookings;
CREATE TRIGGER set_bookings_updated_at
    BEFORE UPDATE ON public.bookings
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();


-- ==============================================================================
-- 5. AUTH METADATA SYNC TRIGGER
-- ==============================================================================
-- If you use Supabase Authentication (auth.users), this trigger will automatically
-- mirror the new users into the primary_partners table when they sign up.
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.primary_partners (id, email, name, phone, first_name)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'first_name', '')
  )
  ON CONFLICT (email) DO NOTHING; -- Prevents errors if the email already exists
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to the auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();
