-- Create auction seller withdrawal requests table
CREATE TABLE IF NOT EXISTS public.auction_withdrawal_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT NOT NULL,
  payment_details JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'completed', 'rejected')),
  admin_notes TEXT,
  stripe_payout_id TEXT,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.auction_withdrawal_requests ENABLE ROW LEVEL SECURITY;

-- Sellers can view their own requests
CREATE POLICY "Sellers can view their own withdrawal requests"
  ON public.auction_withdrawal_requests
  FOR SELECT
  USING (auth.uid() = seller_id);

-- Sellers can create their own requests
CREATE POLICY "Sellers can create withdrawal requests"
  ON public.auction_withdrawal_requests
  FOR INSERT
  WITH CHECK (auth.uid() = seller_id);

-- Admins can view all requests
CREATE POLICY "Admins can view all withdrawal requests"
  ON public.auction_withdrawal_requests
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update requests
CREATE POLICY "Admins can update withdrawal requests"
  ON public.auction_withdrawal_requests
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_auction_withdrawal_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_auction_withdrawal_requests_updated_at
  BEFORE UPDATE ON public.auction_withdrawal_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_auction_withdrawal_updated_at();

-- Create index for faster queries
CREATE INDEX idx_auction_withdrawal_seller ON public.auction_withdrawal_requests(seller_id);
CREATE INDEX idx_auction_withdrawal_status ON public.auction_withdrawal_requests(status);