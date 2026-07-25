
-- Extensions
create extension if not exists unaccent with schema extensions;
create extension if not exists pg_trgm with schema extensions;

-- Immutable unaccent wrapper (required for index expressions)
create or replace function public.f_unaccent(text)
returns text
language sql
immutable
strict
parallel safe
set search_path = extensions, public
as $$ select extensions.unaccent('extensions.unaccent'::regdictionary, lower($1)) $$;

-- Trigram GIN indexes on normalized profile columns
create index if not exists profiles_full_name_unaccent_trgm_idx
  on public.profiles using gin (public.f_unaccent(full_name) extensions.gin_trgm_ops);

create index if not exists profiles_username_unaccent_trgm_idx
  on public.profiles using gin (public.f_unaccent(username) extensions.gin_trgm_ops);

-- Recreate RPC: match from the first character, return full_name AND username,
-- use the immutable wrapper so the trigram indexes are used.
drop function if exists public.search_public_profiles(text);

create or replace function public.search_public_profiles(_query text)
returns table(id uuid, full_name text, username text, avatar_url text)
language plpgsql
stable
security definer
set search_path = public, extensions
as $function$
declare
  normalized_query text;
  query_tokens text[];
begin
  if auth.uid() is null then
    return;
  end if;

  normalized_query := regexp_replace(
    public.f_unaccent(btrim(coalesce(_query, ''))),
    '\s+',
    ' ',
    'g'
  );

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
      public.f_unaccent(coalesce(p.full_name, '')) as name_norm,
      public.f_unaccent(coalesce(p.username, '')) as user_norm
    from public.profiles p
    where p.id <> auth.uid()
      and (
        public.f_unaccent(coalesce(p.full_name, '')) like '%' || normalized_query || '%'
        or public.f_unaccent(coalesce(p.username, '')) like '%' || normalized_query || '%'
        or (
          array_length(query_tokens, 1) > 1
          and not exists (
            select 1 from unnest(query_tokens) as t
            where public.f_unaccent(coalesce(p.full_name, '') || ' ' || coalesce(p.username, '')) not like '%' || t || '%'
          )
        )
      )
      and not exists (
        select 1 from public.blocked_users b
        where (b.user_id = auth.uid() and b.blocked_user_id = p.id)
           or (b.user_id = p.id and b.blocked_user_id = auth.uid())
      )
  )
  select c.id, c.full_name, c.username, c.avatar_url
  from candidates c
  order by
    case
      when c.name_norm like normalized_query || '%' then 0
      when c.user_norm like normalized_query || '%' then 1
      when c.name_norm like '%' || normalized_query || '%' then 2
      when c.user_norm like '%' || normalized_query || '%' then 3
      else 4
    end,
    coalesce(c.full_name, c.username) nulls last
  limit 15;
end;
$function$;

revoke all on function public.search_public_profiles(text) from public, anon;
grant execute on function public.search_public_profiles(text) to authenticated, service_role;
