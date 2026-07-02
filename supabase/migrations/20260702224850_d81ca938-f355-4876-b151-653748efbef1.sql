GRANT SELECT ON public.login_calendar_templates TO anon, authenticated;
GRANT ALL ON public.login_calendar_templates TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_calendar_claims TO authenticated;
GRANT ALL ON public.user_calendar_claims TO service_role;