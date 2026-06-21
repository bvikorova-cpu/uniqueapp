-- 1) Fix Security Definer View (linter ERROR)
ALTER VIEW IF EXISTS public.dating_profiles_browse SET (security_invoker = on);

-- 2) Revoke anon EXECUTE on sensitive SECURITY DEFINER functions
DO $$
DECLARE
  r RECORD;
  v_keep TEXT[] := ARRAY[
    'get_auth_uid','founding_members_remaining',
    'coupon_geo_nearby','coupon_hot_score','coupon_top_hot',
    'coupon_trending_stores','coupon_verification_stats',
    'compute_spam_score','find_similar_jobs'
  ];
BEGIN
  FOR r IN
    SELECT p.oid, p.proname, pg_get_function_identity_arguments(p.oid) AS args
    FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.prosecdef = true
      AND has_function_privilege('anon', p.oid, 'EXECUTE')
      AND NOT (
        p.proname = ANY(v_keep)
        OR p.proname LIKE 'get\_%'
        OR p.proname LIKE 'has\_%'
        OR p.proname LIKE 'is\_%'
        OR p.proname LIKE 'can\_%'
        OR p.proname LIKE 'are\_%'
      )
  LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION public.%I(%s) FROM anon',
                   r.proname, r.args);
  END LOOP;
END $$;

-- 3) Fast-path ensure_free_tier_credits (preserve return type = free_tier_credits)
CREATE OR REPLACE FUNCTION public.ensure_free_tier_credits()
RETURNS public.free_tier_credits
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_row public.free_tier_credits;
BEGIN
  IF v_uid IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT * INTO v_row FROM public.free_tier_credits WHERE user_id = v_uid LIMIT 1;
  IF FOUND THEN
    RETURN v_row;
  END IF;

  INSERT INTO public.free_tier_credits (user_id)
  VALUES (v_uid)
  ON CONFLICT (user_id) DO NOTHING;

  SELECT * INTO v_row FROM public.free_tier_credits WHERE user_id = v_uid LIMIT 1;
  RETURN v_row;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.ensure_free_tier_credits() FROM anon;
GRANT EXECUTE ON FUNCTION public.ensure_free_tier_credits() TO authenticated;