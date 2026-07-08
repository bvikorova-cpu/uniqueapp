import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAICredits } from "@/hooks/useAICredits";
import { useNutritionStats } from "@/hooks/useNutritionStats";
import { NutritionHero } from "@/components/nutrition/NutritionHero";
import {
  Utensils, Camera, Trophy, Store, Dumbbell, Target,
  Sparkles, ShoppingBag, ArrowLeft, Flame, Droplets,
  Pill, ShoppingCart, Activity, Zap, ShieldAlert, Swords,
  MessageCircle, ScanBarcode, BarChart3
} from "lucide-react";

// Sub-views
import MealPlannerGenerator from "@/components/nutrition/MealPlannerGenerator";
import FoodScanner from "@/components/nutrition/FoodScanner";
import MacroTracker from "@/components/nutrition/MacroTracker";
import RestaurantAnalyzer from "@/components/nutrition/RestaurantAnalyzer";
import CalorieQuests from "@/components/nutrition/CalorieQuests";
import WorkoutMatcher from "@/components/nutrition/WorkoutMatcher";
import AIHydrationCoach from "@/components/nutrition/AIHydrationCoach";
import AISupplementAdvisor from "@/components/nutrition/AISupplementAdvisor";
import AIGroceryBudgetOptimizer from "@/components/nutrition/AIGroceryBudgetOptimizer";
import AIBodyCompositionPredictor from "@/components/nutrition/AIBodyCompositionPredictor";
import AIAllergyScanner from "@/components/nutrition/AIAllergyScanner";
import SocialMealChallenges from "@/components/nutrition/SocialMealChallenges";
import AINutritionCoachChat from "@/components/nutrition/AINutritionCoachChat";
import AIBarcodeScanner from "@/components/nutrition/AIBarcodeScanner";
import WeeklyProgressDashboard from "@/components/nutrition/WeeklyProgressDashboard";

import { HeroRewardedAd } from "@/components/ads/HeroRewardedAd";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
type ActiveView = "dashboard" | "meal-planner" | "food-scanner" | "macro-tracker" |
  "restaurant" | "quests" | "workout" | "hydration" | "supplements" | "grocery" | "body-predictor" |
  "allergy-scanner" | "meal-challenges" | "nutrition-coach" | "barcode-scanner" | "weekly-progress";

