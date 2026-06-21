# Unique – Manuálny testovací checklist v2

> Test karta Stripe: `4242 4242 4242 4242`, exp ľubovoľný v budúcnosti, CVC `123`.
> Login: `beata.vikorova@yandex.com` / `BiankaDominik25`.

## 1. MEGATALENT – /megatalent

### 1.1 Vstup & hero
- [ ] Otvor /megatalent – hero video sa načíta do 2s, autoplay muted.
- [ ] CTA 'Go Live' / 'Vote' viditeľné na 360px mobile.
- [ ] Countdown na ďalšie kolo beží reálne (každú sekundu -1).
- [ ] Leaderboard top 10 sa načíta, avatary lazy-loaded.

### 1.2 Submission (Go Live)
- [ ] /megatalent/go-live formulár: title, popis, kategória, video upload (max 100MB).
- [ ] Validácia: prázdne pole → red border + chybová hláška.
- [ ] Upload progress bar 0–100%, po dokončení toast 'Submitted'.
- [ ] Po submit redirect na /megatalent/my-submissions, status 'pending'.
- [ ] RLS: iný user nevidí cudzie pending submissions.

### 1.3 Voting paywall
- [ ] Klikni 'Vote' → modal 'Buy votes' (10/50/100 hlasov).
- [ ] Stripe checkout 4242… → po úspechu kredity pripísané do 5s.
- [ ] Hlas odoslaný → counter +1, tlačidlo disabled na 3s (anti-spam).
- [ ] 100k bonus votes (Verified Founder) – overiť že sa pripočítajú.

### 1.4 Watch Party
- [ ] /megatalent/watch-party/:id – live chat funguje, reakcie ❤ plávajú.
- [ ] Synchronizovaný playback (±2s medzi 2 tabmi).
- [ ] Polls počas streamu: hlasovanie sa zobrazí all viewerom realtime.
- [ ] Tip jar v chate → Stripe → 10% platforma, 90% kreatorovi.

### 1.5 Escrow & výplaty (80/20)
- [ ] Po skončení kola: víťaz dostane 80%, platforma 20%.
- [ ] Admin /admin/megatalent-payouts → 'Release' tlačidlo → Stripe transfer.
- [ ] 24h Stories – publikuj, over expiráciu po 24h.

## 2. EDUCATION – /education

### 2.1 Katalóg kurzov
- [ ] /education zoznam kurzov, filter podľa kategórie a jazyka.
- [ ] Search 'AI' → výsledky < 1s, highlight matchu.
- [ ] Cena v EUR, badge 'Bestseller' / 'New'.

### 2.2 Detail kurzu
- [ ] /education/course/:id – curriculum, lektor, recenzie, preview video.
- [ ] 'Enroll' → ak free → instant access; ak paid → Stripe checkout.
- [ ] Po nákupe: kurz v /education/my-courses.

### 2.3 Lekcie & progress
- [ ] Lekciu označiť ako 'Completed' → progress bar +%.
- [ ] Quiz na konci modulu: 70%+ = pass, certifikát PDF.
- [ ] XP +50 za dokončenú lekciu.

### 2.4 Lektor
- [ ] /education/teach – formulár pre nový kurz.
- [ ] Upload video lekcií, set price, publish.
- [ ] Earnings dashboard: 70/30 split, výplata cez Stripe Connect.

## 3. JOBS – /jobs

### 3.1 Job board
- [ ] /jobs feed inzerátov, filter (lokalita, typ úväzku, plat).
- [ ] Saved jobs (bookmark) – po reloade pretrvá.
- [ ] SEO: každá pozícia má unikátny <title>, meta description, JSON-LD JobPosting.

### 3.2 Apply flow
- [ ] 'Apply' → modal s CV upload + cover letter.
- [ ] Po submit: notifikácia zamestnávateľovi, status 'applied' u kandidáta.
- [ ] Withdraw application funguje.

