-- Add instructor profile table
CREATE TABLE public.instructor_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  bio TEXT,
  expertise TEXT[],
  profile_image_url TEXT,
  total_students INTEGER DEFAULT 0,
  total_revenue DECIMAL(10,2) DEFAULT 0,
  stripe_account_id TEXT,
  stripe_onboarding_complete BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add course purchases table
CREATE TABLE public.course_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  instructor_amount DECIMAL(10,2) NOT NULL,
  platform_fee DECIMAL(10,2) NOT NULL,
  stripe_payment_id TEXT,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'refunded')),
  purchased_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(course_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE public.instructor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_purchases ENABLE ROW LEVEL SECURITY;

-- Policies for instructor_profiles
CREATE POLICY "Users can view all instructor profiles"
  ON public.instructor_profiles
  FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own instructor profile"
  ON public.instructor_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own instructor profile"
  ON public.instructor_profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policies for course_purchases
CREATE POLICY "Users can view their own purchases"
  ON public.course_purchases
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Instructors can view purchases of their courses"
  ON public.course_purchases
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.courses
      WHERE id = course_id AND creator_id = auth.uid()
    )
  );

CREATE POLICY "Users can create purchases"
  ON public.course_purchases
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_instructor_profiles_user_id ON public.instructor_profiles(user_id);
CREATE INDEX idx_course_purchases_course_id ON public.course_purchases(course_id);
CREATE INDEX idx_course_purchases_user_id ON public.course_purchases(user_id);
CREATE INDEX idx_course_purchases_status ON public.course_purchases(status);

-- Create function to update instructor profile timestamps
CREATE OR REPLACE FUNCTION public.update_instructor_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_instructor_profiles_updated_at
  BEFORE UPDATE ON public.instructor_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_instructor_profiles_updated_at();

-- Function to update instructor earnings
CREATE OR REPLACE FUNCTION public.update_instructor_earnings()
RETURNS TRIGGER AS $$
DECLARE
  v_instructor_id UUID;
BEGIN
  -- Get instructor ID from course
  SELECT creator_id INTO v_instructor_id
  FROM public.courses
  WHERE id = NEW.course_id;

  -- Update instructor profile
  UPDATE public.instructor_profiles
  SET 
    total_students = total_students + 1,
    total_revenue = total_revenue + NEW.instructor_amount,
    updated_at = now()
  WHERE user_id = v_instructor_id;

  -- Update course enrollment count
  UPDATE public.courses
  SET total_enrollments = total_enrollments + 1
  WHERE id = NEW.course_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger to update earnings on purchase
CREATE TRIGGER update_earnings_on_purchase
  AFTER INSERT ON public.course_purchases
  FOR EACH ROW
  EXECUTE FUNCTION public.update_instructor_earnings();