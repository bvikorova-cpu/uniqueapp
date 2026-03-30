-- Brand voices table for Brand Voice Training
CREATE TABLE public.brand_voices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  brand_name TEXT NOT NULL,
  tone TEXT NOT NULL,
  style_notes TEXT,
  sample_content TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.brand_voices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own brand voices" ON public.brand_voices
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Content calendar table
CREATE TABLE public.content_calendar (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content_type TEXT NOT NULL DEFAULT 'Post',
  platform TEXT NOT NULL DEFAULT 'Instagram',
  scheduled_date TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'planned',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.content_calendar ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own calendar entries" ON public.content_calendar
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);