REVOKE ALL ON FUNCTION public.notify_brain_duel_friend_challenge() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.notify_brain_duel_friend_challenge() FROM anon;
REVOKE ALL ON FUNCTION public.notify_brain_duel_friend_challenge() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.notify_brain_duel_friend_challenge() TO service_role;