import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown } from "lucide-react";
import { useCouponVotes } from "@/hooks/useCouponVotes";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export function CouponVoteWidget({ couponId, userId, vertical }: { couponId: string; userId: string | null; vertical?: boolean }) {
  const { up, down, myVote, cast, score } = useCouponVotes(couponId, userId);
  return (
    <>
      <FloatingHowItWorks title={"Coupon Vote Widget - How it works"} steps={[{ title: 'Open', desc: 'Access the Coupon Vote Widget section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Coupon Vote Widget.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
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
    </>
  );
}
