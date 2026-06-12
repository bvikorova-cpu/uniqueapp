# Project Memory

## Core
- Language: 12-language support (SK, EN, HU, etc.) with auto-detection.
- Currency: EUR (€) exclusively.
- Access: Paid AI credits + Free tier (10 at signup, +10 monthly on 1st, Europe/Bratislava). AI tools cost 2-5 credits per use.
- Age Rating: 16+ for main platform, Kids Channel for ages 6–12.
- Theme: Primary purple (270 91%), accent hot pink (330 100%), 0.75rem radius, dark luxury glassmorphism.
- Branding: "Unique" wordmark in Lobster Two Bold font.
- Security: RLS lockdown, sanitized anonymous feeds, server-side currency control.
- Credit modules (9 total): Voice Chat (1cr), Drawing (2cr), Reading (2cr), Homework (2cr), Story (3cr), Career (5cr), Coloring (5cr) + Academy banner + GoldPass (neutralized to false).

## Memories
- [Monetization Rules](mem://features/monetization) — Revenue splits (e.g., 80/20 for Brand Collabs), paid-only strategy, Stripe Connect.
- [Megatalent Subscription Split](mem://features/megatalent-subscription-split) — Premium €10 / TOP €15: flat €5 referrer + rest platform. Subs DO NOT fund prize pool.
- [Megatalent Contest Periods](mem://features/megatalent-contest-periods) — Quarterly schedule, fixed €10,000/quarter via mt_contest_settings table. Q3+Q4 2026 seeded.
- [Legal & Compliance](mem://constraints/compliance) — 16+ age restriction, no health claims, GDPR visual rules.
- [Global Design Patterns](mem://design/global-patterns) — Glassmorphism, Cinematic Hub 2.0, Lucide icons.
- [Architecture Standards](mem://architecture/project-standards) — Video imports, AI throttling, Three.js type pinning.
- [Security & Performance](mem://architecture/security-and-performance) — RLS policies, daily reconciliation, mass indexing, SEO automation.
- [Rebranding](mem://features/rebranding) — KitchenStars Arena, ProClass, Fairy Castles, Unique wordmark.
- [Localization](mem://features/localization) — 12 languages, browser detection, profile persistence.
- [Brand Collaboration Escrow](mem://features/brand-collaboration-escrow) — 80/20 split, Stripe-held funds, release workflow.
- [Marketing Style](mem://design/marketing-style) — Video Screens Edition print assets, LobsterTwo typography.
- [Hub Visual Styles](mem://design/hub-visual-styles) — Themes and visibility rules for all 30+ hubs.
- [Module-Specific Logic](mem://features/module-specific-logic) — Escrow rules, recipe formats, legacy feature preservation.
- [Credit Checkout Router](mem://features/credit-checkout-router) — Universal create-checkout logic.
- [Admin Stripe Payout](mem://features/admin-stripe-payout) — Automated withdrawal wiring.
- [Kids & Teen AI Credit Matrix](mem://features/kids-teen-ai-credit-matrix) — Credit tables, costs, and edge functions for all Kids & Teen AI modules.
- [AI Credits Grant Policy](mem://features/ai-credits-policy) — STRIKTNÉ: žiadne nové automatické granty ai_credits bez schválenia. Schválené iba: monthly +10, founding +50, Stripe, promo, referral, gift, auto-recharge. Ledger + trigger auditujú každú zmenu.
- [Social & Dating audit fixes](mem://features/social-dating-audit-batch) — 24h refund, DM mute, confession sanitize, coffee no-show strikes.
