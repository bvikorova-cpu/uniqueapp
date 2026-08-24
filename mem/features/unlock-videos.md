---
name: Unlock Videos (half-free video paywall)
description: /unlock-videos section — user videos lock at 50%, unlock for 1 credit, creator gets 50% of credits
type: feature
---

# Unlock Videos

Separate section from Wall Videos (Wall Videos stays a free TikTok-style feed).

- Route: `/unlock-videos` → `src/pages/PremiumVideos.tsx` (ProtectedRoute, lazy in `src/routes/lazyPages.ts`).
- Upload: `UploadPremiumVideoDialog.tsx` → storage bucket `videos` under `<uid>/premium-*`, row in `premium_videos`.
- Player: `PremiumVideoCard.tsx` pauses playback at exactly 50% of duration and shows the paywall.
- Unlock cost: **1 credit fixed** (`premium_videos.unlock_cost` default 1), once per video, owner always unlocked.
- Split: **50% creator / 50% platform**. Since credits are integers, the creator's half accumulates in
  `premium_video_creator_balance.pending_credits`; whole credits are auto-granted via `add_ai_credits`.
- RPCs: `unlock_premium_video(_video_id)` (spends credit + ledger row + unlock row + creator split),
  `premium_video_add_view(_video_id)`.
- Tables: `premium_videos`, `premium_video_unlocks`, `premium_video_creator_balance`.
