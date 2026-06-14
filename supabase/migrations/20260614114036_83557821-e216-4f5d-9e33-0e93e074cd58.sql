CREATE INDEX IF NOT EXISTS idx_auction_items_active_ends ON public.auction_items (is_active, ends_at DESC);
CREATE INDEX IF NOT EXISTS idx_auction_items_user_id ON public.auction_items (user_id);
CREATE INDEX IF NOT EXISTS idx_auction_items_winner_id ON public.auction_items (winner_id);
CREATE INDEX IF NOT EXISTS idx_auction_items_category ON public.auction_items (category);
CREATE INDEX IF NOT EXISTS idx_auction_bids_auction_id_created ON public.auction_bids (auction_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_auction_bids_user_id ON public.auction_bids (user_id);

INSERT INTO public.platform_commission_settings (service_type, commission_rate, is_active, description)
VALUES
  ('auction', 10, true, 'Online auctions — 10% on winning bid / buyout, auto-split via Stripe Connect'),
  ('property', 5, true, 'Property marketplace — 5% on successful sale'),
  ('crystal', 15, true, 'Crystal marketplace — 15% commission'),
  ('collectible', 15, true, 'Collectibles marketplace — 15% commission'),
  ('coupon', 10, true, 'Coupon marketplace — 10% commission'),
  ('home_decor', 15, true, 'Home decor marketplace — 15% commission'),
  ('antique', 10, true, 'Antique marketplace — 10% commission'),
  ('phobia', 0, true, 'Phobia trading — fixed price, no commission split')
ON CONFLICT (service_type) DO NOTHING;