### 3.3 Zamestnávateľ
- [ ] /jobs/employer – post job (paid: 29 EUR/30 dní).
- [ ] Stripe checkout → po úspechu inzerát LIVE.
- [ ] Dashboard: applicants list, filter, message kandidáta cez DM.
- [ ] Featured upgrade (+19 EUR) – inzerát na top feedu.

## 4. DATING & ANONYMOUS DATING – /dating

### 4.1 Onboarding
- [ ] Vek 16+ gate, výber preferencií (gender, age range, vzdialenosť).
- [ ] Upload min 2 fotky + bio. Bez fotky → matchy disabled.
- [ ] Lokalita povolená alebo manual city.

### 4.2 Swipe & match
- [ ] Swipe left/right plynulé na mobile (60fps).
- [ ] Match → modal celebration + možnosť 'Send message'.
- [ ] Super-like (3/deň free, viac za kredity).

### 4.3 Anonymous Dating
- [ ] /dating/anonymous – profil bez fotky, len bio + interests.
- [ ] Match → odhalenie fotky po 3 výmenách správ.
- [ ] RLS: anonymous profiles nevidno bez matchu.

### 4.4 Chat
- [ ] Real-time správy (typing indicator, read receipts).
- [ ] Block / report user → konverzácia skrytá obojstranne.
- [ ] 24h refund window: zruš predplatné → refund cez /account/billing.

### 4.5 Premium
- [ ] Stripe checkout pre Boost / See who liked you.
- [ ] Predplatné mesačné/ročné, cancel/resume funguje.

## 5. KIDS HUB (6–12) – /kids

### 5.1 Parental gate
- [ ] Modal: 'What is 7 × 8?' – nesprávna odpoveď → blokovať.
- [ ] Parental PIN nastavenie v /account/parental.
- [ ] Bez verifikovaného rodičovského účtu nemožno platiť.

### 5.2 Obsah pre deti
- [ ] Bedtime Stories AI (3 kredity).
- [ ] Coloring Pages: save do galérie.
- [ ] Virtual Pet: kŕmenie/hra, decay timer.
- [ ] Educational games: XP za úlohy.

### 5.3 Bezpečnosť
- [ ] Žiadny chat s neznámymi.
- [ ] Žiadne reklamy v Kids Hub.
- [ ] Filtre AI: zakázané témy.

## 6. TEEN HUB (13–17) – /teen

### 6.1 Age verification
- [ ] Vstup len pre overených 13–17, ID check alebo rodičovský súhlas.
- [ ] Bez ID → read-only mód.

### 6.2 Moduly
- [ ] Study Buddy AI (3 kredity/dotaz).
- [ ] Career Quiz.
- [ ] Mental Health Check-in: anonymný, pomocná linka.
- [ ] Teen Confessions: moderované.

### 6.3 Sociálne
- [ ] Friend requests len medzi Teen účtami.
- [ ] DM s adult účtami zakázané.

## 7. KITCHENSTARS ARENA – /kitchenstars

### 7.1 Recepty
- [ ] /kitchenstars/recipes feed, filter (kuchyňa, čas, diéta).
- [ ] Detail receptu: ingrediencie, kroky s časovačmi, video.
- [ ] Save recept → /kitchenstars/my-cookbook.

### 7.2 Battle / Contest
- [ ] Submit dish photo + recipe → týždenná súťaž.
- [ ] Voting: 1/deň free, viac za kredity.
- [ ] Víťaz: 80% pot, 20% platforma.

### 7.3 Cooking AI
- [ ] Ingrediencie → AI recept (3 kredity).
- [ ] Food Scanner: foto → kalórie + makros (5 kreditov).

## 8. BAZAAR – /bazaar

### 8.1 Listing
- [ ] Vytvor inzerát: title, popis, cena (EUR), 1–10 fotiek, kategória.
- [ ] Lokalita auto z profilu alebo manual.
- [ ] Publish → ihneď v feede.

