---
name: Scale-readiness primitives
description: Global rate-limit, FTS search RPCs, feed cache with fan-out trigger, spam-score signals, moderation edge fns.
type: feature
---

## DB primitives

- `rate_limit_buckets` + `check_rate_limit(_bucket, _max, _window_seconds) → bool`. SECURITY DEFINER, RLS owner-only. Call from any RPC or edge fn that needs throttling. `cleanup_rate_limit_buckets()` runs daily via cron.
- `search_posts(q, limit)`, `search_profiles_fts(q, limit)` — GIN-indexed FTS. Replace any `ilike '%q%'` with these. Indexes also on `job_listings` and `communities`.
- `user_feed_cache(user_id, post_id, author_id, score, inserted_at)` — denormalized feed. Trigger `fanout_post_to_followers` on `posts INSERT` writes one row per follower for accounts with ≤5000 followers (celebrity = pull-on-read fallback). `trim_user_feed_cache()` daily cron.
- `profiles.spam_score int` + `compute_spam_score(uuid)`. Trigger `block_spam_follows` rejects follows when score ≥ 80 (account <24h + no avatar/bio + bulk follow).

## Edge fns

- `moderate-text` — Lovable AI Gateway `gemini-2.5-flash-lite`. JSON `{ allowed, severity, categories }`. Hook into DM/post/comment create paths.
- `moderate-image` — `gemini-2.5-flash` vision. JSON `{ allowed, nsfw, csam_suspected, severity }`. Hook into avatar/photo/post-image uploads. CSAM = hard delete + admin notify.

## Client helpers

`src/lib/scaleGuards.ts` exports `rateLimit`, `moderateText`, `moderateImage`, `searchPosts`, `searchProfilesFts`, `getCachedFeed`.

## Recommended buckets (max / windowSec)

- `dm.send` 30 / 60
- `post.create` 10 / 60
- `comment.create` 30 / 60
- `follow.create` 60 / 60
- `swipe.dating` 200 / 60
- `like.toggle` 120 / 60

## Future hookup

Edge fns `send-message`, `create-post`, `create-comment` (if/when added) should call `check_rate_limit` + `moderate-text` before insert. Image uploads should call `moderate-image` after upload and delete on `allowed=false`.
