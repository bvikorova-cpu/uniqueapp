
-- BLOCKS
CREATE TABLE public.exclusive_connection_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_user UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  blocked_user UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (blocker_user, blocked_user),
  CHECK (blocker_user <> blocked_user)
);

GRANT SELECT, INSERT, DELETE ON public.exclusive_connection_blocks TO authenticated;
GRANT ALL ON public.exclusive_connection_blocks TO service_role;

ALTER TABLE public.exclusive_connection_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members read own blocks"
  ON public.exclusive_connection_blocks FOR SELECT
  TO authenticated
  USING (auth.uid() = blocker_user OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Members create own blocks"
  ON public.exclusive_connection_blocks FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = blocker_user
    AND public.is_exclusive_member(auth.uid())
  );

CREATE POLICY "Members remove own blocks"
  ON public.exclusive_connection_blocks FOR DELETE
  TO authenticated
  USING (auth.uid() = blocker_user OR public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_conn_blocks_blocker ON public.exclusive_connection_blocks(blocker_user);
CREATE INDEX idx_conn_blocks_blocked ON public.exclusive_connection_blocks(blocked_user);

-- REPORTS
CREATE TABLE public.exclusive_connection_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_user UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_user UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('profile','interest')),
  interest_id UUID REFERENCES public.exclusive_connection_interests(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  note TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','resolved','dismissed')),
  resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.exclusive_connection_reports TO authenticated;
GRANT ALL ON public.exclusive_connection_reports TO service_role;

ALTER TABLE public.exclusive_connection_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reporter reads own reports; admins read all"
  ON public.exclusive_connection_reports FOR SELECT
  TO authenticated
  USING (auth.uid() = reporter_user OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Members file reports"
  ON public.exclusive_connection_reports FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = reporter_user
    AND public.is_exclusive_member(auth.uid())
    AND reporter_user <> target_user
  );

CREATE POLICY "Admins resolve reports"
  ON public.exclusive_connection_reports FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_conn_reports_status ON public.exclusive_connection_reports(status, created_at DESC);

-- Harden interest INSERT: block if either party blocked the other
DROP POLICY IF EXISTS "Members send interest" ON public.exclusive_connection_interests;
CREATE POLICY "Members send interest"
  ON public.exclusive_connection_interests FOR INSERT
  TO authenticated
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
