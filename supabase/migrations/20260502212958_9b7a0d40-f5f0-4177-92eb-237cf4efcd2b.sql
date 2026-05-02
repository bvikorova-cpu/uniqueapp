-- 1. businesses: remove the over-permissive public SELECT and restore PII grants for owner/admin only.
DROP POLICY IF EXISTS "Public can view active businesses (no contacts)" ON public.businesses;

-- Restore broad SELECT grant on the table; row-level access is governed by:
--   * Owners can view full business details   (auth.uid() = owner_id)
--   * Admins can view all business details    (has_role admin)
-- Anonymous/authenticated read happens via the public_businesses VIEW only.
GRANT SELECT ON public.businesses TO authenticated;

-- 2. comedy-videos: add path-ownership INSERT policy and remove loose one
DROP POLICY IF EXISTS "Comedians can upload videos" ON storage.objects;
CREATE POLICY "Comedians can upload videos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'comedy-videos'
  AND (auth.uid())::text = (storage.foldername(name))[1]
  AND auth.uid() IN (SELECT user_id FROM public.comedian_profiles)
);

-- 3. certificates: add path-ownership INSERT policy
DROP POLICY IF EXISTS "Authenticated users can upload certificates" ON storage.objects;
CREATE POLICY "Authenticated users can upload certificates"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'certificates'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);