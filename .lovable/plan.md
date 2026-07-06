# Fáza 4 — Doctor Booking System (Patient → Doctor)

Cieľom je postaviť plnohodnotný rezervačný flow: pacient si vyberie lekára a voľný termín, zaplatí konzultáciu (Stripe Connect, 85/15 split), doktor termín potvrdí/zruší a obe strany dostanú notifikácie. Existujúci `healthcare_appointments` (read-only pre providera z Fázy 3) rozšírime — netvoríme paralelnú tabuľku.

## Rozsah (v tejto fáze)

1. Lekári definujú svoj profil (špecializácia, cena/konzultácia, dĺžka slotu, mena EUR).
2. Lekári spravujú svoju dostupnosť (weekly rules + ad-hoc blokácie).
3. Pacient vidí zoznam lekárov, otvorí kalendár, vyberie voľný slot.
4. Checkout cez Stripe (existujúci `create-one-off-payment` router + nový productKey `doctor_consultation`), platba držaná do 24 h pred termínom.
5. Doktor slot potvrdí / odmietne (auto-refund pri odmietnutí alebo zrušení >24 h vopred).
6. Notifikácie (existujúca `notifications` tabuľka + email).
7. Provider dashboard `HealthcareProviderDashboard` — zapnutie Manage availability + Confirm/Cancel akcií.
8. Nová verejná stránka `/doctors` (zoznam) a `/doctors/:id` (profil + rezervácia).

Mimo rozsahu (Fáza 5+): video-hovor cez WebRTC, prescription flow, medical records, insurance claims.

## Monetizácia

- Fixná cena za konzultáciu určená lekárom (min €10, max €200), mena EUR.
- Split: **85 % lekár / 15 % platforma** (rovnaký vzor ako Creator Subscriptions).
- Payout cez Stripe Connect Express — reuse `admin-stripe-payout` a `creator_payouts` vzoru (nové `doctor_payouts`).
- Refund politika:
  - Zrušenie pacientom >24 h pred termínom → 100 % refund.
  - Zrušenie pacientom <24 h → 0 % refund, doktor stále dostane payout.
  - Odmietnutie/zrušenie doktorom → 100 % refund, žiadny platform fee.
  - No-show doktora (nepotvrdí do 2 h po termíne) → automatický 100 % refund cez cron.

## Databázová schéma (migrácia)

Rozšírime existujúce tabuľky a pridáme 3 nové:

```text
healthcare_profiles (rozšírenie)
  + specialty text
  + consultation_price_cents int (EUR, default null)
  + consultation_duration_min int (default 30)
  + is_accepting_bookings bool (default false)
  + stripe_account_id text
  + bio text, languages text[]

doctor_availability_rules (NEW)
  doctor_id, weekday (0-6), start_time, end_time, timezone
  → týždenný recurring rozvrh

doctor_availability_blocks (NEW)
  doctor_id, starts_at, ends_at, reason
  → jednorazové blokácie (dovolenka, meeting)

healthcare_appointments (rozšírenie existujúcej tabuľky)
  + patient_id uuid, doctor_id uuid, scheduled_at timestamptz
  + duration_min int, price_cents int, currency text default 'EUR'
  + status enum: pending_payment | confirmed | cancelled_by_patient
                | cancelled_by_doctor | completed | no_show
  + stripe_payment_intent_id, stripe_charge_id
  + patient_notes text, doctor_notes text, cancellation_reason text
  + confirmed_at, cancelled_at, completed_at timestamptz

doctor_payouts (NEW)
  doctor_id, appointment_id, amount_cents, platform_fee_cents,
  stripe_transfer_id, status, paid_at
```

**RLS pravidlá:**
- Pacient: SELECT vlastných appointmentov; INSERT (pending_payment); UPDATE len `status → cancelled_by_patient` s vlastnou row.
- Doktor: SELECT appointmentov kde `doctor_id = auth.uid()`; UPDATE status (confirm/cancel/complete/no_show).
- `doctor_availability_*`: doktor plne spravuje vlastné; verejné SELECT pre výpočet slotov (edge fn).
- `healthcare_profiles` s `is_accepting_bookings=true` čítateľné pre `anon` + `authenticated` (bez PII).

