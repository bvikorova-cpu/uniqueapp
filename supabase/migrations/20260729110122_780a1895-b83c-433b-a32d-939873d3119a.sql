CREATE OR REPLACE FUNCTION public.get_content_studio_stats()
RETURNS TABLE(content_created bigint, ai_generations bigint, active_creators bigint, total_uses bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    (SELECT count(*) FROM public.ai_generated_content)::bigint,
    (SELECT count(*) FROM public.ai_usage_history)::bigint,
    (SELECT count(DISTINCT user_id) FROM public.ai_usage_history WHERE created_at > now() - interval '30 days')::bigint,
    (SELECT coalesce(sum(credits_used),0) FROM public.ai_usage_history)::bigint;
$$;

GRANT EXECUTE ON FUNCTION public.get_content_studio_stats() TO anon, authenticated, service_role;