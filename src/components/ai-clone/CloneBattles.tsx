import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Swords, Bot, Loader2, Trophy, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export function CloneBattles() {
  const { toast } = useToast();
  const [isMatching, setIsMatching] = useState(false);
  const [battleResult, setBattleResult] = useState<{ winner: string; analysis: string } | null>(null);

  const startBattle = async () => {
    setIsMatching(true);
    setBattleResult(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "Sign in required", variant: "destructive" });
        return;
      }

      const { data: userClones } = await supabase
        .from("personality_clones")
        .select("clone_name, personality_data")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .limit(1);

      if (!userClones?.length) {
        toast({ title: "No Active Clone", description: "Create and activate a clone first", variant: "destructive" });
        return;
      }

      const { data: opponents } = await supabase
        .from("personality_clones")
        .select("clone_name, personality_data")
        .neq("user_id", user.id)
        .eq("is_active", true)
        .limit(1);

      const opponentName = opponents?.[0]?.clone_name || "Mystery Bot";
      const yourClone = userClones[0];
      const personalityText = typeof yourClone.personality_data === 'object' && yourClone.personality_data !== null ? (yourClone.personality_data as any).personality || "friendly" : "friendly";

      const { data, error } = await supabase.functions.invoke("clone-chat", {
        body: {
          message: `Simulate a wit battle between "${yourClone.clone_name}" (personality: ${yourClone.personality_data?.personality || "friendly"}) and "${opponentName}". Write 2 rounds of clever exchanges (2-3 lines each), then declare a winner with a fun reason. Keep it lighthearted.`,
          cloneId: "battle",
          clonePersonality: "You are an entertaining AI battle commentator. Keep it fun and family-friendly."
        }
      });

      if (error) throw error;

      setBattleResult({
        winner: Math.random() > 0.5 ? yourClone.clone_name : opponentName,
        analysis: data.response || "An epic battle of wits! Both clones showed impressive personality."
      });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Battle failed", variant: "destructive" });
    } finally {
      setIsMatching(false);
    }
  };

  return (
    <Card className="bg-card/80 backdrop-blur-xl border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Swords className="h-5 w-5 text-primary" />
          Clone Personality Battles
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-4">
          <div className="flex justify-center items-center gap-6 mb-6">
            <motion.div animate={{ x: [0, -5, 0] }} transition={{ duration: 1, repeat: Infinity }} className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-2 border-2 border-primary/40">
                <Bot className="h-8 w-8 text-primary" />
              </div>
              <span className="text-xs font-medium">Your Clone</span>
            </motion.div>
            <Swords className="h-8 w-8 text-muted-foreground" />
            <motion.div animate={{ x: [0, 5, 0] }} transition={{ duration: 1, repeat: Infinity }} className="text-center">
              <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-2 border-2 border-accent/40">
                <Bot className="h-8 w-8 text-accent" />
              </div>
              <span className="text-xs font-medium">Opponent</span>
            </motion.div>
          </div>

          <p className="text-sm text-muted-foreground mb-4">
            Pit your clone against another in a battle of wit, charm, and personality!
          </p>

          <Button onClick={startBattle} disabled={isMatching} size="lg" className="mb-4">
            {isMatching ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Finding opponent...</> : <><Swords className="h-4 w-4 mr-2" /> Start Battle (€1.99)</>}
          </Button>

          {battleResult && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-4 bg-background/50 rounded-xl p-4 border border-primary/20 text-left">
              <div className="flex items-center gap-2 mb-3">
                <Trophy className="h-5 w-5 text-yellow-400" />
                <span className="font-bold">Winner: {battleResult.winner}</span>
                <Badge variant="outline"><Sparkles className="h-3 w-3 mr-1" /> Battle Complete</Badge>
              </div>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{battleResult.analysis}</p>
            </motion.div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
