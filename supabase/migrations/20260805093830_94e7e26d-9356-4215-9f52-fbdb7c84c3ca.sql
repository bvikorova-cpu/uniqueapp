
create table if not exists public.anonymous_dating_swipes (
  id uuid primary key default gen_random_uuid(),
  swiper_id uuid not null,
  target_id uuid not null,
  direction text not null check (direction in ('like','pass')),
  created_at timestamptz not null default now(),
  unique (swiper_id, target_id)
);

grant select, insert on public.anonymous_dating_swipes to authenticated;
grant all on public.anonymous_dating_swipes to service_role;

alter table public.anonymous_dating_swipes enable row level security;

do $$ begin
  create policy "own swipes select" on public.anonymous_dating_swipes
    for select to authenticated using (swiper_id = auth.uid());
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "own swipes insert" on public.anonymous_dating_swipes
    for insert to authenticated with check (swiper_id = auth.uid());
exception when duplicate_object then null; end $$;

create index if not exists idx_anon_swipes_target on public.anonymous_dating_swipes(target_id, direction);

alter table public.anonymous_dating_profiles add column if not exists photo_path text;
alter table public.anonymous_dating_matches add column if not exists photo_unlocked_at timestamptz;
alter table public.anonymous_dating_matches add column if not exists photo_reveal_days integer not null default 7;

create or replace function public.get_anon_date_deck(_limit integer default 20)
returns table (
  user_id uuid,
  anonymous_name text,
  age_range text,
  gender text,
  location text,
  interests text[],
  personality_traits text[],
  relationship_goal text,
  looking_for text,
  has_photo boolean
)
language sql
stable
security definer
set search_path = public
as $$
  select p.user_id, p.anonymous_name, p.age_range, p.gender, p.location,
         p.interests, p.personality_traits, p.relationship_goal, p.looking_for,
         (p.photo_path is not null) as has_photo
  from public.anonymous_dating_profiles p
  where p.is_active is true
    and auth.uid() is not null
    and p.user_id <> auth.uid()
    and not exists (
      select 1 from public.anonymous_dating_swipes s
      where s.swiper_id = auth.uid() and s.target_id = p.user_id
    )
    and not exists (
      select 1 from public.anonymous_dating_matches m
      where (m.user1_id = auth.uid() and m.user2_id = p.user_id)
         or (m.user2_id = auth.uid() and m.user1_id = p.user_id)
    )
    and not exists (
      select 1 from public.blocked_users b
      where (b.user_id = auth.uid() and b.blocked_user_id = p.user_id)
         or (b.user_id = p.user_id and b.blocked_user_id = auth.uid())
    )
  order by random()
  limit greatest(1, least(coalesce(_limit, 20), 50));
$$;

grant execute on function public.get_anon_date_deck(integer) to authenticated;

create or replace function public.anon_date_swipe(_target uuid, _direction text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  _me uuid := auth.uid();
  _match_id uuid;
  _mutual boolean := false;
begin
  if _me is null then raise exception 'not_authenticated'; end if;
  if _target is null or _target = _me then raise exception 'invalid_target'; end if;
  if _direction not in ('like','pass') then raise exception 'invalid_direction'; end if;

  insert into public.anonymous_dating_swipes (swiper_id, target_id, direction)
  values (_me, _target, _direction)
  on conflict (swiper_id, target_id) do update set direction = excluded.direction;

  if _direction = 'like' then
    select true into _mutual
    from public.anonymous_dating_swipes s
    where s.swiper_id = _target and s.target_id = _me and s.direction = 'like'
    limit 1;
  end if;

  if coalesce(_mutual, false) then
    select id into _match_id from public.anonymous_dating_matches
    where (user1_id = _me and user2_id = _target) or (user1_id = _target and user2_id = _me)
    limit 1;

    if _match_id is null then
      insert into public.anonymous_dating_matches (user1_id, user2_id, status)
      values (least(_me, _target), greatest(_me, _target), 'active')
      returning id into _match_id;
    end if;
  end if;

  return jsonb_build_object('matched', coalesce(_mutual, false), 'match_id', _match_id);
end;
$$;

grant execute on function public.anon_date_swipe(uuid, text) to authenticated;

create or replace function public.anon_date_photo_state(_match_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  _me uuid := auth.uid();
  m record;
  _partner uuid;
  _unlock_at timestamptz;
  _has_photo boolean;
begin
  if _me is null then raise exception 'not_authenticated'; end if;

  select * into m from public.anonymous_dating_matches
  where id = _match_id and (user1_id = _me or user2_id = _me);
  if m.id is null then raise exception 'match_not_found'; end if;

  _partner := case when m.user1_id = _me then m.user2_id else m.user1_id end;
  _unlock_at := coalesce(m.created_at, now()) + make_interval(days => coalesce(m.photo_reveal_days, 7));

  select (photo_path is not null) into _has_photo
  from public.anonymous_dating_profiles where user_id = _partner;

  return jsonb_build_object(
    'partner_has_photo', coalesce(_has_photo, false),
    'unlock_at', _unlock_at,
    'unlocked', (m.photo_unlocked_at is not null) or now() >= _unlock_at,
    'paid_unlock', m.photo_unlocked_at is not null,
    'reveal_days', coalesce(m.photo_reveal_days, 7),
    'credit_cost', 5
  );
end;
$$;

grant execute on function public.anon_date_photo_state(uuid) to authenticated;

create or replace function public.anon_date_unlock_photo(_match_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  _me uuid := auth.uid();
  m record;
  _ok boolean;
begin
  if _me is null then raise exception 'not_authenticated'; end if;

  select * into m from public.anonymous_dating_matches
  where id = _match_id and (user1_id = _me or user2_id = _me);
  if m.id is null then raise exception 'match_not_found'; end if;

  if m.photo_unlocked_at is not null then
    return jsonb_build_object('unlocked', true, 'charged', 0);
  end if;

  select public.deduct_ai_credits(_me, 5, 'anon_date_photo_unlock', 'anonymous_dating') into _ok;
  if _ok is not true then raise exception 'insufficient_credits'; end if;

  update public.anonymous_dating_matches
  set photo_unlocked_at = now()
  where id = _match_id;

  return jsonb_build_object('unlocked', true, 'charged', 5);
end;
$$;

grant execute on function public.anon_date_unlock_photo(uuid) to authenticated;

do $$ begin
  create policy "anon date photo own insert" on storage.objects
    for insert to authenticated
    with check (bucket_id = 'anonymous-date-photos' and (storage.foldername(name))[1] = auth.uid()::text);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "anon date photo own update" on storage.objects
    for update to authenticated
    using (bucket_id = 'anonymous-date-photos' and (storage.foldername(name))[1] = auth.uid()::text);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "anon date photo own select" on storage.objects
    for select to authenticated
    using (bucket_id = 'anonymous-date-photos' and (storage.foldername(name))[1] = auth.uid()::text);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "anon date photo own delete" on storage.objects
    for delete to authenticated
    using (bucket_id = 'anonymous-date-photos' and (storage.foldername(name))[1] = auth.uid()::text);
exception when duplicate_object then null; end $$;
