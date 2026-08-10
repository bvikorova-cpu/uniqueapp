-- Character Equipment Shop: buy gear that boosts character stats
CREATE TABLE IF NOT EXISTS public.character_equipment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  character_id uuid NOT NULL REFERENCES public.characters(id) ON DELETE CASCADE,
  name text NOT NULL,
  slot text NOT NULL DEFAULT 'weapon',
  boost_stat text NOT NULL,
  boost_value integer NOT NULL DEFAULT 0,
  rarity text NOT NULL DEFAULT 'common',
  icon text,
  credits_cost integer NOT NULL DEFAULT 0,
  equipped boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.character_equipment TO authenticated;
GRANT ALL ON public.character_equipment TO service_role;
ALTER TABLE public.character_equipment ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "owner reads equipment" ON public.character_equipment
    FOR SELECT TO authenticated USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "owner inserts equipment" ON public.character_equipment
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "owner updates equipment" ON public.character_equipment
    FOR UPDATE TO authenticated USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "owner deletes equipment" ON public.character_equipment
    FOR DELETE TO authenticated USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;