const tools = [
  { id: "meal-planner" as ActiveView, title: "AI Meal Planner", description: "Generate personalized meal plans with macros", icon: Utensils, cost: "50 Credits", gradient: "from-orange-500/20 to-amber-500/20", iconColor: "text-orange-500" },
  { id: "food-scanner" as ActiveView, title: "Smart Food Scanner", description: "Scan food photos for nutritional info", icon: Camera, cost: "10 Credits", gradient: "from-blue-500/20 to-cyan-500/20", iconColor: "text-blue-500" },
  { id: "macro-tracker" as ActiveView, title: "Macro Tracker", description: "Track daily calories & macros with goals", icon: Target, cost: "Free", gradient: "from-emerald-500/20 to-green-500/20", iconColor: "text-emerald-500" },
  { id: "restaurant" as ActiveView, title: "Restaurant Intelligence", description: "AI menu analysis & healthy recommendations", icon: Store, cost: "25 Credits", gradient: "from-yellow-500/20 to-orange-500/20", iconColor: "text-yellow-500" },
  { id: "quests" as ActiveView, title: "Calorie Quests", description: "Gamified fitness challenges & XP leveling", icon: Trophy, cost: "Free", gradient: "from-purple-500/20 to-pink-500/20", iconColor: "text-purple-500" },
  { id: "workout" as ActiveView, title: "AI Workout Planner", description: "Personalized workout + nutrition match", icon: Dumbbell, cost: "30 Credits", gradient: "from-red-500/20 to-rose-500/20", iconColor: "text-red-500" },
  { id: "hydration" as ActiveView, title: "AI Hydration Coach", description: "Smart water intake based on your body", icon: Droplets, cost: "3 Credits", gradient: "from-cyan-500/20 to-blue-500/20", iconColor: "text-cyan-500" },
  { id: "supplements" as ActiveView, title: "AI Supplement Advisor", description: "Personalized vitamin recommendations", icon: Pill, cost: "8 Credits", gradient: "from-green-500/20 to-emerald-500/20", iconColor: "text-green-500" },
  { id: "grocery" as ActiveView, title: "Grocery Budget Optimizer", description: "Meal plans within your budget", icon: ShoppingCart, cost: "6 Credits", gradient: "from-teal-500/20 to-cyan-500/20", iconColor: "text-teal-500" },
  { id: "body-predictor" as ActiveView, title: "Body Composition Predictor", description: "Predict body changes 30/60/90 days", icon: Activity, cost: "10 Credits", gradient: "from-violet-500/20 to-purple-500/20", iconColor: "text-violet-500" },
  { id: "allergy-scanner" as ActiveView, title: "AI Allergy Scanner", description: "Detect allergens in any dish or ingredients", icon: ShieldAlert, cost: "5 Credits", gradient: "from-red-500/20 to-orange-500/20", iconColor: "text-red-500", isNew: true },
  { id: "meal-challenges" as ActiveView, title: "Social Meal Challenges", description: "Competitive healthy eating leagues & XP", icon: Swords, cost: "8 Credits", gradient: "from-pink-500/20 to-rose-500/20", iconColor: "text-pink-500", isNew: true },
  { id: "nutrition-coach" as ActiveView, title: "AI Nutrition Coach", description: "Real-time expert nutrition chat advisor", icon: MessageCircle, cost: "2 Credits/msg", gradient: "from-indigo-500/20 to-blue-500/20", iconColor: "text-indigo-500", isNew: true },
  { id: "barcode-scanner" as ActiveView, title: "AI Barcode Scanner", description: "Instant product nutrition mapping", icon: ScanBarcode, cost: "3 Credits", gradient: "from-amber-500/20 to-yellow-500/20", iconColor: "text-amber-500", isNew: true },
  { id: "weekly-progress" as ActiveView, title: "Weekly Progress Dashboard", description: "Charts & AI insights for your week", icon: BarChart3, cost: "6 Credits", gradient: "from-violet-500/20 to-indigo-500/20", iconColor: "text-violet-500", isNew: true },
];

