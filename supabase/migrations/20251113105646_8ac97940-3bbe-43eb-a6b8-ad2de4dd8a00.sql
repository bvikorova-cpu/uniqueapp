-- Create storage bucket for kids drawings (if not exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('kids-drawings', 'kids-drawings', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for kids-drawings bucket
CREATE POLICY "Users can upload their own drawings" ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'kids-drawings' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own drawings" ON storage.objects
FOR SELECT
USING (
  bucket_id = 'kids-drawings' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own drawings" ON storage.objects
FOR DELETE
USING (
  bucket_id = 'kids-drawings' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Public can view all drawings" ON storage.objects
FOR SELECT
USING (bucket_id = 'kids-drawings');