# Fundraising QA — Nathalie Quick Start

**Deadline:** 48 h. Email: `beata.vikorova@yandex.com` / heslo v 1Password.

## URLs
- Preview: https://id-preview--3ea492b4-277a-4b1d-a6dd-ca2a3efd9225.lovable.app
- Prod: https://uniqueapp.fun

## Kritické flow (musí byť 100 % zelené)

1. **Dashboard router** — `/fundraising/dashboard` → "+ New Campaign" → musí ponúknuť **všetkých 7 kategórií** (Medical, Dream, Hero, Pet, Student, Crisis, Talent). Klik každú → otvorí správny `/fundraising/<kat>/create`. **Bug pred fixom:** všetky šli na `/medical/create`.
2. **Hub stránky** — otvor každú: `/fundraising/medical`, `/dream`, `/hero`, `/pet`, `/student`, `/crisis`, `/talent`. Žiadne 404, žiadny crash. Empty state musí mať vlastné "+ Create" tlačidlo s kategória-specific labelom.
3. **Detail → donácia** — otvor ľubovoľnú aktívnu kampaň, vlož `5 €`, email, klikni Donate. Otvorí Stripe checkout v novom okne. **Po zatvorení záložky:** webhook `stripe-webhook` musí donáciu zaregistrovať (fallback handler — overiť cez admin / DB).
4. **Donation return** — po úspešnom Stripe checkoute sa vráti `?donation=success&session_id=...` → hook `useDonationReturn` musí spraviť verify a toast "Thank you for your donation!". Cancel link vráti `?donation=canceled` → toast "Donation canceled".
5. **Edit kampane** — z `/fundraising/<kat>/<id>/dashboard` klik **Edit campaign**. Načíta sa formulár s aktuálnymi dátami. Zmeň title, klik Save → toast "Saved" a redirect na dashboard. Pre cudziu kampaň: "Not authorized" toast + redirect.
6. **Payout** — v Campaign Dashboard "Request withdrawal" → musí ísť cez `request-campaign-payout` (admin review), NIE cez starý `stripe-connect-payout`.
7. **Donor email leak** — v Campaign Dashboard top donations zoznam nesmie nikdy zobraziť `donor_email`. Verify cez DevTools → Network → response JSON.
8. **Student create** — `/fundraising/student/create` musí mať povinný checkbox **18+** a **parental consent** pred submitom.

## Reportuj
- Bug → GitHub issue label `fundraising-qa`, screenshot + Network HAR.
- Greenlight → komentár v `#qa-fundraising` Slack.

## Automatizované testy
`bunx playwright test e2e/authed/fundraising-nathalie.spec.ts` — pokrýva body 1, 2, 3, 5.
