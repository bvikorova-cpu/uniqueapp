create or replace function public.get_my_megatalent_referral_stats()
returns table (
  invited_total integer,
  invited_active integer,
  total_earnings numeric,
  pending_earnings numeric,
  paid_earnings numeric
)
language sql
stable
security definer
set search_path = public
as $$
  select
    (select count(distinct user_id)::int from public.megatalent_subscriptions s
       where s.referred_by = auth.uid()),
    (select count(distinct user_id)::int from public.megatalent_subscriptions s
       where s.referred_by = auth.uid() and s.status = 'active'),
    coalesce((select sum(amount) from public.megatalent_referral_earnings e
       where e.referrer_id = auth.uid()), 0),
    coalesce((select sum(amount) from public.megatalent_referral_earnings e
       where e.referrer_id = auth.uid() and e.paid = false), 0),
    coalesce((select sum(amount) from public.megatalent_referral_earnings e
       where e.referrer_id = auth.uid() and e.paid = true), 0)
$$;

revoke all on function public.get_my_megatalent_referral_stats() from public;
grant execute on function public.get_my_megatalent_referral_stats() to authenticated;