// Detailed knowledge base about Unique's sections, used by Uni to answer
// in-depth questions ("what is Megatalent?", "how much does it cost?").
// Keep facts in sync with the real implementation.

export interface UniSectionDoc {
  id: string;
  title: string;
  path: string;
  keywords: string[];
  doc: string;
}

export const UNI_SECTIONS: UniSectionDoc[] = [
  {
    id: "megatalent",
    title: "Megatalent",
    path: "/megatalent",
    keywords: ["megatalent", "mega talent", "talent", "talentova sutaz", "talent contest", "quarterly contest", "prize pool"],
    doc: `MEGATALENT (/megatalent) — the platform's flagship quarterly talent competition.

ENTRY / PRICING
- Browsing, watching and discovering talents is open to any registered member.
- PUBLISHING a submission requires a monthly subscription: Premium €10/month or TOP Premium €15/month.
- TOP Premium adds stronger visibility, a TOP badge and priority placement in feeds and leaderboards.
- Referral: if a member enters a friend's referral code, the inviter receives a flat €5 bonus per paid invoice.

PRIZE POOL & REVENUE SPLIT
- The contest runs in quarterly periods (e.g. Q3: 1 Jul – 30 Sep, Q4: 1 Oct – 31 Dec).
- After paying the €5 referral, a defined share of the platform's remainder is added LIVE to the current quarter's prize pool; the rest stays with the platform.
- There is no guaranteed minimum: the pool starts at €0 and grows with every paid subscription, and the live amount is displayed in the Megatalent hero and stats sidebar.
- Tips and gifts sent to a talent are split 80% creator / 20% platform, paid out through Stripe Connect.
- Cash prizes follow the platform charity rule: part of prize money is directed to a shelter or children's home.

CATEGORIES (35+, grouped)
- Art & Creativity: drawing, painting, digital art, sculpture/modeling, photography, handmade crafts, makeup art, best tattoo.
- Music: singing, musical instrument, music production/DJ, beatbox, rap/freestyle.
- Dance & Movement: dance, breakdance, gymnastics/acrobatics, parkour/freerunning.
- Sports & Fitness: best training, yoga/pilates, martial arts, extreme sports, sport tricks.
- Entertainment: funniest video, stand-up/comedy, impressions/parodies, magic/illusions, pranks/hidden camera.
- Education: best life advice, tutorial/how-to, cooking/baking, DIY projects, science/experiments.
- Other: best selfie, transformation (before/after), pet talent, other talents.

HOW TO USE IT (step by step)
1. Open /megatalent and browse the hero, category grid and latest feed.
2. Pick a category and watch existing submissions and the leaderboard.
3. To compete, subscribe (Premium or TOP Premium) in the upload dialog, optionally entering a referral code.
4. Upload your photo or video, choose the category, add a title and description.
5. Collect votes, comments and endorsements; voting boosts your leaderboard rank.
6. Extras: Watch Party, live chat, daily challenges, daily login bonus, daily quests, achievements, certificates, Battle Royale brackets, judge panel and mentorship booking.
7. Battle Coins power the competitive game layer (1 AI credit = 100 coins); coins are cosmetic-only and have no cash value.
8. At the end of the quarter the top talents win from the accumulated prize pool plus visibility rewards.

TIPS
- Submitting in 3 different categories unlocks the "Versatile Talent" achievement.
- Boosts and highlight reels increase reach during voting peaks.`,
  },
  {
    id: "credits",
    title: "AI Credits & Wallet",
    path: "/account/credits",
    keywords: ["credit", "credits", "kredit", "kredity", "wallet", "top up", "balance", "peňaženka"],
    doc: `AI CREDITS (/account/credits) — one unified wallet for every AI feature on Unique.

- All AI tools spend from the same balance (\`ai_credits\`); every change is logged in a ledger.
- Typical prices: Uni assistant 2 credits per reply, most AI tools 3–5 credits, AI Health 1/2/3 credits per action, Flyer Studio 3 credits per flyer.
- Ways to get credits: purchase packs (Stripe, EUR), +10 free credits automatically on the 1st of each month, promo codes, referrals, credit gifts, auto-recharge, and the founding-member bonus.
- Battle Coins for games are bought one-way from credits: 1 AI credit = 100 coins, per module wallet, cosmetic use only.
- If a tool reports insufficient credits, top up in the wallet and retry — nothing is charged for failed generations.`,
  },
  {
    id: "dice-duel",
    title: "Dice Trail Duel",
    path: "/dice-duel",
    keywords: ["dice", "dice duel", "dice trail", "duel", "kocka", "battle coins"],
    doc: `DICE TRAIL DUEL (/dice-duel) — realtime 1v1 dice game on a 9×14 dot grid.

- Entry: 100 Battle Coins per player from the \`dice_duel\` wallet (1 AI credit = 100 coins). No AI credits are ever paid out.
- Winner: 160 coins (80% of the pot) + 10 XP; 20% funds the module's monthly pool.
- Rules: the server rolls the die (1–6) and each value maps to a direction; a move outside the grid skips the turn. The first player to reach the bottom row wins.
- Leaderboard: global, 1 win = 1 point, a loss = 0 points; shows name, avatar and W/L.
- Matchmaking is realtime; cancelling a waiting match refunds the entry, and forfeiting pays the pot to the opponent.`,
  },
  {
    id: "ai-health",
    title: "AI Health & Medical Assistant",
    path: "/ai-health",
    keywords: ["ai health", "health assistant", "medical", "symptom", "lab results", "blood", "ecg", "x-ray", "zdravie"],
    doc: `AI HEALTH & MEDICAL ASSISTANT (/ai-health) — educational health analysis, never a diagnosis.

- Symptom Checker chat: 1 credit per analysis.
- Document & Lab Scanner (blood work, PDFs, reports): 2 credits.
- Medical Image & ECG Scanner (ECG strips, X-ray, skin): 3 credits.
- Each result shows a summary, key findings, a severity badge (Low / Medium / High), plain-language explanations of medical terms and suggested questions for a doctor.
- Results can be exported to PDF and are stored in your private scan history.
- Mandatory disclaimer: outputs are educational and preventive only and do not replace professional medical diagnosis.`,
  },
  {
    id: "flyer-studio",
    title: "Promotional Flyer Studio",
    path: "/flyer-studio",
    keywords: ["flyer", "leaflet", "poster", "letak", "flyer studio", "promotional"],
    doc: `PROMOTIONAL FLYER STUDIO (/flyer-studio) — AI-generated advertising flyers.

- Price: 3 credits per generated flyer.
- The interface is always in English, but the flyer itself can be generated in any supported language, professionally translated and proofread before rendering.
- A detailed questionnaire covers business name, offer, headline, call to action, contact details, tone, colours and audience.
- 170+ preset design styles across categories, plus formats 3:4, 9:16, 1:1 and 4:3.
- Up to 3 reference images can be uploaded to guide the look.
- Names, prices, phone numbers, URLs, dates and legal text are protected and never altered by the translation step.
- Every flyer is saved to your history and can be downloaded as PNG.`,
  },
  {
    id: "creators",
    title: "Creators, subscriptions & PPV",
    path: "/creators",
    keywords: ["creator", "creators", "subscription", "ppv", "pay per view", "tips", "gifts", "super chat", "earnings"],
    doc: `CREATORS (/creators) — paid subscriptions, pay-per-view posts, gifts and tips.

- Creator subscriptions and PPV unlocks are split 85% creator / 15% platform.
- PPV pricing is set by the creator in EUR, minimum €1 with €0.50 steps; after Stripe Checkout the unlock and payment are recorded permanently.
- The same 85/15 split applies to gifts, Super Chats and paid messages.
- Brand collaborations use escrow with an 80/20 split; funds are held by Stripe and released on approval.
- Tip Jar between members carries a 10% platform fee.
- Payouts run through Stripe Connect after KYC; earnings and payout history are visible in the earnings dashboard.`,
  },
  {
    id: "kids",
    title: "Kids Channel",
    path: "/kids",
    keywords: ["kids", "children", "deti", "kids channel", "parental"],
    doc: `KIDS CHANNEL (/kids) — a safe area designed for ages 6–12 (the main platform is 16+).

- Fully credits-based: there is no separate Kids subscription. AI activities spend from the unified credit wallet.
- Protected by a parental gate (math challenge) before parent-only areas.
- Content includes AI learning modules, coloring pages, stories, games and creative tools, all moderated and age-appropriate.`,
  },
  {
    id: "education",
    title: "Education",
    path: "/education",
    keywords: ["education", "courses", "learning", "daily challenge", "tutor", "vzdelavanie", "kurzy"],
    doc: `EDUCATION (/education) — courses, lessons, tests and gamified learning.

- Courses with lessons and final tests, progress tracking, XP and streaks.
- Daily Challenge requires sign-in so progress, XP, streaks and non-repeating questions are tracked correctly.
- AI Tutor and AI study tools spend AI credits (typically 3–5 per action).
- Leaderboards and achievements reward consistent daily learning.`,
  },
  {
    id: "brand-arena",
    title: "Brand Arena",
    path: "/brand-arena",
    keywords: ["brand", "brand arena", "brand battle", "sponsor", "sponsorship"],
    doc: `BRAND ARENA (/brand-arena) — brand competitions, sponsorship tiers and leaderboards.

- Brand Battle voting and AI tools run on the unified credit wallet; extra votes are purchased via the \`buy_brand_votes\` RPC.
- Tiered sponsorship packages give brands placement, badges and leaderboard visibility.
- Brand collaboration deals with creators use Stripe escrow with an 80/20 split and a release workflow.
- Moderation and appeals are handled by the admin panel with notifications to the brand.`,
  },
  {
    id: "marketplace",
    title: "Marketplace, Bazaar, Auctions & Skills",
    path: "/bazaar",
    keywords: ["bazaar", "marketplace", "auction", "auctions", "skills", "jobs", "services", "property", "inzerat"],
    doc: `MARKETPLACE MODULES — Bazaar (/bazaar), Auctions (/auction), Skills (/skills), Jobs, Services and Property.

- Bazaar: classified listings with saved searches, categories, images and messaging between buyer and seller.
- Auctions: timed bidding with current price, bid history and a dedicated buyer/seller inbox (/auction/messages) split into Bidding and Selling threads; contact details are masked in messages.
- Skills: peer-to-peer microservices with escrow — the buyer's payment is held until the work is delivered and approved.
- Services & Doctor booking: bookings with availability slots, a 24-hour refund window and an 85/15 split.
- All prices are in EUR and all payouts run through Stripe Connect.`,
  },
  {
    id: "wall",
    title: "Wall & social",
    path: "/wall",
    keywords: ["wall", "feed", "social", "friends", "messenger", "messages", "dating"],
    doc: `WALL & SOCIAL (/wall) — the social core of Unique.

- Posts, photos, videos, reactions, comments and a trending feed algorithm; followers and friends are distinct relationships.
- Messenger (/messenger) handles direct conversations, with mutes and contact-info masking.
- Dating features are gated at 16+, with 24-hour refunds on paid dating actions and anonymous swipe/reveal modes.
- Friend requests, "All friends" priority views and realtime presence keep the feed live.`,
  },
];

/** Returns the section docs whose keywords appear in the user's text. */
export function matchSectionDocs(text: string, max = 2): UniSectionDoc[] {
  const q = text.toLowerCase();
  const scored = UNI_SECTIONS.map((s) => {
    let score = 0;
    for (const k of s.keywords) if (q.includes(k)) score += k.length;
    if (q.includes(s.title.toLowerCase())) score += 10;
    return { s, score };
  })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, max).map((x) => x.s);
}
