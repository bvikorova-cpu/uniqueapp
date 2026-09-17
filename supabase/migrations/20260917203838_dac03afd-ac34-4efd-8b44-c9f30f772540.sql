ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS city TEXT;

CREATE INDEX IF NOT EXISTS idx_profiles_city_lower ON public.profiles (lower(city));

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_birth_date DATE;
  v_lang TEXT;
  v_privacy_version TEXT;
  v_terms_version TEXT;
  v_ip INET;
  v_ua TEXT;
  v_city TEXT;
BEGIN
  BEGIN
    v_birth_date := (NEW.raw_user_meta_data->>'birth_date')::DATE;
  EXCEPTION WHEN OTHERS THEN
    v_birth_date := NULL;
  END;

  IF v_birth_date IS NOT NULL AND v_birth_date > (CURRENT_DATE - INTERVAL '16 years') THEN
    RAISE EXCEPTION 'Users must be at least 16 years old' USING ERRCODE = 'check_violation';
  END IF;

  v_lang := COALESCE(NEW.raw_user_meta_data->>'preferred_language', 'en');
  v_city := NULLIF(trim(COALESCE(NEW.raw_user_meta_data->>'city', '')), '');

  INSERT INTO public.profiles (id, full_name, birth_date, preferred_language, city)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    v_birth_date,
    v_lang,
    v_city
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    birth_date = COALESCE(EXCLUDED.birth_date, public.profiles.birth_date),
    preferred_language = EXCLUDED.preferred_language,
    city = COALESCE(EXCLUDED.city, public.profiles.city);

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
$function$;

DROP FUNCTION IF EXISTS public.search_users(text, integer);

CREATE OR REPLACE FUNCTION public.search_users(q text, lim integer DEFAULT 20)
 RETURNS TABLE(id uuid, full_name text, username text, avatar_url text, cover_url text, headline text, city text, is_verified boolean)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  WITH params AS (SELECT public.f_unaccent(lower(trim(q))) AS qn)
  SELECT p.id, p.full_name, p.username, p.avatar_url, p.cover_url, p.headline, p.city, p.is_verified
  FROM public.profiles p, params
  WHERE auth.uid() IS NOT NULL AND p.id <> auth.uid() AND length(params.qn) >= 1
    AND (public.f_unaccent(lower(coalesce(p.full_name,''))) ILIKE '%' || params.qn || '%'
      OR public.f_unaccent(lower(coalesce(p.username,''))) ILIKE '%' || params.qn || '%'
      OR public.f_unaccent(lower(coalesce(p.city,''))) ILIKE '%' || params.qn || '%')
  ORDER BY CASE
    WHEN public.f_unaccent(lower(coalesce(p.full_name,''))) ILIKE params.qn || '%' THEN 0
    WHEN public.f_unaccent(lower(coalesce(p.username,''))) ILIKE params.qn || '%' THEN 1
    WHEN public.f_unaccent(lower(coalesce(p.city,''))) ILIKE params.qn || '%' THEN 2 ELSE 3 END,
    p.is_verified DESC NULLS LAST, p.full_name ASC NULLS LAST
  LIMIT GREATEST(1, LEAST(coalesce(lim, 20), 50));
$function$;

REVOKE ALL ON FUNCTION public.search_users(text, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.search_users(text, integer) TO authenticated, service_role;