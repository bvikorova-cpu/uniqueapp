# Project Memory

## Core
English UI, EUR (€) currency. 100% paid-only model (no free tiers), AI tools cost 3-5 credits.
Main platform is 16+ (DOB gate at signup blocks under-16 with Kids Channel redirect). Kids Channel = 6-12 with parental controls.
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
- [Creator KYC](mem://features/creator-kyc) — Stripe Identity verification (kyc-start/kyc-check/admin-kyc); /account/verification + /admin/kyc; gates payouts >€100; GDPR-minimal storage
- [Affiliate Tiers](mem://features/affiliate-tiers) — 4-tier referrer rewards (€5→€15) with auto-promotion trigger; stripe-webhook reads dynamic reward via get_affiliate_reward_eur; <AffiliateTierCard> + /admin/affiliate-tiers
- [Subscription Pause Limits](mem://features/subscription-pause-limits) — pause_log + config (3 pauses/year, 3mo max); pause-subscription enforces 429; <PauseLimitCard> + /admin/pauses
- [Weekly XP Leaderboard & Anti-Fraud](mem://features/weekly-xp-leaderboard) — Unlimited rewarded-ad XP, race-safe 30s throttle (unique idx), weekly leaderboard, Monday cron snapshot awarding 100/50/25 bonus to top 3
- [Security Scan](mem://features/security-scan) — Daily + on-demand audit of edge fns (static heuristics + runtime probes) and npm deps (OSV.dev CVE); admin UI at /admin/security-scan, snapshots in security_scan_snapshots
- [Age Rating 16+](mem://features/age-rating) — DOB gate at signup, &lt;Age16Badge /&gt; in navbar/footer/landing/auth, under-16 redirected to /kids-channel
- [Quantum Social AI versions](mem://features/quantum-versions) — quantum-generate-versions edge fn rewrites base post into N tonal variants via Lovable AI Gateway; called from QuantumFeed.createPost
- [Brand Collaboration Escrow](mem://features/brand-collaboration-escrow) — campaign_escrow table + brand-campaign-checkout/brand-release-escrow edge fns; BrandApplicationsManager UI handles Approve&Pay → Stripe → Mark Completed → 80% to influencer_earnings
- [GDPR Right to Erasure](mem://features/gdpr-erasure) — gdpr_purge_user_data SECURITY DEFINER fn dynamically wipes all 695+ public tables with user_id; delete-user-account edge fn calls purge → admin.deleteUser
- [i18n Completeness](mem://features/i18n-completeness) — EN is source of truth (702 keys); scripts/i18n-check.mjs blocks build if any locale incomplete; scripts/i18n-fill.mjs backfills from EN
- [Bundle Size](mem://features/bundle-size) — First-load 207 KB gzip / 350 KB budget; manualChunks split three/pdf/charts/markdown/fabric; `npm run build:analyze` + `npm run bundle:report`
- [Admin Engagement](mem://features/admin-engagement) — /admin/engagement DAU/WAU/MAU + stickiness + signup chart; SQL fns get_engagement_metrics + get_dau_series; admin-engagement edge fn
- [Activity Tracking](mem://features/activity-tracking) — DB triggers auto-write to activity_feed (post_created/liked/commented, friend_added); useTrackActivity hook for non-table events
- [Lighthouse CI](mem://features/lighthouse-ci) — Per-PR perf audit on /, /auth, /pricing; LCP/CLS/TBT budgets warn-only, total-byte-weight ≤4.5MB hard-fail; reports on temporary-public-storage
