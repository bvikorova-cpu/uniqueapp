CREATE OR REPLACE FUNCTION public.aggregate_group_insights(_day date DEFAULT (now() AT TIME ZONE 'UTC')::date)
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  affected int;
BEGIN
  WITH new_members AS (
    SELECT group_id, COUNT(*)::int AS c
    FROM public.group_members
    WHERE joined_at::date = _day
    GROUP BY group_id
  )
  INSERT INTO public.group_insights_daily
    (group_id, day, new_members, posts_count, comments_count, active_members)
  SELECT
    g.id, _day,
    COALESCE(nm.c, 0),
    0, 0, 0
  FROM public.groups g
  LEFT JOIN new_members nm ON nm.group_id = g.id
  ON CONFLICT (group_id, day) DO UPDATE SET
    new_members = EXCLUDED.new_members;

  GET DIAGNOSTICS affected = ROW_COUNT;
  RETURN affected;
END;
$$;