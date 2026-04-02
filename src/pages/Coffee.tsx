import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CoffeeHero } from "@/components/coffee/CoffeeHero";
import { CoffeeCreditsDisplay } from "@/components/coffee/CoffeeCreditsDisplay";
import { AIBrewingAdvisor } from "@/components/coffee/AIBrewingAdvisor";
import { AIBeanExpert } from "@/components/coffee/AIBeanExpert";
import { AICafeRecommender } from "@/components/coffee/AICafeRecommender";
import { AILatteArtCoach } from "@/components/coffee/AILatteArtCoach";
import { AICoffeePairing } from "@/components/coffee/AICoffeePairing";
import { AICoffeeHealthAnalyzer } from "@/components/coffee/AICoffeeHealthAnalyzer";
import { AICoffeeJournal } from "@/components/coffee/AICoffeeJournal";
import { AICoffeeBeanScanner } from "@/components/coffee/AICoffeeBeanScanner";
import { AISubscriptionBoxCurator } from "@/components/coffee/AISubscriptionBoxCurator";
import { AIBaristaCertification } from "@/components/coffee/AIBaristaCertification";
import { AICoffeeTastingNotes } from "@/components/coffee/AICoffeeTastingNotes";
import { AICoffeeRecipeCreator } from "@/components/coffee/AICoffeeRecipeCreator";
import {
  Coffee as CoffeeIcon, MapPin, Users, Trophy, Star, Flame,
  Leaf, Palette, UtensilsCrossed, Heart, Award, Sparkles,
  BookOpen, ScanLine, Package, GraduationCap, Wine, ChefHat
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

type ActiveView = "hub" | "brewing" | "bean" | "cafe-rec" | "latte-art" | "pairing" | "health"
  | "journal" | "scanner" | "sub-box" | "certification" | "tasting" | "recipe";

const AI_TOOLS = [
  { id: "brewing" as const, icon: CoffeeIcon, label: "AI Brewing Advisor", desc: "Perfect your brew technique", color: "from-amber-600 to-amber-800", cost: "3 Credits" },
  { id: "bean" as const, icon: Leaf, label: "AI Bean Expert", desc: "Origin & flavor profiles", color: "from-green-600 to-emerald-800", cost: "3 Credits" },
  { id: "cafe-rec" as const, icon: MapPin, label: "AI Cafe Recommender", desc: "Find your perfect spot", color: "from-rose-600 to-pink-800", cost: "3 Credits" },
  { id: "latte-art" as const, icon: Palette, label: "AI Latte Art Coach", desc: "Master milk patterns", color: "from-purple-600 to-violet-800", cost: "3 Credits" },
  { id: "pairing" as const, icon: UtensilsCrossed, label: "AI Food Pairing", desc: "Coffee & food combos", color: "from-orange-600 to-amber-800", cost: "3 Credits" },
  { id: "health" as const, icon: Heart, label: "AI Health Analyzer", desc: "Caffeine impact analysis", color: "from-red-600 to-rose-800", cost: "3 Credits" },
  { id: "journal" as const, icon: BookOpen, label: "AI Coffee Journal", desc: "Daily diary & mood insights", color: "from-amber-500 to-yellow-700", cost: "3 Credits", isNew: true },
  { id: "scanner" as const, icon: ScanLine, label: "AI Bean Scanner", desc: "Label analysis & profiles", color: "from-cyan-600 to-teal-800", cost: "3 Credits", isNew: true },
  { id: "sub-box" as const, icon: Package, label: "AI Box Curator", desc: "Personalized bean boxes", color: "from-pink-600 to-rose-800", cost: "3 Credits", isNew: true },
  { id: "certification" as const, icon: GraduationCap, label: "Barista Certification", desc: "AI-powered exam & badge", color: "from-yellow-600 to-amber-800", cost: "5 Credits", isNew: true },
  { id: "tasting" as const, icon: Wine, label: "AI Tasting Notes", desc: "Structured flavor analysis", color: "from-violet-600 to-purple-800", cost: "3 Credits", isNew: true },
  { id: "recipe" as const, icon: ChefHat, label: "AI Recipe Creator", desc: "Custom drink recipes", color: "from-orange-500 to-red-800", cost: "3 Credits", isNew: true },
];

const NAV_ITEMS = [
  { icon: MapPin, label: "Check-ins & Reviews", path: "/coffee/checkins" },
  { icon: Users, label: "Coffee Buddy", path: "/coffee/buddy" },
  { icon: Trophy, label: "Leaderboard", path: "/coffee/leaderboard" },
];

const VIEWS: Record<string, React.FC<{ onBack: () => void }>> = {
  brewing: AIBrewingAdvisor,
  bean: AIBeanExpert,
  "cafe-rec": AICafeRecommender,
  "latte-art": AILatteArtCoach,
  pairing: AICoffeePairing,
  health: AICoffeeHealthAnalyzer,
  journal: AICoffeeJournal,
  scanner: AICoffeeBeanScanner,
  "sub-box": AISubscriptionBoxCurator,
  certification: AIBaristaCertification,
  tasting: AICoffeeTastingNotes,
  recipe: AICoffeeRecipeCreator,
};

const Coffee = () => {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<ActiveView>("hub");

  const { data: profile } = useQuery({
    queryKey: ["coffee-profile-stats"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await supabase.from("coffee_profiles").select("*").eq("user_id", user.id).maybeSingle();
      return data;
    },
  });

  const back = () => setActiveView("hub");

  // Render active tool view
  if (activeView !== "hub") {
    const ViewComponent = VIEWS[activeView];
    if (ViewComponent) {
      return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <ViewComponent onBack={back} />
        </div>
      );
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <CoffeeHero />

        {/* Engagement Row */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <Card className="p-3 sm:p-4 bg-card/80 backdrop-blur-xl border-amber-500/20 text-center">
            <Flame className="h-5 w-5 text-amber-400 mx-auto mb-1" />
            <p className="text-lg sm:text-2xl font-black">{profile?.total_checkins || 0}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Check-ins</p>
          </Card>
          <Card className="p-3 sm:p-4 bg-card/80 backdrop-blur-xl border-amber-500/20 text-center">
            <Star className="h-5 w-5 text-yellow-400 mx-auto mb-1" />
            <p className="text-lg sm:text-2xl font-black">{profile?.total_points || 0}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Points</p>
          </Card>
          <Card className="p-3 sm:p-4 bg-card/80 backdrop-blur-xl border-amber-500/20 text-center">
            <Award className="h-5 w-5 text-purple-400 mx-auto mb-1" />
            <p className="text-lg sm:text-2xl font-black capitalize">{profile?.subscription_tier || "Free"}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Tier</p>
          </Card>
        </div>

        <div className="mb-8">
          <CoffeeCreditsDisplay />
        </div>

        {/* Quick Navigation */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <motion.div key={item.path} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Card
                  className="p-4 cursor-pointer hover:border-amber-500/40 transition-all bg-card/80 backdrop-blur-xl border-amber-500/20 text-center"
                  onClick={() => navigate(item.path)}
                >
                  <Icon className="h-6 w-6 text-amber-400 mx-auto mb-2" />
                  <p className="text-xs sm:text-sm font-semibold">{item.label}</p>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* AI Tools Grid */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-amber-400" />
            <h2 className="text-xl sm:text-2xl font-black">AI Coffee Tools</h2>
            <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">12 Tools</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {AI_TOOLS.map((tool) => {
              const Icon = tool.icon;
              return (
                <motion.div key={tool.id} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Card
                    className="relative p-4 cursor-pointer hover:border-amber-500/40 transition-all bg-card/80 backdrop-blur-xl border-amber-500/20 group overflow-hidden"
                    onClick={() => setActiveView(tool.id)}
                  >
                    {tool.isNew && (
                      <span className="absolute top-2 right-2 text-[9px] font-bold bg-amber-500 text-black px-1.5 py-0.5 rounded-full animate-pulse">NEW</span>
                    )}
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${tool.color} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <p className="text-xs sm:text-sm font-semibold leading-tight">{tool.label}</p>
                    <p className="text-[10px] text-muted-foreground mt-1 hidden sm:block">{tool.desc}</p>
                    <p className="text-[9px] text-amber-400/70 mt-1">{tool.cost}</p>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Pricing */}
        <div className="mb-8">
          <h2 className="text-xl sm:text-2xl font-black mb-4 text-center">Subscription Plans</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { name: "Free", price: "€0", features: ["3 buddy matches/month", "Basic check-ins", "Standard reviews", "Community access"] },
              { name: "Coffee Lover", price: "€4.99/mo", features: ["Unlimited buddy matches", "Priority matching", "Featured reviews", "Analytics dashboard", "Ad-free experience"], highlight: true },
              { name: "Coffee Expert", price: "€9.99/mo", features: ["Everything in Lover", "Event organization", "Premium analytics", "Priority support", "Exclusive badges"] },
            ].map((plan, i) => (
              <Card key={i} className={`p-5 ${plan.highlight ? "border-amber-500 shadow-lg shadow-amber-500/10" : "border-amber-500/20"} bg-card/80 backdrop-blur-xl`}>
                <h3 className="text-lg font-bold">{plan.name}</h3>
                <p className="text-2xl font-black text-amber-400 mb-3">{plan.price}</p>
                <ul className="space-y-2 mb-4">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm">
                      <Star className="h-3 w-3 text-amber-400 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button className={`w-full ${plan.highlight ? "bg-gradient-to-r from-amber-600 to-amber-800" : ""}`} variant={plan.highlight ? "default" : "outline"}>
                  {i === 0 ? "Get Started" : "Subscribe"}
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Coffee;
