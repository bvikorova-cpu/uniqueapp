---
name: Influ King adult creators
description: Influ King creators can flag "I promote adult content" at registration; Discover shows an Adult badge and entry costs 2 credits (platform only).
type: feature
---

- `influencer_profiles.is_adult` boolean — set via required checkbox in the Influ King "Create Your Influencer Profile" dialog ("I promote adult content").
- Discover + profile dialog show a red **Adult** badge next to the nickname.
- Opening an Adult creator (not own profile) costs **2 credits**, charged via RPC `public.unlock_adult_creator(_influencer_id)` → `spend_ai_credits(2, 'Adult creator access', 'influking_adult_access')`.
- Unlocks stored in `public.influencer_adult_access` (user_id, influencer_id, credits_spent, unique pair) — one-time payment per creator, no repeat charge.
- The entry fee goes **100% to the platform** — no creator share.
- The old "Strictly no nudity, sexual or adult content" banner was removed from `/influ-king`.
