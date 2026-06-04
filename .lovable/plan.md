# Megatalent: Oprava mock/stub komponentov

Cieľ: nahradiť mock dáta a localStorage skutočným backendom (Supabase tabuľky, RLS, real-time, edge functions) a opraviť polobroken funkcie. Žiadne fake hardcoded zoznamy.

## A. Critical (7)

### 1. MentorshipBooking
- Tabuľky: `mt_mentors` (profile, expertise, hourly_price, rating cached), `mt_mentorship_bookings` (mentor_id, student_id, status: pending/accepted/declined/completed, price, escrow_ref).
- UI: load mentorov z DB, „Apply as mentor" formulár. `book()` → insert booking + Stripe escrow hold (reuse `process-sale-transaction` pattern, 80/20 split).
- Mentor dostane notifikáciu (`notifications` insert) + realtime.

### 2. TalentMarketplace
- Tabuľky: `mt_marketplace_listings` (seller_id, title, price, eta_days, category, status), `mt_marketplace_orders` (listing_id, buyer_id, escrow_ref, status, delivery_at).
- UI: zoznam z DB + „Create listing" CTA. `buy()` → edge function `mt-marketplace-order` (escrow, 80/20).

### 3. Reactions (🔥😍🎉)
- Tabuľka `mt_submission_reactions` (submission_id, user_id, emoji) UNIQUE(submission_id,user_id,emoji).
- Hook s real-time subscription, agregované counts. Zrušiť localStorage.

### 4. Stories
- Tabuľka `mt_stories` (user_id, media_url, media_type, expires_at = now()+24h), bucket `mt-stories` (signed uploads).
- UI: real upload (image/video ≤30s), grid len neexpirovaných, viewer modal s progress barom. Zrušiť 6 fake postáv.

### 5. FriendInvites
- Zlúčiť s existujúcim `ReferralProgram` → odstrániť duplicitný komponent ALEBO ho refactor-nuť tak, aby čítal `referral_code` z `profiles` a `invited` count zo `referrals` tabuľky (server truth, nie localStorage).
- Milestone rewards spárovať s reálnymi `referral_rewards`.

### 6. DailyLoginBonus
- Použiť existujúci `useDailyLoginReward` hook + `user_login_streaks` tabuľku + RPC `claim_daily_login_reward` (už existujú).
- Prepísať `MegatalentDailyLoginBonus` aby používal tento hook namiesto localStorage.

### 7. SponsorShowcase
- Tabuľka `mt_sponsors` (name, logo_url, cta_url, tier, active, starts_at, ends_at).
- Admin-only insert (cez role check). UI: query active sponsors, žiadne `url:"#"`. Ak prázdne → „Become a sponsor" CTA.

## B. Polobroken (4)

### 8. DailyQuests
- Tabuľka `mt_daily_quests` (quest_key, label, xp, target_count) + `mt_user_quest_progress` (user_id, quest_key, date, progress, completed_at).
- Server-side increment cez existujúce eventy (vote, comment, watch_party_join…) → trigger/edge. Zrušiť manuálny checkbox; tlačidlo „Claim" len keď `progress >= target`.

### 9. FeedFilter (hot/new/top)
- Upraviť query v feed komponente: `new` → `created_at desc`, `top` → `votes desc`, `hot` → score `(votes / (age_hours+2)^1.5)` cez SQL view alebo client-side po načítaní.

### 10. SeasonPass rewards
- Tabuľka `mt_season_pass_rewards` (tier_level, reward_type, payload) + `mt_user_season_progress` (user_id, season_id, xp, claimed_tiers[]).
- Edge `mt-season-claim-tier` → vyplatí credit/boost/badge, zapíše do `claimed_tiers`.

### 11. VotingStreak/Achievements
- Tabuľky `mt_voting_streaks` (user_id, current, longest, last_vote_date), `mt_achievements` (key, label, criteria_json, reward), `mt_user_achievements` (user_id, achievement_key, unlocked_at, claimed).
- Trigger pri vote insert → update streak + check achievements. Claim cez RPC `mt_claim_achievement`.

## C. Bug fix
- `src/pages/Megatalent.tsx:89`: odstrániť bezpodmienečný `setTimeout(()=>setLoading(false), 4000)` → set loading false po skutočnom načítaní dát (alebo `Promise.all`).

## D. Technický postup (poradie migrácií / kódu)
1. Migration 1: tabuľky + RLS + GRANT pre #3 (reactions), #4 (stories+bucket), #7 (sponsors), #11 (streaks/achievements).
2. Migration 2: tabuľky + RLS pre #1 (mentorship), #2 (marketplace), #8 (quests), #10 (season pass).
3. Edge functions: `mt-mentorship-book`, `mt-marketplace-order`, `mt-season-claim-tier`, `mt-claim-achievement`, `mt-quest-increment`.
4. Frontend refactor 11 komponentov + bug fix Megatalent.tsx.
5. E2E smoke test pre reactions + stories + booking flow.

## E. Otvorené rozhodnutia
- Mentorship/Marketplace: použiť **credits** (interná mena) alebo **Stripe EUR escrow**? Plán predpokladá Stripe EUR (konzistencia s `brand-collaboration-escrow` 80/20 pravidlom).
- Stories retention: 24h hard delete cron, alebo len `expires_at` filter? Plán: filter + nočný cleanup cron.
- Sponsors admin UI: zatiaľ iba SQL insert (admin dashboard mimo scope), front-end len read.

Po schválení začnem migráciami v poradí D1 → D2 → edge functions → frontend.