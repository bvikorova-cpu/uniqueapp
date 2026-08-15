create or replace function public.get_escape_room_points_leaderboard(_limit int default 50)
returns table (
  user_id uuid,
  display_name text,
  avatar_url text,
  points bigint,
  total_score bigint,
  best_time_seconds int,
  hints_used bigint,
  last_escape timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    s.user_id,
    coalesce(nullif(p.username, ''), nullif(p.full_name, ''), 'Player') as display_name,
    p.avatar_url,
    count(*)::bigint as points,
    coalesce(sum(s.score), 0)::bigint as total_score,
    min(nullif(s.completion_time_seconds, 0))::int as best_time_seconds,
    coalesce(sum(s.hints_used), 0)::bigint as hints_used,
    max(coalesce(s.completed_at, s.created_at)) as last_escape
  from public.escape_room_sessions s
  left join public.public_profiles p on p.id = s.user_id
  where s.status = 'completed' and s.user_id is not null
  group by s.user_id, p.username, p.full_name, p.avatar_url
  order by points desc, total_score desc, best_time_seconds asc nulls last
  limit greatest(1, least(coalesce(_limit, 50), 200));
$$;

grant execute on function public.get_escape_room_points_leaderboard(int) to anon, authenticated, service_role;