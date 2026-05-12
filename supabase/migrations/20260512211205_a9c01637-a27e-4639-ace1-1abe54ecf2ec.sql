
CREATE TABLE IF NOT EXISTS public.subscription_gifts (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null,
  recipient_email text not null,
  recipient_user_id uuid,
  tier text not null,
  months integer not null default 1,
  amount_cents integer not null,
  currency text not null default 'EUR',
  redeem_code text not null unique,
  stripe_session_id text,
  stripe_payment_intent_id text,
  status text not null default 'pending',
  message text,
  redeemed_at timestamptz,
  expires_at timestamptz not null default (now() + interval '90 days'),
  created_at timestamptz not null default now()
);
ALTER TABLE public.subscription_gifts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "users view own sent gifts" ON public.subscription_gifts;
CREATE POLICY "users view own sent gifts" ON public.subscription_gifts FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_user_id);
DROP POLICY IF EXISTS "users create own gifts" ON public.subscription_gifts;
CREATE POLICY "users create own gifts" ON public.subscription_gifts FOR INSERT WITH CHECK (auth.uid() = sender_id);
DROP POLICY IF EXISTS "admins manage gifts" ON public.subscription_gifts;
CREATE POLICY "admins manage gifts" ON public.subscription_gifts FOR ALL USING (public.has_role(auth.uid(),'admin'));
CREATE INDEX IF NOT EXISTS idx_gifts_recipient ON public.subscription_gifts(recipient_email);
CREATE INDEX IF NOT EXISTS idx_gifts_code ON public.subscription_gifts(redeem_code);

CREATE TABLE IF NOT EXISTS public.cancellation_surveys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  tier text,
  reason text not null,
  feedback text,
  accepted_offer text,
  created_at timestamptz not null default now()
);
ALTER TABLE public.cancellation_surveys ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "users own survey insert" ON public.cancellation_surveys;
CREATE POLICY "users own survey insert" ON public.cancellation_surveys FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "users view own survey" ON public.cancellation_surveys;
CREATE POLICY "users view own survey" ON public.cancellation_surveys FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "admins read all surveys" ON public.cancellation_surveys;
CREATE POLICY "admins read all surveys" ON public.cancellation_surveys FOR SELECT USING (public.has_role(auth.uid(),'admin'));

CREATE TABLE IF NOT EXISTS public.subscription_seats (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null,
  member_email text not null,
  member_user_id uuid,
  tier text not null,
  status text not null default 'invited',
  invited_at timestamptz not null default now(),
  accepted_at timestamptz,
  removed_at timestamptz,
  unique(owner_id, member_email)
);
ALTER TABLE public.subscription_seats ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "owner manage seats" ON public.subscription_seats;
CREATE POLICY "owner manage seats" ON public.subscription_seats FOR ALL USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
DROP POLICY IF EXISTS "member view own seat" ON public.subscription_seats;
CREATE POLICY "member view own seat" ON public.subscription_seats FOR SELECT USING (auth.uid() = member_user_id);

CREATE TABLE IF NOT EXISTS public.plan_recommendations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique,
  recommended_tier text not null,
  rationale text,
  monthly_savings_cents integer default 0,
  computed_at timestamptz not null default now()
);
ALTER TABLE public.plan_recommendations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "users view own rec" ON public.plan_recommendations;
CREATE POLICY "users view own rec" ON public.plan_recommendations FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "service writes rec" ON public.plan_recommendations;
CREATE POLICY "service writes rec" ON public.plan_recommendations FOR ALL USING (public.has_role(auth.uid(),'admin')) WITH CHECK (true);
