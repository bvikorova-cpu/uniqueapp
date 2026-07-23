
-- 1) Fix mutable search_path on the 2 flagged functions
ALTER FUNCTION public.set_updated_at() SET search_path = public;
ALTER FUNCTION public.club_touch_updated_at() SET search_path = public;

-- 2) Move unaccent extension out of public schema
CREATE SCHEMA IF NOT EXISTS extensions;
GRANT USAGE ON SCHEMA extensions TO anon, authenticated, service_role;
ALTER EXTENSION unaccent SET SCHEMA extensions;

-- 3) Revoke EXECUTE from anon + authenticated on every SECURITY DEFINER
--    trigger function in public. Triggers invoke these internally regardless
--    of GRANTs, so removing the API-level EXECUTE closes the linter warning
--    without breaking behavior.
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT p.oid,
           format('%I.%I(%s)',
                  n.nspname, p.proname,
                  pg_get_function_identity_arguments(p.oid)) AS sig
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.prosecdef = true
      AND pg_catalog.pg_get_function_result(p.oid) = 'trigger'
  LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM PUBLIC, anon, authenticated;', r.sig);
  END LOOP;
END $$;

-- 4) Revoke EXECUTE from anon + authenticated on internal-only SECURITY DEFINER
--    helpers (cron, cleanup, enqueue/dequeue, admin-only, trigger helpers).
--    These are called by pg_cron / edge functions with service_role, never
--    from the browser client.
DO $$
DECLARE
  fn TEXT;
  fns TEXT[] := ARRAY[
    'cleanup_idempotency_keys()',
    'cleanup_old_call_signals()',
    'cleanup_expired_cache()',
    'club_flag_founding()',
    'complete_async_job(bigint, boolean, text)',
    'dequeue_async_jobs(text, text, integer)',
    'enqueue_async_job(text, jsonb, timestamp with time zone)',
    'award_eco_monthly_winner()',
    'award_healthy_monthly_winner(text)',
    'bump_brand_deal_applicants()',
    'bump_exclusive_thread_activity()',
    'bump_post_comments_count()',
    'bump_post_likes_count()',
    'eco_votes_count_trg()'
  ];
BEGIN
  FOREACH fn IN ARRAY fns LOOP
    BEGIN
      EXECUTE format('REVOKE EXECUTE ON FUNCTION public.%s FROM PUBLIC, anon, authenticated;', fn);
    EXCEPTION WHEN undefined_function THEN
      -- skip if signature drifted
      NULL;
    END;
  END LOOP;
END $$;
