# Project Memory

## Core
English UI, EUR (€) currency. 100% paid-only model (no free tiers), AI tools cost 3-5 credits.
Theme: Primary purple (270 91%), accent hot pink (330 100%), 0.75rem radius, dark luxury glassmorphism.
Cinematic Hub 2.0: MP4 video background via .asset.json, 4 stat cards below video.
Icons: Lucide SVGs exclusively. NO emojis. Display '—' instead of '0' for empty stats.
NO health/medical predictions. NO identifiable people/trademarks in videos.
100% real functionality. NO "Coming Soon" placeholders.

## Memories
- [Monetization Rules](mem://features/monetization) — Revenue splits, strict paid-only strategy, credit pricing, Stripe Connect payouts
- [Legal & Compliance](mem://constraints/compliance) — Forbidden health claims, GDPR visual rules, external game transparency requirements
- [Global Design Patterns](mem://design/global-patterns) — Dark luxury glassmorphism, Cinematic Hub 2.0 layouts, AI UI standards
- [Architecture Standards](mem://architecture/project-standards) — Video .asset.json imports, AI throttling, description requirements
- [Hub Visual Styles](mem://design/hub-visual-styles) — Themes, color schemes, and text visibility rules for all 30+ hubs
- [Module-Specific Logic](mem://features/module-specific-logic) — Escrow rules, hardcoded recipe formats, legacy feature preservation
- [Credit Checkout Router](mem://features/credit-checkout-router) — Universal create-checkout for all AI credit packs (creditType + credits)
- [Admin Stripe Payout](mem://features/admin-stripe-payout) — admin-payout-withdrawal edge fn + StripePayoutButton wiring all 7 withdrawal types to Stripe Connect transfers
- [Admin Stripe Refund](mem://features/admin-stripe-refund) — admin-refund-payment edge fn + RefundButton + /admin/refunds page operating on payment_records ledger
- [Stripe Webhook](mem://features/stripe-webhook) — stripe-webhook edge fn syncs payment_records with Stripe events (refund/dispute/late confirm)
- [Auto-payout Cron](mem://features/auto-payout-cron) — auto-payout-pending-withdrawals scheduled fn + PendingPayoutsCard widget for sweeping small pending withdrawals weekly
