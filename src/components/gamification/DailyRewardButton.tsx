import { useDailyReward } from "@/hooks/useGamification";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gift, Flame } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { triggerRewardConfetti } from "@/utils/confetti";
import { useEffect, useRef } from "react";

export default function DailyRewardButton() {
  const { checkCanClaim, claimReward } = useDailyReward();
  const previousClaimStatus = useRef(false);

  const canClaim = checkCanClaim.data?.canClaim;
  const streak = checkCanClaim.data?.streak || 0;

  useEffect(() => {
    // Trigger confetti when claim status changes from true to false (successful claim)
    if (previousClaimStatus.current === true && canClaim === false && !claimReward.isPending) {
      triggerRewardConfetti();
    }
    previousClaimStatus.current = canClaim || false;
  }, [canClaim, claimReward.isPending]);

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="h-5 w-5 animate-bounce" />
          Daily Reward
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className={`h-5 w-5 text-orange-500 transition-all duration-300 ${
              streak > 0 ? "animate-pulse" : ""
            }`} />
            <span className="text-sm font-medium">Streak</span>
          </div>
          <Badge 
            variant={streak > 0 ? "default" : "secondary"}
            className={`transition-all duration-300 ${
              streak > 0 ? "animate-scale-in" : ""
            }`}
          >
            {streak} {streak === 1 ? "day" : "days"}
          </Badge>
        </div>

        <Button
          onClick={() => claimReward.mutate()}
          disabled={!canClaim || claimReward.isPending}
          className={`w-full transition-all duration-300 ${
            canClaim 
              ? "hover-scale animate-pulse shadow-lg hover:shadow-xl" 
              : ""
          }`}
          size="lg"
        >
          {claimReward.isPending ? (
            <span className="flex items-center gap-2">
              <Gift className="h-4 w-4 animate-spin" />
              Claiming...
            </span>
          ) : canClaim ? (
            <>
              <Gift className="h-4 w-4 mr-2 animate-bounce" />
              Claim Daily Reward
            </>
          ) : (
            "Already claimed today"
          )}
        </Button>

        <p className="text-xs text-muted-foreground text-center animate-fade-in">
          {canClaim
            ? "Earn points for logging in every day!"
            : "Come back tomorrow for another reward"}
        </p>
      </CardContent>
    </Card>
  );
}
