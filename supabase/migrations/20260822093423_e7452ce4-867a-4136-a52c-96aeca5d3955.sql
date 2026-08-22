-- Wheel of Fortune (word puzzles) -------------------------------------------
create table if not exists public.wheel_wallets (
  user_id uuid primary key,
  spin_coins integer not null default 0,
  total_won integer not null default 0,
  games_won integer not null default 0,
  updated_at timestamptz not null default now()
);
grant select on public.wheel_wallets to authenticated;
grant all on public.wheel_wallets to service_role;
alter table public.wheel_wallets enable row level security;
create policy "own wallet" on public.wheel_wallets for select to authenticated using (auth.uid() = user_id);

create table if not exists public.wheel_puzzles (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  phrase text not null,
  hint text,
  difficulty integer not null default 1,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
grant all on public.wheel_puzzles to service_role;
alter table public.wheel_puzzles enable row level security;
-- no client access: phrases must never reach the browser

create table if not exists public.wheel_games (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  puzzle_id uuid not null references public.wheel_puzzles(id) on delete cascade,
  guessed_letters text[] not null default '{}',
  bank integer not null default 0,
  strikes integer not null default 0,
  spins integer not null default 0,
  pending_value integer,
  last_spin text,
  hint_revealed boolean not null default false,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  finished_at timestamptz
);
create index if not exists wheel_games_user_idx on public.wheel_games(user_id, created_at desc);
grant select on public.wheel_games to authenticated;
grant all on public.wheel_games to service_role;
alter table public.wheel_games enable row level security;
create policy "own games" on public.wheel_games for select to authenticated using (auth.uid() = user_id);

create table if not exists public.wheel_sc_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  delta integer not null,
  balance_after integer not null,
  reason text not null,
  game_id uuid,
  created_at timestamptz not null default now()
);
create index if not exists wheel_sc_ledger_user_idx on public.wheel_sc_ledger(user_id, created_at desc);
grant select on public.wheel_sc_ledger to authenticated;
grant all on public.wheel_sc_ledger to service_role;
alter table public.wheel_sc_ledger enable row level security;
create policy "own sc ledger" on public.wheel_sc_ledger for select to authenticated using (auth.uid() = user_id);

-- helpers -------------------------------------------------------------------
create or replace function public._wheel_sc_apply(_uid uuid, _delta integer, _reason text, _game uuid default null)
returns integer language plpgsql security definer set search_path = public as $$
declare _bal integer;
begin
  insert into public.wheel_wallets(user_id) values (_uid) on conflict (user_id) do nothing;
  update public.wheel_wallets
     set spin_coins = greatest(0, spin_coins + _delta),
         total_won = total_won + greatest(_delta, 0),
         updated_at = now()
   where user_id = _uid
  returning spin_coins into _bal;
  insert into public.wheel_sc_ledger(user_id, delta, balance_after, reason, game_id)
  values (_uid, _delta, _bal, _reason, _game);
  return _bal;
end $$;

create or replace function public._wheel_state(_g public.wheel_games)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  _p public.wheel_puzzles;
  _masked text := '';
  _ch text;
  _i integer;
  _solved boolean := _g.status <> 'active';
begin
  select * into _p from public.wheel_puzzles where id = _g.puzzle_id;
  for _i in 1..length(_p.phrase) loop
    _ch := substr(_p.phrase, _i, 1);
    if _ch !~ '[A-Za-z]' then
      _masked := _masked || _ch;
    elsif _solved or upper(_ch) = any(_g.guessed_letters) then
      _masked := _masked || upper(_ch);
    else
      _masked := _masked || '_';
    end if;
  end loop;
  return jsonb_build_object(
    'game_id', _g.id,
    'category', _p.category,
    'hint', case when _g.hint_revealed or _solved then _p.hint else null end,
    'masked', _masked,
    'guessed', to_jsonb(_g.guessed_letters),
    'bank', _g.bank,
    'strikes', _g.strikes,
    'spins', _g.spins,
    'pending_value', _g.pending_value,
    'last_spin', _g.last_spin,
    'status', _g.status,
    'solution', case when _solved then upper(_p.phrase) else null end
  );
end $$;

-- start a game (1 AI credit) ------------------------------------------------
create or replace function public.wheel_start_game()
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  _uid uuid := auth.uid();
  _spend jsonb;
  _p uuid;
  _g public.wheel_games;
