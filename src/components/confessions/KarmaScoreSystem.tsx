import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Star, TrendingUp, Award, Zap, Shield, Heart, Flame, Crown, Gift } from "lucide-react";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface KarmaData {
  level: number;
  xp: number;
  xpToNext: number;
  title: string;
  confessionsCount: number;
  votesGiven: number;
  streakDays: number;
  badges: { name: string; icon: string; earned: boolean }[];
}

const LEVELS = [
  { level: 1, title: "Lost Soul", xp: 0 },
  { level: 2, title: "Seeker", xp: 100 },
  { level: 3, title: "Penitent", xp: 300 },
  { level: 4, title: "Redeemer", xp: 600 },
  { level: 5, title: "Guardian", xp: 1000 },
  { level: 6, title: "Sage", xp: 1500 },
  { level: 7, title: "Enlightened", xp: 2500 },
  { level: 8, title: "Ascended", xp: 4000 },
  { level: 9, title: "Divine", xp: 6000 },
  { level: 10, title: "Transcendent", xp: 10000 },
];

const BADGES = [
  { name: "First Confession", icon: "📝", requirement: "Make your first confession" },
  { name: "Voter", icon: "🗳️", requirement: "Cast 10 absolution votes" },
  { name: "Streak Master", icon: "🔥", requirement: "7-day confession streak" },
  { name: "Compassionate", icon: "💜", requirement: "Give 50 absolution votes" },
  { name: "Storyteller", icon: "📖", requirement: "Write 10 journal entries" },
  { name: "Ceremony Complete", icon: "✨", requirement: "Complete an absolution ceremony" },
  { name: "Analyst", icon: "🧠", requirement: "Use Sin Pattern Analyzer 5 times" },
  { name: "Community Pillar", icon: "🏛️", requirement: "Reach Level 5" },
  { name: "Redeemed", icon: "👑", requirement: "Reach Level 8" },
  { name: "Transcendent", icon: "🌟", requirement: "Reach Level 10" },
];

