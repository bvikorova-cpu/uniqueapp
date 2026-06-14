
CREATE INDEX IF NOT EXISTS idx_auction_items_created_at ON public.auction_items (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bazaar_items_created_at ON public.bazaar_items (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_coupon_listings_created_at ON public.coupon_listings (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_coupon_orders_created_status ON public.coupon_orders (created_at DESC, status);
CREATE INDEX IF NOT EXISTS idx_dating_messages_created_at ON public.dating_messages (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_job_applications_created_status ON public.job_applications (created_at DESC, status);
CREATE INDEX IF NOT EXISTS idx_job_listings_created_at ON public.job_listings (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payment_records_created_at ON public.payment_records (created_at DESC);
