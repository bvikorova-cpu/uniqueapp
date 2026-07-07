
DROP VIEW IF EXISTS public.donor_wall;
DROP TABLE IF EXISTS public.talent_sponsorships CASCADE;
DROP TABLE IF EXISTS public.recurring_donations CASCADE;
DROP TABLE IF EXISTS public.fundraising_payouts CASCADE;
DROP TABLE IF EXISTS public.donations CASCADE;
DROP TABLE IF EXISTS public.fundraising_campaigns CASCADE;
DROP TYPE IF EXISTS public.recurring_donation_status;
DROP TYPE IF EXISTS public.fundraising_payout_status;
DROP TYPE IF EXISTS public.campaign_urgency;
DROP TYPE IF EXISTS public.campaign_status;
-- Note: public.set_updated_at() left in place — it may be used by other tables.
