/**
 * Data for the vertical (TikTok / Reels) platform showcase film.
 * Every entry is one platform section, with real mobile screenshots
 * from remotion/public/** and a short "what & how" caption per shot.
 */

export type ShowLang = "en" | "sk";

export type ShowShot = {
  img: string;
  en: string;
  sk: string;
};

export type ShowSection = {
  id: string;
  tint: string;
  en: { title: string; tag: string };
  sk: { title: string; tag: string };
  shots: ShowShot[];
};

const PINK = "#ff2d94";
const PURPLE = "#7c1fd6";
const LIME = "#c8ff2f";
const CYAN = "#22d3ee";
const ORANGE = "#ff7a18";
const GOLD = "#ffc700";
const BLUE = "#3b82f6";
const GREEN = "#22c55e";
const RED = "#ef4444";

/** Ordered by importance — the TOP-20 / TOP-35 cuts take the first N entries. */
export const SHOWCASE: ShowSection[] = [
  {
    id: "wall",
    tint: PINK,
    en: { title: "Wall", tag: "Your social feed" },
    sk: { title: "Wall", tag: "Tvoj sociálny feed" },
    shots: [
      { img: "live/wall.png", en: "One feed: posts, stories, videos, friends", sk: "Jeden feed: posty, príbehy, videá, priatelia" },
      { img: "wallguide/s2-composer.png", en: "Write a post, add photos, video or a link", sk: "Napíš post, pridaj fotky, video alebo odkaz" },
      { img: "wallguide/s4-post.png", en: "Like, comment, save — edit your own anytime", sk: "Lajkuj, komentuj, ulož — svoje vieš upraviť" },
      { img: "live/videos.png", en: "Videos tab loads 10 at a time — fast on mobile", sk: "Videá po 10 — na mobile to letí" },
      { img: "live/messenger.png", en: "Messenger with realtime notifications", sk: "Messenger s notifikáciami v reálnom čase" },
    ],
  },
  {
    id: "megatalent",
    tint: PINK,
    en: { title: "Megatalent", tag: "Show your talent" },
    sk: { title: "Megatalent", tag: "Ukáž svoj talent" },
    shots: [
      { img: "discover/08-megatalent.jpg", en: "Upload your talent video for 3 credits", sk: "Nahraj talent video za 3 kredity" },
      { img: "images/talent.jpg", en: "People vote & comment — TOP entries get 2x weight", sk: "Ľudia hlasujú a komentujú — TOP má 2x váhu" },
      { img: "club/03-founding.jpg", en: "Cash prize pool: 50% winner / 20% charity / 30% platform", sk: "Výhra: 50 % víťaz / 20 % charita / 30 % platforma" },
    ],
  },
  {
    id: "dating",
    tint: PURPLE,
    en: { title: "Dating", tag: "Find your people" },
    sk: { title: "Dating", tag: "Nájdi svojich ľudí" },
    shots: [
      { img: "social/02-dating.jpg", en: "Swipe ✓ or ✕ — 16+ only, verified profiles", sk: "Swipe ✓ alebo ✕ — len 16+, overené profily" },
      { img: "social/01-anonymous.jpg", en: "Anonymous Date: 2 credits to open a blind match", sk: "Anonymné rande: 2 kredity za slepý match" },
    ],
  },
  {
    id: "messenger",
    tint: CYAN,
    en: { title: "Chat & Best Friend", tag: "Talk to anyone" },
    sk: { title: "Chat & Best Friend", tag: "Píš komukoľvek" },
    shots: [
      { img: "live/messenger.png", en: "Direct messages, voice calls, mute & block", sk: "Správy, hlasové hovory, mute a blokovanie" },
      { img: "social/03-bestfriend.jpg", en: "Best Friend chat for your closest circle", sk: "Best Friend chat pre najbližších" },
    ],
  },
  {
    id: "aitools",
    tint: LIME,
    en: { title: "AI Tools", tag: "Create in seconds" },
    sk: { title: "AI nástroje", tag: "Tvor za sekundy" },
    shots: [
      { img: "aitools/01-creativeforge.jpg", en: "Creative Forge: images, ideas, captions — 3 credits", sk: "Creative Forge: obrázky, nápady, texty — 3 kredity" },
      { img: "aitools/02-content-studio.jpg", en: "Content Studio writes posts & scripts for you", sk: "Content Studio píše posty a scenáre za teba" },
      { img: "aitools/03-ai-generation.jpg", en: "AI Generation: turn a prompt into visuals", sk: "AI Generation: z textu obrázok" },
      { img: "aitools/04-analyzer.jpg", en: "Universal Analyzer reads any photo or document", sk: "Universal Analyzer prečíta fotku či dokument" },
    ],
  },
  {
    id: "photostyler",
    tint: ORANGE,
    en: { title: "Photo & Face AI", tag: "Your photo, restyled" },
    sk: { title: "Photo & Face AI", tag: "Tvoja fotka inak" },
    shots: [
      { img: "aitools/11-photo-restoration.jpg", en: "Photo Restoration brings old photos back to life", sk: "Photo Restoration oživí staré fotky" },
      { img: "aitools/10-future-face.jpg", en: "Future Face shows you in 20 years", sk: "Future Face ťa ukáže o 20 rokov" },
      { img: "aitools/06-tattoo.jpg", en: "AI Tattoo previews ink on your own skin", sk: "AI Tattoo ukáže tetovanie na tvojej koži" },
      { img: "aitools/16-beauty.jpg", en: "Beauty Studio: 12 makeup looks, 3 credits each", sk: "Beauty Studio: 12 makeup štýlov, 3 kredity" },
    ],
  },
  {
    id: "uni",
    tint: BLUE,
    en: { title: "Uni Assistant", tag: "Hands-free helper" },
    sk: { title: "Uni Assistant", tag: "Pomocník bez rúk" },
    shots: [
      { img: "uni/01-voice.jpg", en: "Tap the mic and just talk to Uni", sk: "Klikni na mikrofón a rozprávaj s Uni" },
      { img: "uni/03-navigate.jpg", en: "Uni opens any section for you by voice", sk: "Uni ti hlasom otvorí ktorúkoľvek sekciu" },
      { img: "uni/06-languages.jpg", en: "12 languages, English by default", sk: "12 jazykov, angličtina ako základ" },
    ],
  },
  {
    id: "kids",
    tint: GOLD,
    en: { title: "Kids Channel", tag: "Safe zone, ages 6-12" },
    sk: { title: "Kids Channel", tag: "Bezpečná zóna, 6-12 rokov" },
    shots: [
      { img: "kids/01-hub.jpg", en: "Parental gate with a math challenge", sk: "Rodičovská brána s matematickou úlohou" },
      { img: "kids/02-homework.jpg", en: "Homework helper explains step by step", sk: "Pomocník s domácimi úlohami krok za krokom" },
      { img: "kids/03-story.jpg", en: "Story maker turns your child into the hero", sk: "Tvorba príbehov, kde je hrdinom tvoje dieťa" },
      { img: "kids/05-drawing.jpg", en: "Drawing, science and reading games", sk: "Kreslenie, veda a čítanie ako hra" },
    ],
  },
  {
    id: "education",
    tint: BLUE,
    en: { title: "Education Hub", tag: "Learn & get certified" },
    sk: { title: "Education Hub", tag: "Uč sa a získaj certifikát" },
    shots: [
      { img: "learning/01-education.jpg", en: "Courses with modules, lessons and exams", sk: "Kurzy s modulmi, lekciami a skúškami" },
      { img: "learning/02-mentor.jpg", en: "AI mentor answers while you study", sk: "AI mentor odpovedá počas učenia" },
      { img: "learninggrowth/01-tutorial.jpg", en: "Pass the exam → PDF certificate + XP", sk: "Zlož skúšku → PDF certifikát + XP" },
    ],
  },
  {
    id: "brainlab",
    tint: PURPLE,
    en: { title: "Brain Lab & IQ", tag: "Train your head" },
    sk: { title: "Brain Lab & IQ", tag: "Trénuj hlavu" },
    shots: [
      { img: "learninggrowth/02-iq.jpg", en: "Certified IQ test for 3 credits", sk: "Certifikovaný IQ test za 3 kredity" },
      { img: "learning/05-brainduel.jpg", en: "Brain Duel: challenge a friend, winner takes coins", sk: "Brain Duel: vyzvi priateľa, víťaz berie mince" },
    ],
  },
  {
    id: "marketplace-property",
    tint: GREEN,
    en: { title: "Property", tag: "List your place" },
    sk: { title: "Reality", tag: "Pridaj nehnuteľnosť" },
    shots: [
      { img: "marketplaces/01-property.jpg", en: "Open a listing for 25 credits — no commission", sk: "Inzerát za 25 kreditov — bez provízie" },
      { img: "marketplaces/03-globalswap.jpg", en: "Global Swap: exchange homes worldwide", sk: "Global Swap: výmena bytov po svete" },
    ],
  },
  {
    id: "marketplace-skills",
    tint: GREEN,
    en: { title: "Skills & Bazaar", tag: "Sell what you do" },
    sk: { title: "Skills & Bazaar", tag: "Predaj čo vieš" },
    shots: [
      { img: "marketplaces/02-skills.jpg", en: "Offer a service for 2 credits, deal off-platform", sk: "Nabídni službu za 2 kredity, platba mimo appky" },
      { img: "marketplaces/04-bazaar.jpg", en: "Bazaar for second-hand items with messages", sk: "Bazár na veci z druhej ruky so správami" },
      { img: "marketplaces/06-auctions.jpg", en: "Online auctions with live bidding", sk: "Online aukcie s live prihadzovaním" },
    ],
  },
  {
    id: "arena",
    tint: RED,
    en: { title: "Brand Arena", tag: "Brands go head-to-head" },
    sk: { title: "Brand Arena", tag: "Značky proti sebe" },
    shots: [
      { img: "arena/01-battle.jpg", en: "Vote in brand battles, climb the leaderboard", sk: "Hlasuj v battle značiek, stúpaj v rankingu" },
      { img: "arena/03-sponsor.jpg", en: "Brands sponsor tiers and get real analytics", sk: "Značky sponzorujú a majú reálne analytiky" },
    ],
  },
  {
    id: "influking",
    tint: GOLD,
    en: { title: "Influ-King", tag: "Creators earn here" },
    sk: { title: "Influ-King", tag: "Tu zarábajú tvorcovia" },
    shots: [
      { img: "influking/01-creator.jpg", en: "Build a creator profile and grow", sk: "Postav si profil tvorcu a rasti" },
      { img: "influking/06-fanclub.jpg", en: "Paid subscriptions: 85% creator / 15% platform", sk: "Predplatné: 85 % tvorca / 15 % platforma" },
      { img: "influking/08-gifts.jpg", en: "Unique Gifts: every gift pays the creator 50%", sk: "Unique Gifts: z darčeka 50 % tvorcovi" },
      { img: "influking/11-payout.jpg", en: "Payouts in EUR, tracked in your dashboard", sk: "Výplaty v EUR, sledované v dashboarde" },
    ],
  },
  {
    id: "health",
    tint: GREEN,
    en: { title: "Health & Wellness", tag: "Feel better daily" },
    sk: { title: "Zdravie & Wellness", tag: "Cíť sa lepšie" },
    shots: [
      { img: "health/01-wellness.jpg", en: "Track mood, sleep, water and habits", sk: "Sleduj náladu, spánok, vodu a návyky" },
      { img: "health/02-psychologist.jpg", en: "AI psychologist for a private talk", sk: "AI psychológ na súkromný rozhovor" },
      { img: "health/03-firstaid.jpg", en: "First aid guide for emergencies", sk: "Prvá pomoc pre krízové situácie" },
    ],
  },
  {
    id: "fitness",
    tint: LIME,
    en: { title: "Fitness & Nutrition", tag: "Plans that fit you" },
    sk: { title: "Fitness & Výživa", tag: "Plány na mieru" },
    shots: [
      { img: "health/09-fitness.jpg", en: "30 / 60 / 90-day workout plans on credits", sk: "30 / 60 / 90-dňové tréningy za kredity" },
      { img: "health/04-fitslim.jpg", en: "Meal plan generated for the exact day count", sk: "Jedálniček presne na počet dní" },
      { img: "health/05-nutrition.jpg", en: "Snap a meal → calories and macros", sk: "Vyfoť jedlo → kalórie a makrá" },
    ],
  },
  {
    id: "challenges",
    tint: GREEN,
    en: { title: "Eco & Healthy Challenge", tag: "Win real money" },
    sk: { title: "Eco & Healthy Challenge", tag: "Vyhraj skutočné peniaze" },
    shots: [
      { img: "challenges/eco-backdrop.jpg", en: "Post a daily proof, get approved, keep the streak", sk: "Pridaj denný dôkaz, nech ho schvália, drž streak" },
      { img: "challenges/health-backdrop.jpg", en: "PRO €3 / TOP €5 subscription builds the prize pool", sk: "PRO €3 / TOP €5 tvorí výherný pool" },
      { img: "challenges/intro-backdrop.jpg", en: "Pick a shelter, children's home, oncology or disability centre — it takes 20%", sk: "Vyber útulok, detský domov, onkológiu či centrum pre postihnutých — dostane 20 %" },
    ],
  },
  {
    id: "entertainment",
    tint: PINK,
    en: { title: "Entertainment", tag: "Play every day" },
    sk: { title: "Zábava", tag: "Hraj každý deň" },
    shots: [
      { img: "entertainment/05-comedy.jpg", en: "Comedy Club: post jokes, collect laughs", sk: "Comedy Club: pridaj vtipy, zbieraj smiech" },
      { img: "entertainment/08-escape.jpg", en: "Escape Room: finish 3 rooms for +50 XP", sk: "Escape Room: 3 izby a máš +50 XP" },
      { img: "entertainment/01-shadow.jpg", en: "Shadows Arena and other credit arenas", sk: "Shadows Arena a ďalšie kreditové arény" },
      { img: "entertainment/09-mystery.jpg", en: "Mystery boxes and surprise drops", sk: "Mystery boxy a prekvapenia" },
    ],
  },
  {
    id: "rewards",
    tint: GOLD,
    en: { title: "Rewards & Games", tag: "Free credits daily" },
    sk: { title: "Odmeny & Hry", tag: "Kredity každý deň" },
    shots: [
      { img: "discover/07-rewards.jpg", en: "Daily login, lucky wheel, quests, battle pass", sk: "Denný login, koleso, questy, battle pass" },
      { img: "discover/02-games.jpg", en: "Hundreds of mini games — 1 credit entry", sk: "Stovky mini hier — vstup 1 kredit" },
      { img: "account/04-ai-credits.jpg", en: "+10 free credits every month, 5 on signup", sk: "+10 kreditov mesačne, 5 pri registrácii" },
    ],
  },
  {
    id: "mystical",
    tint: PURPLE,
    en: { title: "Mystical", tag: "Curious? Try this" },
    sk: { title: "Mystika", tag: "Zvedavá? Skús" },
    shots: [
      { img: "mystical/03-astrology.jpg", en: "Astrology, palmistry from a hand photo", sk: "Astrológia, čítanie z ruky z fotky" },
      { img: "mystical/04-dream.jpg", en: "Dream Decoder explains last night", sk: "Dream Decoder vysvetlí tvoj sen" },
      { img: "mystical/05-crystal.jpg", en: "Crystal energy, DNA story, past lives", sk: "Energia kryštálov, DNA príbeh, minulé životy" },
      { img: "mystical/11-timecapsule.jpg", en: "Time Capsule: a message to future you", sk: "Time Capsule: správa pre budúcu teba" },
    ],
  },
  {
    id: "work",
    tint: CYAN,
    en: { title: "Work & Jobs", tag: "Get hired" },
    sk: { title: "Práca", tag: "Nájdi si prácu" },
    shots: [
      { img: "discover/03-work.jpg", en: "Post or find a job on credits", sk: "Pridaj alebo nájdi prácu za kredity" },
      { img: "learninggrowth/03-marketing.jpg", en: "AI CV builder with PDF export", sk: "AI životopis s exportom do PDF" },
    ],
  },
  {
    id: "fundraising",
    tint: RED,
    en: { title: "Fundraising", tag: "Help real people" },
    sk: { title: "Zbierky", tag: "Pomôž skutočným ľuďom" },
    shots: [
      { img: "fundraising/01-hub.jpg", en: "Medical, dream, pet and crisis campaigns", sk: "Zdravotné, snové, zvieracie a krízové zbierky" },
      { img: "fundraising/02-medical.jpg", en: "Transparent progress on every campaign", sk: "Transparentný priebeh každej zbierky" },
    ],
  },
  {
    id: "verified",
    tint: GOLD,
    en: { title: "Verified & Founders", tag: "Stand out" },
    sk: { title: "Verified & Founders", tag: "Vynikni" },
    shots: [
      { img: "verified/01-verified.jpg", en: "Verify your profile for 30 credits — lifetime badge", sk: "Overenie profilu za 30 kreditov — navždy" },
      { img: "club/03-founding.jpg", en: "First 1000 members get the Founder badge", sk: "Prvých 1000 členov má Founder odznak" },
      { img: "verified/03-pro.jpg", en: "Gold ring on your avatar everywhere", sk: "Zlatý prsteň na avatare všade" },
    ],
  },
  {
    id: "account",
    tint: BLUE,
    en: { title: "Profile & Credits", tag: "Everything in one place" },
    sk: { title: "Profil & Kredity", tag: "Všetko na jednom mieste" },
    shots: [
      { img: "live/profile.png", en: "Profile: friends, posts, cosmetics, subscriptions", sk: "Profil: priatelia, posty, kozmetika, predplatné" },
      { img: "account/03-subscription.jpg", en: "Active subscriptions visible right in the profile", sk: "Aktívne predplatné priamo v profile" },
      { img: "account/05-earnings.jpg", en: "Referral counter: €5 per invited subscriber", sk: "Referral počítadlo: €5 za pozvaného predplatiteľa" },
    ],
  },
  {
    id: "sports",
    tint: ORANGE,
    en: { title: "Sports Arena", tag: "Predict & compete" },
    sk: { title: "Športová aréna", tag: "Tipuj a súťaž" },
    shots: [
      { img: "sports/03-football.jpg", en: "Football, hockey, tennis, basketball predictions", sk: "Tipy na futbal, hokej, tenis, basket" },
      { img: "sports/02-horse.jpg", en: "Horse racing and character arenas on credits", sk: "Dostihy a arény postáv za kredity" },
    ],
  },
  {
    id: "cooking",
    tint: ORANGE,
    en: { title: "Kitchen Stars", tag: "Cook & compete" },
    sk: { title: "Kitchen Stars", tag: "Var a súťaž" },
    shots: [
      { img: "entertainment/03-kitchenstars.jpg", en: "Cooking contest with real voting", sk: "Kuchárska súťaž s reálnym hlasovaním" },
      { img: "entertainment/12-cooking.jpg", en: "AI recipes from what's in your fridge", sk: "AI recepty z toho, čo máš v chladničke" },
    ],
  },
  {
    id: "community",
    tint: CYAN,
    en: { title: "Communities & Forum", tag: "Find your topic" },
    sk: { title: "Komunity & Fórum", tag: "Nájdi svoju tému" },
    shots: [
      { img: "social/04-community.jpg", en: "Join communities around what you love", sk: "Pripoj sa ku komunitám podľa záujmu" },
      { img: "social/06-megaforum.jpg", en: "Mega Forum for long discussions", sk: "Mega Fórum na dlhé diskusie" },
    ],
  },
  {
    id: "companions",
    tint: PURPLE,
    en: { title: "AI Companions", tag: "Chat with characters" },
    sk: { title: "AI spoločníci", tag: "Chatuj s postavami" },
    shots: [
      { img: "social/07-character.jpg", en: "18 original characters, 2 credits per message", sk: "18 originálnych postáv, 2 kredity za správu" },
      { img: "social/08-emotion.jpg", en: "Emotion AI reads the mood of a photo", sk: "Emotion AI prečíta náladu z fotky" },
    ],
  },
  {
    id: "brand-design",
    tint: LIME,
    en: { title: "Brand & Design AI", tag: "Look professional" },
    sk: { title: "Brand & Design AI", tag: "Vyzeraj profesionálne" },
    shots: [
      { img: "aitools/14-brand-builder.jpg", en: "Brand Builder: logo, colors, tone of voice", sk: "Brand Builder: logo, farby, tón komunikácie" },
      { img: "aitools/18-graphic-design.jpg", en: "Graphic design for posts and ads", sk: "Grafika na posty a reklamy" },
      { img: "aitools/15-home-designer.jpg", en: "Room Designer keeps your walls, changes the style — 30 credits", sk: "Room Designer nechá steny, zmení štýl — 30 kreditov" },
    ],
  },
  {
    id: "video-ai",
    tint: PINK,
    en: { title: "Video & Music AI", tag: "Make content fast" },
    sk: { title: "Video & Music AI", tag: "Rýchly obsah" },
    shots: [
      { img: "aitools/05-video-ad.jpg", en: "Video Ad Studio: script, scenes, 9:16 export", sk: "Video Ad Studio: scenár, scény, export 9:16" },
      { img: "aitools/20-music.jpg", en: "AI music studio with royalty tracking", sk: "AI hudobné štúdio so sledovaním royalties" },
      { img: "influking/09-live.jpg", en: "Go live and get gifts from viewers", sk: "Vysielaj naživo a získaj darčeky" },
    ],
  },
  {
    id: "unlock",
    tint: GOLD,
    en: { title: "Unlock Videos", tag: "Pay-per-view, 1 credit" },
    sk: { title: "Unlock Videos", tag: "1 kredit za odomknutie" },
    shots: [
      { img: "influking/07-ppv.jpg", en: "Video locks halfway — 1 credit unlocks the rest", sk: "Video sa v polovici zamkne — 1 kredit ho odomkne" },
      { img: "influking/05-deals.jpg", en: "Creator keeps the bigger share of every unlock", sk: "Tvorca má väčší podiel z každého odomknutia" },
    ],
  },
  {
    id: "beauty-fashion",
    tint: PINK,
    en: { title: "Beauty & Fashion", tag: "Try before you buy" },
    sk: { title: "Beauty & Fashion", tag: "Vyskúšaj pred kúpou" },
    shots: [
      { img: "aitools/17-fashion.jpg", en: "Fashion Studio styles a full outfit", sk: "Fashion Studio zloží celý outfit" },
      { img: "discover/05-booking.jpg", en: "Book a salon straight from the app", sk: "Rezervuj salón priamo v appke" },
      { img: "discover/06-services.jpg", en: "Services & Glow booking with reviews", sk: "Služby a rezervácie s recenziami" },
    ],
  },
  {
    id: "coupons",
    tint: GREEN,
    en: { title: "Coupons & Collectibles", tag: "Save & collect" },
    sk: { title: "Kupóny & Zberateľstvo", tag: "Šetri a zbieraj" },
    shots: [
      { img: "marketplaces/05-coupons.jpg", en: "Coupons and promo drops from partners", sk: "Kupóny a promo akcie od partnerov" },
      { img: "marketplaces/07-collectibles.jpg", en: "Collectible cards you can trade", sk: "Zberateľské kartičky na výmenu" },
      { img: "marketplaces/08-antique.jpg", en: "Antique Identification from one photo", sk: "Identifikácia starožitností z jednej fotky" },
    ],
  },
  {
    id: "pets",
    tint: CYAN,
    en: { title: "Pets & Fun AI", tag: "Just for laughs" },
    sk: { title: "Zvieratká & Fun AI", tag: "Pre zábavu" },
    shots: [
      { img: "entertainment/14-pet.jpg", en: "Virtual pet you feed and level up", sk: "Virtuálny miláčik, ktorého kŕmiš a leveluješ" },
      { img: "aitools/08-pet-translator.jpg", en: "Pet Translator turns barks into sentences", sk: "Pet Translator preloží štekot na vety" },
      { img: "health/08-liedetector.jpg", en: "Lie detector and phobia trainer for fun", sk: "Detektor lži a tréner fóbií pre zábavu" },
    ],
  },
  {
    id: "gifts",
    tint: PINK,
    en: { title: "Unique Gifts", tag: "Send something real" },
    sk: { title: "Unique Gifts", tag: "Pošli niečo skutočné" },
    shots: [
      { img: "entertainment/10-gifts.jpg", en: "360+ animated gifts for chats and posts", sk: "360+ animovaných darčekov do chatov a postov" },
      { img: "entertainment/02-concerts.jpg", en: "Concert gifts split between friends", sk: "Koncertné darčeky delené medzi priateľov" },
    ],
  },
  {
    id: "vacationer",
    tint: BLUE,
    en: { title: "Vacationer & Coffee", tag: "Meet in real life" },
    sk: { title: "Vacationer & Coffee", tag: "Stretni sa naživo" },
    shots: [
      { img: "entertainment/11-vacationer.jpg", en: "Find travel buddies and rate hosts", sk: "Nájdi spolucestujúcich a hodnoť hostiteľov" },
      { img: "entertainment/13-coffee.jpg", en: "Coffee Community: swipe for a real coffee date", sk: "Coffee Community: swipe na kávu naživo" },
    ],
  },
  {
    id: "stories",
    tint: PURPLE,
    en: { title: "Stories & Notes", tag: "24 hours only" },
    sk: { title: "Stories & Notes", tag: "Len 24 hodín" },
    shots: [
      { img: "wallguide/s3-tabs-stories.png", en: "Stories with backgrounds, likes and comments", sk: "Príbehy s pozadím, lajkami a komentármi" },
      { img: "live/friends.png", en: "24h notes above your friend list", sk: "24h poznámky nad zoznamom priateľov" },
    ],
  },
  {
    id: "search",
    tint: CYAN,
    en: { title: "Search & Discover", tag: "Everything findable" },
    sk: { title: "Hľadanie & Discover", tag: "Nájdeš všetko" },
    shots: [
      { img: "discover/01-wall.jpg", en: "Search people, posts and every module", sk: "Hľadaj ľudí, posty a všetky moduly" },
      { img: "discover/04-promotions.jpg", en: "Promotions and What's new in one tap", sk: "Promo akcie a novinky jedným ťuknutím" },
    ],
  },
  {
    id: "coloring",
    tint: GOLD,
    en: { title: "Kids Creative", tag: "Print & play" },
    sk: { title: "Kids Creative", tag: "Vytlač a hraj" },
    shots: [
      { img: "learning/04-coloring.jpg", en: "Coloring pages generated on demand", sk: "Omaľovánky generované na požiadanie" },
      { img: "learning/03-kidschannel.jpg", en: "Fairytale Book: your child's photo becomes a story", sk: "Rozprávková kniha z fotky tvojho dieťaťa" },
      { img: "kids/07-career.jpg", en: "Career and science quizzes for kids", sk: "Kvízy o povolaniach a vede pre deti" },
    ],
  },
  {
    id: "growth",
    tint: BLUE,
    en: { title: "Personal Growth", tag: "Level up skills" },
    sk: { title: "Osobný rast", tag: "Zlepši sa" },
    shots: [
      { img: "learninggrowth/04-speaking.jpg", en: "Public speaking and writing coaches", sk: "Tréner prezentovania a písania" },
      { img: "learninggrowth/06-language.jpg", en: "Language practice with instant feedback", sk: "Jazyky s okamžitou spätnou väzbou" },
      { img: "learninggrowth/07-finance.jpg", en: "Finance basics explained simply", sk: "Základy financií jednoducho" },
    ],
  },
  {
    id: "quantum",
    tint: PURPLE,
    en: { title: "Experimental AI", tag: "Weird & wonderful" },
    sk: { title: "Experimentálne AI", tag: "Divné a super" },
    shots: [
      { img: "mystical/09-multiverse.jpg", en: "Multiverse & quantum stories about you", sk: "Multiverse a kvantové príbehy o tebe" },
      { img: "mystical/12-timereversal.jpg", en: "Time Reversal: rewind your own past", sk: "Time Reversal: vráť si vlastnú minulosť" },
      { img: "mystical/13-holographic.jpg", en: "Holographic avatars of yourself", sk: "Holografické avatary teba samej" },
    ],
  },
  {
    id: "glamour",
    tint: PINK,
    en: { title: "Glamour & Exclusive", tag: "Premium corner" },
    sk: { title: "Glamour & Exclusive", tag: "Premium kút" },
    shots: [
      { img: "entertainment/04-glamour.jpg", en: "Glamour shows and styled galleries", sk: "Glamour show a štýlové galérie" },
      { img: "entertainment/07-exclusive.jpg", en: "Exclusive content behind credits", sk: "Exkluzívny obsah za kredity" },
      { img: "entertainment/15-culinary.jpg", en: "Culinary journeys and food stories", sk: "Kulinárske výpravy a food príbehy" },
    ],
  },
  {
    id: "invite",
    tint: LIME,
    en: { title: "Invite & Earn", tag: "€5 per friend" },
    sk: { title: "Pozvi a zarob", tag: "€5 za priateľa" },
    shots: [
      { img: "social/09-invite.jpg", en: "Share your code — €5 for every paid signup", sk: "Zdieľaj kód — €5 za každé platené predplatné" },
      { img: "account/06-contact.jpg", en: "Support, suggestions and bug bounty credits", sk: "Podpora, návrhy a kredity za nájdené chyby" },
    ],
  },
];

/** Sections included in each cut of the film. */
export const CUT_20 = SHOWCASE.slice(0, 20).map((s) => s.id);
export const CUT_35 = SHOWCASE.slice(0, 35).map((s) => s.id);
export const CUT_ALL = SHOWCASE.map((s) => s.id);

export const COPY = {
  en: {
    intro1: "ONE APP.",
    intro2: "EVERYTHING.",
    introSub: "Social • AI • Earning • Games • Learning",
    outro1: "JOIN UNIQUE",
    outro2: "uniqueapp.fun",
    outroSub: "5 free credits on signup • +10 every month",
    sectionsWord: "sections",
  },
  sk: {
    intro1: "JEDNA APKA.",
    intro2: "VŠETKO V NEJ.",
    introSub: "Sociálna sieť • AI • Zárobok • Hry • Vzdelávanie",
    outro1: "PRIDAJ SA",
    outro2: "uniqueapp.fun",
    outroSub: "5 kreditov pri registrácii • +10 každý mesiac",
    sectionsWord: "sekcií",
  },
} as const;
