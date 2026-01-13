import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame, Trophy, Coins, Clock } from "lucide-react";
import { useVotingStreak } from "@/hooks/useVotingStreak";
import { useBrandBattleCredits } from "@/hooks/useBrandBattleCredits";
import { useEffect, useState } from "react";

export const VotingStreakCard = () => {
  const { data: streak, isLoading: streakLoading } = useVotingStreak();
  const { data: credits, isLoading: creditsLoading } = useBrandBattleCredits();
  const [timeUntilReset, setTimeUntilReset] = useState("");

  // Calculate time until midnight (votes reset)
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      
      const diff = midnight.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeUntilReset(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  if (streakLoading || creditsLoading) return null;

  const streakDays = streak?.currentStreak || 0;
  const daysUntilBonus = 7 - (streakDays % 7);
  const isCloseToBonus = daysUntilBonus <= 2 && daysUntilBonus > 0;

  return (
    <Card className="p-4 bg-gradient-to-br from-orange-500/20 via-red-500/10 to-purple-500/20 border-orange-500/30">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Streak */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Flame className="h-5 w-5 text-orange-500" />
            <span className="text-2xl font-bold text-orange-500">
              {streakDays}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">Day Streak</p>
          {isCloseToBonus && (
            <Badge variant="secondary" className="mt-1 text-[10px] animate-pulse">
              {daysUntilBonus} days to +20 bonus!
            </Badge>
          )}
        </div>

        {/* Credits Balance */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Coins className="h-5 w-5 text-yellow-500" />
            <span className="text-2xl font-bold text-yellow-500">
              {credits?.creditsBalance || 0}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">Credits</p>
        </div>

        {/* Longest Streak */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Trophy className="h-5 w-5 text-purple-500" />
            <span className="text-2xl font-bold text-purple-500">
              {streak?.longestStreak || 0}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">Best Streak</p>
        </div>

        {/* Time Until Reset */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Clock className="h-5 w-5 text-blue-500" />
            <span className="text-lg font-mono font-bold text-blue-500">
              {timeUntilReset}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">Votes Reset In</p>
        </div>
      </div>
    </Card>
  );
};
