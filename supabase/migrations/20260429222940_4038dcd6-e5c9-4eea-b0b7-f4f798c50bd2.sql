-- Kids Drawing Credits
CREATE TABLE IF NOT EXISTS public.kids_drawing_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  credits_remaining INTEGER NOT NULL DEFAULT 0,
  total_credits_purchased INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.kids_drawing_credits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own drawing credits" ON public.kids_drawing_credits
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own drawing credits" ON public.kids_drawing_credits
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own drawing credits" ON public.kids_drawing_credits
  FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER update_kids_drawing_credits_updated_at
  BEFORE UPDATE ON public.kids_drawing_credits
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Kids Reading Credits
CREATE TABLE IF NOT EXISTS public.kids_reading_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  credits_remaining INTEGER NOT NULL DEFAULT 0,
  total_credits_purchased INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.kids_reading_credits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own reading credits" ON public.kids_reading_credits
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own reading credits" ON public.kids_reading_credits
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own reading credits" ON public.kids_reading_credits
  FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER update_kids_reading_credits_updated_at
  BEFORE UPDATE ON public.kids_reading_credits
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Kids Story Credits
CREATE TABLE IF NOT EXISTS public.kids_story_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  credits_remaining INTEGER NOT NULL DEFAULT 0,
  total_credits_purchased INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.kids_story_credits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own story credits" ON public.kids_story_credits
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own story credits" ON public.kids_story_credits
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own story credits" ON public.kids_story_credits
  FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER update_kids_story_credits_updated_at
  BEFORE UPDATE ON public.kids_story_credits
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();