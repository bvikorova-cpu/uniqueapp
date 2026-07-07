
# Fáza 1 — Fundraising (7 stránok)

Prvá vlna z tvojho master plánu. Cieľom je nahradiť "mŕtve" CTA placeholdery reálnym paid workflow a spustiť verejné darovacie kampane s embed widgetom.

## Rozsah (7 stránok)

1. **FundraisingHub** `/fundraising` — objav kampaní, filter podľa kategórie/urgency.
2. **CampaignDetail** `/fundraising/:slug` — príbeh, progress bar, donor wall, share.
3. **CreateCampaign** `/fundraising/new` — kreátor kampane (autor = user).
4. **CampaignDashboard** `/fundraising/dashboard/:id` — pre autora: donácie, payouts, updates.
5. **RecurringDonationsHub** `/my-donations` — donor vidí svoje aktívne recurring donácie (cancel only).
6. **TalentSponsorship** `/fundraising/talents` — one-off darcovstvo pre talenty (Megatalent kandidátov).
7. **EmbedWidget** `/embed/campaign/:slug` — verejný iframe + oEmbed endpoint.

## Rozhodnutia (potvrdené používateľom)

- Embed: **plnohodnotný iframe + oEmbed discovery** (`/oembed?url=...`).
- Talent sponsorship: **jednorazové** darcovstvo (Stripe `mode=payment`).
- Recurring donations: **iba cancel** (žiadny pause/resume).

## Peniaze & splits

- Platform fee = **15 %** (`FUNDRAISING_FEE_BPS = 1500`), autor kampane dostane 85 %.
- EUR only (v súlade s core memory).
- One-off donácie: Stripe Checkout `mode=payment` → `verify-fundraising-donation` zapíše `donations` + `fundraising_payouts` (85/15).
- Recurring: Stripe subscription (mesačný interval), split rovnaký, autopayout mesačne cez existujúci `auto-payout-cron`.

## Databázová schéma

```text
fundraising_campaigns (NEW)
  owner_id, slug (unique), title, story_md, cover_url, category,
  goal_cents, currency='EUR', deadline_at, status enum: draft|active|paused|closed,
  urgency enum: normal|urgent|critical, allow_recurring bool

donations (NEW)
  campaign_id, donor_id nullable (guest), amount_cents, currency='EUR',
  is_recurring bool, stripe_session_id, stripe_subscription_id nullable,
  message text nullable, is_anonymous bool, created_at

fundraising_payouts (NEW)
  donation_id, campaign_owner_id, gross_cents, fee_cents, net_cents,
  status enum: pending|paid|cancelled, stripe_transfer_id, paid_at

campaign_updates (NEW)
  campaign_id, author_id, body_md, created_at

recurring_donations (NEW)
  donor_id, campaign_id, stripe_subscription_id (unique),
  amount_cents, status enum: active|cancelled, cancelled_at

talent_sponsorships (NEW)
  talent_id (FK profiles), sponsor_id nullable, amount_cents,
  stripe_session_id, message text, created_at
```

**RLS:**
- `fundraising_campaigns`: public SELECT ak `status='active'`; owner full.
- `donations`: donor vidí svoje; owner kampane vidí donácie na svoju kampaň; anon donation viditeľná ako "Anonymous" cez sanitizovaný view.
- `fundraising_payouts`: owner iba na svoje; service_role full.
- `recurring_donations`: donor iba svoje.
- `talent_sponsorships`: talent vidí prijaté, sponsor vidí odoslané.

Každý CREATE TABLE dostane povinný GRANT blok (authenticated + service_role, anon len pre public read na campaigns + sanitizovaný donor wall).

## Edge functions

