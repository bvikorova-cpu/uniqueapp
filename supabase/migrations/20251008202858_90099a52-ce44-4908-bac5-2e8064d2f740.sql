-- Add listing_type column to bazaar_items
ALTER TABLE public.bazaar_items
ADD COLUMN listing_type TEXT NOT NULL DEFAULT 'sell' CHECK (listing_type IN ('sell', 'buy'));