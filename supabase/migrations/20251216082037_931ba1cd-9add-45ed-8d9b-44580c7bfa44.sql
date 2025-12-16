-- Create messenger AI credits table
CREATE TABLE public.messenger_ai_credits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  credits_remaining INTEGER NOT NULL DEFAULT 0,
  total_credits_purchased INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.messenger_ai_credits ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own credits" ON public.messenger_ai_credits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own credits" ON public.messenger_ai_credits
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own credits" ON public.messenger_ai_credits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_messenger_ai_credits_updated_at
  BEFORE UPDATE ON public.messenger_ai_credits
  FOR EACH ROW
  EXECUTE FUNCTION public.update_ai_credits_updated_at();