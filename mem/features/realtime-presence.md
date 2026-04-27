---
name: Realtime Presence & Typing
description: Reusable Supabase Realtime presence + typing indicator hooks/components — no DB writes, scoped per channel key.
type: feature
---

## Overview
Lightweight realtime layer for "who's here" and "is typing" UX. Uses Supabase Realtime presence (no DB writes) instead of the legacy `user_online_status` table.

## Files
- `src/hooks/usePresenceChannel.ts` — tracks join/leave per `channelKey` (e.g. `post:123`, `room:abc`).
- `src/hooks/useTypingIndicator.ts` — broadcast-based typing pings, throttled (1.5s) + auto-expire (4s).
- `src/components/realtime/PresenceAvatars.tsx` — stacked avatars with green dot + overflow chip.
- `src/components/realtime/TypingDots.tsx` — "X is typing…" with animated dots.

## Channel-key conventions
- Post comments: `post:${postId}`
- DM threads: `dm:${threadId}`
- Forum rooms: `room:${roomId}`
- Live debates: `debate:${debateId}`

Presence channel name = `presence:${channelKey}`. Typing channel name = `typing:${channelKey}` (separate to avoid resync churn on keystrokes).

## Usage pattern
```tsx
const { presentUsers } = usePresenceChannel({ channelKey: `post:${postId}`, user });
const { typingUsers, notifyTyping } = useTypingIndicator({ channelKey: `post:${postId}`, user });

<PresenceAvatars users={presentUsers} max={5} />
<TypingDots names={typingUsers.map(u => u.display_name ?? "Someone")} />
<Textarea onChange={(e) => { setValue(e.target.value); notifyTyping(); }} />
```

## Why not the existing `useOnlineStatus`?
That hook upserts on every 30s heartbeat → DB writes scale linearly with online users. Presence is in-memory per channel and free. Keep `useOnlineStatus` for global "is user X online anywhere" queries; use these new hooks for scoped contexts.
