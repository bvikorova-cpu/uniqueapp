---
name: Influ King adult creators
description: Influ King creators can flag "I promote adult content" at registration; Discover shows an Adult badge and entry costs 6 credits one-time, 3 credits (€1.50) go to the creator.
type: feature
---

- `influencer_profiles.is_adult` boolean — set via required checkbox in the Influ King "Create Your Influencer Profile" dialog ("I promote adult content").
- Discover + profile dialog show a red **Adult** badge next to the nickname.
- Opening an Adult creator (not own profile) costs **6 credits** one-time, charged via RPC `public.unlock_adult_creator(_influencer_id)` → `spend_ai_credits(6, 'Adult creator access', 'influking_adult_access')`.
- Unlocks stored in `public.influencer_adult_access` (user_id, influencer_id, credits_spent, unique pair) — one-time payment per creator, no repeat charge.
- Revenue split **50/50**: creator gets 3 credits = **€1.50** (at €0.50/credit) — recorded via `public.influencer_earnings` (amount 3.00, platform_fee 1.50, net_amount 1.50, source 'adult_access') and `public.influencer_balances.total_earned += 1.50`, withdrawable through the standard Influ King payout flow. Remaining €1.50 goes to the platform.
- The old "Strictly no nudity, sexual or adult content" banner was removed from `/influ-king`.
- Adult creators are exempt from the platform-wide nudity screening (`screenMediaFile` returns allowed for `is_adult` creators).
