-- Create table to store clone chat messages
CREATE TABLE public.clone_chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  clone_id UUID NOT NULL REFERENCES public.personality_clones(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table to track daily AI response limits
CREATE TABLE public.clone_chat_daily_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  responses_used INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Enable RLS
ALTER TABLE public.clone_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clone_chat_daily_limits ENABLE ROW LEVEL SECURITY;

-- RLS policies for clone_chat_messages
CREATE POLICY "Users can view their own messages" 
ON public.clone_chat_messages 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own messages" 
ON public.clone_chat_messages 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- RLS policies for clone_chat_daily_limits
CREATE POLICY "Users can view their own limits" 
ON public.clone_chat_daily_limits 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own limits" 
ON public.clone_chat_daily_limits 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own limits" 
ON public.clone_chat_daily_limits 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_clone_chat_messages_user_clone ON public.clone_chat_messages(user_id, clone_id);
CREATE INDEX idx_clone_chat_daily_limits_user_date ON public.clone_chat_daily_limits(user_id, date);