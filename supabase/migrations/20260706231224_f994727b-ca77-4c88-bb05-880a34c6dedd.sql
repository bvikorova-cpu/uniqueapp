
-- ============ service_providers ============
CREATE TABLE IF NOT EXISTS public.service_providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL UNIQUE,
  category text NOT NULL DEFAULT 'other',
  business_name text NOT NULL,
  description text,
  city text,
  avatar_url text,
  languages text[] DEFAULT ARRAY['en']::text[],
  price_cents integer,
  duration_min integer NOT NULL DEFAULT 60,
  timezone text NOT NULL DEFAULT 'UTC',
  is_accepting_bookings boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.service_providers TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.service_providers TO authenticated;
GRANT ALL ON public.service_providers TO service_role;

ALTER TABLE public.service_providers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view accepting providers"
  ON public.service_providers FOR SELECT
  USING (is_accepting_bookings = true OR auth.uid() = owner_id);

CREATE POLICY "Owners manage their provider profile"
  ON public.service_providers FOR ALL
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE INDEX IF NOT EXISTS idx_service_providers_category ON public.service_providers(category);
CREATE INDEX IF NOT EXISTS idx_service_providers_city ON public.service_providers(city);

-- ============ service_availability_rules ============
CREATE TABLE IF NOT EXISTS public.service_availability_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL,
  weekday smallint NOT NULL CHECK (weekday BETWEEN 0 AND 6),
  start_time time NOT NULL,
  end_time time NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (end_time > start_time)
);

GRANT SELECT ON public.service_availability_rules TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.service_availability_rules TO authenticated;
GRANT ALL ON public.service_availability_rules TO service_role;

ALTER TABLE public.service_availability_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view service rules"
  ON public.service_availability_rules FOR SELECT USING (true);

CREATE POLICY "Provider manages their service rules"
  ON public.service_availability_rules FOR ALL
  USING (auth.uid() = provider_id)
  WITH CHECK (auth.uid() = provider_id);

CREATE INDEX IF NOT EXISTS idx_service_rules_provider ON public.service_availability_rules(provider_id);

-- ============ service_availability_blocks ============
CREATE TABLE IF NOT EXISTS public.service_availability_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (ends_at > starts_at)
);

GRANT SELECT ON public.service_availability_blocks TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.service_availability_blocks TO authenticated;
GRANT ALL ON public.service_availability_blocks TO service_role;

ALTER TABLE public.service_availability_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view service blocks"
  ON public.service_availability_blocks FOR SELECT USING (true);

CREATE POLICY "Provider manages their service blocks"
  ON public.service_availability_blocks FOR ALL
  USING (auth.uid() = provider_id)
  WITH CHECK (auth.uid() = provider_id);

CREATE INDEX IF NOT EXISTS idx_service_blocks_provider ON public.service_availability_blocks(provider_id, starts_at);

-- ============ service_bookings ============
CREATE TABLE IF NOT EXISTS public.service_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL,
  customer_id uuid NOT NULL,
  scheduled_at timestamptz NOT NULL,
  duration_minutes integer NOT NULL DEFAULT 60,
  status text NOT NULL DEFAULT 'pending_payment',
  price_cents integer NOT NULL,
  currency text NOT NULL DEFAULT 'EUR',
  customer_notes text,
  provider_notes text,
  stripe_checkout_session_id text,
  stripe_payment_intent_id text,
  stripe_charge_id text,
  confirmed_at timestamptz,
  cancelled_at timestamptz,
  cancelled_by text,
  cancellation_reason text,
  refund_amount_cents integer,
  refunded_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.service_bookings TO authenticated;
GRANT ALL ON public.service_bookings TO service_role;

ALTER TABLE public.service_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers view their own bookings"
  ON public.service_bookings FOR SELECT
  USING (auth.uid() = customer_id);

CREATE POLICY "Providers view bookings for their profile"
  ON public.service_bookings FOR SELECT
  USING (auth.uid() = provider_id);

CREATE POLICY "Customers create own pending bookings"
  ON public.service_bookings FOR INSERT
  WITH CHECK (auth.uid() = customer_id AND status = 'pending_payment');

CREATE POLICY "Providers update their bookings"
  ON public.service_bookings FOR UPDATE
  USING (auth.uid() = provider_id)
  WITH CHECK (auth.uid() = provider_id);

CREATE OR REPLACE FUNCTION public.validate_service_booking_status()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.status NOT IN (
    'pending_payment','confirmed','completed',
    'cancelled_by_customer','cancelled_by_provider','refunded','no_show'
  ) THEN
    RAISE EXCEPTION 'Invalid service booking status: %', NEW.status;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_service_booking_status ON public.service_bookings;
CREATE TRIGGER trg_validate_service_booking_status
  BEFORE INSERT OR UPDATE ON public.service_bookings
  FOR EACH ROW EXECUTE FUNCTION public.validate_service_booking_status();

CREATE INDEX IF NOT EXISTS idx_service_bookings_provider_time
  ON public.service_bookings(provider_id, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_service_bookings_customer
  ON public.service_bookings(customer_id, scheduled_at DESC);

-- ============ service_payouts ============
CREATE TABLE IF NOT EXISTS public.service_payouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL,
  booking_id uuid NOT NULL REFERENCES public.service_bookings(id) ON DELETE CASCADE,
  amount_cents integer NOT NULL,
  platform_fee_cents integer NOT NULL,
  currency text NOT NULL DEFAULT 'EUR',
  status text NOT NULL DEFAULT 'pending',
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (booking_id)
);

GRANT SELECT ON public.service_payouts TO authenticated;
GRANT ALL ON public.service_payouts TO service_role;

ALTER TABLE public.service_payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Providers view their payouts"
  ON public.service_payouts FOR SELECT
  USING (auth.uid() = provider_id);

-- ============ triggers ============
DROP TRIGGER IF EXISTS trg_service_providers_updated_at ON public.service_providers;
CREATE TRIGGER trg_service_providers_updated_at
  BEFORE UPDATE ON public.service_providers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_service_rules_updated_at ON public.service_availability_rules;
CREATE TRIGGER trg_service_rules_updated_at
  BEFORE UPDATE ON public.service_availability_rules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_service_bookings_updated_at ON public.service_bookings;
CREATE TRIGGER trg_service_bookings_updated_at
  BEFORE UPDATE ON public.service_bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_service_payouts_updated_at ON public.service_payouts;
CREATE TRIGGER trg_service_payouts_updated_at
  BEFORE UPDATE ON public.service_payouts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
