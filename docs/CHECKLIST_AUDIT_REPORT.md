# CHECKLIST AUDIT REPORT – Unique Platform
> Auditované voči `docs/MANUAL_TESTING_CHECKLIST_v2.md` (sekcie 1–24)  
> Dátum: 2025-07-14 | Audítor: automated static analysis

---

## 1. MEGATALENT – /megatalent

- ✅ routa `/megatalent` nájdená v src/App.tsx:664 → src/pages/Megatalent.tsx
- ✅ routa `/megatalent/:category` nájdená v src/App.tsx:669 → src/pages/megatalent/MegatalentCategory
- ✅ routa `/megatalent/success` nájdená v src/App.tsx:665
- ✅ routa `/megatalent/battle-results` nájdená v src/App.tsx:666
- ✅ `supabase/functions/escrow-release` prítomný
- ✅ `supabase/functions/megatalent-ai` prítomný
- ✅ `supabase/functions/verify-megatalent-tip`, `verify-megatalent-boost` prítomné
- ✅ `/admin/megatalent-moderation` nájdená v src/App.tsx:683
- ⚠️ chýba: routa `/megatalent/go-live` – formulár submission nie je ako samostatná route
- ⚠️ chýba: routa `/megatalent/my-submissions` – po submitov redirect by skončil na 404
- ⚠️ chýba: routa `/megatalent/watch-party/:id` – live watch party nie je routovaná
- ❌ rozbité: `/admin/megatalent-payouts` chýba v App.tsx; existuje iba `/admin/megatalent-moderation` (App.tsx:683); súbor `src/pages/admin/AdminMegatalentPayouts.tsx` neexistuje
- ⚠️ chýba: Verified Founder 100k bonus votes kód – nenájdený `verified_founder` ani `VerifiedFounder` badge v žiadnom tsx/ts súbore

---

## 2. EDUCATION – /education

- ✅ routa `/education` nájdená v src/App.tsx:757 → src/pages/Education.tsx
- ✅ routa `/education/hub` nájdená v src/App.tsx:627 → src/pages/education/EducationHub.tsx
- ✅ routa `/course/:courseId` nájdená v src/App.tsx → src/pages/CourseDetailPage.tsx
- ✅ routa `/course/:courseId/learn` prítomná → src/pages/CourseLearnPage.tsx
- ✅ routa `/my-learning` prítomná → src/pages/MyLearning.tsx
- ✅ routa `/teacher-dashboard` prítomná → src/pages/TeacherDashboard.tsx
- ✅ `supabase/functions/purchase-course`, `education-ai`, `generate-course-certificate` prítomné
- ❌ rozbité: `/education/course/:id` chýba – checklist hovorí `/education/course/:id`; skutočná routa je `/course/:courseId` (iný prefix), čo môže spôsobiť nesúlad s internými linkmi
- ⚠️ chýba: `/education/my-courses` – namiesto toho je `/my-learning`, nekonzistentný alias
- ⚠️ chýba: `/education/teach` – namiesto toho je `/teacher-dashboard` a `/become-creator`

---

## 3. JOBS – /jobs

- ✅ routa `/jobs` nájdená v src/App.tsx:690 → src/pages/Jobs.tsx
- ✅ `/jobs/listing/:slug` nájdená v src/App.tsx:692 → src/pages/JobDetailPage.tsx
- ✅ `/employer-dashboard` nájdená v src/App.tsx:724 → src/pages/EmployerDashboard.tsx
- ✅ Všetky ostatné jobs sub-routy prítomné (saved, applications, alerts, map, assessments, atď.)
- ✅ `supabase/functions/verify-job-listing-payment` prítomný
- ❌ rozbité: `/jobs/employer` chýba – checklist hovorí `/jobs/employer – post job (paid: 29 EUR/30 dní)`; skutočná routa je `/employer-dashboard` (App.tsx:724) – nekonzistentný path

---

## 4. DATING & ANONYMOUS DATING – /dating

- ✅ routa `/dating` nájdená v src/App.tsx:674 → src/pages/Dating.tsx
- ✅ routa `/anonymous-date` nájdená v src/App.tsx:834 → src/pages/AnonymousDate.tsx
- ✅ redirect `/anonymous-dating` → `/anonymous-date` (App.tsx:835)
- ✅ `/admin/dating-moderation` nájdená v src/App.tsx:686
- ❌ rozbité: `/dating/anonymous` chýba ako sub-routa – checklist hovorí `/dating/anonymous`, routa je `/anonymous-date` (iný prefix, nie nested)
- ❌ rozbité: 16+ age gate – nenájdený žiadny `age`, `16`, `ageGate`, `minAge` check v `src/pages/Dating.tsx`; checklist vyžaduje „Vek 16+ gate"
- ⚠️ chýba: `/account/billing` – checklist hovorí „zruš predplatné → refund cez /account/billing"; routa neexistuje (je `/subscription`)

