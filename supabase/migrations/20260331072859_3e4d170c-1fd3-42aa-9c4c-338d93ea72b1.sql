-- Style Battle Arena tables
CREATE TABLE public.fashion_style_battles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  theme TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  ends_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

ALTER TABLE public.fashion_style_battles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view battles" ON public.fashion_style_battles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create battles" ON public.fashion_style_battles FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

CREATE TABLE public.fashion_battle_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_id UUID REFERENCES public.fashion_style_battles(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  outfit_description TEXT NOT NULL,
  image_url TEXT,
  ai_score NUMERIC,
  ai_feedback TEXT,
  vote_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.fashion_battle_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view entries" ON public.fashion_battle_entries FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create entries" ON public.fashion_battle_entries FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own entries" ON public.fashion_battle_entries FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.fashion_battle_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id UUID REFERENCES public.fashion_battle_entries(id) ON DELETE CASCADE NOT NULL,
  voter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(entry_id, voter_id)
);

ALTER TABLE public.fashion_battle_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view votes" ON public.fashion_battle_votes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can vote" ON public.fashion_battle_votes FOR INSERT TO authenticated WITH CHECK (auth.uid() = voter_id);

CREATE TABLE public.fashion_ootd (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT,
  outfit_description TEXT NOT NULL,
  ai_score NUMERIC,
  ai_feedback TEXT,
  style_tags TEXT[],
  credits_used INTEGER DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.fashion_ootd ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own ootd" ON public.fashion_ootd FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create ootd" ON public.fashion_ootd FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.fashion_shopper_chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.fashion_shopper_chats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own chats" ON public.fashion_shopper_chats FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create chats" ON public.fashion_shopper_chats FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own chats" ON public.fashion_shopper_chats FOR UPDATE TO authenticated USING (auth.uid() = user_id);