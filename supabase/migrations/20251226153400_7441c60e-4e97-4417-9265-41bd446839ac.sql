-- Create auction escrow table for holding payments
CREATE TABLE public.auction_escrow (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  auction_id UUID NOT NULL REFERENCES public.auction_items(id) ON DELETE CASCADE,
  winner_id UUID NOT NULL,
  seller_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  commission_amount NUMERIC NOT NULL DEFAULT 0,
  seller_payout NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'held' CHECK (status IN ('held', 'released', 'refunded', 'disputed')),
  auto_release_at TIMESTAMP WITH TIME ZONE NOT NULL,
  held_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  released_at TIMESTAMP WITH TIME ZONE,
  refunded_at TIMESTAMP WITH TIME ZONE,
  stripe_payment_intent_id TEXT,
  stripe_transfer_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add escrow_status to auction_items
ALTER TABLE public.auction_items 
ADD COLUMN IF NOT EXISTS escrow_status TEXT DEFAULT 'none',
ADD COLUMN IF NOT EXISTS stripe_session_id TEXT,
ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS shipped_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP WITH TIME ZONE;

-- Enable RLS
ALTER TABLE public.auction_escrow ENABLE ROW LEVEL SECURITY;

-- Policies for auction_escrow
CREATE POLICY "Users can view their own escrow records"
ON public.auction_escrow
FOR SELECT
USING (auth.uid() = winner_id OR auth.uid() = seller_id);

-- Index for faster lookups
CREATE INDEX idx_auction_escrow_auction_id ON public.auction_escrow(auction_id);
CREATE INDEX idx_auction_escrow_status ON public.auction_escrow(status);