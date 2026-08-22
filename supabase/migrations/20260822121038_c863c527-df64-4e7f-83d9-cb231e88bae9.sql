create or replace function public._wheel_state(_g public.wheel_games)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
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
    'hint', case when _g.hint_revealed or _solved or _p.category = 'Riddles' then _p.hint else null end,
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
end
$$;

revoke all on function public._wheel_state(public.wheel_games) from public, anon, authenticated;