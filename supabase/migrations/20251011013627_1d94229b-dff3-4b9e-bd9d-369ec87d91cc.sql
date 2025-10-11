-- Add IBAN field to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS iban TEXT;

-- Add comment
COMMENT ON COLUMN public.profiles.iban IS 'Bank account IBAN for payouts';

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_transactions_seller_status 
ON public.transactions(seller_id, status);

CREATE INDEX IF NOT EXISTS idx_transactions_created_at 
ON public.transactions(created_at DESC);