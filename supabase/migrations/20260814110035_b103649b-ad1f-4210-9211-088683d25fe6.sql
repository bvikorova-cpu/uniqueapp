GRANT SELECT ON public.influencer_posts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.influencer_posts TO authenticated;
GRANT ALL ON public.influencer_posts TO service_role;

GRANT SELECT ON public.influencer_profiles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.influencer_profiles TO authenticated;
GRANT ALL ON public.influencer_profiles TO service_role;

GRANT SELECT ON public.influencer_followers TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.influencer_followers TO authenticated;
GRANT ALL ON public.influencer_followers TO service_role;

GRANT SELECT ON public.influencer_post_likes TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.influencer_post_likes TO authenticated;
GRANT ALL ON public.influencer_post_likes TO service_role;

GRANT SELECT, INSERT ON public.influencer_sent_gifts TO authenticated;
GRANT ALL ON public.influencer_sent_gifts TO service_role;