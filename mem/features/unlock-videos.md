---
name: Unlock Videos (half-free video paywall)
description: /unlock-videos section — own video_credits wallet, 50% lock, 1-credit unlock, credit boosts
type: feature
---

# Unlock Videos

Separate section from Wall Videos (Wall Videos stays a free TikTok-style feed).

- Route: `/unlock-videos` → `src/pages/PremiumVideos.tsx` (ProtectedRoute, lazy in `src/routes/lazyPages.ts`).
- Upload: `UploadPremiumVideoDialog.tsx` → storage bucket `videos` under `<uid>/premium-*`, row in `premium_videos`.
- Player: `PremiumVideoCard.tsx` pauses playback at exactly 50% of duration and shows the paywall.

## Separate credit wallet (NOT ai_credits)
- Tables: `video_credits` (balance) + `video_credits_ledger` (every change).
- Packs (Stripe, EUR): **10 credits / €5, 20 / €10, 30 / €15** — `create-video-credits-payment`
  edge function, topped up by shared `verify-credits-payment` (`credit_type = 'video_credits'`).
- Helper: `add_video_credits(user, amount, reason, source)` (service_role only).
- Unlock cost: **1 video credit** fixed; split **50% creator / 50% platform**, creator halves accumulate in
  `premium_video_creator_balance.pending_credits` and are paid out into `video_credits`.

## Boosts (video credits)
`boost_premium_video(_video_id, _tier)` — owner only, logs into `premium_video_boosts`, sets
`premium_videos.boost_tier` / `boost_until` (stacks on existing boost):
- `quick` — 5 credits, 6h top-of-feed highlight ("Boosted" badge)
- `daily` — 12 credits, 24h guaranteed "Hot" placement ("Hot" badge)
- `mega` — 25 credits, 72h priority + "Featured" badge

Feed ordering: `boost_until DESC NULLS LAST, created_at DESC`.

## RPCs / tables
`unlock_premium_video`, `premium_video_add_view`, `boost_premium_video`;
`premium_videos`, `premium_video_unlocks`, `premium_video_creator_balance`, `premium_video_boosts`,
`video_credits`, `video_credits_ledger`.
