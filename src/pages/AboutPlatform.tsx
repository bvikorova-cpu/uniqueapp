import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Play, Pause, Volume2, VolumeX, ArrowRight, Search,
  Crown, Cpu, Swords, Heart, Users, Globe, Brain, Trophy,
  Briefcase, GraduationCap, Gem, Star, Music, Mic2, ChefHat,
  Lock, Gift, Plane, Coffee, PawPrint, Building2, Store, Ticket,
  Gavel, Activity, Apple, Shield, Ghost, Bot, PenTool, Image as ImageIcon,
  Clock, Palette, Scale, Dna, Zap, Video, MessageSquare, Mail,
  MessageCircle, BookOpen, FlaskConical, Car, Home, AlertTriangle, Bookmark, BookmarkCheck,
  ChevronDown, Coins, Wallet, CheckCircle2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFavoriteSections } from "@/hooks/useFavoriteSections";
import { useAuth } from "@/contexts/AuthContext";
import heroAsset from "@/assets/about-platform-hero.mp4.asset.json";

type Section = {
  path: string;
  title: string;
  icon: any;
  blurb: string;
  features: string[];
  tag?: string;
  /** 3-5 sentence detailed walkthrough of what the section does. */
  details?: string;
  /** Pricing model summary (credits / subscription / commission / free). */
  pricing?: string;
  /** Deep capabilities — shown when "Show more" is expanded. */
  capabilities?: string[];
};

type Category = {
  id: string;
  title: string;
  icon: any;
  accent: string;
  intro: string;
  sections: Section[];
};

