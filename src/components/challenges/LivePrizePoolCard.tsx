import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Heart, Building2, Users, RefreshCw } from "lucide-react";
import { useChallengePrizePool, formatEuroCents, type ChallengePoolKind } from "@/hooks/useChallengePrizePool";

interface LivePrizePoolCardProps {
  /** Visual accent matching the challenge page. */
  accent?: "emerald" | "rose";
  challengeLabel: string;
  /** Which challenge pool to show — eco and healthy are fully separate. */
  challenge: ChallengePoolKind;
}

/**
 * Real-time monthly pool collected from active PRO / TOP subscriptions.
 * No estimates — the numbers come from the database and refresh live.
 */
export const LivePrizePoolCard = ({ accent = "emerald", challengeLabel, challenge }: LivePrizePoolCardProps) => {
  const { data, isLoading, isFetching } = useChallengePrizePool(challenge);

  const ring = accent === "rose" ? "border-rose-300/40" : "border-emerald-300/40";
  const bg =
    accent === "rose"
      ? "bg-gradient-to-br from-rose-950 via-pink-900 to-fuchsia-900"
      : "bg-gradient-to-br from-emerald-950 via-green-900 to-teal-900";

  const cell = "rounded-xl bg-white/10 border border-white/15 p-3";

  return (
    <Card className={`overflow-hidden border-2 ${ring} ${bg} text-white mb-6`}>
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-center justify-between gap-2 mb-3">
          <Badge className="bg-white/15 border border-white/25 text-white">
            LIVE · {challengeLabel} pool this month
          </Badge>
          <span className="flex items-center gap-1.5 text-[11px] text-white/70">
            <RefreshCw className={`w-3 h-3 ${isFetching ? "animate-spin" : ""}`} />
            updates in real time
          </span>
        </div>

        <p className="text-3xl sm:text-4xl font-black drop-shadow">
          {isLoading ? "…" : formatEuroCents(data?.revenueCents ?? 0)}
        </p>
        <p className="text-xs text-white/75 mt-1">
          Collected from {data?.subscribers ?? 0} active {challengeLabel} subscriptions
          {data ? ` (${data.proCount}× PRO €3 · ${data.topCount}× TOP €5)` : ""}
        </p>

        <div className="grid grid-cols-3 gap-2 mt-4 text-center">
          <div className={cell}>
            <Trophy className="w-4 h-4 mx-auto mb-1 text-yellow-300" />
            <p className="text-sm sm:text-base font-bold">{formatEuroCents(data?.winnerCents ?? 0)}</p>
            <p className="text-[10px] sm:text-xs text-white/70">50% champion</p>
          </div>
          <div className={cell}>
            <Heart className="w-4 h-4 mx-auto mb-1 text-pink-300" />
            <p className="text-sm sm:text-base font-bold">{formatEuroCents(data?.charityCents ?? 0)}</p>
            <p className="text-[10px] sm:text-xs text-white/70">20% charity</p>
          </div>
          <div className={cell}>
            <Building2 className="w-4 h-4 mx-auto mb-1 text-white/80" />
            <p className="text-sm sm:text-base font-bold">{formatEuroCents(data?.platformCents ?? 0)}</p>
            <p className="text-[10px] sm:text-xs text-white/70">30% platform</p>
          </div>
        </div>

        <p className="flex items-center gap-1.5 text-[11px] text-white/65 mt-3">
          <Users className="w-3 h-3" /> The pool grows with every new PRO / TOP subscription and is paid out on the 1st.
        </p>
      </CardContent>
    </Card>
  );
};

export default LivePrizePoolCard;
