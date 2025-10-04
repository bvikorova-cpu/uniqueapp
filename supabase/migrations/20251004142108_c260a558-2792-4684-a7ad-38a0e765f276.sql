-- Create auction_items table
CREATE TABLE public.auction_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  starting_price NUMERIC NOT NULL,
  current_price NUMERIC NOT NULL,
  buyout_price NUMERIC,
  image_url TEXT,
  category TEXT NOT NULL,
  condition TEXT NOT NULL,
  ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  winner_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.auction_items ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view active auctions"
ON public.auction_items
FOR SELECT
USING (is_active = true);

CREATE POLICY "Authenticated users can create auctions"
ON public.auction_items
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own auctions"
ON public.auction_items
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own auctions"
ON public.auction_items
FOR DELETE
USING (auth.uid() = user_id);

-- Create auction_bids table
CREATE TABLE public.auction_bids (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  auction_id UUID NOT NULL REFERENCES public.auction_items(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  bid_amount NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.auction_bids ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view bids"
ON public.auction_bids
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create bids"
ON public.auction_bids
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create function to update current price on new bid
CREATE OR REPLACE FUNCTION public.update_auction_price()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.auction_items
  SET current_price = NEW.bid_amount,
      updated_at = now()
  WHERE id = NEW.auction_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger
CREATE TRIGGER update_auction_price_trigger
AFTER INSERT ON public.auction_bids
FOR EACH ROW
EXECUTE FUNCTION public.update_auction_price();

-- Create trigger for updated_at
CREATE TRIGGER update_auction_items_updated_at
BEFORE UPDATE ON public.auction_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();