-- Mystery badge events
CREATE TABLE public.mystery_badge_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  emoji TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  hint TEXT NOT NULL,
  rarity TEXT NOT NULL DEFAULT 'rare',
  status TEXT NOT NULL DEFAULT 'active',
  active_from TIMESTAMPTZ NOT NULL DEFAULT now(),
  active_until TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '30 days'),
  reward_xp INTEGER NOT NULL DEFAULT 500,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.mystery_badge_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view mystery events"
ON public.mystery_badge_events FOR SELECT
TO authenticated
USING (true);

CREATE INDEX idx_mystery_events_active ON public.mystery_badge_events(status, active_until);

-- AI history for rewards coaches
CREATE TABLE public.rewards_ai_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  action TEXT NOT NULL,
  input JSONB NOT NULL DEFAULT '{}'::jsonb,
  result TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.rewards_ai_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own ai history"
ON public.rewards_ai_history FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users insert own ai history"
ON public.rewards_ai_history FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_rewards_ai_history_user ON public.rewards_ai_history(user_id, action, created_at DESC);

-- Seed initial mystery events
INSERT INTO public.mystery_badge_events (emoji, title, description, hint, rarity, reward_xp, active_until) VALUES
('🌙', 'Night Owl', 'Active during the witching hour', 'When the world sleeps, you create…', 'epic', 750, now() + interval '30 days'),
('🔥', 'Streak Phoenix', 'Rise from a broken streak', 'Fall, then climb higher than before…', 'legendary', 1500, now() + interval '30 days'),
('💬', 'Echo Chamber', 'Spark conversation across hubs', 'Your words travel further than you think…', 'rare', 500, now() + interval '30 days');

-- Monthly rotation cron
CREATE OR REPLACE FUNCTION public.rotate_mystery_events()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_pool jsonb := '[
    {"emoji":"🌙","title":"Night Owl","description":"Active during the witching hour","hint":"When the world sleeps, you create…","rarity":"epic","xp":750},
    {"emoji":"🔥","title":"Streak Phoenix","description":"Rise from a broken streak","hint":"Fall, then climb higher than before…","rarity":"legendary","xp":1500},
    {"emoji":"💬","title":"Echo Chamber","description":"Spark conversation across hubs","hint":"Your words travel further than you think…","rarity":"rare","xp":500},
    {"emoji":"🎭","title":"Shape Shifter","description":"Try every hub in a single day","hint":"A jack of all trades, master of none — yet legendary still","rarity":"epic","xp":800},
    {"emoji":"⚡","title":"Lightning Reflex","description":"Reply within 60 seconds, 10 times","hint":"Speed is your signature","rarity":"rare","xp":600},
    {"emoji":"🌌","title":"Cosmic Wanderer","description":"Explore 5 different communities","hint":"The stars guide those who roam","rarity":"epic","xp":900},
    {"emoji":"🎨","title":"Hidden Artist","description":"Create without showing your face","hint":"Let your work speak louder than your image","rarity":"rare","xp":550},
    {"emoji":"👑","title":"Silent King","description":"Top contributor with zero self-promotion","hint":"True royalty needs no crown announcement","rarity":"legendary","xp":1800}
  ]'::jsonb;
  v_count int;
  v_chosen jsonb;
  i int;
BEGIN
  -- Deactivate expired
  UPDATE public.mystery_badge_events
  SET status = 'expired'
  WHERE status = 'active' AND active_until < now();

  -- Skip if 3 already active
  SELECT count(*) INTO v_count FROM public.mystery_badge_events WHERE status = 'active';
  IF v_count >= 3 THEN RETURN; END IF;

  -- Insert random new events to reach 3
  FOR i IN 1..(3 - v_count) LOOP
    v_chosen := v_pool -> floor(random() * jsonb_array_length(v_pool))::int;
    INSERT INTO public.mystery_badge_events (emoji, title, description, hint, rarity, reward_xp, active_until)
    VALUES (
      v_chosen->>'emoji',
      v_chosen->>'title',
      v_chosen->>'description',
      v_chosen->>'hint',
      v_chosen->>'rarity',
      (v_chosen->>'xp')::int,
      now() + interval '30 days'
    );
  END LOOP;
END;
$$;

-- Schedule monthly rotation (1st of each month)
SELECT cron.schedule(
  'rotate-mystery-events-monthly',
  '0 0 1 * *',
  $$ SELECT public.rotate_mystery_events(); $$
);