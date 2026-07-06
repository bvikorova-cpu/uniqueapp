# Plán oživenia mock stránok (~68)

## Kontext a úprimné čísla

Screenshoty ukazujú **3 skupiny** dead/mock stránok:
- **A) 100% mock** — cca 55 hub stránok bez backend volaní (hardcoded content)
- **B) Čiastočne wired** — cca 10 stránok, čítanie hej, kľúčové akcie mŕtve
- **C) Mŕtve CTA** — 3 konkrétne miesta (CreatorDashboard:319/336, MasterChefDashboard:289, VirtualPet:121)

Realistický odhad **~1–3 hodiny na modul** (DB tabuľky + RLS + edge fn + wire UI + testy). Total: **cca 80–150 hodín práce**, nie jedna iterácia.

Zvolený prístup: **fázy so schvaľovaním po každej vlne**, začíname Fundraisingom (7 str., podľa tvojej priority).

---

## Fáza 1 — Fundraising (7 str., odhad 8–12 h)

**Aktuálny stav (overený):** väčšina Fundraisingu už má edge functions (`request-campaign-payout`, `verify-campaign-payment`, `manage-donation-subscription`, `get-donation-receipt`, `admin-moderate-campaign`, `fundraising-dunning-cron`) aj komponenty. Reálne diery, ktoré fixujem:

| # | Stránka | Problém | Riešenie |
|---|---------|---------|----------|
| 1 | `FundraisingHub.tsx` | Hardcoded kategórie / počty kampaní | RPC `get_fundraising_stats()` — počty aktívnych kampaní per kategória, top 3 features, realtime |
| 2 | `DreamMaker.tsx` | Hero + featured lists mock | Query `campaigns` WHERE `category='dream' AND status='active'` s pagáciou |
| 3 | `CrisisRelief.tsx` | Filter urgency/geo mock | Query `campaigns` WHERE `category='crisis'`, filter `urgency_level`, `location` |
| 4 | `TalentSponsorship.tsx` | Talent list + apply CTA mock | Query talents + edge fn `apply-talent-sponsorship` (creates `talent_applications` row) |
| 5 | `RecurringDonationsHub.tsx` | List donor's active subs mock | Query `donation_subscriptions` per user + cancel action → `manage-donation-subscription` |
| 6 | `EmbedCampaignWidget.tsx` | Iframe generátor mock | Ozajstný `/embed/:id` route + copy-to-clipboard iframe snippet + preview |
| 7 | `CommunityHero.tsx` | Community stats + CTA mock | RPC `community_hero_stats()` + wire "Start Campaign" → `/fundraising/create/:type` |

**DB migrácie potrebné (1 migration):**
- `talent_applications(id, talent_id, sponsor_id, campaign_id, message, status, created_at)` + RLS + GRANTs
- RPC `get_fundraising_stats() → jsonb` (public, cached 60s)
- RPC `community_hero_stats() → jsonb` (public)
- INDEX `campaigns(category, status, urgency_level)` pre filtre

**Edge functions (1 nová):**
- `apply-talent-sponsorship` — POST { talent_id, message } → insert application + notify talent

**Nové UI súbory:**
- `src/pages/EmbedRoute.tsx` — verejný `/embed/campaign/:id` iframe endpoint

**Testy (vitest):**
- `src/test/fundraising-wire.test.ts` — verifikuje že každá zo 7 stránok volá aspoň jeden Supabase endpoint pri mounte (žiadny hardcoded fallback)

---

## Fáza 2 — Mŕtve CTA (C, 3 fixy, odhad 1 h)

| Súbor:riadok | Aktuálne | Oprava |
|--------------|----------|--------|
| `CreatorDashboard.tsx:319` "Exclusive Content" | toast | modál na tvorbu `creator_exclusive_posts` (tabuľka už existuje) alebo redirect na `/creator/posts/new` |
| `CreatorDashboard.tsx:336` "Membership Tiers" | toast | wire na existujúcu `/creator/subscriptions` (tabuľka `creator_subscription_tiers` už je) |
| `MasterChefDashboard.tsx:289` "Join Challenge" | toast | RPC `join_masterchef_challenge(challenge_id)` |
| `VirtualPet.tsx:121` `item.action` | undefined | mapa akcií → animácia + XP zmena + insert do `pet_activities` |

---

## Fáza 3 — Čiastočne wired (B, ~10 str., odhad 10–15 h)

- **ComedyClub** — listing shows: query `comedy_shows` tabuľku (vytvoriť ak chýba)
- **HorseRacing / LotteryAI / PhobiaTrading / GPRacingArena** — subscription check už OK, chýba write path pre game state → per-modul edge fn `<module>-action` (place-bet, spin, submit)
- **HealthcareProviderDashboard** — appointments/referrals static → query `healthcare_appointments`, `healthcare_referrals`
- **education/SkillTree** — write path (unlock skill node) → edge fn `education-skill-unlock`
- **education/StudyGroups** — create/join → edge fn `education-study-group-action`

---

## Fáza 4 — Prvá vlna mock hubov (A, top 10, odhad 25–35 h)

Poradie podľa komerčnej dôležitosti (potvrdíš pred štartom):
1. NutritionHub 2. FitnessWellness 3. AIGeneration 4. GraphicDesign 5. Photography
6. DigitalMarketing 7. MusicProduction 8. PublicSpeaking 9. Astrology 10. DreamJournal

Každá dostane:
- 1 hlavnú tabuľku (napr. `nutrition_meal_plans`, `fitness_workout_logs`)
- Edge fn na AI/paid akciu (routované cez existujúce `nutrition-router` / `generate-gift-message` kde už je proxy)
- CTA wire (odstránenie toast placeholderov)
- Ak neexistuje credit table → init v credits systéme

---

## Fáza 5 — Druhá vlna mock hubov (A, zvyšných ~45, odhad 40–60 h)

CrystalEnergyNetwork, MemoryAuctions, QuantumSocial, EmotionEconomy, ParallelUniverse, HolographicAvatars, MultiverseNetwork, DNAMemoryNetwork, BlockchainConfessions, ReincarnationSocial, TimeCapsule, VirtualEscapeRoom, Games, GamesHub, GPRacing, VirtualPet, WinePairing, FoodScanner, PlantCare, AITutor, FlashcardDecks, FlashcardDeckDetail, MathSolver, Notes, Certificates, Achievements, CertificateVerify, DailyChallenge, EducationHub, League, MentorHub, MentorFeature, MentorPremium, Mentor360Public, MockInterview, DiversityReports, PersonalizedFeed, Onboarding, Referrals, DiversitySelfId, FinancialInvestment.

Rozdelené do 4–5 podvĺn po ~10 moduloch, každá s vlastným schvaľovaním.

---

## Postup po tvojom OK

1. Schválim tento plán → spustím **Fázu 1** (Fundraising 7 str.)
2. Po dokončení Fázy 1 → screenshot + test report + tvoje manuálne overenie
3. Až potom → Fáza 2 (mŕtve CTA), atď.

**Nič nebudem tvrdiť ako "hotové" bez konkrétneho testu/dôkazu.** Runtime audit ako pri edge-functions skupinách bude aj tu.

## Otvorené otázky pred štartom Fázy 1

- Chceš pri Fundraisingu aj **verejný embed widget** (iframe + oEmbed) ako plnohodnotnú funkciu, alebo len copy-snippet UI?
- Talent sponsorship: **jednorazové darcovstvo alebo mesačný sub**? (Ovplyvní Stripe price setup.)
- Pre RecurringDonationsHub — chceš aj **pause/resume**, alebo len cancel?
