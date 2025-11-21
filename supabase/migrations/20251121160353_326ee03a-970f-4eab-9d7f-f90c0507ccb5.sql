-- Create influencer_withdrawal_requests table (separate from brand campaign withdrawals)
CREATE TABLE IF NOT EXISTS public.influencer_withdrawal_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  influencer_id UUID NOT NULL REFERENCES public.virtual_influencers(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  payment_method TEXT NOT NULL DEFAULT 'stripe' CHECK (payment_method IN ('stripe', 'paypal', 'bank_transfer')),
  payment_details JSONB,
  admin_notes TEXT,
  stripe_payout_id TEXT,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.influencer_withdrawal_requests ENABLE ROW LEVEL SECURITY;

-- Users can view withdrawal requests for their own influencers
CREATE POLICY "Users can view own influencer withdrawal requests"
  ON public.influencer_withdrawal_requests
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.virtual_influencers 
      WHERE virtual_influencers.id = influencer_withdrawal_requests.influencer_id 
      AND virtual_influencers.user_id = auth.uid()
    )
  );

-- Users can create withdrawal requests for their own influencers
CREATE POLICY "Users can create own influencer withdrawal requests"
  ON public.influencer_withdrawal_requests
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.virtual_influencers 
      WHERE virtual_influencers.id = influencer_id 
      AND virtual_influencers.user_id = auth.uid()
    )
  );

-- Create influencer_balances table to track available balance per influencer
CREATE TABLE IF NOT EXISTS public.influencer_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  influencer_id UUID NOT NULL REFERENCES public.virtual_influencers(id) ON DELETE CASCADE,
  total_earned DECIMAL(10,2) NOT NULL DEFAULT 0,
  withdrawn DECIMAL(10,2) NOT NULL DEFAULT 0,
  pending_withdrawal DECIMAL(10,2) NOT NULL DEFAULT 0,
  available_balance DECIMAL(10,2) GENERATED ALWAYS AS (total_earned - withdrawn - pending_withdrawal) STORED,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(influencer_id)
);

-- Enable RLS
ALTER TABLE public.influencer_balances ENABLE ROW LEVEL SECURITY;

-- Users can view balances for their own influencers
CREATE POLICY "Users can view own influencer balances"
  ON public.influencer_balances
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.virtual_influencers 
      WHERE virtual_influencers.id = influencer_balances.influencer_id 
      AND virtual_influencers.user_id = auth.uid()
    )
  );

-- Create trigger to update updated_at for influencer tables
CREATE TRIGGER update_influencer_withdrawal_requests_updated_at
  BEFORE UPDATE ON public.influencer_withdrawal_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_influencer_balances_updated_at
  BEFORE UPDATE ON public.influencer_balances
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_influencer_withdrawal_requests_influencer_id ON public.influencer_withdrawal_requests(influencer_id);
CREATE INDEX IF NOT EXISTS idx_influencer_withdrawal_requests_status ON public.influencer_withdrawal_requests(status);
CREATE INDEX IF NOT EXISTS idx_influencer_balances_influencer_id ON public.influencer_balances(influencer_id);