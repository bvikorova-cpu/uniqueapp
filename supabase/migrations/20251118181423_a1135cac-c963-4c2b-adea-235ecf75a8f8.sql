-- Add unique constraint for gift_id in influencer_platform_earnings
ALTER TABLE public.influencer_platform_earnings
ADD CONSTRAINT influencer_platform_earnings_gift_id_key UNIQUE (gift_id);