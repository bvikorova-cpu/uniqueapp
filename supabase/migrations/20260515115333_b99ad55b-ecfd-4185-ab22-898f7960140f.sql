-- ============ LEAGUES ============
CREATE TYPE public.league_tier AS ENUM ('bronze','silver','gold','platinum','diamond');

CREATE TABLE public.league_seasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season_number INT NOT NULL,
  starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ends_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.user_league_standings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  season_id UUID NOT NULL REFERENCES public.league_seasons(id) ON DELETE CASCADE,
  tier public.league_tier NOT NULL DEFAULT 'bronze',
  group_number INT NOT NULL DEFAULT 1,
  weekly_xp INT NOT NULL DEFAULT 0,
  rank INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, season_id)
);

ALTER TABLE public.league_seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_league_standings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view league seasons" ON public.league_seasons FOR SELECT USING (true);
CREATE POLICY "Admins manage seasons" ON public.league_seasons FOR ALL USING (public.has_role(auth.uid(),'admin'::app_role));

CREATE POLICY "Anyone can view standings" ON public.user_league_standings FOR SELECT USING (true);
CREATE POLICY "Users insert own standing" ON public.user_league_standings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own standing" ON public.user_league_standings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins manage standings" ON public.user_league_standings FOR ALL USING (public.has_role(auth.uid(),'admin'::app_role));

CREATE INDEX idx_uls_season_tier ON public.user_league_standings(season_id, tier, weekly_xp DESC);
CREATE INDEX idx_uls_user ON public.user_league_standings(user_id);

-- ============ BATTLE PASS ============
CREATE TABLE public.battle_pass_seasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  season_number INT NOT NULL,
  starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ends_at TIMESTAMPTZ NOT NULL,
  premium_price_eur NUMERIC(10,2) NOT NULL DEFAULT 9.99,
  premium_price_xp INT,
  total_tiers INT NOT NULL DEFAULT 50,
  xp_per_tier INT NOT NULL DEFAULT 1000,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.battle_pass_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id UUID NOT NULL REFERENCES public.battle_pass_seasons(id) ON DELETE CASCADE,
  tier INT NOT NULL,
  track TEXT NOT NULL CHECK (track IN ('free','premium')),
  reward_type TEXT NOT NULL,
  reward_value INT NOT NULL DEFAULT 0,
  reward_label TEXT NOT NULL,
  reward_icon TEXT,
  UNIQUE(season_id, tier, track)
);

CREATE TABLE public.user_battle_pass (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  season_id UUID NOT NULL REFERENCES public.battle_pass_seasons(id) ON DELETE CASCADE,
  current_xp INT NOT NULL DEFAULT 0,
  current_tier INT NOT NULL DEFAULT 0,
  has_premium BOOLEAN NOT NULL DEFAULT false,
  premium_purchased_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, season_id)
);

CREATE TABLE public.user_battle_pass_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  season_id UUID NOT NULL REFERENCES public.battle_pass_seasons(id) ON DELETE CASCADE,
  tier INT NOT NULL,
  track TEXT NOT NULL,
  claimed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, season_id, tier, track)
);

ALTER TABLE public.battle_pass_seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.battle_pass_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_battle_pass ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_battle_pass_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone view BP seasons" ON public.battle_pass_seasons FOR SELECT USING (true);
CREATE POLICY "Admins manage BP seasons" ON public.battle_pass_seasons FOR ALL USING (public.has_role(auth.uid(),'admin'::app_role));
CREATE POLICY "Anyone view BP rewards" ON public.battle_pass_rewards FOR SELECT USING (true);
CREATE POLICY "Admins manage BP rewards" ON public.battle_pass_rewards FOR ALL USING (public.has_role(auth.uid(),'admin'::app_role));

CREATE POLICY "Users view own BP" ON public.user_battle_pass FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own BP" ON public.user_battle_pass FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own BP" ON public.user_battle_pass FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users view own BP claims" ON public.user_battle_pass_claims FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own BP claims" ON public.user_battle_pass_claims FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============ STREAK FREEZE ============
CREATE TABLE public.user_streak_freezes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  available_count INT NOT NULL DEFAULT 0,
  total_purchased INT NOT NULL DEFAULT 0,
  total_used INT NOT NULL DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.streak_freeze_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('purchased','used','expired','gifted')),
  quantity INT NOT NULL DEFAULT 1,
  cost_xp INT,
  cost_eur NUMERIC(10,2),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_streak_freezes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streak_freeze_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own freezes" ON public.user_streak_freezes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own freezes" ON public.user_streak_freezes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own freezes" ON public.user_streak_freezes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users view own freeze history" ON public.streak_freeze_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own freeze history" ON public.streak_freeze_history FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============ DAILY LOGIN CALENDAR ============
CREATE TABLE public.login_calendar_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month_key TEXT NOT NULL UNIQUE,
  day_number INT NOT NULL,
  reward_type TEXT NOT NULL,
  reward_value INT NOT NULL DEFAULT 0,
  reward_label TEXT NOT NULL,
  reward_icon TEXT,
  is_milestone BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.user_calendar_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  month_key TEXT NOT NULL,
  day_number INT NOT NULL,
  reward_type TEXT NOT NULL,
  reward_value INT NOT NULL,
  claimed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, month_key, day_number)
);

ALTER TABLE public.login_calendar_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_calendar_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone view calendar templates" ON public.login_calendar_templates FOR SELECT USING (true);
CREATE POLICY "Admins manage calendar templates" ON public.login_calendar_templates FOR ALL USING (public.has_role(auth.uid(),'admin'::app_role));
CREATE POLICY "Users view own calendar claims" ON public.user_calendar_claims FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own calendar claims" ON public.user_calendar_claims FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============ TRIGGERS ============
CREATE TRIGGER update_user_league_standings_updated_at BEFORE UPDATE ON public.user_league_standings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_battle_pass_updated_at BEFORE UPDATE ON public.user_battle_pass FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_streak_freezes_updated_at BEFORE UPDATE ON public.user_streak_freezes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();