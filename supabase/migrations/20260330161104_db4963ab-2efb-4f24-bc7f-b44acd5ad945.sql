CREATE TABLE IF NOT EXISTS public.travel_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  destination text NOT NULL,
  duration_days integer NOT NULL DEFAULT 3,
  plan_data jsonb NOT NULL DEFAULT '{}',
  interests text[] DEFAULT '{}',
  budget_level text DEFAULT 'medium',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.travel_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own travel plans" ON public.travel_plans FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.virtual_postcards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  destination text NOT NULL,
  message text NOT NULL,
  recipient_name text NOT NULL,
  postcard_image_url text,
  postcard_text text,
  style text DEFAULT 'classic',
  credits_used integer DEFAULT 10,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.virtual_postcards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own postcards" ON public.virtual_postcards FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.explorer_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  achievement_code text NOT NULL,
  achievement_name text NOT NULL,
  achievement_description text,
  icon text DEFAULT '🏆',
  earned_at timestamptz DEFAULT now(),
  UNIQUE(user_id, achievement_code)
);
ALTER TABLE public.explorer_achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own achievements" ON public.explorer_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own achievements" ON public.explorer_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);