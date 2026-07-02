import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useSecretSanta } from "@/hooks/useSecretSanta";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Flame, Gift, Trophy, Star, Zap, CheckCircle, Lock, Loader2 } from "lucide-react";
import { GiftConfetti } from "./GiftConfetti";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const STREAK_MILESTONES = [
  { days: 3, reward: 10, label: "3-Day Streak", emoji: "🔥", tier: "Bronze" },
  { days: 7, reward: 30, label: "Week Warrior", emoji: "⚡", tier: "Silver" },
  { days: 14, reward: 75, label: "Fortnight Force", emoji: "💪", tier: "Gold" },
  { days: 30, reward: 200, label: "Monthly Master", emoji: "👑", tier: "Platinum" },
  { days: 60, reward: 500, label: "Legendary Giver", emoji: "🌟", tier: "Diamond" },
  { days: 100, reward: 1000, label: "Centennial Champion", emoji: "🏆", tier: "Mythical" },
  { days: 365, reward: 5000, label: "Year of Giving", emoji: "🎖️", tier: "Immortal" },
];

export const GiftStreakRewards = () => {
  const { sentGifts, credits } = useSecretSanta();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setCurrentUserId(user?.id || null));
  }, []);

  // Calculate current streak
  const calculateStreak = () => {
    if (!sentGifts.length) return 0;
    const dates = [...new Set(sentGifts.map((g: any) => new Date(g.created_at).toDateString()))].sort(
      (a, b) => new Date(b).getTime() - new Date(a).getTime()
    );
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < dates.length; i++) {
      const expected = new Date(today);
      expected.setDate(expected.getDate() - i);
      if (dates[i] === expected.toDateString()) {
        streak++;
      } else break;
    }
    return streak;
  };

  const currentStreak = calculateStreak();

  // Fetch claimed rewards
  const { data: claimedRewards = [] } = useQuery({
    queryKey: ["santa-streak-rewards", currentUserId],
    queryFn: async () => {
      if (!currentUserId) return [];
      const { data, error } = await supabase
        .from("secret_santa_streak_rewards")
        .select("streak_milestone")
        .eq("user_id", currentUserId);
      if (error) throw error;
      return data.map(r => r.streak_milestone);
    },
    enabled: !!currentUserId,
  });

  const claimReward = useMutation({
    mutationFn: async ({ milestone, reward }: { milestone: number; reward: number }) => {
      if (!currentUserId) throw new Error("Not authenticated");

      // Record the claim
      const { error: claimError } = await supabase
        .from("secret_santa_streak_rewards")
        .insert({ user_id: currentUserId, streak_milestone: milestone, reward_credits: reward });
      if (claimError) throw claimError;

      // Add credits
      const { data: creditData } = await supabase
        .from("secret_santa_credits")
        .select("credits_remaining")
        .eq("user_id", currentUserId)
        .maybeSingle();

      const currentCredits = creditData?.credits_remaining || 0;
      if (creditData) {
        await supabase
          .from("secret_santa_credits")
          .update({ credits_remaining: currentCredits + reward })
          .eq("user_id", currentUserId);
      } else {
        await supabase
          .from("secret_santa_credits")
          .insert({ user_id: currentUserId, credits_remaining: reward, total_credits_purchased: 0 });
      }
    },
    onSuccess: (_, { reward }) => {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 100);
      toast.success(`Claimed ${reward} credits! 🔥`);
      queryClient.invalidateQueries({ queryKey: ["santa-streak-rewards"] });
      queryClient.invalidateQueries({ queryKey: ["secret-santa-credits"] });
    },
    onError: () => toast.error("Failed to claim reward"),
  });

  const tierColor = (tier: string) => {
    switch (tier) {
      case "Bronze": return "from-amber-600 to-amber-700";
      case "Silver": return "from-gray-400 to-gray-500";
      case "Gold": return "from-yellow-400 to-amber-500";
      case "Platinum": return "from-blue-400 to-indigo-500";
      case "Diamond": return "from-cyan-400 to-blue-500";
      case "Mythical": return "from-purple-500 to-pink-500";
      case "Immortal": return "from-red-500 to-orange-500";
      default: return "from-gray-400 to-gray-500";
    }
  };

  if (!currentUserId) {
    return (
    <>
      <FloatingHowItWorks title={"Gift Streak Rewards - How it works"} steps={[{ title: 'Open', desc: 'Access the Gift Streak Rewards section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Gift Streak Rewards.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="p-8 bg-white/90 border-amber-200 text-center">
        <Flame className="h-12 w-12 mx-auto text-orange-400 mb-4" />
        <p className="text-gray-600">Please log in to view streak rewards</p>
      </Card>
    </>
  );
  }

  return (
    <div className="space-y-6">
      <GiftConfetti trigger={showConfetti} type="badge" />

      {/* Header with current streak */}
      <Card className="p-6 bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 text-white text-center shadow-lg border-transparent">
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-24 h-24 mx-auto mb-4 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center"
        >
          <Flame className="h-12 w-12" />
        </motion.div>
        <h2 className="text-3xl font-black mb-1">{currentStreak} Day Streak</h2>
        <p className="text-white/80 text-sm">
          {currentStreak === 0 ? "Send a gift today to start your streak!" :
           currentStreak >= 30 ? "🏆 Incredible dedication! You're a gifting legend!" :
           currentStreak >= 7 ? "🔥 Amazing streak! Keep the momentum going!" :
           "Great start! Send gifts daily to grow your streak."}
        </p>
      </Card>

      {/* Milestones */}
      <div className="space-y-3">
        <h3 className="font-bold text-gray-800 flex items-center gap-2">
          <Trophy className="h-5 w-5 text-amber-500" /> Streak Milestones
        </h3>
        
        {STREAK_MILESTONES.map((milestone, i) => {
          const isReached = currentStreak >= milestone.days;
          const isClaimed = claimedRewards.includes(milestone.days);
          const canClaim = isReached && !isClaimed;

          return (
            <motion.div
              key={milestone.days}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Card className={`p-4 border transition-all ${
                isClaimed ? "bg-green-50 border-green-200" :
                canClaim ? "bg-amber-50 border-amber-300 shadow-md" :
                isReached ? "bg-white border-amber-200" :
                "bg-gray-50 border-gray-200 opacity-70"
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    isClaimed ? "bg-green-500" :
                    isReached ? `bg-gradient-to-br ${tierColor(milestone.tier)}` :
                    "bg-gray-200"
                  }`}>
                    {isClaimed ? <CheckCircle className="h-6 w-6 text-white" /> :
                     isReached ? <span className="text-2xl">{milestone.emoji}</span> :
                     <Lock className="h-5 w-5 text-gray-400" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-gray-800">{milestone.label}</h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r ${tierColor(milestone.tier)} text-white`}>
                        {milestone.tier}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">{milestone.days} consecutive days of gifting</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-amber-600">💎 {milestone.reward}</p>
                    {canClaim && (
                      <Button
                        size="sm"
                        onClick={() => claimReward.mutate({ milestone: milestone.days, reward: milestone.reward })}
                        disabled={claimReward.isPending}
                        className="mt-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs"
                      >
                        {claimReward.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : "Claim"}
                      </Button>
                    )}
                    {isClaimed && <p className="text-[10px] text-green-600 font-bold">✓ Claimed</p>}
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Info */}
      <Card className="p-4 bg-orange-50 border-orange-200 shadow-sm">
        <h3 className="font-bold text-orange-800 mb-2 flex items-center gap-2">
          <Zap className="h-4 w-4" /> How Streak Rewards Work
        </h3>
        <ul className="space-y-1 text-sm text-orange-700">
          <li>• Send at least 1 gift every day to maintain your streak</li>
          <li>• Each milestone can only be claimed once — rewards stack!</li>
          <li>• Missing a single day resets your streak to zero</li>
          <li>• The 365-day milestone grants a massive 5,000 credit bonus</li>
        </ul>
      </Card>
    </div>
  );
};
