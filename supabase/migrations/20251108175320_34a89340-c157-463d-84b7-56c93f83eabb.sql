-- Create storage bucket for castle images
INSERT INTO storage.buckets (id, name, public)
VALUES ('castle-images', 'castle-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for castle images
CREATE POLICY "Castle images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'castle-images');

CREATE POLICY "Authenticated users can upload castle images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'castle-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can update castle images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'castle-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can delete castle images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'castle-images' 
  AND auth.role() = 'authenticated'
);