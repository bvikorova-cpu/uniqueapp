
-- Revoke anon EXECUTE from all SECURITY DEFINER functions in public,
-- EXCEPT a small allowlist that is intentionally callable without auth.
DO $$
DECLARE
  r RECORD;
  allowed TEXT[] := ARRAY[
    'has_role',
    'is_conversation_participant',
    'is_creative_room_member',
    'is_group_member',
    'is_lottery_syndicate_member',
    'is_campaign_owner',
    'get_follower_count',
    'get_following_count',
    'get_weekly_xp_leaderboard',
    'get_last_week_xp_winners',
    'get_approved_safety_stories',
    'get_referral_leaderboard',
    'get_arena_leaderboard',
    'get_castle_leaderboard',
    'get_eco_leaderboard',
    'get_healthy_leaderboard',
    'get_confessions_feed',
    'get_psychology_stats',
    'get_iq_countries_with_players',
    'get_demo_dating_profiles',
    'get_featured_campaign',
    'get_fundraising_stats',
    'get_club_founding_progress',
    'get_club_good_fund_total',
    'get_campaign_owner',
    'get_campaign_title',
    'founding_members_remaining',
    'challenge_monthly_prize_pool_cents',
    'challenge_tier',
    'can_view_community',
    'can_view_post',
    'coupon_geo_nearby',
    'coupon_top_hot',
    'coupon_trending_stores',
    'exclusive_is_matched',
    'get_influencer_audience_insights'
  ];
BEGIN
  FOR r IN
    SELECT p.oid, p.proname,
           format('%I.%I(%s)', n.nspname, p.proname,
                  pg_get_function_identity_arguments(p.oid)) AS sig
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.prosecdef = true
      AND has_function_privilege('anon', p.oid, 'EXECUTE')
  LOOP
    IF NOT (r.proname = ANY(allowed)) THEN
      EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM PUBLIC, anon;', r.sig);
    END IF;
  END LOOP;
END $$;
