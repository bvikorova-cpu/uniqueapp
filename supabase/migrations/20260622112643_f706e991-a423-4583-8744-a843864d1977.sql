
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT n.nspname, p.proname,
           pg_get_function_identity_arguments(p.oid) AS args
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.prosecdef = true
  LOOP
    BEGIN
      EXECUTE format('REVOKE EXECUTE ON FUNCTION public.%I(%s) FROM PUBLIC, anon, authenticated',
                     r.proname, r.args);
      EXECUTE format('GRANT EXECUTE ON FUNCTION public.%I(%s) TO service_role',
                     r.proname, r.args);
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'skip %(%): %', r.proname, r.args, SQLERRM;
    END;
  END LOOP;
END $$;

-- Whitelist: re-grant EXECUTE to authenticated for functions the client app calls via supabase.rpc()
DO $$
DECLARE
  fname text;
  r record;
  authed_whitelist text[] := ARRAY[
    'accept_friend_quest_invite','accept_iq_friend','accept_iq_friend_challenge',
    'acquire_cosmetic_item','activate_user_theme','add_comedy_coins',
    'add_secret_santa_credits','add_user_points','advance_battle_royale',
    'aggregate_group_insights','award_iq_badges','award_iq_season_xp','award_xp',
    'bazaar_promote_listing','brain_duel_spend_credits','buy_streak_freeze_xp',
    'buyout_collectible_auction','cache_get','cache_invalidate_by_tag','cache_set',
    'check_rate_limit','claim_battle_pass_reward','claim_calendar_day',
    'claim_iq_battle_pass_tier','claim_iq_daily_streak','claim_iq_streak_reward',
    'claim_mission_reward','claim_quest_node','cleanup_old_jobs','complete_job',
    'compute_xp_streak','coupon_battle_pair','coupon_geo_nearby',
    'coupon_stacking_check','coupon_top_hot','coupon_trending_stores',
    'coupon_verification_stats','create_guild','create_iq_friend_challenge',
    'deduct_ai_credits','deduct_ai_credits_atomic','deduct_comedian_balance',
    'deduct_creative_forge_credits','deduct_emotion_credits','deduct_secret_santa_credits',
    'delete_auction_if_safe','donate_xp','enqueue_email','fail_job',
    'generate_daily_homework_challenge','generate_megatalent_bracket',
    'generate_megatalent_daily_challenge','generate_referral_code',
    'get_battle_royale_available_payout','get_campaign_available_balance',
    'get_dau_series','get_engagement_metrics','get_iq_competition_counts',
    'get_iq_countries_with_players','get_iq_country_leaderboard',
    'get_iq_country_top_players','get_iq_friend_comparison','get_iq_funnel',
    'get_iq_global_leaderboard','get_iq_goal_progress','get_iq_leaderboard',
    'get_iq_milestones','get_iq_performance_insights','get_iq_progress',
    'get_iq_public_profile','get_iq_training_plan','get_iq_weekly_recap',
    'get_last_week_xp_winners','get_megatalent_bracket','get_megatalent_tip_stats',
    'get_my_brand_api_key','get_my_weekly_xp_rank','get_next_job',
    'get_or_create_iq_referral_code','get_or_pick_daily_deal','get_post_memories',
    'get_profile_tip_stats','get_profiles_basic','get_public_coupon_listings',
    'get_public_profiles','get_referral_funnel','get_streak_week',
    'get_today_iq_challenge','get_unified_xp_leaderboard','get_user_challenges',
    'get_user_mission_progress','get_user_pause_count','get_vitals_daily',
    'get_vitals_summary','get_wall_feed','get_weekly_challenge_progress',
    'get_weekly_xp_leaderboard','gift_ai_credits','gift_xp','has_multiverse_access',
    'has_phobia_access','has_role','increment_ai_credits',
    'increment_ai_gallery_likes','increment_challenge_participants',
    'iq_test_cooldown_remaining','is_battle_royale_winner',
    'is_current_user_whitelisted','is_verified_coupon_seller','is_verified_founder',
    'join_guild','leave_guild','log_security_event','lucky_wheel_spin_secure',
    'mark_iq_notifications_read','mt_get_duel_pair','noop','open_mystery_box',
    'place_auction_bid','place_collectible_bid','place_iq_match_bet','place_xp_bet',
    'process_influencer_withdrawal','process_masterchef_withdrawal',
    'process_musician_withdrawal','process_withdrawal_request',
    'purchase_brain_duel_powerup','purchase_horse_from_market',
    'purchase_mystery_box','record_daily_activity','redeem_iq_promo_code',
    'redeem_iq_referral_code','redeem_shop_item','refund_ai_credits_atomic',
    'refund_campaign_donation','refund_shadow_arena_credits',
    'release_brand_campaign_escrow','rotate_my_brand_api_key','search_posts',
    'search_profiles_fts','send_credit_gift','send_secret_santa_gift',
    'spend_comedy_coins','spin_lucky_wheel','start_battle_royale','start_iq_test',
    'submit_iq_daily','submit_iq_test','submit_iq_tournament_match_score',
    'suggest_friends','track_challenge_action','update_battle_stats'
  ];
  anon_whitelist text[] := ARRAY[
    'has_role','get_public_profiles','get_public_coupon_listings',
    'get_profiles_basic','get_iq_global_leaderboard','get_iq_country_leaderboard',
    'get_iq_countries_with_players','get_iq_country_top_players',
    'get_unified_xp_leaderboard','get_weekly_xp_leaderboard',
    'get_last_week_xp_winners','get_wall_feed','search_posts',
    'search_profiles_fts','coupon_top_hot','coupon_trending_stores',
    'coupon_geo_nearby','get_or_pick_daily_deal','is_verified_coupon_seller',
    'is_verified_founder','has_multiverse_access','has_phobia_access',
    'iq_test_cooldown_remaining','noop'
  ];
BEGIN
  FOREACH fname IN ARRAY authed_whitelist LOOP
    FOR r IN
      SELECT pg_get_function_identity_arguments(p.oid) AS args
      FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
      WHERE n.nspname='public' AND p.proname = fname AND p.prosecdef = true
    LOOP
      BEGIN
        EXECUTE format('GRANT EXECUTE ON FUNCTION public.%I(%s) TO authenticated',
                       fname, r.args);
      EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'authed grant skip %(%): %', fname, r.args, SQLERRM;
      END;
    END LOOP;
  END LOOP;

  FOREACH fname IN ARRAY anon_whitelist LOOP
    FOR r IN
      SELECT pg_get_function_identity_arguments(p.oid) AS args
      FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
      WHERE n.nspname='public' AND p.proname = fname AND p.prosecdef = true
    LOOP
      BEGIN
        EXECUTE format('GRANT EXECUTE ON FUNCTION public.%I(%s) TO anon',
                       fname, r.args);
      EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'anon grant skip %(%): %', fname, r.args, SQLERRM;
      END;
    END LOOP;
  END LOOP;
END $$;
