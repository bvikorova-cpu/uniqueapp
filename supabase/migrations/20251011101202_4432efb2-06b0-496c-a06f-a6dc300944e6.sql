-- Create table for job listing payments
CREATE TABLE IF NOT EXISTS public.job_listing_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  job_id UUID REFERENCES public.job_listings(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  duration_days INTEGER NOT NULL DEFAULT 30,
  status TEXT NOT NULL DEFAULT 'pending',
  stripe_session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Create table for certificate purchases
CREATE TABLE IF NOT EXISTS public.certificate_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  course_name TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 10,
  status TEXT NOT NULL DEFAULT 'pending',
  stripe_session_id TEXT,
  certificate_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create table for influencer tips
CREATE TABLE IF NOT EXISTS public.influencer_tips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL,
  influencer_id UUID REFERENCES public.influencer_profiles(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  stripe_session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create table for platform gifts (rozšírené darčeky)
CREATE TABLE IF NOT EXISTS public.platform_gifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  price NUMERIC NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create table for sent platform gifts
CREATE TABLE IF NOT EXISTS public.sent_platform_gifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL,
  receiver_id UUID NOT NULL,
  gift_id UUID REFERENCES public.platform_gifts(id) ON DELETE CASCADE,
  context_type TEXT NOT NULL, -- 'post', 'video', 'profile', 'forum_post'
  context_id UUID,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.job_listing_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificate_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.influencer_tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_gifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sent_platform_gifts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for job_listing_payments
CREATE POLICY "Users can view their own job listing payments"
  ON public.job_listing_payments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own job listing payments"
  ON public.job_listing_payments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all job listing payments"
  ON public.job_listing_payments FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for certificate_purchases
CREATE POLICY "Users can view their own certificate purchases"
  ON public.certificate_purchases FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own certificate purchases"
  ON public.certificate_purchases FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for influencer_tips
CREATE POLICY "Senders can view their sent tips"
  ON public.influencer_tips FOR SELECT
  USING (auth.uid() = sender_id);

CREATE POLICY "Influencers can view received tips"
  ON public.influencer_tips FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.influencer_profiles
    WHERE id = influencer_tips.influencer_id
    AND user_id = auth.uid()
  ));

CREATE POLICY "Users can send tips"
  ON public.influencer_tips FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- RLS Policies for platform_gifts
CREATE POLICY "Anyone can view platform gifts"
  ON public.platform_gifts FOR SELECT
  USING (true);

-- RLS Policies for sent_platform_gifts
CREATE POLICY "Senders can view their sent gifts"
  ON public.sent_platform_gifts FOR SELECT
  USING (auth.uid() = sender_id);

CREATE POLICY "Receivers can view their received gifts"
  ON public.sent_platform_gifts FOR SELECT
  USING (auth.uid() = receiver_id);

CREATE POLICY "Users can send platform gifts"
  ON public.sent_platform_gifts FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- Insert default platform gifts
INSERT INTO public.platform_gifts (name, icon, price, category) VALUES
  ('Kytička', '💐', 2, 'romantic'),
  ('Šampanské', '🍾', 5, 'celebration'),
  ('Diamant', '💎', 10, 'luxury'),
  ('Koruna', '👑', 15, 'luxury'),
  ('Hviezda', '⭐', 3, 'appreciation'),
  ('Srdce', '❤️', 2, 'romantic'),
  ('Torta', '🎂', 4, 'celebration'),
  ('Trofej', '🏆', 8, 'achievement')
ON CONFLICT DO NOTHING;