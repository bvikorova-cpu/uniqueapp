
ALTER TABLE public.medical_campaigns
  ADD COLUMN IF NOT EXISTS treatment_total_cost numeric,
  ADD COLUMN IF NOT EXISTS insurance_coverage numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS hospital_iban text,
  ADD COLUMN IF NOT EXISTS hospital_stripe_account text,
  ADD COLUMN IF NOT EXISTS direct_to_hospital boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS refund_guarantee boolean DEFAULT true;

COMMENT ON COLUMN public.medical_campaigns.treatment_total_cost IS 'Total cost of treatment in EUR';
COMMENT ON COLUMN public.medical_campaigns.insurance_coverage IS 'Amount covered by insurance in EUR';
COMMENT ON COLUMN public.medical_campaigns.hospital_iban IS 'Hospital IBAN for direct transparency';
COMMENT ON COLUMN public.medical_campaigns.hospital_stripe_account IS 'Stripe Connect account ID for direct payout';
COMMENT ON COLUMN public.medical_campaigns.direct_to_hospital IS 'When true, payouts are sent directly to hospital, not patient';
COMMENT ON COLUMN public.medical_campaigns.refund_guarantee IS 'When true, donors are guaranteed refund in fraud case';
