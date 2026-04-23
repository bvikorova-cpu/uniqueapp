---
name: Weekly XP Leaderboard & Anti-Fraud
description: Unlimited rewarded-ad XP system with weekly leaderboard, race-safe 30s throttle, and Monday cron snapshot awarding bonus XP to top 3.
type: feature
---

## Flow
- `claim-rewarded-ad-xp` edge fn: +5 XP per view, no daily cap, 30s cooldown.
- **Race-safe throttle**: unique index `idx_rewarded_ad_views_throttle` on `(user_id, bucket_30s(created_at))`. Edge fn catches PG error `23505` → returns 429.
- **Soft fraud flag**: >500 views/day inserts row in `rewarded_ad_fraud_flags` (admin-visible only).

## Leaderboard
- `get_weekly_xp_leaderboard()` — current week, joins profiles for name/avatar.
- `get_last_week_xp_winners()` — reads from `weekly_xp_winners` archive.
- `WeeklyXPLeaderboard.tsx` shows live UTC countdown (matches SQL `date_trunc('week', now())` reset).
- `LastWeekWinners.tsx` shows last week's top 10 with bonus XP earned.

## Cron
- `weekly-xp-snapshot` runs every Monday 00:05 UTC.
- Calls `snapshot_weekly_xp_winners()` — idempotent, archives top 10, awards bonus XP: **#1=100, #2=50, #3=25** via `add_user_points`.
