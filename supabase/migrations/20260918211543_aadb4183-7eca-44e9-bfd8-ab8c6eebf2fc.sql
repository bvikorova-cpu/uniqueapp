create or replace function public.unlock_adult_creator(_influencer_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  _uid uuid := auth.uid();
  _creator record;
  _spend jsonb;
begin
  if _uid is null then
    return jsonb_build_object('ok', false, 'error', 'not_authenticated');
  end if;

  select id, user_id, is_adult into _creator
  from public.influencer_profiles
  where id = _influencer_id;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'not_found');
  end if;

  if not _creator.is_adult then
    return jsonb_build_object('ok', true, 'not_adult', true);
  end if;

  if _creator.user_id = _uid then
    return jsonb_build_object('ok', true, 'own', true);
  end if;

  if exists (select 1 from public.influencer_adult_access where user_id = _uid and influencer_id = _influencer_id) then
    return jsonb_build_object('ok', true, 'already', true);
  end if;

  _spend := public.spend_ai_credits(6, 'Adult creator access', 'influking_adult_access');
  if not coalesce((_spend->>'ok')::boolean, false) then
    return jsonb_build_object('ok', false, 'error', 'insufficient', 'balance', (_spend->>'balance')::int);
  end if;

  insert into public.influencer_adult_access (user_id, influencer_id, credits_spent)
  values (_uid, _influencer_id, 6)
  on conflict do nothing;

  return jsonb_build_object('ok', true, 'already', false, 'balance', (_spend->>'balance')::int);
end;
$$;

revoke all on function public.unlock_adult_creator(uuid) from public;
grant execute on function public.unlock_adult_creator(uuid) to authenticated;