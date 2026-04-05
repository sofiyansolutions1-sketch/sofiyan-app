CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT,
  slug TEXT UNIQUE NOT NULL,
  sub_heading TEXT,
  content TEXT,
  meta_description TEXT,
  target_keywords TEXT,
  target_locations TEXT,
  related_service TEXT,
  author TEXT DEFAULT 'Admin',
  status TEXT DEFAULT 'published',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Optional: Enable Row Level Security (RLS) for public read access
-- ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Public can view published blog posts" ON blog_posts FOR SELECT USING (status = 'published');
