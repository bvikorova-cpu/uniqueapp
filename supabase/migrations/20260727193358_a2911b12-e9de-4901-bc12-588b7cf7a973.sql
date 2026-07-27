REVOKE ALL ON FUNCTION public.consume_free_tier_credits_for_user(uuid, integer, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.consume_free_tier_credits_for_user(uuid, integer, text) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_free_tier_credits_for_user(uuid, integer, text) TO service_role;