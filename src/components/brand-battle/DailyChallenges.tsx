import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Target, Flame, Gift, Trophy, Share2, Zap, Calendar, Star, Rocket, Users, Crown, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

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
  { id: "vote-1", title: "First Vote", description: "Cast your first vote today", icon: Target, reward: 5, target: 1, current: 0, type: "daily" },
  { id: "h2h-1", title: "Head-to-Head", description: "Complete a head-to-head matchup", icon: Zap, reward: 10, target: 1, current: 0, type: "daily" },
  { id: "review-1", title: "Brand Reviewer", description: "Write a brand review", icon: Star, reward: 15, target: 1, current: 0, type: "daily" },
];

const WEEKLY_CHALLENGES: Challenge[] = [
  { id: "streak-3", title: "Streak Builder", description: "Maintain a 3-day voting streak", icon: Flame, reward: 30, target: 3, current: 0, type: "weekly" },
  { id: "vote-5", title: "Power Voter", description: "Cast 5 votes this week", icon: Rocket, reward: 25, target: 5, current: 0, type: "weekly" },
  { id: "social-1", title: "Social Warrior", description: "Share Brand Battle on social media", icon: Users, reward: 20, target: 1, current: 0, type: "weekly" },
];

const MULTIPLIER_TIERS = [
  { threshold: 3, multiplier: "1.5x", label: "3-day streak", color: "text-yellow-500", emoji: "⚡" },
  { threshold: 7, multiplier: "2x", label: "7-day streak", color: "text-orange-500", emoji: "🔥" },
  { threshold: 14, multiplier: "3x", label: "14-day streak", color: "text-red-500", emoji: "💎" },
  { threshold: 30, multiplier: "5x", label: "30-day streak", color: "text-purple-500", emoji: "👑" },
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
    if (c.id === "vote-5") return { ...c, current: Math.min(totalVotesCast, c.target) };
    if (c.id === "vote-1") return { ...c, current: Math.min(totalVotesCast > 0 ? 1 : 0, c.target) };
    return c;
  });

  const currentMultiplier = MULTIPLIER_TIERS.reduce((acc, tier) =>
    currentStreak >= tier.threshold ? tier : acc
  , { threshold: 0, multiplier: "1x", label: "No streak", color: "text-muted-foreground", emoji: "🎯" });

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

  const completedCount = enrichedChallenges.filter(c => c.current >= c.target).length;
  const totalReward = enrichedChallenges.reduce((sum, c) => sum + c.reward, 0);

  return (
    <>
      <FloatingHowItWorks title={"Daily Challenges - How it works"} steps={[{ title: 'Open', desc: 'Access the Daily Challenges section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Daily Challenges.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      {/* Multiplier banner */}
      <Card className="backdrop-blur-xl bg-card/80 border-primary/20 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5" />
        <CardContent className="p-6 relative">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <motion.div
                className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-xl shadow-primary/25"
                animate={{ scale: [1, 1.08, 1], rotate: [0, 2, -2, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <div className="text-center">
                  <span className="text-primary-foreground font-black text-2xl block">{currentMultiplier.multiplier}</span>
                  <span className="text-primary-foreground/70 text-[10px]">MULTI</span>
                </div>
              </motion.div>
              <div>
                <div className="font-bold text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Credit Multiplier Active
                </div>
                <div className="text-sm text-muted-foreground">
                  {currentStreak}-day streak — all credits earned are multiplied by {currentMultiplier.multiplier}
                </div>
                {nextMultiplier && (
                  <Badge variant="outline" className="text-xs border-primary/30 backdrop-blur-sm mt-2">
                    <Flame className="h-3 w-3 mr-1 text-orange-500" />
                    {nextMultiplier.threshold - currentStreak} more days → {nextMultiplier.multiplier}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Multiplier tier progress */}
          <div className="mt-5 grid grid-cols-4 gap-2">
            {MULTIPLIER_TIERS.map((tier, i) => (
              <motion.div
                key={tier.threshold}
                className={`p-3 rounded-xl text-center transition-all ${
                  currentStreak >= tier.threshold
                    ? "bg-primary/15 border-2 border-primary/30 shadow-lg"
                    : "bg-muted/20 border border-transparent"
                }`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="text-xl mb-1">{tier.emoji}</div>
                <div className={`font-black text-xl ${currentStreak >= tier.threshold ? tier.color : "text-muted-foreground/40"}`}>
                  {tier.multiplier}
                </div>
                <div className="text-[10px] text-muted-foreground">{tier.label}</div>
                {currentStreak >= tier.threshold && (
                  <Star className="h-3 w-3 text-primary mx-auto mt-1" />
                )}
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tab switcher + progress */}
      <div className="flex items-center justify-between flex-wrap gap-3">
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
        <Badge variant="outline" className="text-xs">
          {completedCount}/{enrichedChallenges.length} completed • {totalReward} credits possible
        </Badge>
      </div>

      {/* Challenges grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <AnimatePresence mode="wait">
          {enrichedChallenges.map((challenge, i) => {
            const Icon = challenge.icon;
            const isComplete = challenge.current >= challenge.target;
            const progress = Math.min((challenge.current / challenge.target) * 100, 100);

            return (
              <motion.div
                key={challenge.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className={`relative overflow-hidden backdrop-blur-xl bg-card/80 hover:shadow-lg transition-all ${
                  isComplete ? "border-green-500/50 shadow-green-500/10" : "border-primary/10 hover:border-primary/20"
                }`}>
                  {isComplete && (
                    <motion.div
                      className="absolute inset-0 bg-green-500/5"
                      animate={{ opacity: [0.2, 0.4, 0.2] }}
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
                    <div className="flex items-start gap-3 mb-4">
                      <motion.div
                        className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                          isComplete ? "bg-green-500/20" : "bg-primary/10"
                        }`}
                        animate={isComplete ? { scale: [1, 1.1, 1] } : {}}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Icon className={`h-6 w-6 ${isComplete ? "text-green-600" : "text-primary"}`} />
                      </motion.div>
                      <div className="flex-1">
                        <h4 className="font-bold text-sm">{challenge.title}</h4>
                        <p className="text-xs text-muted-foreground">{challenge.description}</p>
                      </div>
                    </div>

                    <Progress value={progress} className="h-2.5 mb-2" />

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground font-medium">{challenge.current}/{challenge.target}</span>
                      <Badge variant="secondary" className="text-xs gap-1 bg-primary/10 text-primary">
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
      <Card className="border-2 border-dashed border-primary/20 backdrop-blur-xl bg-gradient-to-br from-primary/5 to-accent/5">
        <CardContent className="p-8 text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Share2 className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-bold text-xl mb-2">Share Your Battle Progress</h3>
            <p className="text-sm text-muted-foreground mb-5 max-w-md mx-auto">
              Share on social media and earn +5 bonus votes per share. Challenge your friends!
            </p>
            <Button onClick={handleShare} className="gap-2 shadow-lg shadow-primary/10" size="lg">
              <Share2 className="h-4 w-4" /> Share & Earn Votes
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </div>
    </>
  );
};