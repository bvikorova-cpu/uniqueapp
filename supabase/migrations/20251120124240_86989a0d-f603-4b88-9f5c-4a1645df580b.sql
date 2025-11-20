-- Add race statistics columns to horses table
ALTER TABLE horses 
ADD COLUMN IF NOT EXISTS race_wins INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_races INTEGER DEFAULT 0;

-- Create horse marketplace table
CREATE TABLE IF NOT EXISTS horse_market_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  horse_id UUID NOT NULL REFERENCES horses(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL,
  price_coins INTEGER NOT NULL CHECK (price_coins > 0),
  is_active BOOLEAN DEFAULT true,
  listed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  sold_at TIMESTAMP WITH TIME ZONE,
  buyer_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on horse_market_listings
ALTER TABLE horse_market_listings ENABLE ROW LEVEL SECURITY;

-- Policies for horse_market_listings
CREATE POLICY "Anyone can view active listings"
ON horse_market_listings FOR SELECT
USING (is_active = true);

CREATE POLICY "Users can create listings for their horses"
ON horse_market_listings FOR INSERT
WITH CHECK (
  auth.uid() = seller_id AND
  EXISTS (
    SELECT 1 FROM horses 
    WHERE horses.id = horse_market_listings.horse_id 
    AND horses.user_id = auth.uid()
  )
);

CREATE POLICY "Sellers can update their listings"
ON horse_market_listings FOR UPDATE
USING (auth.uid() = seller_id);

-- Function to handle horse purchase from marketplace
CREATE OR REPLACE FUNCTION purchase_horse_from_market(
  listing_id UUID,
  buyer_id UUID
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_listing RECORD;
  v_buyer_coins INTEGER;
BEGIN
  -- Get listing details
  SELECT * INTO v_listing
  FROM horse_market_listings
  WHERE id = listing_id AND is_active = true
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Listing not found or no longer active';
  END IF;

  -- Check if buyer has enough coins
  SELECT coins INTO v_buyer_coins
  FROM horse_currency
  WHERE user_id = buyer_id;

  IF v_buyer_coins < v_listing.price_coins THEN
    RAISE EXCEPTION 'Insufficient coins';
  END IF;

  -- Deduct coins from buyer
  UPDATE horse_currency
  SET coins = coins - v_listing.price_coins,
      updated_at = now()
  WHERE user_id = buyer_id;

  -- Add coins to seller
  UPDATE horse_currency
  SET coins = coins + v_listing.price_coins,
      updated_at = now()
  WHERE user_id = v_listing.seller_id;

  -- Transfer horse ownership
  UPDATE horses
  SET user_id = buyer_id,
      updated_at = now()
  WHERE id = v_listing.horse_id;

  -- Mark listing as sold
  UPDATE horse_market_listings
  SET is_active = false,
      sold_at = now(),
      buyer_id = buyer_id
  WHERE id = listing_id;
END;
$$;