-- Allowlist of functions that MUST remain callable by authenticated users via PostgREST RPC
DO $$
DECLARE
  r RECORD;
  allowlist TEXT[] := ARRAY[
    'has_role',
    'get_current_user_id',
    'get_follower_count',
    'get_following_count',
    'check_username',
    'get_my_weekly_xp_rank',
    'get_last_week_xp_winners',
    'get_psychology_stats',
    'get_affiliate_reward_eur',
    'get_coupon_discount_code',
    'compute_xp_streak',
    'find_skill_matches',
    'check_rate_limit',
    'cache_get',
    'cache_set',
    'check_and_award_badges',
    'add_user_points',
    'award_points_and_log',
    'create_notification',
    'generate_referral_code',
    'generate_ticket_number',
    'generate_certificate_number',
    'generate_story_share_code'
  ];
BEGIN
  FOR r IN
    SELECT n.nspname AS schema_name,
           p.proname AS function_name,
           pg_get_function_identity_arguments(p.oid) AS args
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.prosecdef = true
      AND has_function_privilege('authenticated', p.oid, 'EXECUTE') = true
      AND p.proname <> ALL(allowlist)
  LOOP
    BEGIN
      EXECUTE format(
        'REVOKE EXECUTE ON FUNCTION %I.%I(%s) FROM authenticated',
        r.schema_name, r.function_name, r.args
      );
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Skipping %.%(%): %', r.schema_name, r.function_name, r.args, SQLERRM;
    END;
  END LOOP;
END $$;