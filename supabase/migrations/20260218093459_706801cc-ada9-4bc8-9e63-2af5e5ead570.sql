
-- Table for personalized fitness plans
CREATE TABLE public.fitness_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('weekly', 'monthly')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'generating', 'completed', 'failed')),
  stripe_session_id TEXT,
  payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid')),
  -- User profile data
  age INTEGER,
  gender TEXT,
  height_cm INTEGER,
  weight_kg NUMERIC,
  target_weight_kg NUMERIC,
  activity_level TEXT,
  fitness_goal TEXT,
  dietary_restrictions TEXT[],
  health_conditions TEXT[],
  -- Generated plan
  workout_plan JSONB,
  meal_plan JSONB,
  summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.fitness_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own fitness plans"
  ON public.fitness_plans FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own fitness plans"
  ON public.fitness_plans FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own fitness plans"
  ON public.fitness_plans FOR UPDATE USING (auth.uid() = user_id);

-- Service role needs to update plans after generation
CREATE POLICY "Service role full access to fitness plans"
  ON public.fitness_plans FOR ALL USING (true) WITH CHECK (true);
