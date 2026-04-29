ALTER TABLE public.coloring_credits 
  ADD COLUMN IF NOT EXISTS total_credits_purchased INTEGER NOT NULL DEFAULT 0;

-- Backfill existing rows: assume what they have now equals what they bought
UPDATE public.coloring_credits 
  SET total_credits_purchased = credits_remaining 
  WHERE total_credits_purchased = 0 AND credits_remaining > 0;