-- 1. Daily Curse Wheel
CREATE TABLE public.shadow_curse_wheel_spins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  prize_type TEXT NOT NULL,
  prize_value INTEGER NOT NULL DEFAULT 0,
  prize_label TEXT NOT NULL,
  spun_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.shadow_curse_wheel_spins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own spins" ON public.shadow_curse_wheel_spins FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own spins" ON public.shadow_curse_wheel_spins FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_curse_spins_user_date ON public.shadow_curse_wheel_spins(user_id, spun_at DESC);

-- 2. Live Battle Reactions
CREATE TABLE public.shadow_battle_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_id UUID NOT NULL,
  user_id UUID NOT NULL,
  emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.shadow_battle_reactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reactions are publicly viewable" ON public.shadow_battle_reactions FOR SELECT USING (true);
CREATE POLICY "Users insert own reactions" ON public.shadow_battle_reactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_battle_reactions_battle ON public.shadow_battle_reactions(battle_id, created_at DESC);

-- 3. Story Chain Battles
CREATE TABLE public.shadow_story_chains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  theme TEXT NOT NULL,
  starter_user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  max_segments INTEGER NOT NULL DEFAULT 10,
  current_segments INTEGER NOT NULL DEFAULT 0,
  total_votes INTEGER NOT NULL DEFAULT 0,
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.shadow_story_chains ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Chains publicly viewable" ON public.shadow_story_chains FOR SELECT USING (true);
CREATE POLICY "Auth users create chains" ON public.shadow_story_chains FOR INSERT WITH CHECK (auth.uid() = starter_user_id);
CREATE POLICY "Starter updates chain" ON public.shadow_story_chains FOR UPDATE USING (auth.uid() = starter_user_id);

CREATE TABLE public.shadow_story_chain_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chain_id UUID NOT NULL REFERENCES public.shadow_story_chains(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  segment_order INTEGER NOT NULL,
  votes INTEGER NOT NULL DEFAULT 0,
  is_chosen BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.shadow_story_chain_segments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Segments publicly viewable" ON public.shadow_story_chain_segments FOR SELECT USING (true);
CREATE POLICY "Auth users add segments" ON public.shadow_story_chain_segments FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.shadow_chain_segment_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  segment_id UUID NOT NULL REFERENCES public.shadow_story_chain_segments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(segment_id, user_id)
);
ALTER TABLE public.shadow_chain_segment_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Votes viewable" ON public.shadow_chain_segment_votes FOR SELECT USING (true);
CREATE POLICY "Users vote once" ON public.shadow_chain_segment_votes FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 4. Voice Cloning
CREATE TABLE public.shadow_voice_clones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  voice_id TEXT NOT NULL,
  voice_name TEXT NOT NULL,
  sample_audio_url TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  credits_spent INTEGER NOT NULL DEFAULT 25,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.shadow_voice_clones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own clones" ON public.shadow_voice_clones FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users manage own clones" ON public.shadow_voice_clones FOR ALL USING (auth.uid() = user_id);

-- 5. NFT-style Achievements (extension)
CREATE TABLE public.shadow_cursed_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  achievement_code TEXT NOT NULL,
  achievement_name TEXT NOT NULL,
  rarity TEXT NOT NULL DEFAULT 'common',
  badge_image_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_code)
);
ALTER TABLE public.shadow_cursed_achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Achievements publicly viewable" ON public.shadow_cursed_achievements FOR SELECT USING (true);
CREATE POLICY "System awards achievements" ON public.shadow_cursed_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 6. Horror Reels
CREATE TABLE public.shadow_horror_reels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  story_id UUID,
  title TEXT NOT NULL,
  prompt TEXT NOT NULL,
  video_url TEXT,
  thumbnail_url TEXT,
  duration_seconds INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  is_public BOOLEAN NOT NULL DEFAULT true,
  views_count INTEGER NOT NULL DEFAULT 0,
  credits_used INTEGER NOT NULL DEFAULT 15,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.shadow_horror_reels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public reels viewable" ON public.shadow_horror_reels FOR SELECT USING (is_public = true OR auth.uid() = user_id);
CREATE POLICY "Users create own reels" ON public.shadow_horror_reels FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own reels" ON public.shadow_horror_reels FOR UPDATE USING (auth.uid() = user_id);

-- 7. Push Subscriptions
CREATE TABLE public.shadow_push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  endpoint TEXT NOT NULL,
  p256dh_key TEXT NOT NULL,
  auth_key TEXT NOT NULL,
  enabled_categories TEXT[] DEFAULT ARRAY['battles', 'wins', 'patron'],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, endpoint)
);
ALTER TABLE public.shadow_push_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own subs" ON public.shadow_push_subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users manage own subs" ON public.shadow_push_subscriptions FOR ALL USING (auth.uid() = user_id);

-- 8. Patron Mode
CREATE TABLE public.shadow_patron_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patron_user_id UUID NOT NULL,
  author_user_id UUID NOT NULL,
  tier TEXT NOT NULL DEFAULT 'bronze',
  monthly_amount NUMERIC(10,2) NOT NULL DEFAULT 4.99,
  status TEXT NOT NULL DEFAULT 'active',
  stripe_subscription_id TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(patron_user_id, author_user_id)
);
ALTER TABLE public.shadow_patron_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Patron and author view sub" ON public.shadow_patron_subscriptions FOR SELECT USING (auth.uid() = patron_user_id OR auth.uid() = author_user_id);
CREATE POLICY "Patron creates sub" ON public.shadow_patron_subscriptions FOR INSERT WITH CHECK (auth.uid() = patron_user_id);
CREATE POLICY "Patron manages own sub" ON public.shadow_patron_subscriptions FOR UPDATE USING (auth.uid() = patron_user_id);

CREATE TABLE public.shadow_patron_exclusive_stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_user_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  cover_image_url TEXT,
  required_tier TEXT NOT NULL DEFAULT 'bronze',
  views_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.shadow_patron_exclusive_stories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Author views own exclusive" ON public.shadow_patron_exclusive_stories FOR SELECT USING (
  auth.uid() = author_user_id OR EXISTS (
    SELECT 1 FROM public.shadow_patron_subscriptions
    WHERE author_user_id = shadow_patron_exclusive_stories.author_user_id
      AND patron_user_id = auth.uid()
      AND status = 'active'
  )
);
CREATE POLICY "Author manages own exclusive" ON public.shadow_patron_exclusive_stories FOR ALL USING (auth.uid() = author_user_id);

-- Update timestamp triggers
CREATE TRIGGER update_chains_updated_at BEFORE UPDATE ON public.shadow_story_chains FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_voice_clones_updated_at BEFORE UPDATE ON public.shadow_voice_clones FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_patron_subs_updated_at BEFORE UPDATE ON public.shadow_patron_subscriptions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_exclusive_stories_updated_at BEFORE UPDATE ON public.shadow_patron_exclusive_stories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();