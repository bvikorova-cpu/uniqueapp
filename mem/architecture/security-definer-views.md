---
name: SECURITY DEFINER views & remaining linter warnings
description: Why the 3 remaining SECURITY DEFINER view ERRORs and the recurring WARN classes (search_path, materialized view in API, anon-executable definer functions, public_user_linkage) are intentional. Audited 2026-08-06.
type: constraint
---

Audited 2026-08-06 after fixing the fixable items.

## Fixed (do not regress)
- `dating_profiles_browse` → `security_invoker = true`. Safe because `dating_profiles` has an
  `authenticated` SELECT policy with the exact same predicate
  (`is_active AND NOT incognito AND NOT is_shadow_banned`), so behaviour is identical.
- `public_clones` → `security_invoker = true`. Safe because `personality_clones` has a
  `public` role SELECT policy `is_active = true`.
- `talent_submissions` public SELECT policy now filters `COALESCE(is_active, true) = true`
  so moderated/removed submissions are no longer publicly readable.

## Remaining 3 ERROR "Security Definer View" — intentional
1. `public_profiles` — `profiles` only allows the owner to SELECT. The view exposes a
   curated non-PII column set (no email/phone) and is required for profile cards,
   friends lists, search and mentions. Must stay DEFINER.
2. `brain_duel_questions_public` — `brain_duel_questions` is admin-only SELECT because it
   contains `correct_answer`. The view deliberately omits the answer column; DEFINER is the
   only way to serve questions to players without leaking answers.
3. `iq_test_questions_public` — same pattern as above for `iq_test_questions`.

Rule: never switch these three to `security_invoker`; it would either empty the social
surfaces or force exposing answer columns via RLS.

## Recurring WARN classes — accepted
- **Function Search Path Mutable / Public Can Execute SECURITY DEFINER Function** — see
  `mem://architecture/security-definer-functions`. The anon-callable set is RLS helpers
  (`has_role`, `is_*_member`), public counters and public leaderboards. Each validates its
  own inputs and returns only already-public data.
- **Materialized View in API** (`mv_wall_feed_hot`, `mv_weekly_xp_top`) — both are
  read-only aggregates of already-public content (public wall posts, weekly XP ranking).
  No PII, no financial columns.
- **PUBLIC_USER_LINKAGE on `user_achievements`** — achievements are shown on public
  profiles and leaderboards by design; the table holds only `user_id` + achievement key.
- **PUBLIC_USER_LINKAGE on `virtual_influencers`** — the Virtual Influencer module was
  removed from the product; the table is orphaned and no longer written or read by the app.
