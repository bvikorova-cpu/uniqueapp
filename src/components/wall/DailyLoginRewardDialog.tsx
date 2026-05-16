import { useState } from "react";
import { Flame, Loader2, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useDailyLoginReward } from "@/hooks/useDailyLoginReward";
import { useToast } from "@/hooks/use-toast";

export function DailyLoginRewardDialog() {
  const [open, setOpen] = useState(false);
  const { streak, loading, claiming, canClaim, claim } = useDailyLoginReward();
  const { toast } = useToast();

  const onClaim = async () => {
    const res = await claim();
    if (res?.claimed) {
      toast({
        title: `+${res.bonus} credit${(res.bonus ?? 1) === 1 ? "" : "s"}`,
        description: `Streak: ${res.streak} days 🔥`,
      });
    } else if (res) {
      toast({ title: "You've already claimed today", variant: "default" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-2">
          <Flame className={`h-4 w-4 ${canClaim ? "text-orange-400" : ""}`} />
          {streak?.current_streak ?? 0}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" /> Daily reward
          </DialogTitle>
        </DialogHeader>
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin mx-auto my-6" />
        ) : (
          <div className="space-y-4 text-center py-2">
            <div>
              <p className="text-4xl font-bold">{streak?.current_streak ?? 0} 🔥</p>
              <p className="text-xs text-muted-foreground">current streak</p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              <div className="rounded-md border border-border/50 p-2">
                <p className="text-lg font-semibold text-foreground">{streak?.longest_streak ?? 0}</p>
                rekord
              </div>
              <div className="rounded-md border border-border/50 p-2">
                <p className="text-lg font-semibold text-foreground">{streak?.total_claims ?? 0}</p>
                celkom
              </div>
            </div>
            <Button onClick={onClaim} disabled={!canClaim || claiming} className="w-full">
              {claiming && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {canClaim ? "Claim today's reward" : "Return tomorrow"}
            </Button>
            <p className="text-[10px] text-muted-foreground">
              +1 credit daily, every 7 days +1 bonus (max +10).
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
