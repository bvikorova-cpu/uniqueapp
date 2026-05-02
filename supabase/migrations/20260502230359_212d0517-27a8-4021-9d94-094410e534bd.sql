-- Fix handle_new_user to be idempotent
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone, company_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'company_name'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$function$;

-- Fix handle_new_sports_user: remove profile insert (handled by handle_new_user) and make role insert idempotent
CREATE OR REPLACE FUNCTION public.handle_new_sports_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Profile is created by handle_new_user trigger; only assign default role here
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END;
$function$;

-- Fix handle_lottery_user: guard against missing unique constraint
CREATE OR REPLACE FUNCTION public.handle_lottery_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_subscriptions WHERE user_id = NEW.id) THEN
    INSERT INTO public.user_subscriptions (user_id, generations_used, generations_limit)
    VALUES (NEW.id, 0, 10);
  END IF;
  RETURN NEW;
END;
$function$;