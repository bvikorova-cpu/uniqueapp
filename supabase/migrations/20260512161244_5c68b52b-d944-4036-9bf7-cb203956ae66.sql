
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS stripe_connect_details_submitted boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS stripe_connect_disabled_reason text,
  ADD COLUMN IF NOT EXISTS stripe_connect_currently_due jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS stripe_connect_past_due jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS stripe_connect_eventually_due jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS stripe_connect_default_currency text,
  ADD COLUMN IF NOT EXISTS stripe_connect_payout_schedule jsonb,
  ADD COLUMN IF NOT EXISTS stripe_connect_country text,
  ADD COLUMN IF NOT EXISTS stripe_connect_capabilities jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS stripe_connect_account_type text,
  ADD COLUMN IF NOT EXISTS stripe_connect_synced_at timestamptz;
