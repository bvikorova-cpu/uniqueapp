import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAICredits } from "@/hooks/useAICredits";
import { NutritionHero } from "@/components/nutrition/NutritionHero";
import {
  Utensils, Camera, Trophy, Store, Dumbbell, Target,
  Sparkles, ShoppingBag, ArrowLeft, Flame, Droplets,
  Pill, ShoppingCart, Activity, ChefHat, Wine, MessageCircle
} from "lucide-react";

// Lazy sub-views
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

type ActiveView = "dashboard" | "meal-planner" | "food-scanner" | "macro-tracker" |
  "restaurant" | "quests" | "workout" | "hydration" | "supplements" | "grocery" | "body-predictor";

const tools = [
  { id: "meal-planner" as ActiveView, title: "AI Meal Planner", description: "Generate personalized meal plans", icon: Utensils, cost: "50 Credits", color: "text-orange-500" },
  { id: "food-scanner" as ActiveView, title: "Smart Food Scanner", description: "Scan food for nutritional info", icon: Camera, cost: "10 Credits", color: "text-blue-500" },
  { id: "macro-tracker" as ActiveView, title: "Macro Tracker", description: "Track daily calories & macros", icon: Target, cost: "Free", color: "text-emerald-500" },
  { id: "restaurant" as ActiveView, title: "Restaurant Intelligence", description: "AI menu analysis & recommendations", icon: Store, cost: "25 Credits", color: "text-yellow-500" },
  { id: "quests" as ActiveView, title: "Calorie Quests", description: "Gamified fitness challenges & XP", icon: Trophy, cost: "Free", color: "text-purple-500" },
  { id: "workout" as ActiveView, title: "AI Workout Planner", description: "Personalized workout + nutrition", icon: Dumbbell, cost: "30 Credits", color: "text-red-500" },
  { id: "hydration" as ActiveView, title: "AI Hydration Coach", description: "Smart water intake plan", icon: Droplets, cost: "3 Credits", color: "text-cyan-500", isNew: true },
  { id: "supplements" as ActiveView, title: "AI Supplement Advisor", description: "Personalized vitamin recommendations", icon: Pill, cost: "8 Credits", color: "text-green-500", isNew: true },
  { id: "grocery" as ActiveView, title: "Grocery Budget Optimizer", description: "Meal plans within your budget", icon: ShoppingCart, cost: "6 Credits", color: "text-teal-500", isNew: true },
  { id: "body-predictor" as ActiveView, title: "Body Composition Predictor", description: "Predict body changes over time", icon: Activity, cost: "10 Credits", color: "text-violet-500", isNew: true },
];

export default function NutritionHub() {
  const navigate = useNavigate();
  const { credits, loading: creditsLoading } = useAICredits();
  const [activeView, setActiveView] = useState<ActiveView>("dashboard");

  const renderActiveView = () => {
    switch (activeView) {
      case "meal-planner": return <MealPlannerGenerator />;
      case "food-scanner": return <FoodScanner />;
      case "macro-tracker": return <MacroTracker />;
      case "restaurant": return <RestaurantAnalyzer />;
      case "quests": return <CalorieQuests />;
      case "workout": return <WorkoutMatcher />;
      case "hydration": return <AIHydrationCoach onBack={() => setActiveView("dashboard")} />;
      case "supplements": return <AISupplementAdvisor onBack={() => setActiveView("dashboard")} />;
      case "grocery": return <AIGroceryBudgetOptimizer onBack={() => setActiveView("dashboard")} />;
      case "body-predictor": return <AIBodyCompositionPredictor onBack={() => setActiveView("dashboard")} />;
      default: return null;
    }
  };

  if (activeView !== "dashboard") {
    const hasBackButton = ["hydration", "supplements", "grocery", "body-predictor"].includes(activeView);
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-20">
          {!hasBackButton && (
            <Button variant="ghost" onClick={() => setActiveView("dashboard")} className="gap-2 mb-4">
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
        {/* Cinematic Video Hero */}
        <NutritionHero />

        {/* Engagement Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="p-4 bg-card/80 backdrop-blur-xl border-border/60 hover:scale-[1.02] transition-transform">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-orange-500/10">
                  <Flame className="h-6 w-6 text-orange-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Daily Streak</p>
                  <p className="text-2xl font-black">0 Days</p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Card className="p-4 bg-card/80 backdrop-blur-xl border-border/60 hover:scale-[1.02] transition-transform">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">AI Credits</p>
                  <p className="text-2xl font-black">
                    {creditsLoading ? "..." : credits?.credits_remaining || 0}
                  </p>
                </div>
                {(!credits || credits.credits_remaining < 50) && (
                  <Button size="sm" variant="outline" onClick={() => navigate('/ai-credits-store')} className="ml-auto gap-1">
                    <ShoppingBag className="h-3 w-3" /> Buy
                  </Button>
                )}
              </div>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="p-4 bg-card/80 backdrop-blur-xl border-border/60 hover:scale-[1.02] transition-transform">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-green-500/10">
                  <Trophy className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Achievements</p>
                  <p className="text-2xl font-black">0</p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Tool Cards Grid */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
          <h2 className="text-2xl font-black mb-4 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            Nutrition Tools
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {tools.map((tool, i) => (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.04 }}
              >
                <Card
                  className="p-4 bg-card/80 backdrop-blur-xl border-border/60 cursor-pointer hover:scale-[1.03] hover:shadow-lg hover:shadow-primary/10 transition-all active:scale-[0.97] group relative overflow-hidden"
                  onClick={() => setActiveView(tool.id)}
                >
                  {(tool as any).isNew && (
                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-accent text-accent-foreground text-[10px] font-bold">NEW</span>
                  )}
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <tool.icon className={`h-6 w-6 ${tool.color}`} />
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
      </main>
    </div>
  );
}
