
-- Skills marketplace service orders (one-off payment for hours of work)
CREATE TABLE public.skill_service_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  offering_id uuid NOT NULL REFERENCES public.skill_offerings(id) ON DELETE CASCADE,
  buyer_id uuid NOT NULL,
  seller_id uuid NOT NULL,
  hours numeric(6,2) NOT NULL DEFAULT 1 CHECK (hours > 0 AND hours <= 1000),
  unit_price_cents integer NOT NULL CHECK (unit_price_cents >= 0),
  amount_cents integer NOT NULL CHECK (amount_cents >= 0),
  currency text NOT NULL DEFAULT 'eur',
  status text NOT NULL DEFAULT 'pending',
  stripe_session_id text,
  buyer_message text,
  scheduled_for timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX skill_service_orders_buyer_idx ON public.skill_service_orders(buyer_id, created_at DESC);
CREATE INDEX skill_service_orders_seller_idx ON public.skill_service_orders(seller_id, created_at DESC);
CREATE INDEX skill_service_orders_offering_idx ON public.skill_service_orders(offering_id);

GRANT SELECT, INSERT, UPDATE ON public.skill_service_orders TO authenticated;
GRANT ALL ON public.skill_service_orders TO service_role;

ALTER TABLE public.skill_service_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Buyers view own orders"
  ON public.skill_service_orders FOR SELECT
  TO authenticated
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Buyers create own orders"
  ON public.skill_service_orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = buyer_id AND buyer_id <> seller_id);

CREATE POLICY "Seller can update status of received orders"
  ON public.skill_service_orders FOR UPDATE
  TO authenticated
  USING (auth.uid() = seller_id OR auth.uid() = buyer_id)
  WITH CHECK (auth.uid() = seller_id OR auth.uid() = buyer_id);

CREATE TRIGGER skill_service_orders_updated_at
  BEFORE UPDATE ON public.skill_service_orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
