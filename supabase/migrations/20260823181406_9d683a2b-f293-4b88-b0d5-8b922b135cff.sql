DROP POLICY IF EXISTS "Subscribed users can vote" ON public.talent_votes;
CREATE POLICY "Registered users can vote" ON public.talent_votes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Subscribed users can comment" ON public.talent_comments;
CREATE POLICY "Registered users can comment" ON public.talent_comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Subscribed users can view active submissions" ON public.talent_submissions;