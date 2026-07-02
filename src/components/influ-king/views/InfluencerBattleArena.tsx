import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Swords, Loader2, Sparkles, Trophy, Zap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
interface Props { onBack: () => void; }

export default function InfluencerBattleArena({ onBack }: Props) {
  const [player1, setPlayer1] = useState("");
  const [player2, setPlayer2] = useState("");
  const [battle, setBattle] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const startBattle = async () => {
    if (!player1 || !player2) { toast.error("Enter both influencer names"); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("influ-king-ai", {
        body: { action: "battle", player1, player2 },
      });
      if (error) throw error;
      setBattle(data);
      toast.success("Battle complete!");
    } catch (e: any) {
      toast.error(e.message || "Battle failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks
        title="How Battle Arena works"
        steps={[
          { title: 'Enter two influencers', desc: 'Names or @handles.' },
          { title: 'Start battle (5 credits)', desc: 'AI judges across multiple rounds.' },
          { title: 'See the winner', desc: 'Detailed stats per round.' },
          { title: 'Share result', desc: 'Post the outcome to your feed.' },
        ]}
      />
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2"><ArrowLeft className="h-4 w-4" /> Back</Button>
      <div className="flex items-center gap-3 mb-4">
        <Swords className="h-8 w-8 text-cyan-400" />
        <div>
          <h2 className="text-2xl font-bold">Influencer Battle Arena</h2>
          <p className="text-muted-foreground">Pit influencers against each other — AI judges content quality</p>
        </div>
      </div>

      <Card className="p-6 space-y-4 border-cyan-500/20">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Influencer 1</label>
            <Input value={player1} onChange={e => setPlayer1(e.target.value)} placeholder="Name or @handle" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Influencer 2</label>
            <Input value={player2} onChange={e => setPlayer2(e.target.value)} placeholder="Name or @handle" />
          </div>
        </div>
        <Button onClick={startBattle} disabled={loading} className="w-full bg-gradient-to-r from-red-600 to-purple-600">
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Swords className="h-4 w-4 mr-2" />}
          Start Battle (5 credits)
        </Button>
      </Card>

      {battle && (
        <div className="space-y-4">
          <Card className="p-6 border-cyan-500/20 text-center">
            <Trophy className="h-10 w-10 text-amber-400 mx-auto mb-2" />
            <h3 className="text-xl font-black text-amber-400">{battle.winner} Wins!</h3>
            <p className="text-sm text-muted-foreground mt-1">{battle.summary}</p>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            {[battle.player1_stats, battle.player2_stats].map((stats: any, idx: number) => (
              <Card key={idx} className={`p-4 border ${battle.winner === (idx === 0 ? player1 : player2) ? 'border-amber-500/40' : 'border-border/50'}`}>
                <h4 className="font-bold text-sm mb-2">{idx === 0 ? player1 : player2}</h4>
                {stats && Object.entries(stats).map(([key, val]: any) => (
                  <div key={key} className="flex justify-between text-xs py-1 border-b border-border/20 last:border-0">
                    <span className="text-muted-foreground capitalize">{key.replace(/_/g, ' ')}</span>
                    <span className="font-medium flex items-center gap-1"><Zap className="h-3 w-3 text-cyan-400" />{val}</span>
                  </div>
                ))}
              </Card>
            ))}
          </div>

          {battle.rounds && (
            <Card className="p-4 border-cyan-500/10">
              <h4 className="font-bold text-sm mb-2">Round Details</h4>
              {battle.rounds.map((round: any, i: number) => (
                <div key={i} className="py-2 border-b border-border/20 last:border-0">
                  <p className="text-xs font-medium">{round.category}</p>
                  <p className="text-xs text-muted-foreground">{round.result}</p>
                </div>
              ))}
            </Card>
          )}
        </div>
      )}
    </div>
    </>
  );
}