### 8.2 Vyhľadávanie
- [ ] Filter: cena range, lokalita radius, kategória.
- [ ] Sort: najnovšie / najlacnejšie / najbližšie.
- [ ] Saved searches s notifikáciou.

### 8.3 Kúpa & escrow
- [ ] 'Buy now' → Stripe → escrow.
- [ ] Predávajúci pošle → kupujúci potvrdí → release funds.
- [ ] Dispute → /admin/bazaar-trust.
- [ ] Provízia 5% z transakcie.

### 8.4 Komunikácia
- [ ] Chat medzi kupcom a predávajúcim cez DM.
- [ ] Make offer (counter-offer flow).

## 9. COUPONS – /coupons

### 9.1 Browse
- [ ] Feed kupónov, filter (kategória, lokalita, % zľava).
- [ ] Detail: podmienky, expirácia, QR kód.

### 9.2 Claim & redeem
- [ ] Claim → kupón v /coupons/my.
- [ ] Redeem v obchode: QR scan → status 'used', timestamp.
- [ ] Dispute: /admin/coupon-disputes.

### 9.3 Merchant
- [ ] Vytvor kupón (paid listing).
- [ ] Stats: views, claims, redemptions, conversion %.

## 10. AI TOOLS – /ai

### 10.1 Kredity
- [ ] Balance viditeľný v hlavičke.
- [ ] Buy credits: 100 / 500 / 1000 balíčky.
- [ ] Po každom použití -3/-5 → over v /account/credits ledger.

### 10.2 Reprezentatívne nástroje
- [ ] AI Clone (5 kreditov).
- [ ] AI Mentor (3 kredity).
- [ ] AI Tattoo (5 kreditov).
- [ ] AI Astrology (3 kredity).
- [ ] Bedtime Stories (3 kredity).
- [ ] Brand Builder (5 kreditov).
- [ ] Character Battle (3 kredity).
- [ ] Dream Journal (3 kredity).
- [ ] Future Face (5 kreditov).
- [ ] Handwriting (3 kredity).
- [ ] Holographic Avatars (5 kreditov).
- [ ] Lie Detector (3 kredity).
- [ ] Lottery AI (3 kredity).

### 10.3 Throttling
- [ ] Spam 10× → rate limit (429) po ~5 requestoch.
- [ ] Nedostatok kreditov → modal 'Buy more'.
- [ ] Edge function timeout → retry + error toast.

## 11. CREATOR ECONOMY – /creators

- [ ] /creators/:slug – avatar, bio, tier, posts.
- [ ] 'Subscribe' → Stripe, 85/15 split.
- [ ] PPV: blur kým platba neprejde, potom natrvalo unlocked.
- [ ] Paid DM + Tip jar.
- [ ] KYC cez Stripe Connect, withdraw 1–3 dni.

## 12. LIVE / STREAMING – /live

- [ ] Start stream: povolenie kamery/mikrofónu.
- [ ] Latency < 3s.
- [ ] Live chat realtime, mute/ban.
- [ ] Tipy & gifty (Stripe).
- [ ] Záznam stream → automaticky uložený.
- [ ] Concurrent viewers counter (5s refresh).

## 13. FUNDRAISING – /fundraising

- [ ] Vytvor kampaň: title, popis, cieľ, deadline, fotky/video.
- [ ] KYC organizátora povinný.
- [ ] Donate → Stripe → progress bar realtime.
- [ ] Anonymné dary.
- [ ] Po dosiahnutí cieľa: výplata cez Stripe Connect.
- [ ] Updates → notif donorom.
- [ ] Refund window 14 dní.

## 14. SPORTS / TIPSTERS – /sports

- [ ] Match list, live skóre.
- [ ] Tipster leaderboard, ROI %, win rate.
- [ ] Follow tipstera, paid tipy.
- [ ] Bet tracking, P&L.
- [ ] Admin /admin/tipsters – moderácia.

## 15. GAMES HUB – /games

