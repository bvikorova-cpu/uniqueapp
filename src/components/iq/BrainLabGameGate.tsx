import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lock, Loader2, Brain, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export const BRAIN_LAB_GAME_COST = 1;

interface BrainLabGameGateProps {
  children: React.ReactNode;
}

export default function BrainLabGameGate({ children }: BrainLabGameGateProps) {
  const [unlocked, setUnlocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const qc = useQueryClient();

  const unlock = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Please sign in",
          description: "You need to be logged in to play Brain Lab games.",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.rpc("spend_ai_credits" as any, {
        _amount: BRAIN_LAB_GAME_COST,
        _reason: "brain_lab_game",
        _source: "iq_platform",
      });

      if (error || !(data as any)?.ok) {
        toast({
          title: (data as any)?.error === "insufficient" ? "Not enough credits" : "Cannot unlock game",
          description:
            (data as any)?.error === "insufficient"
              ? `You need ${BRAIN_LAB_GAME_COST} credit to play this game.`
              : error?.message || "Credit charge failed. Please try again.",
          variant: "destructive",
        });
        return;
      }

      setUnlocked(true);
      qc.invalidateQueries({ queryKey: ["ai-credits"] });
      toast({
        title: "Game unlocked",
        description: `${BRAIN_LAB_GAME_COST} credit used. Good luck!`,
      });
    } finally {
      setLoading(false);
    }
  };

  if (unlocked) return <>{children}</>;

  return (
    <div className="relative h-full">
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 p-5 rounded-xl bg-card/95 backdrop-blur-md border border-primary/20 text-center shadow-lg">
        <div className="p-3 rounded-full bg-gradient-to-br from-primary/20 to-pink-500/20">
          <Brain className="h-6 w-6 text-primary" />
        </div>
        <div>
          <p className="font-bold text-sm flex items-center justify-center gap-1">
            <Sparkles className="h-3 w-3 text-pink-500" /> Brain Training Game
          </p>
          <p className="text-xs text-muted-foreground mt-1">Unlock to play this mini-game</p>
        </div>
        <Badge variant="outline" className="text-[10px]">
          {BRAIN_LAB_GAME_COST} credit
        </Badge>
        <Button
          onClick={unlock}
          disabled={loading}
          size="sm"
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Lock className="h-3 w-3 mr-1" /> Play
            </>
          )}
        </Button>
      </div>
      <div className="opacity-25 pointer-events-none select-none h-full grayscale">
        {children}
      </div>
    </div>
  );
}
