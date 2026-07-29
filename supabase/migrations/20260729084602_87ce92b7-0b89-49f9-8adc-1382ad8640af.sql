CREATE OR REPLACE FUNCTION public.get_creative_forge_stats()
RETURNS TABLE(writers bigint, projects bigint, drafts bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    (SELECT count(*) FROM public.creative_forge_credits),
    (SELECT count(*) FROM public.creative_forge_projects),
    (SELECT count(*) FROM public.ai_generated_content);
$$;

GRANT EXECUTE ON FUNCTION public.get_creative_forge_stats() TO anon, authenticated, service_role;