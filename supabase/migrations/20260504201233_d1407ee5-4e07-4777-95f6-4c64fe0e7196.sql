
ALTER TABLE public.kitchen_battle_votes
  ADD COLUMN IF NOT EXISTS vote_type text NOT NULL DEFAULT 'like'
  CHECK (vote_type IN ('like', 'dislike'));

ALTER TABLE public.kitchen_battle_participants
  ADD COLUMN IF NOT EXISTS dislike_count integer NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS public.kitchen_battle_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_id uuid NOT NULL REFERENCES public.kitchen_battles(id) ON DELETE CASCADE,
  participant_id uuid REFERENCES public.kitchen_battle_participants(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  content text NOT NULL CHECK (char_length(content) BETWEEN 1 AND 1000),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_kbc_battle ON public.kitchen_battle_comments(battle_id);
CREATE INDEX IF NOT EXISTS idx_kbc_participant ON public.kitchen_battle_comments(participant_id);

ALTER TABLE public.kitchen_battle_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "kbc_select_all" ON public.kitchen_battle_comments
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "kbc_insert_own" ON public.kitchen_battle_comments
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "kbc_update_own" ON public.kitchen_battle_comments
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "kbc_delete_own" ON public.kitchen_battle_comments
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER trg_kbc_updated BEFORE UPDATE ON public.kitchen_battle_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
