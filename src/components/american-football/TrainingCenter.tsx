import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Dumbbell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const DRILLS = [
  { type: "Passing Drills", stat: "throwing", cost: 200 },
  { type: "Route Running", stat: "catching", cost: 200 },
  { type: "Rushing Drills", stat: "rushing", cost: 200 },
  { type: "Blocking Practice", stat: "blocking", cost: 250 },
  { type: "Tackling Drills", stat: "tackling", cost: 250 },
  { type: "Speed & Agility", stat: "speed", cost: 250 },
  { type: "Endurance Camp", stat: "stamina", cost: 150 },
];

export function TrainingCenter({ onBack }: { onBack: () => void }) {
  const { user } = useAuth();
  const [players, setPlayers] = useState<any[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("american_football_players").select("*").eq("user_id", user.id).order("overall_rating", { ascending: false }).then(({ data }) => setPlayers(data || []));
  }, [user]);

  const train = async (drill: typeof DRILLS[0]) => {
    if (!user || !selectedPlayer) { toast.error("Select a player!"); return; }
    setLoading(true);
    try {
      const { data: coins } = await supabase.from("american_football_coins").select("*").eq("user_id", user.id).single();
      if (!coins || coins.balance < drill.cost) { toast.error(`Need ${drill.cost} coins!`); return; }
      const player = players.find(p => p.id === selectedPlayer);
      if (!player) return;
      const improvement = Math.floor(Math.random() * 3) + 1;
      const newVal = Math.min(99, (player[drill.stat] || 50) + improvement);
      const newOvr = Math.min(99, player.overall_rating + (improvement > 2 ? 1 : 0));

      await supabase.from("american_football_coins").update({ balance: coins.balance - drill.cost, total_spent: coins.total_spent + drill.cost }).eq("user_id", user.id);
      await supabase.from("american_football_players").update({ [drill.stat]: newVal, overall_rating: newOvr } as any).eq("id", selectedPlayer);
      await supabase.from("american_football_training_sessions").insert({ user_id: user.id, player_id: selectedPlayer, training_type: drill.type, stat_improved: drill.stat, improvement_amount: improvement, coins_spent: drill.cost });

      setPlayers(prev => prev.map(p => p.id === selectedPlayer ? { ...p, [drill.stat]: newVal, overall_rating: newOvr } : p));
      toast.success(`${player.name}: ${drill.stat} +${improvement}! (now ${newVal})`);
    } catch (e: any) { toast.error(e.message); } finally { setLoading(false); }
  };

  return (
    <><FloatingHowItWorks title="TrainingCenter — How it works" steps={[{title:"Open this section",desc:"Access TrainingCenter from the menu."},{title:"Explore features",desc:"Browse cards, filters, matches, tools and options."},{title:"Play & interact",desc:"Start matches, buy items, join tournaments (some actions cost credits or EUR)."},{title:"Track progress",desc:"Check leaderboards, trophies and stats over time."}]} />
<div className="space-y-4">
      <Button variant="ghost" onClick={onBack}><ArrowLeft className="h-4 w-4 mr-2" />Back</Button>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Dumbbell className="h-5 w-5 text-primary" />Training Center</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Select value={selectedPlayer} onValueChange={setSelectedPlayer}>
            <SelectTrigger><SelectValue placeholder="Select player to train" /></SelectTrigger>
            <SelectContent>{players.map(p => <SelectItem key={p.id} value={p.id}>{p.name} ({p.position}, OVR {p.overall_rating})</SelectItem>)}</SelectContent>
          </Select>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {DRILLS.map(drill => (
              <Button key={drill.type} variant="outline" className="justify-between h-auto py-3" disabled={loading || !selectedPlayer} onClick={() => train(drill)}>
                <span className="text-sm">{drill.type}</span>
                <span className="text-xs text-primary">{drill.cost} coins</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  </>
  );
}
