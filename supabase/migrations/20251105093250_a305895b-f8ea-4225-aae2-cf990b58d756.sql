-- Create virtual gifts catalog table
CREATE TABLE IF NOT EXISTS public.virtual_gifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  price DECIMAL(10,2) NOT NULL,
  stripe_price_id TEXT,
  category TEXT DEFAULT 'general' CHECK (category IN ('hearts', 'stars', 'premium', 'exclusive', 'general')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create gifts sent table
CREATE TABLE IF NOT EXISTS public.creator_gifts_sent (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gift_id UUID REFERENCES public.virtual_gifts(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  recipient_creator_id UUID REFERENCES public.creator_profiles(id) ON DELETE CASCADE NOT NULL,
  message TEXT,
  amount_paid DECIMAL(10,2) NOT NULL,
  platform_fee DECIMAL(10,2) NOT NULL,
  creator_earning DECIMAL(10,2) NOT NULL,
  stripe_payment_intent_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.virtual_gifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_gifts_sent ENABLE ROW LEVEL SECURITY;

-- RLS Policies for virtual_gifts
CREATE POLICY "Anyone can view active gifts"
  ON public.virtual_gifts FOR SELECT
  TO authenticated
  USING (is_active = true);

-- RLS Policies for creator_gifts_sent
CREATE POLICY "Users can view gifts they sent"
  ON public.creator_gifts_sent FOR SELECT
  TO authenticated
  USING (sender_id = auth.uid());

CREATE POLICY "Creators can view gifts they received"
  ON public.creator_gifts_sent FOR SELECT
  TO authenticated
  USING (recipient_creator_id IN (SELECT id FROM public.creator_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can send gifts"
  ON public.creator_gifts_sent FOR INSERT
  TO authenticated
  WITH CHECK (sender_id = auth.uid());

-- Insert default virtual gifts
INSERT INTO public.virtual_gifts (name, description, image_url, price, category) VALUES
  ('Heart', 'Send love and support', 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=200&q=80', 0.99, 'hearts'),
  ('Double Heart', 'Double the love', 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=200&q=80', 1.99, 'hearts'),
  ('Golden Heart', 'Premium support', 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=200&q=80', 4.99, 'hearts'),
  ('Star', 'You are a star!', 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=200&q=80', 0.99, 'stars'),
  ('Shooting Star', 'Amazing content!', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&q=80', 2.99, 'stars'),
  ('Galaxy', 'Out of this world', 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=200&q=80', 9.99, 'stars'),
  ('Crown', 'You are royalty', 'https://images.unsplash.com/photo-1535378620166-273708d44e4c?w=200&q=80', 4.99, 'premium'),
  ('Diamond', 'Precious creator', 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=200&q=80', 9.99, 'premium'),
  ('Trophy', 'Champion creator', 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=200&q=80', 14.99, 'premium'),
  ('Fireworks', 'Celebration time', 'https://images.unsplash.com/photo-1467810563316-b5476525c0f9?w=200&q=80', 19.99, 'exclusive'),
  ('Unicorn', 'Magical content', 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=200&q=80', 24.99, 'exclusive'),
  ('Rainbow', 'Brighten the day', 'https://images.unsplash.com/photo-1534361960057-19889db9621e?w=200&q=80', 49.99, 'exclusive')
ON CONFLICT DO NOTHING;