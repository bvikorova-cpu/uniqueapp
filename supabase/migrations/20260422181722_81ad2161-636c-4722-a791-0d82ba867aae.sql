create table if not exists public.subscription_pause_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  user_email text not null,
  stripe_subscription_id text not null,
  paused_at timestamptz not null default now(),
  resumes_at timestamptz,
  months integer not null default 1,
  resumed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_pause_log_user_year on public.subscription_pause_log (user_id, paused_at desc);

alter table public.subscription_pause_log enable row level security;

create policy "users read own pause log"
  on public.subscription_pause_log for select
  to authenticated
  using (user_id = auth.uid());

create policy "admins read all pause log"
  on public.subscription_pause_log for select
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create policy "service role inserts pause log"
  on public.subscription_pause_log for insert
  to service_role
  with check (true);

create table if not exists public.subscription_pause_config (
  id integer primary key default 1,
  max_pauses_per_year integer not null default 3,
  max_months_per_pause integer not null default 3,
  updated_at timestamptz not null default now(),
  constraint pause_config_singleton check (id = 1)
);

insert into public.subscription_pause_config (id) values (1)
on conflict (id) do nothing;

alter table public.subscription_pause_config enable row level security;

create policy "anyone reads pause config"
  on public.subscription_pause_config for select
  to anon, authenticated
  using (true);

create or replace function public.get_user_pause_count(_user_id uuid)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::int
  from public.subscription_pause_log
  where user_id = _user_id
    and paused_at >= now() - interval '12 months'
$$;