DROP FUNCTION IF EXISTS public.get_content_studio_stats();
CREATE FUNCTION public.get_content_studio_stats()
 RETURNS TABLE(content_created bigint, ai_generations bigint, active_creators bigint, total_uses bigint,
               my_content bigint, my_generations bigint, my_credits_used bigint)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT
    (SELECT count(*) FROM public.ai_generated_content)::bigint,
    (SELECT count(*) FROM public.ai_usage_history)::bigint,
    (SELECT count(DISTINCT user_id) FROM public.ai_usage_history WHERE created_at > now() - interval '30 days')::bigint,
    (SELECT coalesce(sum(credits_used),0) FROM public.ai_usage_history)::bigint,
    (SELECT count(*) FROM public.ai_generated_content WHERE user_id = auth.uid())::bigint,
    (SELECT count(*) FROM public.ai_usage_history WHERE user_id = auth.uid())::bigint,
    (SELECT coalesce(sum(credits_used),0) FROM public.ai_usage_history WHERE user_id = auth.uid())::bigint;
$function$;