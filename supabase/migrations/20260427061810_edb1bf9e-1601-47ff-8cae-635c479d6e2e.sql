-- Step 1: Bulk revoke EXECUTE on all SECURITY DEFINER functions in public schema from anon role
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT n.nspname AS schema_name,
           p.proname AS function_name,
           pg_get_function_identity_arguments(p.oid) AS args
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.prosecdef = true
      AND has_function_privilege('anon', p.oid, 'EXECUTE') = true
  LOOP
    BEGIN
      EXECUTE format(
        'REVOKE EXECUTE ON FUNCTION %I.%I(%s) FROM anon, public',
        r.schema_name, r.function_name, r.args
      );
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Skipping %.%(%): %', r.schema_name, r.function_name, r.args, SQLERRM;
    END;
  END LOOP;
END $$;

-- Step 2: Re-grant EXECUTE for intentionally-public functions
-- (these need to be callable from anon for legitimate UX reasons)
DO $$
DECLARE
  fn_name TEXT;
  fn_record RECORD;
BEGIN
  FOR fn_name IN SELECT unnest(ARRAY[
    'get_follower_count',
    'get_following_count',
    'generate_referral_code',
    'generate_ticket_number',
    'generate_certificate_number',
    'generate_story_share_code'
  ])
  LOOP
    FOR fn_record IN
      SELECT pg_get_function_identity_arguments(p.oid) AS args
      FROM pg_proc p
      JOIN pg_namespace n ON n.oid = p.pronamespace
      WHERE n.nspname = 'public' AND p.proname = fn_name
    LOOP
      BEGIN
        EXECUTE format(
          'GRANT EXECUTE ON FUNCTION public.%I(%s) TO anon',
          fn_name, fn_record.args
        );
      EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Could not re-grant %(%): %', fn_name, fn_record.args, SQLERRM;
      END;
    END LOOP;
  END LOOP;
END $$;