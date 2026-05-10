## Coupon House — implementácia 21 features (4 sprinty)

Postupne dodám všetkých 21 vylepšení v 4 sprintoch. Každý sprint = 1 migrácia + UI + (ak treba) edge funkcia.

### Sprint 1 — Trust & social proof (5)
1. **Verified / Worked / Didn't work** tlačidlá pri každom kupóne (`coupon_verifications` tabuľka, počítadlo úspešnosti %)
2. **Public success counter** na karte kupónu ("Worked for 87% of 124 users")
3. **Comments / Q&A** pri kupóne (`coupon_comments` s vláknami, RLS)
4. **Verified seller badge** (auto: ≥10 orders, <2% disputes, ≥4.5★)
5. **Expiry heatmap** mini widget na karte (farebný indikátor: dnes/tento týždeň/mesiac)

### Sprint 2 — Engagement & discovery (6)
6. **Upvote / Downvote** + Hot ranking algoritmus (Reddit-style score)
7. **"Hot Deals" sekcia** s top 10 podľa hot score
8. **Daily Deal countdown** (1 deal/deň, 24h timer, admin-pick alebo auto-best)
9. **Filter chips**: Free Shipping, BOGO, % Off, € Off, Verified Only
10. **Trending Stores leaderboard** (top 10 obchodov týždňa podľa objemu)
11. **Bookmarks / folders** (organizácia wishlistu do priečinkov)

### Sprint 3 — Growth & retention (5)
12. **Referral wiring v Coupon House** (zobrazenie referral kódu, bonus credit pri kúpe priateľa)
13. **Daily/weekly email digest** (edge fn `coupon-digest-cron`, top deals + alerts)
14. **Seasonal Hub template** (Black Friday / Christmas / Back-to-School landing s curated dealmi)
15. **Coupon Battle** — 2 podobné kupóny vedľa seba, user hlasuje, výsledok ovplyvní ranking
16. **Comparison widget** — porovnaj 2-3 kupóny na 1 obchod (cena, rating, expiry)

### Sprint 4 — Moat features (5)
17. **Coupon Stacking Calculator** (AI tool — vyber kupóny, vypočíta finálnu cenu + warnings)
18. **Receipt-scan cashback** (upload účtenky → AI extract → 1-3% cashback do `coupon_cashback_ledger`)
19. **Geo deals** (lokálne deals podľa user location, opt-in)
20. **Coupon API / affiliate program** (verejné read-only API + affiliate linky pre influencerov)
21. **Browser extension teaser** (landing CTA "Coming soon — auto-apply codes" + waitlist email capture)

### Technický postup pre každý sprint
1. **Migrácia** — tabuľky, RLS politiky, triggers, RPC funkcie (security definer kde treba)
2. **Hooks** — `useCouponVerifications`, `useCouponComments`, `useCouponVotes`, atď. v `src/hooks/`
3. **UI komponenty** — pridané do `src/components/coupon/` a integrované do `src/pages/CouponHouse.tsx` + `CouponDetail.tsx`
4. **Edge funkcie** kde treba (digest cron, receipt scan AI, public API)
5. **Po každom sprinte krátky report** so zoznamom `created/edited` súborov + ako otestovať

### Dôležité
- Všetky AI nástroje (stacking calc, receipt scan) cez **Lovable AI Gateway** — 3-5 kreditov/call podľa pravidiel projektu
- RLS na všetkých nových tabuľkách, žiadny anon write okrem upvotes (rate-limited)
- i18n keys pridám do všetkých 12 jazykov (defaultne EN, ostatné fallback)
- Žiadne free tiers — daily digest a stacking calc sú zadarmo (engagement), receipt cashback je platený feature
- Po každom sprinte pauza na tvoju kontrolu predtým než pokračujem

### Začneme Sprintom 1?
Po tvojom OK začnem migráciou pre 5 features Sprintu 1 a integráciou do `CouponHouse.tsx`.