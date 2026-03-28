import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Lock, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface CrystalToolViewProps {
  toolName: string;
  onBack: () => void;
}

const toolDetails: Record<string, { title: string; description: string; features: string[]; price?: string; navigateTo?: string }> = {
  "AI Energy Reading": {
    title: "AI Energy Reading",
    description: "Upload a photo and let our AI detect your energy levels, aura patterns, and chakra alignment. Get personalized crystal recommendations based on your unique energy signature.",
    features: ["Photo-based energy detection", "Aura pattern visualization", "Chakra alignment check", "Personalized crystal suggestions", "Energy report with insights", "Before/after comparison"],
    price: "€3 per reading",
  },
  "Energy Healing": {
    title: "Energy Healing Session",
    description: "A comprehensive 1-hour guided healing session powered by AI. Receive personalized energy assessment, custom crystal therapy plans, and follow-up recommendations.",
    features: ["1-hour guided session", "AI energy assessment", "Custom crystal therapy plan", "Guided meditation included", "Follow-up recommendations", "Session recording access"],
    price: "€20 per session",
  },
  "Chakra Balancing": {
    title: "Chakra Balancing Program",
    description: "Complete 7-day program to align all 7 chakras. Daily AI coaching, personalized crystal therapy, and progress tracking for holistic energy balance.",
    features: ["7-day comprehensive program", "All 7 chakras addressed", "Personalized crystal therapy", "Daily AI coaching & guidance", "Progress tracking & reports", "Certificate of completion"],
    price: "€30 per program",
  },
  "Crystal Encyclopedia": {
    title: "Premium Crystal Encyclopedia",
    description: "Access our comprehensive database of 500+ crystal profiles with detailed properties, healing uses, compatibility information, and AI-powered recommendations.",
    features: ["500+ crystal profiles", "Healing properties database", "Crystal compatibility charts", "AI-powered recommendations", "Daily crystal insights", "Exclusive content updates"],
    price: "€7/month",
  },
  "Crystal Marketplace": {
    title: "Crystal Marketplace",
    description: "Buy and sell authentic crystals with AI-verified authenticity certificates. Connect with verified sellers worldwide and find the perfect crystals for your collection.",
    features: ["Verified crystal listings", "AI authenticity certificates", "Secure payment via Stripe", "Seller ratings & reviews", "Global shipping tracking", "15% platform commission"],
    navigateTo: "/crystal-marketplace",
  },
  "Crystal Scanner": {
    title: "Crystal Scanner",
    description: "Upload a photo of any crystal and our AI will instantly identify it, provide detailed information about its properties, energy levels, and healing applications.",
    features: ["Instant crystal identification", "Properties & origin info", "Energy level assessment", "Healing application guide", "Rarity & value estimation", "Collection cataloging"],
    price: "€2 per scan",
  },
  "Crystal Collection": {
    title: "Crystal Collection Manager",
    description: "Organize and manage your personal crystal collection with photos, values, energy profiles, and healing notes. Track your growing collection over time.",
    features: ["Add crystals with photos", "Track value & rarity", "Energy profile per crystal", "Healing notes & journal", "Collection statistics", "Share your collection"],
  },
  "Daily Crystal Oracle": {
    title: "Daily Crystal Oracle",
    description: "Receive a daily crystal card with personalized mantra, healing guidance, and energy alignment tips based on your profile and the current cosmic energies.",
    features: ["Daily crystal card draw", "Personalized mantra", "Energy alignment tips", "Moon phase integration", "Weekly crystal forecasts", "Shareable oracle cards"],
  },
  "Crystal Compatibility": {
    title: "Crystal Compatibility",
    description: "AI-powered compatibility analysis between two people based on their energy profiles and crystal affinities. Discover which crystals enhance your connections.",
    features: ["Dual energy analysis", "Compatibility score", "Recommended pair crystals", "Relationship enhancement tips", "Energy synergy report", "Shareable results"],
    price: "€5 per analysis",
  },
  "Meditation Timer": {
    title: "Meditation Timer",
    description: "Guided meditation sessions with crystal frequency sound healing. Choose from various crystal-tuned frequencies for deep relaxation and energy alignment.",
    features: ["Customizable timer", "Crystal frequency sounds", "Guided meditations", "Breathing exercises", "Session history tracking", "Streak rewards"],
  },
  "Aura Analysis": {
    title: "Aura Analysis",
    description: "Deep AI-powered aura pattern detection and analysis. Discover your dominant aura colors, energy blocks, and receive crystal recommendations for aura cleansing.",
    features: ["Aura color detection", "Energy block identification", "Aura strength score", "Crystal cleansing plan", "Historical aura tracking", "Detailed PDF report"],
    price: "€8 per analysis",
  },
  "Crystal Guide": {
    title: "Crystal Healing Guide",
    description: "Step-by-step guided healing journeys for specific intentions — stress relief, love, abundance, protection, and more. Each path includes crystal recommendations.",
    features: ["10+ healing journeys", "Step-by-step guidance", "Crystal recommendations", "Progress milestones", "Community shared paths", "Custom journey builder"],
  },
  "Energy Analytics": {
    title: "Energy Analytics Dashboard",
    description: "Track your energy levels over time with detailed charts and insights. See patterns, improvements, and get AI recommendations for maintaining optimal energy balance.",
    features: ["Energy level timeline", "Mood & energy correlation", "Crystal usage tracking", "Weekly/monthly reports", "Goal setting & tracking", "AI trend insights"],
  },
  "Moon Phase Crystals": {
    title: "Moon Phase Crystals",
    description: "Discover which crystals are most potent during each moon phase. Get daily recommendations aligned with lunar cycles for maximum healing effectiveness.",
    features: ["Real-time moon phase", "Phase-specific crystals", "Lunar calendar integration", "Ritual suggestions", "Eclipse special guidance", "Monthly crystal planner"],
  },
  "Third Eye Training": {
    title: "Third Eye Training",
    description: "Guided intuition development exercises using crystal meditation techniques. Strengthen your third eye chakra and enhance your spiritual awareness.",
    features: ["Progressive exercises", "Crystal meditation guides", "Intuition tests & scores", "Visualization training", "Weekly challenges", "Community rankings"],
    price: "€15 per program",
  },
  "Energy Cleansing": {
    title: "Energy Cleansing Rituals",
    description: "Learn proper crystal cleansing and charging techniques. Follow guided rituals for full moon charging, sage cleansing, sunlight activation, and more.",
    features: ["Cleansing method guides", "Charging calendars", "Full moon reminders", "Sage ritual instructions", "Sound cleansing guide", "Crystal care tips"],
  },
  "Live Crystal ID": {
    title: "Live Crystal Identification",
    description: "Use your device camera to identify crystals in real-time. Our AI instantly recognizes crystal types, provides detailed information about properties, origin, and healing applications.",
    features: ["Real-time camera recognition", "Instant crystal identification", "Properties & healing info", "Origin & formation details", "Rarity assessment", "Save to your collection"],
    price: "€2 per identification",
  },
  "Crystal Sound Bath": {
    title: "Crystal Sound Bath",
    description: "Immersive audio healing sessions using crystal singing bowl frequencies. Each session is tuned to specific chakras and energy centers for deep relaxation and healing.",
    features: ["Crystal bowl frequencies", "Chakra-tuned sessions", "Binaural beat integration", "Session duration options", "Background ambient sounds", "Offline download access"],
  },
  "Crystal Origin Map": {
    title: "Crystal Origin Map",
    description: "Explore an interactive world map showing where different crystals are found. Learn about geological formations, mining regions, and the journey of each crystal type.",
    features: ["Interactive world map", "Crystal mining regions", "Geological formation info", "Rarity by region", "Trade route history", "Filter by crystal type"],
  },
  "Crystal Community": {
    title: "Crystal Community",
    description: "Join a vibrant social network of crystal enthusiasts and healers. Share your experiences, ask questions, showcase your collection, and learn from experienced practitioners.",
    features: ["Discussion forums", "Crystal photo sharing", "Expert Q&A sessions", "Collection showcases", "Local meetup events", "Healer directory"],
  },
  "Energy Leaderboard": {
    title: "Energy Leaderboard",
    description: "Gamified ranking system that tracks your healing journey progress. Earn points for readings, meditations, and collection growth. Compete with other healers worldwide.",
    features: ["Global energy rankings", "Weekly challenges", "Achievement badges", "Point multipliers", "Seasonal tournaments", "Community rewards"],
  },
  "Crystal Sub Box": {
    title: "Crystal Subscription Box",
    description: "Receive a monthly curated box of crystals selected by AI based on your energy profile, healing goals, and collection gaps. Each box includes information cards and care instructions.",
    features: ["AI-curated selection", "Monthly delivery", "Energy profile matching", "Information cards included", "Exclusive rare crystals", "Cancel anytime"],
    price: "€29/month",
  },
};

