import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/Navbar";

import { KidsAcademyHero } from "@/components/kids/academy/KidsAcademyHero";
import { AdventureWorldMap } from "@/components/kids/academy/AdventureWorldMap";
import { KidsAcademyProgress } from "@/components/kids/academy/KidsAcademyProgress";
import { KidsAcademyStreak } from "@/components/kids/academy/KidsAcademyStreak";
import { KidsAcademyQuizArena } from "@/components/kids/academy/KidsAcademyQuizArena";
import { KidsAcademyShop } from "@/components/kids/academy/KidsAcademyShop";
import { KidsAcademyParentPanel } from "@/components/kids/academy/KidsAcademyParentPanel";
import { Card, CardContent } from "@/components/ui/card";
import { Crown } from "lucide-react";

const KidsAcademy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8 mt-16">
        <div className="max-w-6xl mx-auto">
          <KidsAcademyHero />


          {/* Premium Banner */}
          <Card className="mb-6 border-2 border-primary/30 bg-gradient-to-r from-primary/5 to-accent/5">
            <CardContent className="py-3">
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <Crown className="w-5 h-5 text-primary" />
                <span className="font-semibold text-sm text-foreground">Premium: €5/month</span>
                <span className="text-muted-foreground">•</span>
                <span className="text-sm text-muted-foreground">Unlimited access to ALL modules</span>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="explore" className="w-full">
            <TabsList className="grid grid-cols-3 sm:grid-cols-6 gap-1 h-auto bg-muted p-1.5">
              <TabsTrigger value="explore" className="text-xs">🗺️ Explore</TabsTrigger>
              <TabsTrigger value="progress" className="text-xs">⭐ Progress</TabsTrigger>
              <TabsTrigger value="streaks" className="text-xs">🔥 Streaks</TabsTrigger>
              <TabsTrigger value="quiz" className="text-xs">⚔️ Quiz Arena</TabsTrigger>
              <TabsTrigger value="shop" className="text-xs">🛒 Shop</TabsTrigger>
              <TabsTrigger value="parents" className="text-xs">👨‍👩‍👧 Parents</TabsTrigger>
            </TabsList>

            <div className="mt-6">
              <TabsContent value="explore">
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
