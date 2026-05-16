
CREATE TABLE IF NOT EXISTS public.coloring_streaks (
  user_id uuid PRIMARY KEY,
  current_streak integer DEFAULT 0,
  longest_streak integer DEFAULT 0,
  last_painted_on date,
  xp integer DEFAULT 0,
  level integer DEFAULT 1,
  badges jsonb DEFAULT '[]'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.coloring_streaks ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "view own streak" ON public.coloring_streaks FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "insert own streak" ON public.coloring_streaks FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "update own streak" ON public.coloring_streaks FOR UPDATE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.coloring_contests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  theme text NOT NULL,
  description text,
  starts_at timestamptz NOT NULL DEFAULT now(),
  ends_at timestamptz NOT NULL,
  prize text,
  winner_artwork_id uuid,
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.coloring_contests ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "anyone reads contests" ON public.coloring_contests FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.coloring_likes (
  artwork_id uuid NOT NULL REFERENCES public.coloring_artworks(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (artwork_id, user_id)
);
ALTER TABLE public.coloring_likes ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "anyone reads likes" ON public.coloring_likes FOR SELECT USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "user likes self" ON public.coloring_likes FOR INSERT WITH CHECK (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "user unlikes self" ON public.coloring_likes FOR DELETE USING (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.coloring_follows (
  follower_id uuid NOT NULL,
  followee_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (follower_id, followee_id)
);
ALTER TABLE public.coloring_follows ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "anyone reads follows" ON public.coloring_follows FOR SELECT USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "user follows self" ON public.coloring_follows FOR INSERT WITH CHECK (auth.uid() = follower_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "user unfollows self" ON public.coloring_follows FOR DELETE USING (auth.uid() = follower_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.coloring_collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  theme text,
  season text,
  cover_url text,
  is_premium boolean DEFAULT false,
  price_credits integer DEFAULT 0,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.coloring_collections ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "anyone reads collections" ON public.coloring_collections FOR SELECT USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.coloring_collection_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id uuid NOT NULL REFERENCES public.coloring_collections(id) ON DELETE CASCADE,
  title text,
  template_url text NOT NULL,
  license text DEFAULT 'free',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.coloring_collection_items ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "anyone reads items" ON public.coloring_collection_items FOR SELECT USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.coloring_pod_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  artwork_id uuid REFERENCES public.coloring_artworks(id) ON DELETE SET NULL,
  product_type text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  stripe_session_id text,
  amount_eur integer,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.coloring_pod_orders ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "view own orders" ON public.coloring_pod_orders FOR SELECT USING (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "create own order" ON public.coloring_pod_orders FOR INSERT WITH CHECK (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.coloring_collabs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id uuid NOT NULL,
  artwork_id uuid REFERENCES public.coloring_artworks(id) ON DELETE SET NULL,
  invite_token text UNIQUE NOT NULL DEFAULT replace(gen_random_uuid()::text, '-', ''),
  participants jsonb DEFAULT '[]'::jsonb,
  strokes jsonb DEFAULT '[]'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.coloring_collabs ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "active or host reads collab" ON public.coloring_collabs FOR SELECT USING (auth.uid() = host_id OR is_active = true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "host creates collab" ON public.coloring_collabs FOR INSERT WITH CHECK (auth.uid() = host_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "host updates collab" ON public.coloring_collabs FOR UPDATE USING (auth.uid() = host_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS idx_coloring_artworks_user ON public.coloring_artworks(user_id);
CREATE INDEX IF NOT EXISTS idx_coloring_artworks_public ON public.coloring_artworks(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_coloring_artworks_contest ON public.coloring_artworks(contest_id);
CREATE INDEX IF NOT EXISTS idx_coloring_likes_artwork ON public.coloring_likes(artwork_id);
CREATE INDEX IF NOT EXISTS idx_coloring_follows_followee ON public.coloring_follows(followee_id);

INSERT INTO public.coloring_contests (theme, description, ends_at, prize)
SELECT 'Spring Mandalas', 'Color a spring-themed mandala', now() + interval '7 days', '500 credits + featured spotlight'
WHERE NOT EXISTS (SELECT 1 FROM public.coloring_contests);

INSERT INTO public.coloring_collections (name, theme, season, is_premium, price_credits, description)
SELECT * FROM (VALUES
  ('Cozy Autumn', 'autumn', 'fall', false, 0, 'Pumpkins, leaves, warm sweaters'),
  ('Disney Classics (Licensed)', 'characters', 'evergreen', true, 50, 'Premium licensed character outlines'),
  ('Anime Heroes (Licensed)', 'anime', 'evergreen', true, 50, 'Premium licensed anime outlines'),
  ('Mindful Mandalas', 'mandala', 'evergreen', false, 0, 'Symmetric calming patterns')
) AS v(name, theme, season, is_premium, price_credits, description)
WHERE NOT EXISTS (SELECT 1 FROM public.coloring_collections);
