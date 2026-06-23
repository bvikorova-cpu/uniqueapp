# QA — AI Personality Clone (P0)

**URL:** `/ai-clone` (komponenty v `src/components/ai-clone/*`) | **Kredity:** 5+ / akcia

## A. Prístup
1. `/ai-clone` → hero, "Create your clone" CTA, marketplace, leaderboard
2. Gate
3. Mobile

## B. CloneCreator — tvorba klonu
1. Klik "Create clone" → wizard
2. Step 1: meno klonu, avatar upload alebo AI generate
3. Step 2: personality quiz (10+ otázok) — výber MBTI, hobby, štýl reči
4. Step 3: upload training data — texts, chat exports, sociálne posty
5. Step 4: voice sample (audio upload 30s) pre voice cloning (ak je feature)
6. Step 5: review → Create → kredity stiahnuté, klon v "My Clones"
7. Editácia existujúceho klonu → re-train

## C. ClonePersonalityQuiz
1. Otázky postupne, progress bar
2. Skip → next
3. Back → prev
4. Submit → výsledok aplikovaný na klon

## D. CloneCreator multi-turn chat
1. Otvor klon → chat interface
2. Pošli správu "ahoj" → odpoveď v štýle klonu
3. Pošli 10 správ → context memory funguje (odpoveď zohľadní predošlé)
4. Reset conversation → nový chat
5. Long context (50 msg) → performance OK

## E. Marketplace
1. `/ai-clone/marketplace` (alebo tab) → public klony, filter, search
2. Otvor cudzí klon → preview, chat (možno za kredity)
3. Subscribe to clone → CloneSubscriptions, mesačný poplatok
4. Rating/review klonu

## F. CloneDating (ak existuje feature)
1. Klon ide na "AI date" s iným klonom (multi-user)
2. Conversation log → vidíš ako tvoj klon flirtoval
3. Match notifikácia ak chemistry score >80

## G. CloneAnalytics
1. Dashboard → views, chats, revenue (ak subscriptions)
2. Engagement graphs
3. Top conversations

## H. CloneLeaderboard
1. Top klony podľa engagement/revenue
2. Filter by category
3. Tvoj rank visible

## I. CloneSocialFeed
1. Klon postuje automaticky (AI generated posts)
2. Likes, comments
3. Edit/delete post

## J. Share link
1. Public clone URL → B otvorí v incognito → chat s klonom
2. Embed code

## K. Kredity & monetization
1. Create clone: 5+ kreditov
2. Chat: 1-2 kredity / message (alebo zdarma pre owner)
3. Subscription revenue 85/15 split (creator/platform) → overiť po platbe
4. Stripe Connect setup pre payouts

## L. Multi-user
1. A chat s B's clone → B dostane notifikáciu
2. A subscribe na B clone → B revenue +
3. Concurrent 5 users chat s rovnakým klonom → každý vlastná konverzácia, žiadny crossover

## M. Security
1. Training data RLS — A nevidí B's
2. Prompt injection v message → klon nereaguje na "ignore instructions"
3. Žiadne PII leak z training data v odpovediach

## N. i18n
1. Klon odpovedá v jazyku užívateľa
2. UI preložené
