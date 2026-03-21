-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- 1. Create Primary Partners Table
-- This table stores profile information for verified service partners.
-- The 'id' links directly to Supabase Auth 'users' table.
create table public.primary_partners (
  id uuid references auth.users not null primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  first_name text not null,
  last_name text,
  phone text,
  email text,
  gender text,
  categories text[] default '{}', -- Array of service categories (e.g., ['Electrician', 'Plumber'])
  sub_categories text[] default '{}', -- Array of specific services (e.g., ['AC Repair'])
  experience text,
  address text,
  city text,
  pincode text,
  lat numeric,
  lng numeric,
  status text default 'available', -- 'available', 'busy'
  earnings numeric default 0,
  completed_jobs integer default 0,
  is_verified boolean default false
);

-- Indexes for Primary Partners Search Performance
create index if not exists primary_partners_city_idx on public.primary_partners (city);
create index if not exists primary_partners_pincode_idx on public.primary_partners (pincode);
create index if not exists primary_partners_status_idx on public.primary_partners (status);
create index if not exists primary_partners_categories_idx on public.primary_partners using gin (categories);

-- 2. Create Secondary Partners Table
-- This table stores profile information for GMB / Bulk uploaded partners.
create table public.secondary_partners (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  phone text,
  email text,
  categories text[] default '{}',
  address text,
  city text,
  pincode text,
  lat numeric,
  lng numeric,
  status text default 'available',
  earnings numeric default 0,
  completed_jobs integer default 0,
  is_verified boolean default false
);

-- Indexes for Secondary Partners Search Performance
create index if not exists secondary_partners_city_idx on public.secondary_partners (city);
create index if not exists secondary_partners_pincode_idx on public.secondary_partners (pincode);
create index if not exists secondary_partners_status_idx on public.secondary_partners (status);
create index if not exists secondary_partners_categories_idx on public.secondary_partners using gin (categories);

-- 3. Create Bookings Table
-- This table stores all customer service requests.
create table public.bookings (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  customer_name text not null,
  customer_phone text not null,
  customer_address text not null,
  city text,
  pincode text,
  cart_items jsonb, -- Stores the array of selected services as JSON
  total_price numeric,
  service_date text,
  service_time text,
  notes text,
  status text default 'pending', -- 'pending', 'accepted', 'completed', 'cancelled'
  service_category text, -- Primary category for filtering
  sub_service_name text, -- Summary of services
  commission_paid boolean default false,
  assigned_partner_id uuid, -- Removed foreign key constraint to allow assignment to either partner type
  assigned_partner_name text,
  assigned_partner_phone text,
  coupon_used text,
  discount_amount numeric default 0
);

-- Indexes for Bookings Filtering and Retrieval
create index if not exists bookings_status_idx on public.bookings (status);
create index if not exists bookings_city_idx on public.bookings (city);
create index if not exists bookings_assigned_partner_id_idx on public.bookings (assigned_partner_id);
create index if not exists bookings_service_date_idx on public.bookings (service_date);

-- 4. Enable Row Level Security (RLS)
alter table public.primary_partners enable row level security;
alter table public.secondary_partners enable row level security;
alter table public.bookings enable row level security;

-- 5. Create Policies
-- Note: These are simplified policies. In production, you might want stricter rules.

-- Primary Partners Policies
create policy "Public primary partners are viewable by everyone" 
  on public.primary_partners for select using (true);

create policy "Primary partners can insert their own profile" 
  on public.primary_partners for insert with check (auth.uid() = id);

create policy "Primary partners can update their own profile" 
  on public.primary_partners for update using (auth.uid() = id);

-- Secondary Partners Policies
create policy "Public secondary partners are viewable by everyone" 
  on public.secondary_partners for select using (true);

create policy "Anyone can insert secondary partners" 
  on public.secondary_partners for insert with check (true);

create policy "Anyone can update secondary partners" 
  on public.secondary_partners for update using (true);

-- Bookings Policies
create policy "Anyone can insert bookings" 
  on public.bookings for insert with check (true);

create policy "Bookings are viewable by everyone" 
  on public.bookings for select using (true);

create policy "Bookings are updatable by everyone" 
  on public.bookings for update using (true);
