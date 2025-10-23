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
  Sparkles, ShoppingBag, Target
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
                  onClick={() => navigate('/megastore')}
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
