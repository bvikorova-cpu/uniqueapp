import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Sparkles, Play, Pause, Volume2, VolumeX, ArrowRight, Search,
  Crown, Cpu, Swords, Heart, Users, Globe, Brain, Trophy,
  Briefcase, GraduationCap, Gem, Star, Music, Mic2, ChefHat,
  Lock, Gift, Plane, Coffee, PawPrint, Building2, Store, Ticket,
  Gavel, Activity, Apple, Shield, Ghost, Bot, PenTool, Image as ImageIcon,
  Clock, Palette, Scale, Dna, Zap, Video, MessageSquare, Mail,
  MessageCircle, BookOpen, FlaskConical, Car, Home, AlertTriangle, Bookmark, BookmarkCheck,
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
      { path: "/wall", title: "The Wall", icon: MessageSquare, blurb: "Personalized feed of posts, photos, videos, polls and stories from people and creators you follow.", features: ["Stories (24h)", "Reactions, comments, shares", "Saved posts & memories", "Trending tab"] },
      { path: "/messenger", title: "Messenger", icon: Mail, blurb: "1:1 and group chats with media, voice, video calls and reactions.", features: ["End-to-end style privacy", "Voice & video calls", "Group chats", "Pinned messages"] },
      { path: "/wall/groups", title: "Groups", icon: Users, blurb: "Topic communities with their own posts, rules, moderators and events.", features: ["Public & private groups", "Moderation tools", "Member roles", "Group insights"] },
      { path: "/wall/pages", title: "Pages", icon: Globe, blurb: "Brand, creator and business pages with reviews, followers and content.", features: ["Reviews & ratings", "Follower analytics", "Pinned posts", "Verified badges"] },
      { path: "/wall/events", title: "Events", icon: Star, blurb: "Create or RSVP to local and online events with tickets.", features: ["RSVP & guest lists", "Paid tickets", "Calendar export", "Event chat"] },
      { path: "/megaforum", title: "Megaforum", icon: MessageCircle, blurb: "Long-form discussion forum with debates, polls, challenges and reputation.", features: ["Threaded debates", "Live polls", "Forum reputation", "Topic following"] },
      { path: "/companions", title: "Character Companions", icon: Bot, blurb: "Chat with AI characters with persistent memory and unique personalities.", features: ["Custom personas", "Long-term memory", "Roleplay scenarios", "Voice replies"] },
      { path: "/emotion-economy", title: "Emotion Economy", icon: Heart, blurb: "Track, trade and mine your emotional currency — gamified mood network.", features: ["Mood wallet", "Emotion drops", "Insurance & futures", "Mining rewards"] },
      { path: "/referral", title: "Invite Friends", icon: Users, blurb: "Earn recurring credits when friends join and subscribe.", features: ["Custom referral code", "Lifetime % rewards", "Leaderboard", "Fraud-protected"] },
    ],
  },
  {
    id: "dating",
    title: "Dating & Relationships",
    icon: Heart,
    accent: "text-pink-500",
    intro: "From real-name dating to anonymous chemistry tests — find people through interests, not just photos.",
    sections: [
      { path: "/dating", title: "Dating", icon: Heart, blurb: "Photo-first matching with filters, super-likes, boosts and date plans.", features: ["AI compatibility score", "Date ideas planner", "Video verification", "Super-likes & boosts"] },
      { path: "/anonymous-date", title: "Anonymous Date", icon: Lock, blurb: "Match by personality first — photos reveal only after chemistry is proven.", features: ["Chemistry reports", "Red-flag scans", "Vibe decoder", "Reveal readiness"] },
      { path: "/best-friend", title: "AI Best Friend", icon: Bot, blurb: "Always-on AI companion that remembers your life, moods and goals.", features: ["Mood journal", "Crisis check-ins", "Memory bank", "Daily nudges"] },
      { path: "/membership-community", title: "Membership Community", icon: Crown, blurb: "Paid creator memberships with perks, livestreams and welcome DMs.", features: ["Tiered perks", "Fan persona AI", "Growth funnels", "Livestream briefs"] },
    ],
  },
  {
    id: "mystical",
    title: "Mystical & Spiritual",
    icon: Sparkles,
    accent: "text-purple-500",
    intro: "Spiritual exploration — past lives, dreams, astrology, crystals, quantum and holographic worlds.",
    sections: [
      { path: "/past-life", title: "Past Life Explorer", icon: Clock, blurb: "AI past-life reading with 8 deep tools: animal elementals, karmic debts, soul tribes, regressions.", features: ["8 advanced tools", "Karmic debt tracker", "Soul tribes", "Death reflections"] },
      { path: "/astrology", title: "Astrology", icon: Star, blurb: "Daily horoscopes, birth charts and compatibility reports.", features: ["Birth chart builder", "Daily horoscopes", "Compatibility", "Transit alerts"] },
      { path: "/numerology", title: "Numerology", icon: Sparkles, blurb: "Name and birth-date numerology with full life-path breakdown.", features: ["Life-path report", "Lucky numbers", "Personal year cycles", "Shareable cards"] },
      { path: "/dream-journal", title: "Dream Analyzer", icon: Brain, blurb: "Log dreams, get AI interpretation, track moods and battle dream interpretations.", features: ["Mood-linked entries", "AI interpretations", "Dream battles", "Pattern detection"] },
      { path: "/lottery-ai", title: "Lottery AI", icon: Sparkles, blurb: "AI number predictions with numerology, syndicates and budget coaches. Entertainment only.", features: ["Number generator", "Syndicates", "Pattern detector", "Winner mindset"] },
      { path: "/crystal-energy-network", title: "Crystal & Energy Network", icon: Gem, blurb: "AI energy readings, chakra programs, oracle draws and crystal marketplace.", features: ["Energy readings", "Chakra journey", "Oracle draws", "Marketplace"] },
      { path: "/dna-memory-network", title: "DNA Memory Network", icon: Dna, blurb: "Ancestral stories, heritage maps, offspring predictions and genetic matches.", features: ["Heritage maps", "Ancestral stories", "Genetic matches", "Health blueprints"] },
      { path: "/reincarnation-social", title: "Reincarnation Social", icon: Sparkles, blurb: "Soulmate matching, regressions and karmic debt resolution.", features: ["Soulmate matching", "Past-life regressions", "Karmic debt", "Soul origin"] },
      { path: "/blockchain-confessions", title: "Blockchain Confessions", icon: Scale, blurb: "Anonymous confessions with absolution voting and tokens.", features: ["Anonymous posting", "Absolution voting", "Tokens", "Buy & redeem"] },
      { path: "/multiverse-network", title: "Multiverse Network", icon: Globe, blurb: "Build parallel-universe profiles and explore alternate timelines.", features: ["Parallel profiles", "Universe builder", "Cross-reality reveals", "Subscriptions"] },
      { path: "/quantum-social", title: "Quantum Social", icon: Zap, blurb: "AI Quantum Oracle, observer mode and quantum choice mechanics.", features: ["Quantum Oracle", "Observer mode (premium)", "Choice trees", "Subscriptions"] },
      { path: "/time-capsule", title: "Time Capsule", icon: Clock, blurb: "Create capsules that open at a future date with messages, photos and videos.", features: ["Future open dates", "Media attachments", "Recipient lists", "Reminders"] },
      { path: "/time-reversal", title: "Time Reversal", icon: Clock, blurb: "Age backwards, lock ages, glimpse the future. Premium time-manipulation features.", features: ["Time travel speed", "Age locks", "Future glimpse", "Paradox posts"] },
      { path: "/holographic-avatars", title: "Holographic Avatars", icon: Sparkles, blurb: "Create autonomous 3D AI avatars that evolve, battle and breed.", features: ["Avatar creator", "PvP battles", "Breeding", "Marketplace"] },
    ],
  },
  {
    id: "ai-tools",
    title: "AI Tools & Studios",
    icon: Cpu,
    accent: "text-cyan-500",
    intro: "Pay-per-use AI tools — every credit is yours, no subscription required.",
    sections: [
      { path: "/ai-mentor", title: "AI Personal Mentor", icon: Brain, blurb: "Goals, habits, CBT programs, smart milestones and roleplay coaching.", features: ["Smart goals (SMART)", "Habit tracking", "CBT programs", "Personality assessment"] },
      { path: "/content-studio", title: "Content Studio", icon: PenTool, blurb: "Posts, captions, scripts, SEO outlines and ad copy in one studio.", features: ["Social posts", "Ad scripts", "SEO outlines", "Brand voice"] },
      { path: "/creative-forge", title: "CreativeForge", icon: PenTool, blurb: "AI writing studio with co-writer rooms, story bible and content scoring.", features: ["Co-writer rooms", "Story bible", "Brand voices", "Content scoring"] },
      { path: "/ai-generation", title: "AI Image Generation", icon: ImageIcon, blurb: "Premium AI images with style controls. Pay per image, own your output.", features: ["Style controls", "Prompt history", "Community gallery", "Commercial license"] },
      { path: "/analyzer", title: "Universal Analyzer", icon: Search, blurb: "Analyze anything — images, documents, audio — into actionable insights.", features: ["Multi-modal", "Chat with results", "Collections", "Credit-based"] },
      { path: "/video-ad-generator", title: "Video Ad Generator", icon: Video, blurb: "Generate full video ads with script, voiceover and visuals.", features: ["Scripted ads", "Voice synthesis", "Templates", "Export-ready"] },
      { path: "/ai-tattoo", title: "AI Tattoo Designer", icon: ImageIcon, blurb: "Studio-quality tattoo concepts from a prompt.", features: ["8 credits per design", "Save favorites", "Style packs", "Artist-ready exports"] },
      { path: "/ai-clone", title: "AI Personality Clone", icon: Bot, blurb: "Train an AI that talks like you — chat, dating, export.", features: ["Personality training", "Clone battles", "Dating sessions", "Exports"] },
      { path: "/pet-translator", title: "Pet Translator", icon: PawPrint, blurb: "AI translation of pet sounds and body language.", features: ["Sound analysis", "Symptom logger", "Trends", "Pet profiles"] },
      { path: "/handwriting", title: "Handwriting Analyzer", icon: PenTool, blurb: "Personality and trait analysis from handwriting samples.", features: ["Forensic profiles", "Health screens", "Twin profiles", "PDF reports"] },
      { path: "/future-face", title: "Future Face", icon: Clock, blurb: "Age-progressed photos with routine logging and skin scores.", features: ["Age progression", "Skin scores", "Routine logger", "Comparisons"] },
      { path: "/photo-restoration", title: "Photo Restoration", icon: ImageIcon, blurb: "Restore scratched, faded and torn photos in minutes.", features: ["AI restoration", "Color recovery", "Resolution boost", "Batch upload"] },
      { path: "/ai-experiences", title: "AI Experiences", icon: Plane, blurb: "Virtual tours and age progression — paid AI experiences.", features: ["Virtual tours", "Age progression", "Per-action credits", "Stored history"] },
      { path: "/home-designer", title: "Home Designer", icon: Home, blurb: "Redesign any room from a photo with AI staging.", features: ["Room makeovers", "Color palettes", "Furniture recs", "Virtual staging"] },
      { path: "/beauty-studio", title: "Beauty Studio", icon: Sparkles, blurb: "Hair, makeup and skin previews with celebrity matching.", features: ["Hair previews", "Nail designs", "Skin analyses", "Celeb matches"] },
      { path: "/fashion-studio", title: "Fashion Studio", icon: Palette, blurb: "Design outfits, run style battles, shop AI-generated looks.", features: ["Outfit designer", "Style battles", "Marketplace", "OOTD"] },
      { path: "/brand-builder", title: "Brand Builder", icon: Sparkles, blurb: "Generate full brand identity — logo, palette, voice, social kits.", features: ["Logo generator", "Voice guidelines", "Color systems", "Social kits"] },
      { path: "/wine-pairing", title: "Wine Pairing", icon: Sparkles, blurb: "AI pairs the perfect wine to any dish in seconds.", features: ["Dish-to-wine", "Region picks", "Price tiers", "Save favorites"] },
      { path: "/lie-detector", title: "Lie Detector", icon: Shield, blurb: "Voice, text, body-language and screenshot truth scoring. Entertainment only.", features: ["Voice heatmaps", "Body language", "Chat imports", "Detective ranks"] },
      { path: "/stock-content-library", title: "Stock Content Library", icon: ImageIcon, blurb: "Royalty-free AI-generated images, videos and audio.", features: ["Curated packs", "Commercial license", "Collections", "Daily drops"] },
      { path: "/virtual-influencer-agency", title: "Virtual Influencer Agency", icon: Crown, blurb: "Spin up an AI influencer, grow followers, monetize.", features: ["Persona builder", "Content calendar", "Brand deals", "Earnings"] },
    ],
  },
  {
    id: "health",
    title: "Health & Wellness",
    icon: Activity,
    accent: "text-emerald-500",
    intro: "Mental, physical and preventive health — coaches, scanners and trackers powered by AI.",
    sections: [
      { path: "/wellness", title: "Wellness & Relaxation", icon: Heart, blurb: "Guided meditations, breathing, soundscapes and mood journals.", features: ["Daily meditations", "Sleep sounds", "Mood logs", "Streaks"] },
      { path: "/psychologist", title: "AI Psychologist", icon: Brain, blurb: "Conversational sessions, CBT exercises and crisis routing.", features: ["AI sessions", "CBT modules", "Crisis safety", "Session history"] },
      { path: "/first-aid", title: "First Aid", icon: Activity, blurb: "Step-by-step first-aid guides and emergency contacts.", features: ["Symptom guides", "Emergency contacts", "Offline mode", "Family setup"] },
      { path: "/fit-slim", title: "Fit & Slim", icon: Apple, blurb: "AI workout plans, calorie tracking and weight goals.", features: ["AI workouts", "Calorie quests", "Macro tracking", "Goal coach"] },
      { path: "/nutrition-hub", title: "Nutrition Hub", icon: Apple, blurb: "Recipes, meal plans, ingredient scanner and dietary subscriptions.", features: ["Meal plans", "Scanner", "Recipes", "Subscriptions"] },
      { path: "/phobia-trading", title: "Phobia Trading", icon: Brain, blurb: "Treat phobias in tiers, track progress, trade success stories.", features: ["Phobia treatments", "Progress tracking", "Trades", "Subscriptions"] },
      { path: "/safety-prevention", title: "Safety & Prevention", icon: Shield, blurb: "Bullying prevention, online safety education and reporting.", features: ["Safety library", "Reports", "Family setup", "Resources"] },
    ],
  },
  {
    id: "sports",
    title: "Sports Arenas",
    icon: Trophy,
    accent: "text-amber-500",
    intro: "Fantasy leagues for every major sport plus original PvP arenas.",
    sections: [
      { path: "/character-arena", title: "Character Arena", icon: Trophy, blurb: "PvP between created characters with battles, votes and evolution.", features: ["Battles", "Evolution", "Votes", "Posts"] },
      { path: "/horse-racing", title: "Horse Racing Arena", icon: Trophy, blurb: "Train horses, race, buy currency, list on the market.", features: ["Training", "Races", "Marketplace", "Currency"] },
      { path: "/football-arena", title: "Football Arena", icon: Trophy, blurb: "Manage teams, leagues, transfers, equipment and stadiums.", features: ["Leagues", "Transfers", "Equipment", "Stadiums"] },
      { path: "/basketball-arena", title: "Basketball Arena", icon: Trophy, blurb: "Full basketball management — players, matches, standings.", features: ["Players", "Matches", "Standings", "Training"] },
      { path: "/hockey-arena", title: "Hockey Arena", icon: Trophy, blurb: "Hockey leagues with deep team management.", features: ["Leagues", "Teams", "Players", "Equipment"] },
      { path: "/tennis-arena", title: "Tennis Arena", icon: Trophy, blurb: "Tennis tournaments and player progression.", features: ["Tournaments", "Player growth", "Rankings", "Matches"] },
      { path: "/american-football-arena", title: "American Football", icon: Trophy, blurb: "Full NFL-style fantasy with transfers and training.", features: ["Teams", "Leagues", "Transfers", "Stadiums"] },
      { path: "/f1-racing", title: "GP Fantasy Racing", icon: Car, blurb: "Build cars, fantasy teams, races and subscriptions.", features: ["Car builder", "Fantasy teams", "Races", "Leaderboard"] },
    ],
  },
  {
    id: "entertainment",
    title: "Entertainment & Lifestyle",
    icon: Music,
    accent: "text-rose-500",
    intro: "Live shows, virtual pets, mystery boxes, escape rooms — daily fun and creator economy.",
    sections: [
      { path: "/shadow-arena", title: "Shadow Arena", icon: Ghost, blurb: "Horror & dark-content platform with battles and clips.", features: ["Horror clips", "Voting", "Earnings", "Subscriptions"] },
      { path: "/live-concerts", title: "Live Concerts", icon: Music, blurb: "Buy tickets, tip artists, request songs and join recordings.", features: ["Ticket types", "Song requests", "Gifts", "Recordings"] },
      { path: "/masterchef-subscription", title: "KitchenStars Arena", icon: ChefHat, blurb: "Cooking competition with weekly awards, live streams and votes.", features: ["Competitions", "Live cooking", "Awards", "Recipe posts"] },
      { path: "/glamour-world", title: "Glamour World", icon: Crown, blurb: "Style your pets, create glamour stories and earn coins.", features: ["Pet glamour", "Stories", "Creations", "Coins"] },
      { path: "/comedy-club", title: "Comedy Club", icon: Mic2, blurb: "Stand-up shows with tickets, tips, gifts and open mics.", features: ["Live shows", "Open mics", "Tips", "Battles"] },
      { path: "/influ-king", title: "Influ-King", icon: Star, blurb: "Influencer ladder — content, tips, subscriptions and gifts.", features: ["Tip jar", "Subscriptions", "Gifts", "Withdrawals"] },
      { path: "/virtual-escape-room", title: "Virtual Escape Room", icon: Lock, blurb: "Solve puzzle rooms, earn rewards, climb leaderboards.", features: ["Puzzles", "Challenges", "Leaderboard", "Subscriptions"] },
      { path: "/mystery-box", title: "Mystery Box", icon: Gift, blurb: "Surprise boxes with rewards, mystery items and badges.", features: ["Boxes", "Rewards", "Mystery badges", "Events"] },
      { path: "/secret-santa", title: "Social Gifts Hub", icon: Gift, blurb: "Send gifts, run secret santa and group exchanges.", features: ["Gift sending", "Secret santa", "Group exchanges", "Wishlist"] },
      { path: "/vacationer", title: "Vacationer", icon: Plane, blurb: "Travel planning with destinations, reviews and photos.", features: ["Destinations", "Reviews", "Photo gallery", "Plans"] },
      { path: "/cooking", title: "Cooking Hub", icon: ChefHat, blurb: "AI recipes, chef chat, meal plans and scanner.", features: ["AI recipes", "Chef chat", "Meal plans", "Scanner"] },
      { path: "/coffee", title: "Coffee Community", icon: Coffee, blurb: "Cafe check-ins, ratings, dating events and reviews.", features: ["Cafe check-ins", "Reviews", "Events", "Matches"] },
      { path: "/virtual-pet", title: "Virtual Pet", icon: PawPrint, blurb: "Adopt, feed, train and breed virtual pets with mini-games.", features: ["Pet care", "Mini-games", "Breeding", "Battles"] },
    ],
  },
  {
    id: "marketplaces",
    title: "Marketplaces & Commerce",
    icon: Store,
    accent: "text-blue-500",
    intro: "Buy, sell and auction everything — properties, skills, coupons, antiques and collectibles.",
    sections: [
      { path: "/property-marketplace", title: "Property Marketplace", icon: Building2, blurb: "List, browse and favorite properties with submissions and verification.", features: ["Listings", "Favorites", "Submissions", "Verified sellers"] },
      { path: "/marketplace", title: "Skills Marketplace", icon: Briefcase, blurb: "Hire freelancers or sell skills with responses and subscriptions.", features: ["Skill listings", "Responses", "Notifications", "Subscriptions"] },
      { path: "/skill-swap", title: "Global Skill Swap", icon: Globe, blurb: "Trade skills 1:1 globally — no money, just exchange.", features: ["Skill profiles", "Matching", "Settings", "Worldwide"] },
      { path: "/bazaar", title: "Bazaar", icon: Store, blurb: "Marketplace with escrow, disputes, reviews and ratings.", features: ["Escrow protection", "Disputes", "Seller ratings", "Saved searches"] },
      { path: "/coupon-marketplace", title: "Coupon Marketplace", icon: Ticket, blurb: "Buy and sell verified coupons with cashback and battles.", features: ["Verified coupons", "Cashback", "Coupon battles", "Wishlist"] },
      { path: "/auction", title: "Online Auctions", icon: Gavel, blurb: "Live auctions with bidding, escrow and withdrawals.", features: ["Live bidding", "Escrow", "Photo galleries", "Disputes"] },
      { path: "/collectibles", title: "Collectibles", icon: Sparkles, blurb: "Trade collectibles, rarities, evolution and achievements.", features: ["Rarities", "Trades", "Achievements", "Evolution"] },
      { path: "/antique-appraisal", title: "Antique Appraisal", icon: Gem, blurb: "AI estimates antique value with photos and collections.", features: ["AI appraisal", "Collections", "Marketplace", "Credit-based"] },
    ],
  },
  {
    id: "learning",
    title: "Learning & Growth",
    icon: GraduationCap,
    accent: "text-indigo-500",
    intro: "Courses, flashcards, IQ tests, mentors and brain duels — gamified learning.",
    sections: [
      { path: "/education", title: "Education Hub", icon: GraduationCap, blurb: "Flashcards, daily challenges, study groups, math solver, AI tutor.", features: ["Flashcards & SRS", "Daily challenge", "AI tutor", "Certificates"] },
      { path: "/tutorial-platform", title: "Tutorials & Courses", icon: BookOpen, blurb: "Buy courses, take quizzes, earn certificates, leave reviews.", features: ["Courses", "Quizzes", "Live lessons", "Certificates"] },
      { path: "/iq-platform", title: "IQ Platform", icon: Brain, blurb: "IQ tests, daily challenges, duels, leaderboards and tournaments.", features: ["IQ tests", "Daily challenges", "Duels", "Tournaments"] },
      { path: "/brain-duel", title: "BrainDuel", icon: Trophy, blurb: "Real-time knowledge battles with powerups, leagues and SRS.", features: ["Live matches", "Leagues", "Powerups", "SRS cards"] },
      { path: "/kids-channel", title: "Kids Channel", icon: Video, blurb: "Safe video channel for ages 6–12 with parental controls.", features: ["Curated videos", "Parental gate", "Watch history", "Recommendations"] },
      { path: "/coloring-pages", title: "Coloring Pages", icon: Palette, blurb: "AI-generated coloring pages with contests, collabs and POD.", features: ["AI pages", "Contests", "Collabs", "Print-on-demand"] },
    ],
  },
  {
    id: "kids",
    title: "Kids Academy (6–12) & Teen (13–18)",
    icon: Sparkles,
    accent: "text-yellow-500",
    intro: "Age-gated learning for children and teens with parental oversight.",
    sections: [
      { path: "/kids", title: "Kids Academy Hub", icon: Sparkles, blurb: "Central hub for all kids learning tools and progress.", features: ["Daily plan", "Parent digest", "XP system", "Family share"] },
      { path: "/kids-homework", title: "Homework Helper", icon: BookOpen, blurb: "AI-guided homework help with challenges and points.", features: ["AI help", "Daily challenges", "Points", "Achievements"] },
      { path: "/kids-story-creator", title: "Story Creator", icon: BookOpen, blurb: "Kids create illustrated stories with AI.", features: ["AI stories", "Illustrations", "Share", "Credits"] },
      { path: "/kids-science-lab", title: "Science Lab", icon: FlaskConical, blurb: "Safe experiments with quizzes and certificates.", features: ["Experiments", "Quizzes", "Certificates", "Progress"] },
      { path: "/kids-drawing-buddy", title: "Drawing Buddy", icon: Palette, blurb: "Guided drawing lessons with AI feedback.", features: ["Drawing lessons", "AI feedback", "Subscriptions", "Gallery"] },
      { path: "/kids-reading-companion", title: "Reading Companion", icon: BookOpen, blurb: "Reading practice with audio, sessions and credits.", features: ["Reading sessions", "Audio", "Levels", "Subscriptions"] },
      { path: "/teen-career-counselor", title: "Career Counselor", icon: Briefcase, blurb: "Career guidance for teens with AI advisor.", features: ["Career paths", "Aptitude", "Advisor", "Resources"] },
    ],
  },
  {
    id: "jobs",
    title: "Work & Careers",
    icon: Briefcase,
    accent: "text-sky-500",
    intro: "Full job platform — applications, ATS, AI ranking, salaries, interviews and referrals.",
    sections: [
      { path: "/jobs", title: "Jobs", icon: Briefcase, blurb: "Browse, save and apply to jobs with AI matching.", features: ["AI match score", "Saved jobs", "Alerts", "Applications"] },
      { path: "/jobs/companies", title: "Companies", icon: Building2, blurb: "Company profiles, reviews and salary insights.", features: ["Profiles", "Reviews", "Verified employers", "Photos"] },
      { path: "/jobs/salaries", title: "Salary Insights", icon: Star, blurb: "Salary data by role, location and company.", features: ["Role data", "Geographic", "Trends", "Negotiation"] },
      { path: "/jobs/interviews", title: "Interview Prep", icon: Brain, blurb: "Practice questions, mock interviews, video resumes.", features: ["Question bank", "Mock interview", "Video CV", "Templates"] },
      { path: "/jobs/career-path", title: "Career Path", icon: GraduationCap, blurb: "Visualize your career trajectory with AI guidance.", features: ["Path nodes", "Skill gaps", "Recommendations", "Goals"] },
      { path: "/jobs/headhunters", title: "Headhunters", icon: Search, blurb: "Hire or be hired by professional headhunters.", features: ["Headhunter profiles", "Engagements", "Verification", "Payments"] },
      { path: "/jobs/ai-jd-writer", title: "AI JD Writer", icon: PenTool, blurb: "Generate full job descriptions from a brief.", features: ["AI generation", "Templates", "Drafts", "Diversity"] },
    ],
  },
  {
    id: "brand-arena",
    title: "Brand Arena",
    icon: Trophy,
    accent: "text-orange-500",
    intro: "Brands battle for community votes with 20+ features for sponsors and fans.",
    sections: [
      { path: "/brand-battle", title: "Brand Battle", icon: Trophy, blurb: "Vote in brand battles, earn voter pass, trade cards.", features: ["Brand cards", "Voter pass", "Predictions", "Tournaments"] },
      { path: "/brand-battle/hub", title: "Arena Hub", icon: Sparkles, blurb: "All 20 arena features in one place.", features: ["20 features", "Tribes", "Investments", "Stocks"] },
      { path: "/sponsor-registration", title: "Become a Sponsor", icon: Crown, blurb: "Onboard your brand as an arena sponsor.", features: ["Registration", "Verification", "Branding", "Events"] },
      { path: "/sponsor-dashboard", title: "Sponsor Dashboard", icon: Building2, blurb: "Manage campaigns, AI insights, API keys.", features: ["Campaigns", "AI insights", "API keys", "Earnings"] },
    ],
  },
  {
    id: "megatalent",
    title: "Megatalent",
    icon: Crown,
    accent: "text-fuchsia-500",
    intro: "Premium talent competition with 80/20 escrow, watch parties and creator subscriptions.",
    sections: [
      { path: "/megatalent", title: "Megatalent Hub", icon: Crown, blurb: "Browse talents by category, vote, tip and subscribe.", features: ["Categories", "Voting", "Tips", "Subscriptions"], tag: "Premium" },
      { path: "/megatalent/battle-results", title: "Battle Results", icon: Trophy, blurb: "Tournament brackets and winner payouts.", features: ["Brackets", "Live votes", "Winners", "Payouts"] },
    ],
  },
  {
    id: "fundraising",
    title: "Fundraising",
    icon: Heart,
    accent: "text-red-500",
    intro: "Cause-specific fundraising with transparent platform fees (5–10%) and Stripe Connect payouts.",
    sections: [
      { path: "/fundraising", title: "Fundraising Hub", icon: Heart, blurb: "Browse all active campaigns by category.", features: ["All causes", "Search", "Donor stats", "Updates"] },
      { path: "/fundraising/medical", title: "Medical (6%)", icon: Heart, blurb: "Medical treatment and emergency campaigns.", features: ["Medical proof", "Updates", "Milestones", "Direct payout"] },
      { path: "/fundraising/dream", title: "Dream Maker (7%)", icon: Sparkles, blurb: "Fund personal dreams with backer rewards.", features: ["Backer tiers", "Updates", "Goal tracking", "Rewards"] },
      { path: "/fundraising/hero", title: "Community Hero (5%)", icon: Shield, blurb: "Recognize and fund community heroes.", features: ["Thank-you messages", "Updates", "Lowest fee", "Verified"] },
      { path: "/fundraising/pet", title: "Pet Rescue (6%)", icon: PawPrint, blurb: "Animal rescue and veterinary fundraising.", features: ["Rescue stories", "Vet proof", "Updates", "Photos"] },
      { path: "/fundraising/student", title: "Student Support (5%)", icon: GraduationCap, blurb: "Tuition, textbooks and student emergencies.", features: ["Verified students", "Milestones", "Lowest fee", "Updates"] },
      { path: "/fundraising/crisis", title: "Crisis Relief (8%)", icon: AlertTriangle, blurb: "Disaster and crisis response with partner orgs.", features: ["Partner orgs", "Distribution", "Higher overhead", "Real-time"] },
      { path: "/fundraising/talent", title: "Talent Sponsorship (10%)", icon: Star, blurb: "Sponsor emerging talent — highest creator support.", features: ["Talent matching", "Recurring", "Approval flow", "Stripe Connect"] },
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
    return CATEGORIES
      .map((cat) => ({
        ...cat,
        sections: cat.sections.filter((s) =>
          s.title.toLowerCase().includes(q) ||
          s.blurb.toLowerCase().includes(q) ||
          s.features.some((f) => f.toLowerCase().includes(q))
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
              and how to use it. Skim, search or jump straight in.
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
                {cat.sections.map((section) => (
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
                        <ul className="space-y-1 mb-4 flex-1">
                          {section.features.map((f) => (
                            <li key={f} className="text-xs flex items-start gap-1.5">
                              <span className="text-primary mt-0.5">•</span>
                              <span className="text-foreground/80">{f}</span>
                            </li>
                          ))}
                        </ul>
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
                ))}
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
