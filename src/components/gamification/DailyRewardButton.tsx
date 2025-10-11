import { useDailyReward } from "@/hooks/useGamification";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gift, Flame } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function DailyRewardButton() {
  const { checkCanClaim, claimReward } = useDailyReward();

  const canClaim = checkCanClaim.data?.canClaim;
  const streak = checkCanClaim.data?.streak || 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="h-5 w-5" />
          Denná odmena
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            <span className="text-sm font-medium">Streak</span>
          </div>
          <Badge variant={streak > 0 ? "default" : "secondary"}>
            {streak} {streak === 1 ? "deň" : streak < 5 ? "dni" : "dní"}
          </Badge>
        </div>

        <Button
          onClick={() => claimReward.mutate()}
          disabled={!canClaim || claimReward.isPending}
          className="w-full"
          size="lg"
        >
          {claimReward.isPending ? (
            "Získavam..."
          ) : canClaim ? (
            <>
              <Gift className="h-4 w-4 mr-2" />
              Získať dennú odmenu
            </>
          ) : (
            "Už si dnes získal odmenu"
          )}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          {canClaim
            ? "Získaj body za prihlásenie každý deň!"
            : "Príď zajtra po ďalšiu odmenu"}
        </p>
      </CardContent>
    </Card>
  );
}