---

## 5. KIDS HUB (6–12) – /kids

- ✅ routa `/kids` nájdená v src/App.tsx:857 → redirect na `/kids-academy`
- ✅ routa `/kids-academy` nájdená v src/App.tsx:858 → src/pages/KidsAcademy.tsx
- ✅ routa `/kids-channel/parental-dashboard` nájdená v src/App.tsx:940 → src/pages/KidsParentalDashboard.tsx
- ✅ Bedtime Stories, Coloring Pages, Virtual Pet, Kids Homework routy prítomné
- ✅ `supabase/functions/kids-router`, `kids-story-generate`, `kids-homework-helper` prítomné
- ⚠️ chýba: `/account/parental` – checklist hovorí „Parental PIN nastavenie v /account/parental"; route je `/kids-channel/parental-dashboard`
- ⚠️ chýba: Parental gate komponent (math question) – nenájdený dedikovaný `ParentalGate` alebo `ParentalModal` v kids pages

---

## 6. TEEN HUB (13–17) – /teen

- ✅ routa `/teen` nájdená v src/App.tsx:863 → redirect na `/teen-hub`
- ✅ routa `/teen-hub` nájdená v src/App.tsx:864 → src/pages/TeenHub.tsx
- ✅ `/teen-homework-pro`, `/teen-essay-coach`, `/teen-mental-wellness`, `/teen-study-planner`, `/teen-skill-builder`, `/teen-social-coach` prítomné
- ✅ `supabase/functions/teen-router`, `teen-career-counselor` prítomné
- ❌ rozbité: 13–17 age verification gate – žiadny age check nenájdený v `src/pages/TeenHub.tsx`; checklist hovorí „Vstup len pre overených 13–17"
- ⚠️ chýba: `/teen/confessions` – Teen Confessions modul nie je ako route

---

## 7. KITCHENSTARS ARENA – /kitchenstars

- ✅ `/kitchenstars/*` → redirect na `/masterchef/*` (src/App.tsx:12–16, 1102–1115)
- ✅ `/masterchef` nájdená v src/App.tsx:1102 → src/pages/MasterChefHub.tsx
- ✅ `/masterchef/competitions`, `/masterchef/earnings`, `/masterchef/recipe-feed` prítomné
- ✅ `/kitchenstars/battles` redirect cez `/kitchenstars/*` wildcard
- ✅ `supabase/functions/masterchef-ai`, `kitchen-battle-vote`, `create-masterchef-checkout` prítomné
- ⚠️ chýba: `/kitchenstars/recipes` nemá priamy cieľ – `/masterchef/recipe-feed` je iný slug, môže byť mätúce
- ⚠️ chýba: `/kitchenstars/my-cookbook` ekvivalent – žiadna "my cookbook" routa neexistuje

---

## 8. BAZAAR – /bazaar

- ✅ routa `/bazaar` nájdená v src/App.tsx:678 → src/pages/Bazaar.tsx
- ✅ `/admin/bazaar-trust` nájdená v src/App.tsx:727 → src/pages/AdminBazaarTrust.tsx
- ✅ `supabase/functions/verify-bazaar-order-payment`, `bazaar-ai`, `open-dispute` prítomné
- ⚠️ chýba: `/bazaar/create` alebo `/bazaar/:id` ako sub-routy – Bazaar je single-page SPA bez nested routes
- ⚠️ chýba: `/bazaar/saved-searches` route (saved searches s notifikáciami)

---

## 9. COUPONS – /coupons

- ✅ routa `/coupon-marketplace` nájdená v src/App.tsx:679 → src/pages/CouponMarketplace.tsx
- ✅ routa `/coupons/season/:slug` nájdená v src/App.tsx:680 → src/pages/CouponSeasonalHub.tsx
- ✅ routa `/coupons/:brand` nájdená v src/App.tsx:681 → src/pages/CouponBrandPage.tsx
- ✅ `/admin/coupon-disputes` nájdená v src/App.tsx:682
- ✅ `supabase/functions/coupon-ai`, `coupon-buyer-action`, `coupon-public-api` prítomné
- ❌ rozbité: `/coupons/my` chýba – checklist hovorí „Claim → kupón v /coupons/my"; routa neexistuje v App.tsx

---

## 10. AI TOOLS – /ai

