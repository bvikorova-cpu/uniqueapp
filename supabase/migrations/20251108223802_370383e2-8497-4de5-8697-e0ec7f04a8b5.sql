-- Create table for user job preferences
CREATE TABLE IF NOT EXISTS public.user_job_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  categories TEXT[] DEFAULT '{}',
  job_types TEXT[] DEFAULT '{}',
  locations TEXT[] DEFAULT '{}',
  min_salary INTEGER,
  max_salary INTEGER,
  notify_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_job_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own job preferences"
  ON public.user_job_preferences
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own job preferences"
  ON public.user_job_preferences
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own job preferences"
  ON public.user_job_preferences
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own job preferences"
  ON public.user_job_preferences
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to update updated_at
CREATE OR REPLACE FUNCTION public.update_job_preferences_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for timestamp
CREATE TRIGGER update_job_preferences_updated_at
  BEFORE UPDATE ON public.user_job_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_job_preferences_timestamp();

-- Function to notify users about matching jobs
CREATE OR REPLACE FUNCTION public.notify_matching_job_preferences()
RETURNS TRIGGER AS $$
DECLARE
  v_preference RECORD;
BEGIN
  -- Only process for new active jobs
  IF NEW.status = 'active' THEN
    -- Find all users with matching preferences
    FOR v_preference IN
      SELECT DISTINCT user_id
      FROM public.user_job_preferences
      WHERE notify_enabled = true
        AND user_id != NEW.employer_id -- Don't notify the employer who posted the job
        AND (
          -- Match categories (if user has category preferences)
          (categories IS NULL OR categories = '{}' OR NEW.category = ANY(categories))
        )
        AND (
          -- Match job types (if user has job type preferences)
          (job_types IS NULL OR job_types = '{}' OR NEW.job_type = ANY(job_types))
        )
        AND (
          -- Match locations (if user has location preferences)
          (locations IS NULL OR locations = '{}' OR NEW.location = ANY(locations))
        )
        AND (
          -- Match salary range (if user has salary preferences)
          (min_salary IS NULL OR NEW.salary_max >= min_salary)
          AND (max_salary IS NULL OR NEW.salary_min <= max_salary)
        )
    LOOP
      -- Create notification for matching user
      INSERT INTO public.notifications (user_id, actor_id, type, post_id)
      VALUES (v_preference.user_id, NEW.employer_id, 'job_match', NEW.id);
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new job listings
CREATE TRIGGER notify_on_new_job
  AFTER INSERT ON public.job_listings
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_matching_job_preferences();