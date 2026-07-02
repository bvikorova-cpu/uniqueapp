import { useDailyReward } from "@/hooks/useGamification";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gift, Flame } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { triggerRewardConfetti } from "@/utils/confetti";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export default function DailyRewardButton() {
  const { checkCanClaim, claimReward } = useDailyReward();
  const previousClaimStatus = useRef(false);

  const canClaim = checkCanClaim.data?.canClaim;
  const streak = checkCanClaim.data?.streak || 0;

  useEffect(() => {
    if (previousClaimStatus.current === true && canClaim === false && !claimReward.isPending) {
      triggerRewardConfetti();
    }
    previousClaimStatus.current = canClaim || false;
  }, [canClaim, claimReward.isPending]);

  return (
    <>
      <FloatingHowItWorks title={"Daily Reward Button - How it works"} steps={[{ title: 'Open', desc: 'Access the Daily Reward Button section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Daily Reward Button.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
      <Card className="backdrop-blur-xl bg-card/80 border-primary/20 h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-primary" />
            Daily Reward
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-500" />
              <span className="text-sm font-medium">Streak</span>
            </div>
            <Badge 
              variant={streak > 0 ? "default" : "secondary"}
              className={streak > 0 ? "animate-scale-in" : ""}
            >
              {streak} {streak === 1 ? "day" : "days"}
            </Badge>
          </div>

          <Button
            onClick={() => claimReward.mutate()}
            disabled={!canClaim || claimReward.isPending}
            className={`w-full transition-all duration-300 ${
              canClaim ? "hover-scale shadow-lg hover:shadow-xl bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90" : ""
            }`}
            size="lg"
          >
            {claimReward.isPending ? (
              <span className="flex items-center gap-2">
                <Gift className="h-4 w-4 animate-spin" /> Claiming...
              </span>
            ) : canClaim ? (
              <><Gift className="h-4 w-4 mr-2" /> Claim Daily Reward</>
            ) : (
              "Already claimed today"
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            {canClaim ? "Earn points for logging in every day!" : "Come back tomorrow for another reward"}
          </p>
        </CardContent>
      </Card>
    </motion.div>
    </>
  );
}
