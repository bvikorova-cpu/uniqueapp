import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  points_required: number;
}

interface UnlockedAchievement {
  achievement_id: string;
  unlocked_at: string;
}

interface AchievementsGridProps {
  achievements: Achievement[] | undefined;
  unlockedAchievements: UnlockedAchievement[] | undefined;
}

export const AchievementsGrid = ({ achievements, unlockedAchievements }: AchievementsGridProps) => {
  const unlockedIds = new Set(unlockedAchievements?.map(a => a.achievement_id) || []);

  return (
    <>
      <FloatingHowItWorks title={"Achievements Grid - How it works"} steps={[{ title: 'Open', desc: 'Access the Achievements Grid section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Achievements Grid.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card>
      <CardHeader>
        <CardTitle>Achievements & Badges</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {achievements?.map((achievement) => {
            const isUnlocked = unlockedIds.has(achievement.id);
            
            return (
              <div
                key={achievement.id}
                className={cn(
                  "relative p-4 rounded-lg border-2 text-center transition-all",
                  isUnlocked
                    ? "bg-gradient-to-br from-primary/20 to-secondary/20 border-primary/50 shadow-lg"
                    : "bg-muted/50 border-muted-foreground/20 opacity-60"
                )}
              >
                {!isUnlocked && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-lg">
                    <Lock className="w-6 h-6 text-muted-foreground" />
                  </div>
                )}
                
                <div className="text-4xl mb-2">{achievement.icon}</div>
                <h3 className="font-semibold text-sm mb-1">{achievement.name}</h3>
                <p className="text-xs text-muted-foreground mb-2">{achievement.description}</p>
                
                <Badge variant={isUnlocked ? "default" : "secondary"} className="text-xs">
                  {isUnlocked ? "Unlocked!" : `${achievement.points_required} pts`}
                </Badge>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
    </>
  );
};
