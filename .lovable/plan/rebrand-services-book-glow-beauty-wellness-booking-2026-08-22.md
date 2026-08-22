# Rebrand Services → "Book & Glow" (Beauty & Wellness Booking)

## Goal
Transform the existing generic `Services` module into a cohesive **beauty & wellness booking** product called **Book & Glow**, and close all operational gaps that prevent it from being production-ready.

## What we already have
- `services` provider table, provider setup, public browse & detail pages
- Availability rules/blocks, slot generation edge function
- Booking creation via Stripe, patient/payer side routes
- Basic services landing page

## What is missing or broken
1. **Provider inbox** — no place for the provider to manage appointments.
2. **Completion & payouts** — no cron that completes appointments, calculates 85/15 split, and records provider payouts.
3. **Notifications/reminders** — no 24h/1h email/bell reminders before appointment.
4. **Real-name reviews** — after completion, prompt users to leave a review with real profile name/avatar (per memory rule).
5. **Contact lock** — after booking, expose customer ↔ provider emails directly (no third-party mailer).
6. **Visual rebrand** — rename everywhere, new hero video, category tiles, glassmorphism cards.
7. **Clean up residual doctor/healthcare references** in the services codebase.

## Database changes
- Migration to add:
  - `service_reviews` table (reviewer_id, provider_id, appointment_id, rating, comment, created_at)
  - `service_payouts` table (provider_id, appointment_id, amount_cents, platform_fee_cents, status, paid_at)
  - `service_notification_log` table (appointment_id, type, sent_at) to avoid duplicate reminders
- Trigger on `services_appointments` status change to log notifications.
- Cron-like function to run `service_complete_past_appointments` and `service_send_reminders`.

## Edge functions
- `service-provider-inbox`: returns provider appointments with filters (upcoming, past, cancelled).
- `service-complete-appointments`: marks past confirmed appointments as completed, creates `service_payouts` row.
- `service-send-reminders`: sends 24h and 1h reminders via in-app notifications (and direct email if possible, but we only have direct email exchange).
- `service-booking-action`: provider can confirm, cancel, or no-show an appointment.

## Frontend changes
- Rename `ServicesLanding.tsx` → `BookAndGlowLanding.tsx` (keep route `/services-hub` or `/book-glow`).
- Update `/services` browse to beauty/wellness categories.
- Create `/provider/inbox` page for managing appointments.
- Add review dialog after completed appointment.
- Update Navbar labels from "Services" → "Book & Glow".
- Add 24h refund cancellation policy visible in booking flow.

## Verification
- Typecheck must pass.
- E2E or Playwright smoke test for booking flow and provider inbox.
- Confirm no remaining doctor/healthcare references.

## Risks
- Contact data exchange must be explicit and GDPR-compliant.
- Payout records are not actual Stripe transfers; they are ledger records for future admin payout.
- Keep it country-neutral; no legal entity or address in UI.
