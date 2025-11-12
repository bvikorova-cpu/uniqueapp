import { useFriendChallengeAchievements } from "@/hooks/useFriendChallengeAchievements";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Award, RefreshCw } from "lucide-react";
import AchievementBadge from "./AchievementBadge";
import { FRIEND_CHALLENGE_ACHIEVEMENTS } from "@/types/brain-duel-achievements";
import { useEffect, useState } from "react";

interface AchievementsShowcaseProps {
  userId?: string;
  compact?: boolean;
}

export default function AchievementsShowcase({ userId, compact = false }: AchievementsShowcaseProps) {
  const { achievements, isLoading, checkAndAwardAchievements, isChecking } = useFriendChallengeAchievements(userId);
  const [hasAutoChecked, setHasAutoChecked] = useState(false);

  // Auto-check achievements on first load
  useEffect(() => {
    if (userId && !hasAutoChecked && !isLoading) {
      checkAndAwardAchievements(userId);
      setHasAutoChecked(true);
    }
  }, [userId, hasAutoChecked, isLoading, checkAndAwardAchievements]);

  if (compact && achievements.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Achievements
          </CardTitle>
          {userId && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => checkAndAwardAchievements(userId)}
              disabled={isChecking}
            >
              <RefreshCw className={`h-4 w-4 ${isChecking ? 'animate-spin' : ''}`} />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground text-center py-4">Loading...</p>
        ) : achievements.length === 0 ? (
          <div className="text-center py-6 space-y-2">
            <p className="text-sm text-muted-foreground">No achievements yet</p>
            <p className="text-xs text-muted-foreground">
              Win friend challenges to unlock badges!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3">
              {achievements.map((achievement) => (
                <AchievementBadge
                  key={achievement.id}
                  achievementType={achievement.achievement_type}
                  size={compact ? 'sm' : 'md'}
                />
              ))}
            </div>
            {!compact && (
              <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground text-center">
                  {achievements.length} of {Object.keys(FRIEND_CHALLENGE_ACHIEVEMENTS).length} achievements unlocked
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
