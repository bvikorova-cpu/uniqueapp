-- Create horse shop purchases table
CREATE TABLE public.horse_shop_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  item_id TEXT NOT NULL,
  horse_id UUID,
  cost_coins INTEGER DEFAULT 0,
  cost_gems INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.horse_shop_purchases ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own purchases" ON public.horse_shop_purchases FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own purchases" ON public.horse_shop_purchases FOR INSERT WITH CHECK (auth.uid() = user_id);