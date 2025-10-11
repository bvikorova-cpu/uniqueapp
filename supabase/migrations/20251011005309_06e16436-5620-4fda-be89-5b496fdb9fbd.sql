-- Extend transactions table for marketplace sales
ALTER TABLE public.transactions
ADD COLUMN IF NOT EXISTS item_type TEXT CHECK (item_type IN ('subscription', 'ai_credits', 'bazaar_sale', 'auction_sale', 'featured_listing')),
ADD COLUMN IF NOT EXISTS item_id UUID,
ADD COLUMN IF NOT EXISTS buyer_id UUID,
ADD COLUMN IF NOT EXISTS seller_id UUID,
ADD COLUMN IF NOT EXISTS commission_amount NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS seller_amount NUMERIC(10,2) DEFAULT 0;

-- Update existing subscription transactions to have correct item_type
UPDATE public.transactions 
SET item_type = 'subscription' 
WHERE item_type IS NULL;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Sellers can view their sales" ON public.transactions;
DROP POLICY IF EXISTS "Buyers can view their purchases" ON public.transactions;

-- Policy for sellers to view their sales
CREATE POLICY "Sellers can view their sales"
ON public.transactions
FOR SELECT
TO authenticated
USING (auth.uid() = seller_id);

-- Policy for buyers to view their purchases
CREATE POLICY "Buyers can view their purchases"
ON public.transactions
FOR SELECT
TO authenticated
USING (auth.uid() = buyer_id);