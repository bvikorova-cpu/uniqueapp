---
name: One-off payment router
description: Universal create-one-off-payment edge function + shared catalog. Phase 4 mapping for jobs, AR preview, concert, crystal, gifts, courses + verify-* endpoints.
type: feature
---
# Universal one-off payment router

**Edge function**: `supabase/functions/create-one-off-payment/index.ts`
**Shared catalog + builder**: `supabase/functions/_shared/oneOffCheckout.ts`

Both the universal router AND legacy wrappers import `createOneOffSession()` + `PRODUCTS` from the shared module — single source of truth.

> Subscriptions (coffee_lover, decor_pro, …) live in the Phase-3 `create-checkout` router, NOT here.
> Credit packs (phobia, tutoring, …) live in the Phase-3 credit-checkout-router.

## Frontend pattern (universal)
```ts
const { data } = await supabase.functions.invoke('create-one-off-payment', {
  body: {
    productKey: 'job_listing_14',
    metadata: { jobListingId: jobData.id },
    amount: 500,            // optional override (cents) for dynamic products
    name: 'Custom Ticket',  // optional override
    successPath: '/foo',    // optional override (defaults from PRODUCTS)
  }
});
if (data?.url) window.location.href = data.url;
```

## PRODUCTS catalog
- **Jobs**: `job_listing_7/14/30` (€19/€29/€49), `job_listing_featured` (€15) — Stripe price IDs
- **Coffee tip-jar**: `coffee_small/medium/large` (€3/€5/€10) — `requireAuth: false`
- **AR preview**: `ar_preview` (€1.99)
- **Concerts**: `concert_song_request`, `concert_collectible_ticket`, `concert_ticket` (dynamic)
- **Crystal**: `crystal_purchase` (dynamic)
- **Gifts**: `platform_gift`, `influencer_gift`, `masterchef_gift`, `stream_gift` (dynamic)
- **Courses**: `course_purchase` (dynamic, 70/30 split)

## Legacy wrapper functions (thin shells over shared builder)
Frontend call-sites unchanged. Each wrapper adds pre-checkout DB side-effects:
- `create-ar-preview-payment` → `ar_preview_sessions` row
- `create-concert-payment` → routes song_request/collectible_ticket types
- `create-concert-ticket-checkout` → duplicate guard + pre-records `concert_ticket_purchases` (pending)
- `create-crystal-purchase` → creates `crystal_marketplace_orders` (pending) with 15% commission, links session id
- `send-gift-payment` → fetches `virtual_gifts`, creator metadata
- `send-influencer-gift` → pre-records `influencer_sent_gifts` (pending)
- `send-masterchef-gift` → pre-records `masterchef_sent_gifts` (pending)
- `send-stream-gift` → pre-records `stream_gifts` (pending)
- `purchase-course` → enrollment guard, 70/30 split metadata

## Verify endpoints (call after Stripe redirect with session_id)
- `verify-job-listing-payment` → activates `job_listings` (Phase 4 part 1)
- `verify-concert-ticket-payment` → flips `concert_ticket_purchases.payment_status` to `completed`
- `verify-crystal-purchase` → flips `crystal_marketplace_orders.status` to `paid`
- `verify-gift-payment` → routes by `metadata.type`, flips status to `completed` in influencer/masterchef/stream gifts table
- (course enrollment is done via webhook elsewhere; can be moved to verify-course-purchase if needed)

## Add a new one-off product
1. Create Stripe product+price (or use dynamic price_data via `amount` in body)
2. Add entry to `PRODUCTS` map in `_shared/oneOffCheckout.ts`
3. Build verify-* function if DB side-effects needed
4. Frontend calls `create-one-off-payment` with productKey + metadata
