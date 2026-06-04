
-- ============ MENTORS ============
CREATE TABLE IF NOT EXISTS public.mt_mentors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  expertise TEXT NOT NULL,
  bio TEXT,
  avatar_emoji TEXT DEFAULT '🎓',
  hourly_price_cents INTEGER NOT NULL CHECK (hourly_price_cents >= 100),
  rating NUMERIC(3,2) NOT NULL DEFAULT 5.00,
  sessions_count INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mt_mentors TO authenticated;
GRANT ALL ON public.mt_mentors TO service_role;
ALTER TABLE public.mt_mentors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mt_mentors_read_active" ON public.mt_mentors FOR SELECT TO authenticated USING (active OR user_id = auth.uid());
CREATE POLICY "mt_mentors_insert_own" ON public.mt_mentors FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "mt_mentors_update_own" ON public.mt_mentors FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "mt_mentors_delete_own" ON public.mt_mentors FOR DELETE TO authenticated USING (user_id = auth.uid());

-- ============ BOOKINGS ============
CREATE TABLE IF NOT EXISTS public.mt_mentorship_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id UUID NOT NULL REFERENCES public.mt_mentors(id) ON DELETE CASCADE,
  student_id UUID NOT NULL,
  price_cents INTEGER NOT NULL CHECK (price_cents > 0),
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','paid','accepted','declined','completed','refunded','cancelled')),
  stripe_session_id TEXT,
  stripe_payment_intent_id TEXT,
  stripe_transfer_id TEXT,
  paid_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  scheduled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.mt_mentorship_bookings TO authenticated;
GRANT ALL ON public.mt_mentorship_bookings TO service_role;
ALTER TABLE public.mt_mentorship_bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mt_book_read_party" ON public.mt_mentorship_bookings FOR SELECT TO authenticated
  USING (student_id = auth.uid() OR mentor_id IN (SELECT id FROM public.mt_mentors WHERE user_id = auth.uid()));
CREATE POLICY "mt_book_insert_student" ON public.mt_mentorship_bookings FOR INSERT TO authenticated
  WITH CHECK (student_id = auth.uid() AND status = 'pending');
CREATE POLICY "mt_book_update_party" ON public.mt_mentorship_bookings FOR UPDATE TO authenticated
  USING (student_id = auth.uid() OR mentor_id IN (SELECT id FROM public.mt_mentors WHERE user_id = auth.uid()));

-- ============ LISTINGS ============
CREATE TABLE IF NOT EXISTS public.mt_marketplace_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  price_cents INTEGER NOT NULL CHECK (price_cents >= 100),
  category TEXT NOT NULL DEFAULT 'service',
  eta_days INTEGER NOT NULL DEFAULT 7,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mt_marketplace_listings TO authenticated;
GRANT ALL ON public.mt_marketplace_listings TO service_role;
ALTER TABLE public.mt_marketplace_listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mt_list_read_active" ON public.mt_marketplace_listings FOR SELECT TO authenticated USING (active OR seller_id = auth.uid());
CREATE POLICY "mt_list_insert_own" ON public.mt_marketplace_listings FOR INSERT TO authenticated WITH CHECK (seller_id = auth.uid());
CREATE POLICY "mt_list_update_own" ON public.mt_marketplace_listings FOR UPDATE TO authenticated USING (seller_id = auth.uid());
CREATE POLICY "mt_list_delete_own" ON public.mt_marketplace_listings FOR DELETE TO authenticated USING (seller_id = auth.uid());

-- ============ ORDERS ============
CREATE TABLE IF NOT EXISTS public.mt_marketplace_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.mt_marketplace_listings(id) ON DELETE RESTRICT,
  buyer_id UUID NOT NULL,
  seller_id UUID NOT NULL,
  price_cents INTEGER NOT NULL CHECK (price_cents > 0),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','paid','delivered','completed','refunded','cancelled')),
  stripe_session_id TEXT,
  stripe_payment_intent_id TEXT,
  stripe_transfer_id TEXT,
  paid_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  delivery_due_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.mt_marketplace_orders TO authenticated;
GRANT ALL ON public.mt_marketplace_orders TO service_role;
ALTER TABLE public.mt_marketplace_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mt_ord_read_party" ON public.mt_marketplace_orders FOR SELECT TO authenticated
  USING (buyer_id = auth.uid() OR seller_id = auth.uid());
CREATE POLICY "mt_ord_insert_buyer" ON public.mt_marketplace_orders FOR INSERT TO authenticated
  WITH CHECK (buyer_id = auth.uid() AND status = 'pending');
CREATE POLICY "mt_ord_update_party" ON public.mt_marketplace_orders FOR UPDATE TO authenticated
  USING (buyer_id = auth.uid() OR seller_id = auth.uid());

-- ============ Update triggers ============
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$
LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS trg_mt_mentors_updated ON public.mt_mentors;
CREATE TRIGGER trg_mt_mentors_updated BEFORE UPDATE ON public.mt_mentors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS trg_mt_book_updated ON public.mt_mentorship_bookings;
CREATE TRIGGER trg_mt_book_updated BEFORE UPDATE ON public.mt_mentorship_bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS trg_mt_list_updated ON public.mt_marketplace_listings;
CREATE TRIGGER trg_mt_list_updated BEFORE UPDATE ON public.mt_marketplace_listings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS trg_mt_ord_updated ON public.mt_marketplace_orders;
CREATE TRIGGER trg_mt_ord_updated BEFORE UPDATE ON public.mt_marketplace_orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_mt_book_student ON public.mt_mentorship_bookings(student_id);
CREATE INDEX IF NOT EXISTS idx_mt_book_mentor ON public.mt_mentorship_bookings(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mt_book_session ON public.mt_mentorship_bookings(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_mt_ord_buyer ON public.mt_marketplace_orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_mt_ord_seller ON public.mt_marketplace_orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_mt_ord_session ON public.mt_marketplace_orders(stripe_session_id);
