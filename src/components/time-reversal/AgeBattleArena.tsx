import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Swords, Trophy, Flame, Loader2, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
import { useHolographicCredits, HOLO_COSTS } from "@/hooks/useHolographicCredits";
import { BattleResultDialog, type BattleResult } from "@/components/holographic/BattleResultDialog";
import { XpLeaderboard } from "@/components/common/XpLeaderboard";

interface Props { onBack: () => void; }

const BATTLE_MODES = [
  { id: "1v1", name: "1v1 Duel", icon: Swords, desc: "One AI opponent, 3 rounds", entry: HOLO_COSTS.battle_1v1, prize: "+80 XP" },
  { id: "survival", name: "Survival", icon: Flame, desc: "Endurance run, 4 rounds", entry: HOLO_COSTS.battle_survival, prize: "+300 XP" },
  { id: "tournament", name: "Tournament", icon: Trophy, desc: "Toughest opponents, 5 rounds", entry: HOLO_COSTS.battle_tournament, prize: "+600 XP" },
];

export function AgeBattleArena({ onBack }: Props) {
  const { toast } = useToast();
  const [fighting, setFighting] = useState<string | null>(null);
  const [boardKey, setBoardKey] = useState(0);
  const [report, setReport] = useState<{ result: BattleResult; mode: typeof BATTLE_MODES[0] } | null>(null);
  const { balance, spend, refresh } = useHolographicCredits();

  const handleFight = async (mode: typeof BATTLE_MODES[0]) => {
    setFighting(mode.id);
    try {
      const paid = await spend(mode.entry, `age_battle_${mode.id}`);
      if (!paid) return;
      const { data, error } = await supabase.functions.invoke("holographic-battle-simulate", {
        body: { mode: mode.id, xpSource: "time_reversal_battle" },
      });
      if (error) throw error;
      const r = data?.result;
      if (r) { setReport({ result: r as BattleResult, mode }); setBoardKey((k) => k + 1); await refresh(); }
      else toast({ title: "Battle entered", description: `${mode.name} — ${mode.entry} credits used.` });
    } catch (e: any) {
      console.error(e);
      toast({ title: "Error", description: e?.message || "Battle failed", variant: "destructive" });
    } finally { setFighting(null); }
  };


  return (
    <>
      <FloatingHowItWorks
        title='Age Battle Arena'
        steps={[
          { title: 'Open the tool', desc: 'Launch the Age Battle Arena panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
      />
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="h-5 w-5" /></Button>
        <div>
          <h2 className="text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">AI Age Battle Arena</h2>
          <p className="text-sm text-muted-foreground">Credit-based AI battles — win XP for your profile!</p>
        </div>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4 space-y-2 text-sm">
          <h3 className="font-bold flex items-center gap-2"><Info className="w-4 h-4 text-primary" /> How credit battles work</h3>
          <ol className="list-decimal pl-5 space-y-1 text-muted-foreground">
            <li>Pick a mode — the entry fee in credits is charged once.</li>
            <li>You fight a random AI opponent round by round (this is not live PvP).</li>
            <li>You get a full combat report with every move and the verdict.</li>
            <li>A win pays the prize as <strong>XP</strong> on your profile (no credit payouts); a loss pays nothing.</li>
          </ol>
          <p className="text-xs text-muted-foreground">Your balance: <strong className="text-foreground">{balance} credits</strong></p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {BATTLE_MODES.map((mode) => (
          <Card key={mode.id} className="border-border">
            <CardContent className="p-5 text-center">
              <mode.icon className="w-8 h-8 text-primary mx-auto mb-2" />
              <h3 className="font-black text-lg">{mode.name}</h3>
              <p className="text-xs text-muted-foreground mb-3">{mode.desc}</p>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Entry: <strong className="text-foreground">{mode.entry} cr</strong></span>
                <span className="text-muted-foreground">Prize: <strong className="text-emerald-500">{mode.prize}</strong></span>
              </div>
              <Button onClick={() => handleFight(mode)} disabled={!!fighting} className="w-full mt-3" size="sm">
                {fighting === mode.id ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Swords className="w-3 h-3 mr-1" />} Fight
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <XpLeaderboard sourcePrefix="time_reversal_battle" title="Age Battle XP Leaderboard" reloadKey={boardKey} />

      <BattleResultDialog
        open={!!report}
        onOpenChange={(v) => { if (!v) setReport(null); }}
        result={report?.result ?? null}
        modeName={report?.mode.name}
        prizeLabel={report?.mode.prize}
        entryCost={report?.mode.entry}
      />
    </div>
    </>
  );
}
