
CREATE TYPE public.medical_record_type AS ENUM ('diagnosis','allergy','medication','attachment');
CREATE TYPE public.insurance_claim_status AS ENUM ('pending','approved','rejected','paid');

CREATE OR REPLACE FUNCTION public.tg_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

-- 1. video_call_sessions
CREATE TABLE public.video_call_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL REFERENCES public.healthcare_appointments(id) ON DELETE CASCADE,
  room_id TEXT NOT NULL UNIQUE,
  ice_config JSONB,
  doctor_joined_at TIMESTAMPTZ,
  patient_joined_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  duration_sec INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.video_call_sessions TO authenticated;
GRANT ALL ON public.video_call_sessions TO service_role;
ALTER TABLE public.video_call_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Parties can read their session" ON public.video_call_sessions
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.healthcare_appointments a
      WHERE a.id = appointment_id AND (a.patient_id = auth.uid() OR a.provider_id = auth.uid()))
  );
CREATE POLICY "Parties can insert their session" ON public.video_call_sessions
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.healthcare_appointments a
      WHERE a.id = appointment_id AND (a.patient_id = auth.uid() OR a.provider_id = auth.uid()))
  );
CREATE POLICY "Parties can update their session" ON public.video_call_sessions
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.healthcare_appointments a
      WHERE a.id = appointment_id AND (a.patient_id = auth.uid() OR a.provider_id = auth.uid()))
  );
CREATE TRIGGER trg_vcs_updated BEFORE UPDATE ON public.video_call_sessions
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- 2. prescriptions
CREATE TABLE public.prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL REFERENCES public.healthcare_appointments(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL,
  patient_id UUID NOT NULL,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  medications JSONB NOT NULL,
  dosage_instructions TEXT,
  pdf_url TEXT,
  qr_token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(18),'hex'),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '90 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX prescriptions_patient_idx ON public.prescriptions(patient_id);
CREATE INDEX prescriptions_doctor_idx ON public.prescriptions(doctor_id);
GRANT SELECT, INSERT, UPDATE ON public.prescriptions TO authenticated;
GRANT ALL ON public.prescriptions TO service_role;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Patient reads own rx" ON public.prescriptions
  FOR SELECT TO authenticated USING (patient_id = auth.uid() OR doctor_id = auth.uid());
CREATE POLICY "Doctor creates rx" ON public.prescriptions
  FOR INSERT TO authenticated WITH CHECK (doctor_id = auth.uid());
CREATE POLICY "Doctor updates own rx" ON public.prescriptions
  FOR UPDATE TO authenticated USING (doctor_id = auth.uid());
CREATE TRIGGER trg_rx_updated BEFORE UPDATE ON public.prescriptions
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- 3. medical_records
CREATE TABLE public.medical_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL,
  record_type public.medical_record_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  data JSONB,
  file_url TEXT,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX medical_records_patient_idx ON public.medical_records(patient_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.medical_records TO authenticated;
GRANT ALL ON public.medical_records TO service_role;
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Patient owns records" ON public.medical_records
  FOR ALL TO authenticated USING (patient_id = auth.uid()) WITH CHECK (patient_id = auth.uid());
CREATE TRIGGER trg_mr_updated BEFORE UPDATE ON public.medical_records
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- 4. medical_record_access_grants
CREATE TABLE public.medical_record_access_grants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL,
  doctor_id UUID NOT NULL,
  appointment_id UUID NOT NULL REFERENCES public.healthcare_appointments(id) ON DELETE CASCADE,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (appointment_id, doctor_id)
);
CREATE INDEX mrag_doctor_idx ON public.medical_record_access_grants(doctor_id, patient_id);
GRANT SELECT ON public.medical_record_access_grants TO authenticated;
GRANT ALL ON public.medical_record_access_grants TO service_role;
ALTER TABLE public.medical_record_access_grants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Parties read grants" ON public.medical_record_access_grants
  FOR SELECT TO authenticated USING (patient_id = auth.uid() OR doctor_id = auth.uid());

CREATE POLICY "Doctor reads records with active grant" ON public.medical_records
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.medical_record_access_grants g
      WHERE g.patient_id = medical_records.patient_id
        AND g.doctor_id = auth.uid()
        AND g.revoked_at IS NULL
        AND g.expires_at > now()
    )
  );

CREATE OR REPLACE FUNCTION public.tg_auto_grant_record_access()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status = 'confirmed' AND (OLD.status IS DISTINCT FROM 'confirmed') THEN
    INSERT INTO public.medical_record_access_grants (patient_id, doctor_id, appointment_id, expires_at)
    VALUES (NEW.patient_id, NEW.provider_id, NEW.id,
            COALESCE(NEW.scheduled_at, now()) + interval '48 hours')
    ON CONFLICT (appointment_id, doctor_id) DO NOTHING;
  ELSIF NEW.status IN ('cancelled_by_patient','cancelled_by_doctor') THEN
    UPDATE public.medical_record_access_grants
      SET revoked_at = now()
      WHERE appointment_id = NEW.id AND revoked_at IS NULL;
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_auto_grant_access ON public.healthcare_appointments;
CREATE TRIGGER trg_auto_grant_access
  AFTER UPDATE OF status ON public.healthcare_appointments
  FOR EACH ROW EXECUTE FUNCTION public.tg_auto_grant_record_access();

-- 5. insurance_cards
CREATE TABLE public.insurance_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL,
  provider_name TEXT NOT NULL,
  policy_number_encrypted TEXT NOT NULL,
  card_front_url TEXT,
  card_back_url TEXT,
  valid_until DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.insurance_cards TO authenticated;
GRANT ALL ON public.insurance_cards TO service_role;
ALTER TABLE public.insurance_cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Patient owns cards" ON public.insurance_cards
  FOR ALL TO authenticated USING (patient_id = auth.uid()) WITH CHECK (patient_id = auth.uid());
CREATE TRIGGER trg_ic_updated BEFORE UPDATE ON public.insurance_cards
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- 6. insurance_claims
CREATE TABLE public.insurance_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL,
  appointment_id UUID REFERENCES public.healthcare_appointments(id) ON DELETE SET NULL,
  insurance_card_id UUID REFERENCES public.insurance_cards(id) ON DELETE SET NULL,
  amount_cents INTEGER NOT NULL CHECK (amount_cents >= 0),
  currency TEXT NOT NULL DEFAULT 'EUR',
  status public.insurance_claim_status NOT NULL DEFAULT 'pending',
  admin_note TEXT,
  decided_by UUID,
  decided_at TIMESTAMPTZ,
  receipt_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ic_patient_idx ON public.insurance_claims(patient_id);
CREATE INDEX ic_status_idx ON public.insurance_claims(status);
GRANT SELECT, INSERT, UPDATE ON public.insurance_claims TO authenticated;
GRANT ALL ON public.insurance_claims TO service_role;
ALTER TABLE public.insurance_claims ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Patient reads own claims" ON public.insurance_claims
  FOR SELECT TO authenticated USING (
    patient_id = auth.uid() OR public.has_role(auth.uid(), 'admin')
  );
CREATE POLICY "Patient creates own claims" ON public.insurance_claims
  FOR INSERT TO authenticated WITH CHECK (patient_id = auth.uid());
CREATE POLICY "Admin updates claims" ON public.insurance_claims
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_claim_updated BEFORE UPDATE ON public.insurance_claims
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
