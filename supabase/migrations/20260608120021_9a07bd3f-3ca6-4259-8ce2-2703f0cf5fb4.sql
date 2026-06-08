
-- Games Hub: favorites + play tracking
CREATE TABLE public.games_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  game_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, game_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.games_favorites TO authenticated;
GRANT ALL ON public.games_favorites TO service_role;
ALTER TABLE public.games_favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own game favorites"
  ON public.games_favorites FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.games_plays (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  game_id text NOT NULL,
  game_title text,
  game_category text,
  played_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.games_plays TO authenticated;
GRANT ALL ON public.games_plays TO service_role;
ALTER TABLE public.games_plays ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users insert their own plays"
  ON public.games_plays FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users read their own plays"
  ON public.games_plays FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX games_favorites_user_idx ON public.games_favorites(user_id);
CREATE INDEX games_plays_user_played_idx ON public.games_plays(user_id, played_at DESC);
CREATE INDEX games_plays_game_idx ON public.games_plays(game_id);
