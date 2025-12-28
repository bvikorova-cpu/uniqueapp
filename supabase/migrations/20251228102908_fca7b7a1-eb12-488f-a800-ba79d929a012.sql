-- Enum pre typy moderácie
CREATE TYPE moderation_status AS ENUM ('pending', 'approved', 'rejected', 'hidden', 'deleted');
CREATE TYPE moderation_action AS ENUM ('warning', 'content_removed', 'shadowban', 'temp_ban', 'permanent_ban');
CREATE TYPE content_type_mod AS ENUM ('post', 'comment', 'message', 'profile', 'image', 'video');
CREATE TYPE violation_type AS ENUM (
  'violence', 
  'hate_speech', 
  'child_safety', 
  'spam', 
  'fraud', 
  'adult_content', 
  'drugs', 
  'harassment', 
  'misinformation', 
  'copyright', 
  'other'
);

-- Tabuľka pre AI moderáciu obsahu (Level 1)
CREATE TABLE public.content_moderation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type content_type_mod NOT NULL,
  content_id UUID NOT NULL,
  user_id UUID NOT NULL,
  original_text TEXT,
  ai_score NUMERIC(5,4) DEFAULT 0, -- 0.0000 - 1.0000 (pravdepodobnosť porušenia)
  ai_categories JSONB DEFAULT '{}', -- {violence: 0.85, hate_speech: 0.12, ...}
  ai_recommendation moderation_status DEFAULT 'pending',
  final_status moderation_status DEFAULT 'pending',
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabuľka pre používateľské nahlásenia (Level 2)
CREATE TABLE public.content_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL,
  content_type content_type_mod NOT NULL,
  content_id UUID NOT NULL,
  reported_user_id UUID NOT NULL,
  violation_type violation_type NOT NULL,
  description TEXT,
  evidence_urls TEXT[],
  status moderation_status DEFAULT 'pending',
  priority INTEGER DEFAULT 0, -- vyššie číslo = vyššia priorita
  assigned_to UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabuľka pre akcie moderátorov (Level 3)
CREATE TABLE public.moderation_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL, -- používateľ ktorý dostal akciu
  moderator_id UUID NOT NULL,
  action_type moderation_action NOT NULL,
  reason TEXT NOT NULL,
  related_content_id UUID,
  related_report_id UUID REFERENCES content_reports(id),
  duration_hours INTEGER, -- pre dočasný ban
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabuľka pre shadowban
CREATE TABLE public.shadowbanned_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  reason TEXT NOT NULL,
  shadowbanned_by UUID NOT NULL,
  shadowbanned_at TIMESTAMPTZ DEFAULT now(),
  is_active BOOLEAN DEFAULT true
);

-- Tabuľka pre varovania používateľov
CREATE TABLE public.user_warnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  warning_level INTEGER DEFAULT 1, -- 1, 2, 3 (3 = ban)
  reason TEXT NOT NULL,
  issued_by UUID NOT NULL,
  acknowledged BOOLEAN DEFAULT false,
  acknowledged_at TIMESTAMPTZ,
  related_content_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Funkcia pre kontrolu shadowbanu
CREATE OR REPLACE FUNCTION public.is_shadowbanned(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.shadowbanned_users
    WHERE user_id = _user_id
      AND is_active = true
  )
$$;

-- Enable RLS
ALTER TABLE public.content_moderation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shadowbanned_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_warnings ENABLE ROW LEVEL SECURITY;

-- RLS Policies pre content_moderation (len moderátori/admini)
CREATE POLICY "Moderators can view all moderation"
ON public.content_moderation
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'moderator') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Moderators can update moderation"
ON public.content_moderation
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'moderator') OR public.has_role(auth.uid(), 'admin'));

-- RLS Policies pre content_reports
CREATE POLICY "Users can create reports"
ON public.content_reports
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view own reports"
ON public.content_reports
FOR SELECT
TO authenticated
USING (auth.uid() = reporter_id OR public.has_role(auth.uid(), 'moderator') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Moderators can update reports"
ON public.content_reports
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'moderator') OR public.has_role(auth.uid(), 'admin'));

-- RLS Policies pre moderation_actions (len moderátori)
CREATE POLICY "Moderators can manage actions"
ON public.moderation_actions
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'moderator') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view own actions"
ON public.moderation_actions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- RLS Policies pre shadowbanned_users (len admini)
CREATE POLICY "Admins can manage shadowbans"
ON public.shadowbanned_users
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies pre user_warnings
CREATE POLICY "Users can view own warnings"
ON public.user_warnings
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can acknowledge warnings"
ON public.user_warnings
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id AND acknowledged = false)
WITH CHECK (acknowledged = true);

CREATE POLICY "Moderators can manage warnings"
ON public.user_warnings
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'moderator') OR public.has_role(auth.uid(), 'admin'));

-- Indexy pre rýchle vyhľadávanie
CREATE INDEX idx_content_moderation_status ON public.content_moderation(final_status);
CREATE INDEX idx_content_moderation_user ON public.content_moderation(user_id);
CREATE INDEX idx_content_reports_status ON public.content_reports(status);
CREATE INDEX idx_content_reports_priority ON public.content_reports(priority DESC);
CREATE INDEX idx_moderation_actions_user ON public.moderation_actions(user_id);
CREATE INDEX idx_shadowbanned_active ON public.shadowbanned_users(user_id) WHERE is_active = true;
CREATE INDEX idx_user_warnings_user ON public.user_warnings(user_id);