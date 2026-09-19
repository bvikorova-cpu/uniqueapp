-- ===== 1) PPV media in DM =====
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS ppv_price_cents INTEGER;

CREATE TABLE IF NOT EXISTS public.message_ppv_unlocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL,
  seller_id UUID NOT NULL,
  amount_cents BIGINT NOT NULL CHECK (amount_cents >= 0),
  creator_payout_cents BIGINT NOT NULL CHECK (creator_payout_cents >= 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','failed','refunded')),
  stripe_session_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (message_id, buyer_id)
);
GRANT SELECT, INSERT, UPDATE ON public.message_ppv_unlocks TO authenticated;
GRANT ALL ON public.message_ppv_unlocks TO service_role;
ALTER TABLE public.message_ppv_unlocks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ppv unlock parties read" ON public.message_ppv_unlocks;
CREATE POLICY "ppv unlock parties read" ON public.message_ppv_unlocks FOR SELECT TO authenticated
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);
DROP POLICY IF EXISTS "ppv unlock buyer insert" ON public.message_ppv_unlocks;
CREATE POLICY "ppv unlock buyer insert" ON public.message_ppv_unlocks FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = buyer_id);
CREATE INDEX IF NOT EXISTS idx_mppu_message ON public.message_ppv_unlocks(message_id);
CREATE INDEX IF NOT EXISTS idx_mppu_buyer ON public.message_ppv_unlocks(buyer_id, status);

-- ===== 2) Wishlist =====
CREATE TABLE IF NOT EXISTS public.creator_wishlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES public.creator_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  link_url TEXT,
  price_eur NUMERIC(10,2) NOT NULL CHECK (price_eur >= 0.5),
  is_funded BOOLEAN NOT NULL DEFAULT false,
  funded_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.creator_wishlist_items TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.creator_wishlist_items TO authenticated;
