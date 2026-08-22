create or replace function public.wheel_categories()
returns table(category text, puzzle_count bigint)
language sql
stable
security definer
set search_path = public
as $$
  select p.category, count(*)::bigint
  from public.wheel_puzzles p
  where p.active = true
  group by p.category
  order by p.category
$$;

grant execute on function public.wheel_categories() to authenticated;