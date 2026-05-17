
-- 1. Duet battles
CREATE TABLE public.shadow_duet_battles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_a UUID NOT NULL,
  creator_b UUID,
  theme TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  votes_a INTEGER NOT NULL DEFAULT 0,
  votes_b INTEGER NOT NULL DEFAULT 0,
  starts_at TIMESTAMPTZ DEFAULT now(),
  ends_at TIMESTAMPTZ DEFAULT now() + interval '15 minutes',
  winner_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.shadow_duet_battles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "duets readable" ON public.shadow_duet_battles FOR SELECT USING (true);
CREATE POLICY "duets create" ON public.shadow_duet_battles FOR INSERT WITH CHECK (auth.uid() = creator_a);
CREATE POLICY "duets update own" ON public.shadow_duet_battles FOR UPDATE USING (auth.uid() = creator_a OR auth.uid() = creator_b);

CREATE TABLE public.shadow_duet_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  duet_id UUID NOT NULL REFERENCES public.shadow_duet_battles(id) ON DELETE CASCADE,
  voter_id UUID NOT NULL,
  vote_for CHAR(1) NOT NULL CHECK (vote_for IN ('A','B')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(duet_id, voter_id)
);
ALTER TABLE public.shadow_duet_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "duet votes readable" ON public.shadow_duet_votes FOR SELECT USING (true);
CREATE POLICY "duet vote insert" ON public.shadow_duet_votes FOR INSERT WITH CHECK (auth.uid() = voter_id);

-- 2. Virtual gifts catalog
CREATE TABLE public.shadow_gift_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  emoji TEXT NOT NULL,
  tier TEXT NOT NULL,
  credit_cost INTEGER NOT NULL,
  animation TEXT DEFAULT 'pop',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.shadow_gift_catalog ENABLE ROW LEVEL SECURITY;
CREATE POLICY "catalog public" ON public.shadow_gift_catalog FOR SELECT USING (true);

INSERT INTO public.shadow_gift_catalog (code,name,emoji,tier,credit_cost,animation) VALUES
('heart','Heart','❤️','common',1,'pulse'),
('rose','Black Rose','🌹','common',3,'fall'),
('ghost','Ghost','👻','rare',6,'float'),
('skull','Cursed Skull','💀','rare',10,'shake'),
('demon','Demon','😈','epic',25,'fire'),
('dragon','Shadow Dragon','🐉','legendary',60,'roar'),
('crown','Crown of Shadows','👑','legendary',150,'sparkle');

-- 3. Gift sends
CREATE TABLE public.shadow_gift_sends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL,
  recipient_id UUID NOT NULL,
  gift_code TEXT NOT NULL,
  credits_spent INTEGER NOT NULL,
  context_type TEXT,
  context_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.shadow_gift_sends ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gift sends readable" ON public.shadow_gift_sends FOR SELECT USING (true);
CREATE POLICY "gift sends insert own" ON public.shadow_gift_sends FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE INDEX idx_gift_sends_recipient ON public.shadow_gift_sends(recipient_id, created_at DESC);
CREATE INDEX idx_gift_sends_context ON public.shadow_gift_sends(context_type, context_id);

-- 4. Stream goals
CREATE TABLE public.shadow_stream_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL,
  title TEXT NOT NULL,
  target_credits INTEGER NOT NULL,
  current_credits INTEGER NOT NULL DEFAULT 0,
  reward_description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);
ALTER TABLE public.shadow_stream_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "goals public" ON public.shadow_stream_goals FOR SELECT USING (true);
CREATE POLICY "goals own crud" ON public.shadow_stream_goals FOR ALL USING (auth.uid() = creator_id) WITH CHECK (auth.uid() = creator_id);

-- 5. Tournaments
CREATE TABLE public.shadow_tournaments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  max_participants INTEGER NOT NULL DEFAULT 8,
  entry_credits INTEGER NOT NULL DEFAULT 0,
  prize_pool_credits INTEGER NOT NULL DEFAULT 0,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ,
  bracket JSONB DEFAULT '[]'::jsonb,
  winner_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.shadow_tournaments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tourns public" ON public.shadow_tournaments FOR SELECT USING (true);

CREATE TABLE public.shadow_tournament_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES public.shadow_tournaments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'registered',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tournament_id, user_id)
);
ALTER TABLE public.shadow_tournament_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tourn entries public" ON public.shadow_tournament_entries FOR SELECT USING (true);
CREATE POLICY "tourn entry own" ON public.shadow_tournament_entries FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 6. Stream schedule
CREATE TABLE public.shadow_stream_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  scheduled_for TIMESTAMPTZ NOT NULL,
  cover_emoji TEXT DEFAULT '🌑',
  status TEXT NOT NULL DEFAULT 'scheduled',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.shadow_stream_schedule ENABLE ROW LEVEL SECURITY;
CREATE POLICY "schedule public" ON public.shadow_stream_schedule FOR SELECT USING (true);
CREATE POLICY "schedule own" ON public.shadow_stream_schedule FOR ALL USING (auth.uid() = creator_id) WITH CHECK (auth.uid() = creator_id);

CREATE TABLE public.shadow_stream_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id UUID NOT NULL REFERENCES public.shadow_stream_schedule(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(schedule_id, user_id)
);
ALTER TABLE public.shadow_stream_reminders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reminders own" ON public.shadow_stream_reminders FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 7. Auto clips
CREATE TABLE public.shadow_auto_clips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL,
  source_type TEXT NOT NULL,
  source_id UUID,
  title TEXT NOT NULL,
  highlight_text TEXT NOT NULL,
  emoji TEXT DEFAULT '🎬',
  duration_seconds INTEGER DEFAULT 20,
  views INTEGER NOT NULL DEFAULT 0,
  shares INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.shadow_auto_clips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "clips public" ON public.shadow_auto_clips FOR SELECT USING (true);
CREATE POLICY "clips own" ON public.shadow_auto_clips FOR ALL USING (auth.uid() = creator_id) WITH CHECK (auth.uid() = creator_id);

-- 8. Chat moderation
CREATE TABLE public.shadow_stream_mods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL,
  mod_user_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(creator_id, mod_user_id)
);
ALTER TABLE public.shadow_stream_mods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mods readable by creator or mod" ON public.shadow_stream_mods FOR SELECT USING (auth.uid() = creator_id OR auth.uid() = mod_user_id);
CREATE POLICY "mods managed by creator" ON public.shadow_stream_mods FOR ALL USING (auth.uid() = creator_id) WITH CHECK (auth.uid() = creator_id);

CREATE TABLE public.shadow_banned_words (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL,
  word TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(creator_id, word)
);
ALTER TABLE public.shadow_banned_words ENABLE ROW LEVEL SECURITY;
CREATE POLICY "banned words own" ON public.shadow_banned_words FOR ALL USING (auth.uid() = creator_id) WITH CHECK (auth.uid() = creator_id);
