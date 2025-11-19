-- Create collectible_listings table for marketplace
CREATE TABLE IF NOT EXISTS public.collectible_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  user_collectible_id UUID NOT NULL,
  listing_type TEXT NOT NULL CHECK (listing_type IN ('sale', 'trade', 'both')),
  price_credits INTEGER,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.collectible_listings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view active listings"
ON public.collectible_listings
FOR SELECT
USING (is_active = true);

CREATE POLICY "Users can create their own listings"
ON public.collectible_listings
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own listings"
ON public.collectible_listings
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own listings"
ON public.collectible_listings
FOR DELETE
USING (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX idx_collectible_listings_user_id ON public.collectible_listings(user_id);
CREATE INDEX idx_collectible_listings_active ON public.collectible_listings(is_active);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_collectible_listings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_collectible_listings_updated_at
BEFORE UPDATE ON public.collectible_listings
FOR EACH ROW
EXECUTE FUNCTION update_collectible_listings_updated_at();