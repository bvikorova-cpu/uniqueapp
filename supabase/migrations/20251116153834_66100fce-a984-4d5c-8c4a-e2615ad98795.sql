-- Add campaign_approvals table for tracking admin actions
CREATE TABLE IF NOT EXISTS public.campaign_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL,
  campaign_type TEXT NOT NULL CHECK (campaign_type IN ('medical', 'dream', 'hero', 'pet', 'student', 'crisis', 'talent')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_campaign_approvals_status ON public.campaign_approvals(status);
CREATE INDEX IF NOT EXISTS idx_campaign_approvals_campaign ON public.campaign_approvals(campaign_id, campaign_type);
CREATE INDEX IF NOT EXISTS idx_campaign_approvals_created ON public.campaign_approvals(created_at DESC);

-- Enable RLS
ALTER TABLE public.campaign_approvals ENABLE ROW LEVEL SECURITY;

-- Policies for campaign_approvals
CREATE POLICY "Campaign approvals viewable by admins" ON public.campaign_approvals
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Campaign approvals insertable by system" ON public.campaign_approvals
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Campaign approvals updatable by admins" ON public.campaign_approvals
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Function to create approval notification for admins
CREATE OR REPLACE FUNCTION public.notify_admin_new_campaign()
RETURNS TRIGGER AS $$
DECLARE
  admin_id UUID;
BEGIN
  -- Create approval record
  INSERT INTO public.campaign_approvals (campaign_id, campaign_type, status)
  VALUES (NEW.id, TG_ARGV[0], 'pending');
  
  -- Notify all admins
  FOR admin_id IN 
    SELECT user_id FROM public.user_roles WHERE role = 'admin'
  LOOP
    INSERT INTO public.notifications (user_id, type, title, message, metadata)
    VALUES (
      admin_id,
      'campaign_approval',
      'New Campaign Pending Approval',
      'A new ' || TG_ARGV[0] || ' campaign needs your review',
      jsonb_build_object(
        'campaign_id', NEW.id,
        'campaign_type', TG_ARGV[0],
        'campaign_title', NEW.title
      )
    );
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create triggers for all campaign types
DROP TRIGGER IF EXISTS notify_admin_medical_campaign ON public.medical_campaigns;
CREATE TRIGGER notify_admin_medical_campaign
  AFTER INSERT ON public.medical_campaigns
  FOR EACH ROW
  WHEN (NEW.status = 'pending')
  EXECUTE FUNCTION public.notify_admin_new_campaign('medical');

DROP TRIGGER IF EXISTS notify_admin_dream_campaign ON public.dream_campaigns;
CREATE TRIGGER notify_admin_dream_campaign
  AFTER INSERT ON public.dream_campaigns
  FOR EACH ROW
  WHEN (NEW.status = 'pending')
  EXECUTE FUNCTION public.notify_admin_new_campaign('dream');

DROP TRIGGER IF EXISTS notify_admin_hero_campaign ON public.hero_campaigns;
CREATE TRIGGER notify_admin_hero_campaign
  AFTER INSERT ON public.hero_campaigns
  FOR EACH ROW
  WHEN (NEW.status = 'pending')
  EXECUTE FUNCTION public.notify_admin_new_campaign('hero');

DROP TRIGGER IF EXISTS notify_admin_pet_campaign ON public.pet_rescue_campaigns;
CREATE TRIGGER notify_admin_pet_campaign
  AFTER INSERT ON public.pet_rescue_campaigns
  FOR EACH ROW
  WHEN (NEW.status = 'pending')
  EXECUTE FUNCTION public.notify_admin_new_campaign('pet');

DROP TRIGGER IF EXISTS notify_admin_student_campaign ON public.student_campaigns;
CREATE TRIGGER notify_admin_student_campaign
  AFTER INSERT ON public.student_campaigns
  FOR EACH ROW
  WHEN (NEW.status = 'pending')
  EXECUTE FUNCTION public.notify_admin_new_campaign('student');

DROP TRIGGER IF EXISTS notify_admin_crisis_campaign ON public.crisis_campaigns;
CREATE TRIGGER notify_admin_crisis_campaign
  AFTER INSERT ON public.crisis_campaigns
  FOR EACH ROW
  WHEN (NEW.status = 'pending')
  EXECUTE FUNCTION public.notify_admin_new_campaign('crisis');

DROP TRIGGER IF EXISTS notify_admin_talent_campaign ON public.talent_campaigns;
CREATE TRIGGER notify_admin_talent_campaign
  AFTER INSERT ON public.talent_campaigns
  FOR EACH ROW
  WHEN (NEW.status = 'pending')
  EXECUTE FUNCTION public.notify_admin_new_campaign('talent');