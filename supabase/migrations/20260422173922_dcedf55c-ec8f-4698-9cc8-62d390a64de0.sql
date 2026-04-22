create table if not exists public.creator_kyc_verifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique,
  email text not null,
  status text not null default 'unverified',
  -- unverified | pending | verified | rejected | requires_input
  stripe_verification_session_id text unique,
  stripe_verification_url text,
  document_type text,
  verified_name text,
  verified_dob date,
  verified_country text,
  rejection_reason text,
  submitted_at timestamptz,
  verified_at timestamptz,
  rejected_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists creator_kyc_status_idx on public.creator_kyc_verifications (status);
create index if not exists creator_kyc_email_idx on public.creator_kyc_verifications (email);

alter table public.creator_kyc_verifications enable row level security;

create policy "users view own kyc"
  on public.creator_kyc_verifications for select
  to authenticated
  using (user_id = auth.uid());

create policy "admins view all kyc"
  on public.creator_kyc_verifications for select
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create policy "admins update kyc"
  on public.creator_kyc_verifications for update
  to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- updated_at trigger
create or replace function public.tg_kyc_touch_updated()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_kyc_touch_updated on public.creator_kyc_verifications;
create trigger trg_kyc_touch_updated
  before update on public.creator_kyc_verifications
  for each row execute function public.tg_kyc_touch_updated();