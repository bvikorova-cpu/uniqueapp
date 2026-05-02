
-- ============================================================
-- 1. STORAGE: path-ownership on uploads (12 buckets)
-- ============================================================

-- media
DROP POLICY IF EXISTS "Authenticated users can upload media files" ON storage.objects;
CREATE POLICY "Authenticated users can upload media files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'media' AND (auth.uid())::text = (storage.foldername(name))[1]);

-- bazaar_images
DROP POLICY IF EXISTS "Authenticated users can upload bazaar images" ON storage.objects;
CREATE POLICY "Authenticated users can upload bazaar images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'bazaar_images' AND (auth.uid())::text = (storage.foldername(name))[1]);

-- castle-images
DROP POLICY IF EXISTS "Authenticated users can upload castle images" ON storage.objects;
CREATE POLICY "Authenticated users can upload castle images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'castle-images' AND (auth.uid())::text = (storage.foldername(name))[1]);

-- coupon_images
DROP POLICY IF EXISTS "Authenticated users can upload coupon images" ON storage.objects;
CREATE POLICY "Authenticated users can upload coupon images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'coupon_images' AND (auth.uid())::text = (storage.foldername(name))[1]);

-- covers
DROP POLICY IF EXISTS "Authenticated users can upload cover images" ON storage.objects;
CREATE POLICY "Authenticated users can upload cover images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'covers' AND (auth.uid())::text = (storage.foldername(name))[1]);

-- destination-media
DROP POLICY IF EXISTS "Authenticated users can upload destination media" ON storage.objects;
CREATE POLICY "Authenticated users can upload destination media"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'destination-media' AND (auth.uid())::text = (storage.foldername(name))[1]);

-- home-decor-items
DROP POLICY IF EXISTS "Authenticated users can upload home decor images" ON storage.objects;
CREATE POLICY "Authenticated users can upload home decor images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'home-decor-items' AND (auth.uid())::text = (storage.foldername(name))[1]);

-- property-images
DROP POLICY IF EXISTS "Authenticated users can upload property images" ON storage.objects;
CREATE POLICY "Authenticated users can upload property images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'property-images' AND (auth.uid())::text = (storage.foldername(name))[1]);

-- property-videos
DROP POLICY IF EXISTS "Authenticated users can upload property videos" ON storage.objects;
CREATE POLICY "Authenticated users can upload property videos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'property-videos' AND (auth.uid())::text = (storage.foldername(name))[1]);

-- recipe-media
DROP POLICY IF EXISTS "Authenticated users can upload recipe media" ON storage.objects;
CREATE POLICY "Authenticated users can upload recipe media"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'recipe-media' AND (auth.uid())::text = (storage.foldername(name))[1]);

-- user-uploads
DROP POLICY IF EXISTS "Authenticated users can upload to user-uploads" ON storage.objects;
CREATE POLICY "Authenticated users can upload to user-uploads"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'user-uploads' AND (auth.uid())::text = (storage.foldername(name))[1]);

-- messenger-attachments (if policy exists)
DROP POLICY IF EXISTS "Authenticated users can upload messenger attachments" ON storage.objects;
CREATE POLICY "Authenticated users can upload messenger attachments"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'messenger-attachments' AND (auth.uid())::text = (storage.foldername(name))[1]);

-- ============================================================
-- 2. BUSINESSES: hide email/phone/whatsapp from non-owners
-- ============================================================

-- Drop the over-permissive SELECT policy
DROP POLICY IF EXISTS "Authenticated users can view active businesses" ON public.businesses;

-- Public-safe view (no contact columns)
CREATE OR REPLACE VIEW public.public_businesses
WITH (security_invoker = true) AS
SELECT
  id, owner_id, name, description, address, category,
  logo_url, cover_image_url, opening_hours, is_open_now,
  latitude, longitude, qr_code_url, unique_url_slug,
  total_rating, review_count, is_active, created_at, updated_at
FROM public.businesses
WHERE is_active = true;

GRANT SELECT ON public.public_businesses TO anon, authenticated;

-- Owner already has its own SELECT policy; add admin policy for support
CREATE POLICY "Admins can view all business details"
ON public.businesses FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- ============================================================
-- 3. Fix broken admin checks that used get_user_role()
-- ============================================================

DROP POLICY IF EXISTS "Admins can update earnings" ON public.megatalent_referral_earnings;
CREATE POLICY "Admins can update earnings"
ON public.megatalent_referral_earnings FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "user_activity_select_admin" ON public.user_activity;
CREATE POLICY "user_activity_select_admin"
ON public.user_activity FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));
