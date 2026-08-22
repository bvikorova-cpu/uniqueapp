CREATE OR REPLACE FUNCTION public.wheel_guess_letter(_letter text, _pay_with_credits boolean DEFAULT false)
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
  _coins integer := 0;
  _spend jsonb;
  _paid_with text := null;
begin
  if _uid is null then return jsonb_build_object('ok', false, 'error', 'not_authenticated'); end if;
  if _l !~ '^[A-Z]$' then return jsonb_build_object('ok', false, 'error', 'invalid_letter'); end if;
  select * into _g from public.wheel_games where user_id = _uid and status = 'active' for update;
  if _g.id is null then return jsonb_build_object('ok', false, 'error', 'no_active_game'); end if;
  if _l = any(_g.guessed_letters) then return jsonb_build_object('ok', false, 'error', 'already_guessed'); end if;

  _vowel := _l in ('A','E','I','O','U');
  if _vowel then
    insert into public.wheel_wallets(user_id) values (_uid) on conflict (user_id) do nothing;
    select spin_coins into _coins from public.wheel_wallets where user_id = _uid;
    if coalesce(_coins, 0) >= 250 and not coalesce(_pay_with_credits, false) then
      _sc := public._wheel_sc_apply(_uid, -250, 'buy_vowel', _g.id);
      _paid_with := 'sc';
    elsif coalesce(_pay_with_credits, false) then
      _spend := public.spend_ai_credits(1, 'wheel_buy_vowel', 'wheel');
      if not (_spend->>'ok')::boolean then return _spend; end if;
      _sc := coalesce(_coins, 0);
      _paid_with := 'credit';
    else
      return jsonb_build_object('ok', false, 'error', 'not_enough_coins');
    end if;
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
    'spin_coins', _sc, 'paid_with', _paid_with, 'state', public._wheel_state(_g));
end $function$;

CREATE OR REPLACE FUNCTION public.wheel_start_game(_category text DEFAULT NULL::text, _mode text DEFAULT 'normal'::text)
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

  -- graceful fallback: if the chosen category has no puzzle that hard,
  -- take its hardest available puzzles instead of failing with "no puzzles"
  if not exists (
    select 1 from public.wheel_puzzles p
     where p.active and (_cat is null or p.category = _cat)
       and coalesce(p.difficulty, 1) >= _min_diff
  ) then
    select coalesce(max(coalesce(p.difficulty, 1)), 0) into _min_diff
      from public.wheel_puzzles p
     where p.active and (_cat is null or p.category = _cat);
  end if;

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
     order by g.last_played asc
     limit 1;
  end if;

  if _p is null then
    select id into _p from public.wheel_puzzles
     where active and (_cat is null or category = _cat)
     order by coalesce(difficulty, 1) desc, random() limit 1;
  end if;
  if _p is null then return jsonb_build_object('ok', false, 'error', 'no_puzzles'); end if;

  _spend := public.spend_ai_credits(_cost, 'wheel_of_fortune_round_' || _m, 'wheel');
  if not (_spend->>'ok')::boolean then return _spend; end if;

  insert into public.wheel_games(user_id, puzzle_id, mode, payout_multiplier)
  values (_uid, _p, _m, _mult) returning * into _g;
  insert into public.wheel_wallets(user_id) values (_uid) on conflict (user_id) do nothing;
  return jsonb_build_object('ok', true, 'state', public._wheel_state(_g));
end $function$;