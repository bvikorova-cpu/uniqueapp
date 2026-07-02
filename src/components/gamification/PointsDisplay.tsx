import { Trophy, Star, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useGamification } from "@/hooks/useGamification";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState, useRef } from "react";
import LevelUpModal from "./LevelUpModal";
import { triggerLevelUpConfetti } from "@/utils/confetti";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const calculateLevelProgress = (currentLevel: number, totalPoints: number) => {
  // XP needed for next level = current_level * 100
  const xpForCurrentLevel = (currentLevel - 1) * 100;
  const xpForNextLevel = currentLevel * 100;
  const xpInCurrentLevel = totalPoints - xpForCurrentLevel;
  const xpNeededForLevel = xpForNextLevel - xpForCurrentLevel;
  const progressPercentage = Math.min((xpInCurrentLevel / xpNeededForLevel) * 100, 100);
  
  return {
    current: xpInCurrentLevel,
    needed: xpNeededForLevel,
    percentage: progressPercentage,
    nextLevel: currentLevel + 1,
  };
};

export const PointsDisplay = () => {
  const [userId, setUserId] = useState<string | undefined>();
  const { data } = useGamification(userId);
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const previousLevel = useRef<number>(0);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id);
    });
  }, []);

  useEffect(() => {
    // Trigger level-up celebration when level increases
    if (data && previousLevel.current > 0 && data.points.level > previousLevel.current) {
      triggerLevelUpConfetti();
      setShowLevelUpModal(true);
    }
    if (data) {
      previousLevel.current = data.points.level;
    }
  }, [data?.points.level]);

  if (!data) return null;

  const progress = calculateLevelProgress(data.points.level, data.points.total_points);

  return (
    <>
      <FloatingHowItWorks title={"Points Display - How it works"} steps={[{ title: 'Open', desc: 'Access the Points Display section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Points Display.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <>
      <LevelUpModal
        open={showLevelUpModal}
        onOpenChange={setShowLevelUpModal}
        level={data.points.level}
        totalXP={data.points.total_points}
      />
      
      <Card className="animate-fade-in">
        <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Level and XP badges */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="gap-1 text-lg px-3 py-1">
                <Trophy className="h-4 w-4" />
                Level {data.points.level}
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Star className="h-3 w-3 text-yellow-500" />
                {data.points.total_points} XP
              </Badge>
            </div>
            
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span className="font-medium">Level {progress.nextLevel}</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-2">
            <div className="relative">
              <Progress 
                value={progress.percentage} 
                className="h-3 animate-fade-in shadow-sm"
              />
              <div 
                className="absolute inset-0 rounded-full bg-primary/20 blur-sm -z-10 transition-opacity duration-700"
                style={{ opacity: progress.percentage > 0 ? 0.5 : 0 }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{progress.current} / {progress.needed} XP</span>
              <span className="font-medium text-primary">
                {progress.needed - progress.current} XP to next level
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
    </>
    </>
  );
};