
-- Affiliate referrals
create table if not exists public.coupon_affiliate_referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid not null,
  referred_user_id uuid not null,
  order_id uuid references public.coupon_orders(id) on delete set null,
  commission_eur numeric(10,2) not null default 0,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);
alter table public.coupon_affiliate_referrals enable row level security;
create policy "referrer reads own" on public.coupon_affiliate_referrals for select using (auth.uid() = referrer_id);
create index if not exists idx_caf_referrer on public.coupon_affiliate_referrals(referrer_id);
create index if not exists idx_caf_referred on public.coupon_affiliate_referrals(referred_user_id);

-- Gift card balance
create table if not exists public.coupon_gift_card_balance (
  user_id uuid primary key,
  balance_eur numeric(10,2) not null default 0,
  updated_at timestamptz not null default now()
);
alter table public.coupon_gift_card_balance enable row level security;
create policy "user reads own balance" on public.coupon_gift_card_balance for select using (auth.uid() = user_id);

-- Extension / crypto waitlist
create table if not exists public.coupon_extension_waitlist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  kind text not null check (kind in ('extension','crypto','bulk')),
  email text,
  browser text,
  created_at timestamptz not null default now()
);
alter table public.coupon_extension_waitlist enable row level security;
create policy "user inserts own waitlist" on public.coupon_extension_waitlist for insert with check (auth.uid() = user_id);
create policy "user reads own waitlist" on public.coupon_extension_waitlist for select using (auth.uid() = user_id);

-- Loyalty tier view
create or replace view public.coupon_loyalty_tier as
with totals as (
  select buyer_id as user_id, coalesce(sum(amount), 0)::numeric(10,2) as lifetime_spent_eur
  from public.coupon_orders
  where escrow_status = 'released' or status in ('completed','delivered')
  group by buyer_id
)
select
  user_id,
  lifetime_spent_eur,
  case
    when lifetime_spent_eur >= 1000 then 'diamond'
    when lifetime_spent_eur >= 300 then 'gold'
    when lifetime_spent_eur >= 100 then 'silver'
    else 'bronze'
  end as tier,
  case
    when lifetime_spent_eur >= 1000 then '{"cashback_pct":5,"priority_support":true,"early_access":true,"discount_pct":3}'::jsonb
    when lifetime_spent_eur >= 300 then '{"cashback_pct":4,"priority_support":true,"early_access":true,"discount_pct":2}'::jsonb
    when lifetime_spent_eur >= 100 then '{"cashback_pct":3,"priority_support":false,"early_access":false,"discount_pct":1}'::jsonb
    else '{"cashback_pct":2,"priority_support":false,"early_access":false,"discount_pct":0}'::jsonb
  end as perks
from totals;

grant select on public.coupon_loyalty_tier to authenticated;

-- Affiliate commission trigger: when an order is released, credit 5% to referrer if profile.referred_by exists
create or replace function public.award_coupon_affiliate_commission()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_referrer uuid;
begin
  if new.escrow_status = 'released' and (old.escrow_status is distinct from 'released') then
    select referred_by into v_referrer from public.profiles where id = new.buyer_id;
    if v_referrer is not null and v_referrer <> new.buyer_id then
      insert into public.coupon_affiliate_referrals(referrer_id, referred_user_id, order_id, commission_eur, status)
      values (v_referrer, new.buyer_id, new.id, round((coalesce(new.amount,0) * 0.05)::numeric, 2), 'credited');
      insert into public.coupon_gift_card_balance(user_id, balance_eur, updated_at)
      values (v_referrer, round((coalesce(new.amount,0) * 0.05)::numeric, 2), now())
      on conflict (user_id) do update set balance_eur = coupon_gift_card_balance.balance_eur + excluded.balance_eur, updated_at = now();
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_award_coupon_affiliate on public.coupon_orders;
create trigger trg_award_coupon_affiliate
after update on public.coupon_orders
for each row execute function public.award_coupon_affiliate_commission();
