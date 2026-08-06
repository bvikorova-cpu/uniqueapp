create or replace function public.get_emotion_leaderboard(_metric text default 'roulette', _limit int default 20)
returns table (user_id uuid, display_name text, avatar_url text, score numeric)
language sql
stable
security definer
set search_path = public
as $$
  with agg as (
    select s.user_id, sum(coalesce(s.payout,0))::numeric as score
    from public.emotion_roulette_spins s
    where _metric = 'roulette'
    group by s.user_id
    union all
    select g.user_id, count(*)::numeric
    from public.emotion_mood_generations g
    where _metric = 'readings'
    group by g.user_id
    union all
    select x.uid, count(*)::numeric
    from (
      select user_a as uid from public.emotion_exchange_matches
      union all
      select user_b as uid from public.emotion_exchange_matches
    ) x
    where _metric = 'swaps'
    group by x.uid
  )
  select a.user_id,
         coalesce(p.username, p.full_name, 'Player ' || left(a.user_id::text, 4)) as display_name,
         p.avatar_url,
         a.score
  from agg a
  left join public.profiles_public p on p.id = a.user_id
  where a.score > 0
  order by a.score desc
  limit least(coalesce(_limit, 20), 50)
$$;

grant execute on function public.get_emotion_leaderboard(text, int) to authenticated, anon;