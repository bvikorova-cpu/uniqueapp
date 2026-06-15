
-- ============================================================
-- BLOCKER FIX 1: musician_profiles — split KYC into separate table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.musician_kyc (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  legal_name text,
  id_document_url text,
  social_proof_url text,
  verification_notes text,
  suspended_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.musician_kyc TO authenticated;
GRANT ALL ON public.musician_kyc TO service_role;

ALTER TABLE public.musician_kyc ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can view own KYC" ON public.musician_kyc
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Owner can insert own KYC" ON public.musician_kyc
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owner can update own KYC" ON public.musician_kyc
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all KYC" ON public.musician_kyc
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update KYC" ON public.musician_kyc
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Migrate existing data
INSERT INTO public.musician_kyc (user_id, legal_name, id_document_url, social_proof_url, verification_notes, suspended_reason)
SELECT user_id, legal_name, id_document_url, social_proof_url, verification_notes, suspended_reason
FROM public.musician_profiles
WHERE legal_name IS NOT NULL OR id_document_url IS NOT NULL OR social_proof_url IS NOT NULL
   OR verification_notes IS NOT NULL OR suspended_reason IS NOT NULL
ON CONFLICT (user_id) DO NOTHING;

-- Drop sensitive columns from public-readable musician_profiles
ALTER TABLE public.musician_profiles
  DROP COLUMN IF EXISTS legal_name,
  DROP COLUMN IF EXISTS id_document_url,
  DROP COLUMN IF EXISTS social_proof_url,
  DROP COLUMN IF EXISTS verification_notes,
  DROP COLUMN IF EXISTS suspended_reason;

-- ============================================================
-- BLOCKER FIX 2: brand_sponsors — hide Stripe IDs from anon
-- ============================================================
REVOKE SELECT ON public.brand_sponsors FROM anon;
GRANT SELECT (
  id, user_id, name, logo, tier, category, description, website,
  subscription_status, subscription_start, subscription_end,
  total_votes, created_at, updated_at,
  moderation_status, moderation_reason, moderated_by, moderated_at,
  tier_priority, featured
) ON public.brand_sponsors TO anon;

-- Authenticated owners/admins still get full SELECT via existing role grant + RLS.

-- ============================================================
-- BLOCKER FIX 3: dating_profiles — public browse via safe view
-- ============================================================
-- Drop the broad authenticated SELECT policy (replaced by view-based browse)
DROP POLICY IF EXISTS "Authenticated users can view active dating profiles" ON public.dating_profiles;

-- Safe browse view (excludes verification_selfie_url, shadow flags, snoozed_until, incognito)
CREATE OR REPLACE VIEW public.dating_profiles_browse
WITH (security_invoker = off) AS
SELECT
  id, user_id, display_name, bio, age, gender, looking_for, location,
  profile_photo_url, additional_photos, interests, is_active,
  created_at, updated_at, prompts, voice_intro_url, voice_intro_duration,
  spotify_url, instagram_url, photo_verified,
  compatibility_quiz, opening_move, passport_location, read_receipts_enabled,
  video_prompts
FROM public.dating_profiles
WHERE is_active = true
  AND COALESCE(incognito, false) = false
  AND COALESCE(is_shadow_banned, false) = false;

GRANT SELECT ON public.dating_profiles_browse TO authenticated;

-- Owner+admin SELECT on base table
CREATE POLICY "Owner can view own dating profile" ON public.dating_profiles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all dating profiles" ON public.dating_profiles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));
