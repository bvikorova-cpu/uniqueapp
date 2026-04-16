
-- ===== BRAND STOCK MARKET =====
CREATE TABLE public.brand_stock_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES public.brand_sponsors(id) ON DELETE CASCADE,
  current_price NUMERIC(12,2) NOT NULL DEFAULT 100.00,
  open_price NUMERIC(12,2) NOT NULL DEFAULT 100.00,
  high_24h NUMERIC(12,2) NOT NULL DEFAULT 100.00,
  low_24h NUMERIC(12,2) NOT NULL DEFAULT 100.00,
  change_24h NUMERIC(8,4) NOT NULL DEFAULT 0,
  volume_24h INTEGER NOT NULL DEFAULT 0,
  market_cap NUMERIC(14,2) NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(brand_id)
);
ALTER TABLE public.brand_stock_prices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "stock_prices_public_read" ON public.brand_stock_prices FOR SELECT USING (true);

CREATE TABLE public.brand_stock_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES public.brand_sponsors(id) ON DELETE CASCADE,
  price NUMERIC(12,2) NOT NULL,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_stock_history_brand_time ON public.brand_stock_history(brand_id, recorded_at DESC);
ALTER TABLE public.brand_stock_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "stock_history_public_read" ON public.brand_stock_history FOR SELECT USING (true);

CREATE TABLE public.brand_investments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  brand_id UUID NOT NULL REFERENCES public.brand_sponsors(id) ON DELETE CASCADE,
  shares NUMERIC(12,4) NOT NULL,
  buy_price NUMERIC(12,2) NOT NULL,
  current_value NUMERIC(12,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  sold_at TIMESTAMPTZ,
  sold_price NUMERIC(12,2),
  profit_loss NUMERIC(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.brand_investments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "investments_select_own" ON public.brand_investments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "investments_insert_own" ON public.brand_investments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "investments_update_own" ON public.brand_investments FOR UPDATE USING (auth.uid() = user_id);

-- ===== TRIBES =====
CREATE TABLE public.brand_tribes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES public.brand_sponsors(id) ON DELETE CASCADE UNIQUE,
  name TEXT NOT NULL,
  motto TEXT,
  member_count INTEGER NOT NULL DEFAULT 0,
  total_power INTEGER NOT NULL DEFAULT 0,
  weekly_score INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.brand_tribes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tribes_public_read" ON public.brand_tribes FOR SELECT USING (true);

CREATE TABLE public.brand_tribe_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tribe_id UUID NOT NULL REFERENCES public.brand_tribes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  rank TEXT NOT NULL DEFAULT 'recruit',
  contribution INTEGER NOT NULL DEFAULT 0,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tribe_id, user_id)
);
ALTER TABLE public.brand_tribe_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tribe_members_public_read" ON public.brand_tribe_members FOR SELECT USING (true);
CREATE POLICY "tribe_members_join_self" ON public.brand_tribe_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "tribe_members_leave_self" ON public.brand_tribe_members FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "tribe_members_update_self" ON public.brand_tribe_members FOR UPDATE USING (auth.uid() = user_id);

-- ===== TRADING CARDS =====
CREATE TABLE public.brand_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES public.brand_sponsors(id) ON DELETE CASCADE,
  rarity TEXT NOT NULL DEFAULT 'common',
  artwork_url TEXT,
  power INTEGER NOT NULL DEFAULT 50,
  edition_size INTEGER NOT NULL DEFAULT 1000,
  minted_count INTEGER NOT NULL DEFAULT 0,
  base_price INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.brand_cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cards_public_read" ON public.brand_cards FOR SELECT USING (true);

CREATE TABLE public.user_brand_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  card_id UUID NOT NULL REFERENCES public.brand_cards(id) ON DELETE CASCADE,
  serial_number INTEGER NOT NULL,
  acquired_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_for_trade BOOLEAN NOT NULL DEFAULT false,
  UNIQUE(card_id, serial_number)
);
ALTER TABLE public.user_brand_cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_cards_public_read" ON public.user_brand_cards FOR SELECT USING (true);
CREATE POLICY "user_cards_insert_own" ON public.user_brand_cards FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_cards_update_own" ON public.user_brand_cards FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "user_cards_delete_own" ON public.user_brand_cards FOR DELETE USING (auth.uid() = user_id);

CREATE TABLE public.brand_card_trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user UUID NOT NULL,
  to_user UUID,
  offered_card_id UUID NOT NULL REFERENCES public.user_brand_cards(id) ON DELETE CASCADE,
  requested_card_id UUID REFERENCES public.user_brand_cards(id) ON DELETE SET NULL,
  credit_offer INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);
ALTER TABLE public.brand_card_trades ENABLE ROW LEVEL SECURITY;
CREATE POLICY "trades_view_involved" ON public.brand_card_trades FOR SELECT USING (auth.uid() = from_user OR auth.uid() = to_user OR to_user IS NULL);
CREATE POLICY "trades_create_own" ON public.brand_card_trades FOR INSERT WITH CHECK (auth.uid() = from_user);
CREATE POLICY "trades_update_involved" ON public.brand_card_trades FOR UPDATE USING (auth.uid() = from_user OR auth.uid() = to_user);

