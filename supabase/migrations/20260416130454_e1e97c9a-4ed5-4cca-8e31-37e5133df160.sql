
-- Brain Duel Referrals table
CREATE TABLE public.brain_duel_referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  referred_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  referral_code TEXT NOT NULL,
  bonus_credits_awarded INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(referrer_id, referred_id)
);

-- Brain Duel Referral Codes table
CREATE TABLE public.brain_duel_referral_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  total_referrals INTEGER DEFAULT 0,
  total_bonus_credits INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Brain Duel Notifications table (persistent)
CREATE TABLE public.brain_duel_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Brain Duel AI Recaps table
CREATE TABLE public.brain_duel_ai_recaps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  recap_text TEXT NOT NULL,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  stats_snapshot JSONB DEFAULT '{}',
  credits_used INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS Policies
ALTER TABLE public.brain_duel_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brain_duel_referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brain_duel_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brain_duel_ai_recaps ENABLE ROW LEVEL SECURITY;

-- Referrals: users can see their own referrals
CREATE POLICY "Users can view own referrals" ON public.brain_duel_referrals FOR SELECT TO authenticated USING (referrer_id = auth.uid() OR referred_id = auth.uid());
CREATE POLICY "Users can create referrals" ON public.brain_duel_referrals FOR INSERT TO authenticated WITH CHECK (referred_id = auth.uid());

-- Referral codes: users can manage their own code
CREATE POLICY "Users can view own referral code" ON public.brain_duel_referral_codes FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can create own referral code" ON public.brain_duel_referral_codes FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own referral code" ON public.brain_duel_referral_codes FOR UPDATE TO authenticated USING (user_id = auth.uid());
-- Anyone can look up codes to use them
CREATE POLICY "Anyone can lookup codes" ON public.brain_duel_referral_codes FOR SELECT TO authenticated USING (true);

-- Notifications: users can manage their own
CREATE POLICY "Users can view own notifications" ON public.brain_duel_notifications FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can update own notifications" ON public.brain_duel_notifications FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can delete own notifications" ON public.brain_duel_notifications FOR DELETE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "System can insert notifications" ON public.brain_duel_notifications FOR INSERT TO authenticated WITH CHECK (true);

-- AI Recaps: users can see their own
CREATE POLICY "Users can view own recaps" ON public.brain_duel_ai_recaps FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can create own recaps" ON public.brain_duel_ai_recaps FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- Create index for faster lookups
CREATE INDEX idx_brain_duel_notifications_user ON public.brain_duel_notifications(user_id, is_read);
CREATE INDEX idx_brain_duel_referrals_referrer ON public.brain_duel_referrals(referrer_id);
CREATE INDEX idx_brain_duel_referral_codes_code ON public.brain_duel_referral_codes(code);