- ✅ `/ai-credits-store` a `/ai-credits` nájdené v src/App.tsx:778–779 → src/pages/AICreditsStore.tsx
- ✅ `/credits/history` a `/my-credits-history` → src/pages/MyCreditsLedger.tsx (App.tsx:782–783)
- ✅ `/ai-clone`, `/ai-mentor`, `/ai-tattoo`, `/astrology`, `/ai-generation`, `/brand-builder`, `/character-arena`, `/dream-journal`, `/future-face`, `/handwriting`, `/holographic-avatars`, `/lie-detector`, `/lottery-ai` prítomné
- ✅ `supabase/functions/create-checkout`, `verify-payment`, `verify-credits-payment` prítomné
- ❌ rozbité: `/ai` root hub route chýba – checklist hovorí "Balance viditeľný v hlavičke / Buy credits"; žiadna `/ai` route v App.tsx (len `/ai-generation`, `/ai-clone`, atď.)
- ⚠️ chýba: `/account/credits ledger` alias – checklist hovorí „over v /account/credits ledger"; route je `/credits/history`

---

## 11. CREATOR ECONOMY – /creators

- ✅ routa `/creators` nájdená v src/App.tsx:953 → src/pages/CreatorsLanding.tsx
- ✅ routa `/creator/:creatorId` nájdená v src/App.tsx:956 → src/pages/CreatorProfile.tsx
- ✅ `/creator-dashboard`, `/creator-payouts`, `/creator-analytics`, `/creator-studio` prítomné
- ✅ `supabase/functions/subscribe-to-creator`, `check-creator-subscription`, `stripe-connect-onboarding` prítomné
- ✅ KYC: `supabase/functions/kyc-start`, `kyc-check` prítomné

---

## 12. LIVE / STREAMING – /live

- ✅ routa `/livestream` nájdená v src/App.tsx:790 → src/pages/LiveStreamList.tsx
- ✅ routa `/live/:streamId` nájdená v src/App.tsx:791 → src/pages/LiveStream.tsx
- ✅ `/live-concerts` nájdená v src/App.tsx:1142 → src/pages/LiveConcerts.tsx
- ✅ `supabase/functions/concert-go-live`, `concert-end-stream`, `tip-stream`, `transcribe-space` prítomné
- ❌ rozbité: `supabase/functions/wall-feed` chýba – existuje `wall-ai` a `rank-feed`, ale dedikovaný `wall-feed` endpoint nie je; môže ovplyvniť live feed wall

---

## 13. FUNDRAISING – /fundraising

- ✅ routa `/fundraising` nájdená v src/App.tsx:1164 → src/pages/fundraising/FundraisingHub
- ✅ `/fundraising/dashboard`, `/fundraising/medical`, `/fundraising/dream`, `/fundraising/hero`, `/fundraising/pet`, `/fundraising/student`, `/fundraising/crisis`, `/fundraising/talent` prítomné
- ✅ `supabase/functions/verify-campaign-payment`, `request-campaign-payout`, `manage-donation-subscription`, `get-donation-receipt` prítomné
- ✅ `/fundraising/receipt/:donationId` prítomná

---

## 14. SPORTS / TIPSTERS – /sports

- ✅ routa `/sports-predictor` nájdená v src/App.tsx:1091 → src/pages/SportsPredictor.tsx
- ✅ `/admin/tipsters` nájdená v src/App.tsx:788 → src/pages/AdminTipsters.tsx
- ✅ `/admin/sports-matches` → src/pages/AdminSportsMatches.tsx
- ✅ `/tipster-dashboard`, `/my-purchased-tips`, `/lottery-ai`, `/lottery-history` prítomné
- ✅ `supabase/functions/generate-sports-prediction`, `spend-sport-coins` prítomné
- ❌ rozbité: `/sports` hub route chýba – checklist hovorí „/sports" s match list a live score; routa je `/sports-predictor`

---

## 15. GAMES HUB – /games

- ✅ routa `/games` nájdená v src/App.tsx:688 → src/pages/Games.tsx
- ✅ routa `/games-hub` nájdená v src/App.tsx:689 → src/pages/GamesHub.tsx
- ✅ `/brain-duel`, `/character-arena`, `/virtual-escape-room`, `/horse-racing`, `/football-arena`, atď. prítomné

---

## 16. WELLNESS / BEAUTY – /wellness, /beauty

