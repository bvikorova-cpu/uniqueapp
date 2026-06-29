
DROP POLICY IF EXISTS "View non-hidden or own or admin reviews" ON public.seller_reviews;
DROP POLICY IF EXISTS "Admins update reviews" ON public.seller_reviews;
DROP POLICY IF EXISTS "Admins delete reviews" ON public.seller_reviews;

ALTER TABLE public.seller_reviews
  ADD COLUMN IF NOT EXISTS is_hidden boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS hidden_reason text,
  ADD COLUMN IF NOT EXISTS hidden_at timestamptz,
  ADD COLUMN IF NOT EXISTS hidden_by uuid;

DROP POLICY IF EXISTS "Anyone can view seller reviews" ON public.seller_reviews;
CREATE POLICY "View non-hidden or own or admin reviews"
  ON public.seller_reviews FOR SELECT TO authenticated
  USING (
    is_hidden = false
    OR auth.uid() = buyer_id
    OR public.has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Admins update reviews"
  ON public.seller_reviews FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins delete reviews"
  ON public.seller_reviews FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TABLE IF NOT EXISTS public.review_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id uuid NOT NULL REFERENCES public.seller_reviews(id) ON DELETE CASCADE,
  reporter_id uuid NOT NULL,
  reason text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'pending',
  resolved_by uuid,
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS review_reports_review_idx ON public.review_reports(review_id);
CREATE INDEX IF NOT EXISTS review_reports_status_idx ON public.review_reports(status, created_at DESC);

GRANT SELECT, INSERT, UPDATE ON public.review_reports TO authenticated;
GRANT ALL ON public.review_reports TO service_role;

ALTER TABLE public.review_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users create review reports" ON public.review_reports;
CREATE POLICY "Users create review reports"
  ON public.review_reports FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = reporter_id);

DROP POLICY IF EXISTS "Reporter or admin view reports" ON public.review_reports;
CREATE POLICY "Reporter or admin view reports"
  ON public.review_reports FOR SELECT TO authenticated
  USING (auth.uid() = reporter_id OR public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins resolve reports" ON public.review_reports;
CREATE POLICY "Admins resolve reports"
  ON public.review_reports FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

ALTER TABLE public.marketplace_responses
  ADD COLUMN IF NOT EXISTS order_id uuid REFERENCES public.skill_service_orders(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS marketplace_responses_order_idx ON public.marketplace_responses(order_id, created_at);

CREATE TABLE IF NOT EXISTS public.skill_order_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.skill_service_orders(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  from_status text,
  to_status text,
  actor_id uuid,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS skill_order_events_order_idx ON public.skill_order_events(order_id, created_at);

GRANT SELECT, INSERT ON public.skill_order_events TO authenticated;
GRANT ALL ON public.skill_order_events TO service_role;

ALTER TABLE public.skill_order_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Order participants view events" ON public.skill_order_events;
CREATE POLICY "Order participants view events"
  ON public.skill_order_events FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.skill_service_orders o
    WHERE o.id = order_id AND (o.buyer_id = auth.uid() OR o.seller_id = auth.uid())
  ));

DROP POLICY IF EXISTS "Order participants insert notes" ON public.skill_order_events;
CREATE POLICY "Order participants insert notes"
  ON public.skill_order_events FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = actor_id
    AND EXISTS (
      SELECT 1 FROM public.skill_service_orders o
      WHERE o.id = order_id AND (o.buyer_id = auth.uid() OR o.seller_id = auth.uid())
    )
  );

CREATE OR REPLACE FUNCTION public.log_skill_order_event()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.skill_order_events(order_id, event_type, to_status, actor_id)
    VALUES (NEW.id, 'created', NEW.status, NEW.buyer_id);
  ELSIF TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.skill_order_events(order_id, event_type, from_status, to_status, actor_id)
    VALUES (NEW.id, 'status_change', OLD.status, NEW.status, auth.uid());
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_log_skill_order_event ON public.skill_service_orders;
CREATE TRIGGER trg_log_skill_order_event
  AFTER INSERT OR UPDATE ON public.skill_service_orders
  FOR EACH ROW EXECUTE FUNCTION public.log_skill_order_event();
