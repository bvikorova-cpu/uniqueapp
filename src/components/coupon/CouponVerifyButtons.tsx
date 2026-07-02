import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, ThumbsDown, ShieldCheck } from "lucide-react";
import { useCouponVerifications } from "@/hooks/useCouponVerifications";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Props { couponId: string; userId: string | null; compact?: boolean; }

export function CouponVerifyButtons({ couponId, userId, compact }: Props) {
  const { stats, myStatus, vote, loading } = useCouponVerifications(couponId, userId);
  const total = stats.worked + stats.didnt_work;

  return (
    <>
      <FloatingHowItWorks title={"Coupon Verify Buttons - How it works"} steps={[{ title: 'Open', desc: 'Access the Coupon Verify Buttons section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Coupon Verify Buttons.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className={`flex items-center gap-2 ${compact ? "text-xs" : "text-sm"}`}>
      <Button size={compact ? "sm" : "default"} variant={myStatus === "worked" ? "default" : "outline"}
        disabled={loading} onClick={(e) => { e.stopPropagation(); vote("worked"); }} className="h-8">
        <ThumbsUp className="w-3.5 h-3.5" /> Worked ({stats.worked})
      </Button>
      <Button size={compact ? "sm" : "default"} variant={myStatus === "didnt_work" ? "destructive" : "outline"}
        disabled={loading} onClick={(e) => { e.stopPropagation(); vote("didnt_work"); }} className="h-8">
        <ThumbsDown className="w-3.5 h-3.5" /> No ({stats.didnt_work})
      </Button>
      {total >= 3 && (
        <Badge variant="outline" className="gap-1">
          <ShieldCheck className="w-3 h-3 text-emerald-500" />
          {stats.success_pct}% success
        </Badge>
      )}
    </div>
    </>
  );
}
