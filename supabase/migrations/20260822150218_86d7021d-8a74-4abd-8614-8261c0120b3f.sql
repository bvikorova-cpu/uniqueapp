ALTER TABLE public.service_bookings ADD COLUMN IF NOT EXISTS completed_at timestamptz;

CREATE TABLE IF NOT EXISTS public.service_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES public.service_bookings(id) ON DELETE CASCADE,
  provider_id uuid NOT NULL,
  reviewer_id uuid NOT NULL,
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text,
  is_visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (booking_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.service_reviews TO authenticated;
GRANT ALL ON public.service_reviews TO service_role;

ALTER TABLE public.service_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviewers can manage their own service reviews"
  ON public.service_reviews FOR ALL
  USING (auth.uid() = reviewer_id)
  WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "Providers can view reviews for their bookings"
  ON public.service_reviews FOR SELECT
  USING (auth.uid() = provider_id);

CREATE INDEX idx_service_reviews_provider ON public.service_reviews(provider_id, created_at DESC);
CREATE INDEX idx_service_reviews_booking ON public.service_reviews(booking_id);

CREATE TABLE IF NOT EXISTS public.service_notification_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES public.service_bookings(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('reminder_24h','reminder_1h','completed','no_show')),
  sent_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (booking_id, type)
);

GRANT SELECT ON public.service_notification_log TO authenticated;
GRANT ALL ON public.service_notification_log TO service_role;

ALTER TABLE public.service_notification_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Booking participants can view notification log"
  ON public.service_notification_log FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.service_bookings b WHERE b.id = booking_id AND (b.customer_id = auth.uid() OR b.provider_id = auth.uid())));

CREATE INDEX idx_service_notification_log_booking ON public.service_notification_log(booking_id, type);

DROP TRIGGER IF EXISTS trg_service_reviews_updated_at ON public.service_reviews;
CREATE TRIGGER trg_service_reviews_updated_at
  BEFORE UPDATE ON public.service_reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