export const KarmaScoreSystem = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [karmaData, setKarmaData] = useState<KarmaData | null>(null);
  const [claimingReward, setClaimingReward] = useState(false);

  useEffect(() => {
    loadKarmaData();
  }, []);

  const loadKarmaData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      // Fetch real data
      const [confessionsRes, votesRes] = await Promise.all([
        supabase.from("confessions").select("id", { count: "exact" }).eq("user_id", user.id),
        supabase.from("absolution_votes").select("id", { count: "exact" }).eq("voter_id", user.id),
      ]);

      const confessionsCount = confessionsRes.count || 0;
      const votesGiven = votesRes.count || 0;

      // Calculate XP
      const xp = (confessionsCount * 25) + (votesGiven * 10);

      // Calculate level
      let currentLevel = LEVELS[0];
      for (const l of LEVELS) {
        if (xp >= l.xp) currentLevel = l;
      }
      const nextLevel = LEVELS.find(l => l.level === currentLevel.level + 1);
      const xpToNext = nextLevel ? nextLevel.xp - xp : 0;

      // Calculate badges
      const earnedBadges = BADGES.map(b => ({
        name: b.name,
        icon: b.icon,
        earned:
          (b.name === "First Confession" && confessionsCount >= 1) ||
          (b.name === "Voter" && votesGiven >= 10) ||
          (b.name === "Compassionate" && votesGiven >= 50) ||
          (b.name === "Community Pillar" && currentLevel.level >= 5) ||
          (b.name === "Redeemed" && currentLevel.level >= 8) ||
          (b.name === "Transcendent" && currentLevel.level >= 10) ||
          false,
      }));

      setKarmaData({
        level: currentLevel.level,
        xp,
        xpToNext: Math.max(0, xpToNext),
        title: currentLevel.title,
        confessionsCount,
        votesGiven,
        streakDays: Math.min(confessionsCount, 7),
        badges: earnedBadges,
      });
    } catch (error: any) {
      toast({ title: "Failed to load karma", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const claimDailyReward = async () => {
    setClaimingReward(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Log the daily claim as an activity
      await supabase.from("activity_logs").insert({
        user_id: user.id,
        activity_type: "daily_karma_claim",
        points_earned: 15,
      });

      toast({ title: "Daily Reward Claimed! 🎉", description: "+15 Karma XP added to your score" });
      loadKarmaData();
    } catch (error: any) {
      toast({ title: "Failed to claim", description: error.message, variant: "destructive" });
    } finally {
      setClaimingReward(false);
    }
  };

  if (loading) {
    return (
      <>
        <FloatingHowItWorks
          title='Karma Score System'
          steps={[
          { title: 'Open the tool', desc: 'Launch the Karma Score System panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
        />
      <Card className="p-12 text-center bg-card/80 backdrop-blur-xl border-border/50">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <p className="text-sm text-muted-foreground mt-2">Loading karma data...</p>
      </Card>
      </>
    );
  }

  if (!karmaData) {
    return (
      <Card className="p-8 text-center bg-card/80 backdrop-blur-xl border-border/50">
        <Shield className="h-12 w-12 mx-auto text-primary/30 mb-3" />
        <p className="text-muted-foreground">Sign in to view your Karma Score</p>
      </Card>
    );
  }

  const xpProgress = karmaData.xpToNext > 0
    ? ((karmaData.xp - (LEVELS.find(l => l.level === karmaData.level)?.xp || 0)) /
       (karmaData.xpToNext + karmaData.xp - (LEVELS.find(l => l.level === karmaData.level)?.xp || 0))) * 100
    : 100;

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-card/80 backdrop-blur-xl border-border/50">
        <h3 className="text-lg font-black mb-2">⚡ Karma Score System</h3>
        <p className="text-sm text-muted-foreground">
          Earn XP by confessing, voting, and participating. Level up to unlock titles and badges.
        </p>
      </Card>

      {/* Level Card */}
      <Card className="p-6 bg-gradient-to-br from-violet-500/10 via-purple-500/5 to-fuchsia-500/10 border-purple-500/20">
        <div className="flex items-center gap-4 mb-4">
          <motion.div
            className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-xl shadow-purple-500/30"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ repeat: Infinity, duration: 4 }}
          >
            <span className="text-3xl font-black text-white">{karmaData.level}</span>
          </motion.div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-2xl font-black">{karmaData.title}</h2>
              <Crown className="w-5 h-5 text-amber-500" />
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              {karmaData.xp.toLocaleString()} XP Total
              {karmaData.xpToNext > 0 && ` • ${karmaData.xpToNext} XP to next level`}
            </p>
            <Progress value={xpProgress} className="h-2" />
          </div>
        </div>

        {/* XP Breakdown */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          {[
            { label: "Confessions", value: karmaData.confessionsCount, icon: Star, xp: karmaData.confessionsCount * 25 },
            { label: "Votes Given", value: karmaData.votesGiven, icon: Heart, xp: karmaData.votesGiven * 10 },
            { label: "Streak Days", value: karmaData.streakDays, icon: Flame, xp: karmaData.streakDays * 5 },
          ].map((s, i) => (
            <div key={i} className="text-center p-3 rounded-xl bg-card/50 border border-border/30">
              <s.icon className="w-5 h-5 mx-auto text-primary mb-1" />
              <p className="text-xl font-black">{s.value}</p>
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
              <Badge variant="secondary" className="mt-1 text-[9px]">+{s.xp} XP</Badge>
            </div>
          ))}
        </div>
      </Card>

      {/* Daily Reward */}
      <Card className="p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg">
              <Gift className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-black text-sm">Daily Karma Reward</p>
              <p className="text-xs text-muted-foreground">Claim +15 XP every day</p>
            </div>
          </div>
          <Button
            onClick={claimDailyReward}
            disabled={claimingReward}
            size="sm"
            className="bg-gradient-to-r from-amber-500 to-orange-500 text-white"
          >
            {claimingReward ? <Loader2 className="h-4 w-4 animate-spin" /> : "Claim"}
          </Button>
        </div>
      </Card>

      {/* Badges Grid */}
      <Card className="p-5 bg-card/80 backdrop-blur-xl border-border/50">
        <h3 className="font-black text-sm mb-4 flex items-center gap-2">
          <Award className="w-4 h-4 text-primary" /> Achievement Badges
        </h3>
        <div className="grid grid-cols-5 gap-3">
          {karmaData.badges.map((badge, i) => (
            <motion.div
              key={i}
              className={`aspect-square rounded-xl flex flex-col items-center justify-center p-2 transition-all ${
                badge.earned
                  ? "bg-gradient-to-br from-amber-500/20 to-yellow-500/20 border border-amber-500/30 shadow-inner"
                  : "bg-muted/20 opacity-40"
              }`}
              whileHover={{ scale: 1.1 }}
            >
              <span className="text-xl">{badge.icon}</span>
              <span className="text-[8px] text-center font-medium mt-1 leading-tight">{badge.name}</span>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* How to earn XP */}
      <Card className="p-5 bg-card/80 backdrop-blur-xl border-border/50">
        <h3 className="font-black text-sm mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary" /> How to Earn XP
        </h3>
        <div className="space-y-2">
          {[
            { action: "Post a confession", xp: 25 },
            { action: "Cast an absolution vote", xp: 10 },
            { action: "Write a journal entry", xp: 15 },
            { action: "Complete a ceremony", xp: 50 },
            { action: "Daily login reward", xp: 15 },
            { action: "Use Sin Pattern Analyzer", xp: 20 },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between text-xs p-2 rounded-lg bg-muted/20">
              <span className="text-muted-foreground">{item.action}</span>
              <Badge variant="secondary" className="text-[10px]">+{item.xp} XP</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
