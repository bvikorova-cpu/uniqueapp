
-- Company profiles
CREATE TABLE public.company_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  cover_url TEXT,
  website TEXT,
  industry TEXT,
  size TEXT,
  founded_year INTEGER,
  headquarters TEXT,
  description TEXT,
  mission TEXT,
  perks TEXT[],
  tech_stack TEXT[],
  social_links JSONB DEFAULT '{}'::jsonb,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  followers_count INTEGER NOT NULL DEFAULT 0,
  rating_avg NUMERIC(3,2) NOT NULL DEFAULT 0,
  reviews_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.company_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Companies viewable by all" ON public.company_profiles FOR SELECT USING (true);
CREATE POLICY "Owner can insert company" ON public.company_profiles FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owner can update company" ON public.company_profiles FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Owner can delete company" ON public.company_profiles FOR DELETE USING (auth.uid() = owner_id);
CREATE INDEX idx_company_profiles_slug ON public.company_profiles(slug);

-- Company reviews
CREATE TABLE public.company_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.company_profiles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  rating_work_life SMALLINT CHECK (rating_work_life BETWEEN 1 AND 5),
  rating_salary SMALLINT CHECK (rating_salary BETWEEN 1 AND 5),
  rating_career SMALLINT CHECK (rating_career BETWEEN 1 AND 5),
  rating_management SMALLINT CHECK (rating_management BETWEEN 1 AND 5),
  rating_culture SMALLINT CHECK (rating_culture BETWEEN 1 AND 5),
  title TEXT NOT NULL,
  pros TEXT,
  cons TEXT,
  advice TEXT,
  employment_status TEXT,
  job_title TEXT,
  is_anonymous BOOLEAN NOT NULL DEFAULT true,
  helpful_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.company_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reviews viewable by all" ON public.company_reviews FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert review" ON public.company_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "User can update own review" ON public.company_reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "User can delete own review" ON public.company_reviews FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX idx_company_reviews_company ON public.company_reviews(company_id);

-- Salary reports
CREATE TABLE public.salary_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  company_id UUID REFERENCES public.company_profiles(id) ON DELETE SET NULL,
  company_name TEXT NOT NULL,
  job_title TEXT NOT NULL,
  location TEXT,
  country TEXT,
  years_experience NUMERIC(4,1) NOT NULL DEFAULT 0,
  base_salary NUMERIC(12,2) NOT NULL,
  bonus NUMERIC(12,2) NOT NULL DEFAULT 0,
  equity NUMERIC(12,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'EUR',
  employment_type TEXT,
  is_anonymous BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.salary_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Salaries viewable by all" ON public.salary_reports FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert salary" ON public.salary_reports FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "User can update own salary" ON public.salary_reports FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "User can delete own salary" ON public.salary_reports FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX idx_salary_reports_title ON public.salary_reports(job_title);
CREATE INDEX idx_salary_reports_company ON public.salary_reports(company_id);

-- Interview questions
CREATE TABLE public.interview_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  company_id UUID REFERENCES public.company_profiles(id) ON DELETE SET NULL,
  company_name TEXT,
  job_title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  difficulty TEXT NOT NULL DEFAULT 'medium',
  question TEXT NOT NULL,
  answer_tips TEXT,
  was_asked BOOLEAN NOT NULL DEFAULT true,
  upvotes INTEGER NOT NULL DEFAULT 0,
  is_anonymous BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.interview_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Interview Qs viewable by all" ON public.interview_questions FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert Q" ON public.interview_questions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "User can update own Q" ON public.interview_questions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "User can delete own Q" ON public.interview_questions FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX idx_interview_questions_company ON public.interview_questions(company_id);

-- Updated-at triggers
CREATE TRIGGER company_profiles_updated_at BEFORE UPDATE ON public.company_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER company_reviews_updated_at BEFORE UPDATE ON public.company_reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Maintain rating average + counts on company_profiles
CREATE OR REPLACE FUNCTION public.refresh_company_rating()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  cid UUID;
BEGIN
  cid := COALESCE(NEW.company_id, OLD.company_id);
  UPDATE public.company_profiles cp SET
    reviews_count = (SELECT COUNT(*) FROM public.company_reviews WHERE company_id = cid),
    rating_avg    = COALESCE((SELECT ROUND(AVG(rating)::numeric, 2) FROM public.company_reviews WHERE company_id = cid), 0)
  WHERE cp.id = cid;
  RETURN NULL;
END $$;

CREATE TRIGGER trg_refresh_company_rating
AFTER INSERT OR UPDATE OR DELETE ON public.company_reviews
FOR EACH ROW EXECUTE FUNCTION public.refresh_company_rating();
