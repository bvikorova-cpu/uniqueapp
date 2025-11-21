-- Create brand_campaigns table
CREATE TABLE public.brand_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  brand_name TEXT NOT NULL,
  campaign_name TEXT NOT NULL,
  description TEXT,
  budget_min INTEGER NOT NULL,
  budget_max INTEGER NOT NULL,
  deadline TIMESTAMP WITH TIME ZONE NOT NULL,
  tags TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'active',
  applications_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create campaign_applications table
CREATE TABLE public.campaign_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES public.brand_campaigns(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  message TEXT,
  portfolio_link TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(campaign_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE public.brand_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for brand_campaigns
CREATE POLICY "Anyone can view active campaigns"
  ON public.brand_campaigns
  FOR SELECT
  USING (status = 'active');

CREATE POLICY "Users can create their own campaigns"
  ON public.brand_campaigns
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own campaigns"
  ON public.brand_campaigns
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own campaigns"
  ON public.brand_campaigns
  FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for campaign_applications
CREATE POLICY "Users can view their own applications"
  ON public.campaign_applications
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Campaign owners can view applications"
  ON public.campaign_applications
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.brand_campaigns
      WHERE id = campaign_applications.campaign_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create applications"
  ON public.campaign_applications
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own applications"
  ON public.campaign_applications
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Function to update applications count
CREATE OR REPLACE FUNCTION public.update_campaign_applications_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.brand_campaigns
    SET applications_count = applications_count + 1
    WHERE id = NEW.campaign_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.brand_campaigns
    SET applications_count = GREATEST(applications_count - 1, 0)
    WHERE id = OLD.campaign_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to update applications count
CREATE TRIGGER update_campaign_applications_count_trigger
  AFTER INSERT OR DELETE ON public.campaign_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_campaign_applications_count();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_brand_campaigns_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for brand_campaigns
CREATE TRIGGER update_brand_campaigns_timestamp_trigger
  BEFORE UPDATE ON public.brand_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.update_brand_campaigns_timestamp();

-- Trigger for campaign_applications
CREATE TRIGGER update_campaign_applications_timestamp_trigger
  BEFORE UPDATE ON public.campaign_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_brand_campaigns_timestamp();