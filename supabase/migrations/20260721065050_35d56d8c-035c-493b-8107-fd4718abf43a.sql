
DROP POLICY IF EXISTS "Members read own blocks" ON public.exclusive_connection_blocks;
DROP POLICY IF EXISTS "Members create own blocks" ON public.exclusive_connection_blocks;
DROP POLICY IF EXISTS "Members remove own blocks" ON public.exclusive_connection_blocks;

CREATE POLICY "Members read own blocks"
  ON public.exclusive_connection_blocks FOR SELECT TO authenticated
  USING (auth.uid() = blocker_user OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Members create own blocks"
  ON public.exclusive_connection_blocks FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = blocker_user AND public.is_exclusive_member(auth.uid()));
CREATE POLICY "Members remove own blocks"
  ON public.exclusive_connection_blocks FOR DELETE TO authenticated
  USING (auth.uid() = blocker_user OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Reporter reads own reports; admins read all" ON public.exclusive_connection_reports;
DROP POLICY IF EXISTS "Members file reports" ON public.exclusive_connection_reports;
DROP POLICY IF EXISTS "Admins resolve reports" ON public.exclusive_connection_reports;

CREATE POLICY "Reporter reads own reports; admins read all"
  ON public.exclusive_connection_reports FOR SELECT TO authenticated
  USING (auth.uid() = reporter_user OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Members file reports"
  ON public.exclusive_connection_reports FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = reporter_user
    AND public.is_exclusive_member(auth.uid())
    AND reporter_user <> target_user
  );
CREATE POLICY "Admins resolve reports"
  ON public.exclusive_connection_reports FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Members send interest" ON public.exclusive_connection_interests;
CREATE POLICY "Members send interest"
  ON public.exclusive_connection_interests FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = from_user
    AND public.is_exclusive_member(auth.uid())
    AND public.is_exclusive_member(to_user)
    AND NOT EXISTS (
      SELECT 1 FROM public.exclusive_connection_blocks
      WHERE (blocker_user = auth.uid() AND blocked_user = to_user)
         OR (blocker_user = to_user   AND blocked_user = auth.uid())
    )
  );
