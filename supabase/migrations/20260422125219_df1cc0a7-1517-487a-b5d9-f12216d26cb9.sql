create table if not exists public.stripe_disputes (
  id uuid primary key default gen_random_uuid(),
  stripe_dispute_id text not null unique,
  stripe_payment_intent_id text,
  stripe_charge_id text,
  payment_record_id uuid references public.payment_records(id) on delete set null,
  amount_cents integer not null default 0,
  currency text not null default 'usd',
  reason text,
  status text not null default 'needs_response',
  evidence_due_by timestamptz,
  evidence jsonb default '{}'::jsonb,
  evidence_submitted_at timestamptz,
  is_charge_refundable boolean default true,
  admin_notes text,
  resolved_at timestamptz,
  resolution text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_stripe_disputes_status on public.stripe_disputes(status);
create index if not exists idx_stripe_disputes_pi on public.stripe_disputes(stripe_payment_intent_id);
create index if not exists idx_stripe_disputes_created on public.stripe_disputes(created_at desc);

alter table public.stripe_disputes enable row level security;

create policy "Admins can view disputes"
  on public.stripe_disputes for select
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can update disputes"
  on public.stripe_disputes for update
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can insert disputes"
  on public.stripe_disputes for insert
  to authenticated
  with check (public.has_role(auth.uid(), 'admin'));

-- Service role (webhooks) bypasses RLS automatically.

create or replace function public.touch_stripe_disputes_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end$$;

drop trigger if exists trg_stripe_disputes_updated_at on public.stripe_disputes;
create trigger trg_stripe_disputes_updated_at
  before update on public.stripe_disputes
  for each row execute function public.touch_stripe_disputes_updated_at();