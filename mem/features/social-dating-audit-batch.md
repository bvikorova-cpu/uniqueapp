---
name: Social & Dating audit fixes batch
description: 24h membership refund, DM mute list, confession sanitize + rate-limit, coffee no-show strikes.
type: feature
---

## 24h Membership Refund
- Edge fns: `refund-membership` (Stripe refund + cancel immediately), `check-refund-eligibility` (read-only, returns hours_left + amount).
- UI: `<RefundButton/>` on `/account/subscriptions` — auto-hides if not eligible. Window = 24h since latest paid invoice on that subscription.

## DM Mutes
- Table `dm_mutes(user_id, muted_user_id)` — RLS owner-only.
- Hook `useDmMutes()` exposes `mutedIds Set`, `isMuted(id)`, `mute/unmute/toggle`.
- Wire into conversation list to filter push + UI as needed.

## Confessions Sanitization
- `post-confession` edge fn now:
  - Strips control/zero-width chars, caps at 4000, requires ≥10 chars.
  - Hard-coded slur denylist → 422.
  - Rate-limit: 5 confessions / 10 min per user → 429.

## Coffee No-Show Strikes
- Table `coffee_no_shows(match_id, reporter_user_id, no_show_user_id, note)` — unique per (match, reporter).
- Trigger `bump_coffee_no_show_strike` increments `coffee_profiles.no_show_strikes` on insert.
- UI: "No-show" button on accepted match in `BuddyMatches`.
- Future: gate matchmaking when `no_show_strikes >= 3`.
