
CREATE TABLE public.exclusive_forum_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('thread','reply')),
  target_id UUID NOT NULL,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','resolved','dismissed')),
  resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.exclusive_forum_reports TO authenticated;
GRANT ALL ON public.exclusive_forum_reports TO service_role;
ALTER TABLE public.exclusive_forum_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members create reports" ON public.exclusive_forum_reports FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = reporter_id
    AND (public.is_exclusive_member(auth.uid()) OR public.has_role(auth.uid(),'admin'))
  );
CREATE POLICY "Reporter sees own" ON public.exclusive_forum_reports FOR SELECT TO authenticated
  USING (auth.uid() = reporter_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admin updates reports" ON public.exclusive_forum_reports FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admin deletes reports" ON public.exclusive_forum_reports FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin'));

CREATE INDEX idx_excl_forum_reports_status ON public.exclusive_forum_reports (status, created_at DESC);
CREATE UNIQUE INDEX idx_excl_forum_reports_unique_pending
  ON public.exclusive_forum_reports (reporter_id, target_type, target_id)
  WHERE status = 'pending';
