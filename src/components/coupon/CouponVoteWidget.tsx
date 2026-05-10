import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown } from "lucide-react";
import { useCouponVotes } from "@/hooks/useCouponVotes";

export function CouponVoteWidget({ couponId, userId, vertical }: { couponId: string; userId: string | null; vertical?: boolean }) {
  const { up, down, myVote, cast, score } = useCouponVotes(couponId, userId);
  return (
    <div className={`flex ${vertical ? "flex-col" : "items-center"} gap-1`}>
      <Button size="icon" variant={myVote === 1 ? "default" : "ghost"} className="h-7 w-7"
        onClick={(e) => { e.stopPropagation(); cast(1); }} aria-label="Upvote">
        <ChevronUp className="w-4 h-4" />
      </Button>
      <span className={`text-xs font-bold tabular-nums ${score > 0 ? "text-emerald-500" : score < 0 ? "text-rose-500" : ""}`}>{score}</span>
      <Button size="icon" variant={myVote === -1 ? "destructive" : "ghost"} className="h-7 w-7"
        onClick={(e) => { e.stopPropagation(); cast(-1); }} aria-label="Downvote">
        <ChevronDown className="w-4 h-4" />
      </Button>
    </div>
  );
}
