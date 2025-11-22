import { Trophy } from "lucide-react";
import { useAchievements } from "@/hooks/useAchievements";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";

export const AchievementsBadge = () => {
  const { userAchievements, allAchievements, totalPoints, isLoading } = useAchievements();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 bg-muted rounded-full px-3 py-1.5 animate-pulse">
        <Trophy className="w-4 h-4" />
        <span className="text-sm font-bold">...</span>
      </div>
    );
  }

  const progress = allAchievements.length > 0 
    ? (userAchievements.length / allAchievements.length) * 100 
    : 0;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-2 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full px-3 py-1.5 hover:from-primary/20 hover:to-accent/20 transition-all group">
          <Trophy className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
          <span className="text-sm font-bold text-foreground">{totalPoints}</span>
          <span className="text-xs text-muted-foreground">pts</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold">Achievements</h4>
              <span className="text-sm text-muted-foreground">
                {userAchievements.length}/{allAchievements.length}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {allAchievements.map((achievement) => {
              const earned = userAchievements.find(ua => ua.id === achievement.id);
              return (
                <div
                  key={achievement.id}
                  className={`flex items-start gap-3 p-2 rounded-lg ${
                    earned ? "bg-primary/5" : "bg-muted/50 opacity-50"
                  }`}
                >
                  <div className="text-2xl">{achievement.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h5 className="font-medium text-sm">{achievement.name}</h5>
                      <span className="text-xs text-primary font-bold">
                        +{achievement.points}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {achievement.description}
                    </p>
                    {earned && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Earned {new Date(earned.earned_at!).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
