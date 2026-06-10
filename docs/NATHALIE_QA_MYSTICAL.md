# Nathalie QA — Mystical & Spiritual hub

Test credentials (already saved): `beata.vikorova@yandex.com` / `BiankaDominik25`

Test on **360×800** (smallest mainstream Android) **and** desktop 1440px.
Each row: **Page → Action → Expected**.

## 1. /past-life
| Action | Expected |
| --- | --- |
| Open page logged-out | Auth prompt or graceful empty state, no crash |
| Logged in, click "Generate Past Life Reading" with valid birth date | Spends 1 credit, returns 2-4 past lives in JSON, row inserted in `past_life_readings` |
| Click any of 8 advanced Parity tools | Spends 6 credits each, results render below |
| Insufficient credits | Toast "Insufficient credits" with CTA to top-up |

## 2. /lottery-ai
| Action | Expected |
| --- | --- |
| Generate numbers | AI returns 6 numbers + bonus, no duplicates |
| Recurring subscription button | Stripe checkout opens in new tab |

## 3. /astrology, /numerology, /dream-journal
| Action | Expected |
| --- | --- |
| Submit form | AI response renders within 10s |
| Dream journal: save entry | Row in `dream_entries` (or equivalent), shown in history |

## 4. /crystal-energy-network, /dna-memory-network
| Action | Expected |
| --- | --- |
| Open hero video | Plays autoplay-muted, no horizontal overflow on 360px |
| DNA "Find genetic matches" | Returns DB matches (gated by `reincarnation_purchases`) |

## 5. /reincarnation-social
| Action | Expected |
| --- | --- |
| Karmic Debt tracker | Calls `calculate-karmic-debt`, returns balance + actions |
| Soulmate matching (gated) | Without purchase: paywall. With active purchase: matches render |

## 6. /blockchain-confessions, /multiverse-network
| Action | Expected |
| --- | --- |
| Post confession | Inserts to DB; appears anonymously in feed |
| Multiverse: "Get universes" | Calls `get-user-universes`, renders list |

## 7. /quantum-social
| Action | Expected |
| --- | --- |
| AI Quantum Oracle | Calls `ai-mood-therapist` with quantum systemPrompt, returns choices[] |
| Observer mode toggle (premium) | Without sub: redirect to checkout. With sub: enabled |

## 8. /time-capsule, /time-reversal
| Action | Expected |
| --- | --- |
| Create capsule with future open date | Inserts row, button disabled if date in past |
| Time-reversal /create-post route | Loads TimeReversalDashboard (no 404) |
| Subscribe to Time-Reversal Pro | Stripe → success redirect → `holographic_purchases`-style unlock |

## 9. /holographic-avatars (**NEW — fixed in this iteration**)
| Action | Expected |
| --- | --- |
| Open page | Hub renders 9 tool cards, no overlap with bottom nav on 360px |
| Click Avatar Creator → fill form → Pay | Stripe checkout opens with price `price_1SPjFEGaXSfGtYFtBjeXRVkk` |
| Complete payment (Stripe test card `4242 4242 4242 4242`) | Redirected to `/holographic-avatars?success=true&session_id=...`, toast "Payment successful", row inserted in `holographic_purchases` |
| Cancel payment | Redirected to `?canceled=true`, toast "Payment canceled" |
| Repeat purchase via Customization / Battle / Breeding / Marketplace | Each creates `holographic_purchases` row with distinct `service_type` slug derived from `featureName` |

## Cross-cutting checks
- **Mobile 360**: no horizontal scroll on any of the 13 pages (covered by `e2e/mobile-360.spec.ts`)
- **Auth**: every page redirects to `/auth` when logged out (except marketing landings)
- **Currency**: all prices display in EUR (€)
- **Language**: default English; switching via selector persists across pages
- **Console**: zero red errors on hub load
- **Network**: failed EF calls show user-facing toast, never silent

## Known gaps (deferred)
- E2E interactive specs for 9/13 mystical pages — only smoke render is automated
- Holographic battle/breeding **outcome logic** still server-stubbed (purchases unlock UI, not gameplay simulation)
