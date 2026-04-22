---
name: Referral Leaderboard
description: Public top-100 referrers ranking. Phase 9j — SQL function aggregates approved auto_credited earnings, public route at /referrals/leaderboard.
type: feature
---

## SQL function

`public.get_referral_leaderboard(period TEXT)` — `SECURITY DEFINER`, granted to `anon, authenticated`. Returns top 100 referrers with:
- `referrer_id`, `display_name` (from profiles.full_name; "Anonymous" fallback), `avatar_url`
- `successful_referrals` (count), `total_earned` (sum), `rank`

Periods: `week` (7d), `month` (30d), `all_time`.

Only counts `megatalent_referral_earnings` rows where `auto_credited = true` — manual admin adjustments do not affect ranking. Combined with the fraud gate (`status='approved'`), this means only legitimate paid subscriptions count.

## Frontend

`/referrals/leaderboard` — public route. Three-tab period switcher (week/month/all-time), top-3 highlighted with crown/medal icons, current user's row pinned at top with `#rank` badge if present, uses `useCurrency().format()` for totals.

Bottom of page reuses `<ReferralCard />` so visitors can immediately copy their own link.
