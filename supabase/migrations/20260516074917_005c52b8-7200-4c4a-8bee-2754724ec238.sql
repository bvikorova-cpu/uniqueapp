drop view if exists public.fan_club_top_talents;
create view public.fan_club_top_talents
with (security_invoker = true) as
select talent_user_id, count(*)::int as member_count
from public.fan_club_memberships
group by talent_user_id;