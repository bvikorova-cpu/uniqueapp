# Fáza 5 — Healthcare Advanced (Video + Rx + Records + Insurance)

Nadväzuje na Fázu 4 (Doctor Booking). Rozšíri konzultácie o real-time video hovor, digitálne recepty s PDF, štruktúrované zdravotné záznamy pacienta a workflow na uplatnenie poistných nárokov.

## Rozsah

1. **Video konzultácia (WebRTC)** — 1:1 hovor doktor ↔ pacient v čase potvrdeného slotu, chat sidebar, screen share.
2. **E-recepty** — doktor vystaví recept po konzultácii, PDF s QR kódom, pacient si stiahne v `/my-bookings/doctors`.
3. **Zdravotné záznamy** — pacientov profil so štruktúrovanou históriou (diagnózy, alergie, lieky, prílohy). Doktor má read-only prístup len počas aktívneho appointmentu.
4. **Poistné nároky** — pacient nahrá kartu poistenca, po konzultácii môže požiadať o preplatenie; admin schvaľuje/odmieta.

Mimo rozsahu: laboratórne integrácie, ePZP štátne API, reálne prepojenie s poisťovňami (len manuálny export).

## Databázová schéma

```text
video_call_sessions (NEW)
  appointment_id (FK), room_id, ice_config jsonb,
  doctor_joined_at, patient_joined_at, ended_at, duration_sec

prescriptions (NEW)
  appointment_id, doctor_id, patient_id, issued_at,
  medications jsonb, dosage_instructions text,
  pdf_url text, qr_token text (verifikácia lekárňou), expires_at

medical_records (NEW)
  patient_id (owner), record_type enum: diagnosis|allergy|medication|attachment,
  title, description, data jsonb, file_url, recorded_at

medical_record_access_grants (NEW)
  record_id, doctor_id, appointment_id, granted_at, expires_at
  → auto-grant pri confirmed appointmente, expiruje 24h po completed

insurance_cards (NEW)
  patient_id, provider_name, policy_number (encrypted),
  card_front_url, card_back_url, valid_until

insurance_claims (NEW)
  patient_id, appointment_id, insurance_card_id,
  amount_cents, status enum: pending|approved|rejected|paid,
  admin_note, decided_by, decided_at, receipt_url
```

**RLS:** pacient plne vlastní `medical_records` a `insurance_*`. Doktor číta záznamy len cez platný `medical_record_access_grants`. Admin schvaľuje claims. `prescriptions` viditeľné pacientovi + doktorovi ktorý vystavil.

## Edge functions

1. `video-call-token` — vygeneruje krátkodobý TURN/ICE credentials + room join token; overí že caller je patient alebo doctor daného appointmentu a že je v okne −5 min / +duration+15 min.
2. `create-prescription` — doktor only; vytvorí záznam, vygeneruje PDF (pdf-lib) do Storage bucketu `prescriptions/`, vráti signed URL. QR kód obsahuje `qr_token`.
3. `verify-prescription-qr` (public) — lekáreň naskenuje QR → vráti len meno pacienta, dátum, medikamenty (bez rodného čísla).
4. `grant-record-access` — auto-trigger cez DB trigger pri `confirmed` appointmente; edge fn je fallback pre manuálny grant.
5. `submit-insurance-claim` — validácia, upload receipt (z `verify-doctor-booking`), status → `pending`, notif adminovi.
6. `admin-decide-insurance-claim` — admin only, prepne stav + pošle notif pacientovi.

## Frontend

```text
src/pages/doctors/
  VideoConsultationRoom.tsx    /doctors/call/:appointmentId
  PrescriptionsList.tsx        /my-health/prescriptions
  MedicalRecords.tsx           /my-health/records
  InsuranceClaims.tsx          /my-health/insurance

src/components/health/
  VideoCallStage.tsx           — WebRTC peer, mute/cam/screen-share
  CallChatSidebar.tsx
  PrescriptionForm.tsx         — doctor side, medication picker
  PrescriptionPdfCard.tsx      — patient download + QR preview
  MedicalRecordEditor.tsx
  InsuranceCardUploader.tsx
  ClaimSubmissionDialog.tsx

src/components/healthcare/    (dashboard rozšírenie)
  DoctorCallLauncher.tsx        — "Join call" tlačidlo na AppointmentsPanel
  IssuePrescriptionButton.tsx   — po `completed`
  AdminClaimsInbox.tsx          — pre admin route

  HowItWorksHealth.tsx          — povinný EN explainer pre nové sub-pages
```

**Router:** 4 nové autentifikované routy pod `RequireAuth`; admin claims inbox pod existujúcim admin guardom.

## Video technológia

- WebRTC peer-to-peer s `RTCPeerConnection`, signaling cez Supabase Realtime channel `video:appointment:{id}` (offer/answer/ICE).
- STUN: verejný Google STUN. TURN: Cloudflare Realtime alebo Twilio Network Traversal — secret `TURN_CREDENTIALS_URL` (edge fn to fetchuje, klient dostane už len ephemeral credentials).
- Fallback: ak WebRTC zlyhá, chat-only.

## Testy

- `e2e/authed/video-consultation-smoke.spec.ts` — stub getUserMedia, ověrí že token endpoint vráti ICE config a room mount neháže error.
- `src/test/prescription-pdf.test.ts` — PDF generátor, QR token stabilita.
- `src/test/insurance-claim-flow.test.ts` — state machine pending→approved/rejected + notifikácia.
- `src/test/medical-records-rls.test.ts` — mock RPC, doktor bez grantu → 0 rows.

## Implementačné poradie

1. **Migrácia** (6 tabuliek + enumy + RLS + GRANTs + auto-grant trigger) — čaká na schválenie.
2. Storage buckety: `prescriptions` (private), `medical-attachments` (private), `insurance-cards` (private, signed URL only).
3. Edge functions v poradí: `video-call-token` → `create-prescription` → `verify-prescription-qr` → insurance dvojica.
4. Frontend: Video room → Prescriptions → Medical records → Insurance claims → admin inbox.
5. i18n EN kľúče + "How it works" bloky.
6. Testy (4) + memory update `mem://features/doctor-booking` a nová `mem://features/health-advanced`.

## Monetizácia

- Video hovor: zdarma v cene konzultácie (žiadny extra fee).
- Recept: zdarma pre pacienta.
- Poistný claim: 0 % fee od pacienta; refund od poisťovne ide na Stripe balance pacienta.

## Bezpečnosť

- Všetky lekárske PDF a attachments cez signed URL s max 5-min TTL.
- `policy_number` šifrované pgcrypto (`pgp_sym_encrypt` s `INSURANCE_SECRET`).
- Admin akcie logované do `audit_log` (existujúca tabuľka).
- 16+ gate ostáva; pridať povinnú GDPR consent obrazovku pri prvom uložení medical record.

Po schválení začnem krokom 1 (migrácia).
