-- Create table for MasterChef gifts
CREATE TABLE IF NOT EXISTS public.masterchef_gifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL CHECK (price > 0),
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create table for sent MasterChef gifts
CREATE TABLE IF NOT EXISTS public.masterchef_sent_gifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  chef_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  competition_id UUID,
  gift_id UUID NOT NULL REFERENCES public.masterchef_gifts(id) ON DELETE CASCADE,
  message TEXT,
  amount DECIMAL(10,2) NOT NULL,
  stripe_session_id TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.masterchef_gifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.masterchef_sent_gifts ENABLE ROW LEVEL SECURITY;

-- Policies for gifts (readable by everyone)
CREATE POLICY "Gifts are viewable by everyone"
ON public.masterchef_gifts
FOR SELECT
USING (is_active = true);

-- Policies for sent gifts
CREATE POLICY "Users can view gifts they sent"
ON public.masterchef_sent_gifts
FOR SELECT
USING (auth.uid() = sender_id);

CREATE POLICY "Chefs can view gifts they received"
ON public.masterchef_sent_gifts
FOR SELECT
USING (auth.uid() = chef_id);

CREATE POLICY "Users can insert their own gift sends"
ON public.masterchef_sent_gifts
FOR INSERT
WITH CHECK (auth.uid() = sender_id);

-- Insert default gifts
INSERT INTO public.masterchef_gifts (name, icon, price, description) VALUES
('Applause', '👏', 2.00, 'Show your appreciation'),
('Fire', '🔥', 5.00, 'This dish is on fire!'),
('Chef''s Hat', '👨‍🍳', 10.00, 'You''re a true chef!'),
('Golden Spoon', '🥄', 15.00, 'Legendary cooking'),
('Michelin Star', '⭐', 25.00, 'Michelin-worthy dish'),
('Trophy', '🏆', 50.00, 'Competition winner!'),
('Diamond Crown', '💎', 100.00, 'Ultimate masterpiece')
ON CONFLICT DO NOTHING;