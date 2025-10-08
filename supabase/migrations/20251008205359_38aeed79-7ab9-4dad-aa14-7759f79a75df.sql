-- Create auction photos table
CREATE TABLE public.auction_photos (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  auction_id uuid NOT NULL REFERENCES public.auction_items(id) ON DELETE CASCADE,
  photo_url text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.auction_photos ENABLE ROW LEVEL SECURITY;

-- Anyone can view auction photos
CREATE POLICY "Anyone can view auction photos"
ON public.auction_photos
FOR SELECT
USING (true);

-- Users can create photos for their auctions
CREATE POLICY "Users can create photos for their auctions"
ON public.auction_photos
FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.auction_items
  WHERE auction_items.id = auction_photos.auction_id
  AND auction_items.user_id = auth.uid()
));

-- Users can delete photos from their auctions
CREATE POLICY "Users can delete photos from their auctions"
ON public.auction_photos
FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.auction_items
  WHERE auction_items.id = auction_photos.auction_id
  AND auction_items.user_id = auth.uid()
));