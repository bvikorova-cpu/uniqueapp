
-- 1) Fix overlapping creator-media storage policies
DROP POLICY IF EXISTS "Authenticated users can upload media" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their creator media" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their creator media" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their creator media" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view creator media" ON storage.objects;

-- Keep one public read policy
-- "Creator media is publicly accessible" already exists for SELECT.

-- Owner-scoped INSERT (file path must start with auth.uid())
CREATE POLICY "Users can upload to their own creator-media folder"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'creator-media'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

-- Owner-scoped UPDATE / DELETE already exist as "Users can update/delete their own media"

-- 2) Grant SELECT on confessions_public to anon/authenticated (for frontend reads)
GRANT SELECT ON public.confessions_public TO anon, authenticated;
