import { useState } from "react";
import { Megaphone, Star, Loader2, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { showMonetagRewarded } from "@/lib/monetag";
import { toast } from "sonner";

const XP_REWARD = 50;

/**
 * Native-looking sponsored card injected every 20th post in the Wall feed.
 * Users earn +50 XP per ad slot per day for watching the rewarded ad.
 */
const MonetagInFeedAd = ({ slotIndex }: { slotIndex: number }) => {
  const [loading, setLoading] = useState(false);
  const [claimed, setClaimed] = useState(false);

  const handleWatch = async () => {
    if (loading || claimed) return;
    setLoading(true);
    try {
      const shown = await showMonetagRewarded();
      if (!shown) {
        toast.error("Ad couldn't load. Try again in a moment.");
        return;
      }

      const { data: auth } = await supabase.auth.getUser();
      const uid = auth?.user?.id;
      if (!uid) {
        toast.error("Sign in to earn XP from ads.");
        return;
      }

      const today = new Date().toISOString().slice(0, 10);
      const { error } = await supabase.rpc("award_xp", {
        _user_id: uid,
        _amount: XP_REWARD,
        _source: "feed_ad_view",
        _ref_id: `${today}:${slotIndex}`,
      });

      if (error) {
        toast.error("Couldn't credit XP. Please retry.");
        return;
      }

      setClaimed(true);
      toast.success(`+${XP_REWARD} XP earned!`, {
        description: "Thanks for supporting creators on Unique.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="relative overflow-hidden border border-primary/30 bg-gradient-to-br from-card/90 to-card/70 backdrop-blur-xl">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
            <Megaphone className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-primary">Sponsored Ad</p>
            <p className="text-xs text-muted-foreground truncate">
              Because you matter.
            </p>
          </div>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground/70 border border-primary/30 rounded-full px-2 py-0.5">
            Ad #{slotIndex}
          </span>
        </div>

        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground flex-1">
            Watch a short sponsored message and earn{" "}
            <span className="text-accent font-semibold">+{XP_REWARD} XP</span>.
          </p>
          <Button
            size="sm"
            onClick={handleWatch}
            disabled={loading || claimed}
            className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white shrink-0"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : claimed ? (
              <>
                <Star className="w-4 h-4 mr-1 fill-current" />
                Claimed
              </>
            ) : (
              <>
                Watch & Earn
                <ArrowRight className="w-4 h-4 ml-1" />
              </>
            )}
          </Button>
        </div>

        <div className="flex items-center justify-end">
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-accent border border-accent/40 rounded-full px-2 py-0.5">
            <Star className="w-3 h-3 fill-current" />
            +{XP_REWARD} XP
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default MonetagInFeedAd;
