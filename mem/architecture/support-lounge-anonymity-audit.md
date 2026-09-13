# Support Lounge — Anonymity Audit & Hardening Design

## 1. Current state (files/lines)

- Tables: `supabase/migrations/20260913073606_...sql` (nicknames, passes, messages) and
  `20260913093111_...sql` (DMs).
- Edge function: `supabase/functions/support-lounge/index.ts`.
- Client: `src/pages/SupportLounge.tsx`.

### Findings

1. **Real `user_id` (== `auth.users.id`) is sent to every client, in the clear.**
   - `support_lounge_messages` grants `SELECT` to `authenticated` with `USING (true)` and no
     column restriction (migration `...73606` L35-38). Client does `.select("*")`
     (`SupportLounge.tsx` L284), so every peer receives `user_id` on every chat bubble
     (`LoungeMessage.user_id`, L27-34, used at L354 `m.user_id === userId` and passed to
     `onPrivateMessage(m)` at L242 → `dmTarget.userId = m.user_id`).
   - `support_lounge_dms` (`...93111` L14, L19-21) exposes `from_user_id`/`to_user_id` columns
     to both participants via `select("*")`. The **recipient of a DM learns the sender's real
     platform UUID**, not just the nickname.
   - `profiles` (and many other tables, e.g. `20251102002930` L210, `20251105132653` L21) are
     **`SELECT USING (true)` to everyone**, joinable on `user_id`. Any peer who has your UUID
     (from a room message or a DM) can trivially resolve it to your real profile/name — this
     defeats the entire point of "anonymous nickname" support rooms.

2. **`support_lounge_nicknames` is a global, permanently-readable `user_id → nickname` map**
   (`...73606` L10: `USING (true)`), queryable by *any* authenticated user, even ones who never
   entered the lounge. Combined with (1), this is a ready-made deanonymization table and also
   lets anyone enumerate which real accounts have used Support Lounge at all (the row's mere
   existence leaks "this person once opened Broken Hearts").

