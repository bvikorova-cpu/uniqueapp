-- Create table for corporate event inquiries
CREATE TABLE public.corporate_inquiries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  package_type TEXT NOT NULL,
  event_type TEXT,
  expected_attendees INTEGER,
  event_date DATE,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'contacted', 'in_progress', 'completed', 'cancelled'))
);

-- Enable RLS
ALTER TABLE public.corporate_inquiries ENABLE ROW LEVEL SECURITY;

-- Users can view their own inquiries
CREATE POLICY "Users can view their own inquiries"
ON public.corporate_inquiries
FOR SELECT
USING (auth.uid() = user_id);

-- Anyone can create an inquiry (even without login)
CREATE POLICY "Anyone can create inquiries"
ON public.corporate_inquiries
FOR INSERT
WITH CHECK (true);

-- Only authenticated users can update their own inquiries
CREATE POLICY "Users can update their own inquiries"
ON public.corporate_inquiries
FOR UPDATE
USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_corporate_inquiries_user_id ON public.corporate_inquiries(user_id);
CREATE INDEX idx_corporate_inquiries_status ON public.corporate_inquiries(status);
CREATE INDEX idx_corporate_inquiries_created_at ON public.corporate_inquiries(created_at DESC);

-- Create trigger for updated_at
CREATE TRIGGER update_corporate_inquiries_updated_at
  BEFORE UPDATE ON public.corporate_inquiries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();