
-- Wave 4: RLS WITH CHECK audit + public bucket listing lockdown

-- 1. plan_recommendations: WITH CHECK should mirror USING (admin only)
DROP POLICY IF EXISTS "service writes rec" ON public.plan_recommendations;
CREATE POLICY "service writes rec" ON public.plan_recommendations
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 2. coupon_extension_waitlist: require non-empty email and restrict to anon/authenticated
DROP POLICY IF EXISTS "anyone can join waitlist" ON public.coupon_extension_waitlist;
CREATE POLICY "anyone can join waitlist" ON public.coupon_extension_waitlist
  FOR INSERT TO anon, authenticated
  WITH CHECK (email IS NOT NULL AND length(email) BETWEEN 5 AND 254 AND email LIKE '%@%');

-- 3. mentor_360_responses: require authenticated to prevent spam floods
DROP POLICY IF EXISTS "anyone can insert 360 response" ON public.mentor_360_responses;
CREATE POLICY "authenticated can insert 360 response" ON public.mentor_360_responses
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- 4. Public bucket listing lockdown — keep direct CDN URL access, block enumeration.
-- Buckets stay public=true (so CDN URLs serve files), but SELECT on storage.objects
-- now requires the caller to be the owner. Anonymous direct URL access does NOT
-- hit storage.objects RLS — CDN reads object metadata via service role.

DROP POLICY IF EXISTS "Pet photos are publicly viewable" ON storage.objects;
CREATE POLICY "Pet photos owner can list" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'pet-photos' AND owner = auth.uid());

DROP POLICY IF EXISTS "bf_media_select" ON storage.objects;
CREATE POLICY "bf_media_owner_list" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'best-friend-media' AND owner = auth.uid());

DROP POLICY IF EXISTS "kb_media_public_read" ON storage.objects;
CREATE POLICY "kb_media_owner_list" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'kitchen-battles' AND owner = auth.uid());

DROP POLICY IF EXISTS "wall_media_public_read" ON storage.objects;
CREATE POLICY "wall_media_owner_list" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'wall-media' AND owner = auth.uid());
