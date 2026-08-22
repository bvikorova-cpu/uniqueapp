ALTER TABLE public.wheel_games
  ADD COLUMN IF NOT EXISTS mode text NOT NULL DEFAULT 'normal',
  ADD COLUMN IF NOT EXISTS payout_multiplier integer NOT NULL DEFAULT 1;

INSERT INTO public.wheel_puzzles (category, phrase, hint, difficulty, active) VALUES
('Hard Riddles','A KEYHOLE','It is small, made of metal, and only one shaped friend can enter it',4,true),
('Hard Riddles','A SHADOW ON THE WALL','It follows you in light, disappears in darkness, and cannot be touched',4,true),
('Hard Riddles','AN HOURGLASS','It has a thin waist, runs without legs, and must be turned to start again',4,true),
('Hard Riddles','A CANDLE FLAME','It eats wax, gives light, and dies in the wind',4,true),
('Hard Riddles','AN ECHO IN THE CAVE','It speaks only after you do and never says anything new',5,true),
('Hard Riddles','A NEEDLE AND THREAD','One has an eye but cannot see, the other passes through it every day',4,true),
('Hard Riddles','A CHESS KNIGHT','It never walks straight and always jumps over the corner',5,true),
('Hard Riddles','A COMPASS NEEDLE','It always looks north and never gets tired of pointing',4,true),
('Hard Riddles','THE MORNING FOG','It has no shape, hides the road, and vanishes when the sun rises',5,true),
('Hard Riddles','A SNOWFLAKE','It falls silently, has six arms, and no two are ever the same',4,true),
('Hard Riddles','A MIRROR IMAGE','It copies every move, swaps left and right, and lives behind glass',5,true),
('Hard Riddles','A BOOK SPINE','It has a spine but no bones and holds thousands of words',4,true)
ON CONFLICT DO NOTHING;

CREATE OR REPLACE FUNCTION public.wheel_start_game(_category text DEFAULT NULL, _mode text DEFAULT 'normal')
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  _uid uuid := auth.uid();
  _spend jsonb;
  _p uuid;
  _g public.wheel_games;
  _cat text := nullif(trim(coalesce(_category, '')), '');
  _m text := lower(coalesce(nullif(trim(_mode), ''), 'normal'));
  _cost integer;
  _mult integer;
  _min_diff integer;
begin
  if _uid is null then return jsonb_build_object('ok', false, 'error', 'not_authenticated'); end if;
  if _m not in ('normal','hard','expert') then
    return jsonb_build_object('ok', false, 'error', 'invalid_mode');
  end if;

  if _m = 'expert' then _cost := 5; _mult := 5; _min_diff := 5;
  elsif _m = 'hard' then _cost := 3; _mult := 3; _min_diff := 4;
  else _cost := 1; _mult := 1; _min_diff := 0; end if;

  update public.wheel_games set status = 'abandoned', finished_at = now()
   where user_id = _uid and status = 'active';

  select p.id into _p
    from public.wheel_puzzles p
   where p.active
     and (_cat is null or p.category = _cat)
     and coalesce(p.difficulty, 1) >= _min_diff
     and not exists (
       select 1 from public.wheel_games g
        where g.user_id = _uid and g.puzzle_id = p.id
     )
   order by random() limit 1;

  if _p is null then
    select p.id into _p
      from public.wheel_puzzles p
      join (
        select puzzle_id, max(created_at) as last_played
          from public.wheel_games where user_id = _uid group by puzzle_id
      ) g on g.puzzle_id = p.id
     where p.active and (_cat is null or p.category = _cat)
       and coalesce(p.difficulty, 1) >= _min_diff
     order by g.last_played asc limit 1;
  end if;

  if _p is null then return jsonb_build_object('ok', false, 'error', 'no_puzzles'); end if;

  _spend := public.spend_ai_credits(_cost, 'wheel_of_fortune_round_' || _m, 'wheel');
  if not (_spend->>'ok')::boolean then return _spend; end if;

  insert into public.wheel_games(user_id, puzzle_id, mode, payout_multiplier)
  values (_uid, _p, _m, _mult) returning * into _g;
  insert into public.wheel_wallets(user_id) values (_uid) on conflict (user_id) do nothing;
  return jsonb_build_object('ok', true, 'state', public._wheel_state(_g));
end $function$;

CREATE OR REPLACE FUNCTION public._wheel_state(_g wheel_games)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
    'mode', _g.mode,
    'payout_multiplier', _g.payout_multiplier,
    'difficulty', coalesce(_p.difficulty, 1),
    'hint', case when _g.hint_revealed or _solved or _p.category ilike '%riddle%' then _p.hint else null end,
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
end $function$;

CREATE OR REPLACE FUNCTION public.wheel_guess_letter(_letter text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
    _gain := _g.pending_value * _count * greatest(coalesce(_g.payout_multiplier, 1), 1);
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
end $function$;

CREATE OR REPLACE FUNCTION public.wheel_solve(_attempt text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
    _bonus := 250 * greatest(_p.difficulty, 1) * greatest(coalesce(_g.payout_multiplier, 1), 1);
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
end $function$;