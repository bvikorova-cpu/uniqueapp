import { useState } from "react";
import { ArrowLeft, Swords, Trophy, Flame, Loader2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useHolographicCredits, HOLO_COSTS } from "@/hooks/useHolographicCredits";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
import { BattleResultDialog, type BattleResult } from "@/components/holographic/BattleResultDialog";
import { XpLeaderboard } from "@/components/common/XpLeaderboard";


interface Props { onBack: () => void; }

const BATTLE_MODES = [
  { id: "1v1", name: "1v1 Duel", icon: Swords, desc: "One AI opponent, 3 rounds", entry: HOLO_COSTS.battle_1v1, prize: "+80 XP" },
  { id: "tournament", name: "Tournament", icon: Trophy, desc: "Toughest AI opponents, 5 rounds", entry: HOLO_COSTS.battle_tournament, prize: "+600 XP" },
  { id: "survival", name: "Survival", icon: Flame, desc: "Endurance run, 4 rounds", entry: HOLO_COSTS.battle_survival, prize: "+300 XP" },
];

export const AvatarBattleArena = ({ onBack }: Props) => {
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [boardKey, setBoardKey] = useState(0);
  const [report, setReport] = useState<{ result: BattleResult; mode: typeof BATTLE_MODES[0] } | null>(null);
  const { toast } = useToast();
  const { balance, spend, refresh } = useHolographicCredits();

  const handleJoinBattle = async (mode: typeof BATTLE_MODES[0]) => {
    setIsJoining(true);
    try {
      const paid = await spend(mode.entry, `battle_${mode.id}`);
      if (!paid) return;
      const { data, error } = await supabase.functions.invoke("holographic-battle-simulate", {
        body: { mode: mode.id, xpSource: "holographic_battle" } });
      if (error) throw error;
      const r = data?.result;
      if (r) {
        setReport({ result: r as BattleResult, mode });
        setBoardKey((k) => k + 1);
        await refresh();
      } else {
        toast({ title: "Battle entered", description: `${mode.name} — ${mode.entry} credits used.` });
      }
    } catch { toast({ title: "Error", description: "Failed to join battle", variant: "destructive" }); }
    finally { setIsJoining(false); }
  };


  return (
    <>
      <FloatingHowItWorks
        title='Avatar Battle Arena'
        steps={[
          { title: 'Open the tool', desc: 'Launch the Avatar Battle Arena panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
      />
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="w-5 h-5" /></Button>
        <div>
          <h2 className="text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">Battle Arena</h2>
          <p className="text-sm text-muted-foreground">PvP combat between holographic avatars</p>
        </div>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4 space-y-2 text-sm">
          <h3 className="font-bold flex items-center gap-2"><Info className="w-4 h-4 text-primary" /> How the Arena works</h3>
          <ol className="list-decimal pl-5 space-y-1 text-muted-foreground">
            <li>Pick a mode — the entry fee in credits is charged once.</li>
            <li>The server simulates a round-by-round fight against an <strong>AI opponent</strong> (this is not live PvP against other users).</li>
            <li>You get a full combat report: arena, power, HP bars, every move and the verdict.</li>
            <li>If you win, the prize is paid out as <strong>XP</strong> on your profile (no credit payouts). A loss pays nothing.</li>
          </ol>
          <p className="text-xs text-muted-foreground">Your balance: <strong className="text-foreground">{balance} credits</strong></p>
        </CardContent>
      </Card>

      {/* Battle Modes */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {BATTLE_MODES.map((mode, i) => (
          <motion.div key={mode.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className={`cursor-pointer transition-all hover:scale-[1.02] ${selectedMode === mode.id ? "border-primary ring-2 ring-primary/30" : "border-border"}`}
              onClick={() => setSelectedMode(mode.id)}>
              <CardContent className="p-5 text-center">
                <mode.icon className="w-8 h-8 text-primary mx-auto mb-2" />
                <h3 className="font-black text-lg">{mode.name}</h3>
                <p className="text-xs text-muted-foreground mb-3">{mode.desc}</p>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Entry: <strong className="text-foreground">{mode.entry} cr</strong></span>
                  <span className="text-muted-foreground">Prize: <strong className="text-emerald-500">{mode.prize}</strong></span>
                </div>
                <Button onClick={(e) => { e.stopPropagation(); handleJoinBattle(mode); }} disabled={isJoining} className="w-full mt-3" size="sm">
                  {isJoining ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Swords className="w-3 h-3 mr-1" />} Enter Arena
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <XpLeaderboard sourcePrefix="holographic_battle" title="Battle XP Leaderboard" reloadKey={boardKey} />

      <BattleResultDialog
        open={!!report}
        onOpenChange={(v) => { if (!v) { setReport(null); setBoardKey((k) => k + 1); } }}
        result={report?.result ?? null}
        modeName={report?.mode.name}
        prizeLabel={report?.mode.prize}
        entryCost={report?.mode.entry}
      />
    </div>

    </>
  );
};
