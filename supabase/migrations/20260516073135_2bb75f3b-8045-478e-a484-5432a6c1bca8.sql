-- ENUMS
do $$ begin
  create type public.br_status as enum ('signup','active','completed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.br_match_status as enum ('pending','open','closed');
exception when duplicate_object then null; end $$;

-- TABLES
create table if not exists public.battle_royale_tournaments (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  status public.br_status not null default 'signup',
  current_round int not null default 0,
  max_participants int not null default 16,
  signup_ends_at timestamptz,
  starts_at timestamptz,
  ends_at timestamptz,
  champion_participant_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.battle_royale_participants (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.battle_royale_tournaments(id) on delete cascade,
  submission_id uuid not null,
  user_id uuid not null,
  seed int,
  eliminated_round int,
  created_at timestamptz not null default now(),
  unique (tournament_id, submission_id),
  unique (tournament_id, user_id)
);

create table if not exists public.battle_royale_matches (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.battle_royale_tournaments(id) on delete cascade,
  round int not null,
  slot int not null,
  participant_a_id uuid references public.battle_royale_participants(id) on delete set null,
  participant_b_id uuid references public.battle_royale_participants(id) on delete set null,
  votes_a int not null default 0,
  votes_b int not null default 0,
  winner_id uuid references public.battle_royale_participants(id) on delete set null,
  status public.br_match_status not null default 'pending',
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  unique (tournament_id, round, slot)
);

create table if not exists public.battle_royale_votes (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.battle_royale_matches(id) on delete cascade,
  user_id uuid not null,
  voted_for_participant_id uuid not null references public.battle_royale_participants(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (match_id, user_id)
);

create index if not exists idx_br_part_tour on public.battle_royale_participants(tournament_id);
create index if not exists idx_br_match_tour_round on public.battle_royale_matches(tournament_id, round);
create index if not exists idx_br_votes_match on public.battle_royale_votes(match_id);
create index if not exists idx_br_tour_cat_status on public.battle_royale_tournaments(category, status);

-- updated_at trigger
create or replace function public.br_set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists trg_br_tour_updated on public.battle_royale_tournaments;
create trigger trg_br_tour_updated before update on public.battle_royale_tournaments
for each row execute function public.br_set_updated_at();

-- Vote tally trigger
create or replace function public.br_after_vote()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  m public.battle_royale_matches;
begin
  select * into m from public.battle_royale_matches where id = new.match_id;
  if m.status <> 'open' then
    raise exception 'Voting is not open for this match';
  end if;
  if m.ends_at is not null and m.ends_at < now() then
    raise exception 'Voting closed';
  end if;
  if new.voted_for_participant_id = m.participant_a_id then
    update public.battle_royale_matches set votes_a = votes_a + 1 where id = m.id;
  elsif new.voted_for_participant_id = m.participant_b_id then
    update public.battle_royale_matches set votes_b = votes_b + 1 where id = m.id;
  else
    raise exception 'Invalid participant for this match';
  end if;
  return new;
end $$;

drop trigger if exists trg_br_after_vote on public.battle_royale_votes;
create trigger trg_br_after_vote after insert on public.battle_royale_votes
for each row execute function public.br_after_vote();

-- RLS
alter table public.battle_royale_tournaments enable row level security;
alter table public.battle_royale_participants enable row level security;
alter table public.battle_royale_matches enable row level security;
alter table public.battle_royale_votes enable row level security;

-- Read for everyone
drop policy if exists br_tour_read on public.battle_royale_tournaments;
create policy br_tour_read on public.battle_royale_tournaments for select using (true);

drop policy if exists br_part_read on public.battle_royale_participants;
create policy br_part_read on public.battle_royale_participants for select using (true);

drop policy if exists br_match_read on public.battle_royale_matches;
create policy br_match_read on public.battle_royale_matches for select using (true);

drop policy if exists br_votes_read on public.battle_royale_votes;
create policy br_votes_read on public.battle_royale_votes for select using (auth.uid() = user_id);

-- Signups: authenticated users can register self while in signup
drop policy if exists br_part_insert on public.battle_royale_participants;
create policy br_part_insert on public.battle_royale_participants
for insert to authenticated
with check (
  auth.uid() = user_id
  and exists (
    select 1 from public.battle_royale_tournaments t
    where t.id = tournament_id and t.status = 'signup'
      and (select count(*) from public.battle_royale_participants p where p.tournament_id = t.id) < t.max_participants
  )
);

-- Votes: authenticated users can vote once per open match
drop policy if exists br_votes_insert on public.battle_royale_votes;
create policy br_votes_insert on public.battle_royale_votes
for insert to authenticated
with check (
  auth.uid() = user_id
  and exists (
    select 1 from public.battle_royale_matches m
    where m.id = match_id and m.status = 'open'
      and (m.ends_at is null or m.ends_at > now())
      and voted_for_participant_id in (m.participant_a_id, m.participant_b_id)
  )
);

-- HELPERS: start tournament from top submissions in a category
create or replace function public.start_battle_royale(_category text, _max int default 16, _round_hours int default 24)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  t_id uuid;
  rec record;
  i int := 0;
  parts uuid[];
  slot_i int := 0;
begin
  insert into public.battle_royale_tournaments (category, status, current_round, max_participants, starts_at)
  values (_category, 'active', 1, _max, now())
  returning id into t_id;

  for rec in
    select id, user_id from public.talent_submissions
    where category::text = _category and is_active = true
    order by votes_count desc nulls last, created_at desc
    limit _max
  loop
    insert into public.battle_royale_participants (tournament_id, submission_id, user_id, seed)
    values (t_id, rec.id, rec.user_id, i)
    on conflict do nothing;
    i := i + 1;
  end loop;

  select array_agg(id order by seed) into parts from public.battle_royale_participants where tournament_id = t_id;

  if parts is null or array_length(parts,1) < 2 then
    update public.battle_royale_tournaments set status = 'signup' where id = t_id;
    return t_id;
  end if;

  -- Pair seed 0 vs last, 1 vs second-last, etc.
  while slot_i < array_length(parts,1)/2 loop
    insert into public.battle_royale_matches (tournament_id, round, slot, participant_a_id, participant_b_id, status, ends_at)
    values (t_id, 1, slot_i, parts[slot_i+1], parts[array_length(parts,1) - slot_i], 'open', now() + make_interval(hours => _round_hours));
    slot_i := slot_i + 1;
  end loop;

  return t_id;
end $$;

-- Advance tournament: close current round matches, pick winners, create next round
create or replace function public.advance_battle_royale(_tournament_id uuid, _round_hours int default 24)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  cur_round int;
  m record;
  winners uuid[] := '{}';
  i int := 0;
  next_round int;
begin
  select current_round into cur_round from public.battle_royale_tournaments where id = _tournament_id;
  if cur_round is null then return; end if;

  for m in select * from public.battle_royale_matches
           where tournament_id = _tournament_id and round = cur_round
           order by slot
  loop
    if m.winner_id is null then
      if m.participant_b_id is null then
        update public.battle_royale_matches set winner_id = m.participant_a_id, status = 'closed' where id = m.id;
        winners := winners || m.participant_a_id;
      elsif m.votes_a >= m.votes_b then
        update public.battle_royale_matches set winner_id = m.participant_a_id, status = 'closed' where id = m.id;
        winners := winners || m.participant_a_id;
        update public.battle_royale_participants set eliminated_round = cur_round where id = m.participant_b_id;
      else
        update public.battle_royale_matches set winner_id = m.participant_b_id, status = 'closed' where id = m.id;
        winners := winners || m.participant_b_id;
        update public.battle_royale_participants set eliminated_round = cur_round where id = m.participant_a_id;
      end if;
    else
      winners := winners || m.winner_id;
    end if;
  end loop;

  if array_length(winners,1) = 1 then
    update public.battle_royale_tournaments
      set status = 'completed', ends_at = now(), champion_participant_id = winners[1]
      where id = _tournament_id;
    return;
  end if;

  next_round := cur_round + 1;
  i := 0;
  while i < array_length(winners,1)/2 loop
    insert into public.battle_royale_matches (tournament_id, round, slot, participant_a_id, participant_b_id, status, ends_at)
    values (_tournament_id, next_round, i, winners[i*2+1], winners[i*2+2], 'open', now() + make_interval(hours => _round_hours));
    i := i + 1;
  end loop;

  update public.battle_royale_tournaments set current_round = next_round where id = _tournament_id;
end $$;