-- Secret Santa 365 Credits
CREATE TABLE public.secret_santa_credits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  credits_remaining INTEGER NOT NULL DEFAULT 0,
  total_credits_purchased INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Secret Santa 365 Gifts
CREATE TABLE public.secret_santa_gifts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL,
  recipient_id UUID NOT NULL,
  gift_type TEXT NOT NULL,
  gift_emoji TEXT NOT NULL,
  gift_value INTEGER NOT NULL,
  message TEXT,
  is_anonymous BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Secret Santa 365 Gift Stories (24h expiry)
CREATE TABLE public.secret_santa_stories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  gift_id UUID NOT NULL REFERENCES public.secret_santa_gifts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '24 hours')
);

-- Enable RLS
ALTER TABLE public.secret_santa_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.secret_santa_gifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.secret_santa_stories ENABLE ROW LEVEL SECURITY;

-- Credits policies
CREATE POLICY "Users can view their own credits" ON public.secret_santa_credits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own credits" ON public.secret_santa_credits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own credits" ON public.secret_santa_credits FOR UPDATE USING (auth.uid() = user_id);

-- Gifts policies
CREATE POLICY "Users can view gifts they sent or received" ON public.secret_santa_gifts FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);
CREATE POLICY "Authenticated users can send gifts" ON public.secret_santa_gifts FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Stories policies
CREATE POLICY "Anyone can view non-expired stories" ON public.secret_santa_stories FOR SELECT USING (expires_at > now());
CREATE POLICY "Users can share their received gifts" ON public.secret_santa_stories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own stories" ON public.secret_santa_stories FOR DELETE USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_secret_santa_credits_updated_at
BEFORE UPDATE ON public.secret_santa_credits
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();