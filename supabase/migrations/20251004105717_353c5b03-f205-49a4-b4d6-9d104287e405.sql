-- Create enum for user roles if not exists
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user', 'employer');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create job categories enum
CREATE TYPE public.job_category AS ENUM (
  'it_software',
  'marketing_sales',
  'finance_accounting',
  'healthcare',
  'education',
  'engineering',
  'hospitality',
  'retail',
  'manufacturing',
  'construction',
  'transportation',
  'other'
);

-- Create job type enum
CREATE TYPE public.job_type AS ENUM (
  'full_time',
  'part_time',
  'contract',
  'internship',
  'remote'
);

-- Create job_listings table
CREATE TABLE public.job_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  company_name TEXT NOT NULL,
  location TEXT NOT NULL,
  country TEXT NOT NULL,
  category job_category NOT NULL,
  job_type job_type NOT NULL,
  salary_min NUMERIC,
  salary_max NUMERIC,
  salary_currency TEXT DEFAULT 'EUR',
  requirements TEXT,
  benefits TEXT,
  contact_email TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  views_count INTEGER DEFAULT 0,
  applications_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.job_listings ENABLE ROW LEVEL SECURITY;

-- Create job_applications table
CREATE TABLE public.job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.job_listings(id) ON DELETE CASCADE,
  applicant_id UUID NOT NULL,
  cover_letter TEXT,
  resume_url TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (job_id, applicant_id)
);

ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_roles
CREATE POLICY "Users can view all roles"
  ON public.user_roles
  FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own role"
  ON public.user_roles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for job_listings
CREATE POLICY "Anyone can view active job listings"
  ON public.job_listings
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Employers can create job listings"
  ON public.job_listings
  FOR INSERT
  WITH CHECK (
    auth.uid() = employer_id AND 
    public.has_role(auth.uid(), 'employer')
  );

CREATE POLICY "Employers can update their own job listings"
  ON public.job_listings
  FOR UPDATE
  USING (auth.uid() = employer_id);

CREATE POLICY "Employers can delete their own job listings"
  ON public.job_listings
  FOR DELETE
  USING (auth.uid() = employer_id);

-- RLS Policies for job_applications
CREATE POLICY "Authenticated users can create applications"
  ON public.job_applications
  FOR INSERT
  WITH CHECK (auth.uid() = applicant_id);

CREATE POLICY "Applicants can view their own applications"
  ON public.job_applications
  FOR SELECT
  USING (auth.uid() = applicant_id);

CREATE POLICY "Employers can view applications for their jobs"
  ON public.job_applications
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.job_listings
      WHERE job_listings.id = job_applications.job_id
        AND job_listings.employer_id = auth.uid()
    )
  );

CREATE POLICY "Employers can update application status"
  ON public.job_applications
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.job_listings
      WHERE job_listings.id = job_applications.job_id
        AND job_listings.employer_id = auth.uid()
    )
  );

-- Trigger to update job applications count
CREATE OR REPLACE FUNCTION public.update_job_applications_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.job_listings
    SET applications_count = applications_count + 1
    WHERE id = NEW.job_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.job_listings
    SET applications_count = applications_count - 1
    WHERE id = OLD.job_id;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER update_job_applications_count_trigger
AFTER INSERT OR DELETE ON public.job_applications
FOR EACH ROW
EXECUTE FUNCTION public.update_job_applications_count();

-- Trigger for updated_at
CREATE TRIGGER update_job_listings_updated_at
BEFORE UPDATE ON public.job_listings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_job_applications_updated_at
BEFORE UPDATE ON public.job_applications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();