
DO $$
DECLARE
  r RECORD;
  keep TEXT[] := ARRAY[
    -- RLS + auth helpers (must stay callable)
    'has_role','is_conversation_participant','is_creative_room_member',
    'is_group_member','is_lottery_syndicate_member','is_campaign_owner',
    'is_current_user_whitelisted','is_verified_coupon_seller','is_verified_founder',
    'is_battle_royale_winner','can_view_community','can_view_post',
    'exclusive_is_matched','has_multiverse_access','has_phobia_access',
    -- Client-called RPCs discovered by codebase scan
    'accept_friend_quest_invite','accept_iq_friend','accept_iq_friend_challenge',
    'acquire_cosmetic_item','activate_user_theme','add_ai_credits','add_comedy_coins',
    'add_secret_santa_credits','add_user_points','admin_mark_megatalent_paid',
    'advance_battle_royale','aggregate_group_insights','approve_judge_application',
    'award_iq_badges','award_iq_season_xp','award_xp','bazaar_promote_listing',
    'brain_duel_spend_credits','buy_streak_freeze_xp','buyout_collectible_auction',
    'cache_get','cache_invalidate_by_tag','cache_set','can_watch_concert',
    'check_anon_dating_rate_limit','check_rate_limit',
    'claim_battle_pass_reward','claim_calendar_day','claim_daily_login_reward',
    'claim_daily_quest_secure','claim_daily_reward_atomic','claim_iq_battle_pass_tier',
    'claim_iq_daily_streak','claim_iq_streak_reward','claim_mission_reward',
    'claim_quest_node','cleanup_old_jobs','complete_async_job',
    'complete_auction_buyout','complete_job','compute_xp_streak',
    'convert_xp_to_credits','coupon_battle_pair','coupon_geo_nearby',
    'coupon_stacking_check','coupon_top_hot','coupon_trending_stores',
    'coupon_verification_stats','create_guild','create_iq_friend_challenge',
    'deduct_ai_credits','deduct_ai_credits_atomic','deduct_comedian_balance',
    'deduct_creative_forge_credits','deduct_emotion_credits','deduct_secret_santa_credits',
    'delete_auction_if_safe','dequeue_async_jobs','donate_xp','ensure_free_tier_credits',
    'expire_old_job_listings','fail_job','generate_daily_homework_challenge',
    'generate_megatalent_bracket','generate_megatalent_daily_challenge',
    'generate_referral_code','generate_story_share_code',
    'get_arena_leaderboard','get_battle_royale_available_payout',
    'get_campaign_available_balance','get_castle_leaderboard',
    'get_club_founding_progress','get_club_good_fund_total','get_dau_series',
    'get_demo_dating_profiles','get_eco_leaderboard','get_edge_function_stats_7d',
    'get_engagement_metrics','get_escape_room_hint','get_featured_campaign',
    'get_follower_count','get_following_count','get_fundraising_stats',
    'get_healthy_leaderboard','get_influencer_audience_insights',
    'get_iq_competition_counts','get_iq_countries_with_players',
    'get_iq_country_leaderboard','get_iq_country_top_players','get_iq_friend_comparison',
    'get_iq_funnel','get_iq_global_leaderboard','get_iq_goal_progress',
    'get_iq_leaderboard','get_iq_milestones','get_iq_performance_insights',
    'get_iq_progress','get_iq_public_profile','get_iq_training_plan',
    'get_iq_weekly_recap','get_job_challenges_hall_of_fame','get_last_week_xp_winners',
    'get_megatalent_bracket','get_megatalent_tip_stats','get_multiverse_explorers',
    'get_my_brand_api_key','get_my_conversation_presence_v1','get_my_weekly_xp_rank',
    'get_next_job','get_or_create_dm_conversation','get_or_create_iq_referral_code',
    'get_or_create_megatalent_referral_code','get_or_pick_daily_deal','get_perf_stats',
    'get_post_memories','get_profile_tip_stats','get_profiles_basic',
    'get_psychology_stats','get_public_campaign_donations','get_public_coupon_listings',
    'get_public_profiles','get_public_video_posts','get_recent_donations',
    'get_referral_funnel','get_referral_leaderboard','get_streak_week',
    'get_today_iq_challenge','get_top_donors','get_unified_xp_leaderboard',
    'get_user_challenges','get_user_job_achievements','get_user_mission_progress',
    'get_user_pause_count','get_vitals_daily','get_vitals_summary','get_wall_feed',
    'get_weekly_challenge_progress','get_weekly_xp_leaderboard','get_approved_safety_stories',
    'get_campaign_owner','get_campaign_title','challenge_monthly_prize_pool_cents',
    'challenge_tier','founding_members_remaining',
    'gift_ai_credits','gift_xp','grade_quiz_answer','grant_anonymous_dating_credits',
    'grant_founder_role','increment_ai_credits','increment_ai_gallery_likes',
    'increment_challenge_participants','increment_crystal_stat',
    'increment_homework_points','increment_megatalent_bracket_vote',
    'iq_test_cooldown_remaining','join_guild','leave_guild',
    'list_verified_founders','log_security_event','lucky_wheel_spin_secure',
    'mark_iq_notifications_read','moderate_comment','mt_bump_voting_streak',
    'mt_claim_season_tier','mt_feed_hot','mt_get_duel_pair',
    'mt_rate_limit_check','mt_unlock_user_achievements','noop','open_mystery_box',
    'pick_clip_of_day','place_auction_bid','place_collectible_bid',
    'place_iq_match_bet','place_memory_auction_bid','place_xp_bet',
    'process_influencer_withdrawal','process_masterchef_withdrawal',
    'process_withdrawal_request','purchase_brain_duel_powerup',
    'purchase_horse_from_market','purchase_mystery_box','purchase_shop_item',
    'record_daily_activity','record_job_checkin','redeem_iq_promo_code',
    'redeem_iq_referral_code','redeem_shop_item','refund_ai_credits_atomic',
    'refund_campaign_donation','refund_handwriting_credits',
    'refund_shadow_arena_credits','reject_judge_application',
    'release_brand_campaign_escrow','resolve_report','revoke_founder_role',
    'rewards_xp_leaderboard','rotate_my_brand_api_key','search_posts',
    'search_profiles_fts','search_users','send_credit_gift','send_secret_santa_gift',
    'set_config','spend_comedy_coins','spend_glamour_coins','spin_lucky_wheel',
    'start_battle_royale','start_iq_test','submit_iq_daily','submit_iq_test',
    'submit_iq_tournament_match_score','suggest_friends','track_challenge_action',
    'update_battle_stats','ensure_free_tier_credits','consume_free_tier_credits',
    'gdpr_purge_user_data','get_creator_available_cents',
    'get_or_create_iq_referral_code','payout_requires_review',
    'get_confessions_feed','claim_referral',
    'create_notification','award_points_and_log'
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
      AND has_function_privilege('authenticated', p.oid, 'EXECUTE')
  LOOP
    IF NOT (r.proname = ANY(keep)) THEN
      EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM PUBLIC, anon, authenticated;', r.sig);
    END IF;
  END LOOP;
END $$;
