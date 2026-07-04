create or replace function public.get_my_conversations_v1(_limit int default 100)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  with mine as (
    select conversation_id
    from public.conversation_participants
    where user_id = auth.uid()
  ),
  convs as (
    select c.id, c.updated_at
    from public.conversations c
    where c.id in (select conversation_id from mine)
    order by c.updated_at desc nulls last
    limit greatest(_limit, 1)
  ),
  others as (
    select distinct on (cp.conversation_id)
      cp.conversation_id, cp.user_id
    from public.conversation_participants cp
    where cp.conversation_id in (select id from convs)
      and cp.user_id <> auth.uid()
  ),
  last_msgs as (
    select distinct on (m.conversation_id)
      m.conversation_id, m.id, m.content, m.sender_id, m.created_at,
      m.story_id, m.is_read, m.attachment_type
    from public.messages m
    where m.conversation_id in (select id from convs)
    order by m.conversation_id, m.created_at desc
  )
  select coalesce(jsonb_agg(
    jsonb_build_object(
      'id', c.id,
      'updated_at', c.updated_at,
      'otherUser', case when p.id is not null then
        jsonb_build_object('id', p.id, 'full_name', p.full_name, 'avatar_url', p.avatar_url)
        else null end,
      'lastMessage', case when lm.id is not null then
        jsonb_build_object(
          'id', lm.id, 'content', lm.content, 'sender_id', lm.sender_id,
          'created_at', lm.created_at, 'story_id', lm.story_id,
          'is_read', lm.is_read, 'attachment_type', lm.attachment_type
        )
        else null end
    ) order by c.updated_at desc nulls last
  ), '[]'::jsonb)
  from convs c
  left join others o on o.conversation_id = c.id
  left join public.public_profiles p on p.id = o.user_id
  left join last_msgs lm on lm.conversation_id = c.id;
$$;

grant execute on function public.get_my_conversations_v1(int) to authenticated;