export const CrystalToolView = ({ toolName, onBack }: CrystalToolViewProps) => {
  const navigate = useNavigate();
  const details = toolDetails[toolName] || { title: toolName, description: "Tool details coming soon.", features: [] };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <Button variant="ghost" onClick={onBack} className="mb-4 gap-2">
        <ArrowLeft className="w-4 h-4" />
        Back to Hub
      </Button>

      <Card className="bg-card/80 backdrop-blur-xl border-border/50">
        <CardHeader>
          <CardTitle className="text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            {details.title}
          </CardTitle>
          <CardDescription className="text-base">{details.description}</CardDescription>
          {details.price && (
            <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-sm font-semibold text-primary w-fit">
              <Sparkles className="w-3.5 h-3.5" />
              {details.price}
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {details.features.map((feature, i) => (
              <motion.div
                key={feature}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/30"
              >
                <Lock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm text-muted-foreground">{feature}</span>
              </motion.div>
            ))}
          </div>

          <div className="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/20 text-center">
            <p className="text-sm text-muted-foreground mb-3">
              {details.price
                ? "This premium feature requires payment. Start your crystal healing journey today."
                : details.navigateTo
                  ? "Visit the marketplace to browse and purchase authentic crystals."
                  : "Sign in to unlock this feature and begin your healing journey."
              }
            </p>
            <Button onClick={() => details.navigateTo ? navigate(details.navigateTo) : null}>
              {details.navigateTo ? "Visit Marketplace" : details.price ? "Purchase Now" : "Get Started"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
