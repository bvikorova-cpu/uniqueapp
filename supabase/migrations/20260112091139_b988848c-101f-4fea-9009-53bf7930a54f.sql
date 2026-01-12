-- Create storage bucket for resumes if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', false)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for resumes bucket
DROP POLICY IF EXISTS "Users can upload their own resumes" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own resumes" ON storage.objects;
DROP POLICY IF EXISTS "Employers can view resumes for their job applications" ON storage.objects;

CREATE POLICY "Users can upload their own resumes"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own resumes"
ON storage.objects FOR SELECT
USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Employers can view resumes for their job applications"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'resumes' AND
  EXISTS (
    SELECT 1 FROM job_applications ja
    JOIN job_listings jl ON ja.job_id = jl.id
    WHERE jl.employer_id = auth.uid()
    AND ja.resume_url LIKE '%' || name
  )
);

-- Create platform_commission_settings table for real-time commission configuration
CREATE TABLE IF NOT EXISTS public.platform_commission_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_type TEXT NOT NULL UNIQUE,
  commission_rate NUMERIC NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert default commission rates
INSERT INTO public.platform_commission_settings (service_type, commission_rate, description)
VALUES 
  ('bazaar', 10.00, 'Online Bazaar - C2C physical goods marketplace'),
  ('marketplace', 15.00, 'Skills Marketplace - Professional services'),
  ('skill_swap', 0.00, 'Skill Swap - Barter platform (premium subscription only)'),
  ('job_portal', 0.00, 'Job Portal - Paid per listing packages')
ON CONFLICT (service_type) DO UPDATE SET
  commission_rate = EXCLUDED.commission_rate,
  description = EXCLUDED.description;

-- Enable RLS
ALTER TABLE public.platform_commission_settings ENABLE ROW LEVEL SECURITY;

-- RLS for commission settings (public read)
CREATE POLICY "Anyone can view commission settings"
ON public.platform_commission_settings FOR SELECT
USING (true);

CREATE POLICY "Only admins can modify commission settings"
ON public.platform_commission_settings FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add escrow_status to skill_offerings for marketplace if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'skill_offerings' AND column_name = 'escrow_status'
  ) THEN
    ALTER TABLE public.skill_offerings ADD COLUMN escrow_status TEXT DEFAULT 'none';
  END IF;
END $$;

-- Add escrow_status to marketplace_responses if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'marketplace_responses' AND column_name = 'escrow_status'
  ) THEN
    ALTER TABLE public.marketplace_responses ADD COLUMN escrow_status TEXT DEFAULT 'none';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'marketplace_responses' AND column_name = 'payment_amount'
  ) THEN
    ALTER TABLE public.marketplace_responses ADD COLUMN payment_amount NUMERIC;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'marketplace_responses' AND column_name = 'commission_amount'
  ) THEN
    ALTER TABLE public.marketplace_responses ADD COLUMN commission_amount NUMERIC DEFAULT 0;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'marketplace_responses' AND column_name = 'seller_payout'
  ) THEN
    ALTER TABLE public.marketplace_responses ADD COLUMN seller_payout NUMERIC DEFAULT 0;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'marketplace_responses' AND column_name = 'escrow_released_at'
  ) THEN
    ALTER TABLE public.marketplace_responses ADD COLUMN escrow_released_at TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- Create trigger for updated_at on platform_commission_settings
CREATE OR REPLACE TRIGGER update_platform_commission_settings_updated_at
  BEFORE UPDATE ON public.platform_commission_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();