1. `create-fundraising-donation` — one-off Checkout session, `mode=payment`, guest checkout povolený.
2. `create-recurring-donation` — Stripe subscription, len authenticated, `mode=subscription`.
3. `verify-fundraising-donation` — post-Checkout: zapíše `donations` + `fundraising_payouts` (15% fee), pošle notif ownerovi.
4. `cancel-recurring-donation` — donor cancel; volá `stripe.subscriptions.cancel`, prepne `recurring_donations.status='cancelled'`.
5. `create-talent-sponsorship` — one-off Checkout pre `/fundraising/talents`.
6. `verify-talent-sponsorship` — potvrdí platbu, zapíše `talent_sponsorships` + payout záznam.
7. `fundraising-oembed` — public GET `?url=https://uniqueapp.fun/fundraising/:slug` → JSON oEmbed 1.0 rich s iframe HTML.
8. Webhook rozšírenie `stripe-webhook`: recurring `invoice.paid` → nový `donations` riadok + payout split.

## Frontend

```text
src/pages/fundraising/
  FundraisingHub.tsx
  CampaignDetail.tsx
  CreateCampaign.tsx
  CampaignDashboard.tsx
  TalentSponsorship.tsx
  EmbedCampaign.tsx           /embed/campaign/:slug (bez Navbaru, minimal chrome)

src/pages/donations/
  RecurringDonationsHub.tsx   /my-donations

src/components/fundraising/
  CampaignCard.tsx
  DonationDrawer.tsx           — amount picker, one-off vs recurring toggle
  ProgressGoal.tsx
  DonorWall.tsx                — sanitized, honors is_anonymous
  ShareRow.tsx                 — copy link + "Copy embed code" (iframe snippet)
  OEmbedLinkTag.tsx            — <link rel="alternate" type="application/json+oembed"> injection cez react-helmet-async
  CampaignUpdateComposer.tsx
  HowItWorksFundraising.tsx    — povinný EN explainer (per how-it-works-coverage memory)
```

Wire "mŕtvych" CTA (aktuálne `toast("Coming soon")`):
- `NutritionHub`, `FitnessWellness`, `AIGeneration`, `GraphicDesign`, `Photography` — CTA "Support creator" → otvorí `DonationDrawer` s pre-filled campaign owner = creator (ak má aktívnu kampaň).

## Testy

- `src/test/fundraising-phase1.test.ts` — 85/15 split math, EUR-only enforcement, guest donation flow.
- `src/test/fundraising-phase3.test.ts` — oEmbed JSON schema (type, version, html iframe with correct src).
- `e2e/authed/fundraising-nathalie.spec.ts` (už existuje) — rozšíriť o recurring cancel flow.

## SEO & metadata

- CampaignDetail: dynamic `<title>{campaign.title} — Fundraising | Unique</title>`, meta description z `story_md` (prvých 155 char), JSON-LD `DonateAction`.
- Sitemap: doplniť aktívne kampane do `sitemap-index.xml` generátora.

## Bezpečnosť

- Rate limit `create-fundraising-donation`: 10/min/IP (existujúci `utils/rateLimit.ts`).
- Sanitizácia `story_md` a `body_md` cez existujúci sanitize-html util (test už pokrýva).
- QR/donor wall: nikdy nevystaviť donor email/full_name ak `is_anonymous=true`.

## Postup implementácie

1. Migration (všetky tabuľky + GRANTs + RLS + trigger `updated_at`).
2. Edge functions (8 ks) + secrets check (`STRIPE_SECRET_KEY` je už set).
3. Frontend routes v `App.tsx` + lazy import v `routes/lazyPages.ts`.
4. Komponenty + `HowItWorksFundraising`.
5. CTA wire pre 5 hubov z Fázy 4.
6. Testy (3 nové unit + rozšírenie e2e).
7. Memory update: `mem/features/fundraising.md` + index.

Odhad: **7 str, ~25–30 h implementácie + verifikácia**.

## Otvorené na potvrdenie

- **Slug pre embed route**: `/embed/campaign/:slug` OK, alebo radšej `/e/:slug` (kratšie, lepšie pre social share)?

Po tvojom "OK" spustím migráciou. Nič nebudem tvrdiť ako hotové bez testu/dôkazu.
