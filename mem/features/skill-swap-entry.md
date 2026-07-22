---
name: Skill Swap €1 lifetime entry
description: One-time €1 entry fee for Skill Swap access. No monthly subscription, 0% commission on swaps.
type: feature
---
# Skill Swap monetization

- **Model**: One-time €1 entry fee → lifetime access. No monthly subscription. No commission (0%).
- **Product key**: `skill_swap` in `create-checkout` → mode: `payment`, amount: 100 cents.
- **Membership table**: `public.skill_swap_members(user_id PK, purchased_at, stripe_session_id, amount_paid_cents)`.
- **Access check**: `check-subscription` with `tier: "skill_swap"` reads `skill_swap_members` DB row (Stripe subscription lookup is skipped).
- **Verify endpoint**: `verify-skill-swap-entry` — called by `SkillSwap.tsx` after Stripe redirect (`?entry=success&session_id=...`), retrieves the session, confirms `payment_status=paid`, upserts membership row.
- **Frontend hook**: `useSkillSwap` unchanged (still uses `check-skill-swap-subscription` proxy → `check-subscription` tier `skill_swap`).
- **Success URL**: `/skill-swap?entry=success&session_id={CHECKOUT_SESSION_ID}` (DEFAULT_PATHS entry).
- **UI copy**: "€1 one-time entry • Lifetime access • 0% commission".
