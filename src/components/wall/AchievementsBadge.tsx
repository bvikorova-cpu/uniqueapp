import { useState, useEffect, useRef } from "react";
import { Trophy, Play, Tv, CheckCircle, Clock, Sparkles, RefreshCw } from "lucide-react";
import { useAchievements } from "@/hooks/useAchievements";
import { useAchievementChecker } from "@/hooks/useAchievementChecker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export const AchievementsBadge = () => {
  const { userAchievements, allAchievements, totalPoints, isLoading } = useAchievements();
  const { checkAllAchievements } = useAchievementChecker();
  const [userId, setUserId] = useState<string | null>(null);
  const [canClaim, setCanClaim] = useState(false);
  const [claimedToday, setClaimedToday] = useState(false);
  const [showAdDialog, setShowAdDialog] = useState(false);
  const [adProgress, setAdProgress] = useState(0);
  const [isWatching, setIsWatching] = useState(false);
  const [videoXPLoading, setVideoXPLoading] = useState(true);
  const [isCheckingAchievements, setIsCheckingAchievements] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasCheckedRef = useRef(false);

  const AD_DURATION = 15;

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        checkDailyClaim(user.id);
        
        // Auto-check achievements on first load
        if (!hasCheckedRef.current) {
          hasCheckedRef.current = true;
          checkAllAchievements(user.id);
        }
      } else {
        setVideoXPLoading(false);
      }
    };
    getUser();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [checkAllAchievements]);

  const checkDailyClaim = async (uid: string) => {
    setVideoXPLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data: claim } = await supabase
        .from("daily_xp_claims")
        .select("*")
        .eq("user_id", uid)
        .eq("claim_date", today)
        .maybeSingle();

      setClaimedToday(!!claim);
      setCanClaim(!claim);
    } catch {
      setCanClaim(true);
    } finally {
      setVideoXPLoading(false);
    }
  };

  const startWatchingAd = () => {
    setShowAdDialog(true);
    setIsWatching(true);
    setAdProgress(0);

    let elapsed = 0;
    timerRef.current = setInterval(() => {
      elapsed += 1;
      setAdProgress((elapsed / AD_DURATION) * 100);
      if (elapsed >= AD_DURATION) {
        if (timerRef.current) clearInterval(timerRef.current);
        claimXP();
      }
    }, 1000);
  };

  const claimXP = async () => {
    if (!userId) return;
    setIsWatching(false);
    
    try {
      const today = new Date().toISOString().split('T')[0];
      
      await supabase.from("daily_xp_claims").insert({
        user_id: userId,
        xp_earned: 1,
        claim_date: today,
        ad_watched: true
      });

      await supabase.rpc('add_user_points', {
        p_user_id: userId,
        p_points: 1,
        p_activity_type: 'daily_video_xp'
      });

      setClaimedToday(true);
      setCanClaim(false);
      
      queryClient.invalidateQueries({ queryKey: ["user-achievements"] });
      queryClient.invalidateQueries({ queryKey: ["gamification", userId] });

      toast({
        title: "🎉 +1 XP!",
        description: "You earned 1 XP for watching the ad!",
      });

      setTimeout(() => setShowAdDialog(false), 1500);
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
      <div className="flex items-center gap-2 bg-muted rounded-full px-3 py-1.5 animate-pulse">
        <Trophy className="w-4 h-4" />
        <span className="text-sm font-bold">...</span>
      </div>
    );
  }

  const progress = allAchievements.length > 0 
    ? (userAchievements.length / allAchievements.length) * 100 
    : 0;

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <button className="flex items-center gap-2 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full px-3 py-1.5 hover:from-primary/20 hover:to-accent/20 transition-all group">
            <Trophy className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
            <span className="text-sm font-bold text-foreground">{totalPoints}</span>
            <span className="text-xs text-muted-foreground">pts</span>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-80 max-h-[70vh] overflow-hidden flex flex-col">
          <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
            {/* Video XP Section */}
            {userId && (
              <div className="p-3 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Tv className="w-4 h-4 text-purple-500" />
                  <span className="font-medium text-sm">Daily XP Reward</span>
                </div>
                {videoXPLoading ? (
                  <div className="h-8 animate-pulse bg-muted rounded" />
                ) : claimedToday ? (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span>Claimed today! Come back tomorrow.</span>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    onClick={startWatchingAd}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    <Play className="w-3 h-3 mr-1" />
                    Watch Ad (+1 XP)
                  </Button>
                )}
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">Achievements</h4>
                <div className="flex items-center gap-2">
                  {userId && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={async () => {
                        setIsCheckingAchievements(true);
                        await checkAllAchievements(userId);
                        setIsCheckingAchievements(false);
                      }}
                      disabled={isCheckingAchievements}
                    >
                      <RefreshCw className={`h-3 w-3 ${isCheckingAchievements ? 'animate-spin' : ''}`} />
                    </Button>
                  )}
                  <span className="text-sm text-muted-foreground">
                    {userAchievements.length}/{allAchievements.length}
                  </span>
                </div>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <div className="space-y-2 overflow-y-auto flex-1 pr-1">
              {allAchievements.map((achievement) => {
                const earned = userAchievements.find(ua => ua.id === achievement.id);
                return (
                  <div
                    key={achievement.id}
                    className={`flex items-start gap-3 p-2 rounded-lg ${
                      earned ? "bg-primary/5" : "bg-muted/50 opacity-50"
                    }`}
                  >
                    <div className="text-2xl">{achievement.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h5 className="font-medium text-sm">{achievement.name}</h5>
                        <span className="text-xs text-primary font-bold">
                          +{achievement.points}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {achievement.description}
                      </p>
                      {earned && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Earned {new Date(earned.earned_at!).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <Dialog open={showAdDialog} onOpenChange={(open) => !isWatching && setShowAdDialog(open)}>
        <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => isWatching && e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Tv className="h-5 w-5 text-purple-500" />
              {isWatching ? "Watching Ad..." : "🎉 Done!"}
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
