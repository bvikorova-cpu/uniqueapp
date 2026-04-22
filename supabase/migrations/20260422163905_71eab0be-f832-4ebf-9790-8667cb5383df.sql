create table if not exists public.dunning_events (
  id uuid primary key default gen_random_uuid(),
  stripe_event_id text unique not null,
  stripe_customer_id text,
  stripe_subscription_id text,
  stripe_invoice_id text,
  user_id uuid references public.profiles(id) on delete set null,
  email text,
  amount_due_cents integer not null default 0,
  currency text not null default 'eur',
  attempt_count integer not null default 0,
  next_retry_at timestamptz,
  hosted_invoice_url text,
  kind text not null check (kind in ('failed','requires_action','recovered')),
  recovered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_dunning_events_user on public.dunning_events(user_id);
create index if not exists idx_dunning_events_sub on public.dunning_events(stripe_subscription_id);
create index if not exists idx_dunning_events_kind on public.dunning_events(kind);
create index if not exists idx_dunning_events_created on public.dunning_events(created_at desc);

alter table public.dunning_events enable row level security;

create policy "Users view own dunning"
  on public.dunning_events for select
  to authenticated
  using (user_id = auth.uid());

create policy "Admins view all dunning"
  on public.dunning_events for select
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create policy "Admins update dunning"
  on public.dunning_events for update
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- Inserts only via service role (Stripe webhook). No insert policy = blocked for anon/authenticated.
