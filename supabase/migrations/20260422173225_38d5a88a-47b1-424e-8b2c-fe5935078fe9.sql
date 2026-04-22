create table if not exists public.sca_pending_actions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  email text not null,
  stripe_customer_id text,
  stripe_invoice_id text unique,
  stripe_payment_intent_id text,
  amount_cents integer not null default 0,
  currency text not null default 'eur',
  hosted_invoice_url text,
  next_action_url text,
  status text not null default 'requires_action',
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists sca_pending_actions_email_idx on public.sca_pending_actions (email);
create index if not exists sca_pending_actions_status_idx on public.sca_pending_actions (status);
create index if not exists sca_pending_actions_created_idx on public.sca_pending_actions (created_at desc);

alter table public.sca_pending_actions enable row level security;

create policy "users view own sca actions"
  on public.sca_pending_actions for select
  to authenticated
  using (
    user_id = auth.uid()
    or email = (select email from auth.users where id = auth.uid())
  );

create policy "admins view all sca actions"
  on public.sca_pending_actions for select
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));