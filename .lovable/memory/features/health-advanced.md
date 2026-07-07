---
name: Healthcare Advanced (Phase 5)
description: Video consultations, e-prescriptions, medical records, insurance claims — schema, edge fns, storage buckets.
type: feature
---
# Phase 5 — Healthcare Advanced

## Schema (public)
- `video_call_sessions(appointment_id, room_id, ice_config, doctor_joined_at, patient_joined_at, ended_at, duration_sec)`
- `prescriptions(appointment_id, doctor_id, patient_id, medications jsonb, dosage_instructions, pdf_url, qr_token, expires_at default now+90d)`
- `medical_records(patient_id, record_type enum{diagnosis|allergy|medication|attachment}, title, description, data, file_url)`
- `medical_record_access_grants(patient_id, doctor_id, appointment_id, granted_at, expires_at, revoked_at)`
  - Auto-created by trigger `tg_auto_grant_record_access` when `healthcare_appointments.status → confirmed` (expires 48h after scheduled_at).
  - Auto-revoked on `cancelled_by_*`.
- `insurance_cards(patient_id, provider_name, policy_number_encrypted, card_front_url, card_back_url, valid_until)`
- `insurance_claims(patient_id, appointment_id, insurance_card_id, amount_cents, currency EUR, status enum{pending|approved|rejected|paid}, admin_note, decided_by, receipt_url)`

## RLS
- Patient fully owns `medical_records`, `insurance_cards`, `insurance_claims`.
- Doctor reads `medical_records` only via active `medical_record_access_grants`.
- `prescriptions`: patient + issuing doctor read; doctor inserts/updates own.
- Admin (via `public.has_role`) can view & update `insurance_claims`.

## Storage buckets (private)
- `prescriptions/` — `{doctor_id}/{rx_id}.pdf`
- `medical-attachments/` — `{patient_id}/...`
- `insurance-cards/` — `{patient_id}/...`
Access via edge-fn signed URLs (5 min TTL).

## Edge functions
- `video-call-token` — issues room id + ICE config (STUN + optional TURN via `TURN_URL/USERNAME/CREDENTIAL` secrets). Window: −5 min to scheduled+duration+15 min.
- `create-prescription` — doctor-only, pdf-lib PDF → prescriptions bucket, patch `pdf_url`.
- `verify-prescription-qr` — public GET-like `?token=...`, returns med list + validity.
- `submit-insurance-claim` — patient-only.
- `admin-decide-insurance-claim` — admin-only, transitions pending→approved/rejected, approved→paid.

## Frontend routes
- `/doctors/call/:appointmentId` — `VideoConsultationRoom`
- `/my-health/prescriptions` — `PrescriptionsList`
- `/my-health/records` — `MedicalRecords`
- `/my-health/insurance` — `InsuranceClaims`
- `/admin/insurance-claims` — `AdminClaimsInbox`

## Monetization
- Video: bundled with consultation, no extra fee.
- Prescriptions: free.
- Insurance claim submission: 0% platform fee.

## Tests
- `src/test/insurance-claim-flow.test.ts`
- `src/test/prescription-pdf.test.ts`
- `src/test/medical-records-rls.test.ts`
