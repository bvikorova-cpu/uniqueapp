---
name: Real user names everywhere
description: STRICT RULE — never render "User"/"Anonymous" placeholders; always show the real profile name from profiles_public
type: preference
---

STRICT PLATFORM RULE: no surface may ever display the placeholder "User" (or "Anonymous", "Unknown", "Guest") for a real account.

How to apply:
- Always join/enrich with `profiles_public` (id, full_name, username, avatar_url) when rendering any authored content: reviews, comments, posts, messages, leaderboards, bids, listings, gifts, duels.
- Display order: `full_name` -> `username` -> `"Member"` (never `"User"`).
- Avatar fallback initial follows the same order.
- `public.profiles_public` MUST stay `security_invoker = false` (security definer view). With invoker=true the base `profiles` RLS (own row only) hides everyone else and the whole platform falls back to "User". Never flip it back.
- Base table `profiles` keeps its restrictive RLS; only the public view exposes the safe columns.

Why: user repeatedly reported "User" showing instead of real names; this is a regression-prone, platform-wide requirement.
