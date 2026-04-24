
-- Switch all sanitized public views to security_invoker mode
ALTER VIEW public.sports_predictions_public SET (security_invoker = true);
ALTER VIEW public.escape_room_puzzles_public SET (security_invoker = true);
ALTER VIEW public.brain_duel_questions_public SET (security_invoker = true);
ALTER VIEW public.iq_questions_public SET (security_invoker = true);
ALTER VIEW public.iq_test_questions_public SET (security_invoker = true);
ALTER VIEW public.job_listings_public SET (security_invoker = true);

-- Admin SELECT policies on locked-down base tables (so admins can audit)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname='has_role') THEN
    EXECUTE 'CREATE POLICY "Admins view escape_room_puzzles" ON public.escape_room_puzzles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), ''admin''::app_role))';
    EXECUTE 'CREATE POLICY "Admins view brain_duel_questions" ON public.brain_duel_questions FOR SELECT TO authenticated USING (public.has_role(auth.uid(), ''admin''::app_role))';
    EXECUTE 'CREATE POLICY "Admins view iq_questions" ON public.iq_questions FOR SELECT TO authenticated USING (public.has_role(auth.uid(), ''admin''::app_role))';
    EXECUTE 'CREATE POLICY "Admins view iq_test_questions" ON public.iq_test_questions FOR SELECT TO authenticated USING (public.has_role(auth.uid(), ''admin''::app_role))';
  END IF;
END $$;
