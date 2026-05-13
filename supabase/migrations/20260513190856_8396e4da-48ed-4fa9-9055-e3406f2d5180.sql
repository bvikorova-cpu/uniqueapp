
-- Creator webhooks
create table if not exists public.creator_webhooks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  url text not null,
  secret text not null default encode(gen_random_bytes(24),'hex'),
  events text[] not null default '{}',
  is_active boolean not null default true,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_creator_webhooks_user on public.creator_webhooks(user_id);
create index if not exists idx_creator_webhooks_active on public.creator_webhooks(is_active) where is_active = true;

alter table public.creator_webhooks enable row level security;

create policy "Owner can read own webhooks"
  on public.creator_webhooks for select
  using (auth.uid() = user_id);

create policy "Owner can insert own webhooks"
  on public.creator_webhooks for insert
  with check (auth.uid() = user_id);

create policy "Owner can update own webhooks"
  on public.creator_webhooks for update
  using (auth.uid() = user_id);

create policy "Owner can delete own webhooks"
  on public.creator_webhooks for delete
  using (auth.uid() = user_id);

-- Webhook deliveries log
create table if not exists public.webhook_deliveries (
  id uuid primary key default gen_random_uuid(),
  webhook_id uuid not null references public.creator_webhooks(id) on delete cascade,
  event_type text not null,
  payload jsonb not null,
  status_code integer,
  response_body text,
  attempt_count integer not null default 1,
  delivered_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_webhook_deliveries_webhook on public.webhook_deliveries(webhook_id, created_at desc);

alter table public.webhook_deliveries enable row level security;

create policy "Owner can read own webhook deliveries"
  on public.webhook_deliveries for select
  using (
    exists (select 1 from public.creator_webhooks w
            where w.id = webhook_deliveries.webhook_id and w.user_id = auth.uid())
  );

-- Service role only inserts (handled by service key); no public insert policy.

-- Accessibility fields on posts
alter table public.posts add column if not exists alt_text text;
alter table public.posts add column if not exists captions_url text;
