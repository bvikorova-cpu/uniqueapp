# 🎫 Unique Club — Membership Card

Big new platform-wide feature. Two tiers, one club, "supports good" positioning, and a magnetic perk stack so people buy "like candy".

## Pricing

| Tier | First payment | Monthly | What ships |
|---|---|---|---|
| 💎 Digital Card | €20 | €1.50/mo | Instant digital card in-app (PDF + Apple/Google Wallet pass) |
| 🪪 Physical Card | €30 | €1.50/mo | Printed NFC-ready plastic card mailed to address + digital card |

- 10% of every membership fee → **Unique Good Fund** (public transparency counter on landing page) — this is the "supports good" hook.
- Founding-member badge for first 1,000 sign-ups (permanent, shown on profile).

## Member perks (the "sugar")

1. **-15% on everything paid on Unique** — auto-applied at Stripe checkout (AI tools credits, Verified, Fan Club joins, Bazaar fees, Job listings, Concerts, Courses, PPV, Gifts).
2. **+50 AI credits every month** for free (auto-topped on renewal).
3. **Gold "Unique Club" ring** around avatar everywhere (site-wide badge).
4. **Priority access** — early access to new modules 7 days before public launch.
5. **Monthly member-only drop** — one exclusive perk each month (extra wheel spin, free coloring pack, exclusive livestream, etc.).
6. **Refer-a-friend €5** — every friend who buys a card gives referrer €5 credit.
7. **Founding 1,000 bonus** — permanent +2× vote weight in Megatalent + lifetime badge.
8. **Physical card only** — laser-engraved member number + NFC that opens their public profile when tapped.

## Where it lives

- New route `/club` — full launch landing page (hero, live good-fund counter, perks grid, pricing, founding-member progress bar, testimonials placeholder, FAQ, big CTAs).
- Homepage banner (dismissible) driving to `/club`.
- Profile card shows current membership + digital card + "Order physical card" button.
- Header avatar gets gold ring if member.
- `/club/card` — digital wallet view (front/back flip, download PDF, Add to Apple/Google Wallet).

## Database (single migration)

- `club_memberships` — user_id, tier (`digital`|`physical`), status, member_number (auto seq), started_at, current_period_end, stripe_subscription_id, stripe_customer_id, is_founding, shipping_address jsonb (physical only), shipping_status (`pending`|`shipped`|`delivered`), card_pdf_url, referred_by, monthly_credits_granted_at.
- `club_good_fund_ledger` — membership_id, amount_eur, contributed_at (append-only, used to compute live "supports good" total).
- `club_referrals` — referrer_id, referred_membership_id, credit_awarded_eur, created_at.
- RLS: user sees own membership; good-fund total exposed via `SECURITY DEFINER` RPC `get_club_good_fund_total()`; member_number + is_founding + tier readable by all (for badges) via view.
- Founding-member trigger flips `is_founding=true` for first 1,000 rows.
- `pg_cron` monthly job grants 50 AI credits per active member.

## Stripe

- 4 products via `create_stripe_product_and_price`:
  - `club_digital_signup` €20 one-off
  - `club_physical_signup` €30 one-off
  - `club_monthly` €1.50 recurring/month (shared)
- Edge functions:
  - `create-club-checkout` — creates Checkout with signup line item + subscription line item; collects shipping if physical.
  - `verify-club-membership` — post-redirect; inserts membership row, records good-fund contribution, awards referral credit, generates PDF card, kicks off wallet-pass generation.
  - `check-club-status` — polled on login (like Verified/Fan Club patterns).
  - Extended `stripe-webhook` — on `invoice.paid` extends period + records €0.15 to good-fund + grants 50 credits; on `customer.subscription.deleted` marks canceled.
  - `apply-club-discount` — helper used by every existing checkout function to auto-attach 15% coupon when caller is a member.

## Frontend files

- `src/pages/Club.tsx` — landing page with live counter + founding-progress bar.
- `src/pages/ClubCard.tsx` — flip-card digital card view.
- `src/components/club/ClubHero.tsx`, `ClubPerks.tsx`, `ClubPricing.tsx`, `ClubGoodFundCounter.tsx`, `ClubFoundingProgress.tsx`, `ClubFAQ.tsx`.
- `src/components/club/MemberBadge.tsx` — gold ring wrapper for avatars.
- `src/components/club/OrderPhysicalCardDialog.tsx` — shipping form.
- `src/components/club/HomepageClubBanner.tsx`.
- `src/hooks/useClubMembership.ts` — status, `startCheckout(tier)`, `openBillingPortal()`.
- i18n keys for EN + SK + HU (rest fall back to EN).

## Marketing launch

- Homepage banner + push notification to all users on release.
- Add "Unique Club" section to existing A5 flyer next update.
- Short Remotion video `unique-club.mp4` (skipped from this ticket, can render after code is live).

## Out of scope for this ticket

- Actual card printing/fulfillment integration (Printful / local printer) — we record the order + shipping address and expose a `/admin/club/shipping` queue with CSV export for you to hand off. Wire real printer API later.
- Apple/Google Wallet `.pkpass` signing (needs Apple Developer cert) — first release ships PDF only; wallet button appears with "Coming soon".

Ready to build all of the above end-to-end.
