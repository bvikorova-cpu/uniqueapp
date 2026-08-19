DROP POLICY IF EXISTS "eco_votes insert own" ON public.eco_votes;
DROP POLICY IF EXISTS "eco_votes delete own" ON public.eco_votes;
CREATE POLICY "eco_votes_insert_registered" ON public.eco_votes FOR INSERT TO authenticated
WITH CHECK (auth.uid() = voter_id AND NOT EXISTS (SELECT 1 FROM public.eco_submissions s WHERE s.id = eco_votes.submission_id AND s.user_id = auth.uid()));
CREATE POLICY "eco_votes_delete_own" ON public.eco_votes FOR DELETE TO authenticated USING (auth.uid() = voter_id);
REVOKE INSERT, UPDATE, DELETE ON public.eco_votes FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.healthy_votes FROM anon;