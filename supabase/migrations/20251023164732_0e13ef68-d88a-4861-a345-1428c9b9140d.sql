-- Fix function search path security issue properly
DROP TRIGGER IF EXISTS update_video_ad_credits_updated_at ON public.video_ad_credits;
DROP FUNCTION IF EXISTS public.update_video_ad_credits_updated_at();

CREATE OR REPLACE FUNCTION public.update_video_ad_credits_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_video_ad_credits_updated_at
  BEFORE UPDATE ON public.video_ad_credits
  FOR EACH ROW
  EXECUTE FUNCTION public.update_video_ad_credits_updated_at();