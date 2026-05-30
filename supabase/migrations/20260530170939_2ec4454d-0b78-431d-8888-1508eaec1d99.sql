-- GDPR consent audit log: append-only, written server-side from user metadata
CREATE TABLE IF NOT EXISTS public.gdpr_consent_audit (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  consent_type TEXT NOT NULL,            -- 'privacy_policy' | 'terms_of_use' | 'marketing' ...
  consent_version TEXT NOT NULL,         -- e.g. '2026-01-15'
  granted BOOLEAN NOT NULL,
  ip_address INET,
  user_agent TEXT,
  source TEXT NOT NULL DEFAULT 'signup', -- 'signup' | 'settings' | 'reconsent'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.gdpr_consent_audit TO authenticated;
GRANT ALL ON public.gdpr_consent_audit TO service_role;

ALTER TABLE public.gdpr_consent_audit ENABLE ROW LEVEL SECURITY;

-- Users may view ONLY their own consent records (GDPR right of access)
CREATE POLICY "Users view own consent audit"
  ON public.gdpr_consent_audit
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users may insert ONLY their own consent records (re-consent flow from settings)
CREATE POLICY "Users insert own consent audit"
  ON public.gdpr_consent_audit
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- No UPDATE / DELETE policies: this table is append-only by design.

CREATE INDEX IF NOT EXISTS idx_gdpr_consent_user ON public.gdpr_consent_audit(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gdpr_consent_type_version ON public.gdpr_consent_audit(consent_type, consent_version);

-- Extend handle_new_user trigger to ALSO record consent rows from raw_user_meta_data
-- We keep the existing age + profile logic intact and append consent inserts.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_birth_date DATE;
  v_lang TEXT;
  v_privacy_version TEXT;
  v_terms_version TEXT;
  v_ip INET;
  v_ua TEXT;
BEGIN
  -- Parse birth_date (yyyy-MM-dd) safely
  BEGIN
    v_birth_date := (NEW.raw_user_meta_data->>'birth_date')::DATE;
  EXCEPTION WHEN OTHERS THEN
    v_birth_date := NULL;
  END;

  -- Server-side age gate (defence in depth — client also checks)
  IF v_birth_date IS NOT NULL AND v_birth_date > (CURRENT_DATE - INTERVAL '16 years') THEN
    RAISE EXCEPTION 'Users must be at least 16 years old' USING ERRCODE = 'check_violation';
  END IF;

  v_lang := COALESCE(NEW.raw_user_meta_data->>'preferred_language', 'en');

  -- Create / upsert profile row
  INSERT INTO public.profiles (id, full_name, birth_date, preferred_language)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    v_birth_date,
    v_lang
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    birth_date = COALESCE(EXCLUDED.birth_date, public.profiles.birth_date),
    preferred_language = EXCLUDED.preferred_language;

  -- Record GDPR consent (only if metadata contains versions — never fabricate)
  v_privacy_version := NEW.raw_user_meta_data->>'privacy_consent_version';
  v_terms_version   := NEW.raw_user_meta_data->>'terms_consent_version';

  BEGIN
    v_ip := NULLIF(NEW.raw_user_meta_data->>'signup_ip', '')::INET;
  EXCEPTION WHEN OTHERS THEN
    v_ip := NULL;
  END;
  v_ua := NEW.raw_user_meta_data->>'signup_user_agent';

  IF v_privacy_version IS NOT NULL THEN
    INSERT INTO public.gdpr_consent_audit
      (user_id, consent_type, consent_version, granted, ip_address, user_agent, source)
    VALUES (NEW.id, 'privacy_policy', v_privacy_version, TRUE, v_ip, v_ua, 'signup');
  END IF;

  IF v_terms_version IS NOT NULL THEN
    INSERT INTO public.gdpr_consent_audit
      (user_id, consent_type, consent_version, granted, ip_address, user_agent, source)
    VALUES (NEW.id, 'terms_of_use', v_terms_version, TRUE, v_ip, v_ua, 'signup');
  END IF;

  RETURN NEW;
END;
$$;