const CATEGORIES: Category[] = [
  {
    id: "social",
    title: "Social & Communication",
    icon: Users,
    accent: "text-violet-500",
    intro: "Your daily home base — feed, friends, groups, pages, events, messenger and real-time stories.",
    sections: [
      {
        path: "/wall", title: "The Wall", icon: MessageSquare,
        blurb: "Personalized feed of posts, photos, videos, polls and stories from people and creators you follow.",
        features: ["Stories (24h)", "Reactions, comments, shares", "Saved posts & memories", "Trending tab", "Friend & follow graph", "Reels-style videos"],
        details: "The Wall is the social heart of Unique. It blends a chronological friend feed with an algorithmic discovery layer that surfaces trending creators, communities and viral clips. Post text, photos, multi-image carousels, short videos, polls and 24-hour stories — everything supports reactions, threaded comments and shares with built-in moderation. Saved posts become searchable memories you can revisit any time.",
        pricing: "Free to use • Boosted posts and creator tips paid in credits",
        capabilities: ["Friend requests & follow graph", "Mute, block, report", "Hashtags & mentions", "Image and video upload up to 4K", "Story highlights archive", "Cross-post to Pages and Groups", "Verified badges", "Algorithm preference controls"],
      },
      {
        path: "/messenger", title: "Messenger", icon: Mail,
        blurb: "1:1 and group chats with media, voice, video calls and reactions.",
        features: ["Privacy-first messaging", "Voice & video calls", "Group chats up to 100", "Pinned messages", "Media gallery", "Disappearing messages"],
        details: "A unified messenger that replaces every legacy DM layer in the platform. Chat 1:1, in small groups or in topic rooms with full media support, reactions, replies and read receipts. Voice and video calls run on WebRTC with screen sharing. Conversations are partitioned by community so DMs from creators, friends and brands never collide.",
        pricing: "Free • Premium creator DMs may be paid (PPV unlocked by creator)",
        capabilities: ["End-to-end style encryption", "Voice notes & video messages", "Group call up to 12 participants", "File attachments (images, PDF, audio)", "Typing indicators & read receipts", "Block, mute, report and archive", "Search across conversations", "Auto-delete timers"],
      },
      {
        path: "/wall/groups", title: "Groups", icon: Users,
        blurb: "Topic communities with their own posts, rules, moderators and events.",
        features: ["Public & private groups", "Moderation tools", "Member roles", "Group insights", "Group events", "Pinned announcements"],
        details: "Groups are full mini-communities, each with their own feed, members, roles and rules. Owners and moderators get pinned announcements, approval queues, banned-word filters, member analytics and event scheduling. Groups can be free, paid or invite-only with optional Stripe-powered membership.",
        pricing: "Free to create • Paid groups split 85/15 with platform",
        capabilities: ["Owner / mod / member roles", "Approval queue for posts and members", "Auto-moderation (AI + keyword)", "Scheduled posts", "Group-only events", "Polls and Q&A", "Member directory", "Group-scoped bazaar listings"],
      },
      {
        path: "/wall/pages", title: "Pages", icon: Globe,
        blurb: "Brand, creator and business pages with reviews, followers and content.",
        features: ["Reviews & ratings", "Follower analytics", "Pinned posts", "Verified badges", "Call-to-action button", "Cross-post scheduler"],
        details: "Pages are public-facing profiles for brands, creators, businesses, artists and public figures. Followers see updates in their feed, can leave star reviews, book services and tap CTA buttons (visit website, message, buy, donate). Built-in analytics show reach, engagement and conversion. Verified Founder and brand badges are issued by Unique admins.",
        pricing: "Free to create • Verification fee one-time • Promoted posts in credits",
        capabilities: ["Star reviews with replies", "Audience insights dashboard", "Multi-admin teams", "Custom CTA buttons", "Scheduled content calendar", "Pinned welcome message", "Cross-post to Wall, Groups, Events", "Brand kit storage"],
      },
      {
        path: "/wall/events", title: "Events", icon: Star,
        blurb: "Create or RSVP to local and online events with tickets.",
        features: ["RSVP & guest lists", "Paid tickets", "Calendar export", "Event chat", "QR check-in", "Recurring events"],
        details: "Plan in-person or virtual events end-to-end. Sell free or paid tickets via Stripe Connect (platform takes 10%), manage guest lists, generate QR check-in codes and broadcast updates to all attendees. Recurring events handle weekly meetups; virtual events embed live video or external links.",
        pricing: "Free events free • Paid tickets: 10% platform fee + Stripe fees",
        capabilities: ["Ticket tiers with limits", "Promo codes & early-bird pricing", "Co-host invitations", "Attendee Q&A board", "Photo gallery after event", "Refund window controls", "ICS / Google calendar export", "Reminder notifications"],
      },
      {
        path: "/megaforum", title: "Megaforum", icon: MessageCircle,
        blurb: "Long-form discussion forum with debates, polls, challenges and reputation.",
        features: ["Threaded debates", "Live polls", "Forum reputation", "Topic following", "Karma scoring", "Best-answer voting"],
        details: "Reddit-style long-form discussions with multi-level threading, karma, badges and topic subscriptions. Each topic has moderators and rules; users build reputation through upvoted answers and weekly debate challenges. AI summarizes long threads on demand.",
        pricing: "Free to read and post • Premium topics & AI summaries cost credits",
        capabilities: ["Nested threading 8 levels deep", "Up/down voting with karma", "Best-answer marking", "Weekly debate prompts", "AI thread summarization (3 credits)", "Topic-level moderation", "User flair and badges", "Markdown editor with media"],
      },
      {
        path: "/companions", title: "Character Companions", icon: Bot,
        blurb: "Chat with AI characters with persistent memory and unique personalities.",
        features: ["Custom personas", "Long-term memory", "Roleplay scenarios", "Voice replies", "Image generation in-chat", "Shareable companions"],
        details: "Create and chat with AI companions that remember everything — your name, preferences, ongoing storylines. Pick from preset personas (mentor, friend, historical figure, fictional character) or build your own with personality traits, voice, avatar and backstory. Share companions publicly or keep them private.",
        pricing: "5 credits per long conversation • Voice replies +2 credits • Image gen +3 credits",
        capabilities: ["Custom personality builder", "Persistent multi-month memory", "Voice cloning per companion", "In-chat image generation", "Roleplay scene setting", "Public companion marketplace", "Save/export conversations", "NSFW filter toggle (18+)"],
      },
      {
        path: "/emotion-economy", title: "Emotion Economy", icon: Heart,
        blurb: "Track, trade and mine your emotional currency — gamified mood network.",
        features: ["Mood wallet", "Emotion drops", "Insurance & futures", "Mining rewards", "Mood charts", "Social sharing"],
        details: "An experimental gamified network where your daily moods become a tradeable currency. Log emotions to mine tokens, buy insurance against bad streaks, invest in futures contracts on your own mood and trade emotion drops with friends. Pure entertainment — not financial.",
        pricing: "Free to log • Premium mining boosts & insurance in credits",
        capabilities: ["Daily mood check-in", "Emotion token mining", "Mood-futures market", "Insurance policies", "Friend leaderboards", "Mood-based AI insights", "Streak rewards", "Public mood charts"],
      },
      {
        path: "/referral", title: "Invite Friends", icon: Users,
        blurb: "Earn recurring credits when friends join and subscribe.",
        features: ["Custom referral code", "Lifetime % rewards", "Leaderboard", "Fraud-protected", "Email & link sharing", "Tracking dashboard"],
        details: "Share your unique referral code. Every friend who signs up and spends credits earns you a recurring percentage for life. Anti-fraud filters detect duplicate signups and self-referrals. Real-time leaderboard rewards top recruiters with bonus credits.",
        pricing: "Free • You earn 10% lifetime of referred user spend",
        capabilities: ["Custom personal code", "Shareable referral link", "Tracking dashboard with stats", "Monthly leaderboard prizes", "Anti-abuse fraud detection", "Tiered milestones (10/50/100 referrals)", "Auto-payout to credit wallet", "Email invite tool"],
      },
    ],
  },
  {
    id: "dating",
    title: "Dating & Relationships",
    icon: Heart,
    accent: "text-pink-500",
    intro: "From real-name dating to anonymous chemistry tests — find people through interests, not just photos.",
    sections: [
      {
        path: "/dating", title: "Dating", icon: Heart,
        blurb: "Photo-first matching with filters, super-likes, boosts and date plans.",
        features: ["AI compatibility score", "Date ideas planner", "Video verification", "Super-likes & boosts", "Distance filter", "Voice intros"],
        details: "Classic photo-first dating with modern AI on top. Filter by age, distance, interests, lifestyle and zodiac. Each profile gets an AI compatibility score based on bio analysis. Boost your profile, send super-likes, exchange voice intros and use the date planner to propose specific venues.",
        pricing: "Free swipes • Super-likes 1 credit • Boost 10 credits/hour • Verification free",
        capabilities: ["Profile verification with selfie", "AI bio writer", "Date ideas with venue links", "Voice and video calls", "Mutual friends visibility", "Match expiration timers", "Incognito browsing (premium)", "Travel mode"],
      },
      {
        path: "/anonymous-date", title: "Anonymous Date", icon: Lock,
        blurb: "Match by personality first — photos reveal only after chemistry is proven.",
        features: ["Chemistry reports", "Red-flag scans", "Vibe decoder", "Reveal readiness", "Personality quizzes", "Voice-only mode"],
        details: "Photos stay hidden until you and your match both pass a chemistry threshold. AI analyzes your conversations for compatibility, red flags and shared values then issues a reveal-readiness score. Build connection through text, voice and personality games before seeing each other.",
        pricing: "5 credits per chemistry report • Reveal free once unlocked",
        capabilities: ["AI chemistry score", "Red-flag scanner", "Vibe decoder for messages", "Personality quizzes", "Voice-only icebreakers", "Reveal-readiness meter", "Mutual reveal mechanic", "Profile anonymity toggle"],
      },
      {
        path: "/best-friend", title: "AI Best Friend", icon: Bot,
        blurb: "Always-on AI companion that remembers your life, moods and goals.",
        features: ["Mood journal", "Crisis check-ins", "Memory bank", "Daily nudges", "Voice replies", "Goal tracking"],
        details: "Your 24/7 AI friend who remembers your life — name, job, relationships, hopes, struggles. Get daily check-ins, mood support, goal nudges and crisis routing to real help if conversations turn dark. Voice replies make it feel natural; the memory bank means you never repeat yourself.",
        pricing: "5 credits per long session • Voice +2 credits • Crisis routing free",
        capabilities: ["Persistent multi-year memory", "Daily mood check-in", "Crisis safety routing", "Goal and habit tracking", "Voice conversations", "Personality customization", "Photo & memory upload", "Privacy lock"],
      },
      {
        path: "/membership-community", title: "Membership Community", icon: Crown,
        blurb: "Paid creator memberships with perks, livestreams and welcome DMs.",
        features: ["Tiered perks", "Fan persona AI", "Growth funnels", "Livestream briefs", "PPV content", "Paid DMs"],
        details: "Creators sell paid memberships with multiple tiers, each unlocking PPV content, paid DMs, exclusive livestreams and welcome gifts. AI analyzes fan personas, suggests growth funnels and drafts livestream briefs. Platform splits 85/15 with creators.",
        pricing: "Subscription set by creator • Platform takes 15%",
        capabilities: ["Multiple subscription tiers", "PPV photos and videos", "Paid 1:1 DM unlocks", "Welcome DM automation", "Livestream scheduling", "AI fan-persona reports", "Growth funnel suggestions", "Stripe Connect payouts"],
      },
    ],
  },
  {
    id: "mystical",
    title: "Mystical & Spiritual",
    icon: Sparkles,
    accent: "text-purple-500",
    intro: "Spiritual exploration — past lives, dreams, astrology, crystals, quantum and holographic worlds.",
    sections: [
      {
        path: "/past-life", title: "Past Life Explorer", icon: Clock,
        blurb: "AI past-life reading with 8 deep tools: animal elementals, karmic debts, soul tribes, regressions.",
        features: ["8 advanced tools", "Karmic debt tracker", "Soul tribes", "Death reflections", "Animal elementals", "Regression sessions"],
        details: "Eight interconnected tools for past-life exploration. Get a base reading then dive deeper with animal elemental scans, karmic debt analysis, soul tribe matching, regression sessions and death reflection journaling. All entertainment-purpose; results shareable as cinematic cards.",
        pricing: "8 credits per reading • Deep tools 5-12 credits each",
        capabilities: ["Base past-life reading", "Animal elemental scan", "Karmic debt tracker", "Soul tribe matching", "Death reflection journal", "Regression voice sessions", "Past-life timeline visualizer", "Shareable cinematic cards"],
      },
      { path: "/astrology", title: "Astrology", icon: Star, blurb: "Daily horoscopes, birth charts and compatibility reports.", features: ["Birth chart builder", "Daily horoscopes", "Compatibility", "Transit alerts", "Synastry charts", "Solar return"], details: "Full Western astrology suite with accurate ephemeris. Build natal charts, read daily and monthly horoscopes, run synastry compatibility with anyone, get transit alerts for major aspects and explore solar/lunar returns. AI interpretations on every chart.", pricing: "Daily horoscope free • Birth chart 5 credits • Compatibility 8 credits", capabilities: ["Accurate ephemeris birth chart", "Daily and weekly horoscopes", "Synastry compatibility", "Composite charts", "Transit alerts (push)", "Solar & lunar return charts", "Saved chart library", "AI interpretation per aspect"] },
      { path: "/numerology", title: "Numerology", icon: Sparkles, blurb: "Name and birth-date numerology with full life-path breakdown.", features: ["Life-path report", "Lucky numbers", "Personal year cycles", "Shareable cards", "Name analysis", "Compatibility"], details: "Pythagorean and Chaldean numerology. Get your life-path number, expression, soul urge, personality, personal year cycles and lucky numbers. Run compatibility between two names and birthdays. All reports exportable as shareable cards.", pricing: "Life-path 5 credits • Compatibility 8 credits", capabilities: ["Life-path calculation", "Expression & soul-urge numbers", "Personal year cycles", "Lucky number generator", "Name compatibility", "Master number alerts", "Shareable result cards", "Saved profile library"] },
      { path: "/dream-journal", title: "Dream Analyzer", icon: Brain, blurb: "Log dreams, get AI interpretation, track moods and battle dream interpretations.", features: ["Mood-linked entries", "AI interpretations", "Dream battles", "Pattern detection", "Symbol library", "Voice logging"], details: "Log dreams in text or voice, link them to your mood that day, and get AI interpretations referencing Jungian symbols, recurring themes and personal patterns. Dream battles let friends interpret each other's dreams and vote on the best take.", pricing: "AI interpretation 3 credits per dream • Pattern reports 5 credits", capabilities: ["Voice and text logging", "AI symbol interpretation", "Recurring pattern detection", "Mood linkage", "Dream battle multiplayer", "Symbol library reference", "Export dream book PDF", "Privacy lock per entry"] },
      { path: "/lottery-ai", title: "Lottery AI", icon: Sparkles, blurb: "AI number predictions with numerology, syndicates and budget coaches. Entertainment only.", features: ["Number generator", "Syndicates", "Pattern detector", "Winner mindset", "Budget guard", "History tracker"], details: "Entertainment-only number generation using numerology, frequency analysis and AI pattern detection. Form syndicates with friends to split costs and wins, use the budget guard to cap spending and read winner-mindset content. No financial guarantees.", pricing: "5 credits per AI draw • Syndicate hosting free", capabilities: ["AI number generator", "Numerology integration", "Frequency pattern analysis", "Syndicate creation & splits", "Budget guard cap", "Winner mindset library", "Draw history tracker", "Lottery results lookup"] },
      { path: "/crystal-energy-network", title: "Crystal & Energy Network", icon: Gem, blurb: "AI energy readings, chakra programs, oracle draws and crystal marketplace.", features: ["Energy readings", "Chakra journey", "Oracle draws", "Marketplace", "Crystal library", "Healing programs"], details: "AI-driven energy diagnostics — describe your state, get chakra alignment scores and a personalized healing program. Pull oracle cards daily, browse the crystal library and buy real crystals from verified sellers in the integrated marketplace.", pricing: "Energy reading 5 credits • Oracle draw 2 credits • Marketplace 10% commission", capabilities: ["Chakra alignment scan", "Personalized healing plans", "Daily oracle draws", "Crystal encyclopedia", "Verified crystal marketplace", "Energy diary", "Group healing sessions", "Stripe Connect for sellers"] },
      { path: "/dna-memory-network", title: "DNA Memory Network", icon: Dna, blurb: "Ancestral stories, heritage maps, offspring predictions and genetic matches.", features: ["Heritage maps", "Ancestral stories", "Genetic matches", "Health blueprints", "Offspring predictor", "Lineage tree"], details: "Build a speculative heritage map from photos and family stories. AI generates ancestral narratives, predicts offspring traits, surfaces genetic-style matches with other users and creates health-blueprint guidance. Entertainment, not medical.", pricing: "Heritage map 10 credits • Offspring predictor 8 credits", capabilities: ["AI heritage map", "Ancestral story generator", "Offspring trait prediction", "Genetic-style matching", "Family tree builder", "Health blueprint guidance", "Photo morph tools", "Shareable lineage card"] },
      { path: "/reincarnation-social", title: "Reincarnation Social", icon: Sparkles, blurb: "Soulmate matching, regressions and karmic debt resolution.", features: ["Soulmate matching", "Past-life regressions", "Karmic debt", "Soul origin", "Group regressions", "Lifetime threads"], details: "Match with other users by soul-signature compatibility. Run solo or group regression sessions, resolve karmic debts together and trace soul-origin lineages. Cinematic shareable cards for every reading.", pricing: "Soul match 8 credits • Regression session 12 credits", capabilities: ["Soul-signature compatibility", "Solo regression sessions", "Group regression rooms", "Karmic debt resolver", "Soul origin tracer", "Lifetime story threads", "Soulmate chat", "Cinematic share cards"] },
      { path: "/blockchain-confessions", title: "Blockchain Confessions", icon: Scale, blurb: "Anonymous confessions with absolution voting and tokens.", features: ["Anonymous posting", "Absolution voting", "Tokens", "Buy & redeem", "Themed confession rooms", "Reputation ledger"], details: "Post fully anonymous confessions to themed rooms. Community votes absolution or condemnation; passed confessions earn redemption tokens. All entries are hash-stamped for immutability. Tokens redeemable for premium readings.", pricing: "Free to post • Tokens cost 5-50 credits • Premium rooms 10 credits", capabilities: ["Fully anonymous posting", "Hash-stamped immutability", "Absolution voting", "Redemption tokens", "Themed confession rooms", "Reputation ledger", "Premium VIP rooms", "Token redemption store"] },
      { path: "/multiverse-network", title: "Multiverse Network", icon: Globe, blurb: "Build parallel-universe profiles and explore alternate timelines.", features: ["Parallel profiles", "Universe builder", "Cross-reality reveals", "Subscriptions", "Timeline forks", "Alternate selves chat"], details: "Create multiple alternate-reality versions of yourself — different careers, partners, choices. Connect with other multiverse profiles, run cross-reality reveals and chat with your alternate selves. Premium subscription unlocks unlimited universes.", pricing: "First 3 universes free • Premium: €9/mo unlimited", capabilities: ["Parallel profile builder", "Timeline forking tool", "Cross-reality reveals", "Alternate-self AI chat", "Universe gallery", "Cross-universe DMs", "Premium unlimited slots", "Shareable universe card"] },
      { path: "/quantum-social", title: "Quantum Social", icon: Zap, blurb: "AI Quantum Oracle, observer mode and quantum choice mechanics.", features: ["Quantum Oracle", "Observer mode (premium)", "Choice trees", "Subscriptions", "Probability lens", "Entanglement chat"], details: "Quantum-themed social experiments. Ask the Quantum Oracle yes/no questions with probability weights, observe other users in premium observer mode, build branching choice trees and entangle with another user for shared decisions.", pricing: "Oracle 2 credits/question • Observer €5/mo • Entanglement free", capabilities: ["Quantum Oracle questions", "Observer mode (premium)", "Choice tree builder", "Probability lens overlay", "Entanglement pairing", "Quantum dice roller", "Daily quantum journal", "Shareable probability cards"] },
      { path: "/time-capsule", title: "Time Capsule", icon: Clock, blurb: "Create capsules that open at a future date with messages, photos and videos.", features: ["Future open dates", "Media attachments", "Recipient lists", "Reminders", "Group capsules", "Public showcase"], details: "Seal letters, photos, videos and voice messages into capsules that unlock on a future date — birthdays, anniversaries, decades from now. Send to specific recipients or your future self. Group capsules let friends contribute together.", pricing: "Free up to 5 capsules • Premium €5/mo unlimited", capabilities: ["Text, photo, video, voice content", "Custom unlock date", "Recipient lists", "Group capsules", "Auto reminder emails", "Public showcase opt-in", "Capsule library archive", "Premium unlimited slots"] },
      { path: "/time-reversal", title: "Time Reversal", icon: Clock, blurb: "Age backwards, lock ages, glimpse the future. Premium time-manipulation features.", features: ["Time travel speed", "Age locks", "Future glimpse", "Paradox posts", "Memory restoration", "Reverse timeline"], details: "Visual time-manipulation experiments on your profile. Age your photos backwards, lock your displayed age, glimpse AI-generated future versions of yourself and post paradox content to a reverse timeline. Pure entertainment.", pricing: "Premium €7/mo • Per-glimpse 8 credits", capabilities: ["Photo age reversal", "Profile age lock", "Future face glimpse", "Paradox post timeline", "Memory restoration tool", "Reverse-order feed", "Time speed controls", "Premium unlimited usage"] },
      { path: "/holographic-avatars", title: "Holographic Avatars", icon: Sparkles, blurb: "Create autonomous 3D AI avatars that evolve, battle and breed.", features: ["Avatar creator", "PvP battles", "Breeding", "Marketplace", "Evolution stages", "AI autonomy"], details: "Design 3D holographic avatars with unique traits, voices and personalities. They evolve over time, battle other avatars in PvP arenas, breed to create offspring with mixed traits and can be sold on the marketplace. Powered by Three.js.", pricing: "Creation 15 credits • Battle entry 3 credits • Marketplace 15% commission", capabilities: ["3D avatar customizer", "Trait & personality builder", "PvP battle arena", "Breeding system", "Evolution stages", "Marketplace for trading", "AI autonomous behavior", "Avatar diary"] },
    ],
  },
  {
    id: "ai-tools",
    title: "AI Tools & Studios",
    icon: Cpu,
    accent: "text-cyan-500",
    intro: "Pay-per-use AI tools — every credit is yours, no subscription required.",
    sections: [
      { path: "/ai-mentor", title: "AI Personal Mentor", icon: Brain, blurb: "Goals, habits, CBT programs, smart milestones and roleplay coaching.", features: ["SMART goals", "Habit tracking", "CBT programs", "Personality assessment", "Roleplay coaching", "Progress dashboards"], details: "A long-term personal mentor that remembers your goals and growth. SMART-goal wizard, daily habit tracker, evidence-based CBT programs for anxiety/confidence/focus, personality assessments and roleplay scenarios for difficult conversations.", pricing: "5 credits per deep session • Daily check-in free", capabilities: ["SMART goal wizard", "Daily habit tracker", "Streak rewards", "CBT modules (anxiety/focus/confidence)", "Big-5 personality assessment", "Roleplay difficult conversations", "Weekly progress dashboard", "Crisis routing"] },
      { path: "/content-studio", title: "Content Studio", icon: PenTool, blurb: "Posts, captions, scripts, SEO outlines and ad copy in one studio.", features: ["Social posts", "Ad scripts", "SEO outlines", "Brand voice", "Caption generator", "Multi-platform export"], details: "One studio for every text format — social posts, captions, video scripts, blog outlines with SEO keywords, email drafts and ad copy. Train a custom brand voice from your existing content and reuse it across every generation.", pricing: "3-8 credits per generation depending on length", capabilities: ["Social post generator", "Video script writer", "SEO blog outlines", "Email & newsletter drafts", "Ad copy with hooks", "Brand voice training", "Multi-platform export", "Saved templates library"] },
      { path: "/creative-forge", title: "CreativeForge", icon: PenTool, blurb: "AI writing studio with co-writer rooms, story bible and content scoring.", features: ["Co-writer rooms", "Story bible", "Brand voices", "Content scoring", "Plot beats", "Character profiles"], details: "Long-form writing studio for novels, screenplays and serial fiction. Co-writer rooms let humans and AI write together in real time. Story bible keeps characters, locations and plot beats consistent. AI content scoring grades clarity, pace and originality.", pricing: "Co-writer 5 credits/session • Scoring 3 credits/chapter", capabilities: ["Real-time co-writer rooms", "Story bible (chars/locations/lore)", "Plot beat planner", "Character relationship maps", "Content quality scoring", "Brand voice training", "Export to manuscript/script format", "Version history"] },
      { path: "/ai-generation", title: "AI Image Generation", icon: ImageIcon, blurb: "Premium AI images with style controls. Pay per image, own your output.", features: ["Style controls", "Prompt history", "Community gallery", "Commercial license", "Upscaling", "Variations"], details: "Premium image generation with fine-grained style controls — photo, illustration, anime, oil paint, 3D render. Every output is yours with commercial license. Upscale to 4K, generate variations, save prompts to history and showcase in the community gallery.", pricing: "5 credits per image • Upscale +3 credits", capabilities: ["8+ style presets", "Prompt history library", "4K upscaling", "Variation generator", "Community gallery", "Commercial license included", "Negative prompt support", "Aspect ratio controls"] },
      { path: "/analyzer", title: "Universal Analyzer", icon: Search, blurb: "Analyze anything — images, documents, audio — into actionable insights.", features: ["Multi-modal input", "Chat with results", "Collections", "Credit-based", "Document OCR", "Audio transcription"], details: "Drop in any image, document, PDF, audio file or URL — get an AI analysis with extracted text, summary, key insights and follow-up chat. Group analyses into collections for research projects. Supports OCR, audio transcription and chart reading.", pricing: "5-10 credits per analysis depending on complexity", capabilities: ["Image analysis", "Document/PDF OCR", "Audio transcription", "URL content analysis", "Chart & graph reading", "Follow-up chat with results", "Collections for projects", "Export reports as PDF"] },
      { path: "/video-ad-generator", title: "Video Ad Generator", icon: Video, blurb: "Generate full video ads with script, voiceover and visuals.", features: ["Scripted ads", "Voice synthesis", "Templates", "Export-ready", "Multi-aspect ratio", "Music library"], details: "Generate complete short video ads from a single product description. AI writes the script, picks visuals, generates voiceover, syncs background music and exports vertical (9:16), square (1:1) and horizontal (16:9) versions ready for any platform.", pricing: "25 credits per full ad generation", capabilities: ["AI script writer", "AI voiceover (multiple voices)", "Stock visuals + AI-generated b-roll", "Music library with sync", "Multi-aspect export", "Template gallery", "Brand kit integration", "Re-generation per scene"] },
      { path: "/ai-tattoo", title: "AI Tattoo Designer", icon: ImageIcon, blurb: "Studio-quality tattoo concepts from a prompt.", features: ["8 credits per design", "Save favorites", "Style packs", "Artist-ready exports", "Body preview", "Variation generator"], details: "Generate detailed tattoo concepts in any style — traditional, fine line, geometric, watercolor, blackwork. Preview on a body, generate variations, save to favorites and export artist-ready high-resolution files with clean line work.", pricing: "8 credits per design • Variations +3 credits", capabilities: ["10+ tattoo style packs", "Body placement preview", "High-res artist export", "Variation generator", "Save to favorites", "Color & black-grey toggle", "Size preview", "Inspiration gallery"] },
      { path: "/ai-clone", title: "AI Personality Clone", icon: Bot, blurb: "Train an AI that talks like you — chat, dating, export.", features: ["Personality training", "Clone battles", "Dating sessions", "Exports", "Voice cloning", "Public/private modes"], details: "Train an AI that mimics your personality from chats, posts and answers to deep prompts. Use it for clone-vs-clone battles, dating roleplays, social experiments or just to see yourself talk. Voice cloning optional. Export full clone profile.", pricing: "Training 15 credits • Voice clone 20 credits • Battle 3 credits", capabilities: ["Personality questionnaire", "Voice cloning", "Clone vs clone battles", "Dating roleplay sessions", "Public clone gallery", "Private mode", "Personality export", "Clone evolution over time"] },
      { path: "/pet-translator", title: "Pet Translator", icon: PawPrint, blurb: "AI translation of pet sounds and body language.", features: ["Sound analysis", "Symptom logger", "Trends", "Pet profiles", "Body language scan", "Vet referrals"], details: "Record your pet's vocalizations or upload a photo of their body language — AI returns probable meaning and emotional state. Log over time to spot symptoms, build pet profiles, get vet referral suggestions when patterns suggest health issues.", pricing: "3 credits per translation • Health report 8 credits", capabilities: ["Sound recording & analysis", "Body language photo scan", "Symptom trend logger", "Multiple pet profiles", "Vet referral suggestions", "Behavioral pattern reports", "Shareable translations", "Species library (dog/cat/bird/rodent)"] },
      { path: "/handwriting", title: "Handwriting Analyzer", icon: PenTool, blurb: "Personality and trait analysis from handwriting samples.", features: ["Forensic profiles", "Health screens", "Twin profiles", "PDF reports", "Compatibility match", "Historical comparisons"], details: "Upload a handwriting sample to get graphological personality analysis, possible health markers, compatibility with another sample and forensic-style trait breakdowns. Compare with famous historical handwritings. Export full PDF report.", pricing: "5 credits per analysis • PDF report +3 credits", capabilities: ["Personality trait analysis", "Health marker screen", "Handwriting compatibility", "Forensic profile", "Twin handwriting compare", "Historical figure comparison", "PDF export", "Sample library"] },
      { path: "/future-face", title: "Future Face", icon: Clock, blurb: "Age-progressed photos with routine logging and skin scores.", features: ["Age progression", "Skin scores", "Routine logger", "Comparisons", "Lifestyle simulator", "5/10/20yr projections"], details: "See yourself in 5, 10, 20, 40 years with AI-aged photos that factor in lifestyle (smoking, sun, sleep, diet). Log your skincare routine, get daily skin scores from selfies and compare different lifestyle paths side by side.", pricing: "8 credits per age projection • Daily skin score 1 credit", capabilities: ["Age 5/10/20/40 year projection", "Lifestyle factor inputs", "Daily skin score from selfie", "Routine logger", "Side-by-side comparisons", "Improvement suggestions", "Progress timeline", "Shareable cards"] },
      { path: "/photo-restoration", title: "Photo Restoration", icon: ImageIcon, blurb: "Restore scratched, faded and torn photos in minutes.", features: ["AI restoration", "Color recovery", "Resolution boost", "Batch upload", "Face enhancement", "Background repair"], details: "Restore damaged family photos — remove scratches, repair tears, recover faded color, boost resolution to 4K and enhance faces. Batch upload an entire album in one go. Original always preserved.", pricing: "10 credits per photo • Batch discount available", capabilities: ["Scratch & tear removal", "Color recovery for B&W or faded", "4K resolution boost", "Face enhancement (eyes/skin)", "Background repair", "Batch upload up to 50", "Side-by-side preview", "Download original + restored"] },
      { path: "/ai-experiences", title: "AI Experiences", icon: Plane, blurb: "Virtual tours and age progression — paid AI experiences.", features: ["Virtual tours", "Age progression", "Per-action credits", "Stored history", "Time travel scenes", "Historical events"], details: "Curated AI-generated experiences — walk virtually through ancient Rome, meet historical figures, age progression simulations, dream scenarios. Each experience is interactive with branching choices.", pricing: "10-20 credits per experience", capabilities: ["Virtual location tours", "Historical figure meetings", "Age progression scenarios", "Branching choices", "Stored experience history", "Shareable highlights", "Curated collection updates", "Custom prompt experiences"] },
      { path: "/home-designer", title: "Home Designer", icon: Home, blurb: "Redesign any room from a photo with AI staging.", features: ["Room makeovers", "Color palettes", "Furniture recs", "Virtual staging", "Style swap", "Shopping links"], details: "Upload a room photo, pick a style (Scandinavian, industrial, boho, etc.) and get an AI-redesigned version with furniture suggestions, color palettes and shopping links. Virtual staging for real estate listings. Save before/after comparisons.", pricing: "12 credits per room redesign", capabilities: ["20+ interior styles", "Furniture recommendations with links", "Color palette generator", "Virtual staging mode", "Before/after gallery", "Multiple variations per room", "Save & share boards", "Real estate watermark"] },
      { path: "/beauty-studio", title: "Beauty Studio", icon: Sparkles, blurb: "Hair, makeup and skin previews with celebrity matching.", features: ["Hair previews", "Nail designs", "Skin analyses", "Celeb matches", "Makeup looks", "Color season"], details: "Try on hairstyles, hair colors, nail designs and makeup looks before committing. AI skin analysis gives personalized skincare routines. Color-season analysis finds your most flattering palette. Celebrity look-alike matching with style breakdowns.", pricing: "5 credits per try-on • Skin analysis 8 credits", capabilities: ["Hairstyle & color try-on", "Nail design previews", "Makeup look try-on", "AI skin analysis", "Color season analysis", "Celebrity look-alike", "Save favorites", "Shareable transformations"] },
      { path: "/fashion-studio", title: "Fashion Studio", icon: Palette, blurb: "Design outfits, run style battles, shop AI-generated looks.", features: ["Outfit designer", "Style battles", "Marketplace", "OOTD", "Closet upload", "Trend reports"], details: "Design outfits from scratch with AI, mix and match from your uploaded closet, battle other users' looks, post daily OOTDs and shop AI-generated designs sent to print-on-demand partners. Weekly trend reports.", pricing: "Design 5 credits • Style battle 2 credits • Marketplace 15% commission", capabilities: ["AI outfit designer", "Upload your closet", "Style battles with voting", "Daily OOTD feed", "AI design marketplace", "POD partner integration", "Weekly trend reports", "Wardrobe analytics"] },
      { path: "/brand-builder", title: "Brand Builder", icon: Sparkles, blurb: "Generate full brand identity — logo, palette, voice, social kits.", features: ["Logo generator", "Voice guidelines", "Color systems", "Social kits", "Tagline generator", "Brand book PDF"], details: "Generate a complete brand identity in minutes — logo variations, color palette with usage rules, typography pairings, brand voice guidelines, social media kit and full brand book PDF. Iterate until it's perfect.", pricing: "30 credits for full brand kit • Individual assets from 5 credits", capabilities: ["Logo with variations", "Color system with usage rules", "Typography pairings", "Brand voice guidelines", "Tagline generator", "Social media kit (templates)", "Full brand book PDF export", "Iteration history"] },
      { path: "/wine-pairing", title: "Wine Pairing", icon: Sparkles, blurb: "AI pairs the perfect wine to any dish in seconds.", features: ["Dish-to-wine", "Region picks", "Price tiers", "Save favorites", "Cellar tracker", "Wine education"], details: "Tell AI what you're cooking — get 3 wine recommendations across price tiers with region, vintage and tasting notes. Track your home cellar, save favorites and learn about regions with built-in wine education.", pricing: "3 credits per pairing • Cellar tracking free", capabilities: ["Dish-to-wine pairing", "Region recommendations", "Price tier options", "Cellar tracker", "Favorites library", "Wine education modules", "Tasting note logger", "Shopping list export"] },
      { path: "/lie-detector", title: "Lie Detector", icon: Shield, blurb: "Voice, text, body-language and screenshot truth scoring. Entertainment only.", features: ["Voice heatmaps", "Body language", "Chat imports", "Detective ranks", "Screenshot analysis", "Multi-modal scoring"], details: "Entertainment-only truth scoring across multiple modalities. Voice tonality heatmaps, body-language analysis from video, chat screenshot pattern detection. Rank up as a detective by analyzing more samples. Not forensic-grade.", pricing: "5 credits per voice scan • 8 per video scan", capabilities: ["Voice stress heatmap", "Body language video scan", "Chat screenshot analysis", "Multi-modal combined score", "Detective rank progression", "Sample history", "Shareable verdicts", "Disclaimer-locked outputs"] },
      { path: "/stock-content-library", title: "Stock Content Library", icon: ImageIcon, blurb: "Royalty-free AI-generated images, videos and audio.", features: ["Curated packs", "Commercial license", "Collections", "Daily drops", "Search by mood", "Bulk download"], details: "A growing library of AI-generated stock content — images, short videos, audio loops — all with commercial license. New packs daily, curated by theme. Search by mood, color or subject. Bulk download discounts.", pricing: "Single asset 3-10 credits • Pack discounts available", capabilities: ["Image, video, audio library", "Commercial license on all assets", "Curated theme packs", "Daily new drops", "Search by mood/color/subject", "Bulk download discounts", "Save to collections", "Submit your own (with approval)"] },
      { path: "/virtual-influencer-agency", title: "Virtual Influencer Agency", icon: Crown, blurb: "Spin up an AI influencer, grow followers, monetize.", features: ["Persona builder", "Content calendar", "Brand deals", "Earnings", "Auto-posting", "Voice & video"], details: "Create a fully AI influencer with custom persona, looks and voice. Auto-generate content on schedule, grow followers organically, accept brand deal offers and track earnings — all from one dashboard.", pricing: "Persona 30 credits • Auto-posts 5 credits each • Brand deals 15% commission", capabilities: ["Persona & look builder", "Content calendar with auto-post", "Voice & video generation", "Brand deal marketplace", "Earnings dashboard", "Multi-platform export", "Engagement analytics", "Multiple influencer profiles"] },
    ],
  },
  {
    id: "health",
    title: "Health & Wellness",
    icon: Activity,
    accent: "text-emerald-500",
    intro: "Mental, physical and preventive health — coaches, scanners and trackers powered by AI.",
    sections: [
      { path: "/wellness", title: "Wellness & Relaxation", icon: Heart, blurb: "Guided meditations, breathing, soundscapes and mood journals.", features: ["Daily meditations", "Sleep sounds", "Mood logs", "Streaks", "Breathing exercises", "Gratitude journal"], details: "Daily guided meditations across themes (sleep, focus, anxiety, gratitude), 50+ sleep soundscapes, breathing exercises (4-7-8, box breathing), mood logging with weekly insights and streak rewards. New content weekly.", pricing: "Free starter content • Premium €7/mo unlimited", capabilities: ["Daily guided meditations", "50+ sleep soundscapes", "Breathing exercises", "Mood journal", "Weekly insight reports", "Streak rewards", "Gratitude journal", "Offline download (premium)"] },
      { path: "/psychologist", title: "AI Psychologist", icon: Brain, blurb: "Conversational sessions, CBT exercises and crisis routing.", features: ["AI sessions", "CBT modules", "Crisis safety", "Session history", "Mood tracking", "Coping toolkits"], details: "Conversational therapy-style sessions with an AI trained on CBT, ACT and mindfulness frameworks. Structured modules for anxiety, depression, grief, relationships. Crisis content always routes to real human helplines. Not a replacement for professional therapy.", pricing: "10 credits per session • Crisis routing always free", capabilities: ["Conversational AI sessions", "CBT/ACT structured modules", "Crisis safety routing", "Session history & insights", "Mood tracking integration", "Coping toolkits", "Therapist referral resources", "Privacy-locked transcripts"] },
      { path: "/first-aid", title: "First Aid", icon: Activity, blurb: "Step-by-step first-aid guides and emergency contacts.", features: ["Symptom guides", "Emergency contacts", "Offline mode", "Family setup", "Video walkthroughs", "Local emergency numbers"], details: "Evidence-based first-aid guides for common emergencies — CPR, choking, burns, fractures, allergic reactions. Step-by-step with video. Stores local emergency numbers by country. Offline mode for when signal is gone. Family setup shares contacts.", pricing: "Free", capabilities: ["20+ emergency guides", "Step-by-step video walkthroughs", "Local emergency numbers", "Offline mode", "Family shared contacts", "Allergy & medication records", "Symptom decision trees", "First-aid checklist generator"] },
      { path: "/fit-slim", title: "Fit & Slim", icon: Apple, blurb: "AI workout plans, calorie tracking and weight goals.", features: ["AI workouts", "Calorie quests", "Macro tracking", "Goal coach", "Photo food log", "Progress photos"], details: "Personalized workout plans built from your goals, equipment and time. Calorie quests gamify tracking. Photo food log uses AI to estimate calories and macros. Weekly progress photos with body composition analysis.", pricing: "10 credits per workout plan • Daily tracking free", capabilities: ["AI-generated workout plans", "Calorie quest gamification", "Macro tracking", "Photo food log", "Progress photos with AI analysis", "Goal coaching", "Equipment-based filtering", "Wearable sync (planned)"] },
      { path: "/nutrition-hub", title: "Nutrition Hub", icon: Apple, blurb: "Recipes, meal plans, ingredient scanner and dietary subscriptions.", features: ["Meal plans", "Ingredient scanner", "Recipes", "Subscriptions", "Allergen alerts", "Shopping lists"], details: "AI-generated weekly meal plans tailored to your diet (vegan, keto, mediterranean, etc.). Scan barcodes or photos of ingredients to get nutritional info. Recipe library with auto-generated shopping lists. Subscriptions unlock personalized macros and chef-curated plans.", pricing: "Meal plan 8 credits • Scanner 2 credits • Premium €9/mo", capabilities: ["AI weekly meal plans", "Barcode & photo ingredient scanner", "Recipe library 1000+", "Auto shopping lists", "Allergen alerts", "Dietary filters", "Premium chef plans", "Macro targets"] },
      { path: "/phobia-trading", title: "Phobia Trading", icon: Brain, blurb: "Treat phobias in tiers, track progress, trade success stories.", features: ["Phobia treatments", "Progress tracking", "Trades", "Subscriptions", "Exposure modules", "Community support"], details: "Tiered phobia treatment programs combining CBT, gradual exposure and visualization. Track progress across sessions, trade success stories with others, join community support groups. Premium tier includes 1:1 AI coaching.", pricing: "Per-tier 15-40 credits • Premium €12/mo", capabilities: ["10+ phobia treatment tracks", "Gradual exposure modules", "Progress dashboard", "Success story sharing", "Community support groups", "Premium AI coaching", "Crisis safety routing", "Therapist referrals"] },
      { path: "/safety-prevention", title: "Safety & Prevention", icon: Shield, blurb: "Bullying prevention, online safety education and reporting.", features: ["Safety library", "Reports", "Family setup", "Resources", "Bullying detection", "Privacy tools"], details: "Education and tools for online safety — bullying detection in chats, privacy hardening guides, family setup for kids and teens, and report flow for incidents. Resources for victims include legal contacts and crisis lines.", pricing: "Free", capabilities: ["Bullying detection in DMs", "Privacy hardening guide", "Family safety setup", "Incident reporting flow", "Resource library", "Legal contact directory", "Crisis line directory", "Age-gated content controls"] },
    ],
  },
  {
    id: "sports",
    title: "Sports Arenas",
    icon: Trophy,
    accent: "text-amber-500",
    intro: "Fantasy leagues for every major sport plus original PvP arenas.",
    sections: [
      { path: "/character-arena", title: "Character Arena", icon: Trophy, blurb: "PvP between created characters with battles, votes and evolution.", features: ["Battles", "Evolution", "Votes", "Posts", "Character creation", "Leaderboards"], details: "Create original characters with stats, lore and backstories. Battle them PvP against other users — community votes decide winners. Characters evolve through wins, unlock new abilities, and become tradeable assets. Weekly tournaments.", pricing: "Battle entry 3 credits • Character creation free", capabilities: ["Character creator with stats", "PvP battles with voting", "Evolution through wins", "Posts and lore building", "Weekly tournaments", "Trading marketplace (planned)", "Leaderboards", "Battle replays"] },
      { path: "/horse-racing", title: "Horse Racing Arena", icon: Trophy, blurb: "Train horses, race, buy currency, list on the market.", features: ["Training", "Races", "Marketplace", "Currency", "Breeding", "Stables"], details: "Buy, train and race virtual horses. Build a stable, breed for traits, race in scheduled events with payouts in arena currency. Marketplace lets you buy and sell horses. Premium stables unlock training boosts.", pricing: "Currency packs €5-50 • Marketplace 10% commission", capabilities: ["Training stat system", "Scheduled races with payouts", "Breeding for trait inheritance", "Marketplace for horses", "Stable management", "Premium boosts", "Race replays", "Leaderboards"] },
      { path: "/football-arena", title: "Football Arena", icon: Trophy, blurb: "Manage teams, leagues, transfers, equipment and stadiums.", features: ["Leagues", "Transfers", "Equipment", "Stadiums", "Tactics board", "Live match sims"], details: "Manager-style football fantasy. Build your squad, negotiate transfers, upgrade your stadium and equipment, set tactics and watch live match simulations. Compete in leagues with promotions and relegations.", pricing: "Free to play • Equipment & stadium upgrades in credits", capabilities: ["Squad management", "Transfer negotiations", "Stadium upgrades", "Equipment shop", "Tactics board", "Live match simulations", "Promotion/relegation leagues", "Player development"] },
      { path: "/basketball-arena", title: "Basketball Arena", icon: Trophy, blurb: "Full basketball management — players, matches, standings.", features: ["Players", "Matches", "Standings", "Training", "Plays library", "Awards"], details: "Full basketball management — recruit and develop players, design plays, manage rosters, play through full seasons with standings and playoffs. Awards for MVP, coach of the year, etc.", pricing: "Free to play • Premium plays & boosts in credits", capabilities: ["Roster management", "Player development", "Play designer", "Full season simulation", "Standings & playoffs", "Awards system", "Trade negotiations", "Stat tracking"] },
      { path: "/hockey-arena", title: "Hockey Arena", icon: Trophy, blurb: "Hockey leagues with deep team management.", features: ["Leagues", "Teams", "Players", "Equipment", "Line management", "Trades"], details: "Manage hockey teams through full seasons — lines, power plays, goalie rotation, trade deadlines, drafts. Equipment shop for gear that boosts stats. Multiple league levels.", pricing: "Free to play • Equipment & boosts in credits", capabilities: ["Line management", "Power play setup", "Goalie rotation", "Trade deadlines", "Drafts", "Equipment shop", "Multi-level leagues", "Stat tracking"] },
      { path: "/tennis-arena", title: "Tennis Arena", icon: Trophy, blurb: "Tennis tournaments and player progression.", features: ["Tournaments", "Player growth", "Rankings", "Matches", "Grand slams", "Doubles"], details: "Run a tennis career — train your player, enter tournaments from local to Grand Slam, climb the rankings. Doubles partnerships with other users. Surface specialization (clay/grass/hard).", pricing: "Free to play • Entry fees for premium tournaments in credits", capabilities: ["Player progression", "Tournament ladder", "Grand Slam events", "Doubles partnerships", "Surface specialization", "Live rankings", "Match replays", "Coaching"] },
      { path: "/american-football-arena", title: "American Football", icon: Trophy, blurb: "Full NFL-style fantasy with transfers and training.", features: ["Teams", "Leagues", "Transfers", "Stadiums", "Playbook designer", "Drafts"], details: "Full NFL-style management — draft players, design playbooks, manage cap space, build stadiums, compete through regular season and playoffs to a championship.", pricing: "Free to play • Premium playbooks & boosts in credits", capabilities: ["NFL-style drafts", "Playbook designer", "Cap space management", "Stadium upgrades", "Regular season + playoffs", "Championship payout", "Trade deadline", "Stat tracking"] },
      { path: "/gp-racing", title: "GP Fantasy Racing", icon: Car, blurb: "Build cars, fantasy teams, races and subscriptions.", features: ["Car builder", "Fantasy teams", "Races", "Leaderboard", "Pit strategy", "Driver development"], details: "Build GP-style cars, manage two-driver teams, set pit strategy, race through a full calendar of Grand Prix events. Subscriptions unlock advanced telemetry and engineering tools.", pricing: "Free to play • Premium €9/mo for engineering tools", capabilities: ["Car builder with components", "Two-driver teams", "Pit strategy", "Full season calendar", "Driver development", "Premium telemetry", "Engineering tools", "Live leaderboards"] },
    ],
  },
  {
    id: "entertainment",
    title: "Entertainment & Lifestyle",
    icon: Music,
    accent: "text-rose-500",
    intro: "Live shows, virtual pets, mystery boxes, escape rooms — daily fun and creator economy.",
    sections: [
      { path: "/shadow-arena", title: "Shadow Arena", icon: Ghost, blurb: "Horror & dark-content platform with battles and clips.", features: ["Horror clips", "Voting", "Earnings", "Subscriptions", "Creator monetization", "Age-gated 18+"], details: "Horror and dark-content creator platform. Post short horror clips, stories and experiments. Community votes; top creators earn from subscriptions, tips and ad revenue share. Strict 18+ age gate.", pricing: "Free to watch • Creator monetization 85/15 split • Subscriptions vary", capabilities: ["Short horror clip uploads", "Community voting", "Creator subscriptions", "Tips & gifts", "Strict 18+ age gate", "Content warning labels", "Moderation pipeline", "Top creator leaderboard"] },
      { path: "/live-concerts", title: "Live Concerts", icon: Music, blurb: "Buy tickets, tip artists, request songs and join recordings.", features: ["Ticket types", "Song requests", "Gifts", "Recordings", "Backstage chat", "VIP meet & greet"], details: "Live and recorded concerts from artists on the platform. Buy general or VIP tickets, send tips and gifts during the show, request songs from the queue, join backstage chat. Recordings stay available after the event.", pricing: "Ticket prices vary • Platform 20% • Tips/requests free to send", capabilities: ["Ticket tiers (general/VIP)", "Live song request queue", "Tips & gifts in stream", "Backstage chat", "VIP meet & greet rooms", "Post-event recordings", "Multi-camera angles", "Setlist preview"] },
      
      { path: "/comedy-club", title: "Comedy Club", icon: Mic2, blurb: "Stand-up shows with tickets, tips, gifts and open mics.", features: ["Live shows", "Open mics", "Tips", "Battles", "Joke library", "Comedian profiles"], details: "Live stand-up comedy platform. Buy tickets for headliners, attend open mic nights for free, tip and gift comedians, vote in comedy battles. Comedians build profiles and grow followers.", pricing: "Tickets vary • Platform 20% • Open mic free", capabilities: ["Live ticketed shows", "Free open mic nights", "Tips & gifts", "Comedy battles", "Joke library", "Comedian profiles", "Followers", "Replay archive"] },
      { path: "/masterchef-subscription", title: "KitchenStars Arena", icon: ChefHat, blurb: "Cooking competition with weekly awards, live streams and votes.", features: ["Competitions", "Live cooking", "Awards", "Recipe posts", "Judging panel", "Subscription perks"], details: "Cooking competition platform with weekly themed challenges, live cook-along streams, recipe posting and community judging. Top chefs win cash awards and unlock master tier. Subscriptions unlock premium recipes and master classes.", pricing: "Subscription €9/mo • Tips to chefs share 85/15", capabilities: ["Weekly themed challenges", "Live cook-along streams", "Recipe library", "Community + expert judging", "Cash awards for winners", "Master class subscriptions", "Chef profiles & followers", "Tips & gifts"] },
      { path: "/glamour-world", title: "Glamour World", icon: Crown, blurb: "Style your pets, create glamour stories and earn coins.", features: ["Pet glamour", "Stories", "Creations", "Coins", "Daily contests", "Fashion library"], details: "Style virtual or real pets in glamour outfits, create photo stories, enter daily contests for coins. Build pet wardrobes, share looks, collaborate with other pet creators. Coins redeemable for premium content.", pricing: "Free • Premium outfits 3-10 credits", capabilities: ["Pet outfit designer", "Glamour story creator", "Daily themed contests", "Coin economy", "Fashion library", "Pet wardrobes", "Creator collabs", "Featured spotlight"] },
      { path: "/comedy-club", title: "Comedy Club", icon: Mic2, blurb: "Stand-up shows with tickets, tips, gifts and open mics.", features: ["Live shows", "Open mics", "Tips", "Battles", "Joke library", "Comedian profiles"], details: "Live stand-up comedy platform. Buy tickets for headliners, attend open mic nights for free, tip and gift comedians, vote in comedy battles. Comedians build profiles and grow followers.", pricing: "Tickets vary • Platform 15% • Open mic free", capabilities: ["Live ticketed shows", "Free open mic nights", "Tips & gifts", "Comedy battles", "Joke library", "Comedian profiles", "Followers", "Replay archive"] },
      { path: "/influ-king", title: "Influ-King", icon: Star, blurb: "Influencer ladder — content, tips, subscriptions and gifts.", features: ["Tip jar", "Subscriptions", "Gifts", "Withdrawals", "Engagement metrics", "Sponsorships"], details: "Influencer ladder where creators climb through engagement metrics. Monetize through tip jars, paid subscriptions, virtual gifts and brand sponsorships matched to your niche. Direct Stripe Connect withdrawals.", pricing: "Tips/gifts 10% platform • Subscriptions 85/15 split", capabilities: ["Tip jar (10% commission)", "Subscription tiers", "Virtual gifts shop", "Brand sponsorship matching", "Engagement leaderboard", "Stripe Connect payouts", "Audience analytics", "Ladder ranking"] },
      { path: "/virtual-escape-room", title: "Virtual Escape Room", icon: Lock, blurb: "Solve puzzle rooms, earn rewards, climb leaderboards.", features: ["Puzzles", "Challenges", "Leaderboard", "Subscriptions", "Multiplayer rooms", "Daily new room"], details: "Puzzle escape rooms with cinematic art and AI-driven storylines. Solo or multiplayer (up to 6). Daily new room releases, leaderboards by completion time, subscription unlocks all rooms.", pricing: "Single room 5 credits • Premium €7/mo unlimited", capabilities: ["Cinematic puzzle rooms", "Solo or multiplayer up to 6", "Daily new room releases", "Leaderboards by time", "Premium unlimited access", "Hint system", "Achievement badges", "Community puzzle submissions"] },
      { path: "/mystery-box", title: "Mystery Box", icon: Gift, blurb: "Surprise boxes with rewards, mystery items and badges.", features: ["Boxes", "Rewards", "Mystery badges", "Events", "Tier system", "Trading"], details: "Buy mystery boxes with surprise rewards — credits, AI tools, badges, exclusive content, real items shipped (for premium boxes). Tier system from common to legendary. Trade items with friends.", pricing: "Boxes from 5-100 credits • Premium boxes include shipped items", capabilities: ["Multiple box tiers", "Surprise rewards", "Item trading", "Mystery badges", "Limited-time event boxes", "Real-item premium boxes (shipped)", "Collection tracking", "Drop rate transparency"] },
      { path: "/secret-santa", title: "Social Gifts Hub", icon: Gift, blurb: "Send gifts, run secret santa and group exchanges.", features: ["Gift sending", "Secret santa", "Group exchanges", "Wishlist", "Anonymous gifting", "Reminders"], details: "Send virtual or real gifts to friends. Organize secret santa for groups with automatic pairing, gift exchanges with budget limits, wishlists you can share publicly. Anonymous gifting option.", pricing: "Virtual gifts 1-20 credits • Real gifts shipping fees apply", capabilities: ["Direct gift sending", "Secret santa organizer", "Group gift exchanges", "Wishlist sharing", "Anonymous mode", "Budget enforcement", "Auto reminders", "Delivery tracking"] },
      { path: "/vacationer", title: "Vacationer", icon: Plane, blurb: "Travel planning with destinations, reviews and photos.", features: ["Destinations", "Reviews", "Photo gallery", "Plans", "AI itinerary", "Budget calculator"], details: "Plan trips with AI-generated itineraries, browse destinations with community reviews and photos, calculate budgets including flights/hotels/food. Share trip plans with friends and collaborate.", pricing: "AI itinerary 10 credits • Browsing free", capabilities: ["AI-generated itineraries", "Destination directory", "Community reviews & photos", "Budget calculator", "Collaborative trip planning", "Flight & hotel links", "Packing lists", "Trip journal"] },
      { path: "/cooking", title: "Cooking Hub", icon: ChefHat, blurb: "AI recipes, chef chat, meal plans and scanner.", features: ["AI recipes", "Chef chat", "Meal plans", "Scanner", "Pantry tracking", "Video tutorials"], details: "Generate recipes from ingredients you have, chat with an AI chef for technique questions, build weekly meal plans, scan pantry items to track inventory. Video tutorials for cooking techniques.", pricing: "AI recipe 3 credits • Meal plan 8 credits • Chef chat 2 credits/session", capabilities: ["AI recipe generation from ingredients", "AI chef chat", "Weekly meal plans", "Pantry scanner", "Inventory tracking", "Video technique tutorials", "Save & share recipes", "Dietary filters"] },
      { path: "/coffee", title: "Coffee Community", icon: Coffee, blurb: "Cafe check-ins, ratings, dating events and reviews.", features: ["Cafe check-ins", "Reviews", "Events", "Matches", "Roast library", "Brewing guides"], details: "Coffee enthusiast community. Check in at cafes, leave reviews, browse roast library, follow brewing guides. Coffee dating events match people over shared coffee preferences in local cafes.", pricing: "Free • Premium roast guides 3 credits", capabilities: ["Cafe check-in with map", "Review system", "Roast library", "Brewing guides", "Coffee dating events", "Local meetups", "Preference matching", "Photo gallery"] },
      { path: "/virtual-pet", title: "Virtual Pet", icon: PawPrint, blurb: "Adopt, feed, train and breed virtual pets with mini-games.", features: ["Pet care", "Mini-games", "Breeding", "Battles", "Customization", "Pet shop"], details: "Adopt and raise virtual pets — feed, train, play mini-games, breed for unique offspring, battle other pets. Customize appearances, buy accessories in the pet shop, build a lasting bond. Pets evolve over time.", pricing: "Free starter pet • Premium pets & shop items in credits", capabilities: ["Multiple pet species", "Care mechanics (feed/play/train)", "Mini-games for XP", "Breeding system", "PvP battles", "Customization & accessories", "Pet shop", "Evolution stages"] },
    ],
  },
  {
    id: "marketplaces",
    title: "Marketplaces & Commerce",
    icon: Store,
    accent: "text-blue-500",
    intro: "Buy, sell and auction everything — properties, skills, coupons, antiques and collectibles. Every sale flows through Stripe Connect with automatic platform commission deducted at the transaction level so scaling to millions of orders just works.",
    sections: [
      {
        path: "/property-marketplace", title: "Property Marketplace", icon: Building2,
        blurb: "List, browse and favorite properties with submissions and verification.",
        features: ["Listings", "Favorites", "Submissions", "Verified sellers", "Photo galleries", "Map search"],
        details: "Full real-estate marketplace for residential, commercial and land listings. Sellers go through Stripe Connect onboarding before they can publish. Buyers browse by location, price, type, save favorites, contact sellers directly. Verified seller badges and AI-assisted listing descriptions.",
        pricing: "Listing fee 20 credits • Featured boost 50 credits • Platform commission applies on successful sale",
        capabilities: ["Residential, commercial, land categories", "Photo gallery up to 30 images", "Map-based search", "Save favorites", "Direct seller contact", "Verified seller badges", "AI listing description writer", "Featured boost slots", "Stripe Connect required to list", "Submission moderation queue"],
      },
      {
        path: "/marketplace", title: "Skills Marketplace", icon: Briefcase,
        blurb: "Hire freelancers or sell skills with responses and subscriptions.",
        features: ["Skill listings", "Responses", "Notifications", "Subscriptions", "Portfolio uploads", "Reviews"],
        details: "Hire freelancers or sell your skills — design, writing, coding, marketing, voice, music, more. Sellers need Stripe Connect to list. Buyers post requests; sellers respond with quotes. Escrow holds payment until delivery confirmation. Star reviews build seller reputation.",
        pricing: "Listing free • 10% platform commission per completed gig",
        capabilities: ["Skill listings with packages", "Buyer request board", "Quote responses", "Escrow on every order", "Portfolio uploads", "Star reviews", "Subscription gigs (recurring)", "Notification center", "Stripe Connect required", "Dispute resolution"],
      },
      {
        path: "/skill-swap", title: "Global Skill Swap", icon: Globe,
        blurb: "Trade skills 1:1 globally — no money, just exchange.",
        features: ["Skill profiles", "Matching", "Settings", "Worldwide", "Time bank", "Video sessions"],
        details: "Pure barter — trade skills with anyone in the world without money. Set what you offer and what you want, AI matches you with complementary partners. Time-bank tracks fair exchange. Video sessions built in.",
        pricing: "Free — no money exchanged",
        capabilities: ["Offer/want skill profiles", "AI matching algorithm", "Time bank tracking", "Built-in video sessions", "Cross-timezone scheduling", "Review system", "Worldwide reach", "Multi-language matching"],
      },
      {
        path: "/bazaar", title: "Bazaar", icon: Store,
        blurb: "Marketplace with escrow, disputes, reviews and ratings.",
        features: ["Escrow protection", "Disputes", "Seller ratings", "Saved searches", "Category filters", "Local pickup"],
        details: "General marketplace for new and used goods. Sellers complete Stripe Connect onboarding before listing. Every transaction is an escrow destination charge — Stripe deducts the platform commission and routes the remainder to the seller atomically. Buyer protection includes dispute resolution and refunds.",
        pricing: "Listing free • 10% platform commission auto-deducted by Stripe • Featured listings in credits",
        capabilities: ["Stripe Connect required to sell", "Escrow on every order via destination charge", "Automatic commission deduction at Stripe level", "Buyer dispute resolution", "Star reviews + seller ratings", "Saved searches with alerts", "Category & condition filters", "Local pickup or shipping", "Photo galleries", "Daily reconciliation cron", "Indexed for million+ orders"],
      },
      {
        path: "/coupon-marketplace", title: "Coupon Marketplace", icon: Ticket,
        blurb: "Buy and sell verified coupons with cashback and battles.",
        features: ["Verified coupons", "Cashback", "Coupon battles", "Wishlist", "Brand directory", "Expiry alerts"],
        details: "Buy and sell verified discount coupons for major brands. AI verification reduces fraud. Cashback rewards on every purchase. Coupon battles let users vote on best deals. Wishlist with expiry alerts. Sellers need Stripe Connect.",
        pricing: "Listing free • 10% commission on sold coupons • Cashback funded from commission pool",
        capabilities: ["AI coupon verification", "Cashback on purchases", "Coupon battles with voting", "Wishlist & expiry alerts", "Brand directory", "Stripe Connect required to sell", "Buyer protection", "Reviews", "Local & online deals"],
      },
      {
        path: "/auction", title: "Online Auctions", icon: Gavel,
        blurb: "Live auctions with bidding, escrow and withdrawals.",
        features: ["Live bidding", "Escrow", "Photo galleries", "Disputes", "Reserve prices", "Auto-bidding"],
        details: "Live auction platform — sellers list with reserve price, buyers bid in real time with auto-bid support. Winner pays via Stripe Connect with funds held in escrow until delivery confirmed. Sellers need verified Stripe Connect onboarding.",
        pricing: "Listing fee 15 credits • 10% commission on winning bid auto-deducted",
        capabilities: ["Real-time bidding", "Auto-bid (max-bid) support", "Reserve price option", "Photo galleries up to 30", "Stripe Connect escrow", "Auction extensions (anti-snipe)", "Bid history", "Dispute resolution", "Bidder watchlist", "Win/loss notifications"],
      },
      {
        path: "/collectibles", title: "Collectibles", icon: Sparkles,
        blurb: "Trade collectibles, rarities, evolution and achievements.",
        features: ["Rarities", "Trades", "Achievements", "Evolution", "Mystery boxes", "AI rarity scoring"],
        details: "Complete collectibles ecosystem with 18 features. Generate AI items, customize them, list on marketplace with Stripe Connect, P2P trade with escrow (no money), open mystery boxes, get AI rarity predictions, climb leaderboards and join guilds. Mature trading economy with full audit trails.",
        pricing: "Generate item 10 credits • Customize 12 credits • AI rarity 8 credits • Marketplace 15% commission • Trading free (P2P escrow)",
        capabilities: ["AI item generation (10 cr)", "AI item customizer (12 cr)", "My Collection inventory", "Marketplace with Stripe Connect (15%)", "P2P trading hub with escrow (no money)", "Price alerts (5 cr)", "Mystery boxes", "Box simulator (3 cr)", "Daily rewards & VIP", "AI rarity predictor (8 cr)", "AI collection advisor (5 cr)", "Leaderboard", "Achievements", "Guilds", "Buy credits", "Purchase history"],
      },
      {
        path: "/antique-appraisal", title: "Antique Appraisal", icon: Gem,
        blurb: "AI estimates antique value with photos and collections.",
        features: ["AI appraisal", "Collections", "Marketplace", "Credit-based", "Photo analysis", "Historical comparables"],
        details: "Upload photos of antiques, get AI valuation with historical comparables and condition assessment. Build a collection portfolio with total estimated value. List for sale in the integrated marketplace (Stripe Connect required) or keep private.",
        pricing: "Appraisal 8 credits • Collection storage free • Marketplace 10% commission",
        capabilities: ["AI valuation from photos", "Historical comparables lookup", "Condition assessment", "Collection portfolio", "Total value tracking", "Integrated marketplace listing", "Stripe Connect required to sell", "Shareable certificates", "Insurance valuation export", "Expert review request (premium)"],
      },
    ],
  },
  {
    id: "learning",
    title: "Learning & Growth",
    icon: GraduationCap,
    accent: "text-indigo-500",
    intro: "Courses, flashcards, IQ tests, mentors and brain duels — gamified learning.",
    sections: [
      { path: "/education", title: "Education Hub", icon: GraduationCap, blurb: "Flashcards, daily challenges, study groups, math solver, AI tutor.", features: ["Flashcards & SRS", "Daily challenge", "AI tutor", "Certificates", "Study groups", "Math solver"], details: "Comprehensive learning hub with spaced-repetition flashcards, daily knowledge challenges, AI tutor for any subject, math problem solver with steps, study groups for collaborative learning and certificate-bearing courses.", pricing: "Flashcards free • AI tutor 3 credits/session • Math solver 1 credit/problem • Courses vary", capabilities: ["SRS flashcard decks", "Daily knowledge challenge", "AI tutor (any subject)", "Math problem solver", "Study groups", "Certificate courses", "Progress dashboard", "Public deck library"] },
      { path: "/tutorial-platform", title: "Tutorials & Courses", icon: BookOpen, blurb: "Buy courses, take quizzes, earn certificates, leave reviews.", features: ["Courses", "Quizzes", "Live lessons", "Certificates", "Instructor profiles", "Refunds"], details: "Marketplace for tutorials and full courses created by experts and platform users. Buy individual courses or subscribe to instructors, take graded quizzes, earn certificates, leave reviews. Instructors need Stripe Connect.", pricing: "Course prices set by instructor • 85/15 split with platform", capabilities: ["Course marketplace", "Graded quizzes", "Live lesson scheduling", "Certificates of completion", "Instructor profiles", "Reviews & ratings", "Stripe Connect for instructors", "Refund window"] },
      { path: "/iq-platform", title: "IQ Platform", icon: Brain, blurb: "IQ tests, daily challenges, duels, leaderboards and tournaments.", features: ["IQ tests", "Daily challenges", "Duels", "Tournaments", "Cognitive games", "Progress tracking"], details: "Comprehensive IQ testing platform with validated tests, daily cognitive challenges, real-time duels against others, weekly tournaments and skill-area tracking (memory, logic, speed, pattern). Premium analytics show your cognitive growth.", pricing: "Basic test 5 credits • Full IQ test 15 credits • Duel 2 credits • Tournament entry 5 credits", capabilities: ["Multiple IQ test types", "Daily cognitive challenges", "Real-time duels", "Weekly tournaments", "Skill area tracking", "Cognitive games library", "Premium analytics", "Global leaderboard"] },
      { path: "/brain-duel", title: "BrainDuel", icon: Trophy, blurb: "Real-time knowledge battles with powerups, leagues and SRS.", features: ["Live matches", "Leagues", "Powerups", "SRS cards", "Custom topics", "Tournament mode"], details: "Real-time 1v1 knowledge battles across topics — geography, science, history, pop culture. Powerups add strategy (50/50, freeze, double points). Promotion/relegation leagues. SRS flashcards help you grind weak topics.", pricing: "Duel 2 credits • Powerups 1 credit each • Leagues free", capabilities: ["Live 1v1 battles", "20+ topics", "Powerups (50/50, freeze, double)", "Promotion/relegation leagues", "SRS card grinding", "Tournament mode", "Custom topic battles", "Friend challenges"] },
      { path: "/kids-channel", title: "Kids Channel", icon: Video, blurb: "Safe video channel for ages 6–12 with parental controls.", features: ["Curated videos", "Parental gate", "Watch history", "Recommendations", "Time limits", "No ads"], details: "Curated, safe video channel for ages 6-12. Parental gate locks access, time limits prevent overuse, no ads, no comments, only pre-approved educational and entertainment content. Watch history visible to parents.", pricing: "Subscription €5/mo per child profile", capabilities: ["Curated educational videos", "Parental gate", "Watch history for parents", "Time limit controls", "No ads, no comments", "Age-appropriate recommendations", "Multiple child profiles", "Offline download (premium)"] },
      { path: "/coloring-pages", title: "Coloring Pages", icon: Palette, blurb: "AI-generated coloring pages with contests, collabs and POD.", features: ["AI pages", "Contests", "Collabs", "Print-on-demand", "Color palettes", "Sharing"], details: "Generate custom coloring pages from any prompt with AI. Enter weekly contests, collaborate with other artists, order print-on-demand booklets shipped to your door. Color digitally or print and color physically.", pricing: "Generate 3 credits • POD prices vary", capabilities: ["AI page generation from prompt", "Weekly contests", "Artist collaborations", "Print-on-demand booklets", "Digital coloring tool", "Color palette suggestions", "Public gallery", "Save favorites"] },
    ],
  },
  {
    id: "kids",
    title: "Kids Academy (6–12) & Teen (13–18)",
    icon: Sparkles,
    accent: "text-yellow-500",
    intro: "Age-gated learning for children and teens with parental oversight.",
    sections: [
      { path: "/kids", title: "Kids Academy Hub", icon: Sparkles, blurb: "Central hub for all kids learning tools and progress.", features: ["Daily plan", "Parent digest", "XP system", "Family share", "Achievements", "Multi-child profiles"], details: "Central hub for all kids learning tools (ages 6-12). AI builds daily learning plans across subjects, parents get weekly digests, kids earn XP and achievements, family sharing across multiple child profiles. All content age-gated.", pricing: "Subscription €9/mo per family (up to 5 kids)", capabilities: ["Daily AI learning plan", "Parent weekly digest", "XP & achievements", "Multi-child family share", "Subject coverage (math/science/reading/etc)", "Time limit enforcement", "Progress reports", "Reward shop"] },
      { path: "/kids-homework", title: "Homework Helper", icon: BookOpen, blurb: "AI-guided homework help with challenges and points.", features: ["AI help", "Daily challenges", "Points", "Achievements", "Subject coverage", "Step-by-step"], details: "AI homework helper that explains step-by-step instead of giving answers. Daily challenges keep skills sharp, points and achievements gamify progress. Covers math, science, reading, writing, languages.", pricing: "Included in Kids Academy subscription", capabilities: ["Step-by-step explanations", "Daily challenges", "Points & achievements", "Math, science, reading, writing", "Photo upload of problems", "Parent visibility", "Progress reports", "Multiple languages"] },
      { path: "/kids-story-creator", title: "Story Creator", icon: BookOpen, blurb: "Kids create illustrated stories with AI.", features: ["AI stories", "Illustrations", "Share", "Credits", "Voice narration", "Print as book"], details: "Kids write stories and AI illustrates each page. Voice narration brings stories to life. Share with family, print as physical book (POD), save to personal library. Safe prompts only.", pricing: "Story 5 credits • Print book €15+", capabilities: ["AI illustrations per page", "Voice narration", "Family sharing", "Print-on-demand book", "Personal story library", "Safe content filter", "Multiple art styles", "Story templates"] },
      { path: "/kids-science-lab", title: "Science Lab", icon: FlaskConical, blurb: "Safe experiments with quizzes and certificates.", features: ["Experiments", "Quizzes", "Certificates", "Progress", "Video walkthroughs", "Material lists"], details: "Safe at-home science experiments with video walkthroughs, material lists, quizzes after each and certificates earned. Subjects cover physics, chemistry, biology, earth science. Parent supervision recommended.", pricing: "Included in Kids Academy subscription", capabilities: ["100+ safe experiments", "Video walkthroughs", "Material lists", "Post-experiment quizzes", "Certificates", "Subject categories", "Difficulty levels", "Parent guide"] },
      { path: "/kids-drawing-buddy", title: "Drawing Buddy", icon: Palette, blurb: "Guided drawing lessons with AI feedback.", features: ["Drawing lessons", "AI feedback", "Subscriptions", "Gallery", "Step-by-step", "Skill levels"], details: "AI-guided drawing lessons from stick figures to advanced shading. Upload your drawing, AI gives encouraging feedback and improvement tips. Personal gallery and public showcase (moderated).", pricing: "Included in Kids Academy subscription", capabilities: ["Step-by-step lessons", "AI drawing feedback", "Skill level progression", "Personal gallery", "Moderated public showcase", "Multiple art styles", "Tool tutorials", "Certificates"] },
      { path: "/kids-reading-companion", title: "Reading Companion", icon: BookOpen, blurb: "Reading practice with audio, sessions and credits.", features: ["Reading sessions", "Audio", "Levels", "Subscriptions", "Pronunciation help", "Progress tracking"], details: "Reading practice with AI companion. Read aloud — AI listens and helps with pronunciation. Multiple reading levels, vast story library, progress tracking and parent reports.", pricing: "Included in Kids Academy subscription", capabilities: ["Read-aloud sessions", "Pronunciation correction", "Multiple reading levels", "Story library", "Progress tracking", "Parent reports", "Audio recordings", "Vocabulary builder"] },
      { path: "/teen-career-counselor", title: "Career Counselor", icon: Briefcase, blurb: "Career guidance for teens with AI advisor.", features: ["Career paths", "Aptitude", "Advisor", "Resources", "University guides", "Internship leads"], details: "Career exploration for ages 13-18. AI advisor based on aptitude tests, personality and interests. Maps career paths with required education, salary ranges, university programs and internship leads.", pricing: "Subscription €7/mo", capabilities: ["AI career advisor", "Aptitude tests", "Personality assessment", "Career path mapping", "University guides", "Internship leads", "Salary ranges", "Resource library"] },
    ],
  },
  {
    id: "jobs",
    title: "Work & Careers",
    icon: Briefcase,
    accent: "text-sky-500",
    intro: "Full job platform — applications, ATS, AI ranking, salaries, interviews and referrals.",
    sections: [
      { path: "/jobs", title: "Jobs", icon: Briefcase, blurb: "Browse, save and apply to jobs with AI matching.", features: ["AI match score", "Saved jobs", "Alerts", "Applications", "Profile import", "Quick apply"], details: "Full job platform — search and filter listings by role, location, salary, remote. AI scores match between your profile and each job. Save jobs, set alerts, quick apply with one profile. Application status tracking.", pricing: "Free for candidates • Employers pay per listing/featured boost", capabilities: ["AI match scoring", "Search & filters", "Saved jobs", "Email/push alerts", "Quick apply with profile", "Application status tracking", "Profile import (LinkedIn/CV)", "Anonymous browsing"] },
      { path: "/jobs/companies", title: "Companies", icon: Building2, blurb: "Company profiles, reviews and salary insights.", features: ["Profiles", "Reviews", "Verified employers", "Photos", "Culture insights", "Open roles"], details: "Browse company profiles with employee reviews, salary ranges, culture insights, office photos and current open roles. Verified employer badges. Anonymous reviews protect employees.", pricing: "Free • Employer verification fee", capabilities: ["Detailed company profiles", "Anonymous employee reviews", "Salary range data", "Culture insights", "Office photos", "Current open roles", "Verified employer badge", "Follow companies"] },
      { path: "/jobs/salaries", title: "Salary Insights", icon: Star, blurb: "Salary data by role, location and company.", features: ["Role data", "Geographic", "Trends", "Negotiation", "Anonymous submissions", "Total comp"], details: "Crowdsourced salary database — search by role, location, company and experience level. See total compensation breakdowns (base/bonus/equity), historical trends and negotiation guides. Anonymous submissions.", pricing: "Free with anonymous contribution", capabilities: ["Role-based salary data", "Geographic comparisons", "Historical trends", "Total comp breakdowns", "Negotiation guides", "Anonymous submissions", "Filters by experience", "Career path salary mapping"] },
      { path: "/jobs/interviews", title: "Interview Prep", icon: Brain, blurb: "Practice questions, mock interviews, video resumes.", features: ["Question bank", "Mock interview", "Video CV", "Templates", "Behavioral coaching", "Tech questions"], details: "Comprehensive interview prep — searchable question bank by role, AI mock interviewer with voice and video, behavioral coaching, tech question library and video resume builder.", pricing: "Mock interview 10 credits/session • Question bank free", capabilities: ["10,000+ question bank", "AI mock interviewer (voice & video)", "Behavioral coaching (STAR method)", "Tech question library", "Video resume builder", "Industry templates", "Mock interview feedback", "Save responses"] },
      { path: "/jobs/career-path", title: "Career Path", icon: GraduationCap, blurb: "Visualize your career trajectory with AI guidance.", features: ["Path nodes", "Skill gaps", "Recommendations", "Goals", "Salary projections", "Course links"], details: "Visualize your career as branching paths — current role, target role, intermediate steps. AI identifies skill gaps, recommends courses and certifications, projects salary growth and tracks goals.", pricing: "Free basic • Premium €5/mo for AI deep analysis", capabilities: ["Career path visualization", "Skill gap analysis", "Course recommendations", "Certification recommendations", "Salary projections", "Goal tracking", "AI deep analysis (premium)", "Multiple path comparison"] },
      { path: "/jobs/headhunters", title: "Headhunters", icon: Search, blurb: "Hire or be hired by professional headhunters.", features: ["Headhunter profiles", "Engagements", "Verification", "Payments", "Commission tracking", "Candidate pools"], details: "Marketplace for professional headhunters. Companies hire headhunters for hard-to-fill roles, headhunters earn commission per placement. Verified profiles, candidate pools, commission tracking. Stripe Connect for payments.", pricing: "Commission rates vary • Platform 10%", capabilities: ["Verified headhunter profiles", "Engagement contracts", "Candidate pool management", "Commission tracking", "Stripe Connect payments", "Review system", "Specialization filters", "Success metrics"] },
      { path: "/jobs/ai-jd-writer", title: "AI JD Writer", icon: PenTool, blurb: "Generate full job descriptions from a brief.", features: ["AI generation", "Templates", "Drafts", "Diversity", "Compensation suggestions", "Multi-language"], details: "Generate complete job descriptions from a brief — title, responsibilities, requirements, benefits, compensation suggestions, diversity-inclusive language. Multi-language output for global hiring.", pricing: "5 credits per generation", capabilities: ["AI JD generation", "Template library", "Save drafts", "Diversity-inclusive language", "Compensation suggestions", "Multi-language output", "Industry-specific templates", "Tone adjustments"] },
    ],
  },
  {
    id: "brand-arena",
    title: "Brand Arena",
    icon: Trophy,
    accent: "text-orange-500",
    intro: "Brands battle for community votes with 20+ features for sponsors and fans.",
    sections: [
      { path: "/brand-battle", title: "Brand Battle", icon: Trophy, blurb: "Vote in brand battles, earn voter pass, trade cards.", features: ["Brand cards", "Voter pass", "Predictions", "Tournaments", "Tribe loyalty", "XP rewards"], details: "Brands battle for community votes in head-to-head matchups. Fans earn voter pass tokens, collect and trade brand cards, predict outcomes for XP, join tournaments. Tribe loyalty unlocks perks from your favorite brands.", pricing: "Voting free • Voter pass €5/mo • Tradeable cards 1-50 credits", capabilities: ["Head-to-head brand battles", "Brand card collection & trading", "Voter pass subscription", "Prediction markets", "Tournament brackets", "Tribe loyalty system", "XP & rewards", "Brand perks for loyal fans"] },
      { path: "/brand-battle/hub", title: "Arena Hub", icon: Sparkles, blurb: "All 20 arena features in one place.", features: ["20 features", "Tribes", "Investments", "Stocks", "Predictions", "Sponsorship tiers"], details: "Central hub for all 20+ Brand Arena features. Track your tribes, manage brand stock portfolio, invest in rising brands, view leaderboards, claim sponsorship tier perks, follow battle history.", pricing: "Free hub access • Premium features per tier", capabilities: ["Tribe tracking", "Brand stock portfolio", "Brand investment", "Prediction markets", "Tournament tracking", "Leaderboards", "Sponsorship tier perks", "Battle history archive"] },
      { path: "/sponsor-registration", title: "Become a Sponsor", icon: Crown, blurb: "Onboard your brand as an arena sponsor.", features: ["Registration", "Verification", "Branding", "Events", "Tier selection", "Onboarding"], details: "Onboard your brand as an arena sponsor. Pick a tier (Bronze/Silver/Gold/Enterprise), get verified, upload branding, scheduled events and campaigns. Enterprise unlocks API access and dedicated account manager.", pricing: "Tiers from €99/mo to Enterprise custom pricing", capabilities: ["Tier selection (Bronze to Enterprise)", "Brand verification", "Logo & branding upload", "Event scheduling", "Campaign management", "Enterprise API access", "Dedicated account manager (Enterprise)", "Priority support SLA"] },
      { path: "/sponsor-dashboard", title: "Sponsor Dashboard", icon: Building2, blurb: "Manage campaigns, AI insights, API keys.", features: ["Campaigns", "AI insights", "API keys", "Earnings", "Audience analytics", "Auto-bidding"], details: "Sponsor dashboard for managing all campaigns, viewing AI-driven insights on audience and ROI, generating API keys for integrations, tracking earnings from arena participation. Auto-bidding for premium ad slots.", pricing: "Included in sponsorship tier", capabilities: ["Campaign management", "AI audience insights", "ROI tracking", "API key generation", "Earnings dashboard", "Auto-bidding for ad slots", "Audience analytics", "Export reports"] },
    ],
  },
  {
    id: "megatalent",
    title: "Megatalent",
    icon: Crown,
    accent: "text-fuchsia-500",
    intro: "Premium talent competition with 80/20 escrow, watch parties and creator subscriptions.",
    sections: [
      { path: "/megatalent", title: "Megatalent Hub", icon: Crown, blurb: "Browse talents by category, vote, tip and subscribe.", features: ["Categories", "Voting", "Tips", "Subscriptions", "Watch parties", "Stories"], tag: "Premium", details: "Premium talent competition where users showcase abilities (music, dance, comedy, art, sports, anything). Browse by category, vote, tip in credits, subscribe to favorite talents. Watch parties for live performances. 24-hour stories. Winners get 80% with 20% to platform; 100k bonus votes available.", pricing: "Voting free • Tips 1-100 credits • Subscriptions vary • Winner payout 80/20 escrow", capabilities: ["Browse by talent category", "Voting & tipping", "Creator subscriptions", "Watch parties for live shows", "24h stories", "80/20 escrow payouts", "100k bonus votes for nominees", "Featured tournaments", "Verified Founder badges"] },
      { path: "/megatalent/battle-results", title: "Battle Results", icon: Trophy, blurb: "Tournament brackets and winner payouts.", features: ["Brackets", "Live votes", "Winners", "Payouts", "Replay archive", "Vote audit"], details: "Tournament bracket visualization with live vote counts, winner announcements, payout tracking and full vote audit trail. Replays of past battles available. Transparency dashboard for every payout.", pricing: "Free to view", capabilities: ["Live bracket visualization", "Real-time vote counts", "Winner announcements", "Payout tracking", "Full vote audit trail", "Battle replay archive", "Transparency dashboard", "Notification on results"] },
    ],
  },
  {
    id: "fundraising",
    title: "Fundraising",
    icon: Heart,
    accent: "text-red-500",
    intro: "Cause-specific fundraising with transparent platform fees (5–10%) and Stripe Connect payouts.",
    sections: [
      { path: "/fundraising", title: "Fundraising Hub", icon: Heart, blurb: "Browse all active campaigns by category.", features: ["All causes", "Search", "Donor stats", "Updates", "Featured campaigns", "Anonymous donations"], details: "Central hub for all fundraising campaigns across categories. Browse by cause, search, see donor stats, follow updates. Featured spots for verified high-impact campaigns. Anonymous donations supported.", pricing: "Free to browse • Donations vary • Platform fee 5-10% by category", capabilities: ["All categories in one feed", "Search & filter", "Donor leaderboards", "Campaign update follow", "Featured spots", "Anonymous donations", "Donation receipts", "Share to social"] },
      { path: "/fundraising/medical", title: "Medical (6%)", icon: Heart, blurb: "Medical treatment and emergency campaigns.", features: ["Medical proof", "Updates", "Milestones", "Direct payout", "Verification", "Insurance liaison"], details: "Fundraise for medical treatment, surgery, emergencies. Requires medical documentation proof for verification. Campaign milestones unlock progressive payouts. Direct Stripe Connect to beneficiary. 6% platform fee.", pricing: "6% platform fee • Stripe fees separate", capabilities: ["Medical documentation upload", "Verification by platform", "Milestone-based payouts", "Direct Stripe Connect to beneficiary", "Update timeline", "Insurance liaison help", "Donor receipts", "Anonymous donor option"] },
      { path: "/fundraising/dream", title: "Dream Maker (7%)", icon: Sparkles, blurb: "Fund personal dreams with backer rewards.", features: ["Backer tiers", "Updates", "Goal tracking", "Rewards", "Stretch goals", "Backer chat"], details: "Kickstarter-style for personal dreams — start a business, travel, learn an instrument, whatever. Backers get tiered rewards. Stretch goals unlock as funding grows. 7% platform fee.", pricing: "7% platform fee • Stripe fees separate", capabilities: ["Backer reward tiers", "Stretch goals", "Update timeline", "Goal progress tracking", "Backer chat", "Reward fulfillment tracking", "Donor receipts", "Featured spots"] },
      { path: "/fundraising/hero", title: "Community Hero (5%)", icon: Shield, blurb: "Recognize and fund community heroes.", features: ["Thank-you messages", "Updates", "Lowest fee", "Verified", "Community nomination", "Story features"], details: "Nominate and fund community heroes — first responders, teachers, neighbors who made a difference. Nominees get thank-you messages, story features, direct payout. Lowest platform fee at 5%.", pricing: "5% platform fee (lowest) • Stripe fees separate", capabilities: ["Community nomination", "Hero verification", "Thank-you message wall", "Story features", "Direct payout", "Update timeline", "Donor receipts", "Social sharing"] },
      { path: "/fundraising/pet", title: "Pet Rescue (6%)", icon: PawPrint, blurb: "Animal rescue and veterinary fundraising.", features: ["Rescue stories", "Vet proof", "Updates", "Photos", "Adoption matching", "Shelter partnerships"], details: "Fundraise for animal rescue, veterinary treatment, shelter operations. Vet documentation required. Photo updates throughout treatment. Adoption matching for rescued animals. 6% platform fee.", pricing: "6% platform fee • Stripe fees separate", capabilities: ["Vet documentation upload", "Rescue story builder", "Photo update gallery", "Adoption matching", "Shelter partnerships", "Direct payout to vet/shelter", "Donor receipts", "Recurring donations"] },
      { path: "/fundraising/student", title: "Student Support (5%)", icon: GraduationCap, blurb: "Tuition, textbooks and student emergencies.", features: ["Verified students", "Milestones", "Lowest fee", "Updates", "School partnerships", "Scholarship matching"], details: "Fundraise for tuition, textbooks, equipment, student emergencies. Verified student status required. Milestone payouts tied to academic progress. School partnerships for direct disbursement. 5% lowest fee.", pricing: "5% platform fee (lowest) • Stripe fees separate", capabilities: ["Student verification", "Academic milestone payouts", "School direct disbursement", "Scholarship matching tool", "Update timeline", "Donor receipts", "Recurring donations", "Anonymous donor option"] },
      { path: "/fundraising/crisis", title: "Crisis Relief (8%)", icon: AlertTriangle, blurb: "Disaster and crisis response with partner orgs.", features: ["Partner orgs", "Distribution", "Higher overhead", "Real-time", "Aid tracking", "Volunteer coordination"], details: "Disaster relief and crisis response — natural disasters, conflicts, humanitarian emergencies. Partnered with vetted aid orgs for distribution. Real-time aid tracking. 8% fee covers higher overhead. Volunteer coordination tools included.", pricing: "8% platform fee (covers vetting overhead) • Stripe fees separate", capabilities: ["Vetted partner org network", "Aid distribution tracking", "Real-time crisis updates", "Volunteer coordination", "Direct payout to partners", "Transparency reports", "Anonymous donations", "Featured spots for urgent crises"] },
      { path: "/fundraising/talent", title: "Talent Sponsorship (10%)", icon: Star, blurb: "Sponsor emerging talent — highest creator support.", features: ["Talent matching", "Recurring", "Approval flow", "Stripe Connect", "Mentorship", "Progress reports"], details: "Sponsor emerging talent — recurring or one-time funding for creators, athletes, artists pursuing their craft. Includes mentorship matching, approval flow for sponsors and detailed progress reports from talents. 10% covers full creator support stack.", pricing: "10% platform fee (covers full support) • Stripe fees separate", capabilities: ["Talent matching algorithm", "Recurring sponsorship", "Sponsor approval flow", "Mentorship matching", "Progress report templates", "Stripe Connect to talent", "Sponsor dashboard", "Public sponsor wall"] },
    ],
  },
];

