
-- Video call bookings
create table if not exists public.support_video_bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  email text not null,
  name text not null,
  topic text not null,
  scheduled_at timestamptz not null,
  duration_minutes int not null default 30,
  meeting_url text,
  status text not null default 'pending',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.support_video_bookings enable row level security;

create policy "Users view own bookings"
  on public.support_video_bookings for select
  using (auth.uid() = user_id);
create policy "Users create own bookings"
  on public.support_video_bookings for insert
  with check (auth.uid() = user_id);
create policy "Users update own bookings"
  on public.support_video_bookings for update
  using (auth.uid() = user_id);
create policy "Admins view all bookings"
  on public.support_video_bookings for select
  using (public.has_role(auth.uid(), 'admin'));
create policy "Admins manage all bookings"
  on public.support_video_bookings for all
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create index if not exists support_video_bookings_user_idx on public.support_video_bookings(user_id, scheduled_at desc);

-- Public status incidents
create table if not exists public.status_incidents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  severity text not null default 'minor',
  components text[] not null default '{}',
  status text not null default 'investigating',
  started_at timestamptz not null default now(),
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.status_incidents enable row level security;

create policy "Anyone can view incidents"
  on public.status_incidents for select
  using (true);
create policy "Admins manage incidents"
  on public.status_incidents for all
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create index if not exists status_incidents_started_idx on public.status_incidents(started_at desc);
