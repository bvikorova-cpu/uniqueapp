
-- ============ brain_duel_records ============
CREATE TABLE IF NOT EXISTS public.brain_duel_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  kind TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  parent_id UUID,
  is_public BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS brain_duel_records_kind_idx ON public.brain_duel_records(kind);
CREATE INDEX IF NOT EXISTS brain_duel_records_user_idx ON public.brain_duel_records(user_id);
CREATE INDEX IF NOT EXISTS brain_duel_records_parent_idx ON public.brain_duel_records(parent_id);

ALTER TABLE public.brain_duel_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "brain_duel_records_select_public_or_own"
ON public.brain_duel_records FOR SELECT
USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "brain_duel_records_insert_own"
ON public.brain_duel_records FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "brain_duel_records_update_own"
ON public.brain_duel_records FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "brain_duel_records_delete_own"
ON public.brain_duel_records FOR DELETE
USING (auth.uid() = user_id);

-- ============ brain_duel_elo ============
CREATE TABLE IF NOT EXISTS public.brain_duel_elo (
  user_id UUID PRIMARY KEY,
  rating INTEGER NOT NULL DEFAULT 1000,
  tier TEXT NOT NULL DEFAULT 'iron',
  wins INTEGER NOT NULL DEFAULT 0,
  losses INTEGER NOT NULL DEFAULT 0,
  draws INTEGER NOT NULL DEFAULT 0,
  peak_rating INTEGER NOT NULL DEFAULT 1000,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS brain_duel_elo_rating_idx ON public.brain_duel_elo(rating DESC);

ALTER TABLE public.brain_duel_elo ENABLE ROW LEVEL SECURITY;

CREATE POLICY "brain_duel_elo_select_all"
ON public.brain_duel_elo FOR SELECT USING (true);

CREATE POLICY "brain_duel_elo_insert_own"
ON public.brain_duel_elo FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "brain_duel_elo_update_own"
ON public.brain_duel_elo FOR UPDATE
USING (auth.uid() = user_id);

-- ============ brain_duel_srs_cards ============
CREATE TABLE IF NOT EXISTS public.brain_duel_srs_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  topic TEXT,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  stage TEXT NOT NULL DEFAULT 'new',
  ease NUMERIC NOT NULL DEFAULT 2.5,
  interval_days INTEGER NOT NULL DEFAULT 1,
  next_review_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_review_at TIMESTAMPTZ,
  review_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS brain_duel_srs_user_due_idx ON public.brain_duel_srs_cards(user_id, next_review_at);

ALTER TABLE public.brain_duel_srs_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "brain_duel_srs_select_own"
ON public.brain_duel_srs_cards FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "brain_duel_srs_insert_own"
ON public.brain_duel_srs_cards FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "brain_duel_srs_update_own"
ON public.brain_duel_srs_cards FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "brain_duel_srs_delete_own"
ON public.brain_duel_srs_cards FOR DELETE
USING (auth.uid() = user_id);

-- ============ brain_duel_topics ============
CREATE TABLE IF NOT EXISTS public.brain_duel_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  member_count INTEGER NOT NULL DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.brain_duel_topics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "brain_duel_topics_select_all"
ON public.brain_duel_topics FOR SELECT USING (true);

CREATE POLICY "brain_duel_topics_insert_authed"
ON public.brain_duel_topics FOR INSERT
WITH CHECK (auth.uid() = created_by);

-- ============ updated_at trigger reuse ============
CREATE OR REPLACE FUNCTION public.brain_duel_touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS brain_duel_records_touch ON public.brain_duel_records;
CREATE TRIGGER brain_duel_records_touch BEFORE UPDATE ON public.brain_duel_records
FOR EACH ROW EXECUTE FUNCTION public.brain_duel_touch_updated_at();

DROP TRIGGER IF EXISTS brain_duel_elo_touch ON public.brain_duel_elo;
CREATE TRIGGER brain_duel_elo_touch BEFORE UPDATE ON public.brain_duel_elo
FOR EACH ROW EXECUTE FUNCTION public.brain_duel_touch_updated_at();
