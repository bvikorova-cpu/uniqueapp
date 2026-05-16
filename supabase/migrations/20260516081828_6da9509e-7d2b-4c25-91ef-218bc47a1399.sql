
-- 1. Judge applications
CREATE TABLE public.judge_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  motivation text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  reviewed_by uuid,
  reviewed_at timestamptz,
  review_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, status) DEFERRABLE INITIALLY DEFERRED
);
CREATE INDEX idx_judge_apps_status ON public.judge_applications(status);
ALTER TABLE public.judge_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users insert own judge application"
ON public.judge_applications FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users view own judge application"
ON public.judge_applications FOR SELECT TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));

CREATE POLICY "Admins update judge applications"
ON public.judge_applications FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(),'admin'));

-- 2. Reports
CREATE TABLE public.talent_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL,
  target_type text NOT NULL CHECK (target_type IN ('comment','submission','user')),
  target_id uuid NOT NULL,
  reason text NOT NULL,
  details text,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','resolved','dismissed')),
  resolved_by uuid,
  resolved_at timestamptz,
  resolution_notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_reports_status ON public.talent_reports(status, created_at DESC);
CREATE INDEX idx_reports_target ON public.talent_reports(target_type, target_id);
ALTER TABLE public.talent_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authed users create reports"
ON public.talent_reports FOR INSERT TO authenticated
WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users view own reports or admin/mod"
ON public.talent_reports FOR SELECT TO authenticated
USING (auth.uid() = reporter_id OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'moderator'));

CREATE POLICY "Admin/mod update reports"
ON public.talent_reports FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'moderator'));

-- 3. Comment moderation columns
ALTER TABLE public.talent_comments
  ADD COLUMN IF NOT EXISTS hidden boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS hidden_by uuid,
  ADD COLUMN IF NOT EXISTS hidden_reason text,
  ADD COLUMN IF NOT EXISTS hidden_at timestamptz;

-- Tighten read policy: hidden visible to author + admin/mod
DROP POLICY IF EXISTS "Anyone can view comments" ON public.talent_comments;
DROP POLICY IF EXISTS "Users can view comments" ON public.talent_comments;
DROP POLICY IF EXISTS "Comments are viewable by everyone" ON public.talent_comments;
CREATE POLICY "View non-hidden or own or staff"
ON public.talent_comments FOR SELECT
USING (
  hidden = false
  OR auth.uid() = user_id
  OR public.has_role(auth.uid(),'admin')
  OR public.has_role(auth.uid(),'moderator')
);

-- 4. RPCs
CREATE OR REPLACE FUNCTION public.approve_judge_application(_app_id uuid, _notes text DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid;
BEGIN
  IF NOT public.has_role(auth.uid(),'admin') THEN
    RAISE EXCEPTION 'forbidden';
  END IF;
  UPDATE public.judge_applications
    SET status='approved', reviewed_by=auth.uid(), reviewed_at=now(), review_notes=_notes
    WHERE id=_app_id AND status='pending'
    RETURNING user_id INTO _uid;
  IF _uid IS NULL THEN RAISE EXCEPTION 'application not found or not pending'; END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (_uid, 'judge')
    ON CONFLICT (user_id, role) DO NOTHING;
END; $$;

CREATE OR REPLACE FUNCTION public.reject_judge_application(_app_id uuid, _notes text DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(),'admin') THEN
    RAISE EXCEPTION 'forbidden';
  END IF;
  UPDATE public.judge_applications
    SET status='rejected', reviewed_by=auth.uid(), reviewed_at=now(), review_notes=_notes
    WHERE id=_app_id AND status='pending';
END; $$;

CREATE OR REPLACE FUNCTION public.moderate_comment(_comment_id uuid, _hide boolean, _reason text DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'moderator')) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;
  UPDATE public.talent_comments
    SET hidden=_hide,
        hidden_by=CASE WHEN _hide THEN auth.uid() ELSE NULL END,
        hidden_reason=CASE WHEN _hide THEN _reason ELSE NULL END,
        hidden_at=CASE WHEN _hide THEN now() ELSE NULL END
    WHERE id=_comment_id;
END; $$;

CREATE OR REPLACE FUNCTION public.resolve_report(_report_id uuid, _status text, _notes text DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'moderator')) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;
  IF _status NOT IN ('resolved','dismissed') THEN
    RAISE EXCEPTION 'invalid status';
  END IF;
  UPDATE public.talent_reports
    SET status=_status, resolved_by=auth.uid(), resolved_at=now(), resolution_notes=_notes
    WHERE id=_report_id;
END; $$;
