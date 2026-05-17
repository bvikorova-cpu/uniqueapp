
-- Safety & Bullying parity pack tables

create table if not exists public.safety_toxicity_scans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  input_text text not null,
  toxicity_score int,
  categories jsonb default '{}'::jsonb,
  ai_analysis text,
  recommended_actions jsonb default '[]'::jsonb,
  credits_used int default 6,
  created_at timestamptz not null default now()
);
alter table public.safety_toxicity_scans enable row level security;
create policy "own_select_toxicity" on public.safety_toxicity_scans for select using (auth.uid() = user_id);
create policy "own_insert_toxicity" on public.safety_toxicity_scans for insert with check (auth.uid() = user_id);
create policy "own_delete_toxicity" on public.safety_toxicity_scans for delete using (auth.uid() = user_id);

create table if not exists public.safety_platform_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  platform text not null,
  incident_summary text not null,
  evidence_urls jsonb default '[]'::jsonb,
  generated_letter text,
  status text default 'draft',
  credits_used int default 4,
  created_at timestamptz not null default now()
);
alter table public.safety_platform_reports enable row level security;
create policy "own_all_platreport" on public.safety_platform_reports for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists public.safety_restorative_letters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  recipient_type text not null,
  context text not null,
  tone text default 'firm',
  generated_letter text,
  credits_used int default 6,
  created_at timestamptz not null default now()
);
alter table public.safety_restorative_letters enable row level security;
create policy "own_all_restorative" on public.safety_restorative_letters for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists public.safety_trusted_allies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  ally_name text not null,
  ally_phone text,
  ally_email text,
  relationship text,
  sort_order int default 0,
  created_at timestamptz not null default now()
);
alter table public.safety_trusted_allies enable row level security;
create policy "own_all_allies" on public.safety_trusted_allies for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists public.safety_safe_word (
  user_id uuid primary key references auth.users(id) on delete cascade,
  code_phrase text not null,
  alert_message text default 'I need help. Please contact me.',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.safety_safe_word enable row level security;
create policy "own_all_safeword" on public.safety_safe_word for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists public.safety_wellbeing_pulse (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mood_score int not null,
  anxiety_score int not null,
  safety_score int not null,
  ai_risk_level text,
  ai_advice text,
  credits_used int default 6,
  created_at timestamptz not null default now()
);
alter table public.safety_wellbeing_pulse enable row level security;
create policy "own_all_pulse" on public.safety_wellbeing_pulse for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists public.safety_bystander_scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  scenario_key text not null,
  choice text not null,
  score int default 0,
  feedback text,
  created_at timestamptz not null default now()
);
alter table public.safety_bystander_scores enable row level security;
create policy "own_all_bystander" on public.safety_bystander_scores for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists public.safety_daily_affirmations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  affirmation text not null,
  theme text,
  for_date date not null default current_date,
  credits_used int default 6,
  created_at timestamptz not null default now(),
  unique(user_id, for_date)
);
alter table public.safety_daily_affirmations enable row level security;
create policy "own_all_affirmation" on public.safety_daily_affirmations for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Update trigger for safe word
create trigger set_safeword_updated_at before update on public.safety_safe_word
  for each row execute function public.update_updated_at_column();
