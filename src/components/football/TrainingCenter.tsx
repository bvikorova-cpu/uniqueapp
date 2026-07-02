import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Dumbbell, Sparkles, TrendingUp } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const trainingTypes = [
  { value: "sprint", label: "Sprint Drills", stat: "pace", icon: "🏃" },
  { value: "shooting", label: "Shooting Practice", stat: "shooting", icon: "🎯" },
  { value: "passing", label: "Passing Drills", stat: "passing", icon: "📐" },
  { value: "defense", label: "Defensive Training", stat: "defending", icon: "🛡️" },
  { value: "gym", label: "Gym Workout", stat: "physical", icon: "💪" },
];

export const TrainingCenter = ({ onBack }: { onBack: () => void }) => {
  const { user, session } = useAuth();
  const [players, setPlayers] = useState<any[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState("");
  const [training, setTraining] = useState("sprint");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("football_players").select("*").eq("user_id", user.id).order("overall_rating", { ascending: false }).then(({ data }) => setPlayers(data || []));
  }, [user]);

  const trainPlayer = async (useAI: boolean) => {
    if (!user || !session) { toast.error("Sign in first"); return; }
    if (!selectedPlayer) { toast.error("Select a player"); return; }
    setLoading(true);
    const t = trainingTypes.find(tt => tt.value === training)!;
    try {
      let improvement = 1 + Math.floor(Math.random() * 2);
      if (useAI) {
        const { data, error } = await supabase.functions.invoke("generate-gift-message", {
          headers: { Authorization: `Bearer ${session.access_token}` },
          body: { prompt: `Football training result for ${t.label}. Return JSON: {"improvement": <1-5>, "feedback": "<training feedback>"}`, type: "football_training" }
        });
        if (!error && data) {
          try { const r = JSON.parse(data.message || "{}"); improvement = r.improvement || improvement; } catch {}
        }
      }
      const player = players.find(p => p.id === selectedPlayer)!;
      const newVal = Math.min(99, (player[t.stat] || 50) + improvement);
      await supabase.from("football_players").update({ [t.stat]: newVal, overall_rating: Math.round(([player.pace, player.shooting, player.passing, player.defending, player.physical].reduce((a, b) => a + b, 0) - player[t.stat] + newVal) / 5) } as any).eq("id", selectedPlayer);
      await supabase.from("football_training_sessions").insert({ user_id: user.id, player_id: selectedPlayer, training_type: training, stat_improved: t.stat, improvement_value: improvement, credits_used: useAI ? 2 : 0 });
      setPlayers(prev => prev.map(p => p.id === selectedPlayer ? { ...p, [t.stat]: newVal } : p));
      toast.success(`${t.icon} ${player.name}'s ${t.stat} improved by +${improvement}!`);
    } catch (e: any) { toast.error(e.message); } finally { setLoading(false); }
  };

  if (!user) return <div className="space-y-4"><Button variant="ghost" onClick={onBack}><ArrowLeft className="h-4 w-4" /> Back</Button><p className="text-center py-8">Sign in to train players</p></div>;

  return (
    <><FloatingHowItWorks title="TrainingCenter — How it works" steps={[{title:"Open this section",desc:"Access TrainingCenter from the menu."},{title:"Explore features",desc:"Browse cards, filters, matches, tools and options."},{title:"Play & interact",desc:"Start matches, buy items, join tournaments (some actions cost credits or EUR)."},{title:"Track progress",desc:"Check leaderboards, trophies and stats over time."}]} />
<div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2"><ArrowLeft className="h-4 w-4" /> Back</Button>
      <h2 className="text-2xl font-bold">🏋️ Training Center</h2>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Dumbbell className="h-5 w-5" /> Train Your Players</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Select value={selectedPlayer} onValueChange={setSelectedPlayer}>
            <SelectTrigger><SelectValue placeholder="Select player..." /></SelectTrigger>
            <SelectContent>{players.map(p => <SelectItem key={p.id} value={p.id}>{p.name} ({p.position} - OVR {p.overall_rating})</SelectItem>)}</SelectContent>
          </Select>
          <div className="grid grid-cols-1 gap-2">
            {trainingTypes.map(t => (
              <div key={t.value} onClick={() => setTraining(t.value)} className={`p-3 rounded-lg cursor-pointer transition-all border ${training === t.value ? "border-emerald-500 bg-emerald-500/10" : "border-transparent bg-muted/50 hover:bg-muted"}`}>
                <span className="text-lg mr-2">{t.icon}</span>
                <span className="font-semibold">{t.label}</span>
                <span className="text-xs text-muted-foreground ml-2">+{t.stat}</span>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Button onClick={() => trainPlayer(false)} disabled={loading || !selectedPlayer} className="gap-2"><TrendingUp className="h-4 w-4" /> Basic Train</Button>
            <Button onClick={() => trainPlayer(true)} disabled={loading || !selectedPlayer} className="gap-2 bg-gradient-to-r from-emerald-600 to-green-600"><Sparkles className="h-4 w-4" /> AI Train (2 credits)</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  </>
  );
};
