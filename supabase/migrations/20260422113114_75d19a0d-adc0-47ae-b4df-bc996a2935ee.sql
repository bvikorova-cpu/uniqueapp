ALTER TABLE public.instructor_withdrawal_requests ADD COLUMN IF NOT EXISTS stripe_transfer_id text;
ALTER TABLE public.musician_withdrawal_requests ADD COLUMN IF NOT EXISTS stripe_transfer_id text;
ALTER TABLE public.masterchef_withdrawal_requests ADD COLUMN IF NOT EXISTS stripe_transfer_id text;
ALTER TABLE public.influencer_withdrawal_requests ADD COLUMN IF NOT EXISTS stripe_transfer_id text;
ALTER TABLE public.referral_withdrawal_requests ADD COLUMN IF NOT EXISTS stripe_transfer_id text;
ALTER TABLE public.withdrawal_requests ADD COLUMN IF NOT EXISTS stripe_transfer_id text;