-- Shadow bans table for admin shadow ban system
CREATE TABLE IF NOT EXISTS public.shadow_bans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  banned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  unbanned_at TIMESTAMP WITH TIME ZONE,
  reason TEXT,
  banned_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.shadow_bans ENABLE ROW LEVEL SECURITY;

-- Only admins can view/manage shadow bans
CREATE POLICY "Admins can manage shadow bans" ON public.shadow_bans
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Celebration posts for MegaTalent recognition
CREATE TABLE IF NOT EXISTS public.celebration_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  achievement_title TEXT NOT NULL,
  achievement_type TEXT NOT NULL DEFAULT 'achievement',
  description TEXT,
  source_type TEXT,
  source_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.celebration_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view celebration posts" ON public.celebration_posts
  FOR SELECT USING (true);

CREATE POLICY "Users can create own celebration posts" ON public.celebration_posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Celebration congratulations
CREATE TABLE IF NOT EXISTS public.celebration_congratulations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  celebration_id UUID NOT NULL REFERENCES public.celebration_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(celebration_id, user_id)
);

ALTER TABLE public.celebration_congratulations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view congratulations" ON public.celebration_congratulations
  FOR SELECT USING (true);

CREATE POLICY "Users can manage own congratulations" ON public.celebration_congratulations
  FOR ALL USING (auth.uid() = user_id);

-- Add voice_url and voice_duration to post_comments if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'post_comments' AND column_name = 'voice_url') THEN
    ALTER TABLE public.post_comments ADD COLUMN voice_url TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'post_comments' AND column_name = 'voice_duration') THEN
    ALTER TABLE public.post_comments ADD COLUMN voice_duration INTEGER;
  END IF;
END $$;

-- Add is_shadow_banned helper view for feed filtering
CREATE OR REPLACE VIEW public.active_shadow_bans AS
SELECT user_id FROM public.shadow_bans WHERE is_active = true;