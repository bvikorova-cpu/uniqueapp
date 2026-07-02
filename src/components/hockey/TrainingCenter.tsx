import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Dumbbell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { spendSportCoins } from "@/lib/sportCoins";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const DRILLS = [
  { type: "Skating Drills", stat: "skating", cost: 200 },
  { type: "Shooting Practice", stat: "shooting", cost: 200 },
  { type: "Passing Clinic", stat: "passing", cost: 200 },
  { type: "Defense Workshop", stat: "defense", cost: 200 },
  { type: "Physical Training", stat: "physicality", cost: 250 },
  { type: "Goaltending Camp", stat: "goaltending", cost: 300 },
  { type: "Speed Skating", stat: "speed", cost: 250 },
  { type: "Stamina Building", stat: "stamina", cost: 150 },
];

export function TrainingCenter({ onBack }: { onBack: () => void }) {
  const { user } = useAuth();
  const [players, setPlayers] = useState<any[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("hockey_players").select("*").eq("user_id", user.id).order("overall_rating", { ascending: false }).then(({ data }) => setPlayers(data || []));
  }, [user]);

  const train = async (drill: typeof DRILLS[0]) => {
    if (!user || !selectedPlayer) { toast.error("Select a player!"); return; }
    setLoading(true);
    try {
      const { data: coins } = await supabase.from("hockey_coins").select("*").eq("user_id", user.id).single();
      if (!coins || coins.balance < drill.cost) { toast.error(`Need ${drill.cost} coins!`); return; }
      const player = players.find(p => p.id === selectedPlayer);
      if (!player) return;
      const improvement = Math.floor(Math.random() * 3) + 1;
      const newVal = Math.min(99, (player[drill.stat] || 50) + improvement);
      const newOvr = Math.min(99, player.overall_rating + (improvement > 2 ? 1 : 0));

      await supabase.from("hockey_coins").update({ balance: coins.balance - drill.cost, total_spent: coins.total_spent + drill.cost }).eq("user_id", user.id);
      await supabase.from("hockey_players").update({ [drill.stat]: newVal, overall_rating: newOvr } as any).eq("id", selectedPlayer);
      await supabase.from("hockey_training_sessions").insert({ user_id: user.id, player_id: selectedPlayer, training_type: drill.type, stat_improved: drill.stat, improvement_amount: improvement, coins_spent: drill.cost });

      setPlayers(prev => prev.map(p => p.id === selectedPlayer ? { ...p, [drill.stat]: newVal, overall_rating: newOvr } : p));
      toast.success(`${player.name}: ${drill.stat} +${improvement}! (now ${newVal})`);
    } catch (e: any) { toast.error(e.message); } finally { setLoading(false); }
  };

  return (
    <>
      <FloatingHowItWorks title={"Training Center - How it works"} steps={[{ title: 'Open', desc: 'Access the Training Center section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Training Center.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
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
