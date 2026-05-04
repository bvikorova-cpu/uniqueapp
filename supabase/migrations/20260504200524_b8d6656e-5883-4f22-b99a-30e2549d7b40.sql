
CREATE TABLE IF NOT EXISTS public.kitchen_battles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  theme text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'open',
  deadline timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  prize_pool numeric NOT NULL DEFAULT 0,
  winner_participant_id uuid,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.kitchen_battle_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_id uuid NOT NULL REFERENCES public.kitchen_battles(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  dish_title text NOT NULL,
  description text,
  image_url text,
  video_url text,
  vote_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (battle_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.kitchen_battle_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_id uuid NOT NULL REFERENCES public.kitchen_battles(id) ON DELETE CASCADE,
  participant_id uuid NOT NULL REFERENCES public.kitchen_battle_participants(id) ON DELETE CASCADE,
  voter_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (battle_id, voter_id)
);

CREATE INDEX IF NOT EXISTS idx_kbp_battle ON public.kitchen_battle_participants(battle_id);
CREATE INDEX IF NOT EXISTS idx_kbv_battle ON public.kitchen_battle_votes(battle_id);

ALTER TABLE public.kitchen_battles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kitchen_battle_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kitchen_battle_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "kb_select_all" ON public.kitchen_battles FOR SELECT TO authenticated USING (true);
CREATE POLICY "kb_insert_own" ON public.kitchen_battles FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

CREATE POLICY "kbp_select_all" ON public.kitchen_battle_participants FOR SELECT TO authenticated USING (true);
CREATE POLICY "kbp_insert_own" ON public.kitchen_battle_participants FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "kbp_update_own_meta" ON public.kitchen_battle_participants FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id AND vote_count = (SELECT vote_count FROM public.kitchen_battle_participants WHERE id = kitchen_battle_participants.id));

CREATE POLICY "kbv_select_own" ON public.kitchen_battle_votes FOR SELECT TO authenticated USING (auth.uid() = voter_id);

CREATE TRIGGER trg_kb_updated BEFORE UPDATE ON public.kitchen_battles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
