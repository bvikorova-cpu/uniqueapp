---
name: One-off payment router
description: Universal create-one-off-payment edge function with PRODUCTS catalog. Phase 4 mapping for jobs, coffee, concert tickets, AR previews.
type: feature
---
# Universal one-off payment router

Edge function: `supabase/functions/create-one-off-payment/index.ts`

## Frontend pattern
```ts
const { data } = await supabase.functions.invoke('create-one-off-payment', {
  body: {
    productKey: 'job_listing_14', // key in PRODUCTS catalog
    metadata: { jobListingId: jobData.id }, // forwarded to Stripe metadata
    // optional overrides for dynamic-price products:
    amount: 500, // cents
    name: 'Custom Concert Ticket',
  }
});
if (data?.url) window.location.href = data.url;
```

## Catalog (in edge function)
- `job_listing_7` → price_1TOyIhGaXSfGtYFt2CrL50T6 (€19)
- `job_listing_14` → price_1TOyIjGaXSfGtYFtsiK8FRRx (€29)
- `job_listing_30` → price_1TOyIkGaXSfGtYFtSVA63POC (€49)
- `job_listing_featured` → price_1TOyIkGaXSfGtYFtBNKAmNFk (€15)
- `coffee_small/medium/large` → dynamic price_data (€3/€5/€10), no auth required
- `concert_ticket` → dynamic, requires `amount` in body
- `ar_preview` → €1.99

## Verify endpoint
For products that need DB side-effects (e.g. activating a job listing), create a dedicated verify function. Job listings use `verify-job-listing-payment` which:
1. Reads sessionId from metadata
2. Activates `job_listings` row (sets paid_status, published_at, expires_at, is_active)
3. Records to `job_listing_payments`

## Add new one-off product
1. Create Stripe product+price (or use dynamic price_data)
2. Add entry to `PRODUCTS` map in `create-one-off-payment/index.ts`
3. Build verify-* function if DB side-effects needed
4. Frontend calls `create-one-off-payment` with productKey + metadata
