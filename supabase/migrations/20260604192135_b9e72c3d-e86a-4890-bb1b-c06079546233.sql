
-- D2: Daily Quests + Season Pass

-- 1) Daily quests catalogue
CREATE TABLE public.mt_daily_quests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quest_key text NOT NULL UNIQUE,
  label text NOT NULL,
  description text,
  target_count integer NOT NULL DEFAULT 1,
  reward_xp integer NOT NULL DEFAULT 0,
  reward_credits integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.mt_daily_quests TO anon, authenticated;
GRANT ALL ON public.mt_daily_quests TO service_role;
ALTER TABLE public.mt_daily_quests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read active quests" ON public.mt_daily_quests FOR SELECT USING (active = true);
CREATE POLICY "Admins manage quests" ON public.mt_daily_quests FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 2) Per-user daily quest progress
CREATE TABLE public.mt_user_quest_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  quest_key text NOT NULL,
  quest_date date NOT NULL DEFAULT (now() AT TIME ZONE 'UTC')::date,
  progress integer NOT NULL DEFAULT 0,
  completed_at timestamptz,
  claimed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, quest_key, quest_date)
);
GRANT SELECT, INSERT, UPDATE ON public.mt_user_quest_progress TO authenticated;
GRANT ALL ON public.mt_user_quest_progress TO service_role;
ALTER TABLE public.mt_user_quest_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own quest progress" ON public.mt_user_quest_progress FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own quest progress" ON public.mt_user_quest_progress FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own quest progress" ON public.mt_user_quest_progress FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_mt_user_quest_progress_user_date ON public.mt_user_quest_progress (user_id, quest_date);

-- 3) Season pass rewards catalogue
CREATE TABLE public.mt_season_pass_rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id text NOT NULL DEFAULT 'current',
  tier_level integer NOT NULL,
  xp_required integer NOT NULL,
  reward_type text NOT NULL,
  reward_label text NOT NULL,
  reward_icon text,
  reward_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (season_id, tier_level)
);
GRANT SELECT ON public.mt_season_pass_rewards TO anon, authenticated;
GRANT ALL ON public.mt_season_pass_rewards TO service_role;
ALTER TABLE public.mt_season_pass_rewards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read season rewards" ON public.mt_season_pass_rewards FOR SELECT USING (true);
CREATE POLICY "Admins manage season rewards" ON public.mt_season_pass_rewards FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 4) Per-user season pass claims (used by MegatalentSeasonPass.tsx)
CREATE TABLE public.mt_season_pass_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  season_id text NOT NULL DEFAULT 'current',
  tier_level integer NOT NULL,
  reward_label text,
  claimed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, season_id, tier_level)
);
GRANT SELECT, INSERT ON public.mt_season_pass_claims TO authenticated;
GRANT ALL ON public.mt_season_pass_claims TO service_role;
ALTER TABLE public.mt_season_pass_claims ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own season claims" ON public.mt_season_pass_claims FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own season claims" ON public.mt_season_pass_claims FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- 5) updated_at triggers
CREATE TRIGGER trg_mt_daily_quests_updated BEFORE UPDATE ON public.mt_daily_quests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_mt_user_quest_progress_updated BEFORE UPDATE ON public.mt_user_quest_progress FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_mt_season_pass_rewards_updated BEFORE UPDATE ON public.mt_season_pass_rewards FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 6) Seed default daily quests
INSERT INTO public.mt_daily_quests (quest_key, label, description, target_count, reward_xp, reward_credits) VALUES
  ('daily_vote_5', 'Vote 5 times', 'Cast 5 votes on submissions today', 5, 20, 0),
  ('daily_comment_3', 'Comment on 3 submissions', 'Leave 3 comments today', 3, 15, 0),
  ('daily_share_1', 'Share 1 submission', 'Share a submission with friends', 1, 10, 1),
  ('daily_watch_party', 'Join a Watch Party', 'Join any Watch Party session', 1, 25, 0),
  ('daily_login', 'Daily login', 'Open Megatalent today', 1, 5, 0);

-- 7) Seed season pass tiers (mirrors UI tiers in MegatalentSeasonPass.tsx)
INSERT INTO public.mt_season_pass_rewards (season_id, tier_level, xp_required, reward_type, reward_label, reward_icon) VALUES
  ('current', 1, 0,    'badge',     'Welcome badge',              '🎁'),
  ('current', 2, 50,   'cosmetic',  'Gold border on submissions', '🥇'),
  ('current', 3, 150,  'credits',   '+5 credits',                 '💎'),
  ('current', 4, 300,  'spotlight', 'Spotlight slot for 24h',     '🌟'),
  ('current', 5, 500,  'cosmetic',  'Custom emote pack',          '🎨'),
  ('current', 6, 800,  'entry',     'Free Battle Royale entry',   '⚔️'),
  ('current', 7, 1200, 'access',    'Champion-only chat access',  '👑');
