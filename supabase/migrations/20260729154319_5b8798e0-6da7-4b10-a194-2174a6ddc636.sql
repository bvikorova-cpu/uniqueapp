GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_prompt_history TO authenticated;
GRANT ALL ON public.ai_prompt_history TO service_role;

GRANT SELECT ON public.ai_community_gallery TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_community_gallery TO authenticated;
GRANT ALL ON public.ai_community_gallery TO service_role;

GRANT SELECT ON public.ai_gallery_likes TO anon;
GRANT SELECT, INSERT, DELETE ON public.ai_gallery_likes TO authenticated;
GRANT ALL ON public.ai_gallery_likes TO service_role;