- [ ] GameDistribution iframe games (50+).
- [ ] Filter podľa kategórie, age rating.
- [ ] Favorites.
- [ ] Leaderboards per game.
- [ ] XP za odohraný čas (max 50 XP/deň).

## 16. WELLNESS / BEAUTY – /wellness, /beauty

- [ ] Fitness tracker: workout log, kalórie.
- [ ] Nutrition: meal plan AI (5 kreditov).
- [ ] Meditation audio sessions.
- [ ] Beauty: skincare routine builder, virtual try-on.
- [ ] Booking spa/salon → Stripe deposit.

## 17. COMMUNITY – /community/:id

- [ ] Vytvor komunitu (free/paid membership).
- [ ] Posts, events, bazaar scoped pre members.
- [ ] Moderátori: pin, delete, ban.
- [ ] Paid membership cez Stripe subscription.

## 18. MUSIC – /music

- [ ] Upload track (mp3/wav, max 50MB).
- [ ] Player s waveform.
- [ ] Playlists.
- [ ] Paid downloads.
- [ ] Royalties dashboard.

## 19. PROCLASS – /proclass

- [ ] Workshopy (yoga, business, art).
- [ ] Booking + Stripe deposit.
- [ ] Reminder email 24h pred eventom.
- [ ] Cancel policy: full 48h+, 50% 24h, 0% <24h.

## 20. VACATIONER – /vacationer

- [ ] Browse cestovné balíčky.
- [ ] Filter destinácia, dátum, cena, počet osôb.
- [ ] Book → Stripe deposit, zvyšok pred odchodom.
- [ ] Bez Secret Santa modulu (memory rule).

## 21. INVESTMENT – /investment

- [ ] Browse projekty.
- [ ] Detail: ROI, risk score, dokumenty.
- [ ] Investovať → KYC + Stripe.
- [ ] Portfolio dashboard.

## 22. REFERRAL – /referral

- [ ] Referral link, share buttons.
- [ ] Tracking: clicks, signups, conversions.
- [ ] Provízia: 10% z prvej platby pozvaného.
- [ ] Leaderboard top referrer.
- [ ] Fraud check: self-referral blokovaný.

## 23. ADMIN – /admin/*

- [ ] Login len pre rolu 'admin' (cez has_role).
- [ ] Bazaar Trust, Brand Campaigns, Payouts, Coupon Disputes.
- [ ] IQ Analytics, Payment Dashboard, Platform Earnings.
- [ ] Sports/Tipsters, Transactions, Verifications, Withdrawals.
- [ ] XP Audit / Reconciliation.

## 24. CROSS-CUTTING

- [ ] 12 jazykov, default EN, persist v localStorage, bez auto-detekcie.
- [ ] EUR všade.
- [ ] Glassmorphism, dark mode default, primary purple 270 91%, accent pink 330 100%.
- [ ] Mobile 360px: žiadny overflow, tap targets ≥ 44px.
- [ ] Realtime: 2 taby → akcia v 1 sa prejaví v 2 do 2s.
- [ ] RLS: cudzie dáta cez priame URL → 403/redirect.
- [ ] Console: bez errors/warnings (okrem 3rd-party).
- [ ] Network: bez 4xx/5xx (okrem zámerných).
- [ ] Lighthouse: Perf ≥ 80, A11y ≥ 90, SEO ≥ 90.
- [ ] PWA install + offline.html.
- [ ] Push notifications.
- [ ] GDPR: export dát, delete account.
- [ ] SEO: unique title <60ch, meta <160ch, single H1, JSON-LD.

## Sign-off

- [ ] Sekcie 1–24 preklikané, bugy zapísané s routou + krokmi.
- [ ] Stripe end-to-end (kúpa, refund, webhook).
- [ ] Bez console errors / 4xx-5xx.
- [ ] Mobile 360, tablet 768, desktop 1440 bez overflow.
- [ ] 12 jazykov prepínateľných, default EN.
