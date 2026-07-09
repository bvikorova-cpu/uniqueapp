# 📋 KOMPLETNÝ CHECKLIST — VŠETKY INTERAKCIE
Projekt má **621 unikátnych routes**. Nižšie je zoznam všetkého, čo treba klikom overiť.

## Ako používať
- Otvor každú route v prehliadači (`https://uniqueapp.fun<route>`).
- Na každej stránke prejdi bod-po-bode zoznam nižšie (Univerzálne kontroly).
- Odškrtávaj ✅ / ❌ + screenshot pri chybe.

---
## 🔁 UNIVERZÁLNE KONTROLY (na KAŽDEJ stránke)
- [ ] Stránka sa načíta bez bielej obrazovky
- [ ] Žiadne chyby v Console (F12)
- [ ] Žiadne 4xx/5xx v Network tabe
- [ ] Navbar linky fungujú (Home, jazyk, theme, user menu)
- [ ] Footer linky fungujú (Privacy, Terms, Contact)
- [ ] Všetky **tlačidlá** klikateľné a robia niečo viditeľné
- [ ] Všetky **linky** vedú niekam (nie #)
- [ ] Všetky **karty/kachličky** klikateľné
- [ ] Všetky **tabs/accordiony** prepnú obsah
- [ ] Všetky **modaly/dialógy** sa dajú otvoriť aj zavrieť (X, Esc, backdrop)
- [ ] Všetky **formuláre** validujú (prázdny submit, zlý formát)
- [ ] Všetky **selecty/dropdowny** ponúkajú možnosti
- [ ] Všetky **toggle switche** menia stav (a persistujú po reload)
- [ ] Loading stavy zobrazené (spinner, skeleton)
- [ ] Empty stavy zobrazené (žiadne dáta = fallback text)
- [ ] Error stavy zobrazené (toast + fallback)
- [ ] Mobile 360px layout nie je rozbitý
- [ ] Tab-navigáciou sa dá prejsť celá stránka
- [ ] Späť tlačidlo prehliadača funguje

---
## 💳 STRIPE / KREDITY / NÁKUPY (kdekoľvek nájdeš tlačidlo Buy/Subscribe/Unlock)
- [ ] Kliknutie na Buy → otvorí Stripe Checkout
- [ ] Test karta `4242 4242 4242 4242` prejde
- [ ] Test karta `4000 0000 0000 0002` odmietne s toastom
- [ ] 3DS karta `4000 0027 6000 3184` vyžiada 3DS
- [ ] Po úspechu → redirect späť + odomkne obsah
- [ ] Po cancel → toast "canceled"
- [ ] Kredity sa odpočítajú v UI ihneď
- [ ] Pri 0 kreditoch → toast "insufficient credits" (nie 500)
- [ ] Refresh po nákupe → obsah stále odomknutý

---
## 🔐 AUTH / RLS
- [ ] Odhlásený user na /profile → redirect na /auth
- [ ] Prihlásenie emailom funguje
- [ ] Google OAuth funguje
- [ ] Password reset email príde
- [ ] Logout skutočne odhlási (reload = anon)
- [ ] API volania z inej session vrátia 401/403

---
## 🌍 I18N / MENA / THEME
- [ ] Prepni všetkých 12 jazykov → žiadny `t('key.missing')` v Console
- [ ] Iba € (žiadne $, £, Kč)
- [ ] Light/dark theme prepína bez FOUC
- [ ] Voľba jazyka/theme prežije reload

---
## 🚀 PERFORMANCE
- [ ] LCP < 2.5s na desktope
- [ ] LCP < 4s na mobile
- [ ] Žiadne CLS skoky > 0.1
- [ ] Video sa načíta až po interakcii/idle
- [ ] Žiadny bundle > 500KB v Network tabe

---

# 🗺️ VŠETKÝCH 621 ROUTES

## 00 Landing  (1)
- [ ] `/`

## 01 Admin  (61)
- [ ] `/admin`
- [ ] `/admin/affiliate-tiers`
- [ ] `/admin/audit-log`
- [ ] `/admin/battle-royale-payouts`
- [ ] `/admin/bazaar-trust`
- [ ] `/admin/brand-campaigns`
- [ ] `/admin/brand-moderation`
- [ ] `/admin/campaign-approvals`
- [ ] `/admin/campaign-withdrawals`
- [ ] `/admin/cohort-retention`
- [ ] `/admin/comedy-payouts`
- [ ] `/admin/contest-periods`
- [ ] `/admin/corporate-inquiries`
- [ ] `/admin/coupon-disputes`
- [ ] `/admin/credits-ledger`
- [ ] `/admin/dating-moderation`
- [ ] `/admin/disputes`
- [ ] `/admin/doctor-verifications`
- [ ] `/admin/dunning`
- [ ] `/admin/edge-monitoring`
- [ ] `/admin/engagement`
- [ ] `/admin/error-logs`
- [ ] `/admin/founders`
- [ ] `/admin/fundraising-moderation`
- [ ] `/admin/image-editor`
- [ ] `/admin/influencer-payouts`
- [ ] `/admin/insurance-claims`
- [ ] `/admin/iq`
- [ ] `/admin/iq-analytics`
- [ ] `/admin/kitchenstars-payouts`
- [ ] `/admin/kyc`
- [ ] `/admin/masterchef-payouts`
- [ ] `/admin/megatalent-moderation`
- [ ] `/admin/megatalent-payouts`
- [ ] `/admin/monetag-stats`
- [ ] `/admin/musician-verifications`
- [ ] `/admin/ops-tools`
- [ ] `/admin/pauses`
- [ ] `/admin/payment-dashboard`
- [ ] `/admin/platform-earnings`
- [ ] `/admin/pwa-stats`
- [ ] `/admin/reconciliation`
- [ ] `/admin/referral-fraud`
- [ ] `/admin/referral-funnel`
- [ ] `/admin/refunds`
- [ ] `/admin/rewards-audit`
- [ ] `/admin/rewards-seed`
- [ ] `/admin/sca`
- [ ] `/admin/security-scan`
- [ ] `/admin/skills-reviews`
- [ ] `/admin/smoke-test`
- [ ] `/admin/sports-matches`
- [ ] `/admin/subscription-analytics`
- [ ] `/admin/tipsters`
- [ ] `/admin/transactions`
- [ ] `/admin/verifications`
- [ ] `/admin/vitals`
- [ ] `/admin/winback`
- [ ] `/admin/withdrawals`
- [ ] `/admin/xp-audit`
- [ ] `/admin/xp-audit/reconciliation`

## 02 Auth  (1)
- [ ] `/auth`

## 03 Profile  (4)
- [ ] `/billing`
- [ ] `/profile`
- [ ] `/profile/:userId`
- [ ] `/profile/edit`

## 04 Dating  (3)
- [ ] `/anonymous-date`
- [ ] `/dating`
- [ ] `/dating/anonymous`

## 05 Megatalent  (9)
- [ ] `/megatalent`
- [ ] `/megatalent/:category`
- [ ] `/megatalent/battle-results`
- [ ] `/megatalent/battle-results/:category`
- [ ] `/megatalent/battle-results/id/:tournamentId`
- [ ] `/megatalent/go-live`
- [ ] `/megatalent/my-submissions`
- [ ] `/megatalent/success`
- [ ] `/megatalent/watch-party/:id`

## 06 Kids  (2)
- [ ] `/kids`
- [ ] `/teens`

## 08 Creators  (2)
- [ ] `/creator/:creatorId`
- [ ] `/creators`

## 09 Education  (20)
- [ ] `/course/:courseId`
- [ ] `/course/:courseId/learn`
- [ ] `/courses`
- [ ] `/education`
- [ ] `/education/achievements`
- [ ] `/education/certificates`
- [ ] `/education/course/:courseId`
- [ ] `/education/daily`
- [ ] `/education/flashcards`
- [ ] `/education/flashcards/:deckId`
- [ ] `/education/hub`
- [ ] `/education/league`
- [ ] `/education/math-solver`
- [ ] `/education/my-courses`
- [ ] `/education/notes`
- [ ] `/education/skill-tree`
- [ ] `/education/skill-tree/:subject`
- [ ] `/education/study-groups`
- [ ] `/education/teach`
- [ ] `/education/tutor`

## 10 Health  (2)
- [ ] `/health`
- [ ] `/wellness`

## 11 Marketplace  (7)
- [ ] `/auction`
- [ ] `/bazaar`
- [ ] `/bazaar/create`
- [ ] `/bazaar/saved-searches`
- [ ] `/coupons/:brand`
- [ ] `/coupons/my`
- [ ] `/coupons/season/:slug`

## 12 AI Tools  (1)
- [ ] `/ai`

## 13 Lifestyle  (6)
- [ ] `/beauty`
- [ ] `/coffee`
- [ ] `/coffee/buddy`
- [ ] `/coffee/checkins`
- [ ] `/coffee/leaderboard`
- [ ] `/cooking`

## 14 Entertainment  (5)
- [ ] `/confessions`
- [ ] `/music`
- [ ] `/music/:contentId`
- [ ] `/music/royalties`
- [ ] `/music/upload`

## 15 Community  (35)
- [ ] `/community`
- [ ] `/community/:id`
- [ ] `/friends`
- [ ] `/fundraising`
- [ ] `/fundraising/:campaignType/:campaignId/dashboard`
- [ ] `/fundraising/:campaignType/:campaignId/edit`
- [ ] `/fundraising/:type/:id/success`
- [ ] `/fundraising/crisis`
- [ ] `/fundraising/crisis/:id`
- [ ] `/fundraising/crisis/create`
- [ ] `/fundraising/dashboard`
- [ ] `/fundraising/dream`
- [ ] `/fundraising/dream/:id`
- [ ] `/fundraising/dream/create`
- [ ] `/fundraising/embed`
- [ ] `/fundraising/hero`
- [ ] `/fundraising/hero/:id`
- [ ] `/fundraising/hero/create`
- [ ] `/fundraising/medical`
- [ ] `/fundraising/medical/:id`
- [ ] `/fundraising/medical/create`
- [ ] `/fundraising/my-donations`
- [ ] `/fundraising/pet`
- [ ] `/fundraising/pet/:id`
- [ ] `/fundraising/pet/create`
- [ ] `/fundraising/receipt`
- [ ] `/fundraising/receipt/:donationId`
- [ ] `/fundraising/recurring`
- [ ] `/fundraising/student`
- [ ] `/fundraising/student/:id`
- [ ] `/fundraising/student/create`
- [ ] `/fundraising/talent`
- [ ] `/fundraising/talent/:id`
- [ ] `/fundraising/talent/create`
- [ ] `/messages`

## 16 Jobs  (36)
- [ ] `/jobs`
- [ ] `/jobs/ai-jd-writer`
- [ ] `/jobs/ai-ranking/:jobId`
- [ ] `/jobs/alerts`
- [ ] `/jobs/analytics/:jobId`
- [ ] `/jobs/applications`
- [ ] `/jobs/assessments`
- [ ] `/jobs/assessments/:id`
- [ ] `/jobs/ats/:jobId`
- [ ] `/jobs/background-checks`
- [ ] `/jobs/boost/:jobId`
- [ ] `/jobs/bulk-hiring`
- [ ] `/jobs/candidate-search`
- [ ] `/jobs/career-path`
- [ ] `/jobs/companies`
- [ ] `/jobs/companies/:slug`
- [ ] `/jobs/companies/new`
- [ ] `/jobs/diversity/reports/:jobId?`
- [ ] `/jobs/diversity/self-id`
- [ ] `/jobs/employer`
- [ ] `/jobs/for-you`
- [ ] `/jobs/headhunters`
- [ ] `/jobs/interviews`
- [ ] `/jobs/listing/:slug`
- [ ] `/jobs/map`
- [ ] `/jobs/mock-interview`
- [ ] `/jobs/onboarding`
- [ ] `/jobs/post/success`
- [ ] `/jobs/references`
- [ ] `/jobs/referrals`
- [ ] `/jobs/rejection-templates`
- [ ] `/jobs/salaries`
- [ ] `/jobs/saved`
- [ ] `/jobs/templates`
- [ ] `/jobs/video-resumes`
- [ ] `/skills`

## 17 Rewards  (5)
- [ ] `/credits`
- [ ] `/credits/buy`
- [ ] `/credits/history`
- [ ] `/rewards`
- [ ] `/rewards/audit`

## 99 Other (about)  (1)
- [ ] `/about`

## 99 Other (about-platform)  (1)
- [ ] `/about-platform`

## 99 Other (account)  (5)
- [ ] `/account/billing`
- [ ] `/account/credits`
- [ ] `/account/parental`
- [ ] `/account/subscriptions`
- [ ] `/account/verification`

## 99 Other (admin-image-editor)  (1)
- [ ] `/admin-image-editor`

## 99 Other (ai-clone)  (1)
- [ ] `/ai-clone`

## 99 Other (ai-credits)  (1)
- [ ] `/ai-credits`

## 99 Other (ai-credits-store)  (1)
- [ ] `/ai-credits-store`

## 99 Other (ai-experiences)  (1)
- [ ] `/ai-experiences`

## 99 Other (ai-generation)  (1)
- [ ] `/ai-generation`

## 99 Other (ai-mentor)  (5)
- [ ] `/ai-mentor`
- [ ] `/ai-mentor/:area`
- [ ] `/ai-mentor/hub`
- [ ] `/ai-mentor/premium`
- [ ] `/ai-mentor/tools/:feature`

## 99 Other (ai-tattoo)  (1)
- [ ] `/ai-tattoo`

## 99 Other (american-football-arena)  (1)
- [ ] `/american-football-arena`

## 99 Other (analyzer)  (5)
- [ ] `/analyzer`
- [ ] `/analyzer/collections`
- [ ] `/analyzer/history`
- [ ] `/analyzer/pricing`
- [ ] `/analyzer/result/:id`

## 99 Other (anonymous-dating)  (1)
- [ ] `/anonymous-dating`

## 99 Other (antique-appraisal)  (1)
- [ ] `/antique-appraisal`

## 99 Other (arena-hub)  (1)
- [ ] `/arena-hub`

## 99 Other (astrology)  (1)
- [ ] `/astrology`

## 99 Other (basketball-arena)  (1)
- [ ] `/basketball-arena`

## 99 Other (beauty-studio)  (1)
- [ ] `/beauty-studio`

## 99 Other (become-creator)  (1)
- [ ] `/become-creator`

## 99 Other (bedtime-stories)  (1)
- [ ] `/bedtime-stories`

## 99 Other (best-friend)  (1)
- [ ] `/best-friend`

## 99 Other (blockchain-confessions)  (1)
- [ ] `/blockchain-confessions`

## 99 Other (booking)  (1)
- [ ] `/booking`

## 99 Other (brain-duel)  (2)
- [ ] `/brain-duel`
- [ ] `/brain-duel/hub`

## 99 Other (brand-arena)  (1)
- [ ] `/brand-arena`

## 99 Other (brand-battle)  (2)
- [ ] `/brand-battle`
- [ ] `/brand-battle/hub`

## 99 Other (brand-builder)  (1)
- [ ] `/brand-builder`

## 99 Other (brand-dashboard)  (1)
- [ ] `/brand-dashboard`

## 99 Other (brand-kits)  (1)
- [ ] `/brand-kits`

## 99 Other (cert)  (1)
- [ ] `/cert/:code`

## 99 Other (certification-learn)  (1)
- [ ] `/certification-learn/:certificationId`

## 99 Other (certification-programs)  (1)
- [ ] `/certification-programs`

## 99 Other (challenges)  (1)
- [ ] `/challenges`

## 99 Other (character-arena)  (1)
- [ ] `/character-arena`

## 99 Other (character-gallery)  (1)
- [ ] `/character-gallery`

## 99 Other (chef-chat)  (1)
- [ ] `/chef-chat`

## 99 Other (choose-adventure)  (1)
- [ ] `/choose-adventure`

## 99 Other (close-friends)  (1)
- [ ] `/close-friends`

## 99 Other (collectibles)  (1)
- [ ] `/collectibles`

## 99 Other (coloring-pages)  (3)
- [ ] `/coloring-pages`
- [ ] `/coloring-pages/hub`
- [ ] `/coloring-pages/hub/:slug`

## 99 Other (comedian-dashboard)  (1)
- [ ] `/comedian-dashboard`

## 99 Other (comedy-club)  (1)
- [ ] `/comedy-club`

## 99 Other (comedy-live)  (1)
- [ ] `/comedy-live/:showId`

## 99 Other (comedy-watch)  (1)
- [ ] `/comedy-watch/:showId`

## 99 Other (communities)  (1)
- [ ] `/communities`

## 99 Other (companions)  (2)
- [ ] `/companions`
- [ ] `/companions/:conversationId`

## 99 Other (concert-watch)  (1)
- [ ] `/concert-watch/:id`

## 99 Other (contact)  (1)
- [ ] `/contact`

## 99 Other (content-studio)  (1)
- [ ] `/content-studio`

## 99 Other (cooking-ai)  (1)
- [ ] `/cooking-ai`

## 99 Other (corporate-events)  (1)
- [ ] `/corporate-events`

## 99 Other (coupon-marketplace)  (1)
- [ ] `/coupon-marketplace`

## 99 Other (course-creator)  (1)
- [ ] `/course-creator`

## 99 Other (create-character)  (1)
- [ ] `/create-character`

## 99 Other (creative-forge)  (1)
- [ ] `/creative-forge`

## 99 Other (creative-writing)  (1)
- [ ] `/creative-writing`

## 99 Other (creator-analytics)  (1)
- [ ] `/creator-analytics`

## 99 Other (creator-dashboard)  (1)
- [ ] `/creator-dashboard`

## 99 Other (creator-payouts)  (1)
- [ ] `/creator-payouts`

## 99 Other (creator-studio)  (1)
- [ ] `/creator-studio`

## 99 Other (credit-gifts)  (1)
- [ ] `/credit-gifts`

## 99 Other (crystal-energy)  (1)
- [ ] `/crystal-energy`

## 99 Other (crystal-energy-network)  (1)
- [ ] `/crystal-energy-network`

## 99 Other (crystal-marketplace)  (1)
- [ ] `/crystal-marketplace`

## 99 Other (culinary)  (1)
- [ ] `/culinary/:contentId`

## 99 Other (culinary-arts)  (1)
- [ ] `/culinary-arts`

## 99 Other (design)  (1)
- [ ] `/design/:contentId`

## 99 Other (digital-marketing)  (1)
- [ ] `/digital-marketing`

## 99 Other (digital-offspring)  (1)
- [ ] `/digital-offspring`

## 99 Other (discover-creators)  (1)
- [ ] `/discover-creators`

## 99 Other (dna-memory)  (1)
- [ ] `/dna-memory`

## 99 Other (dna-memory-network)  (1)
- [ ] `/dna-memory-network`

## 99 Other (doctor-dashboard)  (1)
- [ ] `/doctor-dashboard`

## 99 Other (doctors)  (5)
- [ ] `/doctors`
- [ ] `/doctors/:id`
- [ ] `/doctors/apply`
- [ ] `/doctors/booking/:appointmentId`
- [ ] `/doctors/call/:appointmentId`

## 99 Other (download)  (1)
- [ ] `/download`

## 99 Other (downloads)  (1)
- [ ] `/downloads`

## 99 Other (dream-journal)  (1)
- [ ] `/dream-journal`

## 99 Other (earnings)  (1)
- [ ] `/earnings`

## 99 Other (eco)  (1)
- [ ] `/eco`

## 99 Other (eco-challenge)  (2)
- [ ] `/eco-challenge`
- [ ] `/eco-challenge/history`

## 99 Other (edit-profile)  (1)
- [ ] `/edit-profile`

## 99 Other (educational-stories)  (1)
- [ ] `/educational-stories`

## 99 Other (embed)  (1)
- [ ] `/embed/campaign/:campaignType/:campaignId`

## 99 Other (emotion-economy)  (1)
- [ ] `/emotion-economy`

## 99 Other (employer-dashboard)  (1)
- [ ] `/employer-dashboard`

## 99 Other (employer-verification)  (1)
- [ ] `/employer-verification`

## 99 Other (f1-fantasy-team)  (1)
- [ ] `/f1-fantasy-team`

## 99 Other (f1-leaderboard)  (1)
- [ ] `/f1-leaderboard`

## 99 Other (f1-racing)  (1)
- [ ] `/f1-racing`

## 99 Other (f1-racing-old)  (1)
- [ ] `/f1-racing-old`

## 99 Other (f1-subscription)  (1)
- [ ] `/f1-subscription`

## 99 Other (fashion-studio)  (1)
- [ ] `/fashion-studio`

## 99 Other (financial-investment)  (1)
- [ ] `/financial-investment`

## 99 Other (first-aid)  (1)
- [ ] `/first-aid`

## 99 Other (fit-slim)  (1)
- [ ] `/fit-slim`

## 99 Other (fitness)  (1)
- [ ] `/fitness/:contentId`

## 99 Other (fitness-wellness)  (1)
- [ ] `/fitness-wellness`

## 99 Other (food-scanner)  (1)
- [ ] `/food-scanner`

## 99 Other (football-arena)  (1)
- [ ] `/football-arena`

## 99 Other (for-business)  (1)
- [ ] `/for-business`

## 99 Other (for-healthcare)  (1)
- [ ] `/for-healthcare`

## 99 Other (for-schools)  (1)
- [ ] `/for-schools`

## 99 Other (future-face)  (1)
- [ ] `/future-face`

## 99 Other (games)  (1)
- [ ] `/games`

## 99 Other (games-hub)  (1)
- [ ] `/games-hub`

## 99 Other (generate-courses)  (1)
- [ ] `/generate-courses`

## 99 Other (glamour-world)  (1)
- [ ] `/glamour-world`

## 99 Other (gp-fantasy-team)  (1)
- [ ] `/gp-fantasy-team`

## 99 Other (gp-leaderboard)  (1)
- [ ] `/gp-leaderboard`

## 99 Other (gp-racing)  (1)
- [ ] `/gp-racing`

## 99 Other (gp-racing-old)  (1)
- [ ] `/gp-racing-old`

## 99 Other (gp-subscription)  (1)
- [ ] `/gp-subscription`

## 99 Other (graphic-design)  (1)
- [ ] `/graphic-design`

## 99 Other (handwriting)  (1)
- [ ] `/handwriting`

## 99 Other (healthcare)  (1)
- [ ] `/healthcare`

## 99 Other (healthcare-dashboard)  (1)
- [ ] `/healthcare-dashboard`

## 99 Other (healthcare-library)  (1)
- [ ] `/healthcare-library`

## 99 Other (healthy)  (1)
- [ ] `/healthy`

## 99 Other (healthy-challenge)  (2)
- [ ] `/healthy-challenge`
- [ ] `/healthy-challenge/history`

## 99 Other (hockey-arena)  (1)
- [ ] `/hockey-arena`

## 99 Other (holographic-avatars)  (1)
- [ ] `/holographic-avatars`

## 99 Other (holographic-history)  (1)
- [ ] `/holographic-history`

## 99 Other (home-decor)  (1)
- [ ] `/home-decor`

## 99 Other (home-decor-subscription)  (1)
- [ ] `/home-decor-subscription`

## 99 Other (home-designer)  (1)
- [ ] `/home-designer`

## 99 Other (horse-racing)  (1)
- [ ] `/horse-racing`

## 99 Other (index)  (1)
- [ ] `/index`

## 99 Other (influ-king)  (1)
- [ ] `/influ-king`

## 99 Other (influencer)  (1)
- [ ] `/influencer/earnings`

## 99 Other (instructor-earnings)  (1)
- [ ] `/instructor-earnings`

## 99 Other (interactive-workshops)  (1)
- [ ] `/interactive-workshops`

## 99 Other (investment)  (3)
- [ ] `/investment`
- [ ] `/investment/:contentId`
- [ ] `/investment/portfolio`

## 99 Other (iq)  (3)
- [ ] `/iq/lab`
- [ ] `/iq/leaderboard`
- [ ] `/iq/u/:slug`

## 99 Other (iq-platform)  (3)
- [ ] `/iq-platform`
- [ ] `/iq-platform/lab`
- [ ] `/iq-platform/profile/:userId`

## 99 Other (kids-academy)  (1)
- [ ] `/kids-academy`

## 99 Other (kids-channel)  (14)
- [ ] `/kids-channel`
- [ ] `/kids-channel/:showId`
- [ ] `/kids-channel/certificate-gallery`
- [ ] `/kids-channel/disney-admin`
- [ ] `/kids-channel/disney-castles`
- [ ] `/kids-channel/disney-castles/:castleId`
- [ ] `/kids-channel/fairy-admin`
- [ ] `/kids-channel/fairy-castles`
- [ ] `/kids-channel/fairy-castles/:castleId`
- [ ] `/kids-channel/hub`
- [ ] `/kids-channel/hub/:slug`
- [ ] `/kids-channel/my-gallery`
- [ ] `/kids-channel/parental-dashboard`
- [ ] `/kids-channel/share/:token`

## 99 Other (kids-drawing-buddy)  (1)
- [ ] `/kids-drawing-buddy`

## 99 Other (kids-drawing-pricing)  (1)
- [ ] `/kids-drawing-pricing`

## 99 Other (kids-homework)  (1)
- [ ] `/kids-homework`

## 99 Other (kids-homework-pricing)  (1)
- [ ] `/kids-homework-pricing`

## 99 Other (kids-pricing)  (1)
- [ ] `/kids-pricing`

## 99 Other (kids-reading-companion)  (1)
- [ ] `/kids-reading-companion`

## 99 Other (kids-reading-pricing)  (1)
- [ ] `/kids-reading-pricing`

## 99 Other (kids-science-admin)  (1)
- [ ] `/kids-science-admin`

## 99 Other (kids-science-lab)  (1)
- [ ] `/kids-science-lab`

## 99 Other (kids-science-pricing)  (1)
- [ ] `/kids-science-pricing`

## 99 Other (kids-stories)  (8)
- [ ] `/kids-stories/adventure`
- [ ] `/kids-stories/battle`
- [ ] `/kids-stories/bedtime`
- [ ] `/kids-stories/character-gallery`
- [ ] `/kids-stories/create-character`
- [ ] `/kids-stories/educational`
- [ ] `/kids-stories/games`
- [ ] `/kids-stories/voice-chat`

## 99 Other (kids-story-creator)  (1)
- [ ] `/kids-story-creator`

## 99 Other (kids-story-pricing)  (1)
- [ ] `/kids-story-pricing`

## 99 Other (kids-voice-chat)  (1)
- [ ] `/kids-voice-chat`

## 99 Other (kids-voice-chat-pricing)  (1)
- [ ] `/kids-voice-chat-pricing`

## 99 Other (kitchenstars)  (5)
- [ ] `/kitchenstars`
- [ ] `/kitchenstars/*`
- [ ] `/kitchenstars/battles`
- [ ] `/kitchenstars/my-cookbook`
- [ ] `/kitchenstars/recipes`

## 99 Other (kitchenstars-subscription)  (1)
- [ ] `/kitchenstars-subscription`

## 99 Other (language)  (1)
- [ ] `/language/:contentId`

## 99 Other (language-learning)  (1)
- [ ] `/language-learning`

## 99 Other (legacy-course)  (1)
- [ ] `/legacy-course/:courseName`

## 99 Other (legal)  (7)
- [ ] `/legal`
- [ ] `/legal/community`
- [ ] `/legal/cookies`
- [ ] `/legal/creator`
- [ ] `/legal/privacy`
- [ ] `/legal/refund`
- [ ] `/legal/terms`

## 99 Other (lie-detector)  (1)
- [ ] `/lie-detector`

## 99 Other (live)  (1)
- [ ] `/live/:streamId`

## 99 Other (live-concerts)  (1)
- [ ] `/live-concerts`

## 99 Other (livestream)  (1)
- [ ] `/livestream`

## 99 Other (lottery-ai)  (1)
- [ ] `/lottery-ai`

## 99 Other (lottery-history)  (1)
- [ ] `/lottery-history`

## 99 Other (lucky-wheel)  (1)
- [ ] `/lucky-wheel`

## 99 Other (marketing)  (1)
- [ ] `/marketing/:contentId`

## 99 Other (marketplace)  (1)
- [ ] `/marketplace`

## 99 Other (masterchef)  (19)
- [ ] `/masterchef`
- [ ] `/masterchef/ai-coach`
- [ ] `/masterchef/ai-recipes`
- [ ] `/masterchef/chef-chat`
- [ ] `/masterchef/competitions`
- [ ] `/masterchef/competitions-public`
- [ ] `/masterchef/cooking-timer`
- [ ] `/masterchef/dashboard`
- [ ] `/masterchef/earnings`
- [ ] `/masterchef/gallery`
- [ ] `/masterchef/global-map`
- [ ] `/masterchef/ingredient-scanner`
- [ ] `/masterchef/leaderboard`
- [ ] `/masterchef/live-battles`
- [ ] `/masterchef/live-stream`
- [ ] `/masterchef/nutrition-analyzer`
- [ ] `/masterchef/profile`
- [ ] `/masterchef/recipe-feed`
- [ ] `/masterchef/weekly-awards`

## 99 Other (masterchef-subscription)  (1)
- [ ] `/masterchef-subscription`

## 99 Other (masterclass)  (1)
- [ ] `/masterclass/:masterclassId`

## 99 Other (masterclasses)  (1)
- [ ] `/masterclasses`

## 99 Other (meal-planner)  (1)
- [ ] `/meal-planner`

## 99 Other (megaforum)  (1)
- [ ] `/megaforum`

## 99 Other (membership)  (1)
- [ ] `/membership`

## 99 Other (membership-community)  (1)
- [ ] `/membership-community`

## 99 Other (memory-auctions)  (1)
- [ ] `/memory-auctions`

## 99 Other (mentor-360)  (1)
- [ ] `/mentor-360/:token`

## 99 Other (messenger)  (1)
- [ ] `/messenger`

## 99 Other (monetization-ideas)  (1)
- [ ] `/monetization-ideas`

## 99 Other (multiverse)  (1)
- [ ] `/multiverse`

## 99 Other (multiverse-network)  (1)
- [ ] `/multiverse-network`

## 99 Other (music-production)  (1)
- [ ] `/music-production`

## 99 Other (musician-dashboard)  (1)
- [ ] `/musician-dashboard`

## 99 Other (my-auctions)  (1)
- [ ] `/my-auctions`

## 99 Other (my-bookings)  (2)
- [ ] `/my-bookings/doctors`
- [ ] `/my-bookings/services`

## 99 Other (my-credits-history)  (1)
- [ ] `/my-credits-history`

## 99 Other (my-health)  (3)
- [ ] `/my-health/insurance`
- [ ] `/my-health/prescriptions`
- [ ] `/my-health/records`

## 99 Other (my-learning)  (1)
- [ ] `/my-learning`

## 99 Other (my-progress)  (1)
- [ ] `/my-progress`

## 99 Other (my-properties)  (1)
- [ ] `/my-properties`

## 99 Other (my-purchased-tips)  (1)
- [ ] `/my-purchased-tips`

## 99 Other (mystery-box)  (1)
- [ ] `/mystery-box`

## 99 Other (notifications)  (1)
- [ ] `/notifications`

## 99 Other (numerology)  (1)
- [ ] `/numerology`

## 99 Other (nutrition-hub)  (1)
- [ ] `/nutrition-hub`

## 99 Other (nutrition-subscriptions)  (1)
- [ ] `/nutrition-subscriptions`

## 99 Other (online-psychologist)  (1)
- [ ] `/online-psychologist`

## 99 Other (parallel-universe)  (1)
- [ ] `/parallel-universe`

## 99 Other (past-life)  (1)
- [ ] `/past-life`

## 99 Other (payment-documentation)  (1)
- [ ] `/payment-documentation`

## 99 Other (pet-translator)  (1)
- [ ] `/pet-translator`

## 99 Other (pet-translator-pricing)  (1)
- [ ] `/pet-translator-pricing`

## 99 Other (pets)  (2)
- [ ] `/pets`
- [ ] `/pets/achievements`

## 99 Other (phobia-trading)  (1)
- [ ] `/phobia-trading`

## 99 Other (photo-restoration)  (1)
- [ ] `/photo-restoration`

## 99 Other (photography)  (2)
- [ ] `/photography`
- [ ] `/photography/:contentId`

## 99 Other (pitch)  (1)
- [ ] `/pitch`

## 99 Other (plans)  (1)
- [ ] `/plans`

## 99 Other (plant-care)  (1)
- [ ] `/plant-care`

## 99 Other (post)  (1)
- [ ] `/post/:id`

## 99 Other (premium)  (1)
- [ ] `/premium`

## 99 Other (premium-courses)  (1)
- [ ] `/premium-courses`

## 99 Other (premium-plans)  (1)
- [ ] `/premium-plans`

## 99 Other (premium-store)  (1)
- [ ] `/premium-store`

## 99 Other (prices)  (1)
- [ ] `/prices`

## 99 Other (pricing)  (1)
- [ ] `/pricing`

## 99 Other (proclass)  (1)
- [ ] `/proclass/*`

## 99 Other (proclasses)  (2)
- [ ] `/proclasses`
- [ ] `/proclasses/*`

## 99 Other (promotions)  (4)
- [ ] `/promotions`
- [ ] `/promotions/mine`
- [ ] `/promotions/new`
- [ ] `/promotions/success`

## 99 Other (property-favorites)  (1)
- [ ] `/property-favorites`

## 99 Other (property-marketplace)  (1)
- [ ] `/property-marketplace`

## 99 Other (property-submission)  (1)
- [ ] `/property-submission`

## 99 Other (psychologist)  (1)
- [ ] `/psychologist`

## 99 Other (public-speaking)  (1)
- [ ] `/public-speaking`

## 99 Other (quantum-social)  (1)
- [ ] `/quantum-social`

## 99 Other (quiz)  (3)
- [ ] `/quiz`
- [ ] `/quiz/:quizId`
- [ ] `/quiz/create`

## 99 Other (recipe-generator)  (1)
- [ ] `/recipe-generator`

## 99 Other (referral)  (1)
- [ ] `/referral`

## 99 Other (referrals)  (1)
- [ ] `/referrals/leaderboard`

## 99 Other (reincarnation-social)  (1)
- [ ] `/reincarnation-social`

## 99 Other (reset-password)  (1)
- [ ] `/reset-password`

## 99 Other (restaurant-analyzer)  (1)
- [ ] `/restaurant-analyzer`

## 99 Other (roadmap)  (1)
- [ ] `/roadmap`

## 99 Other (safety-prevention)  (1)
- [ ] `/safety-prevention`

## 99 Other (schools)  (1)
- [ ] `/schools`

## 99 Other (search)  (1)
- [ ] `/search`

## 99 Other (secret-santa)  (1)
- [ ] `/secret-santa`

## 99 Other (services)  (4)
- [ ] `/services`
- [ ] `/services/:id`
- [ ] `/services/booking/:bookingId`
- [ ] `/services/provider/setup`

## 99 Other (services-hub)  (1)
- [ ] `/services-hub`

## 99 Other (settings)  (2)
- [ ] `/settings`
- [ ] `/settings/security`

## 99 Other (shadow-arena)  (7)
- [ ] `/shadow-arena`
- [ ] `/shadow-arena/battle/:battleId`
- [ ] `/shadow-arena/battle/:battleId/submit`
- [ ] `/shadow-arena/battles`
- [ ] `/shadow-arena/dashboard`
- [ ] `/shadow-arena/story/:storyId`
- [ ] `/shadow-arena/submit-story`

## 99 Other (shared)  (1)
- [ ] `/shared/:shareCode`

## 99 Other (shorts)  (1)
- [ ] `/shorts`

## 99 Other (skill-swap)  (4)
- [ ] `/skill-swap`
- [ ] `/skill-swap/dashboard`
- [ ] `/skill-swap/profile/:userId`
- [ ] `/skill-swap/profile/edit`

## 99 Other (skills-marketplace)  (9)
- [ ] `/skills-marketplace`
- [ ] `/skills-marketplace/:id`
- [ ] `/skills-marketplace/:id/edit`
- [ ] `/skills-marketplace/mine`
- [ ] `/skills-marketplace/new`
- [ ] `/skills-marketplace/orders`
- [ ] `/skills-marketplace/orders/:id`
- [ ] `/skills-marketplace/orders/success`
- [ ] `/skills-marketplace/provider/:userId`

## 99 Other (speaking)  (1)
- [ ] `/speaking/:contentId`

## 99 Other (sponsor-dashboard)  (1)
- [ ] `/sponsor-dashboard`

## 99 Other (sponsor-registration)  (1)
- [ ] `/sponsor-registration`

## 99 Other (sports)  (1)
- [ ] `/sports`

## 99 Other (sports-predictor)  (1)
- [ ] `/sports-predictor`

## 99 Other (status)  (1)
- [ ] `/status`

## 99 Other (stock-content-library)  (1)
- [ ] `/stock-content-library`

## 99 Other (stories)  (2)
- [ ] `/stories`
- [ ] `/stories/:userId`

## 99 Other (story-gallery)  (1)
- [ ] `/story-gallery`

## 99 Other (story-games)  (1)
- [ ] `/story-games`

## 99 Other (story-video-demo)  (1)
- [ ] `/story-video-demo`

## 99 Other (subscription)  (1)
- [ ] `/subscription`

## 99 Other (subscriptions)  (1)
- [ ] `/subscriptions`

## 99 Other (teacher-dashboard)  (1)
- [ ] `/teacher-dashboard`

## 99 Other (teen)  (2)
- [ ] `/teen`
- [ ] `/teen/confessions`

## 99 Other (teen-career-counselor)  (1)
- [ ] `/teen-career-counselor`

## 99 Other (teen-career-pricing)  (1)
- [ ] `/teen-career-pricing`

## 99 Other (teen-essay-coach)  (1)
- [ ] `/teen-essay-coach`

## 99 Other (teen-homework-pro)  (1)
- [ ] `/teen-homework-pro`

## 99 Other (teen-hub)  (1)
- [ ] `/teen-hub`

## 99 Other (teen-mental-wellness)  (1)
- [ ] `/teen-mental-wellness`

## 99 Other (teen-skill-builder)  (1)
- [ ] `/teen-skill-builder`

## 99 Other (teen-social-coach)  (1)
- [ ] `/teen-social-coach`

## 99 Other (teen-study-planner)  (1)
- [ ] `/teen-study-planner`

## 99 Other (tennis-arena)  (1)
- [ ] `/tennis-arena`

## 99 Other (terms)  (1)
- [ ] `/terms`

## 99 Other (time-capsule)  (1)
- [ ] `/time-capsule`

## 99 Other (time-capsule-subscription)  (1)
- [ ] `/time-capsule-subscription`

## 99 Other (time-reversal)  (4)
- [ ] `/time-reversal`
- [ ] `/time-reversal/create-post`
- [ ] `/time-reversal/dashboard`
- [ ] `/time-reversal/timeline`

## 99 Other (time-reversal-subscription)  (1)
- [ ] `/time-reversal-subscription`

## 99 Other (tipster-dashboard)  (1)
- [ ] `/tipster-dashboard`

## 99 Other (tutorial-course)  (2)
- [ ] `/tutorial-course/:courseId`
- [ ] `/tutorial-course/:courseId/learn`

## 99 Other (tutorial-platform)  (1)
- [ ] `/tutorial-platform`

## 99 Other (u)  (1)
- [ ] `/u/:username`

## 99 Other (upgrade)  (1)
- [ ] `/upgrade`

## 99 Other (vacationer)  (1)
- [ ] `/vacationer`

## 99 Other (verification)  (1)
- [ ] `/verification`

## 99 Other (verify-report)  (1)
- [ ] `/verify-report`

## 99 Other (video-ad-generator)  (1)
- [ ] `/video-ad-generator`

## 99 Other (virtual-escape-room)  (1)
- [ ] `/virtual-escape-room`

## 99 Other (virtual-influencer-agency)  (1)
- [ ] `/virtual-influencer-agency`

## 99 Other (virtual-pet)  (1)
- [ ] `/virtual-pet`

## 99 Other (wall)  (15)
- [ ] `/wall`
- [ ] `/wall/events`
- [ ] `/wall/events/:eventId`
- [ ] `/wall/friends`
- [ ] `/wall/groups`
- [ ] `/wall/groups/:groupId`
- [ ] `/wall/info`
- [ ] `/wall/memories`
- [ ] `/wall/messages`
- [ ] `/wall/more`
- [ ] `/wall/pages`
- [ ] `/wall/pages/:pageId`
- [ ] `/wall/saved`
- [ ] `/wall/trending`
- [ ] `/wall/videos`

## 99 Other (winback)  (1)
- [ ] `/winback/:token`

## 99 Other (wine-pairing)  (1)
- [ ] `/wine-pairing`

## 99 Other (wrapped)  (1)
- [ ] `/wrapped/:slug`

## 99 Other (writing)  (1)
- [ ] `/writing/:contentId`
