GRANT SELECT, INSERT, UPDATE, DELETE ON public.mentor_moods TO authenticated;
GRANT ALL ON public.mentor_moods TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mentor_xp TO authenticated;
GRANT ALL ON public.mentor_xp TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mentor_action_plans TO authenticated;
GRANT ALL ON public.mentor_action_plans TO service_role;

-- Ensure INSERT policies have WITH CHECK for authenticated writes.
DROP POLICY IF EXISTS "Users can manage own moods" ON public.mentor_moods;
CREATE POLICY "Users can manage own moods" ON public.mentor_moods
  FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own xp" ON public.mentor_xp;
CREATE POLICY "Users can manage own xp" ON public.mentor_xp
  FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own action plans" ON public.mentor_action_plans;
CREATE POLICY "Users can manage own action plans" ON public.mentor_action_plans
  FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);