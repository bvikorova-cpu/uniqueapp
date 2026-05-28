
-- 1. Add moderation columns
ALTER TABLE public.brand_sponsors
  ADD COLUMN IF NOT EXISTS moderation_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (moderation_status IN ('pending','approved','rejected')),
  ADD COLUMN IF NOT EXISTS moderation_reason TEXT,
  ADD COLUMN IF NOT EXISTS moderated_by UUID,
  ADD COLUMN IF NOT EXISTS moderated_at TIMESTAMPTZ;

-- Backfill: existing active brands shouldn't disappear
UPDATE public.brand_sponsors
SET moderation_status = 'approved', moderated_at = now()
WHERE moderation_status = 'pending' AND subscription_status = 'active';

CREATE INDEX IF NOT EXISTS idx_brand_sponsors_moderation
  ON public.brand_sponsors(moderation_status);

-- 2. Public visibility: active AND approved only
DROP POLICY IF EXISTS "Anyone can view active sponsors" ON public.brand_sponsors;
CREATE POLICY "Anyone can view active approved sponsors"
ON public.brand_sponsors FOR SELECT
USING (subscription_status = 'active' AND moderation_status = 'approved');

-- Owner can always see own row (to read rejection reason)
CREATE POLICY "Owners can view own sponsor record"
ON public.brand_sponsors FOR SELECT
USING (auth.uid() = user_id);

-- Admins see and update all
CREATE POLICY "Admins can view all sponsors"
ON public.brand_sponsors FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update any sponsor"
ON public.brand_sponsors FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- 3. Audit log table
CREATE TABLE IF NOT EXISTS public.brand_moderation_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES public.brand_sponsors(id) ON DELETE CASCADE,
  admin_id UUID NOT NULL,
  previous_status TEXT,
  new_status TEXT NOT NULL CHECK (new_status IN ('pending','approved','rejected')),
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.brand_moderation_audit TO authenticated;
GRANT ALL ON public.brand_moderation_audit TO service_role;

ALTER TABLE public.brand_moderation_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view moderation audit"
ON public.brand_moderation_audit FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert moderation audit"
ON public.brand_moderation_audit FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin') AND admin_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_brand_moderation_audit_brand
  ON public.brand_moderation_audit(brand_id, created_at DESC);

-- 4. Trigger: auto-record audit when admin changes moderation_status
CREATE OR REPLACE FUNCTION public.log_brand_moderation_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.moderation_status IS DISTINCT FROM OLD.moderation_status THEN
    INSERT INTO public.brand_moderation_audit
      (brand_id, admin_id, previous_status, new_status, reason)
    VALUES
      (NEW.id, COALESCE(NEW.moderated_by, auth.uid()),
       OLD.moderation_status, NEW.moderation_status, NEW.moderation_reason);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_brand_moderation_audit ON public.brand_sponsors;
CREATE TRIGGER trg_brand_moderation_audit
AFTER UPDATE OF moderation_status ON public.brand_sponsors
FOR EACH ROW EXECUTE FUNCTION public.log_brand_moderation_change();