const HERO_STATS = [
  { icon: Globe, label: "Sections", value: "60+" },
  { icon: Crown, label: "AI Tools", value: "40+" },
  { icon: Trophy, label: "Arenas", value: "15+" },
  { icon: Heart, label: "Communities", value: "30+" },
];

export default function AboutPlatform() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const { user } = useAuth();
  const { favorites, isFavorite, toggleFavorite } = useFavoriteSections();

  const favoriteSections = useMemo(() => {
    const map = new Map<string, { section: Section; category: Category }>();
    for (const cat of CATEGORIES) {
      for (const s of cat.sections) map.set(s.path, { section: s, category: cat });
    }
    return favorites
      .map((f) => map.get(f.path))
      .filter((x): x is { section: Section; category: Category } => !!x);
  }, [favorites]);

  useEffect(() => {
    videoRef.current?.play().catch(() => setIsPlaying(false));
  }, []);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) videoRef.current.pause(); else videoRef.current.play();
    setIsPlaying(!isPlaying);
  };
  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const filteredCategories = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return CATEGORIES;
    // Single-letter query = alphabetical index (match section title start)
    if (q.length === 1) {
      return CATEGORIES
        .map((cat) => ({
          ...cat,
          sections: cat.sections.filter((s) =>
            s.title.toLowerCase().startsWith(q)
          ),
        }))
        .filter((cat) => cat.sections.length > 0);
    }
    return CATEGORIES
      .map((cat) => ({
        ...cat,
        sections: cat.sections.filter((s) =>
          s.title.toLowerCase().includes(q) ||
          s.blurb.toLowerCase().includes(q) ||
          (s.details ?? "").toLowerCase().includes(q) ||
          s.features.some((f) => f.toLowerCase().includes(q)) ||
          (s.capabilities ?? []).some((f) => f.toLowerCase().includes(q))
        ),
      }))
      .filter((cat) => cat.sections.length > 0);
  }, [query]);

  return (
    <div className="min-h-screen bg-background">
      {/* Subtle scan-line overlay (matches Holographic hub vibe) */}
      <div
        className="fixed inset-0 pointer-events-none z-50 opacity-[0.03]"
        style={{
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(168,85,247,0.15) 3px, rgba(168,85,247,0.15) 4px)",
        }}
      />

      <div className="container mx-auto px-4 pt-20 pb-12">
        {/* HERO */}
        <div className="relative h-[68vh] min-h-[480px] w-full overflow-hidden rounded-3xl border border-border/40 mb-8">
          <video
            ref={videoRef}
            className="absolute inset-0 h-full w-full object-cover brightness-110 saturate-110"
            autoPlay
            muted
            loop
            playsInline
          >
            <source src={heroAsset.url} type="video/mp4" />
          </video>

          <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/35 to-background/75" />

          {/* Floating particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(14)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1.5 h-1.5 rounded-full"
                style={{
                  background: i % 2 === 0 ? "hsl(var(--primary))" : "hsl(var(--accent))",
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  boxShadow: `0 0 8px hsl(var(--primary) / 0.6)`,
                }}
                animate={{ y: [0, -30, 0], opacity: [0.3, 0.9, 0.3], scale: [1, 1.4, 1] }}
                transition={{ duration: 3 + Math.random() * 4, repeat: Infinity, delay: Math.random() * 3, ease: "easeInOut" }}
              />
            ))}
          </div>

          <div className="relative z-10 h-full flex flex-col justify-center px-6 sm:px-10">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center mb-4">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-card/45 backdrop-blur-md text-foreground text-sm font-semibold border border-border/60">
                <Sparkles className="w-4 h-4 text-primary" /> Your Itinerary to Unique <Sparkles className="w-4 h-4 text-accent" />
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-5xl lg:text-6xl font-black text-center mb-3 text-primary"
              style={{
                WebkitTextStroke: "1.5px rgba(88, 28, 135, 0.8)",
                textShadow:
                  "0 0 30px hsl(var(--primary) / 0.6), 0 0 60px hsl(var(--primary) / 0.3), 0 2px 10px rgba(0,0,0,0.8)",
                filter: "drop-shadow(0 0 8px hsl(var(--primary) / 0.5))",
              }}
            >
              About the Platform
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-sm sm:text-base md:text-lg text-white text-center mb-7 max-w-3xl mx-auto px-4 py-2.5 rounded-lg bg-black/60 backdrop-blur-sm"
              style={{ textShadow: "0 1px 4px rgba(0,0,0,0.8)" }}
            >
              A complete tour of every section inside Unique — what each hub does, what services and tools it offers,
              pricing for every feature, and how to use it. Skim, search, expand for deep details, or jump straight in.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto w-full"
            >
              {HERO_STATS.map((stat) => (
                <div key={stat.label} className="bg-card/45 backdrop-blur-md rounded-xl p-3 text-center border border-border/60">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <stat.icon className="w-4 h-4 text-primary" />
                    <span className="text-xl sm:text-2xl font-black text-foreground">{stat.value}</span>
                  </div>
                  <span className="text-xs text-muted-foreground font-medium">{stat.label}</span>
                </div>
              ))}
            </motion.div>
          </div>

          <div className="absolute bottom-4 right-4 flex gap-2 z-20">
            <Button variant="ghost" size="icon" className="bg-card/50 backdrop-blur-md hover:bg-card/70 border border-border/50" onClick={togglePlay}>
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" className="bg-card/50 backdrop-blur-md hover:bg-card/70 border border-border/50" onClick={toggleMute}>
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Why Unique over standalone AI */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/5 overflow-hidden">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-center gap-2 mb-4">
                <Cpu className="w-5 h-5 text-primary" />
                <h2 className="text-xl sm:text-2xl font-black">Why Unique Beats Standalone AI</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-6 max-w-3xl">
                Google Gemini, ChatGPT and other AI chats are powerful — but they are just a blank conversation box.
                Unique wraps cutting-edge AI inside a complete social ecosystem, so you get intelligence <em>and</em> community, earnings, memory and purpose-built tools.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  {
                    icon: Brain,
                    title: "Persistent Memory",
                    desc: "Our AI companions, mentors and clones remember your name, goals and story across months — not just the current chat thread."
                  },
                  {
                    icon: Users,
                    title: "Built-In Social Layer",
                    desc: "Share AI-generated art, astrology readings or dream analyses to your Wall, compete in AI-voted contests and build a follower economy."
                  },
                  {
                    icon: Zap,
                    title: "40+ Specialized Tools",
                    desc: "From tattoo design and pet translation to handwriting analysis and video-ad generation — each tool is tuned for a single job, not generic prompts."
                  },
                  {
                    icon: Coins,
                    title: "Earn While You Create",
                    desc: "Sell memberships, offer paid DMs, win contest prizes and collect tips. The platform pays you back; a chatbot never does."
                  },
                  {
                    icon: Globe,
                    title: "One Passport, 60+ Worlds",
                    desc: "Dating, jobs, education, spirituality, gaming, fundraising and creator studios — all linked to one profile and one credit wallet."
                  },
                  {
                    icon: Wallet,
                    title: "Fair Pay-Per-Use Pricing",
                    desc: "Buy credits once and spend them only on what you use. No €20/month subscription for features you never touch."
                  },
                ].map((item) => (
                  <div key={item.title} className="rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm p-4 hover:border-primary/40 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <item.icon className="w-4 h-4 text-primary" />
                      </div>
                      <h3 className="font-bold text-sm">{item.title}</h3>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* Search + jump nav */}
        <div className="mb-8 space-y-4">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search 200+ tools, arenas and communities…"
              className="pl-9 h-11 bg-card/60 backdrop-blur-sm border-border/60"
            />
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            {CATEGORIES.map((cat) => (
              <a key={cat.id} href={`#${cat.id}`}>
                <Badge variant="outline" className="cursor-pointer hover:bg-primary/10 hover:border-primary/40 transition-colors">
                  <cat.icon className={`w-3 h-3 mr-1 ${cat.accent}`} />
                  {cat.title}
                </Badge>
              </a>
            ))}
          </div>
        </div>

        {/* My Favorites quick-access */}
        {user && favoriteSections.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center gap-2 mb-3">
              <BookmarkCheck className="w-5 h-5 text-primary" />
              <h2 className="text-lg md:text-xl font-black">My Favorites</h2>
              <Badge variant="outline" className="text-[10px]">{favoriteSections.length}</Badge>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
              {favoriteSections.map(({ section, category }) => (
                <Link
                  key={section.path}
                  to={section.path}
                  className="group flex flex-col items-center gap-1.5 p-3 rounded-xl border border-primary/30 bg-card/60 backdrop-blur-sm hover:bg-primary/10 hover:border-primary/60 transition-all"
                >
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary/15 to-accent/15 border border-border/40 flex items-center justify-center">
                    <section.icon className={`w-4 h-4 ${category.accent}`} />
                  </div>
                  <span className="text-[11px] font-semibold text-center line-clamp-2 leading-tight">{section.title}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Categories */}
        <div className="space-y-12">
          {filteredCategories.map((cat) => (
            <section key={cat.id} id={cat.id} className="scroll-mt-24">
              <div className="mb-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <cat.icon className={`w-5 h-5 ${cat.accent}`} />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
                    {cat.title}
                  </h2>
                </div>
                <p className="text-sm text-muted-foreground max-w-3xl">{cat.intro}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {cat.sections.map((section) => {
                  const isOpen = !!expanded[section.path];
                  const hasMore = !!(section.details || section.pricing || (section.capabilities && section.capabilities.length));
                  return (
                  <motion.div
                    key={section.path}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.4 }}
                  >
                    <Card className="h-full border-border/40 bg-card/70 backdrop-blur-sm hover:border-primary/40 hover:shadow-[0_0_24px_-12px_hsl(var(--primary)/0.6)] transition-all">
                      <CardContent className="p-5 flex flex-col h-full">
                        <div className="flex items-start justify-between mb-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/15 to-accent/15 border border-border/40 flex items-center justify-center">
                            <section.icon className={`w-5 h-5 ${cat.accent}`} />
                          </div>
                          {section.tag && (
                            <Badge className="bg-primary/15 text-primary border-primary/30 text-[10px]">{section.tag}</Badge>
                          )}
                        </div>
                        <h3 className="font-black text-base mb-1.5">{section.title}</h3>
                        <p className="text-xs text-muted-foreground mb-3 line-clamp-3">{section.blurb}</p>
                        <ul className="space-y-1 mb-3 flex-1">
                          {section.features.map((f) => (
                            <li key={f} className="text-xs flex items-start gap-1.5">
                              <span className="text-primary mt-0.5">•</span>
                              <span className="text-foreground/80">{f}</span>
                            </li>
                          ))}
                        </ul>

                        {section.pricing && (
                          <div className="mb-3 flex items-start gap-1.5 rounded-lg border border-primary/20 bg-primary/5 p-2">
                            <Coins className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                            <span className="text-[11px] text-foreground/85 leading-snug">{section.pricing}</span>
                          </div>
                        )}

                        <AnimatePresence initial={false}>
                          {isOpen && hasMore && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.25 }}
                              className="overflow-hidden mb-3"
                            >
                              {section.details && (
                                <p className="text-[12px] text-foreground/85 leading-relaxed mb-3 border-l-2 border-primary/40 pl-3">
                                  {section.details}
                                </p>
                              )}
                              {section.capabilities && section.capabilities.length > 0 && (
                                <div>
                                  <div className="flex items-center gap-1.5 mb-1.5">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
                                    <span className="text-[11px] font-bold uppercase tracking-wide text-foreground/70">Full capabilities</span>
                                  </div>
                                  <ul className="grid grid-cols-1 gap-1">
                                    {section.capabilities.map((c) => (
                                      <li key={c} className="text-[11px] flex items-start gap-1.5">
                                        <span className="text-accent mt-0.5">›</span>
                                        <span className="text-foreground/75">{c}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {hasMore && (
                          <button
                            type="button"
                            onClick={() => setExpanded((s) => ({ ...s, [section.path]: !s[section.path] }))}
                            className="mb-3 inline-flex items-center justify-center gap-1 text-[11px] font-semibold text-primary hover:text-accent transition-colors"
                          >
                            {isOpen ? "Show less" : "Show full details"}
                            <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                          </button>
                        )}

                        <div className="flex items-center gap-2 mt-auto">
                          <Link to={section.path} className="flex-1">
                            <Button variant="outline" size="sm" className="w-full hover:bg-primary/10 hover:border-primary/40">
                              Open
                              <ArrowRight className="w-3 h-3 ml-1" />
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="icon"
                            className={`h-9 w-9 shrink-0 ${isFavorite(section.path) ? "bg-primary/15 border-primary/50 text-primary" : "hover:bg-primary/10 hover:border-primary/40"}`}
                            aria-label={isFavorite(section.path) ? "Remove from favorites" : "Add to favorites"}
                            title={user ? (isFavorite(section.path) ? "Remove from favorites" : "Save to favorites") : "Sign in to save favorites"}
                            disabled={!user}
                            onClick={(e) => {
                              e.preventDefault();
                              toggleFavorite({ path: section.path, title: section.title, category: cat.id });
                            }}
                          >
                            {isFavorite(section.path) ? (
                              <BookmarkCheck className="w-4 h-4" />
                            ) : (
                              <Bookmark className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                  );
                })}
              </div>
            </section>
          ))}

          {filteredCategories.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground">No sections match &ldquo;{query}&rdquo;.</p>
            </div>
          )}
        </div>

        {/* Footer CTA */}
        <Card className="mt-12 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/5">
          <CardContent className="p-8 text-center space-y-3">
            <h3 className="text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
              Ready to explore?
            </h3>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto">
              Every section is paid-per-use or subscription — no hidden free tiers, no surprises.
              Browse credits in your dashboard and dive into whichever world calls you.
            </p>
            <div className="flex flex-wrap gap-3 justify-center pt-2">
              <Link to="/ai-credits-store">
                <Button className="bg-gradient-to-r from-primary to-accent">Get Credits</Button>
              </Link>
              <Link to="/wall">
                <Button variant="outline">Go to Wall</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
