-- Enforce age >= 16 server-side and persist birth_date / preferred_language at signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_birth_date date;
  v_lang text;
BEGIN
  -- Parse birth_date from metadata (if provided)
  BEGIN
    v_birth_date := NULLIF(NEW.raw_user_meta_data->>'birth_date','')::date;
  EXCEPTION WHEN others THEN
    v_birth_date := NULL;
  END;

  -- Server-side age gate: main platform is 16+
  IF v_birth_date IS NOT NULL AND v_birth_date > (CURRENT_DATE - INTERVAL '16 years') THEN
    RAISE EXCEPTION 'Users must be at least 16 years old to register on the main platform.'
      USING ERRCODE = 'check_violation';
  END IF;

  v_lang := COALESCE(NULLIF(NEW.raw_user_meta_data->>'preferred_language',''), 'en');

  INSERT INTO public.profiles (id, email, full_name, phone, company_name, birth_date, preferred_language)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'company_name',
    v_birth_date,
    v_lang
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    phone = COALESCE(EXCLUDED.phone, public.profiles.phone),
    company_name = COALESCE(EXCLUDED.company_name, public.profiles.company_name),
    birth_date = COALESCE(EXCLUDED.birth_date, public.profiles.birth_date),
    preferred_language = COALESCE(EXCLUDED.preferred_language, public.profiles.preferred_language);

  RETURN NEW;
END;
$function$;