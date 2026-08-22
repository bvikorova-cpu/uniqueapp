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

  -- 1) never-played puzzles first (any previous status counts as played)
  select p.id into _p
    from public.wheel_puzzles p
   where p.active
     and (_cat is null or p.category = _cat)
     and not exists (
       select 1 from public.wheel_games g
        where g.user_id = _uid and g.puzzle_id = p.id
     )
   order by random() limit 1;

  -- 2) everything played: reuse the one played longest ago (never a repeat in a row)
  if _p is null then
    select p.id into _p
      from public.wheel_puzzles p
      join (
        select puzzle_id, max(created_at) as last_played
          from public.wheel_games where user_id = _uid group by puzzle_id
      ) g on g.puzzle_id = p.id
     where p.active and (_cat is null or p.category = _cat)
     order by g.last_played asc
     limit 1;
  end if;

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

INSERT INTO public.wheel_puzzles (category, phrase, hint, difficulty, active) VALUES
('Riddles','A BEEHIVE','It is buzzing inside, made of wax, and full of golden sweetness',2,true),
('Riddles','AN EARTHWORM','It is long, soft, has no legs and lives under the ground',2,true),
('Riddles','A HEDGEHOG','It is small, covered in spines, and rolls into a ball when scared',2,true),
('Riddles','A DRAGONFLY','It has four glass-like wings and hovers above the water',3,true),
('Riddles','A SEA STAR','It has five arms, no brain, and lives on the sea floor',3,true),
('Riddles','A CATERPILLAR','It crawls on many tiny legs and later grows wings',2,true),
('Riddles','A GRASSHOPPER','It is green, jumps very far, and sings in the summer meadow',2,true),
('Riddles','A MOLE','It is blind, digs tunnels, and leaves little hills in the garden',2,true),
('Riddles','A SQUIRREL','It has a bushy tail and hides nuts for the winter',1,true),
('Riddles','AN OWL','It is awake at night, turns its head far around, and hunts in silence',1,true),
('Riddles','A CHAMELEON','It changes colour and shoots out a very long tongue',3,true),
('Riddles','A STARFISH TIDE POOL','A small pool left by the sea where tiny creatures wait for the water',3,true),
('Riddles','A BAT','It sleeps upside down and finds its way using sound',2,true),
('Riddles','A SPIDER WEB','It is thin, sticky, and built as a trap between two branches',2,true),
('Riddles','A KANGAROO','It jumps on strong legs and carries its baby in a pocket',1,true)
ON CONFLICT DO NOTHING;