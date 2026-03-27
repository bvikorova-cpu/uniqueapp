import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Target, Flame, Gift, Trophy, Share2, Zap, Calendar, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface Challenge {
  id: string;
  title: string;
  description: string;
  icon: typeof Target;
  reward: number;
  target: number;
  current: number;
  type: "daily" | "weekly" | "special";
}

const DAILY_CHALLENGES: Challenge[] = [];
const WEEKLY_CHALLENGES: Challenge[] = [];

const MULTIPLIER_TIERS = [
  { threshold: 3, multiplier: "1.5x", label: "3-day streak", color: "text-yellow-500" },
  { threshold: 7, multiplier: "2x", label: "7-day streak", color: "text-orange-500" },
  { threshold: 14, multiplier: "3x", label: "14-day streak", color: "text-red-500" },
  { threshold: 30, multiplier: "5x", label: "30-day streak", color: "text-purple-500" },
];

interface DailyChallengesProps {
  currentStreak?: number;
  totalVotesCast?: number;
}

export const DailyChallenges = ({ currentStreak = 0, totalVotesCast = 0 }: DailyChallengesProps) => {
  const [tab, setTab] = useState<"daily" | "weekly">("daily");

  const challenges = tab === "daily" ? DAILY_CHALLENGES : WEEKLY_CHALLENGES;

  const enrichedChallenges = challenges.map(c => {
    if (c.id === "streak-3") return { ...c, current: Math.min(currentStreak, c.target) };
    if (c.id === "vote-3") return { ...c, current: Math.min(totalVotesCast, c.target) };
    return c;
  });

  const currentMultiplier = MULTIPLIER_TIERS.reduce((acc, tier) =>
    currentStreak >= tier.threshold ? tier : acc
  , { threshold: 0, multiplier: "1x", label: "No streak", color: "text-muted-foreground" });

  const nextMultiplier = MULTIPLIER_TIERS.find(t => currentStreak < t.threshold);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "Brand Battle Arena",
        text: `I'm on a ${currentStreak}-day voting streak in Brand Battle! Join the fight 🏆`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  return (
    <div className="space-y-6">
      {/* Multiplier banner */}
      <Card className="backdrop-blur-xl bg-card/80 border-primary/20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5" />
        <CardContent className="p-5 relative">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <motion.div
                className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20"
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span className="text-primary-foreground font-black text-xl">{currentMultiplier.multiplier}</span>
              </motion.div>
              <div>
                <div className="font-bold text-lg flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Credit Multiplier Active
                </div>
                <div className="text-sm text-muted-foreground">
                  {currentStreak}-day streak — all credits earned are multiplied by {currentMultiplier.multiplier}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {nextMultiplier && (
                <Badge variant="outline" className="text-xs border-primary/30 backdrop-blur-sm">
                  <Flame className="h-3 w-3 mr-1 text-orange-500" />
                  {nextMultiplier.threshold - currentStreak} more days → {nextMultiplier.multiplier}
                </Badge>
              )}
            </div>
          </div>

          {/* Multiplier tier progress */}
          <div className="mt-4 flex gap-2">
            {MULTIPLIER_TIERS.map((tier, i) => (
              <motion.div
                key={tier.threshold}
                className={`flex-1 p-2 rounded-lg text-center text-xs transition-all ${
                  currentStreak >= tier.threshold
                    ? "bg-primary/15 border border-primary/30"
                    : "bg-muted/30 border border-transparent"
                }`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <div className={`font-black text-lg ${currentStreak >= tier.threshold ? tier.color : "text-muted-foreground/50"}`}>
                  {tier.multiplier}
                </div>
                <div className="text-muted-foreground">{tier.label}</div>
                {currentStreak >= tier.threshold && (
                  <Star className="h-3 w-3 text-primary mx-auto mt-1" />
                )}
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tab switcher */}
      <div className="flex gap-2">
        <Button
          variant={tab === "daily" ? "default" : "outline"}
          size="sm"
          onClick={() => setTab("daily")}
          className="gap-1.5"
        >
          <Target className="h-4 w-4" /> Daily Challenges
        </Button>
        <Button
          variant={tab === "weekly" ? "default" : "outline"}
          size="sm"
          onClick={() => setTab("weekly")}
          className="gap-1.5"
        >
          <Calendar className="h-4 w-4" /> Weekly Challenges
        </Button>
      </div>

      {/* Challenges grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <AnimatePresence mode="wait">
          {enrichedChallenges.length === 0 ? (
            <motion.div
              className="col-span-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Card className="p-8 text-center backdrop-blur-xl bg-card/80">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <h3 className="font-bold text-lg mb-1">No Active Challenges</h3>
                <p className="text-sm text-muted-foreground">
                  New {tab} challenges will appear here. Keep voting to stay ready!
                </p>
              </Card>
            </motion.div>
          ) : enrichedChallenges.map((challenge, i) => {
            const Icon = challenge.icon;
            const isComplete = challenge.current >= challenge.target;
            const progress = Math.min((challenge.current / challenge.target) * 100, 100);

            return (
              <motion.div
                key={challenge.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <Card className={`relative overflow-hidden backdrop-blur-xl bg-card/80 ${isComplete ? "border-green-500/50" : "border-primary/10"}`}>
                  {isComplete && (
                    <motion.div
                      className="absolute inset-0 bg-green-500/5"
                      animate={{ opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                  {isComplete && (
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-green-600 text-white gap-1 text-xs shadow-md">
                        ✓ Complete
                      </Badge>
                    </div>
                  )}
                  <CardContent className="p-5 relative">
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                        isComplete ? "bg-green-500/20" : "bg-primary/10"
                      }`}>
                        <Icon className={`h-5 w-5 ${isComplete ? "text-green-600" : "text-primary"}`} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm">{challenge.title}</h4>
                        <p className="text-xs text-muted-foreground">{challenge.description}</p>
                      </div>
                    </div>

                    <Progress value={progress} className="h-2 mb-2" />

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{challenge.current}/{challenge.target}</span>
                      <Badge variant="secondary" className="text-xs gap-1">
                        <Gift className="h-3 w-3" /> +{challenge.reward} credits
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Social sharing */}
      <Card className="border-dashed border-2 border-primary/20 backdrop-blur-xl bg-card/80">
        <CardContent className="p-6 text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <Share2 className="h-10 w-10 text-primary mx-auto mb-3" />
            <h3 className="font-bold text-lg mb-1">Share Your Battle Progress</h3>
            <p className="text-sm text-muted-foreground mb-4">Share on social media and earn +5 bonus votes per share</p>
            <Button onClick={handleShare} className="gap-2" size="lg">
              <Share2 className="h-4 w-4" /> Share & Earn Votes
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </div>
  );
};
