# Plan: Zapojiť všetky nezapojené komponenty

Audit našiel ~150 nezapojených komponentov. Rozdelím prácu do **8 fáz** podľa domény, každá fáza = 1 round-trip s tebou (potvrdenie "pokračuj").

Pre každý komponent: nájdem cieľovú stránku, vložím import + render na vhodné miesto, overím build.

---

## Phase 23 — Marketplace / Bazaar
- `PriceAlertDialog` → ProductDetail page
- `SellerReviewsPanel` → ProductDetail (Tabs)
- `AuctionWithdrawalRequest` → MyAuctions / Profile

## Phase 24 — Live Streams & Creator Monetization
- `SuperChatDialog` + `SuperChatFeed` → LiveStream watch page
- `TipAnimation` → ComedyLiveShow
- `InfluencerWithdrawalDialog` → InfluencerEarnings

## Phase 25 — Credits, Billing & Affiliate
- `AICreditsBalanceWidget` → Navbar (alebo Profile dropdown)
- `AnalyzerCreditsDisplay` → AI tools header
- `PauseLimitCard` → Subscription page
- `AffiliateTierCard` → Affiliate dashboard

## Phase 26 — Fundraising
- `MatchDonationBadge` → Campaign card
- `CrisisImpactTicker` + `CrisisZoneOverview` + `ResolvedEmergencies` → CrisisRelief page

## Phase 27 — Jobs & Legal
- `JobsHeroSection` → Jobs hub top
- `JobApplicationDialog` → JobDetail
- `LegalAssistant` → Legal pages dock

## Phase 28 — Kids Channel
- `StoryLimitBanner` + `StorySubscriptionManagement` → KidsStories
- `ParentalDashboard` → Kids settings
- `CreateStory` → KidsStoryHub
- `CharacterCard` → character picker

## Phase 29 — Games, Dating, Events, Arena
- `TradingDialog` → CollectiblesHub
- `VideoProfile` → DatingProfile
- `SuggestedEvents` → EventsHub sidebar
- `Stadium3D` → Arena hub
- `MultiplayerLobby` → Games (kde sa hodí)
- `HorseMarketplace` → HorseRacing

## Phase 30 — UI utilities & cleanup
- `ThemeToggle` → Settings
- `Captcha` → Auth signup
- `VideoHero` → Home (ak vhodné)
- `PointsDisplay` → Navbar
- `LazyLoadSuspense` → audit usage
- Zmazať skutočne dead code (`AngryBirdsGame`, `BarbieGame` atď. ak nikde neexistuje route)

---

## Pravidlá pre každý komponent
1. Najprv pozriem `props` interface komponentu
2. Nájdem najlogickejšie miesto (cieľová stránka/sekcia)
3. Vložím import + render s minimálnym scope-om
4. Build check po každej fáze

## Notes
- Niektoré komponenty môžu byť **legacy / nahradené** — ak nájdem novšiu verziu, navrhnem ti delete namiesto wiring
- Hry (`AngryBirdsGame`, `Minecraft`, atď.) pravdepodobne sú namountované cez data registry (`pokigames.ts`/`y8games.ts`) — overím a buď zapojím alebo zmažem
- Po každej fáze ti napíšem zoznam zmenených súborov a počkám na "pokračuj"

Začínam **Phase 23 (Marketplace)** hneď po tvojom OK.
