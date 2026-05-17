
CREATE TABLE public.kids_academy_xp (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL,
  child_id UUID NOT NULL,
  total_xp INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  last_activity_date DATE,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(child_id)
);
ALTER TABLE public.kids_academy_xp ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Parent reads own children XP" ON public.kids_academy_xp FOR SELECT USING (auth.uid() = parent_id);
CREATE POLICY "Parent writes own children XP" ON public.kids_academy_xp FOR ALL USING (auth.uid() = parent_id) WITH CHECK (auth.uid() = parent_id);

CREATE TABLE public.kids_academy_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL,
  child_id UUID NOT NULL,
  section TEXT NOT NULL,
  action TEXT NOT NULL,
  xp_earned INTEGER NOT NULL DEFAULT 0,
  meta JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.kids_academy_activity_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Parent reads own activity log" ON public.kids_academy_activity_log FOR SELECT USING (auth.uid() = parent_id);
CREATE POLICY "Parent inserts own activity log" ON public.kids_academy_activity_log FOR INSERT WITH CHECK (auth.uid() = parent_id);
CREATE INDEX idx_kids_academy_activity_child_date ON public.kids_academy_activity_log(child_id, created_at DESC);

CREATE TABLE public.kids_academy_daily_plan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL,
  child_id UUID NOT NULL,
  plan_date DATE NOT NULL,
  plan_json JSONB NOT NULL,
  completed_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(child_id, plan_date)
);
ALTER TABLE public.kids_academy_daily_plan ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Parent reads own daily plan" ON public.kids_academy_daily_plan FOR SELECT USING (auth.uid() = parent_id);
CREATE POLICY "Parent writes own daily plan" ON public.kids_academy_daily_plan FOR ALL USING (auth.uid() = parent_id) WITH CHECK (auth.uid() = parent_id);

CREATE TABLE public.kids_academy_parent_digest (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL,
  week_start DATE NOT NULL,
  summary_json JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(parent_id, week_start)
);
ALTER TABLE public.kids_academy_parent_digest ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Parent reads own digest" ON public.kids_academy_parent_digest FOR SELECT USING (auth.uid() = parent_id);
CREATE POLICY "Parent writes own digest" ON public.kids_academy_parent_digest FOR ALL USING (auth.uid() = parent_id) WITH CHECK (auth.uid() = parent_id);

CREATE TABLE public.kids_academy_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  credits_remaining INTEGER NOT NULL DEFAULT 0,
  total_credits_purchased INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.kids_academy_credits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User reads own credits" ON public.kids_academy_credits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "User writes own credits" ON public.kids_academy_credits FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER trg_kids_xp_updated BEFORE UPDATE ON public.kids_academy_xp FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_kids_academy_credits_updated BEFORE UPDATE ON public.kids_academy_credits FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
