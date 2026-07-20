-- ============================================================
-- Unique Verified: verification tiers + benefits infrastructure
-- ============================================================

-- 1. New enum for verification tiers (safe creation)
DO $$ BEGIN
  CREATE TYPE public.verification_tier AS ENUM ('none', 'verified', 'plus', 'pro');
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

-- 2. Extend subscription_tier enum so the legacy subscriptions table can hold these tiers too
ALTER TYPE public.subscription_tier ADD VALUE IF NOT EXISTS 'verified';
ALTER TYPE public.subscription_tier ADD VALUE IF NOT EXISTS 'plus';
ALTER TYPE public.subscription_tier ADD VALUE IF NOT EXISTS 'pro';

-- 3. Add verification columns to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS verification_tier public.verification_tier NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS verification_expires_at timestamp with time zone;

-- 4. Sync existing verified users into the new tier system
UPDATE public.profiles
SET verification_tier = 'verified'
WHERE is_verified = true AND verification_tier = 'none';

-- 5. Trigger: keep is_verified in sync with verification_tier
CREATE OR REPLACE FUNCTION public.sync_profile_verified()
RETURNS TRIGGER AS $$
BEGIN
  NEW.is_verified := COALESCE(NEW.verification_tier, 'none') != 'none';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS sync_profile_verified ON public.profiles;
CREATE TRIGGER sync_profile_verified
BEFORE INSERT OR UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.sync_profile_verified();

-- 6. Trigger: prevent non-service users from changing verification_tier / expires_at
CREATE OR REPLACE FUNCTION public.prevent_user_verification_tampering()
RETURNS TRIGGER AS $$
BEGIN
  IF (NEW.verification_tier IS DISTINCT FROM OLD.verification_tier OR
      NEW.verification_expires_at IS DISTINCT FROM OLD.verification_expires_at) THEN
    IF current_user != 'service_role' THEN
      RAISE EXCEPTION 'verification_tier can only be updated via server-side verification';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS prevent_user_verification_tampering ON public.profiles;
CREATE TRIGGER prevent_user_verification_tampering
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.prevent_user_verification_tampering();

-- 7. Allow anonymous visitors to read public verification status
DROP POLICY IF EXISTS "Anon can view public profile verification status" ON public.profiles;
CREATE POLICY "Anon can view public profile verification status"
  ON public.profiles FOR SELECT
  TO anon
  USING (true);

-- 8. Benefits audit log
CREATE TABLE IF NOT EXISTS public.verification_benefits_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  benefit_type text NOT NULL,
  tier text NOT NULL,
  credits_granted integer,
  metadata jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.verification_benefits_log TO authenticated;
GRANT ALL ON public.verification_benefits_log TO service_role;

ALTER TABLE public.verification_benefits_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own verification benefit log" ON public.verification_benefits_log;
CREATE POLICY "Users can view their own verification benefit log"
  ON public.verification_benefits_log FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own verification benefit log" ON public.verification_benefits_log;
CREATE POLICY "Users can insert their own verification benefit log"
  ON public.verification_benefits_log FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 9. Helpful index for feed priority by verification tier
CREATE INDEX IF NOT EXISTS idx_profiles_verification_tier
  ON public.profiles(verification_tier);
