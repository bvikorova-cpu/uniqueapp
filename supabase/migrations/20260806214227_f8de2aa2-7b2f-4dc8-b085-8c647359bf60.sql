CREATE OR REPLACE FUNCTION public.get_emotion_leaderboard(_metric text DEFAULT 'total'::text, _limit integer DEFAULT 20)
 RETURNS TABLE(user_id uuid, display_name text, avatar_url text, score numeric)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
    union all
    select w.user_id,
           (coalesce(w.joy_balance,0) + coalesce(w.sadness_balance,0) + coalesce(w.motivation_balance,0) + coalesce(w.love_balance,0) + coalesce(w.anger_balance,0) + coalesce(w.fear_balance,0) + coalesce(w.excitement_balance,0) + coalesce(w.peace_balance,0))::numeric as score
    from public.emotion_wallets w
    where _metric = 'total'
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
$function$;