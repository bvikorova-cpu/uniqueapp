-- Medical Fundraising Hub
CREATE TABLE IF NOT EXISTS public.medical_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  story TEXT NOT NULL,
  target_amount DECIMAL(10,2) NOT NULL,
  current_amount DECIMAL(10,2) DEFAULT 0,
  patient_name TEXT NOT NULL,
  diagnosis TEXT NOT NULL,
  hospital TEXT,
  medical_documents TEXT[], -- URLs to uploaded documents
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'rejected')),
  verified BOOLEAN DEFAULT FALSE,
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  image_url TEXT,
  video_url TEXT,
  monthly_donors_count INTEGER DEFAULT 0,
  one_time_donors_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ends_at TIMESTAMP WITH TIME ZONE
);

-- Dream Maker Platform
CREATE TABLE IF NOT EXISTS public.dream_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  story TEXT NOT NULL,
  dream_type TEXT NOT NULL CHECK (dream_type IN ('education', 'travel', 'startup', 'creative', 'other')),
  target_amount DECIMAL(10,2) NOT NULL,
  current_amount DECIMAL(10,2) DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'completed', 'cancelled')),
  image_url TEXT,
  video_url TEXT,
  milestones JSONB DEFAULT '[]',
  updates JSONB DEFAULT '[]',
  supporters_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ends_at TIMESTAMP WITH TIME ZONE
);

-- Community Hero Fund
CREATE TABLE IF NOT EXISTS public.hero_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  hero_type TEXT NOT NULL CHECK (hero_type IN ('firefighter', 'paramedic', 'teacher', 'volunteer', 'other')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  story TEXT NOT NULL,
  target_amount DECIMAL(10,2) NOT NULL,
  current_amount DECIMAL(10,2) DEFAULT 0,
  verified BOOLEAN DEFAULT FALSE,
  verified_by UUID REFERENCES auth.users(id),
  organization_name TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'completed', 'cancelled')),
  image_url TEXT,
  video_url TEXT,
  sponsors JSONB DEFAULT '[]',
  supporters_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ends_at TIMESTAMP WITH TIME ZONE
);

-- Pet Rescue Network
CREATE TABLE IF NOT EXISTS public.pet_rescue_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pet_name TEXT NOT NULL,
  pet_type TEXT NOT NULL CHECK (pet_type IN ('dog', 'cat', 'bird', 'rabbit', 'other')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  story TEXT NOT NULL,
  target_amount DECIMAL(10,2) NOT NULL,
  current_amount DECIMAL(10,2) DEFAULT 0,
  urgent BOOLEAN DEFAULT FALSE,
  medical_condition TEXT,
  shelter_name TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'adopted', 'completed', 'cancelled')),
  images TEXT[],
  video_url TEXT,
  supporters_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Student Support Circle
CREATE TABLE IF NOT EXISTS public.student_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  story TEXT NOT NULL,
  support_type TEXT NOT NULL CHECK (support_type IN ('tuition', 'books', 'course', 'equipment', 'other')),
  target_amount DECIMAL(10,2) NOT NULL,
  current_amount DECIMAL(10,2) DEFAULT 0,
  school_name TEXT,
  field_of_study TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'completed', 'cancelled')),
  image_url TEXT,
  supporters_count INTEGER DEFAULT 0,
  pay_it_forward BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ends_at TIMESTAMP WITH TIME ZONE
);

-- Crisis Relief Platform
CREATE TABLE IF NOT EXISTS public.crisis_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  crisis_type TEXT NOT NULL CHECK (crisis_type IN ('fire', 'flood', 'accident', 'natural_disaster', 'other')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  story TEXT NOT NULL,
  target_amount DECIMAL(10,2) NOT NULL,
  current_amount DECIMAL(10,2) DEFAULT 0,
  verified BOOLEAN DEFAULT FALSE,
  verified_by UUID REFERENCES auth.users(id),
  urgent BOOLEAN DEFAULT TRUE,
  location TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
  images TEXT[],
  video_url TEXT,
  supporters_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '48 hours')
);

-- Talent Sponsorship Hub
CREATE TABLE IF NOT EXISTS public.talent_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  talent_type TEXT NOT NULL CHECK (talent_type IN ('music', 'sports', 'art', 'dance', 'other')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  story TEXT NOT NULL,
  target_amount DECIMAL(10,2) NOT NULL,
  current_amount DECIMAL(10,2) DEFAULT 0,
  portfolio_url TEXT,
  achievements TEXT[],
  goals TEXT[],
  status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'completed', 'cancelled')),
  images TEXT[],
  video_url TEXT,
  sponsors JSONB DEFAULT '[]',
  sponsors_count INTEGER DEFAULT 0,
  premium_subscriber BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ends_at TIMESTAMP WITH TIME ZONE
);

