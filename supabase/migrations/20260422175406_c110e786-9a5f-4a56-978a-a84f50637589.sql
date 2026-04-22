create type public.affiliate_tier as enum ('bronze', 'silver', 'gold', 'diamond');

create table public.affiliate_tier_config (
  tier public.affiliate_tier primary key,
  min_referrals int not null,
  reward_eur numeric(10,2) not null,
  label text not null,
  perks jsonb not null default '[]'::jsonb
);

insert into public.affiliate_tier_config (tier, min_referrals, reward_eur, label, perks) values
  ('bronze',   0,  5.00,  'Bronze',  '["€5 per referral","Basic dashboard"]'::jsonb),
  ('silver',   5,  7.00,  'Silver',  '["€7 per referral","Priority support","Custom referral code"]'::jsonb),
  ('gold',    20, 10.00,  'Gold',    '["€10 per referral","Featured leaderboard badge","Monthly bonus"]'::jsonb),
  ('diamond', 50, 15.00,  'Diamond', '["€15 per referral","Top placement","Exclusive merch","Personal account manager"]'::jsonb);

create table public.affiliate_tier_status (
  user_id uuid primary key,
  tier public.affiliate_tier not null default 'bronze',
  approved_referrals int not null default 0,
  lifetime_earnings_eur numeric(10,2) not null default 0,
  promoted_at timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.affiliate_tier_status enable row level security;
alter table public.affiliate_tier_config enable row level security;

create policy "anyone can read tier config"
  on public.affiliate_tier_config for select
  to anon, authenticated using (true);

create policy "user reads own tier status"
  on public.affiliate_tier_status for select
  to authenticated using (auth.uid() = user_id);

create policy "admin reads all tier status"
  on public.affiliate_tier_status for select
  to authenticated using (public.has_role(auth.uid(), 'admin'));

create or replace function public.recompute_affiliate_tier(_user_id uuid)
returns public.affiliate_tier
language plpgsql
security definer
set search_path = public
as $$
declare
  _count int;
  _total numeric(10,2);
  _tier public.affiliate_tier;
  _prev public.affiliate_tier;
begin
  select count(*)::int, coalesce(sum(amount),0)
    into _count, _total
  from public.megatalent_referral_earnings
  where referrer_id = _user_id and auto_credited = true;

  select tier into _tier
  from public.affiliate_tier_config
  where min_referrals <= _count
  order by min_referrals desc
  limit 1;

  select tier into _prev from public.affiliate_tier_status where user_id = _user_id;

  insert into public.affiliate_tier_status (user_id, tier, approved_referrals, lifetime_earnings_eur, promoted_at, updated_at)
  values (_user_id, _tier, _count, _total,
          case when _prev is null or _prev <> _tier then now() else null end,
          now())
  on conflict (user_id) do update
  set tier = excluded.tier,
      approved_referrals = excluded.approved_referrals,
      lifetime_earnings_eur = excluded.lifetime_earnings_eur,
      promoted_at = case when public.affiliate_tier_status.tier <> excluded.tier then now()
                         else public.affiliate_tier_status.promoted_at end,
      updated_at = now();

  return _tier;
end;
$$;

create or replace function public.trg_recompute_tier_on_earning()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public.recompute_affiliate_tier(new.referrer_id);
  return new;
end;
$$;

drop trigger if exists trg_earnings_recompute_tier on public.megatalent_referral_earnings;
create trigger trg_earnings_recompute_tier
after insert on public.megatalent_referral_earnings
for each row execute function public.trg_recompute_tier_on_earning();

create or replace function public.get_affiliate_reward_eur(_user_id uuid)
returns numeric
language sql stable security definer set search_path = public
as $$
  select coalesce(
    (select c.reward_eur
       from public.affiliate_tier_status s
       join public.affiliate_tier_config c on c.tier = s.tier
      where s.user_id = _user_id),
    5.00
  );
$$;