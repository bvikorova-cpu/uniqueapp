---
name: Subscription Pause Limits
description: Prevents abuse of pause-collection by capping users at N pauses per rolling 12 months and M months per pause. Enforced server-side by pause-subscription edge fn.
type: feature
---
- Tables: `subscription_pause_log` (one row per pause: user, sub id, months, paused_at, resumes_at), `subscription_pause_config` (singleton: max_pauses_per_year=3, max_months_per_pause=3).
- DB fn: `get_user_pause_count(_user_id)` → int of pauses in last 12 months (security definer).
- Edge fns:
  - `pause-subscription` (updated) — loads config, returns 400 (`MONTHS_EXCEEDED`) if months > max, returns 429 (`PAUSE_LIMIT_REACHED`) if used ≥ limit, else pauses Stripe sub + inserts log row. Response includes `pauses_used` / `pauses_limit`.
  - `get-pause-status` — user-facing: returns `{used, limit, remaining, max_months_per_pause, history[]}`.
  - `admin-pause-overview` (admin-gated) — last-12-month KPIs (totalPauses, uniqueUsers, atLimit), top-50 pausers, recent-100. Logs view to admin_audit_log as `pause_overview_viewed`.
- UI:
  - `<PauseLimitCard>` — shows progress bar (used/limit), warning when exhausted, recent pauses. Use in `/account/subscriptions`.
  - `/admin/pauses` (AdminPauseOverview) — KPI tiles + top pausers table + recent activity.
- RLS: users read own log; admins read all; anon+authenticated read config; service-role only inserts log.
- Frontend should surface the 429 error code distinctly so users know it's a limit (not a Stripe error).