-- Donations table (universal for all campaigns)
CREATE TABLE IF NOT EXISTS public.campaign_donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  donor_email TEXT,
  donor_name TEXT,
  campaign_id UUID NOT NULL,
  campaign_type TEXT NOT NULL CHECK (campaign_type IN ('medical', 'dream', 'hero', 'pet', 'student', 'crisis', 'talent')),
  amount DECIMAL(10,2) NOT NULL,
  platform_fee DECIMAL(10,2) NOT NULL,
  net_amount DECIMAL(10,2) NOT NULL,
  is_monthly BOOLEAN DEFAULT FALSE,
  is_anonymous BOOLEAN DEFAULT FALSE,
  message TEXT,
  stripe_payment_id TEXT,
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'refunded', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.medical_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dream_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hero_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pet_rescue_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crisis_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.talent_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_donations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Medical Campaigns
CREATE POLICY "Anyone can view active verified medical campaigns"
  ON public.medical_campaigns FOR SELECT
  USING (status = 'active' AND verified = TRUE);

CREATE POLICY "Users can view their own medical campaigns"
  ON public.medical_campaigns FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create medical campaigns"
  ON public.medical_campaigns FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own medical campaigns"
  ON public.medical_campaigns FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for Dream Campaigns
CREATE POLICY "Anyone can view active dream campaigns"
  ON public.dream_campaigns FOR SELECT
  USING (status = 'active');

CREATE POLICY "Users can create dream campaigns"
  ON public.dream_campaigns FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own dream campaigns"
  ON public.dream_campaigns FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for Hero Campaigns
CREATE POLICY "Anyone can view active hero campaigns"
  ON public.hero_campaigns FOR SELECT
  USING (status = 'active');

CREATE POLICY "Users can create hero campaigns"
  ON public.hero_campaigns FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own hero campaigns"
  ON public.hero_campaigns FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for Pet Rescue
CREATE POLICY "Anyone can view active pet rescue campaigns"
  ON public.pet_rescue_campaigns FOR SELECT
  USING (status IN ('active', 'adopted'));

CREATE POLICY "Users can create pet rescue campaigns"
  ON public.pet_rescue_campaigns FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pet rescue campaigns"
  ON public.pet_rescue_campaigns FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for Student Campaigns
CREATE POLICY "Anyone can view active student campaigns"
  ON public.student_campaigns FOR SELECT
  USING (status = 'active');

CREATE POLICY "Users can create student campaigns"
  ON public.student_campaigns FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own student campaigns"
  ON public.student_campaigns FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for Crisis Campaigns
CREATE POLICY "Anyone can view active verified crisis campaigns"
  ON public.crisis_campaigns FOR SELECT
  USING (status = 'active' AND verified = TRUE);

CREATE POLICY "Users can create crisis campaigns"
  ON public.crisis_campaigns FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own crisis campaigns"
  ON public.crisis_campaigns FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for Talent Campaigns
CREATE POLICY "Anyone can view active talent campaigns"
  ON public.talent_campaigns FOR SELECT
  USING (status = 'active');

CREATE POLICY "Users can create talent campaigns"
  ON public.talent_campaigns FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own talent campaigns"
  ON public.talent_campaigns FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for Donations
CREATE POLICY "Anyone can view non-anonymous donations"
  ON public.campaign_donations FOR SELECT
  USING (is_anonymous = FALSE OR auth.uid() = donor_id);

CREATE POLICY "Users can create donations"
  ON public.campaign_donations FOR INSERT
  WITH CHECK (auth.uid() = donor_id OR donor_id IS NULL);

-- Indexes for performance
CREATE INDEX idx_medical_campaigns_status ON public.medical_campaigns(status, verified);
CREATE INDEX idx_dream_campaigns_status ON public.dream_campaigns(status);
CREATE INDEX idx_hero_campaigns_status ON public.hero_campaigns(status);
CREATE INDEX idx_pet_rescue_status ON public.pet_rescue_campaigns(status);
CREATE INDEX idx_student_campaigns_status ON public.student_campaigns(status);
CREATE INDEX idx_crisis_campaigns_status ON public.crisis_campaigns(status, verified);
CREATE INDEX idx_talent_campaigns_status ON public.talent_campaigns(status);
CREATE INDEX idx_donations_campaign ON public.campaign_donations(campaign_id, campaign_type);