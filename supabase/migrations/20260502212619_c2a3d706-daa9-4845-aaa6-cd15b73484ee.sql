-- 1. Remove loose messenger-attachments INSERT policy
DROP POLICY IF EXISTS "Users can upload messenger attachments" ON storage.objects;

-- 2. Fix contact_messages UPDATE policy
DROP POLICY IF EXISTS "Admins can update contact messages" ON public.contact_messages;
CREATE POLICY "Admins can update contact messages"
ON public.contact_messages
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 3. Public read for businesses via safe view (excluding contact PII)
DROP VIEW IF EXISTS public.public_businesses;
CREATE VIEW public.public_businesses
WITH (security_invoker = true)
AS
SELECT
  id, owner_id, name, unique_url_slug, description, category,
  address, logo_url, cover_image_url, opening_hours, is_open_now,
  latitude, longitude, qr_code_url, total_rating, review_count,
  is_active, created_at, updated_at
FROM public.businesses
WHERE is_active = true;

GRANT SELECT ON public.public_businesses TO anon, authenticated;

-- Public can read active businesses, but column GRANTs hide PII
DROP POLICY IF EXISTS "Public can view active businesses (no contacts)" ON public.businesses;
CREATE POLICY "Public can view active businesses (no contacts)"
ON public.businesses
FOR SELECT
USING (is_active = true);

-- Revoke broad SELECT and re-grant only safe columns
REVOKE SELECT ON public.businesses FROM anon, authenticated;
GRANT SELECT
  (id, owner_id, name, unique_url_slug, description, category, address,
   logo_url, cover_image_url, opening_hours, is_open_now, latitude, longitude,
   qr_code_url, total_rating, review_count, is_active, created_at, updated_at)
ON public.businesses TO anon, authenticated;

-- PII columns still selectable but RLS row policies (owner / admin) gate them
GRANT SELECT (email, phone, whatsapp) ON public.businesses TO authenticated;