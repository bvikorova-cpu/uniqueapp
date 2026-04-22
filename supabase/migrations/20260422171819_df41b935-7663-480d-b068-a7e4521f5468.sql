-- Win-back campaigns: track cancelled subs and one-time discount offers
create table if not exists public.winback_campaigns (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  email text not null,
  stripe_customer_id text,
  stripe_subscription_id text,
  cancelled_at timestamptz not null default now(),
  offer_token text not null unique default replace(gen_random_uuid()::text, '-', ''),
  offer_coupon_id text,
  offer_percent_off int not null default 50,
  offer_duration_months int not null default 3,
  offer_expires_at timestamptz not null default (now() + interval '14 days'),
  status text not null default 'pending', -- pending | sent | claimed | expired | dismissed
  sent_at timestamptz,
  claimed_at timestamptz,
  claimed_subscription_id text,
  last_amount_cents int,
  currency text default 'eur',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_winback_user on public.winback_campaigns(user_id);
create index if not exists idx_winback_status on public.winback_campaigns(status);
create index if not exists idx_winback_token on public.winback_campaigns(offer_token);

alter table public.winback_campaigns enable row level security;

create policy "winback_user_select_own"
  on public.winback_campaigns for select
  using (auth.uid() = user_id);

create policy "winback_admin_all"
  on public.winback_campaigns for all
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create trigger trg_winback_updated_at
  before update on public.winback_campaigns
  for each row execute function public.update_updated_at_column();