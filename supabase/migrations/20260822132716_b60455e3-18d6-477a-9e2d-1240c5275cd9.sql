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
    'hint', _p.hint,
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