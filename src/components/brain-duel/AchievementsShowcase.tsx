import { useFriendChallengeAchievements } from "@/hooks/useFriendChallengeAchievements";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Award, RefreshCw, Trophy } from "lucide-react";
import AchievementBadge from "./AchievementBadge";
import { FRIEND_CHALLENGE_ACHIEVEMENTS } from "@/types/brain-duel-achievements";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface AchievementsShowcaseProps {
  userId?: string;
  compact?: boolean;
}

export default function AchievementsShowcase({ userId, compact = false }: AchievementsShowcaseProps) {
  const { achievements, isLoading, checkAndAwardAchievements, isChecking } = useFriendChallengeAchievements(userId);
  const [hasAutoChecked, setHasAutoChecked] = useState(false);

  useEffect(() => {
    if (userId && !hasAutoChecked && !isLoading) {
      checkAndAwardAchievements(userId);
      setHasAutoChecked(true);
    }
  }, [userId, hasAutoChecked, isLoading, checkAndAwardAchievements]);

  if (compact && achievements.length === 0) return null;

  const totalAchievements = Object.keys(FRIEND_CHALLENGE_ACHIEVEMENTS).length;
  const progressPct = (achievements.length / totalAchievements) * 100;

  return (
    <>
      <FloatingHowItWorks title={"Achievements Showcase - How it works"} steps={[{ title: 'Open', desc: 'Access the Achievements Showcase section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Achievements Showcase.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="backdrop-blur-xl bg-card/80 border-primary/10 overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      <CardHeader className="relative">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Achievements
            <Badge variant="outline" className="text-xs ml-1">
              {achievements.length}/{totalAchievements}
            </Badge>
          </CardTitle>
          {userId && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => checkAndAwardAchievements(userId)}
              disabled={isChecking}
              className="hover:bg-primary/10"
            >
              <RefreshCw className={`h-4 w-4 ${isChecking ? 'animate-spin' : ''}`} />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="relative">
        {isLoading ? (
          <div className="flex justify-center py-6">
            <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : achievements.length === 0 ? (
          <motion.div 
            className="text-center py-8 space-y-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Trophy className="h-12 w-12 text-muted-foreground/40 mx-auto" />
            <p className="text-sm font-medium text-muted-foreground">No achievements yet</p>
            <p className="text-xs text-muted-foreground">
              Win friend challenges to unlock badges!
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {/* Progress bar */}
            {!compact && (
              <div className="space-y-1">
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPct}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground text-center">
                  {Math.round(progressPct)}% complete
                </p>
              </div>
            )}

            <AnimatePresence>
              <div className="flex flex-wrap gap-3">
                {achievements.map((achievement, i) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05, type: "spring" }}
                  >
                    <AchievementBadge
                      achievementType={achievement.achievement_type}
                      size={compact ? 'sm' : 'md'}
                    />
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
    </>
  );
}