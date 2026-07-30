ALTER TABLE public.clone_battles
  ADD COLUMN IF NOT EXISTS topic text,
  ADD COLUMN IF NOT EXISTS user_score integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS opponent_score integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS transcript jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS opponent_user_id uuid;

CREATE INDEX IF NOT EXISTS idx_clone_battles_created_at ON public.clone_battles (created_at DESC);

DROP POLICY IF EXISTS "Battles are publicly viewable" ON public.clone_battles;
CREATE POLICY "Battles are publicly viewable"
ON public.clone_battles FOR SELECT
TO authenticated, anon
USING (true);

GRANT SELECT ON public.clone_battles TO anon;
GRANT SELECT ON public.clone_battles TO authenticated;
GRANT ALL ON public.clone_battles TO service_role;