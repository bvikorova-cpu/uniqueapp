
ALTER TABLE public.dating_profiles
  ADD COLUMN IF NOT EXISTS video_prompts jsonb DEFAULT '[]'::jsonb;

ALTER TABLE public.dating_messages
  ADD COLUMN IF NOT EXISTS voice_url text,
  ADD COLUMN IF NOT EXISTS voice_duration integer;

CREATE TABLE IF NOT EXISTS public.dating_date_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid NOT NULL REFERENCES public.dating_matches(id) ON DELETE CASCADE,
  proposed_by uuid NOT NULL,
  title text NOT NULL,
  location text,
  scheduled_at timestamptz NOT NULL,
  mode text NOT NULL DEFAULT 'in_person' CHECK (mode IN ('in_person','virtual')),
  status text NOT NULL DEFAULT 'proposed' CHECK (status IN ('proposed','accepted','declined','completed','canceled')),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.dating_date_plans TO authenticated;
GRANT ALL ON public.dating_date_plans TO service_role;

ALTER TABLE public.dating_date_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Match participants can view date plans"
  ON public.dating_date_plans FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.dating_matches m
    WHERE m.id = dating_date_plans.match_id
      AND (m.user1_id = auth.uid() OR m.user2_id = auth.uid())
  ));

CREATE POLICY "Match participants can create date plans"
  ON public.dating_date_plans FOR INSERT TO authenticated
  WITH CHECK (
    proposed_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.dating_matches m
      WHERE m.id = dating_date_plans.match_id
        AND (m.user1_id = auth.uid() OR m.user2_id = auth.uid())
    )
  );

CREATE POLICY "Match participants can update date plans"
  ON public.dating_date_plans FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.dating_matches m
    WHERE m.id = dating_date_plans.match_id
      AND (m.user1_id = auth.uid() OR m.user2_id = auth.uid())
  ));

CREATE POLICY "Proposer can delete own date plan"
  ON public.dating_date_plans FOR DELETE TO authenticated
  USING (proposed_by = auth.uid());

CREATE TRIGGER trg_dating_date_plans_updated_at
  BEFORE UPDATE ON public.dating_date_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_dating_date_plans_match ON public.dating_date_plans(match_id, scheduled_at DESC);
