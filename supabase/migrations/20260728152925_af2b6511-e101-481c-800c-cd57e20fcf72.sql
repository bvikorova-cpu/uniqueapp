create or replace function public.search_public_profiles(_query text)
returns table(id uuid, full_name text, username text, avatar_url text)
language plpgsql
stable
security definer
set search_path = public
as $fn$
declare
  normalized_query text;
  query_tokens text[];
begin
  if auth.uid() is null then
    return;
  end if;

  normalized_query := lower(regexp_replace(
    public.f_unaccent(btrim(coalesce(_query, ''))),
    '\s+', ' ', 'g'
  ));

  if length(normalized_query) < 1 then
    return;
  end if;

  select array_agg(token)
  into query_tokens
  from regexp_split_to_table(normalized_query, '\s+') as token
  where length(token) >= 1;

  if query_tokens is null then
    return;
  end if;

  return query
  with candidates as (
    select
      p.id,
      p.full_name,
      p.username,
      p.avatar_url,
      lower(public.f_unaccent(coalesce(p.full_name, ''))) as name_norm,
      lower(public.f_unaccent(coalesce(p.username, ''))) as user_norm
    from public.profiles p
    where p.id <> auth.uid()
  )
  select c.id, c.full_name, c.username, c.avatar_url
  from candidates c
  where (
      c.name_norm like '%' || normalized_query || '%'
      or c.user_norm like '%' || normalized_query || '%'
      or not exists (
        select 1 from unnest(query_tokens) as t
        where (c.name_norm || ' ' || c.user_norm) not like '%' || t || '%'
      )
    )
    and not exists (
      select 1 from public.blocked_users b
      where (b.user_id = auth.uid() and b.blocked_user_id = c.id)
         or (b.user_id = c.id and b.blocked_user_id = auth.uid())
    )
  order by
    case
      when c.name_norm like normalized_query || '%' then 0
      when c.user_norm like normalized_query || '%' then 1
      when c.name_norm like '%' || normalized_query || '%' then 2
      when c.user_norm like '%' || normalized_query || '%' then 3
      else 4
    end,
    coalesce(c.full_name, c.username) nulls last
  limit 30;
end;
$fn$;

grant execute on function public.search_public_profiles(text) to authenticated;