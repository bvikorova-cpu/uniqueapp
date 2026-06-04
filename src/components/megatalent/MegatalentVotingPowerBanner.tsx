import { useMegaTalentTier } from "@/hooks/useMegaTalentTier";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function MegatalentVotingPowerBanner() {
  const { tier, isSubscribed } = useMegaTalentTier();
  const navigate = useNavigate();

  const boostPct = tier === "top_premium" ? 100 : 0;
  const multiplierLabel = tier === "top_premium" ? "×2" : "×1";

  return (
    <Card
      className={`backdrop-blur-xl border-primary/40 overflow-hidden ${
        isSubscribed
          ? "bg-gradient-to-r from-primary/20 to-accent/20"
          : "bg-card/80"
      }`}
    >
      <CardContent className="p-3 flex items-center gap-3">
        <div
          className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
            isSubscribed ? "bg-gradient-to-br from-primary to-accent" : "bg-muted"
          }`}
        >
          {isSubscribed ? (
            <Crown className="h-5 w-5 text-white" />
          ) : (
            <Zap className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-bold">Ranking boost</p>
            <Badge
              className={
                boostPct > 0
                  ? "bg-gradient-to-r from-primary to-accent text-white text-[10px]"
                  : "text-[10px]"
              }
              variant={boostPct > 0 ? "default" : "secondary"}
            >
              {multiplierLabel}
            </Badge>
          </div>
          <p className="text-[11px] text-muted-foreground">
            {tier === "top_premium"
              ? "TOP Premium — your submissions rank with score = real votes × 2 (+100%). Vote count shown stays real."
              : tier === "premium"
              ? "Premium — ranking score = real votes × 1. Upgrade to TOP Premium for +100% boost."
              : "Upgrade to TOP Premium for +100% ranking boost (real votes × 2)"}
          </p>
        </div>
        {!isSubscribed && (
          <Button size="sm" onClick={() => navigate("/megatalent")} className="shrink-0 h-8">
            Upgrade
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
