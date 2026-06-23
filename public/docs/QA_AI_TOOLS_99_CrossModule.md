# QA — Cross-Module Interakcie & Multi-User (P0)

**Po dokončení per-modul testov.** Test integrácie a race conditions.

## A. Export → Import medzi modulmi
1. **CreativeForge logo → Brand Builder:** vytvor logo v CF, otvor BB → import logo → ostatné komponenty (farby) extrahované z loga
2. **Brand Builder → CreativeForge:** brand farby/fonty → CF používa ako default presets
3. **Brand Builder → Content Studio:** brand voice + farby → posty v štýle
4. **Brand Builder → Video Ad Generator:** brand template → video ad s logom + farbami
5. **Stock Library → Video Ad Generator:** vyber stock video → import do timeline
6. **Stock Library → Content Studio:** stock image → post media
7. **AI Generation → CreativeForge:** vygenerovaný obrázok → import ako podklad pre banner
8. **AI Generation → Virtual Influencer:** generovaná tvár → avatar persony
9. **Future Face → Personality Clone:** future avatar → klon avatar
10. **Photo Restoration → Stock Library:** reštaurovaná foto → submit ako stock
11. **Universal Analyzer → Content Studio:** analyza PDF → posty extracted insights
12. **Personality Clone → Content Studio:** klon píše posty namiesto teba
13. **Virtual Influencer → Content Studio:** influencer schedule → manage v CS
14. **Beauty Studio look → Fashion Studio:** outfit + makeup kombinácia v jednom view
15. **Home Designer render → Stock Library:** submit interior ako stock

## B. Shared resources
1. Kreditový balance — všetky moduly čerpajú z 1 pool → spend v CF → balance update v Brand Builder real-time (alebo na reload)
2. My Library agreguje výtvory zo všetkých modulov
3. Notifications jednotné cez všetky moduly

## C. Multi-user race conditions
1. **Concurrent credit deduction:** A má 10 kreditov. Otvor CF v 2 taboch, klikni Generate (5 kreditov) súčasne → očakávané: 1 success + 1 fail (insufficient), nie dvakrát po 5
2. **Insufficient credits race:** Účet C (5 kreditov), otvor 3 nástroje, spusti 3 generácie naraz → max 1 success
3. **Stripe buy credits race:** 2 nákupy v 2 taboch → obidva separátne, kredity sčítané, žiadny dvojitý charge
4. **Same persona concurrent edit (Virtual Influencer):** A v 2 zariadeniach edituje rovnakú personu → last-write-wins alebo conflict warning
5. **Brand Builder team:** A + B edit rovnaký brand naraz → realtime sync alebo lock

## D. Real-time notifikácie
1. A chat s B's Personality Clone → B real-time notifikácia (sledovať websocket)
2. Brand deal ponuka A → B → real-time
3. Virtual Influencer follow → owner notification
4. Stock Library: niekto downloads tvoju stock → notification
5. Comment na public výtvor → author notification

## E. Spam / abuse protection
1. 20 generácií za minútu z 1 účtu → rate limit 429 po N
2. 100 messages do iného klonu → rate limit
3. 50 stock downloads / hod → throttle
4. Report content → admin queue → ban funguje

## F. Permissions / role
1. Premium user vs free → free má limity, premium nie
2. Admin override → vidí všetko
3. Banned user → redirect /banned

## G. Performance pod záťažou
1. 10 generácií v queue → UI responsive
2. Long render queue (Video Ad) → background, browse iné moduly
3. WebSocket reconnect po offline → notifikácie nezmeškané

## H. Cross-device
1. A na desktop vytvorí draft → A na mobile vidí draft
2. Logout/login persistencia
3. Session sync (real-time updates v 2 zariadeniach)

## I. Stripe webhook integrita
1. Buy credits → webhook delay → kredity pridané do 30s
2. Failed webhook → retry → eventually consistent
3. Refund → kredity stiahnuté (ak applicable)

## J. RLS comprehensive
1. Pre každý modul: A query B's data → 403
2. Direct API call s manipulated user_id → 403
3. Storage URLs s/bez signature → unauthorized blocked

## K. Audit log
1. Admin panel → vidí kto/čo generoval, kedy, koľko kreditov
2. Export audit CSV

## L. Edge browser/network
1. Slow 3G → loading states, no timeouts <30s
2. Offline mid-generation → error handling, kredity refund
3. Safari, Firefox, Chrome, Edge → všetky moduly fungujú
4. iOS Safari mic/camera permissions
5. Android Chrome PWA install → moduly fungujú v PWA
