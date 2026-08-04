GRANT SELECT ON public.time_reversal_posts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.time_reversal_posts TO authenticated;
GRANT ALL ON public.time_reversal_posts TO service_role;
GRANT SELECT ON public.time_reversal_likes TO anon;
GRANT SELECT, INSERT, DELETE ON public.time_reversal_likes TO authenticated;
GRANT ALL ON public.time_reversal_likes TO service_role;