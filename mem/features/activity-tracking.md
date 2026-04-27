---
name: activity tracking
description: Auto-population of activity_feed via DB triggers feeding /admin/engagement DAU/WAU/MAU metrics
type: feature
---

## Backend (DB triggers — primary path)

Migration `activity_feed_auto_tracking_triggers` installs `AFTER INSERT` triggers that write to `public.activity_feed` automatically. No app code change needed for these:

| Source table | Trigger fn | activity_type |
|---|---|---|
| `posts` | `tg_activity_post_created` | `post_created` |
| `post_likes` | `tg_activity_post_liked` | `post_liked` |
| `post_comments` | `tg_activity_post_commented` | `post_commented` |
| `user_follows` | `tg_activity_follow_added` | `friend_added` |

All triggers + the `_log_activity` helper are `SECURITY DEFINER` and `EXECUTE` is REVOKEd from `PUBLIC`/`anon`/`authenticated` so only the DB itself can invoke them. Errors inside `_log_activity` are swallowed — logging never breaks the originating action.

## Client helper (`useTrackActivity`)

For actions that don't map to a single table insert (profile updates, storage uploads, share buttons, story views), use:

```ts
const { track } = useTrackActivity();
await track("photo_uploaded", { targetId: mediaId, targetType: "media" });
```

Allowed types: `profile_updated`, `photo_uploaded`, `post_shared`, `story_viewed`, `session_started`.

## Do NOT
- Manually insert `post_created` / `post_liked` / `post_commented` / `friend_added` from the client — the trigger already does it; you'll get duplicates.
- Add a new "active" signal source without also updating the UNION inside `get_engagement_metrics` and `get_dau_series` (see `admin-engagement` memory).
- Re-grant `EXECUTE` on `_log_activity` or the `tg_activity_*` triggers to `anon`/`authenticated` — that would let clients spoof activity rows.
