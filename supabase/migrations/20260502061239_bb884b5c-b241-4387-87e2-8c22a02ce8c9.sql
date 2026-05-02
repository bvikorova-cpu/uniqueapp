DROP POLICY IF EXISTS "Subscribed users can create skill offerings" ON public.skill_offerings;

CREATE POLICY "Users can create their own skill offerings"
  ON public.skill_offerings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);