begin
  if _uid is null then return jsonb_build_object('ok', false, 'error', 'not_authenticated'); end if;

  update public.wheel_games set status = 'abandoned', finished_at = now()
   where user_id = _uid and status = 'active';

  select id into _p from public.wheel_puzzles
   where active and id not in (
     select puzzle_id from public.wheel_games where user_id = _uid and status = 'solved'
   )
   order by random() limit 1;
  if _p is null then
    select id into _p from public.wheel_puzzles where active order by random() limit 1;
  end if;
  if _p is null then return jsonb_build_object('ok', false, 'error', 'no_puzzles'); end if;

  _spend := public.spend_ai_credits(1, 'wheel_of_fortune_round', 'wheel');
  if not (_spend->>'ok')::boolean then return _spend; end if;

  insert into public.wheel_games(user_id, puzzle_id) values (_uid, _p) returning * into _g;
  insert into public.wheel_wallets(user_id) values (_uid) on conflict (user_id) do nothing;
  return jsonb_build_object('ok', true, 'state', public._wheel_state(_g));
end $$;

create or replace function public.wheel_get_game()
returns jsonb language plpgsql security definer set search_path = public as $$
declare _uid uuid := auth.uid(); _g public.wheel_games;
begin
  if _uid is null then return jsonb_build_object('ok', false, 'error', 'not_authenticated'); end if;
  select * into _g from public.wheel_games where user_id = _uid and status = 'active'
   order by created_at desc limit 1;
  if _g.id is null then return jsonb_build_object('ok', true, 'state', null); end if;
  return jsonb_build_object('ok', true, 'state', public._wheel_state(_g));
end $$;

create or replace function public.wheel_spin()
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  _uid uuid := auth.uid();
  _g public.wheel_games;
  _values integer[] := array[100,200,300,400,500,500,650,800,800,1000,1500,2500];
  _roll numeric := random();
  _val integer;
  _outcome text;
begin
  if _uid is null then return jsonb_build_object('ok', false, 'error', 'not_authenticated'); end if;
  select * into _g from public.wheel_games where user_id = _uid and status = 'active' for update;
  if _g.id is null then return jsonb_build_object('ok', false, 'error', 'no_active_game'); end if;
  if _g.pending_value is not null then return jsonb_build_object('ok', false, 'error', 'already_spun'); end if;

  if _roll < 0.10 then
    _outcome := 'bankrupt';
    update public.wheel_games
       set bank = 0, pending_value = null, last_spin = 'bankrupt', spins = spins + 1
     where id = _g.id returning * into _g;
  elsif _roll < 0.18 then
    _outcome := 'lose_turn';
    update public.wheel_games
       set pending_value = null, last_spin = 'lose_turn', spins = spins + 1
     where id = _g.id returning * into _g;
  else
    _val := _values[1 + floor(random() * array_length(_values, 1))::int];
    _outcome := _val::text;
    update public.wheel_games
       set pending_value = _val, last_spin = _val::text, spins = spins + 1
     where id = _g.id returning * into _g;
  end if;

  return jsonb_build_object('ok', true, 'outcome', _outcome, 'state', public._wheel_state(_g));
end $$;

