-- Wishlist for Premium Store items
CREATE TABLE IF NOT EXISTS public.premium_store_wishlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  item_type TEXT NOT NULL, -- 'feature' | 'badge' | 'theme' | 'avatar' | 'visibility' | 'bundle'
  item_id TEXT NOT NULL,
  item_name TEXT NOT NULL,
  item_icon TEXT,
  credit_cost INTEGER NOT NULL DEFAULT 0,
  level_required INTEGER NOT NULL DEFAULT 1,
  notify_on_unlock BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, item_type, item_id)
);

ALTER TABLE public.premium_store_wishlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "wishlist_select_own" ON public.premium_store_wishlist FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "wishlist_insert_own" ON public.premium_store_wishlist FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "wishlist_delete_own" ON public.premium_store_wishlist FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_wishlist_user ON public.premium_store_wishlist(user_id);

-- Aggregated purchase log for leaderboard (lightweight, public-readable for top spenders)
CREATE TABLE IF NOT EXISTS public.premium_store_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  item_type TEXT NOT NULL,
  item_id TEXT NOT NULL,
  item_name TEXT NOT NULL,
  credits_spent INTEGER NOT NULL DEFAULT 0,
  is_gift BOOLEAN NOT NULL DEFAULT false,
  recipient_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.premium_store_purchases ENABLE ROW LEVEL SECURITY;

-- Public can read aggregated leaderboard data (only counts/totals via view) but raw rows only own
CREATE POLICY "purchases_select_own" ON public.premium_store_purchases FOR SELECT USING (auth.uid() = user_id OR auth.uid() = recipient_id);
CREATE POLICY "purchases_insert_own" ON public.premium_store_purchases FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_purchases_user ON public.premium_store_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_created ON public.premium_store_purchases(created_at DESC);

-- Gift records (notify recipient)
CREATE TABLE IF NOT EXISTS public.premium_store_gifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL,
  recipient_id UUID NOT NULL,
  item_type TEXT NOT NULL,
  item_id TEXT NOT NULL,
  item_name TEXT NOT NULL,
  message TEXT,
  credits_spent INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending', -- pending | claimed
  claimed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.premium_store_gifts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "gifts_select_party" ON public.premium_store_gifts FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);
CREATE POLICY "gifts_insert_sender" ON public.premium_store_gifts FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "gifts_update_recipient" ON public.premium_store_gifts FOR UPDATE USING (auth.uid() = recipient_id);

CREATE INDEX IF NOT EXISTS idx_gifts_recipient ON public.premium_store_gifts(recipient_id);
CREATE INDEX IF NOT EXISTS idx_gifts_sender ON public.premium_store_gifts(sender_id);

-- Public leaderboard view: top spenders (last 30 days)
CREATE OR REPLACE VIEW public.premium_store_leaderboard AS
SELECT 
  user_id,
  COUNT(*)::int as items_purchased,
  SUM(credits_spent)::int as total_credits_spent
FROM public.premium_store_purchases
WHERE created_at > now() - interval '30 days'
  AND is_gift = false
GROUP BY user_id
ORDER BY total_credits_spent DESC
LIMIT 50;

GRANT SELECT ON public.premium_store_leaderboard TO authenticated, anon;