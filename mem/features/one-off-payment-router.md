---
name: One-off payment router
description: Universal create-one-off-payment edge function + shared catalog. Phase 4 mapping for jobs, AR preview, concert tickets, crystal purchases, platform gifts.
type: feature
---
# Universal one-off payment router

**Edge function**: `supabase/functions/create-one-off-payment/index.ts`
**Shared catalog + builder**: `supabase/functions/_shared/oneOffCheckout.ts`

Both the universal router AND legacy wrappers (ar-preview, concert, crystal, gift) import `createOneOffSession()` + `PRODUCTS` from the shared module — single source of truth.

> Subscriptions (coffee_lover, decor_pro, …) live in the Phase-3 `create-checkout` router, NOT here.

## Frontend pattern (universal)
```ts
const { data } = await supabase.functions.invoke('create-one-off-payment', {
  body: {
    productKey: 'job_listing_14',
    metadata: { jobListingId: jobData.id },
    // optional dynamic-product overrides:
    amount: 500,            // cents
    name: 'Custom Ticket',
    successPath: '/jobs/post/success', // override defaults
  }
});
if (data?.url) window.location.href = data.url;
```

## PRODUCTS catalog
- **Jobs**: `job_listing_7` (€19), `job_listing_14` (€29), `job_listing_30` (€49), `job_listing_featured` (€15) — all use real Stripe price IDs
- **Coffee tip-jar**: `coffee_small/medium/large` (€3/€5/€10), `requireAuth: false`
- **AR preview**: `ar_preview` (€1.99)
- **Concerts**: `concert_song_request`, `concert_collectible_ticket`, `concert_ticket` (all dynamic amount)
- **Crystal**: `crystal_purchase` (dynamic)
- **Gifts**: `platform_gift` (dynamic)

## Legacy wrapper functions (still in use, NOW thin shells)
These wrap the shared builder and add pre-checkout DB side-effects (validation, order rows, duplicate guards):
- `create-ar-preview-payment` → inserts row in `ar_preview_sessions`
- `create-concert-payment` → routes `song_request`/`collectible_ticket` types
- `create-concert-ticket-checkout` → checks duplicate purchases, fetches musician
- `create-crystal-purchase` → creates pending order with commission split
- `send-gift-payment` → fetches gift price, attaches creator metadata

Frontend call-sites for these are unchanged.

## Verify endpoints
For products that need DB side-effects after payment (e.g. activating a job listing), create a dedicated verify-* function:
- `verify-job-listing-payment` → activates `job_listings`, records `job_listing_payments`

## Add a new one-off product
1. Create Stripe product+price (or use dynamic price_data via `amount` in body)
2. Add entry to `PRODUCTS` map in `_shared/oneOffCheckout.ts`
3. (If DB side-effects) build verify-* function
4. Frontend calls `create-one-off-payment` with productKey + metadata