-- ===== AMBASSADORS =====
CREATE TABLE public.brand_ambassadors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  brand_id UUID NOT NULL REFERENCES public.brand_sponsors(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active',
  total_referred INTEGER NOT NULL DEFAULT 0,
  revenue_share_pct NUMERIC(5,2) NOT NULL DEFAULT 5.00,
  total_earned NUMERIC(10,2) NOT NULL DEFAULT 0,
  appointed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, brand_id)
);
ALTER TABLE public.brand_ambassadors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ambassadors_public_read" ON public.brand_ambassadors FOR SELECT USING (true);
CREATE POLICY "ambassadors_insert_own" ON public.brand_ambassadors FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ===== BATTLE PREDICTIONS =====
CREATE TABLE public.brand_battle_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  brand_a_id UUID NOT NULL REFERENCES public.brand_sponsors(id) ON DELETE CASCADE,
  brand_b_id UUID NOT NULL REFERENCES public.brand_sponsors(id) ON DELETE CASCADE,
  predicted_winner_id UUID NOT NULL REFERENCES public.brand_sponsors(id) ON DELETE CASCADE,
  ai_predicted_winner_id UUID REFERENCES public.brand_sponsors(id),
  ai_confidence NUMERIC(5,2),
  ai_reasoning TEXT,
  stake INTEGER NOT NULL DEFAULT 0,
  result TEXT,
  payout INTEGER DEFAULT 0,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.brand_battle_predictions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "predictions_select_own" ON public.brand_battle_predictions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "predictions_insert_own" ON public.brand_battle_predictions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ===== AI INSIGHTS (paid) =====
CREATE TABLE public.brand_ai_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  brand_id UUID REFERENCES public.brand_sponsors(id) ON DELETE CASCADE,
  insight_type TEXT NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  full_report JSONB,
  credits_charged INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.brand_ai_insights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ai_insights_select_own" ON public.brand_ai_insights FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "ai_insights_insert_own" ON public.brand_ai_insights FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ===== PREMIUM PASS =====
CREATE TABLE public.brand_voter_pass (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  tier TEXT NOT NULL DEFAULT 'free',
  status TEXT NOT NULL DEFAULT 'active',
  current_period_end TIMESTAMPTZ,
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.brand_voter_pass ENABLE ROW LEVEL SECURITY;
CREATE POLICY "voter_pass_select_own" ON public.brand_voter_pass FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "voter_pass_insert_own" ON public.brand_voter_pass FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "voter_pass_update_own" ON public.brand_voter_pass FOR UPDATE USING (auth.uid() = user_id);

-- ===== BOOSTERS / COSMETICS =====
CREATE TABLE public.user_brand_boosters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  booster_type TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  expires_at TIMESTAMPTZ,
  is_equipped BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.user_brand_boosters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "boosters_select_own" ON public.user_brand_boosters FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "boosters_insert_own" ON public.user_brand_boosters FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "boosters_update_own" ON public.user_brand_boosters FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "boosters_delete_own" ON public.user_brand_boosters FOR DELETE USING (auth.uid() = user_id);

-- ===== LIVE CHAT =====
CREATE TABLE public.brand_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  username TEXT NOT NULL,
  brand_id UUID REFERENCES public.brand_sponsors(id) ON DELETE CASCADE,
  matchup_id TEXT,
  message TEXT NOT NULL,
  reaction TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_chat_messages_brand_time ON public.brand_chat_messages(brand_id, created_at DESC);
CREATE INDEX idx_chat_messages_matchup_time ON public.brand_chat_messages(matchup_id, created_at DESC);
ALTER TABLE public.brand_chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "chat_public_read" ON public.brand_chat_messages FOR SELECT USING (true);
CREATE POLICY "chat_insert_own" ON public.brand_chat_messages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "chat_delete_own" ON public.brand_chat_messages FOR DELETE USING (auth.uid() = user_id);

-- ===== TOURNAMENTS =====
CREATE TABLE public.brand_tournaments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  season INTEGER NOT NULL DEFAULT 1,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  prize_pool NUMERIC(10,2) NOT NULL DEFAULT 10000,
  status TEXT NOT NULL DEFAULT 'upcoming',
  bracket JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.brand_tournaments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tournaments_public_read" ON public.brand_tournaments FOR SELECT USING (true);

CREATE TABLE public.brand_tournament_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES public.brand_tournaments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  brand_id UUID NOT NULL REFERENCES public.brand_sponsors(id) ON DELETE CASCADE,
  score INTEGER NOT NULL DEFAULT 0,
  rank INTEGER,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tournament_id, user_id)
);
ALTER TABLE public.brand_tournament_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tournament_entries_public_read" ON public.brand_tournament_entries FOR SELECT USING (true);
CREATE POLICY "tournament_entries_insert_own" ON public.brand_tournament_entries FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ===== SEED INITIAL STOCK PRICES & TRIBES & CARDS FOR EXISTING BRANDS =====
INSERT INTO public.brand_stock_prices (brand_id, current_price, open_price, high_24h, low_24h, market_cap)
SELECT id, 100 + (random() * 50), 100, 150, 80, 1000000 + (random() * 5000000)
FROM public.brand_sponsors
ON CONFLICT (brand_id) DO NOTHING;

INSERT INTO public.brand_tribes (brand_id, name, motto)
SELECT id, name || ' Legion', 'United we rise.'
FROM public.brand_sponsors
ON CONFLICT (brand_id) DO NOTHING;

INSERT INTO public.brand_cards (brand_id, rarity, power, base_price, edition_size)
SELECT id, 'common', 50, 100, 5000 FROM public.brand_sponsors
UNION ALL
SELECT id, 'rare', 75, 500, 1000 FROM public.brand_sponsors
UNION ALL
SELECT id, 'epic', 90, 2000, 250 FROM public.brand_sponsors
UNION ALL
SELECT id, 'legendary', 100, 10000, 50 FROM public.brand_sponsors;
