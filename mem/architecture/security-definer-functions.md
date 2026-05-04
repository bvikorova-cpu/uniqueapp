---
name: SECURITY DEFINER functions are legitimate
description: All 51 SECURITY DEFINER functions in public schema are intentional helpers for RLS, leaderboards, payouts, and admin tools. Do not refactor to SECURITY INVOKER without verifying impact.
type: constraint
---

The Supabase linter / security scanner flags **51 SECURITY DEFINER functions** in the `public` schema as WARN (not ERROR). These were audited on 2026-05-04 and are **all legitimate**:

## Anon-callable (9) — required for RLS policies
- `has_role(uuid, app_role)` — used in every RLS policy. **Must stay SECURITY DEFINER** to avoid recursive RLS on `user_roles`.
- `is_conversation_participant`, `is_creative_room_member`, `is_group_member`, `is_lottery_syndicate_member` — RLS helpers for chat/groups.
- `get_follower_count`, `get_following_count` — public profile widgets.
- `get_weekly_xp_leaderboard` — public leaderboard.
- `get_approved_safety_stories` — public safety feed.

## Auth-callable (~30) — admin/user tools
- Admin XP audit (`admin_get_xp_*`, `admin_search_users_for_xp_audit`)
- Notification & rate-limit helpers (`create_notification`, `check_rate_limit`)
- Cache & gamification (`cache_get`, `cache_set`, `add_user_points`, `award_points_and_log`, `claim_mission_reward`, `spin_lucky_wheel`)
- Payouts (`get_campaign_available_balance`, `is_campaign_owner`, `payout_requires_review`)
- Public reads (`get_confessions_feed`, `get_psychology_stats`, `get_my_weekly_xp_rank`)

## Restricted (~12) — internal triggers / cron only
Things like `_increment_mission_progress`, `cleanup_expired_cache`, `activate_property_listing`. Only callable by service role / triggers — not exposed via PostgREST.

## Why we keep them
1. RLS recursion: `has_role` etc. MUST bypass RLS or policies infinitely loop.
2. Aggregate reads: leaderboards / counts read across many users; SECURITY DEFINER is the only way without exposing every row.
3. Atomicity: payout / XP / cache mutations need elevated privs to update multiple tables in one call.

## Rule for future scans
**Do NOT auto-refactor SECURITY DEFINER → SECURITY INVOKER.** If a new function is added, verify it (a) validates `auth.uid()` itself, (b) cannot leak rows the caller shouldn't see, (c) sets `search_path = public` to prevent search_path attacks.

If the scanner flags a NEW SECURITY DEFINER function not in this list, audit just that one — don't touch the existing 51.
