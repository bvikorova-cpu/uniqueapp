import { useUserBadges, useGamification } from "@/hooks/useGamification";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Star } from "lucide-react";
import { motion } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface MyBadgesDisplayProps {
  userId: string;
}

export default function MyBadgesDisplay({ userId }: MyBadgesDisplayProps) {
  const { data: userBadges = [] } = useUserBadges(userId);
  const { data: gamificationData } = useGamification(userId);

  const userAchievements = gamificationData?.userAchievements || [];
  const totalBadges = userBadges.length;
  const totalAchievements = userAchievements.length;
  const totalEarned = totalBadges + totalAchievements;

  if (totalEarned === 0) {
    return (
    <>
      <FloatingHowItWorks title={"My Badges Display - How it works"} steps={[{ title: 'Open', desc: 'Access the My Badges Display section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in My Badges Display.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="backdrop-blur-xl bg-card/80 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            My Earned Badges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Medal className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>You don't have any badges yet.</p>
            <p className="text-sm mt-1">Start being active and earn them!</p>
          </div>
        </CardContent>
      </Card>
    </>
  );
  }

  return (
    <Card className="backdrop-blur-xl bg-card/80 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            My Earned Badges
          </div>
          <Badge variant="secondary" className="text-base px-3 py-1">
            {totalEarned} total
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {userBadges.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
              <Medal className="h-4 w-4" />
              Badges ({userBadges.length})
            </h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
              {userBadges.map((userBadge: any, i: number) => (
                <Tooltip key={userBadge.id}>
                  <TooltipTrigger asChild>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.04 }}
                      className="flex flex-col items-center gap-1 p-3 rounded-xl border-2 border-primary bg-primary/5 hover:bg-primary/10 hover:scale-105 transition-all cursor-pointer"
                    >
                      <div className="text-3xl">{userBadge.badge_icon || "🏅"}</div>
                      <p className="text-xs font-medium text-center line-clamp-2">{userBadge.badge_name || "Badge"}</p>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="space-y-1">
                      <p className="font-semibold">{userBadge.badge_name}</p>
                      <p className="text-xs text-green-500">✓ Earned: {new Date(userBadge.earned_at).toLocaleDateString("en-US")}</p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>
        )}

        {userAchievements.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
              <Star className="h-4 w-4" />
              Achievements ({userAchievements.length})
            </h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
              {userAchievements.map((ua: any, i: number) => {
                const achievement = ua.achievements;
                if (!achievement) return null;
                
                return (
                  <Tooltip key={ua.id}>
                    <TooltipTrigger asChild>
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.04 }}
                        className="flex flex-col items-center gap-1 p-3 rounded-xl border-2 border-yellow-500/50 bg-yellow-500/5 hover:bg-yellow-500/10 hover:scale-105 transition-all cursor-pointer"
                      >
                        <div className="text-3xl">{achievement.icon || "⭐"}</div>
                        <p className="text-xs font-medium text-center line-clamp-2">{achievement.name}</p>
                      </motion.div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="space-y-1">
                        <p className="font-semibold">{achievement.icon} {achievement.name}</p>
                        <p className="text-sm">{achievement.description}</p>
                        <p className="text-xs text-primary">+{achievement.points} points</p>
                        <p className="text-xs text-green-500">✓ Unlocked: {new Date(ua.unlocked_at).toLocaleDateString("en-US")}</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
