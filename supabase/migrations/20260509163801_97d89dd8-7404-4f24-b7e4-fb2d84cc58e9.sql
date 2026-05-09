
-- Wishlist
create table if not exists public.coupon_wishlist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  coupon_id uuid not null references public.coupon_listings(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(user_id, coupon_id)
);
alter table public.coupon_wishlist enable row level security;
create policy "wishlist_owner_select" on public.coupon_wishlist for select using (auth.uid() = user_id);
create policy "wishlist_owner_insert" on public.coupon_wishlist for insert with check (auth.uid() = user_id);
create policy "wishlist_owner_delete" on public.coupon_wishlist for delete using (auth.uid() = user_id);

-- Price alerts
create table if not exists public.coupon_price_alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  store_name text not null,
  max_price numeric not null check (max_price > 0),
  min_discount_pct integer not null default 0 check (min_discount_pct between 0 and 100),
  is_active boolean not null default true,
  last_notified_at timestamptz,
  created_at timestamptz not null default now()
);
alter table public.coupon_price_alerts enable row level security;
create policy "alerts_owner_all" on public.coupon_price_alerts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists idx_alerts_active_store on public.coupon_price_alerts (is_active, lower(store_name));

-- Saved searches
create table if not exists public.coupon_saved_searches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  params jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
alter table public.coupon_saved_searches enable row level security;
create policy "saved_searches_owner_all" on public.coupon_saved_searches for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Cashback ledger
create table if not exists public.coupon_cashback_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  order_id uuid not null references public.coupon_orders(id) on delete cascade,
  amount_eur numeric not null,
  rate numeric not null default 0.02,
  created_at timestamptz not null default now(),
  unique(order_id)
);
alter table public.coupon_cashback_ledger enable row level security;
create policy "cashback_owner_select" on public.coupon_cashback_ledger for select using (auth.uid() = user_id);

-- Trigger: award 2% cashback when coupon order is released/completed
create or replace function public.award_coupon_cashback()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  cb numeric;
begin
  -- Only when escrow becomes released and we don't already have a cashback row
  if (new.escrow_status = 'released' and (old.escrow_status is distinct from 'released')) then
    cb := round((coalesce(new.amount, 0) * 0.02)::numeric, 2);
    if cb > 0 and new.buyer_id is not null then
      insert into public.coupon_cashback_ledger(user_id, order_id, amount_eur, rate)
      values (new.buyer_id, new.id, cb, 0.02)
      on conflict (order_id) do nothing;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_award_coupon_cashback on public.coupon_orders;
create trigger trg_award_coupon_cashback
after update on public.coupon_orders
for each row execute function public.award_coupon_cashback();