## Edge functions

Všetky s JWT auth, Zod validáciou, 2 credits NIE — konzultácia je platená cash (nie AI kredity).

1. **`doctor-availability-slots`** (public GET-like) — vstup: `doctor_id, from, to`; výstup: pole voľných slotov (aplikuje rules − blocks − existing appointments). Cache 60 s.
2. **`create-doctor-booking`** — vstup: `doctor_id, scheduled_at, patient_notes`. Vytvorí `pending_payment` appointment, zavolá `create-one-off-payment` router s productKey `doctor_consultation` a metadata `{appointmentId}`. Vráti Stripe checkout URL.
3. **`stripe-webhook`** (rozšírenie existujúceho) — pri `checkout.session.completed` s `metadata.appointmentId`: appointment → `confirmed`, uloží `payment_intent_id`, notif pre doktora aj pacienta.
4. **`doctor-appointment-action`** — vstup: `appointmentId, action ∈ {confirm, cancel, complete, no_show}`. RLS: doktor len vlastné. Pri `cancel` alebo `no_show` → refund cez Stripe + zápis do `doctor_payouts` skipnutý.
5. **`patient-cancel-booking`** — 24h check → full/no refund, update status, notif doktorovi.
6. **`doctor-appointments-cron`** (pg_cron, hodinovo) — auto no-show refund pre appointmenty starší než 2 h bez `completed`/`no_show`.

## Frontend

**Nové stránky/komponenty:**

```text
src/pages/doctors/
  DoctorsList.tsx           /doctors      — filter podľa špecializácie
  DoctorProfile.tsx         /doctors/:id  — bio, cena, "Book now"
  BookingConfirmation.tsx   /doctors/booking/:appointmentId

src/components/doctors/
  DoctorCard.tsx
  AvailabilityCalendar.tsx  — shadcn Calendar + slot grid (pointer-events-auto)
  BookingDialog.tsx         — vybraný slot → notes → Stripe redirect
  HowItWorksDoctors.tsx     — povinný "How it works" (i18n EN)

src/components/healthcare/  (rozšírenie provider dashboardu)
  ManageAvailabilityPanel.tsx  — týždenný rozvrh + blokácie
  AppointmentActionsMenu.tsx   — Confirm/Cancel/Complete/No-show
  DoctorEarningsCard.tsx       — príjmy + payout status
```

**Router:** pridať 3 nové routy do `src/App.tsx`, chránené `RequireAuth` len pre booking submit; browsing verejný.

## Testy

- `e2e/authed/doctor-booking-flow.spec.ts` — end-to-end: browse → pick slot → checkout → confirm as doctor → verify status.
- `src/test/doctor-booking-refund.test.ts` — unit: 24h refund logika, split výpočet.
- `src/test/doctor-availability.test.ts` — slot generator (rules − blocks − booked).

## Implementačné poradie

1. **Migrácia** (schéma + RLS + GRANTs + enum) — čaká na schválenie.
2. Edge functions (6) + rozšírenie `stripe-webhook`.
3. `productKey: doctor_consultation` do `create-one-off-payment` routera + Stripe product/price.
4. Frontend: `AvailabilityCalendar` → `DoctorProfile` → `DoctorsList` → dashboard panely.
5. Notifikácie napojené na `notifications` tabuľku (in-app) + email template.
6. Cron `doctor-appointments-cron` (auto no-show refund).
7. Testy + `mem://features/doctor-booking` memory.

## Memory update po dokončení

- Nová memory `mem://features/doctor-booking` — schéma, 85/15 split, 24h refund rule, cron.
- Update `mem://index.md` Core: „Doctor booking: patient→doctor slot pick, Stripe Connect 85/15, EUR, 24h refund window."

Po schválení plánu začnem krokom 1 (migrácia).
