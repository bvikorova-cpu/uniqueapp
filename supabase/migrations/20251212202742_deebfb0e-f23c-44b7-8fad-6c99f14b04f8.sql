-- Create creator_gifts table (available gifts)
CREATE TABLE public.creator_gifts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  icon TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create creator_gift_transactions table (gift history)
CREATE TABLE public.creator_gift_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL,
  creator_id UUID NOT NULL,
  gift_id UUID REFERENCES public.creator_gifts(id),
  amount NUMERIC NOT NULL,
  platform_fee NUMERIC NOT NULL,
  creator_payout NUMERIC NOT NULL,
  message TEXT,
  stripe_session_id TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.creator_gifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_gift_transactions ENABLE ROW LEVEL SECURITY;

-- Policies for creator_gifts (public read)
CREATE POLICY "Anyone can view active gifts" ON public.creator_gifts
  FOR SELECT USING (is_active = true);

-- Policies for creator_gift_transactions
CREATE POLICY "Users can view their sent gifts" ON public.creator_gift_transactions
  FOR SELECT USING (auth.uid() = sender_id);

CREATE POLICY "Creators can view received gifts" ON public.creator_gift_transactions
  FOR SELECT USING (auth.uid() = creator_id);

CREATE POLICY "Authenticated users can send gifts" ON public.creator_gift_transactions
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Insert default gifts
INSERT INTO public.creator_gifts (name, description, price, icon) VALUES
  ('Heart', 'Show some love', 5, '❤️'),
  ('Star', 'You are a star!', 10, '⭐'),
  ('Fire', 'Hot content!', 15, '🔥'),
  ('Trophy', 'Champion creator', 25, '🏆'),
  ('Crown', 'Royal treatment', 50, '👑'),
  ('Diamond', 'Premium appreciation', 100, '💎');