// Extra section knowledge base for Uni — verified against the codebase.
// Prices are in AI credits unless EUR is stated. Keep in sync with the app.

import type { UniSectionDoc } from "./uniSections.ts";

export const UNI_SECTIONS_EXTRA: UniSectionDoc[] = [
  {
    id: "wall-detail",
    title: "Wall (social feed)",
    path: "/wall",
    keywords: ["wall", "feed", "stories", "shorts", "trending", "saved posts", "close friends", "notes"],
    doc: `WALL (/wall) — the social feed. Sign-in required.

FEED
- Loads through one server call (get_wall_feed), 10 posts per page, infinite scroll and pull-to-refresh.
- Feed sub-tabs: For You and Friends (accepted friendships only).
- Page tabs: Feed, AI Tools, Streaks, Ranks, Badges, Challenges.
- Post privacy levels: Everyone, Friends, Close Friends, Only me. Posts support hashtags, mentions and scheduling.

SUBPAGES
- /wall/trending — ranked by likes + comments×2 + shares×3 + reposts×2, ranges 24h / 7d / 30d / all; educational posts (#science, #education, #tutorial…) get a 1.2× boost.
- /wall/saved — bookmarked posts (50 per load).
- /wall/videos, /wall/memories, /wall/friends, /wall/info (feature guide).
- /wall/messages redirects to Messenger.

STORIES & SHORTS
- /stories/:userId — active stories only (expire automatically); images show 5s, videos 15s, views are recorded, owner sees the viewer list. Replies arrive as a direct message; polls and reactions supported.
- /shorts — vertical video feed with Following / For You.

FREE
- Posting, liking, commenting, stories and bookmarks cost no credits. Wall AI tools cost credits (2–5 typically).`,
  },
  {
    id: "messenger",
    title: "Messenger",
    path: "/messenger",
    keywords: ["messenger", "messages", "chat", "dm", "direct message", "sprava", "spravy", "group chat"],
    doc: `MESSENGER (/messenger) — direct and group chats. Sign-in required (/messages and /wall/messages redirect here).

FREE CORE
- 1:1 and group conversations, reactions (❤️👍😂😮😢🔥), typing indicators, online presence, read receipts, self-destructing messages, video calls, user search, gifts.
- Attachment limit: 20 MB per file.

PAID AI TOOLS (unified credit wallet)
- Chat Analytics — 3 credits
- AI Chat Themes — 4 credits
- Mood Detection — 3 credits
- Emoji Creator — 3 credits
- Chat Games — 4 credits
- Opening and using a chat itself is free.

Conversation list has Direct and Groups tabs; the live credit balance is shown in the hub.`,
  },
  {
    id: "profile-friends",
    title: "Profile, Friends & Notifications",
    path: "/profile",
    keywords: ["profile", "profil", "friends", "friend request", "notifications", "tip jar", "followers", "search"],
    doc: `PROFILE (/profile/:userId), FRIENDS (/friends), NOTIFICATIONS (/notifications), SEARCH (/search)

PROFILE
- Public browsing needs no account; interacting does. Shows posts, stats (posts, likes and comments given, friends, submissions, completed courses, XP, level), achievements, milestones, badges, verification card, referral earnings, club membership, QR code, vCard, profile music and 3D avatar.
- Tip Jar: members can tip a profile in EUR through Stripe. Platform fee 10%, the rest goes to the creator via Stripe Connect.
- Avatar ring shows the equipped cosmetic frame, otherwise the verification tier ring.

FRIENDS
- Tabs: Friends and Requests. Send / accept / decline requests, unfriend, search your friends or all people.

NOTIFICATIONS
- Realtime. Filters: all, unread, friend requests, brain-duel challenges, likes, comments, follows. Friend requests can be accepted inline; mark read/unread, delete, mark all read.

SEARCH
- Filters: All, People, Posts, Hashtags (hashtags ordered by usage). Optional "recent posts only" = last 7 days.`,
  },
  {
    id: "credits-detail",
    title: "AI Credits store & ledger",
    path: "/ai-credits",
    keywords: ["credit pack", "buy credits", "credit price", "kupit kredity", "ledger", "credit history", "ai credits store"],
    doc: `AI CREDITS (/ai-credits, also /ai-credits-store; /credits, /credits/buy, /pricing, /plans, /upgrade redirect here)

PACKS (one-time Stripe payment, EUR)
- Starter — 10 credits for €5 (€0.50 / credit)
- Basic — 25 credits for €10 (€0.40 / credit, 20% saving)
- Pro — 60 credits for €20 (€0.33 / credit, 34% saving)
- Ultimate — 150 credits for €40 (€0.27 / credit, 46% saving)

FREE CREDITS
- +10 credits automatically on the 1st of every month. The store shows free balance, paid balance and total separately.

LEDGER (/credits/history)
- Every change is logged with a reason: purchase, subscription grant, monthly grant, promo code, referral bonus, gift sent/received, founding-member bonus, refund, AI generation, lucky wheel cost/prize, mystery box, marketplace publish/contact unlock, and more. Filter by reason, direction and date, export to CSV.

RULES
- One single wallet for every AI feature on the platform. Failed generations are not charged. Battle Coins are bought one-way from credits (1 credit = 100 coins) and can never be converted back to credits or money.`,
  },
  {
    id: "rewards",
    title: "Rewards, XP & Lucky Wheel",
    path: "/rewards",
    keywords: ["rewards", "xp", "battle pass", "streak", "daily login", "lucky wheel", "lucky spin", "badges", "league", "odmeny"],
    doc: `REWARDS (/rewards) — XP and gamification hub.

TABS
- Overview, Leagues, Battle Pass, Calendar, Streak Freeze, Cosmetics, AI Tools, Tiers, Lucky Spin, Ranks, Missions, Badges, Hunters, Streak Coach, Gift XP.

MECHANICS
- Daily login calendar with milestone bonuses on days 7, 14, 21 and 30.
- Weekly challenges, weekly XP leaderboard with last-week winners, weekly leagues with promotion (Bronze, Silver, Gold, Diamond in the education league).
- Battle Pass with a free and a premium track; Streak Freeze can be claimed or bought; cosmetics shop; XP gifting; XP→credits converter.
- Daily reward button, daily XP video reward, streak heatmap, achievements and an XP audit log (/rewards/audit).

LUCKY WHEEL (/lucky-wheel)
- 5 credits per spin, once per day.
- Prizes are XP only: 0, 500, 1 000, 2 500, 10 000 or 25 000 XP. No cash, no credits.`,
  },
  {
    id: "referral",
    title: "Referral program",
    path: "/referral",
    keywords: ["referral", "invite", "affiliate", "odporucenie", "invite friends", "referral code"],
    doc: `REFERRALS (/referral)

- Reward: €5 for every invited friend who activates a paid Premium subscription. The bonus repeats on each paid invoice while the subscription runs.
- Minimum withdrawal: €10 of pending earnings.
- Share by native share, Facebook, WhatsApp, Telegram, e-mail or QR code.
- Extras: affiliate tier card, milestone bonuses at 5, 10 and 25 referrals, earnings calculator, withdrawal requests, public leaderboard (/referrals/leaderboard).
- Referrals are tagged as subscription or one-off; fraud checks run in the admin panel.`,
  },
  {
    id: "earnings-payouts",
    title: "Earnings & payouts",
    path: "/earnings",
    keywords: ["earnings", "payout", "withdraw", "vyplata", "stripe connect", "kyc", "commission", "fee"],
    doc: `EARNINGS (/earnings) — one dashboard for all creator and seller income.

- Aggregates sales, subscriptions, tips, paid messages, PPV unlocks and gifts.
- Minimum payout: €20 available balance. A payout method and enabled Stripe Connect payouts are required.
- Table shows date, type, buyer, total, commission and your profit; plus forecast, milestones, tax estimator and documents, instant payout, auto-withdraw, payout-fee calculator, refunds and disputes, withdrawal history.

PLATFORM FEES (platform share)
- Creator subscription 15%, service order 15%, marketplace (Skills) 15%, collectibles 15%, crystal 15%, home decor 15%
- Tip Jar 10%, Bazaar 10%, auction 10%, antiques 10%, coupons 10%, merch 10%, creator gifts 10%
- Brand collaboration 20%, Megatalent tips 20%
- Property 5%, campaign donations 5% by default
- Skill Swap 0%, job portal 0%

IDENTITY CHECK (/account/verification)
- Creator payouts above €100 require Stripe Identity KYC. Statuses: unverified, pending, verified, rejected, requires input. Only status, full name, country and date of birth are kept.`,
  },
  {
    id: "subscriptions-premium",
    title: "Subscriptions, Premium & Club",
    path: "/subscriptions",
    keywords: ["subscription", "subscriptions", "premium", "club", "vip", "verified", "predplatne", "billing portal"],
    doc: `SUBSCRIPTIONS (/subscriptions), PREMIUM (/premium)

PREMIUM — €9.99 / month, cancel anytime
- Unlocks 14 premium modules: Psychology AI, Creator Studio, Holographic Avatars, Lottery Tuning, Phobia Therapy, Skill Swap, Sports Insights, Time Capsule, Time Reversal, Tipster AI, Universal Analyzer, Astrology Pro, Coloring Studio, Wellness Coach.
- Priority AI processing; new modules are included automatically.

MANAGED IN /subscriptions
- Unique VIP Club membership (digital or physical tier) — join at /club, card at /club/card.
- Unique Verified badge tiers (verified, plus, pro) — /verified.
- All changes and cancellations open the Stripe billing portal.

Other paid subscriptions on the platform: Megatalent Premium €10 / TOP Premium €15 per month, Eco & Healthy Challenge PRO €3 / TOP €5 per month, Sports Predictor €9.99 / €19.99, brand sponsorship tiers.

SETTINGS (/settings) — tabs Account, Notifications, Privacy, Appearance (light/dark/auto), GDPR panel with data export and account deletion; password reset e-mail has a 15-minute cooldown.`,
  },
  {
    id: "kids-detail",
    title: "Kids Channel & Kids Academy (detailed)",
    path: "/kids-channel",
    keywords: ["kids channel", "kids academy", "homework", "science lab", "story creator", "drawing buddy", "reading companion", "fairy castles", "parental gate", "kids credits"],
    doc: `KIDS (/kids-academy, /kids-channel) — for ages 6–12. The main platform is 16+.

ACCESS
- No Kids subscription exists any more: everything is paid from the unified credit wallet. Sign-in plus at least 1 credit is required to open an AI kids module.
- Parental gate (a math question) protects parent-only areas such as the Magic Library, Fairy Castles and Character Chat. Verification lasts 30 minutes per device, 5 wrong answers lock it for 60 seconds, and each check is logged.
- All kids pricing pages redirect to the credit store.

CREDIT PRICES
- Homework Helper — 3 credits per question
- Science Lab — safety check 3, ask-a-scientist 3, experiment analysis 4
- Story Creator — 8 credits per story, +3 per illustrated page, +2 per page read aloud
- Drawing Buddy — 5 credits per AI-enhanced drawing
- Reading Companion — analysis 3, quiz 3, word definition 1
- Kids Academy hub — daily plan 3, recommendations 3, parent digest 3
- Character Chat — 1 credit per message

FEATURES
- Character Chat, Story Games, Bedtime Stories, Story Videos, Create Your Hero, Fairy Castles, Magic Library, Certificate Gallery, Parental Dashboard, Daily Stars, Weekly Themes, Adventure Map.
- Kids Academy also holds the collectible cartoon card game (16 themes) and Kids Puzzles.`,
  },
  {
    id: "teen-hub",
    title: "Teen Hub",
    path: "/teen-hub",
    keywords: ["teen", "teen hub", "homework pro", "essay coach", "mental wellness", "study planner", "skill builder", "social coach", "career counselor"],
    doc: `TEEN HUB (/teen-hub) — for ages 13–17, parent-approved.

- A parental gate (math question) must be passed once per device before any module opens.
- Credits come from the same wallet; the hub offers a 20-credit pack for €10.

MODULE COSTS
- Homework Pro — 4 credits
- Essay Coach — 5 credits
- Mental Wellness — 3 credits
- Study Planner — 3 credits
- Skill Builder — 4 credits
- Social Coach — 3 credits
- Career Counselor — guidance 5, day-in-a-life 3, skill gap 3, mentor 2

- Results are saved to the Teen Hub history and career reports export to PDF.
- Safety note: Mental Wellness is not a substitute for medical or psychological care.`,
  },
  {
    id: "education-detail",
    title: "Education (detailed)",
    path: "/education",
    keywords: ["education hub", "daily challenge", "flashcards", "math solver", "ai tutor", "notes", "certificates", "skill tree", "league", "lessons", "quiz"],
    doc: `EDUCATION (/education) — learning hub.

HUB TABS
- Tutoring (AI tutor chat), Photo Math, PDF Quiz, Quizzes (50+ categories) plus a leaderboard sidebar.

CREDIT PRICES
- AI tutor reply — 2 credits per message
- Math solver / photo math — 3 credits per solve
- AI flashcard deck generation — 3 credits
- AI notes generation — 2 credits

FREE / XP-ONLY
- /education/daily — Daily Challenge: 5 questions a day, 50 XP, sign-in required so progress, streaks and non-repeating questions are tracked.
- /education/lessons — 16 lessons, 15 XP + 10 XP each.
- /education/league — weekly XP league with Bronze, Silver, Gold and Diamond tiers, reset on Sundays.
- /education/skill-tree, /education/achievements, /education/notes, /education/certificates (claim after passing 70%+, verifiable by code), /education/flashcards, /education/hub.

- /courses and /language-learning open the Tutorial Platform browse view; /proclasses is an alias of /masterclasses; /education/teach opens the teacher dashboard; /education/my-courses opens My Learning.`,
  },
  {
    id: "bazaar-detail",
    title: "Bazaar (classifieds)",
    path: "/bazaar",
    keywords: ["bazaar", "bazar", "classified", "inzerat", "listing", "unlock contact", "saved search", "top listing"],
    doc: `BAZAAR (/bazaar) — peer-to-peer classifieds. Browsing is free and the sale itself carries no commission.

COSTS
- Publish a listing — 2 credits
- Unlock a seller's contact and chat — 2 credits, once per listing and buyer, max 20 unlocks per day; free for the owner or if already unlocked
- Promotion: TOP 15 credits / 7 days, 25 / 14 days, 45 / 30 days; PREMIUM 100 credits / 30 days

SAFETY
- E-mails, phone numbers and links are automatically scrubbed from titles and descriptions.
- Chat is only possible for the owner or a buyer who unlocked the listing.

PAGES: /bazaar/create, /bazaar/my, /bazaar/messages, /bazaar/saved-searches (alerts on new matches).
Buyer and seller settle the deal directly; the platform fee applies only to paid platform services.`,
  },
  {
    id: "auction-detail",
    title: "Online Auction",
    path: "/auction",
    keywords: ["auction", "aukcia", "bidding", "bid", "buyout", "antique", "starozitnosti"],
    doc: `AUCTION (/auction) — timed bidding.

COSTS
- Publish an auction — 2 credits. Durations: 6, 12, 24, 48, 72 or 168 hours; an optional buyout price can be set.
- Unlock contact / chat — 2 credits, max 20 per day.
- Promotion: TOP 15 / 25 / 45 credits for 7 / 14 / 30 days; PREMIUM 100 credits / 30 days.

- Contact details are scrubbed from titles and descriptions automatically.
- Pages: /auction/create, /auction/my, /auction/messages (Bidding and Selling threads).
- Platform share on auction sales: 10%; antiques also 10%. Related: /antique-appraisal (AI antique identification, 5 credits) and /memory-auctions.`,
  },
  {
    id: "skills-marketplace",
    title: "Skills Marketplace",
    path: "/marketplace",
    keywords: ["skills", "skill marketplace", "microservice", "sluzby", "freelance", "service order", "escrow", "bid"],
    doc: `SKILLS MARKETPLACE (/marketplace; /skills and /skills-marketplace redirect here) — peer-to-peer microservices.

COSTS
- Unlock a provider's contact — 2 credits, max 20 per day
- Bid on a skill request — 1 credit per bid, max 30 bids per day; publishing a request is limited to 10 per day
- Promotion: TOP 15 / 25 / 45 credits for 7 / 14 / 30 days; PREMIUM 100 credits / 30 days

PAID ORDERS
- Paid orders run through Stripe Checkout in EUR with a 15% platform commission; the seller payout is the rest.
- Order states: pending → accepted → in progress → delivered → completed, plus cancelled and disputed.
- Pages: /skills-marketplace/new, /mine, /orders, provider profiles and listing edit.

Skill Swap (barter) has a 0% platform fee.`,
  },
  {
    id: "jobs-promotions",
    title: "Jobs, Promotions & Property",
    path: "/jobs",
    keywords: ["jobs", "praca", "employer", "cv", "job description", "promotions", "property", "nehnutelnosti", "real estate", "coupon"],
    doc: `JOBS (/jobs), PROMOTIONS (/promotions), PROPERTY (/property-marketplace), COUPONS (/coupon-marketplace)

JOBS
- Job listings, company pages, job boosts, AI job-description writer (/jobs/ai-jd-writer, credits), employer dashboard (/employer-dashboard).
- Platform commission on the job portal is 0% — employers pay per listing package instead.

PROMOTIONS
- /promotions board, /promotions/new to create and /promotions/mine to manage. Promotions are paid products via Stripe.

PROPERTY
- /property-marketplace listings, /property-submission to publish, /property-favorites for saved items. Platform share on property deals: 5%. Contact details in messages are scrubbed like in the other marketplaces.

COUPONS
- /coupon-marketplace with create, my coupons and messages; platform share 10%; AI helpers, price alerts and a digest run in the background.`,
  },
  {
    id: "creators-detail",
    title: "Creators, gifts & live",
    path: "/creators",
    keywords: ["creator subscription", "unlock videos", "gifts", "gift inbox", "live concert", "livestream", "super chat", "paid message", "tip"],
    doc: `CREATOR MONETISATION

- Creator subscriptions: 85% creator / 15% platform (Stripe application fee).
- Virtual creator gifts: 90% creator / 10% platform.
- Tip Jar on profiles: 10% platform fee.
- Paid direct messages: 15% platform fee.
- Concert and comedy gifts: 20% platform commission.
- Megatalent tips: 20% platform fee, tip range €1–€500.
- Brand collaborations: escrow with an 80/20 split, released on approval.

PAGES
- /creators (landing), /become-creator, /creator-dashboard, /creator-analytics, /creator-payouts.
- /unlock-videos — creator videos lock partway through; unlocking costs 1 credit and is split with the creator.
- /gifts/inbox — received and sent gifts and gift earnings; /credit-gifts to send credits to another member.
- /live-concerts and /livestream — live shows with tickets in EUR, gifts and Super Chats.`,
  },
  {
    id: "dice-duel-detail",
    title: "Dice Trail Duel (rules)",
    path: "/dice-duel",
    keywords: ["dice trail duel", "dice grid", "battle coin", "coin wallet", "forfeit"],
    doc: `DICE TRAIL DUEL (/dice-duel) — realtime 1v1 race on a 9×14 dot grid. Sign-in required.

- Entry: 100 Battle Coins per player (1 AI credit = 100 coins). Winner: 160 coins (80% of the pot) + 10 XP.
- Battle Coins are game-only currency and can never be turned back into credits or money.
- The server rolls the die (1–6); each value maps to a direction, and a move that would leave the grid skips the turn. First player to the bottom row wins.
- Cancelling while waiting refunds the stake; forfeiting pays the pot to the opponent.
- Global leaderboard: 1 win = 1 point, a loss = 0 points, with name, avatar and win/loss record.`,
  },
  {
    id: "brain-duel",
    title: "Brain Duel & Brain Lab",
    path: "/brain-duel",
    keywords: ["brain duel", "brain lab", "quiz duel", "power up", "question generator", "cheat detection"],
    doc: `BRAIN DUEL (/brain-duel) — realtime knowledge duels across 10 categories. Sign-in required.

- In-game power-ups: 50:50 = 5, Hint = 3, Extra Time = 2, Skip = 10.
- Brain Duel Hub (/brain-duel/hub) — 7 AI features: AI Question Generator 5 credits, Scan→Quiz (OCR) 5, Quiz Battle 3, AI Cheat Detection 2, Share Result Card 2, Publish Custom Deck 4.
- Duel challenges arrive as notifications and can be accepted from the notification list.`,
  },
  {
    id: "spin-solve",
    title: "Spin & Solve (Wheel of Fortune)",
    path: "/spin-solve",
    keywords: ["spin solve", "wheel of fortune", "tajnicka", "koleso", "spin coins", "vowel"],
    doc: `SPIN & SOLVE (/spin-solve; /wheel-of-fortune redirects here) — wheel of fortune with word puzzles. Sign-in required.

- Modes: Normal 1 credit (1× payout), Hard 3 credits (3×), Expert 5 credits (5×).
- Buying a vowel costs 250 Spin Coins or 1 AI credit. A second chance (revive) costs 3 credits.
- Winnings are paid in Spin Coins, an in-game currency that is not convertible to money.
- Wallet tracks Spin Coins, total won and games won.`,
  },
  {
    id: "battle-modules",
    title: "Reel Battles, KitchenStars & battle coins",
    path: "/clip-battles",
    keywords: ["reel battles", "clip battles", "kitchenstars", "masterchef", "cooking battle", "duel upload", "battle pot"],
    doc: `VIDEO & COOKING BATTLES

- /clip-battles (Reel Battles; /reel-battles redirects here) and /masterchef (KitchenStars Battles).
- Entry: 100 Battle Coins per player = 1 AI credit. Winner takes 80% of the pot plus 10 XP.
- Voting is free for registered members, one vote per duel.
- Video uploads: up to 50 MB, MP4 / WEBM / MOV.
- XP conversion: 1 000 XP → 1 AI credit.
- Monthly champions in KitchenStars, Reel Battles and Megatalent get fixed rewards (5 000 / 2 500 / 1 000 credits plus badges) — no percentage cash prizes.
- Battle Coins are per module (kitchenstars, reel_battles, megatalent, dice_duel), one-way from credits and never convertible back.`,
  },
  {
    id: "eco-healthy-challenge",
    title: "Eco & Healthy Challenge",
    path: "/eco-challenge",
    keywords: ["eco", "eco challenge", "healthy", "healthy challenge", "charity", "prize pool", "boost", "vyzva"],
    doc: `ECO CHALLENGE (/eco-challenge) and HEALTHY CHALLENGE (/healthy-challenge) — monthly photo/video contests with identical rules.

- Participation requires a paid plan: PRO €3 / month or TOP €5 / month. There is no free entry.
- XP: +50 XP per accepted submission, one submission counted per day.
- Monthly prize pool split: 50% cash to the champion, 20% cash to a charity the champion chooses (animal shelter, children's home, oncology centre or centre for people with disabilities), 30% platform.
- Optional boost: 5 credits pins your submission to the top of the feed for 24 hours; it does not add votes.
- History pages: /eco-challenge/history and /healthy-challenge/history.`,
  },
  {
    id: "wellness-health",
    title: "Wellness & health tools",
    path: "/wellness",
    keywords: ["wellness", "mindfulness", "breathing", "meditation", "gratitude", "mood", "health", "healthcare", "psychologist"],
    doc: `WELLNESS (/wellness) — /health and /healthcare both open this hub.

- Tools: AI Mindfulness Coach, Gratitude Journal, mood tracking, breathing exercises, 5-4-3-2-1 grounding, body-scan meditation, nature sounds, daily wellness challenges and streaks.
- Some tools are free; AI tools are unlocked per tool with credits (typically 2–5).
- /online-psychologist — AI psychologist chat, 1 credit per message. It is support, not therapy or diagnosis.
- /ai-health — AI Health & Medical Assistant: symptom chat 1 credit, lab/document interpretation 2, medical image or ECG 3; results include a severity badge, plain-language explanations, doctor questions, PDF export and private history. Educational only.`,
  },
  {
    id: "nutrition-fitness",
    title: "Nutrition Hub & fitness",
    path: "/nutrition-hub",
    keywords: ["nutrition", "meal planner", "macro", "food scanner", "workout", "hydration", "supplement", "fit slim", "diet"],
    doc: `NUTRITION HUB (/nutrition-hub) — credit prices per tool:

- AI Meal Planner 50, Smart Food Scanner 10, Restaurant Intelligence 25, AI Workout Planner 30
- Body Composition Predictor 10, AI Supplement Advisor 8, Grocery Budget Optimizer 6, Weekly Progress Dashboard 6, AI Allergy Scanner 5, AI Hydration Coach 3
- AI Nutrition Coach 2 credits per message; Macro Tracker is free.

Related: /fit-slim (fitness and slimming plans), /food-scanner, /meal-planner.
No medical claims are made — these are lifestyle tools.`,
  },
  {
    id: "cooking",
    title: "Cooking hub",
    path: "/cooking",
    keywords: ["cooking", "recipe", "recept", "chef chat", "wine pairing", "culinary", "kitchen"],
    doc: `COOKING (/cooking) — AI kitchen hub.

- /recipe-generator — recipes from ingredients, dietary needs and time available.
- /chef-chat — AI chef conversation (2–5 credits per action).
- /wine-pairing — wine suggestions, 1 credit.
- /meal-planner and /food-scanner share the nutrition tools.
- /culinary-arts and /masterchef cover the competitive and academy side; KitchenStars battles use Battle Coins.
- Credit balance and prices are shown in the hub before each AI action.`,
  },
  {
    id: "dating",
    title: "Dating, Anonymous Dating & Coffee",
    path: "/dating",
    keywords: ["dating", "randenie", "anonymous dating", "swipe", "match", "coffee", "buddy", "reveal"],
    doc: `DATING (/dating) — strictly 16+.

- Profiles, matches, swiping, chats and gifts. Sending a gift spends credits and the amount is shown before confirming.
- /anonymous-date (/anonymous-dating redirects here) — anonymous swiping deck with an age gate and a photo reveal lock: photos unlock after 7 days of contact or for 5 credits.
- Paid dating actions have a 24-hour refund window; direct messages can be muted.
- /coffee — Coffee community with buddy matching, check-ins and a leaderboard; repeated no-shows lead to strikes.`,
  },
  {
    id: "ai-tools-overview",
    title: "AI tools overview & prices",
    path: "/ai-generation",
    keywords: ["ai tool", "ai tools", "ai generation", "image generation", "credit cost", "cena kreditov", "how much", "cost"],
    doc: `AI TOOLS — every tool spends the same credit wallet. Main prices:

IMAGE & PHOTO
- AI Generation (/ai-generation): image 5 credits, image editor 3 (3–10 depending on quality)
- Photo Restoration (/photo-restoration): damage detection 4, background removal 3, colorization 12, photo repair 12, colorization pro 16
- Future Face (/future-face): age progression 5, skin health 5, lifestyle impact 4, celebrity match 4; image transforms 5–8 (baby predict 8, botox simulator 7)
- Beauty Studio (/beauty-studio): makeup 3, hair styler 3, nail art 5, celebrity match 4
- Fashion Studio (/fashion-studio): dressing generator 5, small tools 2–8, advanced 10–15
- Home Designer (/home-designer): 30 credits per room render
- Face Insight (/face-insight): basic 5, deep 15, compare 12; Guess Age (/guess-age) 1 per guess
- AI Tattoo (/ai-tattoo): design 8, style mix 8, cover-up 10, colour palette 6, aging simulation 5, meaning 5, care guide 5, pain info 4

TEXT & BUSINESS
- Creative Forge (/creative-forge): poetry 5, ad copy 6, lyrics 8, stand-up 8, novel chapter 10, podcast script 10, theatre play 12, screenplay 15, revision 3
- Content Studio (/content-studio): social post 1, cover letter 1, video script 2, CV 2, business document 2, blog article 3, brand voice 3, plagiarism check 3, A/B test 5, bulk generate 5
- Brand Kits (/brand-kits): typography 3, taglines 3, palette 4, brand voice 5, logo concepts 8, full brand PDF 10
- Universal Analyzer (/analyzer): 3–5 per analysis (antique identification 5, most vision tasks 4)
- Video Ad Generator (/video-ad-generator): script 1 plus optional add-ons of 2–3 each
- Flyer Studio (/flyer-studio): 3 credits per flyer, 170+ styles, any language, professional translation
- Fairytale Book (/fairytale-book): standard 10 + 3 per page, premium cinematic 25 + 8 per page
- Handwriting analysis (/handwriting): personal 5, professional 10, relationship 15, business 20
- Pet Translator (/pet-translator): 4–5 per analysis
- Coloring Pages (/coloring-pages): colour-by-number 5, recolor 4, palette 3, example 3
- IQ Platform (/iq-platform): test start 3, AI reports and coaching 4–6
- AI Mentor (/ai-mentor): action plan 5, voice coaching 4, mood insight 3
- Lie Detector (/lie-detector): tiers from 3 up to 50 depending on depth`,
  },
  {
    id: "mystical",
    title: "Astrology, numerology & mystical tools",
    path: "/astrology",
    keywords: ["astrology", "horoscope", "tarot", "numerology", "past life", "dream", "lottery", "palmistry", "oracle", "horoskop"],
    doc: `MYSTICAL & ENTERTAINMENT TOOLS (entertainment only, no predictions of real events)

ASTROLOGY (/astrology)
- Daily horoscope 1, weekly 3, monthly 8, yearly 25
- Tarot 3 cards 3, 5 cards 5, 10 cards 10, premium spread 15
- Dream reading 5, numerology 3, palmistry 10, compatibility 7, yes/no oracle 2, rune 1, birth chart 20, daily ritual 3, transit 3
- Astrology chat 1 credit per message

OTHERS
- /numerology: life path 3, love compatibility 5, career number 4, personal year 4, name energy 3, lucky numbers 3
- /past-life: basic reading 5, full 15, soulmate 20
- /dream-journal: dream logging with AI interpretation, from 1 credit
- /lottery-ai: number generation 2–3 credits, dream decoder 5, numerology 3, heatmap lab 4 — entertainment only, no guarantee of winning`,
  },
  {
    id: "collect-games",
    title: "Cards, Mystery Box, Character Arena & pets",
    path: "/card-collections",
    keywords: ["card collections", "mystery box", "character arena", "virtual pet", "pets", "collectible", "cards", "dungeon"],
    doc: `COLLECTIBLE & CASUAL GAMES

- Card Collections (/card-collections): 1 credit per card draw; recycling 10 unwanted cards returns 1 credit and destroys those cards permanently.
- Mystery Box (/mystery-box): 9 box tiers from 50 credits (Basic) to 2 500 credits (Universe); lucky wheel 15 credits; AI rarity predictor 8–10; trading, gifting and the collection view are free.
- Character Arena (/character-arena): forge a character 5–15, 1v1 battle 2, equipment shop 5–35, training centre 10, dungeon raids 5–25, fusion lab 30, hero card collection 5; inventory, evolution tree and Hall of Legends free.
- Virtual Pet (/virtual-pet, /pets): adopt a cat or dog from 20 credits; care actions and AI features 2–5 credits; pets lose condition over time if neglected.
- Virtual Escape Room (/virtual-escape-room): 8 credits per room, no subscription.
- Games hub (/games, /games-hub): casual arcade, puzzle, racing and sports games.`,
  },
  {
    id: "brand-arena-detail",
    title: "Brand Arena & sponsorship",
    path: "/brand-arena",
    keywords: ["brand arena", "brand battle", "sponsor", "sponsorship tier", "sponsor dashboard", "bronze", "platinum"],
    doc: `BRAND ARENA (/brand-arena) — brand competitions and sponsorship. These dashboards are for brands and admins.

SPONSORSHIP TIERS (per month)
- Bronze €200, Silver €500, Gold €1 500, Platinum €3 000, Enterprise €10 000
- Higher tiers add branding placement, badges, leaderboard visibility and API access.

- Brand Battle voting and AI tools run on credits; extra votes are bought through the platform.
- Brand collaborations with creators use Stripe escrow, split 80% creator / 20% platform, released after approval.
- Moderation, appeals and campaign administration are handled in the admin area with notifications to the brand.`,
  },
  {
    id: "special-modules",
    title: "Time Capsule, Time Reversal, Crystal, Megaforum & more",
    path: "/time-capsule",
    keywords: ["time capsule", "time reversal", "crystal energy", "megaforum", "vacationer", "secret santa", "sports predictor", "investment", "shadow arena", "comedy club"],
    doc: `OTHER MODULES

- Time Capsule (/time-capsule): create a capsule from 12 credits, delivered to a future date.
- Time Reversal (/time-reversal): rewritten timeline posts and AI battles for XP; dashboard and timeline subpages.
- Crystal Energy (/crystal-energy): crystal network and marketplace, platform share 15%; credits-only, no separate subscription.
- Megaforum (/megaforum): discussion forum with categories; AI helpers cost credits.
- Vacationer (/vacationer): travel planning with a budget calculator; AI actions 2–5 credits.
- Secret Santa (/secret-santa): gift-exchange groups; AI helpers 2–5 credits.
- Sports Predictor (/sports-predictor): subscription €9.99 or €19.99; tipsters keep 75% of every tip they sell, tips priced €1–€50.
- Comedy Club (/comedy-club): stand-up shows with tickets in EUR; gifts carry a 20% platform commission.
- Shadow Arena (/shadow-arena): story submissions, dashboard and voting.
- Community (/community) opens the Wall; /investment opens the financial investment module.`,
  },
];
