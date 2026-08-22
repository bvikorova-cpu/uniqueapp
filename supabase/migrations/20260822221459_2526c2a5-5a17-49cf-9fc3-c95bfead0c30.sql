CREATE OR REPLACE FUNCTION public.refresh_battle_pass_progress()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
declare
  s record;
  uid uuid := auth.uid();
  earned_xp integer := 0;
  earned_al integer := 0;
  earned integer := 0;
  tier integer := 0;
begin
  if uid is null then return jsonb_build_object('ok', false, 'error', 'not authenticated'); end if;

  select * into s from battle_pass_seasons where is_active = true order by starts_at desc limit 1;
  if s.id is null then return jsonb_build_object('ok', false, 'error', 'no active season'); end if;

  select coalesce(sum(amount), 0) into earned_xp
  from xp_events
  where user_id = uid
    and created_at >= s.starts_at
    and created_at < s.ends_at
    and coalesce(source, '') not in ('xp_sync','backfill','migration','badge_earned','challenge_grant')
    and amount between 1 and 500;

  select coalesce(sum(points_earned), 0) into earned_al
  from activity_logs
  where user_id = uid
    and created_at >= s.starts_at
    and created_at < s.ends_at
    and coalesce(activity_type, '') not in ('badge_earned', 'xp_sync', 'backfill', 'migration', 'challenge_grant')
    and points_earned between 1 and 500;

  earned := earned_xp + earned_al;

  tier := least(s.total_tiers, floor(earned::numeric / greatest(s.xp_per_tier, 1))::int);

  insert into user_battle_pass (user_id, season_id, current_xp, current_tier)
  values (uid, s.id, earned, tier)
  on conflict (user_id, season_id) do update
    set current_xp = excluded.current_xp,
        current_tier = greatest(user_battle_pass.current_tier, excluded.current_tier),
        updated_at = now();

  return jsonb_build_object('ok', true, 'xp', earned, 'tier', tier);
end;
$$;
