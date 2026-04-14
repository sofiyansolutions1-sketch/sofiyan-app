-- Supabase Schema for Smart Follow-Up CRM Leads

CREATE TABLE IF NOT EXISTS leads (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    service_interested TEXT NOT NULL,
    follow_up_date DATE NOT NULL,
    notes TEXT,
    status TEXT DEFAULT 'Pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Create policies (assuming admin has full access, or just allow all for simplicity in this context)
-- If you have a specific admin role, you can restrict this. For now, we'll allow all authenticated users or just public for the sake of the example, 
-- but usually you'd want to restrict this.
CREATE POLICY "Allow full access to leads" ON leads FOR ALL USING (true) WITH CHECK (true);