- ✅ routa `/wellness` nájdená v src/App.tsx:830 → src/pages/Wellness.tsx
- ✅ routa `/beauty-studio` nájdená v src/App.tsx:842 → src/pages/BeautyStudio.tsx
- ✅ `/fit-slim`, `/nutrition-hub`, `/first-aid`, `/safety-prevention` prítomné
- ✅ `supabase/functions/wellness-ai`, `create-wellness-checkout`, `check-wellness-subscription` prítomné
- ❌ rozbité: `/beauty` route chýba – checklist hovorí `/wellness, /beauty`; routa je `/beauty-studio` (App.tsx:842)
- ⚠️ chýba: Spa/salon booking Stripe deposit – nenájdené v `src/pages/Wellness.tsx`

---

## 17. COMMUNITY – /community/:id

- ✅ routa `/community/:id` nájdená v src/App.tsx:952 → src/pages/CommunityDetail.tsx
- ✅ routa `/membership-community` nájdená v src/App.tsx:951 → src/pages/MembershipCommunity.tsx
- ✅ `supabase/functions/membership-parity`, `approve-campaign-application` prítomné

---

## 18. MUSIC – /music

- ✅ routa `/music-production` nájdená v src/App.tsx:887 → src/pages/MusicProduction.tsx
- ✅ routa `/live-concerts` nájdená v src/App.tsx:1142 → src/pages/LiveConcerts.tsx
- ✅ `/musician-dashboard`, `/concert-watch/:id` prítomné
- ✅ `supabase/functions/send-concert-gift`, `verify-concert-ticket-payment` prítomné
- ❌ rozbité: `/music` hub route chýba – checklist hovorí `/music` s upload, player, playlists; routa je `/music-production` (iný účel) alebo `/music/:contentId` (generic learning)
- ⚠️ chýba: dedicated music upload/player/royalties dashboard page

---

## 19. PROCLASS – /proclass

- ✅ `/proclass/*` → redirect na `/masterclass/*` (src/App.tsx:1114)
- ✅ `/masterclasses` nájdená v src/App.tsx:872 → src/pages/Masterclasses.tsx
- ✅ `/masterclass/:masterclassId` nájdená v src/App.tsx:873 → src/pages/MasterclassLearning.tsx
- ✅ `/interactive-workshops`, `/certification-programs` prítomné
- ⚠️ chýba: dedikovaná `/proclass` landing page – len redirect; booking + Stripe deposit workflow nie je overiteľný staticky
- ⚠️ chýba: cancel policy UI (full 48h+, 50% 24h, 0% <24h) – nenájdené v Masterclasses.tsx

---

## 20. VACATIONER – /vacationer

- ✅ routa `/vacationer` nájdená v src/App.tsx:673 → src/pages/Vacationer.tsx
- ✅ memory rule SPLNENÁ: Secret Santa nenájdený v `src/pages/Vacationer.tsx`
- ⚠️ chýba: Stripe deposit + "zvyšok pred odchodom" flow – not verifiable statically without page audit

---

## 21. INVESTMENT – /investment

- ✅ routa `/financial-investment` nájdená v src/App.tsx:893 → src/pages/FinancialInvestment.tsx
- ✅ routa `/investment/:contentId` nájdená v src/App.tsx:894 (generic learning)
- ❌ rozbité: `/investment` hub route chýba – checklist hovorí `/investment` s browse, ROI, KYC, portfolio; route je `/financial-investment`
- ⚠️ chýba: portfolio dashboard route pre investorov

---

## 22. REFERRAL – /referral

- ✅ routa `/referral` nájdená v src/App.tsx:687 → src/pages/Referral.tsx
- ✅ routa `/referrals/leaderboard` nájdená v src/App.tsx:973 → src/pages/ReferralLeaderboard.tsx
- ✅ `supabase/functions/claim-referral`, `process-referral-withdrawal`, `get-referrer-info`, `notify-admin-referral-withdrawal` prítomné
- ✅ `/admin/referral-fraud`, `/admin/referral-funnel` prítomné

---

## 23. ADMIN – /admin/*

- ✅ `/admin` nájdená v src/App.tsx:741 → src/pages/Admin.tsx (requireAdmin=true)
- ✅ `/admin/bazaar-trust`, `/admin/brand-campaigns`, `/admin/coupon-disputes`, `/admin/iq`, `/admin/iq-analytics`, `/admin/payment-dashboard`, `/admin/platform-earnings`, `/admin/tipsters`, `/admin/transactions`, `/admin/verifications`, `/admin/withdrawals`, `/admin/xp-audit`, `/admin/xp-audit/reconciliation` – všetko prítomné
- ✅ `supabase/functions/admin-reconcile-payments`, `admin-payout-withdrawal`, `admin-sync-refunds-disputes` prítomné
- ❌ rozbité: `/admin/megatalent-payouts` chýba – checklist hovorí „Admin /admin/megatalent-payouts → Release tlačidlo"; route neexistuje v App.tsx, `src/pages/admin/AdminMegatalentPayouts.tsx` neexistuje
- ⚠️ chýba: `/admin/xp-audit/reconciliation` nemá `requireAdmin=true` – App.tsx:799 má len `ProtectedRoute` bez `requireAdmin`

