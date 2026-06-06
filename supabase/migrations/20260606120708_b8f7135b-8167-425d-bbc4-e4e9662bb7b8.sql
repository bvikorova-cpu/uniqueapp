
ALTER TABLE public.dating_profiles
  ADD COLUMN IF NOT EXISTS is_shadow_banned BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS shadow_banned_at TIMESTAMPTZ;

ALTER TABLE public.dating_reports
  ADD COLUMN IF NOT EXISTS moderator_notes TEXT,
  ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMPTZ;

CREATE OR REPLACE FUNCTION public.dating_reports_auto_shadowban()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  pending_count INT;
BEGIN
  SELECT COUNT(*) INTO pending_count
  FROM public.dating_reports
  WHERE reported_id = NEW.reported_id
    AND status = 'pending'
    AND created_at > now() - INTERVAL '30 days';

  IF pending_count >= 3 THEN
    UPDATE public.dating_profiles
    SET is_shadow_banned = true,
        shadow_banned_at = COALESCE(shadow_banned_at, now())
    WHERE user_id = NEW.reported_id
      AND is_shadow_banned = false;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_dating_reports_shadowban ON public.dating_reports;
CREATE TRIGGER trg_dating_reports_shadowban
AFTER INSERT ON public.dating_reports
FOR EACH ROW EXECUTE FUNCTION public.dating_reports_auto_shadowban();

CREATE INDEX IF NOT EXISTS idx_dating_profiles_shadow ON public.dating_profiles (is_shadow_banned) WHERE is_shadow_banned = true;
