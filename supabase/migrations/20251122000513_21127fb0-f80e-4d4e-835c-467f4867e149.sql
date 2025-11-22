-- Create storage bucket for stock content
INSERT INTO storage.buckets (id, name, public) 
VALUES ('stock-content', 'stock-content', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for stock-content bucket
CREATE POLICY "Anyone can view stock content files"
ON storage.objects FOR SELECT
USING (bucket_id = 'stock-content');

CREATE POLICY "Authenticated users can upload stock content"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'stock-content' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own stock content files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'stock-content' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own stock content files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'stock-content' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);