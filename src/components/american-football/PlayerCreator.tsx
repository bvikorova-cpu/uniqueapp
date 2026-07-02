import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const POSITIONS = [
  { value: "QB", label: "Quarterback" },
  { value: "RB", label: "Running Back" },
  { value: "WR", label: "Wide Receiver" },
  { value: "TE", label: "Tight End" },
  { value: "OL", label: "Offensive Line" },
  { value: "DL", label: "Defensive Line" },
  { value: "LB", label: "Linebacker" },
  { value: "CB", label: "Cornerback" },
  { value: "S", label: "Safety" },
  { value: "K", label: "Kicker" },
];

export function PlayerCreator({ onBack }: { onBack: () => void }) {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [position, setPosition] = useState("QB");
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState<any>(null);

  const createPlayer = async () => {
    if (!user || !name.trim()) return;
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast.error("Please sign in"); return; }
      const { data: coins } = await supabase.from("american_football_coins").select("*").eq("user_id", user.id).single();
      if (!coins || coins.balance < 500) { toast.error("Need 500 coins to create a player!"); return; }

      const { data, error } = await supabase.functions.invoke("generate-gift-message", {
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: {
          prompt: `Generate an American football player as JSON: {"name": "${name}", "position": "${position}", "overall_rating": <55-90>, "throwing": <40-95>, "catching": <40-95>, "rushing": <40-95>, "blocking": <40-95>, "tackling": <40-95>, "speed": <40-95>, "stamina": <40-95>, "market_value": <1000-15000>, "description": "<one sentence about playstyle>"}`,
          type: "af_player_create"
        }
      });
      if (error) throw error;

      const jsonMatch = data.response?.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("Failed to generate player");
      const player = JSON.parse(jsonMatch[0]);

      await supabase.from("american_football_coins").update({ balance: coins.balance - 500, total_spent: coins.total_spent + 500 }).eq("user_id", user.id);
      const { data: inserted } = await supabase.from("american_football_players").insert({ user_id: user.id, name: player.name, position: player.position, overall_rating: player.overall_rating, throwing: player.throwing, catching: player.catching, rushing: player.rushing, blocking: player.blocking, tackling: player.tackling, speed: player.speed, stamina: player.stamina, market_value: player.market_value }).select().single();
      setCreated(inserted);
      toast.success(`${player.name} created! (-500 coins)`);
    } catch (e: any) { toast.error(e.message); } finally { setLoading(false); }
  };

  return (
    <><FloatingHowItWorks title="PlayerCreator — How it works" steps={[{title:"Open this section",desc:"Access PlayerCreator from the menu."},{title:"Explore features",desc:"Browse cards, filters, matches, tools and options."},{title:"Play & interact",desc:"Start matches, buy items, join tournaments (some actions cost credits or EUR)."},{title:"Track progress",desc:"Check leaderboards, trophies and stats over time."}]} />
<div className="space-y-4">
      <Button variant="ghost" onClick={onBack}><ArrowLeft className="h-4 w-4 mr-2" />Back</Button>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" />AI Player Creator <span className="text-xs text-muted-foreground">(500 coins)</span></CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Input placeholder="Player name..." value={name} onChange={(e) => setName(e.target.value)} />
          <Select value={position} onValueChange={setPosition}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{POSITIONS.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}</SelectContent>
          </Select>
          <Button className="w-full" onClick={createPlayer} disabled={loading || !name.trim()}>
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Generating...</> : "Create Player (500 coins)"}
          </Button>
          {created && (
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 space-y-2">
              <h3 className="font-bold text-lg">{created.name}</h3>
              <p className="text-sm text-muted-foreground">{created.position} | OVR: {created.overall_rating}</p>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>🏈 Throw: {created.throwing}</div><div>🙌 Catch: {created.catching}</div><div>🏃 Rush: {created.rushing}</div>
                <div>🛡️ Block: {created.blocking}</div><div>💪 Tackle: {created.tackling}</div><div>⚡ Speed: {created.speed}</div>
                <div>❤️ Stamina: {created.stamina}</div><div>💰 Value: {created.market_value}</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  </>
  );
}
