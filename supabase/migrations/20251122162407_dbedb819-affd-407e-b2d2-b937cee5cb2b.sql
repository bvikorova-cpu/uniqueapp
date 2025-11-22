-- Create referral withdrawal requests table
CREATE TABLE public.referral_withdrawal_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount numeric(10, 2) NOT NULL CHECK (amount > 0),
  payment_method text NOT NULL,
  payment_details jsonb NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'completed', 'rejected')),
  requested_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz,
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.referral_withdrawal_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users (referrers can view their own requests)
CREATE POLICY "Users can view their own withdrawal requests"
  ON public.referral_withdrawal_requests
  FOR SELECT
  USING (auth.uid() = referrer_id);

-- RLS Policies for users (referrers can create requests)
CREATE POLICY "Users can create withdrawal requests"
  ON public.referral_withdrawal_requests
  FOR INSERT
  WITH CHECK (auth.uid() = referrer_id);

-- RLS Policies for admins (admins can view all)
CREATE POLICY "Admins can view all withdrawal requests"
  ON public.referral_withdrawal_requests
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for admins (admins can update)
CREATE POLICY "Admins can update withdrawal requests"
  ON public.referral_withdrawal_requests
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index for faster lookups
CREATE INDEX idx_referral_withdrawal_requests_referrer 
  ON public.referral_withdrawal_requests(referrer_id);

CREATE INDEX idx_referral_withdrawal_requests_status 
  ON public.referral_withdrawal_requests(status);

-- Trigger for updated_at
CREATE TRIGGER update_referral_withdrawal_requests_updated_at
  BEFORE UPDATE ON public.referral_withdrawal_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();