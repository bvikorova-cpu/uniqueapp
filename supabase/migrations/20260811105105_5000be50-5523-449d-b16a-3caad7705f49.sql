CREATE TABLE public.horse_bloodlines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  horse_id uuid NOT NULL REFERENCES public.horses(id) ON DELETE CASCADE,
  parent_id uuid NOT NULL REFERENCES public.horses(id) ON DELETE CASCADE,
  parent_role text NOT NULL DEFAULT 'sire',
  generation integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (horse_id, parent_id, generation)
);

CREATE INDEX idx_horse_bloodlines_horse ON public.horse_bloodlines(horse_id, generation);
CREATE INDEX idx_horse_bloodlines_parent ON public.horse_bloodlines(parent_id);

GRANT SELECT, INSERT ON public.horse_bloodlines TO authenticated;
GRANT ALL ON public.horse_bloodlines TO service_role;

ALTER TABLE public.horse_bloodlines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view bloodlines of their own horses"
ON public.horse_bloodlines FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.horses h WHERE h.id = horse_bloodlines.horse_id AND h.user_id = auth.uid()));

CREATE POLICY "Users insert bloodlines for their own horses"
ON public.horse_bloodlines FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.horses h WHERE h.id = horse_bloodlines.horse_id AND h.user_id = auth.uid()));

CREATE TRIGGER update_horse_bloodlines_updated_at
BEFORE UPDATE ON public.horse_bloodlines
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();