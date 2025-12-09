-- Create tutoring_credits table for tracking user credits
CREATE TABLE public.tutoring_credits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  credits_remaining INTEGER NOT NULL DEFAULT 0,
  total_credits_purchased INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tutoring_credits ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own credits" 
ON public.tutoring_credits 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own credits" 
ON public.tutoring_credits 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own credits" 
ON public.tutoring_credits 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Add unique constraint on user_id
ALTER TABLE public.tutoring_credits ADD CONSTRAINT tutoring_credits_user_id_unique UNIQUE (user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_tutoring_credits_updated_at
BEFORE UPDATE ON public.tutoring_credits
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();