CREATE TABLE IF NOT EXISTS public.horse_duels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenger_user_id uuid NOT NULL,
  challenger_horse_id uuid NOT NULL REFERENCES public.horses(id) ON DELETE CASCADE,
  opponent_user_id uuid NOT NULL,
  opponent_horse_id uuid NOT NULL REFERENCES public.horses(id) ON DELETE CASCADE,
  winner_horse_id uuid,
  challenger_time numeric,
  opponent_time numeric,
  credits_spent int NOT NULL DEFAULT 1,
  credits_won int NOT NULL DEFAULT 0,
  log jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.horse_duels TO authenticated;
GRANT ALL ON public.horse_duels TO service_role;

ALTER TABLE public.horse_duels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view their own duels"
ON public.horse_duels FOR SELECT TO authenticated
USING (auth.uid() = challenger_user_id OR auth.uid() = opponent_user_id);

CREATE INDEX IF NOT EXISTS horse_duels_challenger_idx ON public.horse_duels(challenger_user_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.get_horse_opponents(_limit int DEFAULT 30)
RETURNS TABLE (
  id uuid,
  name text,
  breed text,
  color text,
  image_url text,
  level int,
  speed_stat int,
  stamina_stat int,
  acceleration_stat int,
  temperament_stat int,
  race_wins int,
  total_races int,
  owner_name text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT h.id,
         h.name,
         h.breed::text,
         h.color,
         h.image_url,
         COALESCE(h.level, 1)::int,
         COALESCE(h.speed_stat, 50)::int,
         COALESCE(h.stamina_stat, 50)::int,
         COALESCE(h.acceleration_stat, 50)::int,
         COALESCE(h.temperament_stat, 50)::int,
         COALESCE(h.race_wins, 0)::int,
         COALESCE(h.total_races, 0)::int,
         COALESCE(NULLIF(p.username, ''), NULLIF(p.full_name, ''), 'Anonymous Owner') AS owner_name
  FROM public.horses h
  LEFT JOIN public.profiles p ON p.id = h.user_id
  WHERE h.user_id IS DISTINCT FROM auth.uid()
  ORDER BY random()
  LIMIT LEAST(GREATEST(COALESCE(_limit, 30), 1), 60);
$$;

REVOKE ALL ON FUNCTION public.get_horse_opponents(int) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_horse_opponents(int) TO authenticated, service_role;