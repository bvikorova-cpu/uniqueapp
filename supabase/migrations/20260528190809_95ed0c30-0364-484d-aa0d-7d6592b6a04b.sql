
-- Appeals table
CREATE TABLE public.brand_moderation_appeals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES public.brand_sponsors(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','under_review','accepted','dismissed')),
  appeal_text TEXT NOT NULL,
  supporting_url TEXT,
  admin_response TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_brand_appeals_brand ON public.brand_moderation_appeals(brand_id);
CREATE INDEX idx_brand_appeals_status ON public.brand_moderation_appeals(status);

GRANT SELECT, INSERT, UPDATE ON public.brand_moderation_appeals TO authenticated;
GRANT ALL ON public.brand_moderation_appeals TO service_role;

ALTER TABLE public.brand_moderation_appeals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can view own appeals"
  ON public.brand_moderation_appeals FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Owners can create appeals for own brand"
  ON public.brand_moderation_appeals FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.brand_sponsors b
      WHERE b.id = brand_id AND b.user_id = auth.uid() AND b.moderation_status = 'rejected'
    )
  );

CREATE POLICY "Admins can update appeals"
  ON public.brand_moderation_appeals FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_brand_appeals_updated_at
  BEFORE UPDATE ON public.brand_moderation_appeals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Notify brand owner on moderation decision
CREATE OR REPLACE FUNCTION public.notify_brand_moderation_decision()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.moderation_status IS DISTINCT FROM OLD.moderation_status
     AND NEW.moderation_status IN ('approved','rejected') THEN
    INSERT INTO public.notifications (user_id, type, title, message, action_url, related_id, metadata)
    VALUES (
      NEW.user_id,
      'brand_moderation_' || NEW.moderation_status,
      CASE WHEN NEW.moderation_status = 'approved'
           THEN 'Your brand was approved 🎉'
           ELSE 'Your brand was rejected' END,
      CASE WHEN NEW.moderation_status = 'approved'
           THEN NEW.name || ' is now live in Brand Battle Arena.'
           ELSE COALESCE(NEW.moderation_reason, 'Please review feedback and submit an appeal if needed.') END,
      '/sponsor-dashboard',
      NEW.id,
      jsonb_build_object('brand_id', NEW.id, 'brand_name', NEW.name, 'status', NEW.moderation_status)
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_brand_moderation ON public.brand_sponsors;
CREATE TRIGGER trg_notify_brand_moderation
  AFTER UPDATE ON public.brand_sponsors
  FOR EACH ROW EXECUTE FUNCTION public.notify_brand_moderation_decision();