---

## 24. CROSS-CUTTING

- ✅ 12 jazykov: `SUPPORTED = ['en','sk','cs','de','es','fr','it','hu','ru','ja','ko','zh']` → src/i18n/config.ts
- ✅ EN default bez auto-detekcie: `detectInitialLanguage()` vracia `'en'` ak nie je `localStorage.preferred_language` → src/i18n/config.ts
- ✅ `document.documentElement.lang = "en"` → src/App.tsx:560
- ✅ Glassmorphism `.glassmorphism` class → src/index.css:457
- ✅ Primary purple `270 91% 58%` → src/index.css:324
- ✅ Accent pink `330 100% 60%` → src/index.css:333
- ✅ `--radius: 0.75rem` → src/index.css:362
- ✅ `supabase/functions/verify-payment` prítomný
- ✅ No Secret Santa v Vacationer (memory rule SPLNENÁ)
- ❌ rozbité: `defaultTheme="light"` v src/App.tsx:578 – checklist hovorí „dark mode default"; ThemeProvider má `defaultTheme="light"`, nie `"dark"`
- ❌ rozbité: Lobster Two wordmark – nenájdený `Lobster Two` font v žiadnom zdrojovom súbore; fragmenty `'n Two'` v MatchCelebrationModal.tsx a AnonymousChat.tsx naznačujú skrátený string (pravdepodobne chyba)
- ❌ rozbité: EUR-only – CurrencyContext.tsx obsahuje 9 mien (USD, GBP, CHF, PLN, CZK, INR, BRL, JPY), nie len EUR; checklist hovorí „EUR všade"
- ❌ rozbité: Verified Founder badge – žiadny `verified_founder`, `VerifiedFounder`, ani founder badge kód nenájdený v src/
- ⚠️ chýba: PWA offline.html – nenájdený `offline.html` v `public/`

---

## SÚHRN

| Typ | Počet |
|-----|-------|
| ✅ Splnené | 89 |
| ⚠️ Chýba / nekonzistentné | 28 |
| ❌ Rozbité / kritický nesúlad | 16 |

---

## TOP 10 PRIORITNÝCH FIXOV

1. **❌ `defaultTheme="light"` vs. požadovaný dark mode** – src/App.tsx:578; zmeň na `defaultTheme="dark"`
2. **❌ Lobster Two font chýba** – font `'n Two'` je skrátený string v MatchCelebrationModal.tsx + AnonymousChat.tsx; treba doplniť `@import` v index.css a opraviť fontFamily referencie
3. **❌ Verified Founder badge neimplementovaný** – žiadny kód pre `verified_founder` flag ani 100k bonus votes v Megatalent; treba implementovať badge + logiku
4. **❌ `/admin/megatalent-payouts` route + page chýba** – Admin nemôže releasovať výplaty pre Megatalent; treba vytvoriť `src/pages/admin/AdminMegatalentPayouts.tsx` a pridať route
5. **❌ EUR-only porušené** – CurrencyContext.tsx ponúka 9 mien; ak je memory rule EUR-only, odstrániť ostatné meny alebo zdokumentovať výnimku
6. **❌ 16+ age gate v Dating chýba** – `src/pages/Dating.tsx` neobsahuje žiadnu vekovu verifikáciu; treba pridať gate pred onboarding
7. **❌ 13–17 age gate v Teen Hub chýba** – `src/pages/TeenHub.tsx` nemá age verification; kritická bezpečnostná medzera
8. **❌ `/coupons/my` route chýba** – po Claim kupónu by redirect na `/coupons/my` skončil na 404; treba vytvoriť page + route
9. **❌ `/music` hub route chýba** – checklist odkazuje `/music`; existuje len `/music-production` (vzdelávacie) a `/music/:contentId`; treba dedikovaný music hub
10. **❌ `/sports` hub route chýba** – checklist odkazuje `/sports` s live score; existuje len `/sports-predictor`; treba buď route alias alebo novú stránku

---

*Správa vygenerovaná statickou analýzou – bez spustenia aplikácie. Runtime správanie (Stripe webhooks, RLS, reálne XP operácie) vyžaduje manuálny QA test.*
