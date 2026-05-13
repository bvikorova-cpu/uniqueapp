import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Play, X, Gift, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface VideoAdCardProps {
  adIndex: number;
}

export function VideoAdCard({ adIndex }: VideoAdCardProps) {
  const [isWatching, setIsWatching] = useState(false);
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [xpEarned, setXpEarned] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isWatching) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsWatching(false);
          setCompleted(true);
          handleAdCompleted();
          return 100;
        }
        return prev + (100 / 15); // 15 seconds
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isWatching]);

  const handleAdCompleted = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Award 1 XP for watching ad
      const { error } = await supabase.rpc('add_user_points', {
        p_user_id: user.id,
        p_points: 1,
        p_activity_type: 'video_ad_watch'
      });

      if (error) throw error;

      setXpEarned(true);
      queryClient.invalidateQueries({ queryKey: ["gamification"] });
      
      toast({
        title: "🎉 +1 XP!",
        description: "Thanks for watching the ad!",
      });
    } catch (error) {
      console.error("Error awarding XP:", error);
    }
  };

  const startWatching = () => {
    setIsWatching(true);
    setProgress(0);
  };

  const cancelWatching = () => {
    setIsWatching(false);
    setProgress(0);
  };

  if (completed && xpEarned) {
    return (
      <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30">
        <CardContent className="p-4 flex items-center justify-center gap-3">
          <CheckCircle className="h-5 w-5 text-green-500" />
          <span className="text-green-600 dark:text-green-400 font-medium">
            Ad completed • +1 XP gained!
          </span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20 overflow-hidden">
      <CardContent className="p-4">
        {isWatching ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium">Playing advertisement...</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={cancelWatching}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Simulated video area */}
            <div className="relative bg-black/20 rounded-lg aspect-video flex items-center justify-center">
              <div className="text-center space-y-2">
                <div className="text-4xl animate-pulse">📺</div>
                <p className="text-sm text-muted-foreground">
                  Video reklama #{adIndex}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{Math.ceil((100 - progress) / (100 / 15))}s remaining</span>
                <span className="flex items-center gap-1">
                  <Gift className="h-3 w-3 text-primary" />
                  +1 XP upon completion
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Play className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">Earn +1 XP</p>
                <p className="text-xs text-muted-foreground">
                  Watch a short ad (15s)
                </p>
              </div>
            </div>
            <Button
              onClick={startWatching}
              size="sm"
              className="gap-2"
            >
              <Play className="h-4 w-4" />
              Watch
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
