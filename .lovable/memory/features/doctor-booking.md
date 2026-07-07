---
name: Doctor Booking (Phase 4)
description: Healthcare consultation bookings — 85/15 split, 24h refund, availability slot rules
type: feature
---

# Doctor Booking System (Healthcare / Phase 4)

## Money & splits
- Price is stored in `healthcare_appointments.price_cents`.
- Platform fee = 15% (`PLATFORM_FEE_BPS = 1500`). Doctor receives 85%.
- Split is executed in `supabase/functions/verify-doctor-booking` after Stripe payment success and persisted to `doctor_payouts`.

## Cancellation & refunds
- Patient cancels via `supabase/functions/patient-cancel-booking`.
- Full refund when `scheduled_at - now >= 24h` (boundary is inclusive).
- <24h → status becomes `cancelled_by_patient`, no refund, provider is notified.
- On refund, the linked `doctor_payouts` row is set to `cancelled`.

## Availability
- Slots produced by `supabase/functions/doctor-availability-slots`.
- Uses `doctor_availability_rules` (weekly recurring) minus `doctor_availability_blocks` and confirmed/pending `healthcare_appointments`.
- Slot duration = `healthcare_profiles.consultation_duration_min` (default 30).
- Conflict detection is half-open: touching intervals (block ends when slot starts) do NOT conflict.

## Key files
- Migrations: `healthcare_profiles`, `healthcare_appointments`, `doctor_availability_rules`, `doctor_availability_blocks`, `doctor_payouts`.
- Edge functions: `doctor-availability-slots`, `create-doctor-booking`, `verify-doctor-booking`, `patient-cancel-booking`, `doctor-appointment-action`, `doctor-appointments-cron`.
- Frontend: `/doctors`, `/doctors/:id`, `/doctors/booking/:id`, `/my-bookings/doctors`; provider panels `ManageBookingPanel`, `AppointmentsPanel`, `DoctorEarningsCard`.
- Tests: `src/test/doctor-booking-refund.test.ts`, `src/test/doctor-availability.test.ts`, `e2e/authed/doctor-booking-flow.spec.ts`.
