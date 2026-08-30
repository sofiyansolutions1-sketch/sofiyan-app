-- Create the storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('app-files', 'app-files', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'app-files');

-- Allow authenticated and anon uploads
CREATE POLICY "Public Uploads" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'app-files');

-- Allow public updates/deletes (for simplicity in this app)
CREATE POLICY "Public Updates"
ON storage.objects FOR UPDATE
USING (bucket_id = 'app-files');

CREATE POLICY "Public Deletes"
ON storage.objects FOR DELETE
USING (bucket_id = 'app-files');
