
-- 1. Fix FF photos: remove OR true bypass
DROP POLICY IF EXISTS "FF photos: users read own" ON storage.objects;
CREATE POLICY "FF photos: users read own"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'future-face-photos'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

-- 2. Fix messenger attachments: enforce ownership by folder
DROP POLICY IF EXISTS "Authenticated can read messenger attachments" ON storage.objects;
CREATE POLICY "Users read own messenger attachments"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'messenger-attachments'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

-- 3. Fix video resumes: drop the overly permissive public policy
DROP POLICY IF EXISTS "video resume read" ON storage.objects;
