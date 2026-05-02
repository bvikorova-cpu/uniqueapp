-- Trigger functions and privileged helpers: revoke from everyone except service_role
REVOKE EXECUTE ON FUNCTION public.deduct_ai_credits(uuid, integer) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.process_campaign_donation(uuid, text, uuid, text, text, numeric, boolean, boolean, text, text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.evaluate_xp_bets() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.rotate_mystery_events() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.rotate_seasonal_missions() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.tg_mission_event_attended() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.tg_mission_hashtag_used() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.tg_mission_post_commented() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.tg_mission_post_created() FROM PUBLIC, anon, authenticated;

-- Number/code generator helpers used by triggers — only DB itself needs them
REVOKE EXECUTE ON FUNCTION public.generate_certificate_number() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.generate_referral_code() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.generate_story_share_code() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.generate_ticket_number() FROM PUBLIC, anon, authenticated;

-- User-callable RPCs: drop anon, keep authenticated
REVOKE EXECUTE ON FUNCTION public.gift_xp(uuid, integer, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.place_xp_bet(text, integer, integer, integer) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.redeem_shop_item(text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.spin_lucky_wheel() FROM PUBLIC, anon;

-- Admin metrics: drop anon (function still enforces admin internally)
REVOKE EXECUTE ON FUNCTION public.get_engagement_metrics(integer) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_dau_series(integer) FROM PUBLIC, anon;