create or replace function public.wheel_guess_letter(_letter text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  _uid uuid := auth.uid();
  _g public.wheel_games;
  _phrase text;
  _l text := upper(trim(coalesce(_letter, '')));
  _count integer;
  _vowel boolean;
  _gain integer := 0;
  _sc integer := null;
begin
  if _uid is null then return jsonb_build_object('ok', false, 'error', 'not_authenticated'); end if;
  if _l !~ '^[A-Z]$' then return jsonb_build_object('ok', false, 'error', 'invalid_letter'); end if;
  select * into _g from public.wheel_games where user_id = _uid and status = 'active' for update;
  if _g.id is null then return jsonb_build_object('ok', false, 'error', 'no_active_game'); end if;
  if _l = any(_g.guessed_letters) then return jsonb_build_object('ok', false, 'error', 'already_guessed'); end if;

  _vowel := _l in ('A','E','I','O','U');
  if _vowel then
    insert into public.wheel_wallets(user_id) values (_uid) on conflict (user_id) do nothing;
    if (select spin_coins from public.wheel_wallets where user_id = _uid) < 250 then
      return jsonb_build_object('ok', false, 'error', 'not_enough_coins');
    end if;
    _sc := public._wheel_sc_apply(_uid, -250, 'buy_vowel', _g.id);
  else
    if _g.pending_value is null then return jsonb_build_object('ok', false, 'error', 'spin_first'); end if;
  end if;

  select phrase into _phrase from public.wheel_puzzles where id = _g.puzzle_id;
  _count := (length(upper(_phrase)) - length(replace(upper(_phrase), _l, '')));

  if not _vowel and _count > 0 then
    _gain := _g.pending_value * _count;
  end if;

  update public.wheel_games
     set guessed_letters = array_append(guessed_letters, _l),
         bank = bank + _gain,
         pending_value = null,
         strikes = strikes + case when _count = 0 and not _vowel then 1 else 0 end
   where id = _g.id returning * into _g;

  if _g.strikes >= 3 then
    update public.wheel_games set status = 'lost', bank = 0, finished_at = now()
     where id = _g.id returning * into _g;
  end if;

  return jsonb_build_object('ok', true, 'hits', _count, 'gain', _gain,
    'spin_coins', _sc, 'state', public._wheel_state(_g));
end $$;

create or replace function public.wheel_solve(_attempt text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  _uid uuid := auth.uid();
  _g public.wheel_games;
  _p public.wheel_puzzles;
  _norm text;
  _bonus integer;
  _payout integer;
  _sc integer;
begin
  if _uid is null then return jsonb_build_object('ok', false, 'error', 'not_authenticated'); end if;
  select * into _g from public.wheel_games where user_id = _uid and status = 'active' for update;
  if _g.id is null then return jsonb_build_object('ok', false, 'error', 'no_active_game'); end if;
  select * into _p from public.wheel_puzzles where id = _g.puzzle_id;

  _norm := upper(regexp_replace(coalesce(_attempt, ''), '[^A-Za-z]', '', 'g'));
  if _norm = upper(regexp_replace(_p.phrase, '[^A-Za-z]', '', 'g')) then
    _bonus := 250 * greatest(_p.difficulty, 1);
    _payout := _g.bank + _bonus;
    update public.wheel_games set status = 'solved', finished_at = now(), pending_value = null
     where id = _g.id returning * into _g;
    _sc := public._wheel_sc_apply(_uid, _payout, 'puzzle_solved', _g.id);
    update public.wheel_wallets set games_won = games_won + 1 where user_id = _uid;
    return jsonb_build_object('ok', true, 'correct', true, 'payout', _payout,
      'bonus', _bonus, 'spin_coins', _sc, 'state', public._wheel_state(_g));
  end if;

  update public.wheel_games set strikes = strikes + 1, pending_value = null
   where id = _g.id returning * into _g;
  if _g.strikes >= 3 then
    update public.wheel_games set status = 'lost', bank = 0, finished_at = now()
     where id = _g.id returning * into _g;
  end if;
  return jsonb_build_object('ok', true, 'correct', false, 'state', public._wheel_state(_g));
end $$;

-- paid boosters --------------------------------------------------------------
create or replace function public.wheel_buy_hint()
returns jsonb language plpgsql security definer set search_path = public as $$
declare _uid uuid := auth.uid(); _g public.wheel_games; _spend jsonb;
begin
  if _uid is null then return jsonb_build_object('ok', false, 'error', 'not_authenticated'); end if;
  select * into _g from public.wheel_games where user_id = _uid and status = 'active' for update;
  if _g.id is null then return jsonb_build_object('ok', false, 'error', 'no_active_game'); end if;
  if _g.hint_revealed then return jsonb_build_object('ok', true, 'state', public._wheel_state(_g)); end if;
  _spend := public.spend_ai_credits(2, 'wheel_hint', 'wheel');
  if not (_spend->>'ok')::boolean then return _spend; end if;
  update public.wheel_games set hint_revealed = true where id = _g.id returning * into _g;
  return jsonb_build_object('ok', true, 'state', public._wheel_state(_g));
end $$;

create or replace function public.wheel_reveal_letter()
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  _uid uuid := auth.uid(); _g public.wheel_games; _spend jsonb;
  _phrase text; _l text;
begin
  if _uid is null then return jsonb_build_object('ok', false, 'error', 'not_authenticated'); end if;
  select * into _g from public.wheel_games where user_id = _uid and status = 'active' for update;
  if _g.id is null then return jsonb_build_object('ok', false, 'error', 'no_active_game'); end if;
  select phrase into _phrase from public.wheel_puzzles where id = _g.puzzle_id;

  select ch into _l from (
    select distinct upper(regexp_split_to_table(_phrase, '')) as ch
  ) s where ch ~ '^[A-Z]$' and not (ch = any(_g.guessed_letters))
  order by random() limit 1;
  if _l is null then return jsonb_build_object('ok', false, 'error', 'nothing_to_reveal'); end if;

  _spend := public.spend_ai_credits(3, 'wheel_reveal_letter', 'wheel');
  if not (_spend->>'ok')::boolean then return _spend; end if;

  update public.wheel_games set guessed_letters = array_append(guessed_letters, _l)
   where id = _g.id returning * into _g;
  return jsonb_build_object('ok', true, 'letter', _l, 'state', public._wheel_state(_g));
end $$;

create or replace function public.wheel_buy_coins(_credits integer)
returns jsonb language plpgsql security definer set search_path = public as $$
declare _uid uuid := auth.uid(); _spend jsonb; _sc integer;
begin
  if _uid is null then return jsonb_build_object('ok', false, 'error', 'not_authenticated'); end if;
  if _credits is null or _credits < 1 or _credits > 50 then
    return jsonb_build_object('ok', false, 'error', 'invalid_amount');
  end if;
  _spend := public.spend_ai_credits(_credits, 'wheel_coin_pack', 'wheel');
  if not (_spend->>'ok')::boolean then return _spend; end if;
  _sc := public._wheel_sc_apply(_uid, _credits * 500, 'coin_pack', null);
  return jsonb_build_object('ok', true, 'spin_coins', _sc);
end $$;

create or replace function public.wheel_second_chance()
returns jsonb language plpgsql security definer set search_path = public as $$
declare _uid uuid := auth.uid(); _g public.wheel_games; _spend jsonb;
begin
  if _uid is null then return jsonb_build_object('ok', false, 'error', 'not_authenticated'); end if;
  select * into _g from public.wheel_games where user_id = _uid
   order by created_at desc limit 1 for update;
  if _g.id is null or _g.status <> 'lost' then
    return jsonb_build_object('ok', false, 'error', 'no_lost_game');
  end if;
  _spend := public.spend_ai_credits(3, 'wheel_second_chance', 'wheel');
  if not (_spend->>'ok')::boolean then return _spend; end if;
  update public.wheel_games set status = 'active', strikes = 2, finished_at = null
   where id = _g.id returning * into _g;
  return jsonb_build_object('ok', true, 'state', public._wheel_state(_g));
end $$;

create or replace function public.wheel_wallet()
returns jsonb language sql security definer set search_path = public as $$
  select jsonb_build_object(
    'spin_coins', coalesce((select spin_coins from public.wheel_wallets where user_id = auth.uid()), 0),
    'total_won', coalesce((select total_won from public.wheel_wallets where user_id = auth.uid()), 0),
    'games_won', coalesce((select games_won from public.wheel_wallets where user_id = auth.uid()), 0),
    'credits', coalesce((select credits_remaining from public.ai_credits where user_id = auth.uid()), 0)
  )
$$;

create or replace function public.wheel_leaderboard()
returns table(user_id uuid, display_name text, avatar_url text, total_won integer, games_won integer)
language sql security definer set search_path = public as $$
  select w.user_id, coalesce(p.full_name, p.username, 'Player'), p.avatar_url, w.total_won, w.games_won
  from public.wheel_wallets w
  left join public.profiles p on p.id = w.user_id
  order by w.total_won desc, w.games_won desc
  limit 20
$$;

grant execute on function public.wheel_start_game, public.wheel_get_game, public.wheel_spin,
  public.wheel_guess_letter(text), public.wheel_solve(text), public.wheel_buy_hint,
  public.wheel_reveal_letter, public.wheel_buy_coins(integer), public.wheel_second_chance,
  public.wheel_wallet, public.wheel_leaderboard to authenticated;

insert into public.wheel_puzzles (category, phrase, hint, difficulty) values
  ('Movies', 'THE GODFATHER', 'A classic mafia saga', 1),
  ('Movies', 'JURASSIC PARK', 'Dinosaurs on an island', 1),
  ('Movies', 'THE LORD OF THE RINGS', 'A ring must be destroyed', 2),
  ('Nature', 'NORTHERN LIGHTS', 'Colourful polar sky show', 2),
  ('Nature', 'TROPICAL RAINFOREST', 'Hot, wet and full of life', 2),
  ('Nature', 'MOUNTAIN WATERFALL', 'Falling water high above', 1),
  ('Proverbs', 'PRACTICE MAKES PERFECT', 'Repetition pays off', 2),
  ('Proverbs', 'BETTER LATE THAN NEVER', 'About being delayed', 2),
  ('Proverbs', 'ACTIONS SPEAK LOUDER THAN WORDS', 'Do, do not talk', 3),
  ('Music', 'ROCK AND ROLL', 'A rebellious music genre', 1),
  ('Music', 'ELECTRIC GUITAR', 'Six strings and an amplifier', 1),
  ('Food', 'CHOCOLATE ICE CREAM', 'A cold sweet dessert', 1),
  ('Food', 'HOMEMADE PIZZA NIGHT', 'Dough, sauce and cheese at home', 2),
  ('Travel', 'AROUND THE WORLD', 'A very long journey', 1),
  ('Travel', 'SUMMER ROAD TRIP', 'Car, playlist and freedom', 2),
  ('Technology', 'ARTIFICIAL INTELLIGENCE', 'Machines that learn', 3),
  ('Technology', 'VIRTUAL REALITY HEADSET', 'You wear it to enter a world', 3),
  ('Sports', 'OLYMPIC GOLD MEDAL', 'Highest sporting prize', 2),
  ('Sports', 'PENALTY SHOOTOUT', 'Decides a tied football match', 2),
  ('Everyday Life', 'MORNING COFFEE ROUTINE', 'How many people start the day', 2)
on conflict do nothing;