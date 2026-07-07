
ALTER TABLE public.healthcare_profiles
  ADD COLUMN IF NOT EXISTS verification_status text NOT NULL DEFAULT 'unverified'
    CHECK (verification_status IN ('unverified','pending','approved','rejected')),
  ADD COLUMN IF NOT EXISTS license_number text,
  ADD COLUMN IF NOT EXISTS license_country text,
  ADD COLUMN IF NOT EXISTS license_document_url text,
  ADD COLUMN IF NOT EXISTS license_submitted_at timestamptz,
  ADD COLUMN IF NOT EXISTS verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS verified_by uuid,
  ADD COLUMN IF NOT EXISTS rejection_reason text;

CREATE INDEX IF NOT EXISTS healthcare_profiles_verification_status_idx
  ON public.healthcare_profiles(verification_status);

CREATE OR REPLACE FUNCTION public.healthcare_gate_accepting_bookings()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  charges_ok boolean;
  payouts_ok boolean;
BEGIN
  IF NEW.is_accepting_bookings IS TRUE THEN
    IF NEW.verification_status <> 'approved' THEN
      RAISE EXCEPTION 'Doctor must be verified before accepting bookings';
    END IF;

    SELECT COALESCE(stripe_connect_charges_enabled, false),
           COALESCE(stripe_connect_payouts_enabled, false)
      INTO charges_ok, payouts_ok
    FROM public.profiles
    WHERE id = NEW.user_id;

    IF NOT charges_ok OR NOT payouts_ok THEN
      RAISE EXCEPTION 'Stripe Connect onboarding must be completed before accepting bookings';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS healthcare_gate_accepting_bookings_trg ON public.healthcare_profiles;
CREATE TRIGGER healthcare_gate_accepting_bookings_trg
  BEFORE INSERT OR UPDATE OF is_accepting_bookings, verification_status
  ON public.healthcare_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.healthcare_gate_accepting_bookings();

DROP POLICY IF EXISTS "Admins can read all healthcare profiles" ON public.healthcare_profiles;
CREATE POLICY "Admins can read all healthcare profiles"
  ON public.healthcare_profiles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update healthcare verification" ON public.healthcare_profiles;
CREATE POLICY "Admins can update healthcare verification"
  ON public.healthcare_profiles FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
