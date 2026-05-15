
REVOKE EXECUTE ON FUNCTION public._grant_xp_and_log(uuid, int, text, text, jsonb) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.claim_battle_pass_reward(uuid, int, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.claim_calendar_day(text, int) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.acquire_cosmetic_item(uuid) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.claim_battle_pass_reward(uuid, int, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.claim_calendar_day(text, int) TO authenticated;
GRANT EXECUTE ON FUNCTION public.acquire_cosmetic_item(uuid) TO authenticated;
