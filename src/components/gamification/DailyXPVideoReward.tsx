import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Play, Sparkles, CheckCircle, Clock, Tv } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { showMonetagRewarded, trackMonetagEvent, MONETAG_ZONES } from "@/lib/monetag";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface DailyXPVideoRewardProps {
  userId: string;
}

export const DailyXPVideoReward = ({ userId }: DailyXPVideoRewardProps) => {
  const [canClaim, setCanClaim] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showAdDialog, setShowAdDialog] = useState(false);
  const [adProgress, setAdProgress] = useState(0);
  const [isWatching, setIsWatching] = useState(false);
  const [claimedToday, setClaimedToday] = useState(false);
  const [totalXP, setTotalXP] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const AD_DURATION = 15; // 15 seconds video ad

  useEffect(() => {
    checkDailyClaim();
    return (
    <>
      <FloatingHowItWorks title={"Daily X P Video Reward - How it works"} steps={[{ title: 'Open', desc: 'Access the Daily X P Video Reward section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Daily X P Video Reward.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      
    </>
  ) => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [userId]);

  const checkDailyClaim = async () => {
    if (!userId) return;

    setIsLoading(true);
    try {
      // Unlimited XP — fetch lifetime total but never block claiming.
      const { data: totalClaims } = await supabase
        .from("daily_xp_claims")
        .select("xp_earned")
        .eq("user_id", userId);

      const total = totalClaims?.reduce((sum, c) => sum + c.xp_earned, 0) || 0;
      setTotalXP(total);

      setClaimedToday(false);
      setCanClaim(true);
    } catch (error) {
      setCanClaim(true);
    } finally {
      setIsLoading(false);
    }
  };

  const startWatchingAd = () => {
    setShowAdDialog(true);
    setIsWatching(true);
    setAdProgress(0);

    // Trigger Monetag Vignette (fullscreen on click)
    trackMonetagEvent("click", MONETAG_ZONES.REWARDED_VIGNETTE, "rewards_watch_earn_xp");
    void showMonetagRewarded().then((shown) => {
      if (shown) {
        trackMonetagEvent("impression", MONETAG_ZONES.REWARDED_VIGNETTE, "rewards_watch_earn_xp");
      }
    });

    let elapsed = 0;
    timerRef.current = setInterval(() => {
      elapsed += 1;
      const progress = (elapsed / AD_DURATION) * 100;
      setAdProgress(progress);

      if (elapsed >= AD_DURATION) {
        if (timerRef.current) clearInterval(timerRef.current);
        claimXP();
      }
    }, 1000);
  };

  const claimXP = async () => {
    setIsWatching(false);

    try {
      const today = new Date().toISOString().split('T')[0];

      // 30s soft throttle (anti-fraud)
      const cutoff = new Date(Date.now() - 30_000).toISOString();
      const { data: recent } = await supabase
        .from("daily_xp_claims")
        .select("created_at")
        .eq("user_id", userId)
        .gte("created_at", cutoff)
        .limit(1);

      if (recent && recent.length > 0) {
        toast({
          title: "Slow down ⏱️",
          description: "Wait 30 seconds between claims.",
          variant: "destructive",
        });
        setShowAdDialog(false);
        return;
      }

      const { error: claimError } = await supabase
        .from("daily_xp_claims")
        .insert({
          user_id: userId,
          xp_earned: 1,
          claim_date: today,
          ad_watched: true
        });

      if (claimError) throw claimError;

      const { error: pointsError } = await supabase.rpc('add_user_points', {
        p_user_id: userId,
        p_points: 1,
        p_activity_type: 'daily_video_xp'
      });

      if (pointsError) throw pointsError;

      setTotalXP(prev => prev + 1);

      queryClient.invalidateQueries({ queryKey: ["gamification", userId] });
      queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
      queryClient.invalidateQueries({ queryKey: ["weekly-xp-leaderboard"] });

      toast({
        title: "🎉 +1 XP!",
        description: "Watch another ad to earn more — no daily limit!",
      });

      setTimeout(() => {
        setShowAdDialog(false);
        setCanClaim(true);
        setClaimedToday(false);
        setAdProgress(0);
      }, 1500);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to claim XP",
        variant: "destructive"
      });
      setShowAdDialog(false);
    }
  };

  const cancelAd = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsWatching(false);
    setShowAdDialog(false);
    setAdProgress(0);
  };

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
        <CardContent className="p-4 flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-purple-500 border-t-transparent" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20 overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Tv className="h-5 w-5 text-purple-500" />
            Watch & Earn XP
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-500" />
              <span className="text-sm text-muted-foreground">
                Total earned: <strong className="text-foreground">{totalXP} XP</strong>
              </span>
            </div>
          </div>

          {claimedToday ? (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
              <CheckCircle className="h-6 w-6 text-green-500" />
              <div>
                <p className="font-medium text-green-700 dark:text-green-400">Already done today!</p>
                <p className="text-sm text-muted-foreground">Come back tomorrow for more XP</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Watch a 15s ad — earn 1 XP. <span className="text-foreground font-semibold">Unlimited.</span></span>
              </div>
              <Button
                onClick={startWatchingAd}
                disabled={!canClaim}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                <Play className="h-4 w-4 mr-2" />
                Watch Ad (+1 XP)
              </Button>
            </div>
          )}
        </CardContent>
      </Card>





      <Dialog open={showAdDialog} onOpenChange={(open) => !isWatching && setShowAdDialog(open)}>
        <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => isWatching && e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Tv className="h-5 w-5 text-purple-500" />
              {isWatching ? "Watching ad..." : "🎉 Done!"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {isWatching ? (
              <>
                <div className="aspect-video bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 rounded-lg flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-black/20" />
                  <div className="relative z-10 text-center text-white">
                    <Sparkles className="h-12 w-12 mx-auto mb-2 animate-pulse" />
                    <p className="font-bold text-xl">Ad Content</p>
                    <p className="text-sm opacity-80">Thanks for watching!</p>
                  </div>
                  <div className="absolute bottom-2 left-2 right-2">
                    <Progress value={adProgress} className="h-2" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Remaining: {Math.ceil(AD_DURATION - (adProgress / 100 * AD_DURATION))}s
                  </span>
                  <Button variant="ghost" size="sm" onClick={cancelAd}>
                    Cancel
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-6">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center">
                  <CheckCircle className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-2">+1 XP</h3>
                <p className="text-muted-foreground">You successfully earned daily XP!</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
