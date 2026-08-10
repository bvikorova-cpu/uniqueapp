create or replace function public.character_power_leaderboard(_limit int default 50)
returns table (
  id uuid,
  user_id uuid,
  name text,
  category text,
  description text,
  image_url text,
  hp int,
  attack int,
  defense int,
  speed int,
  special_power text,
  level int,
  wins int,
  losses int,
  is_premium boolean,
  gear_bonus int,
  gear_count int,
  total_power int
)
language sql
stable
security definer
set search_path = public
as $$
  with gear as (
    select character_id, coalesce(sum(boost_value),0)::int as bonus, count(*)::int as cnt
    from public.character_equipment
    group by character_id
  )
  select c.id, c.user_id, c.name, c.category, c.description, c.image_url,
         c.hp, c.attack, c.defense, c.speed, c.special_power, c.level,
         c.wins, c.losses, c.is_premium,
         coalesce(g.bonus,0) as gear_bonus,
         coalesce(g.cnt,0) as gear_count,
         (coalesce(c.hp,0) + coalesce(c.attack,0) + coalesce(c.defense,0) + coalesce(c.speed,0)
          + coalesce(c.level,1) * 10 + coalesce(g.bonus,0))::int as total_power
  from public.characters c
  left join gear g on g.character_id = c.id
  order by total_power desc, c.wins desc nulls last
  limit greatest(1, least(coalesce(_limit,50), 200));
$$;

grant execute on function public.character_power_leaderboard(int) to anon, authenticated;