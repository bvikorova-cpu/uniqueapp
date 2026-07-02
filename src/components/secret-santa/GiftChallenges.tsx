import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Target, Flame, Gift, Zap, Trophy, Clock, CheckCircle, Star, Loader2 } from "lucide-react";
import { GiftConfetti } from "./GiftConfetti";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Challenge {
  id: string;
  title: string;
  description: string;
  challenge_type: string;
  reward_credits: number;
  target_count: number;
  expires_at: string | null;
}

interface ChallengeProgress {
  id: string;
  challenge_id: string;
  current_count: number;
  is_completed: boolean;
  reward_claimed: boolean;
}

export const GiftChallenges = () => {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setCurrentUserId(user?.id || null));
  }, []);

  const { data: challenges = [] } = useQuery({
    queryKey: ["santa-challenges"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("secret_santa_challenges")
        .select("*")
        .eq("is_active", true)
        .order("challenge_type");
      if (error) throw error;
      return data as Challenge[];
    },
  });

  const { data: progress = [] } = useQuery({
    queryKey: ["santa-challenge-progress", currentUserId],
    queryFn: async () => {
      if (!currentUserId) return [];
      const { data, error } = await supabase
        .from("secret_santa_challenge_progress")
        .select("*")
        .eq("user_id", currentUserId);
      if (error) throw error;
      return data as ChallengeProgress[];
    },
    enabled: !!currentUserId,
  });

  const claimReward = useMutation({
    mutationFn: async ({ challengeId, rewardCredits }: { challengeId: string; rewardCredits: number }) => {
      if (!currentUserId) throw new Error("Not authenticated");

      // Mark reward as claimed
      const { error: progressError } = await supabase
        .from("secret_santa_challenge_progress")
        .update({ reward_claimed: true })
        .eq("user_id", currentUserId)
        .eq("challenge_id", challengeId);
      if (progressError) throw progressError;

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
          .update({ credits_remaining: currentCredits + rewardCredits })
          .eq("user_id", currentUserId);
      } else {
        await supabase
          .from("secret_santa_credits")
          .insert({ user_id: currentUserId, credits_remaining: rewardCredits, total_credits_purchased: 0 });
      }
    },
    onSuccess: (_, { rewardCredits }) => {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 100);
      toast.success(`Claimed ${rewardCredits} credits! 🎉`);
      queryClient.invalidateQueries({ queryKey: ["santa-challenge-progress"] });
      queryClient.invalidateQueries({ queryKey: ["secret-santa-credits"] });
    },
    onError: () => toast.error("Failed to claim reward"),
  });

  const getProgress = (challengeId: string) => progress.find(p => p.challenge_id === challengeId);

  const dailyChallenges = challenges.filter(c => c.challenge_type === "daily");
  const weeklyChallenges = challenges.filter(c => c.challenge_type === "weekly");

  if (!currentUserId) {
    return (
    <>
      <FloatingHowItWorks title={"Gift Challenges - How it works"} steps={[{ title: 'Open', desc: 'Access the Gift Challenges section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Gift Challenges.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="p-8 bg-white/90 border-amber-200 text-center">
        <Target className="h-12 w-12 mx-auto text-amber-400 mb-4" />
        <p className="text-gray-600">Please log in to view challenges</p>
      </Card>
    </>
  );
  }

  const renderChallenge = (challenge: Challenge, i: number) => {
    const prog = getProgress(challenge.id);
    const currentCount = prog?.current_count || 0;
    const percentage = Math.min(100, (currentCount / challenge.target_count) * 100);
    const isCompleted = prog?.is_completed || false;
    const isClaimed = prog?.reward_claimed || false;

    return (
      <motion.div
        key={challenge.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.08 }}
      >
        <Card className={`p-4 border transition-all ${
          isClaimed ? "bg-green-50 border-green-200 opacity-75" :
          isCompleted ? "bg-amber-50 border-amber-300 shadow-md shadow-amber-100" :
          "bg-white border-gray-200"
        }`}>
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
              isClaimed ? "bg-green-500" :
              isCompleted ? "bg-gradient-to-br from-amber-400 to-orange-500" :
              "bg-gray-100"
            }`}>
              {isClaimed ? <CheckCircle className="h-5 w-5 text-white" /> :
               isCompleted ? <Trophy className="h-5 w-5 text-white" /> :
               <Target className={`h-5 w-5 ${percentage > 0 ? "text-amber-500" : "text-gray-400"}`} />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-bold text-sm text-gray-800">{challenge.title}</h4>
                <span className="text-xs font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
                  💎 {challenge.reward_credits}
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-2">{challenge.description}</p>
              
              <div className="flex items-center gap-2">
                <Progress value={percentage} className="flex-1 h-2" />
                <span className="text-xs font-bold text-gray-600">{currentCount}/{challenge.target_count}</span>
              </div>

              {isCompleted && !isClaimed && (
                <Button
                  size="sm"
                  onClick={() => claimReward.mutate({ challengeId: challenge.id, rewardCredits: challenge.reward_credits })}
                  disabled={claimReward.isPending}
                  className="mt-2 w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-xs"
                >
                  {claimReward.isPending ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Star className="h-3 w-3 mr-1" />}
                  Claim {challenge.reward_credits} Credits
                </Button>
              )}

              {isClaimed && (
                <p className="text-xs text-green-600 font-bold mt-2 flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" /> Reward Claimed!
                </p>
              )}
            </div>
          </div>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      <GiftConfetti trigger={showConfetti} type="badge" />

      {/* Header */}
      <Card className="p-6 bg-white/80 backdrop-blur-xl border-amber-200 text-center shadow-lg">
        <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg">
          <Target className="h-10 w-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Daily & Weekly Challenges</h2>
        <p className="text-gray-500 text-sm">Complete challenges to earn bonus credits! Progress is tracked automatically.</p>
      </Card>

      {/* Daily Challenges */}
      {dailyChallenges.length > 0 && (
        <div>
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" /> Daily Challenges
            <span className="text-xs text-gray-400 ml-auto flex items-center gap-1">
              <Clock className="h-3 w-3" /> Resets daily
            </span>
          </h3>
          <div className="space-y-3">
            {dailyChallenges.map((c, i) => renderChallenge(c, i))}
          </div>
        </div>
      )}

      {/* Weekly Challenges */}
      {weeklyChallenges.length > 0 && (
        <div>
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <Zap className="h-5 w-5 text-purple-500" /> Weekly Challenges
            <span className="text-xs text-gray-400 ml-auto flex items-center gap-1">
              <Clock className="h-3 w-3" /> Resets weekly
            </span>
          </h3>
          <div className="space-y-3">
            {weeklyChallenges.map((c, i) => renderChallenge(c, i))}
          </div>
        </div>
      )}

      {/* Tips */}
      <Card className="p-4 bg-amber-50 border-amber-200 shadow-sm">
        <h3 className="font-bold text-amber-800 mb-2 flex items-center gap-2">
          <Gift className="h-4 w-4" /> Challenge Tips
        </h3>
        <ul className="space-y-1 text-sm text-amber-700">
          <li>• Send gifts to make progress on most challenges automatically</li>
          <li>• Daily challenges reset every 24 hours — don't miss out!</li>
          <li>• Weekly challenges give bigger rewards for sustained effort</li>
          <li>• Combine with Gift Roulette for quick challenge completion</li>
        </ul>
      </Card>
    </div>
  );
};
