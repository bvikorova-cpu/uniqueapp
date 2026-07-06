
-- ============ healthcare_profiles: rozšírenie ============
ALTER TABLE public.healthcare_profiles
  ADD COLUMN IF NOT EXISTS specialty text,
  ADD COLUMN IF NOT EXISTS bio text,
  ADD COLUMN IF NOT EXISTS languages text[] DEFAULT ARRAY['en']::text[],
  ADD COLUMN IF NOT EXISTS consultation_price_cents integer,
  ADD COLUMN IF NOT EXISTS consultation_duration_min integer NOT NULL DEFAULT 30,
  ADD COLUMN IF NOT EXISTS is_accepting_bookings boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS stripe_account_id text,
  ADD COLUMN IF NOT EXISTS timezone text NOT NULL DEFAULT 'UTC';

-- Grant public read only for doctors accepting bookings
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='healthcare_profiles' AND policyname='Public can view accepting doctors') THEN
    CREATE POLICY "Public can view accepting doctors"
      ON public.healthcare_profiles FOR SELECT
      USING (is_accepting_bookings = true);
  END IF;
END $$;

GRANT SELECT ON public.healthcare_profiles TO anon;

-- ============ healthcare_appointments: rozšírenie ============
ALTER TABLE public.healthcare_appointments
  ADD COLUMN IF NOT EXISTS price_cents integer,
  ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'EUR',
  ADD COLUMN IF NOT EXISTS stripe_payment_intent_id text,
  ADD COLUMN IF NOT EXISTS stripe_charge_id text,
  ADD COLUMN IF NOT EXISTS stripe_checkout_session_id text,
  ADD COLUMN IF NOT EXISTS patient_notes text,
  ADD COLUMN IF NOT EXISTS doctor_notes text,
  ADD COLUMN IF NOT EXISTS cancellation_reason text,
  ADD COLUMN IF NOT EXISTS cancelled_by text,
  ADD COLUMN IF NOT EXISTS confirmed_at timestamptz,
  ADD COLUMN IF NOT EXISTS cancelled_at timestamptz,
  ADD COLUMN IF NOT EXISTS completed_at timestamptz,
  ADD COLUMN IF NOT EXISTS refunded_at timestamptz,
  ADD COLUMN IF NOT EXISTS refund_amount_cents integer;

-- Status validation trigger (extended values)
CREATE OR REPLACE FUNCTION public.validate_appointment_status()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.status NOT IN (
    'pending','pending_payment','confirmed',
    'cancelled_by_patient','cancelled_by_doctor',
    'completed','no_show','refunded'
  ) THEN
    RAISE EXCEPTION 'Invalid appointment status: %', NEW.status;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_appointment_status ON public.healthcare_appointments;
CREATE TRIGGER trg_validate_appointment_status
  BEFORE INSERT OR UPDATE ON public.healthcare_appointments
  FOR EACH ROW EXECUTE FUNCTION public.validate_appointment_status();

-- Add patient self-service policies (existing policies allow provider access)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='healthcare_appointments' AND policyname='Patients can view their appointments') THEN
    CREATE POLICY "Patients can view their appointments"
      ON public.healthcare_appointments FOR SELECT
      USING (auth.uid() = patient_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='healthcare_appointments' AND policyname='Patients can create their appointments') THEN
    CREATE POLICY "Patients can create their appointments"
      ON public.healthcare_appointments FOR INSERT
      WITH CHECK (auth.uid() = patient_id AND status = 'pending_payment');
  END IF;
END $$;

GRANT ALL ON public.healthcare_appointments TO service_role;

-- ============ doctor_availability_rules ============
CREATE TABLE IF NOT EXISTS public.doctor_availability_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id uuid NOT NULL,
  weekday smallint NOT NULL CHECK (weekday BETWEEN 0 AND 6),
  start_time time NOT NULL,
  end_time time NOT NULL,
  timezone text NOT NULL DEFAULT 'UTC',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (end_time > start_time)
);

GRANT SELECT ON public.doctor_availability_rules TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.doctor_availability_rules TO authenticated;
GRANT ALL ON public.doctor_availability_rules TO service_role;

ALTER TABLE public.doctor_availability_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view availability rules"
  ON public.doctor_availability_rules FOR SELECT USING (true);

CREATE POLICY "Doctors manage their own rules"
  ON public.doctor_availability_rules FOR ALL
  USING (auth.uid() = doctor_id)
  WITH CHECK (auth.uid() = doctor_id);

CREATE INDEX IF NOT EXISTS idx_availability_rules_doctor ON public.doctor_availability_rules(doctor_id);

-- ============ doctor_availability_blocks ============
CREATE TABLE IF NOT EXISTS public.doctor_availability_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id uuid NOT NULL,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (ends_at > starts_at)
);

GRANT SELECT ON public.doctor_availability_blocks TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.doctor_availability_blocks TO authenticated;
GRANT ALL ON public.doctor_availability_blocks TO service_role;

ALTER TABLE public.doctor_availability_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view availability blocks"
  ON public.doctor_availability_blocks FOR SELECT USING (true);

CREATE POLICY "Doctors manage their own blocks"
  ON public.doctor_availability_blocks FOR ALL
  USING (auth.uid() = doctor_id)
  WITH CHECK (auth.uid() = doctor_id);

CREATE INDEX IF NOT EXISTS idx_availability_blocks_doctor ON public.doctor_availability_blocks(doctor_id, starts_at);

-- ============ doctor_payouts ============
CREATE TABLE IF NOT EXISTS public.doctor_payouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id uuid NOT NULL,
  appointment_id uuid NOT NULL REFERENCES public.healthcare_appointments(id) ON DELETE CASCADE,
  amount_cents integer NOT NULL,
  platform_fee_cents integer NOT NULL,
  currency text NOT NULL DEFAULT 'EUR',
  stripe_transfer_id text,
  status text NOT NULL DEFAULT 'pending',
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (appointment_id)
);

GRANT SELECT ON public.doctor_payouts TO authenticated;
GRANT ALL ON public.doctor_payouts TO service_role;

ALTER TABLE public.doctor_payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctors view their payouts"
  ON public.doctor_payouts FOR SELECT
  USING (auth.uid() = doctor_id);

CREATE INDEX IF NOT EXISTS idx_doctor_payouts_doctor ON public.doctor_payouts(doctor_id, created_at DESC);

-- ============ updated_at triggers ============
DROP TRIGGER IF EXISTS trg_avail_rules_updated_at ON public.doctor_availability_rules;
CREATE TRIGGER trg_avail_rules_updated_at
  BEFORE UPDATE ON public.doctor_availability_rules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_doctor_payouts_updated_at ON public.doctor_payouts;
CREATE TRIGGER trg_doctor_payouts_updated_at
  BEFORE UPDATE ON public.doctor_payouts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Index for scheduling queries
CREATE INDEX IF NOT EXISTS idx_healthcare_appts_provider_time ON public.healthcare_appointments(provider_id, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_healthcare_appts_patient ON public.healthcare_appointments(patient_id, scheduled_at DESC);
