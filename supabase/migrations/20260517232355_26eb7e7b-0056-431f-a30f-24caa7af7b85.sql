
CREATE TABLE public.past_life_soul_origins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  birth_date DATE,
  origin_dimension TEXT,
  origin_era TEXT,
  soul_archetype TEXT,
  narrative TEXT,
  credits_used INTEGER NOT NULL DEFAULT 6,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.past_life_karmic_debts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  birth_date DATE,
  debts JSONB NOT NULL DEFAULT '[]'::jsonb,
  resolution_plan TEXT,
  credits_used INTEGER NOT NULL DEFAULT 6,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.past_life_reincarnation_timelines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  birth_date DATE,
  timeline JSONB NOT NULL DEFAULT '[]'::jsonb,
  overall_arc TEXT,
  credits_used INTEGER NOT NULL DEFAULT 6,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.past_life_soul_tribes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  birth_date DATE,
  members JSONB NOT NULL DEFAULT '[]'::jsonb,
  tribe_mission TEXT,
  credits_used INTEGER NOT NULL DEFAULT 6,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.past_life_lesson_workbooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  focus_area TEXT,
  plan JSONB NOT NULL DEFAULT '[]'::jsonb,
  affirmation TEXT,
  credits_used INTEGER NOT NULL DEFAULT 6,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.past_life_animal_elementals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  birth_date DATE,
  form TEXT,
  habitat TEXT,
  story TEXT,
  gift_today TEXT,
  credits_used INTEGER NOT NULL DEFAULT 6,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.past_life_famous_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  birth_date DATE,
  figure_name TEXT,
  figure_era TEXT,
  resonance_score INTEGER,
  reasoning TEXT,
  credits_used INTEGER NOT NULL DEFAULT 6,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.past_life_death_reflections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  birth_date DATE,
  cause TEXT,
  emotional_imprint TEXT,
  unfinished_business TEXT,
  healing_message TEXT,
  credits_used INTEGER NOT NULL DEFAULT 6,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.past_life_soul_origins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.past_life_karmic_debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.past_life_reincarnation_timelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.past_life_soul_tribes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.past_life_lesson_workbooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.past_life_animal_elementals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.past_life_famous_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.past_life_death_reflections ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'past_life_soul_origins',
    'past_life_karmic_debts',
    'past_life_reincarnation_timelines',
    'past_life_soul_tribes',
    'past_life_lesson_workbooks',
    'past_life_animal_elementals',
    'past_life_famous_matches',
    'past_life_death_reflections'
  ] LOOP
    EXECUTE format('CREATE POLICY "own_select_%I" ON public.%I FOR SELECT USING (auth.uid() = user_id)', t, t);
    EXECUTE format('CREATE POLICY "own_insert_%I" ON public.%I FOR INSERT WITH CHECK (auth.uid() = user_id)', t, t);
    EXECUTE format('CREATE POLICY "own_update_%I" ON public.%I FOR UPDATE USING (auth.uid() = user_id)', t, t);
    EXECUTE format('CREATE POLICY "own_delete_%I" ON public.%I FOR DELETE USING (auth.uid() = user_id)', t, t);
    EXECUTE format('CREATE INDEX idx_%I_user ON public.%I(user_id, created_at DESC)', t, t);
  END LOOP;
END $$;
