create or replace function public.get_gift_collection(p_user_id uuid default auth.uid())
returns table (
  gift_id uuid,
  slug text,
  name text,
  category text,
  rarity text,
  animation text,
  image_url text,
  emoji text,
  price_credits integer,
  copies bigint,
  credits_value bigint,
  first_received timestamptz,
  last_received timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select g.id, g.slug, g.name, g.category, g.rarity, g.animation, g.image_url, g.emoji,
         g.price_credits,
         count(t.id) as copies,
         coalesce(sum(t.credits_spent), 0)::bigint as credits_value,
         min(t.created_at) as first_received,
         max(t.created_at) as last_received
  from public.gift_transactions t
  join public.gift_catalog g on g.id = t.gift_id
  where t.recipient_id = p_user_id
  group by g.id, g.slug, g.name, g.category, g.rarity, g.animation, g.image_url, g.emoji, g.price_credits
  order by max(t.created_at) desc
$$;

create or replace function public.get_gift_collection_stats(p_user_id uuid default auth.uid())
returns json
language sql
stable
security definer
set search_path = public
as $$
  with per_user as (
    select recipient_id,
           count(distinct gift_id) as unique_gifts,
           count(*) as total_gifts,
           coalesce(sum(credits_spent), 0)::bigint as total_credits
    from public.gift_transactions
    group by recipient_id
  ), ranked as (
    select *, rank() over (order by unique_gifts desc, total_credits desc) as rnk
    from per_user
  )
  select json_build_object(
    'unique_gifts', coalesce(r.unique_gifts, 0),
    'total_gifts', coalesce(r.total_gifts, 0),
    'total_credits', coalesce(r.total_credits, 0),
    'rank', r.rnk,
    'catalog_total', (select count(*) from public.gift_catalog where is_active),
    'collectors', (select count(*) from per_user)
  )
  from (select 1) x
  left join ranked r on r.recipient_id = p_user_id
$$;

create or replace function public.get_gift_collectors_leaderboard(p_limit integer default 50)
returns table (
  rank_position bigint,
  user_id uuid,
  full_name text,
  username text,
  avatar_url text,
  unique_gifts bigint,
  total_gifts bigint,
  total_credits bigint,
  top_gift_slug text
)
language sql
stable
security definer
set search_path = public
as $$
  with per_user as (
    select t.recipient_id,
           count(distinct t.gift_id) as unique_gifts,
           count(*) as total_gifts,
           coalesce(sum(t.credits_spent), 0)::bigint as total_credits
    from public.gift_transactions t
    group by t.recipient_id
  ), ranked as (
    select p.*, rank() over (order by p.unique_gifts desc, p.total_credits desc) as rnk
    from per_user p
    order by rnk
    limit greatest(coalesce(p_limit, 50), 1)
  )
  select r.rnk,
         r.recipient_id,
         pr.full_name,
         pr.username,
         pr.avatar_url,
         r.unique_gifts,
         r.total_gifts,
         r.total_credits,
         (
           select g.slug
           from public.gift_transactions t2
           join public.gift_catalog g on g.id = t2.gift_id
           where t2.recipient_id = r.recipient_id
           order by t2.credits_spent desc
           limit 1
         ) as top_gift_slug
  from ranked r
  left join public.profiles pr on pr.id = r.recipient_id
  order by r.rnk
$$;

grant execute on function public.get_gift_collection(uuid) to authenticated;
grant execute on function public.get_gift_collection_stats(uuid) to authenticated;
grant execute on function public.get_gift_collectors_leaderboard(integer) to authenticated, anon;