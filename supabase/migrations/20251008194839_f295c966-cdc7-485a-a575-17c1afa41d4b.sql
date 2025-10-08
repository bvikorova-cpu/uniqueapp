-- Add image_url column to skill_offerings table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'skill_offerings' 
    AND column_name = 'image_url'
  ) THEN
    ALTER TABLE public.skill_offerings ADD COLUMN image_url TEXT;
  END IF;
END $$;

-- Ensure marketplace-images bucket exists for storing offering images
INSERT INTO storage.buckets (id, name, public)
VALUES ('marketplace-images', 'marketplace-images', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Authenticated users can upload marketplace images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view marketplace images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own marketplace images" ON storage.objects;

-- Allow authenticated users to upload images to marketplace-images bucket
CREATE POLICY "Authenticated users can upload marketplace images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'marketplace-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow public read access to marketplace images
CREATE POLICY "Public can view marketplace images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'marketplace-images');

-- Allow users to delete their own marketplace images
CREATE POLICY "Users can delete their own marketplace images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'marketplace-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);