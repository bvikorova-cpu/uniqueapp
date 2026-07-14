
CREATE TYPE public.bug_severity AS ENUM ('minor', 'major', 'critical');
CREATE TYPE public.bug_status AS ENUM ('new', 'triage', 'confirmed', 'rejected', 'duplicate', 'fixed');

CREATE TABLE public.bug_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  page_url TEXT,
  steps TEXT,
  severity public.bug_severity NOT NULL DEFAULT 'minor',
  status public.bug_status NOT NULL DEFAULT 'new',
  admin_notes TEXT,
  rewarded BOOLEAN NOT NULL DEFAULT false,
  reward_amount INTEGER NOT NULL DEFAULT 0,
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_bug_reports_status ON public.bug_reports(status);
CREATE INDEX idx_bug_reports_user ON public.bug_reports(user_id);
CREATE INDEX idx_bug_reports_created ON public.bug_reports(created_at DESC);

GRANT SELECT, INSERT ON public.bug_reports TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bug_reports TO service_role;
GRANT ALL ON public.bug_reports TO service_role;

ALTER TABLE public.bug_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users insert own bug reports"
  ON public.bug_reports FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users view own bug reports"
  ON public.bug_reports FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins view all bug reports"
  ON public.bug_reports FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update bug reports"
  ON public.bug_reports FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete bug reports"
  ON public.bug_reports FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Trigger: auto-grant AI credits when status becomes 'confirmed'
CREATE OR REPLACE FUNCTION public.handle_bug_report_reward()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_amount INTEGER := 0;
BEGIN
  NEW.updated_at := now();

  IF NEW.status = 'confirmed'
     AND (OLD.status IS DISTINCT FROM 'confirmed')
     AND NEW.rewarded = false
     AND NEW.user_id IS NOT NULL THEN

    v_amount := CASE NEW.severity
      WHEN 'critical' THEN 50
      WHEN 'major' THEN 25
      ELSE 5
    END;

    PERFORM public.add_ai_credits(
      NEW.user_id,
      v_amount,
      'bug_report_reward',
      'bug_reports'
    );

    NEW.rewarded := true;
    NEW.reward_amount := v_amount;
    NEW.reviewed_at := COALESCE(NEW.reviewed_at, now());
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_bug_report_reward
  BEFORE UPDATE ON public.bug_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_bug_report_reward();
