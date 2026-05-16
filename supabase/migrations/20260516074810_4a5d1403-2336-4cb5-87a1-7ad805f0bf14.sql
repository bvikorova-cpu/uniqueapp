-- ============ XP ============
create table if not exists public.user_xp (
  user_id uuid primary key,
  total_xp int not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.xp_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  source text not null,
  amount int not null,
  ref_id text,
  created_at timestamptz not null default now(),
  unique (user_id, source, ref_id)
);

create index if not exists idx_xp_events_user on public.xp_events(user_id, created_at desc);

alter table public.user_xp enable row level security;
alter table public.xp_events enable row level security;

drop policy if exists user_xp_read_own on public.user_xp;
create policy user_xp_read_own on public.user_xp for select to authenticated using (auth.uid() = user_id);

drop policy if exists xp_events_read_own on public.xp_events;
create policy xp_events_read_own on public.xp_events for select to authenticated using (auth.uid() = user_id);
-- No INSERT/UPDATE/DELETE policies → only SECURITY DEFINER functions can write

create or replace function public.award_xp(_user_id uuid, _amount int, _source text, _ref_id text default null)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  inserted boolean := false;
  new_total int;
begin
  if _amount <= 0 or _user_id is null then return 0; end if;
  insert into public.xp_events (user_id, source, amount, ref_id)
  values (_user_id, _source, _amount, _ref_id)
  on conflict (user_id, source, ref_id) do nothing
  returning true into inserted;

  if inserted is null then
    select total_xp into new_total from public.user_xp where user_id = _user_id;
    return coalesce(new_total, 0);
  end if;

  insert into public.user_xp (user_id, total_xp, updated_at)
  values (_user_id, _amount, now())
  on conflict (user_id) do update set total_xp = public.user_xp.total_xp + excluded.total_xp, updated_at = now()
  returning total_xp into new_total;

  return new_total;
end $$;

-- ============ DAILY QUESTS ============
create table if not exists public.daily_quest_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  quest_id text not null,
  quest_date date not null default current_date,
  xp_awarded int not null default 0,
  created_at timestamptz not null default now(),
  unique (user_id, quest_id, quest_date)
);

create index if not exists idx_dqc_user_date on public.daily_quest_completions(user_id, quest_date);

alter table public.daily_quest_completions enable row level security;

drop policy if exists dqc_read_own on public.daily_quest_completions;
create policy dqc_read_own on public.daily_quest_completions for select to authenticated using (auth.uid() = user_id);

drop policy if exists dqc_insert_own on public.daily_quest_completions;
create policy dqc_insert_own on public.daily_quest_completions for insert to authenticated
with check (auth.uid() = user_id and quest_date = current_date);

create or replace function public.dqc_award_xp()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.xp_awarded > 0 then
    perform public.award_xp(new.user_id, new.xp_awarded, 'daily_quest', new.quest_id || ':' || new.quest_date::text);
  end if;
  return new;
end $$;

drop trigger if exists trg_dqc_award on public.daily_quest_completions;
create trigger trg_dqc_award after insert on public.daily_quest_completions
for each row execute function public.dqc_award_xp();

-- ============ PREDICTIONS ============
create table if not exists public.battle_royale_predictions (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.battle_royale_tournaments(id) on delete cascade,
  round int not null,
  user_id uuid not null,
  predicted_participant_id uuid not null references public.battle_royale_participants(id) on delete cascade,
  awarded boolean not null default false,
  created_at timestamptz not null default now(),
  unique (tournament_id, round, user_id)
);

create index if not exists idx_brp_tour_round on public.battle_royale_predictions(tournament_id, round);

alter table public.battle_royale_predictions enable row level security;

drop policy if exists brp_read_own on public.battle_royale_predictions;
create policy brp_read_own on public.battle_royale_predictions for select to authenticated using (auth.uid() = user_id);

drop policy if exists brp_insert_own on public.battle_royale_predictions;
create policy brp_insert_own on public.battle_royale_predictions for insert to authenticated
with check (
  auth.uid() = user_id
  and exists (
    select 1 from public.battle_royale_matches m
    where m.tournament_id = tournament_id and m.round = round and m.status = 'open'
      and predicted_participant_id in (m.participant_a_id, m.participant_b_id)
  )
);

-- Updated advance function: awards XP for correct predictions
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
  pred record;
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

  -- Award +10 XP to correct predictions in this round
  for pred in
    select p.* from public.battle_royale_predictions p
    where p.tournament_id = _tournament_id and p.round = cur_round
      and p.predicted_participant_id = any(winners)
      and p.awarded = false
  loop
    perform public.award_xp(pred.user_id, 10, 'prediction', pred.id::text);
    update public.battle_royale_predictions set awarded = true where id = pred.id;
  end loop;

  if array_length(winners,1) = 1 then
    update public.battle_royale_tournaments
      set status = 'completed', ends_at = now(), champion_participant_id = winners[1]
      where id = _tournament_id;
    -- Champion bonus: 100 XP
    declare champ_user uuid;
    begin
      select user_id into champ_user from public.battle_royale_participants where id = winners[1];
      if champ_user is not null then
        perform public.award_xp(champ_user, 100, 'br_champion', _tournament_id::text);
      end if;
    end;
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

-- ============ FAN CLUBS ============
create table if not exists public.fan_club_memberships (
  id uuid primary key default gen_random_uuid(),
  talent_user_id uuid not null,
  fan_user_id uuid not null,
  created_at timestamptz not null default now(),
  unique (talent_user_id, fan_user_id)
);

create index if not exists idx_fcm_talent on public.fan_club_memberships(talent_user_id);
create index if not exists idx_fcm_fan on public.fan_club_memberships(fan_user_id);

alter table public.fan_club_memberships enable row level security;

drop policy if exists fcm_read_all on public.fan_club_memberships;
create policy fcm_read_all on public.fan_club_memberships for select using (true);

drop policy if exists fcm_insert_own on public.fan_club_memberships;
create policy fcm_insert_own on public.fan_club_memberships for insert to authenticated
with check (auth.uid() = fan_user_id and fan_user_id <> talent_user_id);

drop policy if exists fcm_delete_own on public.fan_club_memberships;
create policy fcm_delete_own on public.fan_club_memberships for delete to authenticated
using (auth.uid() = fan_user_id);

create or replace view public.fan_club_top_talents as
select talent_user_id, count(*)::int as member_count
from public.fan_club_memberships
group by talent_user_id
order by member_count desc;

-- ============ CHAT ============
create table if not exists public.talent_chat_messages (
  id uuid primary key default gen_random_uuid(),
  category text not null default 'global',
  user_id uuid not null,
  display_name text not null,
  body text not null check (char_length(body) between 1 and 500),
  created_at timestamptz not null default now()
);

create index if not exists idx_tcm_cat_created on public.talent_chat_messages(category, created_at desc);

alter table public.talent_chat_messages enable row level security;

drop policy if exists tcm_read_all on public.talent_chat_messages;
create policy tcm_read_all on public.talent_chat_messages for select using (true);

drop policy if exists tcm_insert_own on public.talent_chat_messages;
create policy tcm_insert_own on public.talent_chat_messages for insert to authenticated
with check (auth.uid() = user_id);

alter table public.talent_chat_messages replica identity full;
do $$ begin
  alter publication supabase_realtime add table public.talent_chat_messages;
exception when others then null; end $$;