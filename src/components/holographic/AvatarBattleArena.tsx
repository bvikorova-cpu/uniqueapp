import { useState } from "react";
import { ArrowLeft, Swords, Trophy, Flame, Shield, Zap, Crown, Timer, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface Props { onBack: () => void; }

const BATTLE_MODES = [
  { id: "1v1", name: "1v1 Duel", icon: Swords, desc: "Classic one-on-one combat", entry: 2, prize: "€3.50" },
  { id: "tournament", name: "Tournament", icon: Trophy, desc: "8-player bracket elimination", entry: 5, prize: "€30" },
  { id: "survival", name: "Survival", icon: Flame, desc: "Last avatar standing wins all", entry: 3, prize: "€15" },
];

const LEADERBOARD = [
  { rank: 1, name: "NeonWraith", wins: 342, style: "Cyberpunk", elo: 2450 },
  { rank: 2, name: "CrystalSage", wins: 298, style: "Crystal", elo: 2380 },
  { rank: 3, name: "ShadowKing", wins: 276, style: "Shadow", elo: 2310 },
  { rank: 4, name: "CosmicVoid", wins: 251, style: "Cosmic", elo: 2270 },
  { rank: 5, name: "BioHunter", wins: 234, style: "Bio-Organic", elo: 2200 },
];

export const AvatarBattleArena = ({ onBack }: Props) => {
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const { toast } = useToast();

  const handleJoinBattle = async (mode: typeof BATTLE_MODES[0]) => {
    setIsJoining(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-holographic-avatar-checkout", {
        body: { priceId: "price_1SPjGQGaXSfGtYFtDYtm4aC2", featureName: `Battle Entry: ${mode.name}`, metadata: { mode: mode.id } },
      });
      if (error) throw error;
      if (data?.url) {
        try { localStorage.setItem("pendingHoloAction", JSON.stringify({ kind: "battle", mode: mode.id })); } catch {}
        window.open(data.url, "_blank");
        toast({ title: "Battle Entry!", description: `Joining ${mode.name} arena...` });
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
                  <span className="text-muted-foreground">Entry: <strong className="text-foreground">€{mode.entry}</strong></span>
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

      {/* Live Battles */}
      <Card className="border-red-500/20 bg-gradient-to-br from-red-500/5 to-background">
        <CardContent className="p-6">
          <h3 className="font-bold flex items-center gap-2 mb-4"><Flame className="w-5 h-5 text-red-500" /> Live Battles
            <Badge className="bg-red-500/20 text-red-500 border-red-500/30 animate-pulse">LIVE</Badge>
          </h3>
          <div className="space-y-3">
            {[
              { a1: "NeonWraith", a2: "CrystalSage", mode: "1v1 Duel", viewers: 124 },
              { a1: "ShadowKing", a2: "BioHunter", mode: "Survival", viewers: 89 },
            ].map((battle, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  <Swords className="w-4 h-4 text-red-400" />
                  <span className="font-bold text-sm">{battle.a1}</span>
                  <span className="text-xs text-muted-foreground">vs</span>
                  <span className="font-bold text-sm">{battle.a2}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">{battle.mode}</Badge>
                  <span className="text-xs text-muted-foreground flex items-center gap-1"><Shield className="w-3 h-3" />{battle.viewers}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-bold flex items-center gap-2 mb-4"><Trophy className="w-5 h-5 text-amber-500" /> Arena Leaderboard</h3>
          <div className="space-y-2">
            {LEADERBOARD.map((player, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <span className={`text-lg font-black w-6 ${i === 0 ? "text-amber-500" : i === 1 ? "text-gray-400" : i === 2 ? "text-amber-700" : "text-muted-foreground"}`}>#{player.rank}</span>
                  <div>
                    <p className="font-bold text-sm">{player.name}</p>
                    <p className="text-xs text-muted-foreground">{player.style} • {player.wins} wins</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs"><Zap className="w-3 h-3 mr-1" />{player.elo} ELO</Badge>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
    </>
  );
};
