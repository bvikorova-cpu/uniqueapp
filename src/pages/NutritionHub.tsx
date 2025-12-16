import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAICredits } from "@/hooks/useAICredits";
import { 
  Utensils, Camera, Trophy, Store, Dumbbell, Apple, 
  Sparkles, ShoppingBag, Target, Info, Star, Zap, CheckCircle
} from "lucide-react";
import MealPlannerGenerator from "@/components/nutrition/MealPlannerGenerator";
import FoodScanner from "@/components/nutrition/FoodScanner";
import MacroTracker from "@/components/nutrition/MacroTracker";
import RestaurantAnalyzer from "@/components/nutrition/RestaurantAnalyzer";
import CalorieQuests from "@/components/nutrition/CalorieQuests";
import WorkoutMatcher from "@/components/nutrition/WorkoutMatcher";

export default function NutritionHub() {
  const navigate = useNavigate();
  const { credits, loading: creditsLoading } = useAICredits();
  const [activeTab, setActiveTab] = useState("meal-planner");

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-background/80">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-green-500/10 via-blue-500/10 to-purple-500/10 py-6 mt-16">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
              <Apple className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">AI Nutrition Hub</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 bg-clip-text text-transparent">
              Your Complete Nutrition & Fitness Platform
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              AI-powered meal planning, food scanning, calorie tracking, and gamified fitness goals
            </p>
            
            {/* Credits Display */}
            <div className="flex items-center justify-center gap-4 pt-2">
              <Card className="p-3 bg-background/50 backdrop-blur">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <div className="text-left">
                    <p className="text-xs text-muted-foreground">AI Credits</p>
                    <p className="text-xl font-bold">
                      {creditsLoading ? "..." : credits?.credits_remaining || 0}
                    </p>
                  </div>
                </div>
              </Card>
              
              {(!credits || credits.credits_remaining < 50) && (
                <Button 
                  onClick={() => navigate('/ai-credits-store')}
                  variant="default"
                  className="gap-2"
                >
                  <ShoppingBag className="h-4 w-4" />
                  Buy Credits
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Description Section */}
      <div className="container mx-auto px-3 sm:px-4 py-4">
        <Card className="p-4 sm:p-6 bg-gradient-to-r from-green-500/10 via-blue-500/10 to-purple-500/10 border-green-500/20">
          <div className="flex items-start gap-3 mb-4">
            <Info className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-base sm:text-lg mb-2">What is AI Nutrition Hub?</h3>
              <p className="text-sm text-muted-foreground">
                AI Nutrition Hub is your all-in-one platform for healthy living. Use advanced AI to generate personalized meal plans, scan food for nutritional information, track your macros and calories, analyze restaurant menus, complete fitness quests, and find workouts matched to your goals. All powered by cutting-edge artificial intelligence.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                How to Use
              </h4>
              <ul className="text-xs sm:text-sm text-muted-foreground space-y-1">
                <li>• <strong>Meal Planner:</strong> Generate AI-powered weekly meal plans</li>
                <li>• <strong>Food Scanner:</strong> Scan food to get nutritional info</li>
                <li>• <strong>Macro Tracker:</strong> Track daily calories and macros</li>
                <li>• <strong>Restaurant:</strong> Analyze menu items before ordering</li>
                <li>• <strong>Quests:</strong> Complete fitness challenges for rewards</li>
                <li>• <strong>Workout:</strong> Get AI-matched exercise routines</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <Zap className="h-4 w-4 text-blue-500" />
                Key Features
              </h4>
              <ul className="text-xs sm:text-sm text-muted-foreground space-y-1">
                <li className="flex items-center gap-1"><CheckCircle className="h-3 w-3 text-green-500" /> AI-generated personalized meal plans</li>
                <li className="flex items-center gap-1"><CheckCircle className="h-3 w-3 text-green-500" /> Instant food nutrition scanning</li>
                <li className="flex items-center gap-1"><CheckCircle className="h-3 w-3 text-green-500" /> Complete macro and calorie tracking</li>
                <li className="flex items-center gap-1"><CheckCircle className="h-3 w-3 text-green-500" /> Restaurant menu analysis</li>
                <li className="flex items-center gap-1"><CheckCircle className="h-3 w-3 text-green-500" /> Gamified fitness quests</li>
                <li className="flex items-center gap-1"><CheckCircle className="h-3 w-3 text-green-500" /> AI workout recommendations</li>
              </ul>
            </div>
          </div>

          <div className="text-xs text-muted-foreground bg-background/50 rounded-lg p-3">
            <strong>Tip:</strong> Start with the Meal Planner to get a personalized weekly plan, then use the Macro Tracker to log your meals and stay on track with your nutrition goals.
          </div>
        </Card>
      </div>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 lg:w-[800px] mx-auto">
            <TabsTrigger value="meal-planner" className="gap-2">
              <Utensils className="h-4 w-4" />
              <span className="hidden sm:inline">Meal Planner</span>
            </TabsTrigger>
            <TabsTrigger value="food-scanner" className="gap-2">
              <Camera className="h-4 w-4" />
              <span className="hidden sm:inline">Scanner</span>
            </TabsTrigger>
            <TabsTrigger value="macro-tracker" className="gap-2">
              <Target className="h-4 w-4" />
              <span className="hidden sm:inline">Tracker</span>
            </TabsTrigger>
            <TabsTrigger value="restaurant" className="gap-2">
              <Store className="h-4 w-4" />
              <span className="hidden sm:inline">Restaurant</span>
            </TabsTrigger>
            <TabsTrigger value="quests" className="gap-2">
              <Trophy className="h-4 w-4" />
              <span className="hidden sm:inline">Quests</span>
            </TabsTrigger>
            <TabsTrigger value="workout" className="gap-2">
              <Dumbbell className="h-4 w-4" />
              <span className="hidden sm:inline">Workout</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="meal-planner" className="space-y-6">
            <MealPlannerGenerator />
          </TabsContent>

          <TabsContent value="food-scanner" className="space-y-6">
            <FoodScanner />
          </TabsContent>

          <TabsContent value="macro-tracker" className="space-y-6">
            <MacroTracker />
          </TabsContent>

          <TabsContent value="restaurant" className="space-y-6">
            <RestaurantAnalyzer />
          </TabsContent>

          <TabsContent value="quests" className="space-y-6">
            <CalorieQuests />
          </TabsContent>

          <TabsContent value="workout" className="space-y-6">
            <WorkoutMatcher />
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}
