
-- =========================================================
-- WAVE 1: CRITICAL SECURITY FIXES
-- =========================================================

-- ---------------------------------------------------------
-- 1) instructor_profiles — hide Stripe & financial data
-- ---------------------------------------------------------
DROP POLICY IF EXISTS "Users can view all instructor profiles" ON public.instructor_profiles;

-- Owner can read their own full row
CREATE POLICY "Owners can view their own instructor profile"
ON public.instructor_profiles
FOR SELECT
USING (auth.uid() = user_id);

-- Public-safe view (no Stripe, no earnings)
CREATE OR REPLACE VIEW public.public_instructor_profiles
WITH (security_invoker = true) AS
SELECT
  id,
  user_id,
  bio,
  expertise,
  profile_image_url,
  total_students,
  created_at,
  updated_at
FROM public.instructor_profiles;

GRANT SELECT ON public.public_instructor_profiles TO anon, authenticated;

-- Allow anyone to read the safe columns through a permissive policy
-- via a SECURITY DEFINER function used by the view. We do this by
-- adding a second SELECT policy that exposes ONLY non-sensitive cols
-- through the view. Since RLS is row-level, we instead grant SELECT
-- on the view and rely on a wrapper policy:
CREATE POLICY "Public can view safe instructor columns"
ON public.instructor_profiles
FOR SELECT
USING (
  -- Restrict direct table access to owner; view bypass handled via SECURITY DEFINER below
  false
);

-- Replace view to use SECURITY DEFINER function for safe public access
DROP VIEW IF EXISTS public.public_instructor_profiles;

CREATE OR REPLACE FUNCTION public.get_public_instructor_profiles()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  bio text,
  expertise text[],
  profile_image_url text,
  total_students integer,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, user_id, bio, expertise, profile_image_url, total_students, created_at, updated_at
  FROM public.instructor_profiles;
$$;

GRANT EXECUTE ON FUNCTION public.get_public_instructor_profiles() TO anon, authenticated;

CREATE OR REPLACE VIEW public.public_instructor_profiles AS
SELECT * FROM public.get_public_instructor_profiles();

GRANT SELECT ON public.public_instructor_profiles TO anon, authenticated;

-- Drop the false-policy (not needed; default deny without SELECT policy)
DROP POLICY IF EXISTS "Public can view safe instructor columns" ON public.instructor_profiles;


-- ---------------------------------------------------------
-- 2) campaign_donations — hide donor_email
-- ---------------------------------------------------------
DROP POLICY IF EXISTS "Anyone can view non-anonymous donations" ON public.campaign_donations;

-- Donor can see their own row
CREATE POLICY "Donor can view own donation"
ON public.campaign_donations
FOR SELECT
USING (auth.uid() = donor_id);

-- Campaign owners can see donations to their campaign (incl. email)
-- Note: We need to know who owns the campaign. We'll allow via a function check
-- across all known campaign tables. Simpler approach: allow only donor + service role.
-- Public read of safe fields via SECURITY DEFINER function below.

CREATE OR REPLACE FUNCTION public.get_public_campaign_donations(_campaign_id uuid DEFAULT NULL)
RETURNS TABLE (
  id uuid,
  campaign_id uuid,
  campaign_type text,
  donor_name text,
  amount numeric,
  is_monthly boolean,
  is_anonymous boolean,
  message text,
  status text,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    id,
    campaign_id,
    campaign_type,
    CASE WHEN is_anonymous THEN 'Anonymous' ELSE donor_name END AS donor_name,
    amount,
    is_monthly,
    is_anonymous,
    message,
    status,
    created_at
  FROM public.campaign_donations
  WHERE status = 'completed'
    AND (_campaign_id IS NULL OR campaign_id = _campaign_id);
$$;

GRANT EXECUTE ON FUNCTION public.get_public_campaign_donations(uuid) TO anon, authenticated;


-- ---------------------------------------------------------
-- 3) coupon_listings — hide discount_code from non-buyers
-- ---------------------------------------------------------
DROP POLICY IF EXISTS "Anyone can view active coupon listings" ON public.coupon_listings;

-- Owner can see full row (incl. code)
CREATE POLICY "Sellers can view own coupons"
ON public.coupon_listings
FOR SELECT
USING (auth.uid() = user_id);

-- Public read of safe fields (no discount_code) via function
CREATE OR REPLACE FUNCTION public.get_public_coupon_listings()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  title text,
  description text,
  store_name text,
  original_value numeric,
  selling_price numeric,
  expiry_date date,
  category text,
  coupon_type text,
  is_digital boolean,
  image_url text,
  terms_conditions text,
  is_active boolean,
  is_sold boolean,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    id, user_id, title, description, store_name, original_value, selling_price,
    expiry_date, category, coupon_type, is_digital, image_url, terms_conditions,
    is_active, is_sold, created_at, updated_at
  FROM public.coupon_listings
  WHERE is_active = true;
$$;

GRANT EXECUTE ON FUNCTION public.get_public_coupon_listings() TO anon, authenticated;

-- Function for buyer to retrieve discount_code after verified purchase
-- Assumes existence of a payment_records / purchases table. We'll guard with
-- a generic check: only return code if caller is owner OR has a completed
-- payment_records row referencing this coupon listing.
CREATE OR REPLACE FUNCTION public.get_coupon_discount_code(_listing_id uuid)
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _code text;
  _is_owner boolean;
  _has_purchase boolean := false;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT (user_id = auth.uid()), discount_code
    INTO _is_owner, _code
  FROM public.coupon_listings
  WHERE id = _listing_id;

  IF _is_owner THEN
    RETURN _code;
  END IF;

  -- Check for a completed purchase in payment_records (best-effort)
  BEGIN
    SELECT EXISTS (
      SELECT 1 FROM public.payment_records
      WHERE user_id = auth.uid()
        AND status = 'paid'
        AND (
          metadata->>'coupon_listing_id' = _listing_id::text
          OR metadata->>'listing_id' = _listing_id::text
        )
    ) INTO _has_purchase;
  EXCEPTION WHEN OTHERS THEN
    _has_purchase := false;
  END;

  IF _has_purchase THEN
    RETURN _code;
  END IF;

  RAISE EXCEPTION 'Not authorized to view discount code';
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_coupon_discount_code(uuid) TO authenticated;
