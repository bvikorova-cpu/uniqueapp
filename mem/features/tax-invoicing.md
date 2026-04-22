---
name: Tax & invoicing
description: Yearly creator tax CSV export and per-payment invoice/receipt download via Stripe-hosted URLs.
type: feature
---

## Edge functions

- **`creator-tax-export`** — POST `{year}` returns `text/csv` of all completed payouts for the authed creator across the 7 hub tables. Filters by `processed_at` between `year-01-01` and `year+1-01-01` and `status IN (completed,paid,approved)`. Adds per-hub summary + grand total. Frontend triggers via `fetch` (NOT `supabase.functions.invoke`) to receive the CSV blob and force download.
- **`get-payment-invoice-url`** — POST `{paymentRecordId}` validates row belongs to user, then expands the Stripe PaymentIntent (or fallback Checkout Session) to extract `latest_charge.receipt_url` or `invoice.hosted_invoice_url`. Returns `{url, type:'invoice'|'receipt'}`. Frontend opens it in a new tab.

## Frontend

- `<TaxExportCard />` in `/creator-payouts` — year `Select` + Download CSV button.
- `<PaymentHistoryCard />` in `/billing` — table of `payment_records` for the user with one-click invoice link per row.

## Why no PDF generation in app

Stripe already hosts polished PDF invoices and receipts. We just deep-link to those instead of regenerating with reportlab — keeps the receipt legally consistent with what the buyer's bank statement references.
