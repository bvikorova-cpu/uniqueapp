-- Create bazaar_transactions table for tracking purchases
CREATE TABLE IF NOT EXISTS bazaar_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES bazaar_items(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL,
  seller_id UUID NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  commission_amount DECIMAL(10, 2) NOT NULL,
  commission_rate DECIMAL(5, 2) NOT NULL,
  seller_payout DECIMAL(10, 2) NOT NULL,
  stripe_payment_intent_id TEXT,
  stripe_session_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_bazaar_transactions_buyer ON bazaar_transactions(buyer_id);
CREATE INDEX IF NOT EXISTS idx_bazaar_transactions_seller ON bazaar_transactions(seller_id);
CREATE INDEX IF NOT EXISTS idx_bazaar_transactions_item ON bazaar_transactions(item_id);
CREATE INDEX IF NOT EXISTS idx_bazaar_transactions_status ON bazaar_transactions(status);

-- Enable RLS
ALTER TABLE bazaar_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own transactions as buyer"
  ON bazaar_transactions FOR SELECT
  USING (auth.uid() = buyer_id);

CREATE POLICY "Users can view their own transactions as seller"
  ON bazaar_transactions FOR SELECT
  USING (auth.uid() = seller_id);

CREATE POLICY "System can insert transactions"
  ON bazaar_transactions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update transaction status"
  ON bazaar_transactions FOR UPDATE
  USING (true);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_bazaar_transactions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER bazaar_transactions_updated_at
  BEFORE UPDATE ON bazaar_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_bazaar_transactions_updated_at();

-- Add sold status to bazaar_items if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'bazaar_item_status'
  ) THEN
    -- If the type doesn't exist, we need to check the constraint instead
    ALTER TABLE bazaar_items DROP CONSTRAINT IF EXISTS bazaar_items_status_check;
  END IF;
END $$;

-- Add is_sold column if it doesn't exist
ALTER TABLE bazaar_items 
  ADD COLUMN IF NOT EXISTS is_sold BOOLEAN NOT NULL DEFAULT false;

-- Create index for sold items
CREATE INDEX IF NOT EXISTS idx_bazaar_items_is_sold ON bazaar_items(is_sold);