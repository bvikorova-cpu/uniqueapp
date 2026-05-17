import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/Navbar";

import { KidsAcademyHero } from "@/components/kids/academy/KidsAcademyHero";
import { AdventureWorldMap } from "@/components/kids/academy/AdventureWorldMap";
import { KidsAcademyProgress } from "@/components/kids/academy/KidsAcademyProgress";
import { KidsAcademyStreak } from "@/components/kids/academy/KidsAcademyStreak";
import { KidsAcademyQuizArena } from "@/components/kids/academy/KidsAcademyQuizArena";
import { KidsAcademyShop } from "@/components/kids/academy/KidsAcademyShop";
import { KidsAcademyParentPanel } from "@/components/kids/academy/KidsAcademyParentPanel";
import { KidsAcademyDailyPlan } from "@/components/kids/academy/KidsAcademyDailyPlan";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Coins, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { HeroRewardedAd } from "@/components/ads/HeroRewardedAd";
const KidsAcademy = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8 mt-16">
        <div className="max-w-6xl mx-auto">
          <KidsAcademyHero />


          <HeroRewardedAd sectionKey="page_kidsacademy" />

          {/* Buy Credits Hub Banner (paid-only model) */}
          <Card className="mb-6 border-2 border-primary/30 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10">
            <CardContent className="py-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3">
                  <Coins className="w-6 h-6 text-primary" />
                  <div>
                    <p className="font-bold text-sm text-foreground">Pay only for what you use</p>
                    <p className="text-xs text-muted-foreground">
                      Credits for AI tools — Science, Homework, Stories, Chat & more
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button size="sm" variant="outline" onClick={() => navigate("/kids-science-pricing")}>
                    🧪 Science
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => navigate("/kids-homework-pricing")}>
                    📚 Homework
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => navigate("/kids-voice-chat-pricing")}>
                    💬 Chat
                  </Button>
                  <Button size="sm" onClick={() => navigate("/kids-story-pricing")}>
                    <Sparkles className="w-3 h-3 mr-1" /> Stories
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="today" className="w-full">
            <TabsList className="grid grid-cols-3 sm:grid-cols-7 gap-1 h-auto bg-muted p-1.5">
              <TabsTrigger value="today" className="text-xs">✨ Today</TabsTrigger>
              <TabsTrigger value="explore" className="text-xs">🗺️ Explore</TabsTrigger>
              <TabsTrigger value="progress" className="text-xs">⭐ Progress</TabsTrigger>
              <TabsTrigger value="streaks" className="text-xs">🔥 Streaks</TabsTrigger>
              <TabsTrigger value="quiz" className="text-xs">⚔️ Quiz</TabsTrigger>
              <TabsTrigger value="shop" className="text-xs">🛒 Shop</TabsTrigger>
              <TabsTrigger value="parents" className="text-xs">👨‍👩‍👧 Parents</TabsTrigger>
            </TabsList>

            <div className="mt-6">
              <TabsContent value="today">
                <KidsAcademyDailyPlan />
              </TabsContent>
                <AdventureWorldMap />
              </TabsContent>
              <TabsContent value="progress">
                <KidsAcademyProgress />
              </TabsContent>
              <TabsContent value="streaks">
                <KidsAcademyStreak />
              </TabsContent>
              <TabsContent value="quiz">
                <KidsAcademyQuizArena />
              </TabsContent>
              <TabsContent value="shop">
                <KidsAcademyShop />
              </TabsContent>
              <TabsContent value="parents">
                <KidsAcademyParentPanel />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </main>
      
    </div>
  );
};

export default KidsAcademy;
