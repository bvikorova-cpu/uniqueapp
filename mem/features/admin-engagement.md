---
name: admin engagement
description: DAU/WAU/MAU dashboard at /admin/engagement with stickiness ratio and signup velocity chart
type: feature
---

## Backend
- SQL fns (`security definer`, admin-only via `has_role`):
  - `get_engagement_metrics(p_days int)` → jsonb with `dau, wau, mau, total_users, new_users, active_users_window, stickiness_pct, window_days`.
  - `get_dau_series(p_days int)` → table `(day, active_users, new_users)` for the chart, gap-filled via `generate_series`.
- Edge fn `admin-engagement` calls both RPCs in parallel; accepts `{ days: 7|30|90 }`, clamps to 1–365.
- "Active user" = unique `user_id` from `activity_feed.created_at` ∪ `user_activity.last_seen` in the window.

## Frontend
- `/admin/engagement` (`AdminEngagement.tsx`) wrapped in `<AdminGuard>` + `<AdminPageShell>`.
- 6 stat cards (DAU/WAU/MAU/Stickiness/New users/Total users) + recharts `LineChart` (active vs new signups).
- Window switcher: 7d / 30d / 90d.

## Healthy benchmarks (shown as caption)
- Stickiness DAU/MAU: ≥20% healthy, ≥50% world-class.

## Do NOT
- Skip the `has_role` check inside the SQL fns — they are `security definer` and would bypass RLS otherwise.
- Add new "active" signal sources without updating the UNION in both fns simultaneously.
