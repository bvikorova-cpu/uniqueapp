REVOKE EXECUTE ON FUNCTION public._log_activity(uuid, text, uuid, text, jsonb) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public._log_activity(uuid, text, uuid, text, jsonb) FROM anon;
REVOKE EXECUTE ON FUNCTION public._log_activity(uuid, text, uuid, text, jsonb) FROM authenticated;

REVOKE EXECUTE ON FUNCTION public.tg_activity_post_created() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.tg_activity_post_created() FROM anon;
REVOKE EXECUTE ON FUNCTION public.tg_activity_post_created() FROM authenticated;

REVOKE EXECUTE ON FUNCTION public.tg_activity_post_liked() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.tg_activity_post_liked() FROM anon;
REVOKE EXECUTE ON FUNCTION public.tg_activity_post_liked() FROM authenticated;

REVOKE EXECUTE ON FUNCTION public.tg_activity_post_commented() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.tg_activity_post_commented() FROM anon;
REVOKE EXECUTE ON FUNCTION public.tg_activity_post_commented() FROM authenticated;

REVOKE EXECUTE ON FUNCTION public.tg_activity_follow_added() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.tg_activity_follow_added() FROM anon;
REVOKE EXECUTE ON FUNCTION public.tg_activity_follow_added() FROM authenticated;