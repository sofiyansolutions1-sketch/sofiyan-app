-- 1. FIX THE SIGNUP TRIGGER ERROR
-- The original trigger was failing because it used ON CONFLICT (email) 
-- without a unique constraint on email. We change it to use ON CONFLICT (id).
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
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. CREATE STORAGE BUCKET (If you haven't already)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('app-files', 'app-files', true)
ON CONFLICT (id) DO NOTHING;

-- 3. STORAGE POLICIES
-- Drop existing ones just in case to avoid conflicts
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Public Uploads" ON storage.objects;
DROP POLICY IF EXISTS "Public Updates" ON storage.objects;
DROP POLICY IF EXISTS "Public Deletes" ON storage.objects;

CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'app-files');
CREATE POLICY "Public Uploads" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'app-files');
CREATE POLICY "Public Updates" ON storage.objects FOR UPDATE USING (bucket_id = 'app-files');
CREATE POLICY "Public Deletes" ON storage.objects FOR DELETE USING (bucket_id = 'app-files');