3. **Client writes/reads the chat table directly with the anon/user JWT**, bypassing the edge
   function entirely (`SupportLounge.tsx` L282-289, L315-317). This means:
   - No server-side moderation/rate limiting on room messages (only DMs/AI go through
     `support-lounge` function).
   - RLS is the *only* control, and it currently does nothing to hide identity (see #1).

4. **Realtime replication** (`ALTER PUBLICATION supabase_realtime ADD TABLE
   support_lounge_messages` and `..._dms`) broadcasts full rows, including `user_id`, to all
   subscribed clients — same leak as #1 but pushed live instead of via SELECT.

5. **DM notifications** (`support-lounge/index.ts` L172-183) correctly use nickname in the
   message text, but the underlying `support_lounge_dms.to_user_id`/`from_user_id` are still
   real UUIDs stored and later selectable per #1.

6. No `pass_date`/room-level pseudonymity: nickname is one fixed identity per user across all
   5 rooms and all days (`support_lounge_nicknames` PK is `user_id`), so cross-room correlation
   ("BraveFox in Cheated-On is the same BraveFox in Lonely") is by design here (acceptable —
   it's a *feature*, users pick one persona) but must not leak to the real UUID.

**Net effect:** nicknames are cosmetic only; the real security boundary (RLS) currently ships
the exact identifier needed to unmask every user to every other lounge member and to realtime
subscribers.

## 2. Design goals

- Client (browser) must never receive a real `auth.users.id` for another lounge participant —
  not in message rows, not in DM rows, not over realtime.
- Users still need a stable per-user handle so "private message this person" and "block/report
  this person" work, and so a contacts list can recognize the same person across sessions.
- All writes to lounge tables happen through the `support-lounge` edge function
  (service-role), never directly from the client, so moderation/rate-limiting/anonymity
  invariants are enforced in one place.

## 3. Schema changes

```sql
-- 3.1 Pseudonymous identity, decoupled from auth.users.id
create table public.support_lounge_identities (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  lounge_id   uuid not null default gen_random_uuid() unique, -- the ONLY id clients ever see
  nickname    text not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
-- lounge_id has no arithmetic/predictable relationship to user_id and is never derivable
-- client-side. Replaces support_lounge_nicknames.

alter table public.support_lounge_identities enable row level security;
-- No SELECT grant to `authenticated` at all. Clients read identities ONLY via the
-- get_lounge_profile()/enter RPC below, never by table scan.
revoke all on public.support_lounge_identities from authenticated, anon;
grant select, insert, update on public.support_lounge_identities to service_role;

create policy "self read only (defense in depth)"
  on public.support_lounge_identities for select
  using (auth.uid() = user_id); -- service role bypasses RLS anyway; this just protects
                                 -- against future accidental anon-key grants.

-- 3.2 Messages keyed by lounge_id, never user_id
alter table public.support_lounge_messages
  add column author_lounge_id uuid references public.support_lounge_identities(lounge_id);

-- backfill, then:
alter table public.support_lounge_messages alter column author_lounge_id set not null;
alter table public.support_lounge_messages drop column user_id;  -- moderation keeps a
  -- separate service-role-only audit table instead, see 3.4

drop policy "Members read room messages" on public.support_lounge_messages;
drop policy "Members post own messages" on public.support_lounge_messages;
revoke insert on public.support_lounge_messages from authenticated;
-- Only SELECT remains, and only for authenticated, and the row no longer contains any
-- real-identity column, so USING(true) is now safe:
create policy "Members read room messages"
  on public.support_lounge_messages for select to authenticated using (true);
-- All INSERTs happen via the edge function using the service key (add action "post_message"
-- to support-lounge/index.ts with the same charge/validation pattern already used for "dm").

-- 3.3 DMs keyed by lounge_id both directions
alter table public.support_lounge_dms
  add column from_lounge_id uuid references public.support_lounge_identities(lounge_id) not null,
  add column to_lounge_id   uuid references public.support_lounge_identities(lounge_id) not null;
alter table public.support_lounge_dms drop column from_user_id, drop column to_user_id;

drop policy "Participants can read their private messages" on public.support_lounge_dms;
create policy "Participants can read their private messages"
  on public.support_lounge_dms for select to authenticated
  using (
    from_lounge_id = (select lounge_id from public.support_lounge_identities where user_id = auth.uid())
    or
    to_lounge_id   = (select lounge_id from public.support_lounge_identities where user_id = auth.uid())
  );
-- INSERT stays service-role-only (already the case).

-- 3.4 Service-role-only audit/abuse trail (kept, but never exposed to clients)
create table public.support_lounge_audit (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  lounge_id uuid not null,
  event text not null,           -- 'message' | 'dm' | 'enter'
  room text,
  target_lounge_id uuid,
  created_at timestamptz not null default now()
);
revoke all on public.support_lounge_audit from authenticated, anon;
grant all on public.support_lounge_audit to service_role;
-- Used only by admins/trust&safety (real UUID needed to actually ban/report someone).
```

### Edge function changes (`support-lounge/index.ts`)

- `enter`/`set_nickname`: write to `support_lounge_identities` (upsert by `user_id`), return
  `{ lounge_id, nickname }` to the client instead of just `nickname`. Client stores its own
  `lounge_id` for "is this my own message" comparisons (replaces `m.user_id === userId`).
- New `post_message` action: validates room/content, looks up caller's `lounge_id`, inserts
  into `support_lounge_messages` with `author_lounge_id`, and writes a row to
  `support_lounge_audit` (service-role only) for moderation. Remove the client's direct
  `.from("support_lounge_messages").insert(...)` (`SupportLounge.tsx` L315-317) and its direct
  `.select("*")` reader — switch to explicit column select
  (`id, room, author_lounge_id, nickname, content, created_at`) and call the RPC/edge action
  for sending.
- `dm`: accept `to_lounge_id` instead of `to_user_id`. Resolve `to_lounge_id → to_user_id`
  server-side (service role) for the `notifications` insert; never echo the resolved
  `to_user_id` back to the caller.
- Realtime: postgres_changes on `support_lounge_messages`/`support_lounge_dms` now broadcast
  rows that structurally cannot contain a real UUID, so the existing
  `ALTER PUBLICATION ... ADD TABLE` is safe to keep.

### Column-level defense in depth

Even after removing `user_id` columns, add belt-and-braces column grants so a future
`ALTER TABLE ... ADD COLUMN user_id` doesn't silently leak again:

```sql
revoke select on public.support_lounge_messages from authenticated;
grant select (id, room, author_lounge_id, nickname, content, created_at)
  on public.support_lounge_messages to authenticated;
```

## 4. Lounge-only contacts / "shared room attendance" without identity leakage

Goal: let a user save someone they met in the lounge and later see "you were both active in
Broken Heart today", without ever learning or transmitting the other person's real UUID, and
without letting either side add someone who never consented to be found again.

```sql
-- 4.1 Attendance log (service-role write only, from the "enter"/"post_message" actions)
create table public.support_lounge_attendance (
  lounge_id uuid not null references public.support_lounge_identities(lounge_id),
  room text not null,
  activity_date date not null default current_date,
  last_active_at timestamptz not null default now(),
  primary key (lounge_id, room, activity_date)
);
revoke all on public.support_lounge_attendance from authenticated, anon;
grant all on public.support_lounge_attendance to service_role;

-- 4.2 Contacts, added by lounge_id (learned in chat), mutual-consent gated
create table public.support_lounge_contacts (
  owner_lounge_id   uuid not null references public.support_lounge_identities(lounge_id),
  contact_lounge_id uuid not null references public.support_lounge_identities(lounge_id),
  status text not null default 'pending' check (status in ('pending','accepted','blocked')),
  created_at timestamptz not null default now(),
  primary key (owner_lounge_id, contact_lounge_id),
  check (owner_lounge_id <> contact_lounge_id)
);
alter table public.support_lounge_contacts enable row level security;
revoke all on public.support_lounge_contacts from authenticated, anon;
-- No direct table access at all — only through RPCs below, so a client can never dump the
-- table and can never see contact_lounge_id -> user_id without going through the
-- edge function's own auth.uid() resolution.

-- 4.3 RPCs (SECURITY DEFINER, resolve identities internally, never return raw UUIDs)

create or replace function public.lounge_add_contact(p_contact_lounge_id uuid)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare v_owner uuid;
begin
  select lounge_id into v_owner from support_lounge_identities where user_id = auth.uid();
  if v_owner is null then return jsonb_build_object('error','not_in_lounge'); end if;
  if v_owner = p_contact_lounge_id then return jsonb_build_object('error','cannot_add_self'); end if;

  insert into support_lounge_contacts (owner_lounge_id, contact_lounge_id)
  values (v_owner, p_contact_lounge_id)
  on conflict (owner_lounge_id, contact_lounge_id) do nothing;

  -- reciprocal row makes it "accepted" only if the other side also added us
  if exists (
    select 1 from support_lounge_contacts
    where owner_lounge_id = p_contact_lounge_id and contact_lounge_id = v_owner
  ) then
    update support_lounge_contacts set status = 'accepted'
      where owner_lounge_id in (v_owner, p_contact_lounge_id)
        and contact_lounge_id in (v_owner, p_contact_lounge_id);
  end if;
  return jsonb_build_object('ok', true);
end $$;
revoke all on function public.lounge_add_contact(uuid) from public;
grant execute on function public.lounge_add_contact(uuid) to authenticated;

create or replace function public.lounge_list_contacts()
returns table(contact_lounge_id uuid, nickname text, status text,
              shared_room text, shared_last_active timestamptz)
language sql security definer set search_path = public as $$
  select c.contact_lounge_id,
         i.nickname,
         c.status,
         a.room as shared_room,
         a.last_active_at as shared_last_active
  from support_lounge_contacts c
  join support_lounge_identities i on i.lounge_id = c.contact_lounge_id
  left join lateral (
    -- "shared room attendance": rooms both the caller and the contact were active in,
    -- same day, most recent first — no user_id ever touched.
    select a2.room, a2.last_active_at
    from support_lounge_attendance a2
    join support_lounge_attendance mine
      on mine.room = a2.room and mine.activity_date = a2.activity_date
    where a2.lounge_id = c.contact_lounge_id
      and mine.lounge_id = (select lounge_id from support_lounge_identities where user_id = auth.uid())
    order by a2.last_active_at desc
    limit 1
  ) a on true
  where c.owner_lounge_id = (select lounge_id from support_lounge_identities where user_id = auth.uid())
    and c.status = 'accepted';
$$;
revoke all on function public.lounge_list_contacts() from public;
grant execute on function public.lounge_list_contacts() to authenticated;
```

Properties this gives you:

- The contacts table itself is never directly selectable by clients — only via
  `SECURITY DEFINER` functions that resolve `auth.uid()` internally, so a client can never
  join `contact_lounge_id` against anything to reverse it into a `user_id`.
- "Shared room attendance" is computed purely in `lounge_id` space; the function returns only
  the room name and timestamp, never a UUID that maps outside the lounge.
- Mutual-consent ("accepted" only once both sides add each other) prevents one-sided
  contact-list stalking (adding someone who never agreed still leaves them undiscoverable to
  the adder beyond "pending", and the added person is never notified of a pending request by
  UUID — a `notifications` row would use nickname text only, same pattern as the existing DM
  notification).
- Because `lounge_id` is a separate random UUID from `user_id` and is only ever minted/read via
  service-role code, none of this data can be correlated with `profiles` or any other publicly
  readable table.

## 5. Summary of required app-code changes

- `support-lounge/index.ts`: add `post_message` action; change `enter`/`set_nickname` to use
  `support_lounge_identities`/`lounge_id`; change `dm` to take/return `lounge_id`s; resolve to
  `user_id` only for the internal `notifications` insert.
- `SupportLounge.tsx`: replace direct `.from("support_lounge_messages")` insert/select and the
  `.from("support_lounge_nicknames")`/`.from("support_lounge_passes")` reads with calls to the
  edge function / a `get_lounge_profile()` RPC; replace all `user_id`/`userId` state with
  `lounge_id`; stop passing `m.user_id` into `onPrivateMessage`.
- Drop `support_lounge_nicknames` (superseded by `support_lounge_identities`) after migrating
  existing rows (`insert into support_lounge_identities (user_id, nickname) select user_id,
  nickname from support_lounge_nicknames`, with `lounge_id` auto-generated).
