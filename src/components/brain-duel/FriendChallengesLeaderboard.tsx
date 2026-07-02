import { useFriendChallengeStats } from "@/hooks/useFriendChallengeStats";
import { useFriendChallengeAchievements } from "@/hooks/useFriendChallengeAchievements";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users, TrendingUp, TrendingDown } from "lucide-react";
import AchievementBadge from "./AchievementBadge";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export default function FriendChallengesLeaderboard() {
  const { user } = useAuth();
  const { data: friendStats = [], isLoading } = useFriendChallengeStats(user?.id);
  const { achievements } = useFriendChallengeAchievements(user?.id);

  return (
    <>
      <FloatingHowItWorks title={"Friend Challenges Leaderboard - How it works"} steps={[{ title: 'Open', desc: 'Access the Friend Challenges Leaderboard section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Friend Challenges Leaderboard.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="overflow-hidden backdrop-blur-xl bg-card/80 border-primary/10 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      <CardHeader className="pb-3 relative">
        <div className="space-y-3">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Users className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            Friends Leaderboard
          </CardTitle>
          {achievements.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {achievements.slice(0, 5).map((achievement) => (
                <AchievementBadge
                  key={achievement.id}
                  achievementType={achievement.achievement_type}
                  size="sm"
                />
              ))}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="relative">
        {isLoading ? (
          <div className="flex justify-center py-6">
            <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : friendStats.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No friend matches yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {friendStats.map((stats, index) => (
              <motion.div
                key={stats.friend_id}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.06 }}
                className={`flex items-center gap-3 p-3 rounded-lg backdrop-blur-sm transition-all hover:scale-[1.01] ${
                  index === 0 ? 'bg-primary/10 border border-primary/20' : 'bg-muted/30 border border-primary/5 hover:bg-muted/50'
                }`}
              >
                <div className="w-6 text-center font-bold text-muted-foreground">
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                </div>

                <Avatar className={`h-10 w-10 ${index === 0 ? 'ring-2 ring-primary/30' : ''}`}>
                  <AvatarImage src={stats.friend_avatar || undefined} />
                  <AvatarFallback className="bg-primary/10">{stats.friend_name[0] || "?"}</AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{stats.friend_name}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{stats.total_games} games</span>
                    <span>•</span>
                    <span className="text-green-500">{stats.wins}W</span>
                    <span>-</span>
                    <span className="text-red-500">{stats.losses}L</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center gap-1 justify-end">
                    {stats.net_credits >= 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    )}
                    <span
                      className={`font-bold ${
                        stats.net_credits >= 0 ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {stats.net_credits >= 0 ? "+" : ""}
                      {stats.net_credits}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">credits</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
    </>
  );
}