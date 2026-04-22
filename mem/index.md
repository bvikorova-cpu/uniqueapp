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
- [Tax & Invoicing](mem://features/tax-invoicing) — creator-tax-export CSV + get-payment-invoice-url for Stripe-hosted invoice/receipt deep-links
- [Stripe Disputes](mem://features/stripe-disputes) — stripe_disputes table + webhook lifecycle + admin-submit-dispute-evidence + /admin/disputes UI
- [Payment Reconciliation](mem://features/reconciliation) — admin-reconcile-payments edge fn + /admin/reconciliation UI for daily Stripe vs ledger comparison
- [Multi-currency](mem://features/multi-currency) — Global CurrencyProvider + Navbar switcher; useCurrency().format(eurAmount) for any price (display-only, billing stays EUR)
- [Subscription Lifecycle](mem://features/subscription-lifecycle) — /account/subscriptions UI + list/pause/resume/cancel-by-id edge fns + Stripe portal for upgrades
- [Referral Payout Automation](mem://features/referral-payout) — ?ref capture → claim-referral → referral_attributions; stripe-webhook customer.subscription.created credits €5 once per subscription into megatalent_referral_earnings
- [Referral Fraud Detection](mem://features/referral-fraud) — claim-referral scores attributions (self/IP/disposable/velocity); status approved|flagged|blocked gates webhook reward; /admin/referral-fraud review UI
- [Referral Leaderboard](mem://features/referral-leaderboard) — public /referrals/leaderboard, get_referral_leaderboard(period) SQL fn, top-100 ranked by approved auto_credited earnings
- [Subscription Analytics](mem://features/subscription-analytics) — admin-subscription-analytics edge fn pulls live Stripe data; /admin/subscription-analytics shows MRR/ARR/ARPU/LTV/churn + 12mo revenue chart
- [Cohort Retention](mem://features/cohort-retention) — admin-cohort-retention edge fn + /admin/cohort-retention heatmap of monthly Stripe subscriber cohorts
- [Dunning Recovery](mem://features/dunning) — dunning_events table + stripe-webhook invoice.payment_failed/succeeded; <DunningBanner> + update-payment-method portal flow + /admin/dunning dashboard
- [Win-back Campaigns](mem://features/winback) — auto-create offer on customer.subscription.deleted; public /winback/:token claim with Stripe coupon; /admin/winback dashboard with claim-rate KPIs
- [SCA / 3DS Handling](mem://features/sca-3ds) — sca_pending_actions table + check-sca/sca-confirm-url/admin-sca edge fns; <SCABanner> opens hosted invoice for 3-D Secure; /admin/sca dashboard
