---
name: Edge cache + materialized views
description: MVs mv_wall_feed_hot / mv_weekly_xp_top refreshed every 60s by pg_cron; read via get_cached_* SECURITY DEFINER RPCs and edge fn `public-feed` with s-maxage=30, SWR=120.
type: feature
---

- MVs: `public.mv_wall_feed_hot` (top 500 recent posts), `public.mv_weekly_xp_top` (weekly XP top 100).
- Refresh: `public.refresh_public_cache_mvs()` — CONCURRENTLY, cron `refresh-public-cache-mvs` every minute.
- Readers (anon+authenticated EXECUTE): `get_cached_wall_feed(_limit,_offset)`, `get_cached_weekly_xp_top(_limit)`. Join `public_profiles` for safe author fields.
- Edge fn `public-feed?kind=feed|leaderboard` returns JSON with `Cache-Control: public, s-maxage=30, stale-while-revalidate=120` — Cloudflare/edge caches unauthenticated reads.
- Client helpers in `src/lib/cachedPublicReads.ts` (`getCachedWallFeed`, `getCachedWeeklyXpTop`) with RPC fallback.
- Use on public landing/leaderboard surfaces; keep live RPCs for authenticated personalized paths.
