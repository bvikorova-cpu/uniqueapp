
-- Healthcare appointments
CREATE TABLE public.healthcare_appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID NOT NULL,
  patient_id UUID NOT NULL,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  status TEXT NOT NULL DEFAULT 'pending',
  reason TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.healthcare_appointments TO authenticated;
GRANT ALL ON public.healthcare_appointments TO service_role;
ALTER TABLE public.healthcare_appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Provider or patient can view own appointments"
  ON public.healthcare_appointments FOR SELECT TO authenticated
  USING (auth.uid() = provider_id OR auth.uid() = patient_id);
CREATE POLICY "Patient can book appointment"
  ON public.healthcare_appointments FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = patient_id);
CREATE POLICY "Provider or patient can update own appointment"
  ON public.healthcare_appointments FOR UPDATE TO authenticated
  USING (auth.uid() = provider_id OR auth.uid() = patient_id)
  WITH CHECK (auth.uid() = provider_id OR auth.uid() = patient_id);
CREATE INDEX idx_hc_appts_provider ON public.healthcare_appointments(provider_id, scheduled_at);
CREATE INDEX idx_hc_appts_patient ON public.healthcare_appointments(patient_id, scheduled_at);

-- Healthcare referrals
CREATE TABLE public.healthcare_referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  from_provider_id UUID NOT NULL,
  to_provider_id UUID NOT NULL,
  patient_id UUID NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.healthcare_referrals TO authenticated;
GRANT ALL ON public.healthcare_referrals TO service_role;
ALTER TABLE public.healthcare_referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Involved providers can view referrals"
  ON public.healthcare_referrals FOR SELECT TO authenticated
  USING (auth.uid() IN (from_provider_id, to_provider_id));
CREATE POLICY "Referring provider can create referral"
  ON public.healthcare_referrals FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = from_provider_id);
CREATE POLICY "Receiving provider can update status"
  ON public.healthcare_referrals FOR UPDATE TO authenticated
  USING (auth.uid() = to_provider_id)
  WITH CHECK (auth.uid() = to_provider_id);
CREATE INDEX idx_hc_ref_from ON public.healthcare_referrals(from_provider_id, created_at DESC);
CREATE INDEX idx_hc_ref_to ON public.healthcare_referrals(to_provider_id, created_at DESC);

-- updated_at triggers (reuse existing function if present)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trg_hc_appts_updated BEFORE UPDATE ON public.healthcare_appointments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_hc_ref_updated BEFORE UPDATE ON public.healthcare_referrals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
