
-- ============================================================
-- UNIQUE CLUB — membership + good-fund + referrals
-- ============================================================

CREATE TYPE public.club_tier AS ENUM ('digital', 'physical');
CREATE TYPE public.club_status AS ENUM ('active', 'past_due', 'canceled', 'pending');
CREATE TYPE public.club_shipping_status AS ENUM ('not_applicable', 'pending', 'shipped', 'delivered');

CREATE SEQUENCE public.club_member_number_seq START 1;

-- ---- club_memberships -------------------------------------
CREATE TABLE public.club_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  member_number int NOT NULL DEFAULT nextval('public.club_member_number_seq'),
  tier public.club_tier NOT NULL,
  status public.club_status NOT NULL DEFAULT 'pending',
  is_founding boolean NOT NULL DEFAULT false,
  stripe_customer_id text,
  stripe_subscription_id text,
  stripe_checkout_session_id text,
  started_at timestamptz NOT NULL DEFAULT now(),
  current_period_end timestamptz,
  canceled_at timestamptz,
  shipping_status public.club_shipping_status NOT NULL DEFAULT 'not_applicable',
  shipping_address jsonb,
  card_pdf_url text,
  referred_by uuid,
  monthly_credits_granted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX club_memberships_status_idx ON public.club_memberships(status);
CREATE INDEX club_memberships_stripe_sub_idx ON public.club_memberships(stripe_subscription_id);
CREATE INDEX club_memberships_referred_by_idx ON public.club_memberships(referred_by);

GRANT SELECT, INSERT, UPDATE ON public.club_memberships TO authenticated;
GRANT ALL ON public.club_memberships TO service_role;
GRANT USAGE ON SEQUENCE public.club_member_number_seq TO authenticated, service_role;

ALTER TABLE public.club_memberships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own membership"
  ON public.club_memberships FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own membership"
  ON public.club_memberships FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own membership shipping"
  ON public.club_memberships FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Founding-member auto-flag (first 1000 active memberships)
CREATE OR REPLACE FUNCTION public.club_flag_founding()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.member_number <= 1000 THEN
    NEW.is_founding := true;
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER club_flag_founding_trg
  BEFORE INSERT ON public.club_memberships
  FOR EACH ROW EXECUTE FUNCTION public.club_flag_founding();

CREATE OR REPLACE FUNCTION public.club_touch_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

CREATE TRIGGER club_memberships_touch
  BEFORE UPDATE ON public.club_memberships
  FOR EACH ROW EXECUTE FUNCTION public.club_touch_updated_at();

-- Public view of member badges (no PII)
CREATE VIEW public.club_public_members AS
  SELECT user_id, member_number, tier, is_founding, started_at
  FROM public.club_memberships
  WHERE status IN ('active', 'past_due');

GRANT SELECT ON public.club_public_members TO anon, authenticated;

-- ---- club_good_fund_ledger --------------------------------
CREATE TABLE public.club_good_fund_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  membership_id uuid NOT NULL REFERENCES public.club_memberships(id) ON DELETE CASCADE,
  amount_eur numeric(10,2) NOT NULL,
  source text NOT NULL,
  stripe_event_id text UNIQUE,
  contributed_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX club_good_fund_contributed_idx ON public.club_good_fund_ledger(contributed_at DESC);

GRANT SELECT ON public.club_good_fund_ledger TO authenticated;
GRANT ALL ON public.club_good_fund_ledger TO service_role;

ALTER TABLE public.club_good_fund_ledger ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members read own contributions"
  ON public.club_good_fund_ledger FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.club_memberships m
    WHERE m.id = club_good_fund_ledger.membership_id AND m.user_id = auth.uid()
  ));

CREATE OR REPLACE FUNCTION public.get_club_good_fund_total()
RETURNS TABLE(total_eur numeric, contribution_count bigint, member_count bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT
    COALESCE((SELECT SUM(amount_eur) FROM public.club_good_fund_ledger), 0)::numeric AS total_eur,
    (SELECT COUNT(*) FROM public.club_good_fund_ledger)::bigint AS contribution_count,
    (SELECT COUNT(*) FROM public.club_memberships WHERE status = 'active')::bigint AS member_count;
$$;

GRANT EXECUTE ON FUNCTION public.get_club_good_fund_total() TO anon, authenticated;

-- ---- club_referrals ---------------------------------------
CREATE TABLE public.club_referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_user_id uuid NOT NULL,
  referred_membership_id uuid NOT NULL REFERENCES public.club_memberships(id) ON DELETE CASCADE,
  credit_awarded_eur numeric(10,2) NOT NULL DEFAULT 5.00,
  awarded_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(referred_membership_id)
);

CREATE INDEX club_referrals_referrer_idx ON public.club_referrals(referrer_user_id);

GRANT SELECT ON public.club_referrals TO authenticated;
GRANT ALL ON public.club_referrals TO service_role;

ALTER TABLE public.club_referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own referrals"
  ON public.club_referrals FOR SELECT TO authenticated
  USING (auth.uid() = referrer_user_id);

-- ---- Founding progress helper (public) --------------------
CREATE OR REPLACE FUNCTION public.get_club_founding_progress()
RETURNS TABLE(founding_taken int, founding_total int)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT
    LEAST(1000, COALESCE((SELECT MAX(member_number) FROM public.club_memberships), 0))::int,
    1000::int;
$$;

GRANT EXECUTE ON FUNCTION public.get_club_founding_progress() TO anon, authenticated;

-- ---- Helper: is caller a club member? ---------------------
CREATE OR REPLACE FUNCTION public.is_club_member(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.club_memberships
    WHERE user_id = _user_id AND status = 'active'
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_club_member(uuid) TO authenticated, service_role;
