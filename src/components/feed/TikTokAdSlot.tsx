import { useState } from "react";
import { Megaphone, Star, Loader2, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { MONETAG_ZONES, showMonetagRewarded } from "@/lib/monetag";
import { toast } from "sonner";

const XP_REWARD = 50;

/**
 * Vertical full-screen sponsored slot injected every 10th video in the
 * TikTok-style short-form feed. Tapping "Watch" opens the Monetag rewarded
 * interstitial and credits XP on a successful impression.
 */
export function TikTokAdSlot({ slotIndex }: { slotIndex: number }) {
  const [loading, setLoading] = useState(false);
  const [claimed, setClaimed] = useState(false);

  const handleWatch = async () => {
    if (loading || claimed) return;
    setLoading(true);
    try {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth?.user?.id;
      if (!uid) {
        toast.error("Sign in to earn XP from ads.");
        return;
      }

      const today = new Date().toISOString().slice(0, 10);
      const refId = `${today}:tiktok:${slotIndex}`;

      const { data: existing } = await supabase
        .from("xp_events")
        .select("id")
        .eq("user_id", uid)
        .eq("source", "video_feed_ad_view")
        .eq("ref_id", refId)
        .maybeSingle();

      if (existing) {
        setClaimed(true);
        toast.info("Already claimed today — come back tomorrow for more XP.");
        return;
      }

      const shown = await showMonetagRewarded(MONETAG_ZONES.REWARDED_INTERSTITIAL);
      if (!shown) {
        toast.error("Ad couldn't load or was closed too early. Try again.");
        return;
      }

      const { error } = await supabase.rpc("award_xp", {
        _user_id: uid,
        _amount: XP_REWARD,
        _source: "video_feed_ad_view",
        _ref_id: refId,
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
    <div className="h-[100dvh] w-full snap-start snap-always bg-black flex items-center justify-center p-6">
      <Card className="w-full max-w-sm border border-primary/30 bg-gradient-to-br from-card/90 to-card/70 backdrop-blur-xl">
        <CardContent className="p-6 space-y-6 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
            <Megaphone className="w-8 h-8 text-white" />
          </div>

          <div className="space-y-2">
            <p className="text-lg font-semibold text-primary">Sponsored Ad</p>
            <p className="text-sm text-muted-foreground">
              Watch a short sponsored message and earn{" "}
              <span className="text-accent font-semibold">+{XP_REWARD} XP</span>.
            </p>
          </div>

          <Button
            size="lg"
            onClick={handleWatch}
            disabled={loading || claimed}
            className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white"
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

          <span className="text-[10px] uppercase tracking-wider text-muted-foreground/70 border border-primary/30 rounded-full px-2 py-0.5">
            Ad #{slotIndex}
          </span>
        </CardContent>
      </Card>
    </div>
  );
}
