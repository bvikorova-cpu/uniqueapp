-- Add RLS policies for coloring-images storage bucket

-- Policy 1: Allow authenticated users to upload their own images
CREATE POLICY "Users can upload their coloring images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'coloring-images' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 2: Allow public read access to all coloring images
CREATE POLICY "Public read access for coloring images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'coloring-images');

-- Policy 3: Allow users to delete their own images
CREATE POLICY "Users can delete their own coloring images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'coloring-images' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);