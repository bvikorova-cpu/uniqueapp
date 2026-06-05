
GRANT INSERT ON public.dating_boosts TO authenticated;
CREATE POLICY "user_insert_own_boost" ON public.dating_boosts
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND expires_at > now() AND expires_at <= now() + interval '24 hours');
