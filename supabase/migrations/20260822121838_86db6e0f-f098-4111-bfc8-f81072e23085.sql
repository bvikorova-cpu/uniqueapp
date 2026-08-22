CREATE OR REPLACE FUNCTION public.wheel_start_game(_category text DEFAULT NULL)
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
begin
  if _uid is null then return jsonb_build_object('ok', false, 'error', 'not_authenticated'); end if;

  update public.wheel_games set status = 'abandoned', finished_at = now()
   where user_id = _uid and status = 'active';

  select id into _p from public.wheel_puzzles
   where active
     and (_cat is null or category = _cat)
     and id not in (
       select puzzle_id from public.wheel_games where user_id = _uid and status = 'solved'
     )
   order by random() limit 1;
  if _p is null then
    select id into _p from public.wheel_puzzles
     where active and (_cat is null or category = _cat)
     order by random() limit 1;
  end if;
  if _p is null then return jsonb_build_object('ok', false, 'error', 'no_puzzles'); end if;

  _spend := public.spend_ai_credits(1, 'wheel_of_fortune_round', 'wheel');
  if not (_spend->>'ok')::boolean then return _spend; end if;

  insert into public.wheel_games(user_id, puzzle_id) values (_uid, _p) returning * into _g;
  insert into public.wheel_wallets(user_id) values (_uid) on conflict (user_id) do nothing;
  return jsonb_build_object('ok', true, 'state', public._wheel_state(_g));
end $function$;