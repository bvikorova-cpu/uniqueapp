import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Award, Globe, Trophy, Star, Target, Crown, Compass, Map } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface ExplorerAchievementsProps {
  visitedCount: number;
  totalDestinations: number;
}

const ACHIEVEMENT_DEFINITIONS = [
  { code: "first_tour", name: "First Steps", description: "Complete your first virtual tour", icon: "🚶", requirement: 1 },
  { code: "explorer_5", name: "Curious Explorer", description: "Visit 5 different destinations", icon: "🌍", requirement: 5 },
  { code: "explorer_10", name: "World Traveler", description: "Visit 10 different destinations", icon: "✈️", requirement: 10 },
  { code: "explorer_20", name: "Globe Trotter", description: "Visit 20 different destinations", icon: "🗺️", requirement: 20 },
  { code: "explorer_33", name: "World Master", description: "Visit all 33 destinations", icon: "👑", requirement: 33 },
  { code: "time_traveler", name: "Time Traveler", description: "Try the age progression feature", icon: "⏳", requirement: 1 },
  { code: "planner", name: "Master Planner", description: "Create your first AI travel plan", icon: "📋", requirement: 1 },
  { code: "postcard_sender", name: "Postcard Writer", description: "Send your first virtual postcard", icon: "💌", requirement: 1 },
];

export const ExplorerAchievements = ({ visitedCount, totalDestinations }: ExplorerAchievementsProps) => {
  const [achievements, setAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAchievements();
    checkAndAwardAchievements();
  }, [visitedCount]);

  const loadAchievements = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("explorer_achievements").select("*").eq("user_id", user.id);
    if (data) setAchievements(data);
    setLoading(false);
  };

  const checkAndAwardAchievements = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const explorerAchievements = ACHIEVEMENT_DEFINITIONS.filter(a => a.code.startsWith("explorer_") || a.code === "first_tour");
    for (const ach of explorerAchievements) {
      if (visitedCount >= ach.requirement) {
        await supabase.from("explorer_achievements").upsert({
          user_id: user.id,
          achievement_code: ach.code,
          achievement_name: ach.name,
          achievement_description: ach.description,
          icon: ach.icon,
        }, { onConflict: "user_id,achievement_code" });
      }
    }
    await loadAchievements();
  };

  const earnedCodes = new Set(achievements.map(a => a.achievement_code));
  const progressPercent = (visitedCount / totalDestinations) * 100;

  return (
    <>
      <FloatingHowItWorks title={"Explorer Achievements - How it works"} steps={[{ title: 'Open', desc: 'Access the Explorer Achievements section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Explorer Achievements.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Trophy className="h-5 w-5 text-primary" />Explorer Progress</CardTitle>
          <CardDescription>Track your journey across the world</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Destinations Visited</span>
            <span className="font-bold">{visitedCount} / {totalDestinations}</span>
          </div>
          <Progress value={progressPercent} className="h-3" />
          <div className="grid grid-cols-3 gap-4 pt-2">
            <div className="text-center">
              <div className="text-2xl font-black text-primary">{visitedCount}</div>
              <div className="text-xs text-muted-foreground">Visited</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-amber-500">{achievements.length}</div>
              <div className="text-xs text-muted-foreground">Badges Earned</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-emerald-500">{ACHIEVEMENT_DEFINITIONS.length - achievements.length}</div>
              <div className="text-xs text-muted-foreground">Remaining</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievement Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {ACHIEVEMENT_DEFINITIONS.map((ach, i) => {
          const isEarned = earnedCodes.has(ach.code);
          return (
            <motion.div key={ach.code} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
              <Card className={`h-full text-center transition-all ${isEarned ? "border-primary/40 bg-primary/5 shadow-lg" : "opacity-60 grayscale"}`}>
                <CardContent className="p-4 space-y-2">
                  <div className="text-3xl sm:text-4xl">{ach.icon}</div>
                  <h4 className="font-bold text-sm">{ach.name}</h4>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">{ach.description}</p>
                  {isEarned ? (
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-[10px]">✓ Earned</Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px]">Locked</Badge>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
    </>
  );
};
