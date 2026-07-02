import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Swords, Bot, Loader2, Trophy, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const BATTLE_SCRIPTS = [
  { winner: "yours", analysis: "Round 1: Your clone opened with a devastating pun about quantum physics. The opponent tried to counter with a joke about Schrödinger's cat, but your clone's timing was impeccable!\n\nRound 2: The opponent rallied with a clever wordplay, but your clone delivered the knockout blow with a perfectly crafted metaphor about AI consciousness. Victory!" },
  { winner: "opponent", analysis: "Round 1: Both clones came out swinging with witty observations about modern technology. The opponent's dry humor caught everyone off guard!\n\nRound 2: Your clone made a valiant effort with a creative analogy, but the opponent sealed the deal with a brilliantly timed comeback. Close match!" },
  { winner: "yours", analysis: "Round 1: Your clone immediately established dominance with an eloquent monologue about the nature of personality. The opponent was visibly impressed!\n\nRound 2: A fierce exchange of ideas followed, but your clone's natural charm and wit won the crowd over. Flawless victory!" },
  { winner: "opponent", analysis: "Round 1: The opponent opened with unexpected warmth, disarming your clone's strategic approach. A clever move!\n\nRound 2: Your clone adapted quickly and delivered some excellent points, but the opponent's consistency throughout earned them the edge. A worthy adversary!" },
];

export function CloneBattles() {
  const { toast } = useToast();
  const [isMatching, setIsMatching] = useState(false);
  const [battleResult, setBattleResult] = useState<{ winner: string; analysis: string } | null>(null);

  const startBattle = async () => {
    setIsMatching(true);
    setBattleResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("clone-battle", { body: {} });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setBattleResult({ winner: data.winner, analysis: data.analysis });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Battle failed", variant: "destructive" });
    } finally {
      setIsMatching(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks title={"Clone Battles - How it works"} steps={[{ title: 'Open', desc: 'Access the Clone Battles section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Clone Battles.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
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
            {isMatching ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Finding opponent...</> : <><Swords className="h-4 w-4 mr-2" /> Start Battle</>}
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
    </>
  );
}
