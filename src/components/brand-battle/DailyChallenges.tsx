import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Target, Flame, Gift, Star, Zap, Trophy, Share2, Users } from "lucide-react";
import { motion } from "framer-motion";
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

const DAILY_CHALLENGES: Challenge[] = [
  { id: "vote-3", title: "Triple Threat", description: "Cast 3 votes today", icon: Target, reward: 15, target: 3, current: 0, type: "daily" },
  { id: "streak-3", title: "Streak Starter", description: "Maintain a 3-day voting streak", icon: Flame, reward: 25, target: 3, current: 0, type: "daily" },
  { id: "category-2", title: "Category Explorer", description: "Vote in 2 different categories", icon: Star, reward: 10, target: 2, current: 0, type: "daily" },
];

const WEEKLY_CHALLENGES: Challenge[] = [
  { id: "vote-20", title: "Voting Machine", description: "Cast 20 votes this week", icon: Zap, reward: 50, target: 20, current: 0, type: "weekly" },
  { id: "share-3", title: "Brand Ambassador", description: "Share 3 brand battles on social", icon: Share2, reward: 30, target: 3, current: 0, type: "weekly" },
  { id: "refer-1", title: "Recruit a Voter", description: "Invite a friend who casts a vote", icon: Users, reward: 100, target: 1, current: 0, type: "weekly" },
];

const MULTIPLIER_TIERS = [
  { threshold: 3, multiplier: "1.5x", label: "3-day streak" },
  { threshold: 7, multiplier: "2x", label: "7-day streak" },
  { threshold: 14, multiplier: "3x", label: "14-day streak" },
  { threshold: 30, multiplier: "5x", label: "30-day streak" },
];

interface DailyChallengesProps {
  currentStreak?: number;
  totalVotesCast?: number;
}

export const DailyChallenges = ({ currentStreak = 0, totalVotesCast = 0 }: DailyChallengesProps) => {
  const [tab, setTab] = useState<"daily" | "weekly">("daily");

  const challenges = tab === "daily" ? DAILY_CHALLENGES : WEEKLY_CHALLENGES;

  // Simulate progress from real data
  const enrichedChallenges = challenges.map(c => {
    if (c.id === "streak-3") return { ...c, current: Math.min(currentStreak, c.target) };
    if (c.id === "vote-3") return { ...c, current: Math.min(totalVotesCast, c.target) };
    return c;
  });

  const currentMultiplier = MULTIPLIER_TIERS.reduce((acc, tier) =>
    currentStreak >= tier.threshold ? tier : acc
  , { threshold: 0, multiplier: "1x", label: "No streak" });

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
      <Card className="bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10 border-primary/20">
        <CardContent className="p-5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <motion.div
                className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg"
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span className="text-primary-foreground font-black text-lg">{currentMultiplier.multiplier}</span>
              </motion.div>
              <div>
                <div className="font-bold text-lg">Credit Multiplier Active</div>
                <div className="text-sm text-muted-foreground">
                  {currentStreak}-day streak • All credits earned are multiplied by {currentMultiplier.multiplier}
                </div>
              </div>
            </div>
            {nextMultiplier && (
              <Badge variant="outline" className="text-xs border-primary/30">
                {nextMultiplier.threshold - currentStreak} more days → {nextMultiplier.multiplier}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tab switcher */}
      <div className="flex gap-2">
        <Button
          variant={tab === "daily" ? "default" : "outline"}
          size="sm"
          onClick={() => setTab("daily")}
          className="gap-1"
        >
          <Target className="h-4 w-4" /> Daily Challenges
        </Button>
        <Button
          variant={tab === "weekly" ? "default" : "outline"}
          size="sm"
          onClick={() => setTab("weekly")}
          className="gap-1"
        >
          <Trophy className="h-4 w-4" /> Weekly Challenges
        </Button>
      </div>

      {/* Challenges grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {enrichedChallenges.map((challenge) => {
          const Icon = challenge.icon;
          const isComplete = challenge.current >= challenge.target;
          const progress = Math.min((challenge.current / challenge.target) * 100, 100);

          return (
            <motion.div
              key={challenge.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className={`relative overflow-hidden ${isComplete ? "border-green-500/50 bg-green-500/5" : ""}`}>
                {isComplete && (
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-green-600 text-white gap-1 text-xs">
                      ✓ Complete
                    </Badge>
                  </div>
                )}
                <CardContent className="p-5">
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
      </div>

      {/* Social sharing */}
      <Card className="border-dashed border-2 border-primary/20">
        <CardContent className="p-5 text-center">
          <Share2 className="h-8 w-8 text-primary mx-auto mb-2" />
          <h3 className="font-bold mb-1">Share Your Battle Progress</h3>
          <p className="text-sm text-muted-foreground mb-3">Share on social media and earn +5 bonus votes per share</p>
          <Button onClick={handleShare} className="gap-2">
            <Share2 className="h-4 w-4" /> Share & Earn Votes
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
