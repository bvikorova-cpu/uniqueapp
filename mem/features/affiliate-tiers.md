---
name: Affiliate Tier System
description: Multi-tier referrer rewards (Bronze/Silver/Gold/Diamond) with escalating EUR per successful referral. Auto-promotes via DB trigger on each new earning.
type: feature
---
- Tables: `affiliate_tier_config` (4 tiers seeded: bronze €5/0+, silver €7/5+, gold €10/20+, diamond €15/50+), `affiliate_tier_status` (per-user cache: tier, approved_referrals, lifetime_earnings_eur, promoted_at).
- DB fns:
  - `recompute_affiliate_tier(_user_id)` — counts auto_credited earnings, picks highest matching tier, upserts status.
  - `get_affiliate_reward_eur(_user_id)` — returns reward EUR for user's current tier (default €5).
  - Trigger `trg_earnings_recompute_tier` on `megatalent_referral_earnings` insert calls recompute automatically.
- Webhook integration: `stripe-webhook` `customer.subscription.created` now reads `get_affiliate_reward_eur(referrer_id)` instead of hardcoded €5. Audit log records actual amount.
- Edge fn: `admin-affiliate-tiers` (admin-gated; returns config + top-200 by lifetime + tier-membership counts; logs view to admin_audit_log).
- UI:
  - `<AffiliateTierCard>` — drop-in component showing user's tier, progress to next tier, perks, and current €/referral. Use in referral dashboard.
  - `/admin/affiliate-tiers` (AdminAffiliateTiers.tsx) — KPI tiles per tier + top-affiliates table.
- RLS: anon+authenticated read tier_config; user reads own status; admin reads all.