export default function NutritionHub() {
  const navigate = useNavigate();
  const { credits, loading: creditsLoading } = useAICredits();
  const { dailyStreak, achievements, loading: statsLoading } = useNutritionStats();
  const [activeView, setActiveView] = useState<ActiveView>("dashboard");

  const viewsWithBackButton = ["hydration", "supplements", "grocery", "body-predictor", "allergy-scanner", "meal-challenges", "nutrition-coach", "barcode-scanner", "weekly-progress"];

  const renderActiveView = () => {
    const back = () => setActiveView("dashboard");
    switch (activeView) {
      case "meal-planner": return <MealPlannerGenerator />;
      case "food-scanner": return <FoodScanner />;
      case "macro-tracker": return <MacroTracker />;
      case "restaurant": return <RestaurantAnalyzer />;
      case "quests": return <CalorieQuests />;
      case "workout": return <WorkoutMatcher />;
      case "hydration": return <AIHydrationCoach onBack={back} />;
      case "supplements": return <AISupplementAdvisor onBack={back} />;
      case "grocery": return <AIGroceryBudgetOptimizer onBack={back} />;
      case "body-predictor": return <AIBodyCompositionPredictor onBack={back} />;
      case "allergy-scanner": return <AIAllergyScanner onBack={back} />;
      case "meal-challenges": return <SocialMealChallenges onBack={back} />;
      case "nutrition-coach": return <AINutritionCoachChat onBack={back} />;
      case "barcode-scanner": return <AIBarcodeScanner onBack={back} />;
      case "weekly-progress": return <WeeklyProgressDashboard onBack={back} />;
      default: return null;
    }
  };

  if (activeView !== "dashboard") {
    const hasBackButton = viewsWithBackButton.includes(activeView);
    return (
      <div className="min-h-screen flex flex-col bg-background">
      <FloatingHowItWorks title="NutritionHub — How it works" steps={[{title:"Open the tool",desc:"Launch NutritionHub from the menu to access its features."},{title:"Explore options",desc:"Browse available cards, filters and personalized recommendations."},{title:"Interact & track",desc:"Log entries, start sessions or run AI scans. Some AI actions cost 3–5 credits."},{title:"Review progress",desc:"Check your dashboard for streaks, achievements and history."}]} />
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-20">
          {!hasBackButton && (
            <Button variant="ghost" onClick={() => setActiveView("dashboard")} className="gap-2 mb-4 drop-shadow-md">
              <ArrowLeft className="h-4 w-4" /> Back to Dashboard
            </Button>
          )}
          {renderActiveView()}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-20">
        <NutritionHero />

        <HeroRewardedAd sectionKey="page_nutritionhub" />

        {/* Engagement Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="p-4 bg-card/80 backdrop-blur-xl border-border/60 hover:scale-[1.02] transition-transform group">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 group-hover:from-orange-500/30 group-hover:to-red-500/30 transition-colors">
                  <Flame className="h-6 w-6 text-orange-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Daily Streak</p>
                  <p className="text-2xl font-black bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">{statsLoading ? "…" : `${dailyStreak} Day${dailyStreak === 1 ? "" : "s"}`}</p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Card className="p-4 bg-card/80 backdrop-blur-xl border-border/60 hover:scale-[1.02] transition-transform group">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 group-hover:from-primary/30 group-hover:to-accent/30 transition-colors">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">AI Credits</p>
                  <p className="text-2xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    {creditsLoading ? "..." : credits?.credits_remaining || 0}
                  </p>
                </div>
                {(!credits || credits.credits_remaining < 50) && (
                  <Button size="sm" variant="outline" onClick={() => navigate('/ai-credits-store')} className="ml-auto gap-1 hover:scale-105 transition-transform">
                    <ShoppingBag className="h-3 w-3" /> Buy
                  </Button>
                )}
              </div>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="p-4 bg-card/80 backdrop-blur-xl border-border/60 hover:scale-[1.02] transition-transform group">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 group-hover:from-green-500/30 group-hover:to-emerald-500/30 transition-colors">
                  <Trophy className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Achievements</p>
                  <p className="text-2xl font-black bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">{statsLoading ? "…" : achievements}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Tool Cards Grid */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
          <h2 className="text-2xl font-black mb-6 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            🍎 Nutrition AI Tools ({tools.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {tools.map((tool, i) => (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.04, type: "spring", stiffness: 200 }}
              >
                <Card
                  className="p-4 bg-card/80 backdrop-blur-xl border-border/60 cursor-pointer hover:scale-[1.04] hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 active:scale-[0.97] group relative overflow-hidden"
                  onClick={() => setActiveView(tool.id)}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${tool.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                  
                  {(tool as any).isNew && (
                    <motion.span 
                      initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5 + i * 0.04, type: "spring" }}
                      className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-accent text-accent-foreground text-[10px] font-bold z-10 animate-pulse"
                    >
                      NEW
                    </motion.span>
                  )}
                  
                  <div className="flex items-start gap-3 relative z-10">
                    <div className={`p-2.5 rounded-xl bg-gradient-to-br ${tool.gradient} group-hover:scale-110 transition-transform duration-300`}>
                      <tool.icon className={`h-6 w-6 ${tool.iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm truncate">{tool.title}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{tool.description}</p>
                      <span className="inline-block mt-2 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                        {tool.cost}
                      </span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Pro Tips */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="mt-10">
          <Card className="p-6 bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5 border-primary/20 backdrop-blur-xl">
            <h3 className="text-lg font-black mb-3 flex items-center gap-2">
              <Zap className="h-5 w-5 text-accent" />
              Pro Tips to Maximize Your Nutrition Journey
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { icon: "📸", tip: "Scan every meal to build accurate calorie history" },
                { icon: "🎯", tip: "Set macro targets in Tracker for precision goals" },
                { icon: "💧", tip: "Use Hydration Coach daily for energy optimization" },
                { icon: "🏋️", tip: "Pair Workout Planner with Meal Plans for max results" },
                { icon: "🛒", tip: "Budget Optimizer saves 20-40% on weekly groceries" },
                { icon: "📊", tip: "Weekly Dashboard tracks trends you can't see daily" },
                { icon: "⚠️", tip: "Allergy Scanner catches hidden allergens in seconds" },
                { icon: "🏆", tip: "Challenge friends in Social Meals for accountability" },
                { icon: "💬", tip: "Ask the AI Coach anything about nutrition 24/7" },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-card/50">
                  <span className="text-lg">{item.icon}</span>
                  <p className="text-xs text-muted-foreground">{item.tip}</p>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