GRANT ALL ON public.creator_wishlist_items TO service_role;
ALTER TABLE public.creator_wishlist_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "wishlist public read" ON public.creator_wishlist_items;
CREATE POLICY "wishlist public read" ON public.creator_wishlist_items FOR SELECT USING (true);
DROP POLICY IF EXISTS "wishlist owner manages" ON public.creator_wishlist_items;
CREATE POLICY "wishlist owner manages" ON public.creator_wishlist_items FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.creator_profiles cp WHERE cp.id = creator_id AND cp.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.creator_profiles cp WHERE cp.id = creator_id AND cp.user_id = auth.uid()));
CREATE INDEX IF NOT EXISTS idx_cwi_creator ON public.creator_wishlist_items(creator_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.wishlist_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES public.creator_wishlist_items(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL,
  creator_user_id UUID NOT NULL,
  amount_cents BIGINT NOT NULL CHECK (amount_cents >= 0),
  creator_payout_cents BIGINT NOT NULL CHECK (creator_payout_cents >= 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','failed','refunded')),
  stripe_session_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.wishlist_purchases TO authenticated;
GRANT ALL ON public.wishlist_purchases TO service_role;
ALTER TABLE public.wishlist_purchases ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "wishlist purchase parties read" ON public.wishlist_purchases;
CREATE POLICY "wishlist purchase parties read" ON public.wishlist_purchases FOR SELECT TO authenticated
  USING (auth.uid() = buyer_id OR auth.uid() = creator_user_id);
DROP POLICY IF EXISTS "wishlist purchase buyer insert" ON public.wishlist_purchases;
CREATE POLICY "wishlist purchase buyer insert" ON public.wishlist_purchases FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = buyer_id);
CREATE INDEX IF NOT EXISTS idx_wsp_item ON public.wishlist_purchases(item_id);

-- ===== 3) Top Fans leaderboard =====
CREATE OR REPLACE FUNCTION public.get_creator_top_fans(_creator_user_id UUID, _limit INT DEFAULT 10)
RETURNS JSONB
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_fans JSONB;
  v_me JSONB;
  v_viewer UUID := auth.uid();
BEGIN
  IF _creator_user_id IS NULL THEN
    RETURN jsonb_build_object('fans', '[]'::jsonb, 'me', NULL);
  END IF;

  WITH tip_events AS (
    SELECT pt.sender_id AS fan_id,
           COALESCE(pt.recipient_amount_cents, pt.amount_cents, 0) AS cents,
           pt.created_at
    FROM public.profile_tips pt
    WHERE pt.recipient_id = _creator_user_id AND pt.status = 'completed'
    UNION ALL
    SELECT gt.sender_id,
           COALESCE(gt.creator_payout, gt.amount * 0.9) * 100::BIGINT,
           gt.created_at
    FROM public.creator_gift_transactions gt
    WHERE gt.status = 'paid' AND gt.creator_id IN (
      SELECT cp.id FROM public.creator_profiles cp WHERE cp.user_id = _creator_user_id
      UNION
      SELECT _creator_user_id
    )
    UNION ALL
    SELECT lt.tipper_id, lt.amount_cents, lt.created_at
    FROM public.live_tips lt
    WHERE lt.streamer_id = _creator_user_id AND lt.status = 'completed'
  ),
  agg AS (
    SELECT te.fan_id,
           SUM(te.cents)::BIGINT AS total_cents,
           COUNT(*)::INT AS tip_count,
           MIN(te.created_at) AS first_tip_at,
           MAX(te.created_at) AS last_tip_at
    FROM tip_events te
    GROUP BY te.fan_id
  ),
  months AS (
    SELECT DISTINCT te.fan_id, date_trunc('month', te.created_at) AS m
    FROM tip_events te
  ),
  streaks AS (
    SELECT fan_id, MAX(streak_len)::INT AS best_streak
    FROM (
      SELECT fan_id, m,
             COUNT(*) OVER (PARTITION BY fan_id, grp) AS streak_len
      FROM (
        SELECT fan_id, m,
               m - (ROW_NUMBER() OVER (PARTITION BY fan_id ORDER BY m) || ' month')::INTERVAL AS grp
        FROM months
      ) x
    ) y
    GROUP BY fan_id
  ),
  ranked AS (
    SELECT a.*,
           ROW_NUMBER() OVER (ORDER BY a.total_cents DESC, a.tip_count DESC) AS rank
    FROM agg a
  )
  SELECT jsonb_build_object(
    'fans', COALESCE((
      SELECT jsonb_agg(
        jsonb_build_object(
          'fan_id', r.fan_id,
          'rank', r.rank,
          'total_cents', r.total_cents,
          'tip_count', r.tip_count,
          'streak_months', COALESCE(s.best_streak, 1),
          'last_tip_at', r.last_tip_at,
          'display_name', COALESCE(p.display_name, p.username, 'Fan'),
          'avatar_url', p.avatar_url
        ) ORDER BY r.rank
      )
      FROM (
        SELECT * FROM ranked ORDER BY rank LIMIT GREATEST(1, LEAST(_limit, 50))
      ) r
      LEFT JOIN public.profiles p ON p.id = r.fan_id
      LEFT JOIN streaks s ON s.fan_id = r.fan_id
    ), '[]'::jsonb),
    'me', (
      SELECT CASE WHEN r.fan_id IS NULL THEN NULL ELSE
        jsonb_build_object(
          'fan_id', r.fan_id,
          'rank', r.rank,
          'total_cents', r.total_cents,
          'tip_count', r.tip_count,
          'streak_months', COALESCE(s.best_streak, 1)
        )
      END
      FROM ranked r
      LEFT JOIN streaks s ON s.fan_id = r.fan_id
      WHERE r.fan_id = v_viewer
    )
  )
  INTO v_fans;

  RETURN v_fans;
END;
$$;
GRANT EXECUTE ON FUNCTION public.get_creator_top_fans(UUID, INT) TO authenticated;

-- ===== 4) Include new monetization in creator payout balance =====
CREATE OR REPLACE FUNCTION public.get_creator_available_cents(_user_id uuid)
RETURNS bigint
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT GREATEST(
    0,
    COALESCE((
      SELECT SUM(seller_amount)::numeric * 100
      FROM public.transactions
      WHERE seller_id = _user_id AND status = 'released'
    ), 0)
    +
    COALESCE((
      SELECT SUM(net_cents)
      FROM public.creator_subscription_earnings
      WHERE creator_id = _user_id AND payout_state IN ('available','pending')
    ), 0)
    +
    COALESCE((
      SELECT SUM(recipient_amount_cents)::numeric
      FROM public.profile_tips
      WHERE recipient_id = _user_id AND status = 'completed'
    ), 0)
    +
    COALESCE((
      SELECT SUM(u.creator_payout_cents)
      FROM public.message_ppv_unlocks u
      JOIN public.messages m ON m.id = u.message_id
      WHERE m.sender_id = _user_id AND u.status = 'paid'
    ), 0)
    +
    COALESCE((
      SELECT SUM(w.creator_payout_cents)
      FROM public.wishlist_purchases w
      WHERE w.creator_user_id = _user_id AND w.status = 'paid'
    ), 0)
    -
    COALESCE((
      SELECT SUM(amount_cents + fee_cents)
      FROM public.creator_payouts
      WHERE user_id = _user_id AND status IN ('pending','processing','paid')
    ), 0)
  );
$$;