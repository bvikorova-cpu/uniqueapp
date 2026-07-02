import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { spendSportCoins } from "@/lib/sportCoins";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const POSITIONS = [
  { value: "C", label: "Center" },
  { value: "LW", label: "Left Wing" },
  { value: "RW", label: "Right Wing" },
  { value: "D", label: "Defenseman" },
  { value: "G", label: "Goalie" },
];

export function PlayerCreator({ onBack }: { onBack: () => void }) {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [position, setPosition] = useState("C");
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState<any>(null);

  const createPlayer = async () => {
    if (!user || !name.trim()) return;
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast.error("Please sign in"); return; }
      const { data, error } = await supabase.functions.invoke("generate-gift-message", {
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: {
          prompt: `Generate an ice hockey player as JSON: {"name": "${name}", "position": "${position}", "overall_rating": <55-90>, "skating": <40-95>, "shooting": <40-95>, "passing": <40-95>, "defense": <40-95>, "physicality": <40-95>, "goaltending": <${position === "G" ? "60-95" : "20-40"}>, "speed": <40-95>, "stamina": <40-95>, "market_value": <1000-15000>, "description": "<one sentence about playstyle>"}`,
          type: "hockey_player_create"
        }
      });
      if (error) throw error;

      const jsonMatch = data.response?.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("Failed to generate player");
      const player = JSON.parse(jsonMatch[0]);

      const spendRes = await spendSportCoins("hockey_coins", 500);
      if (!spendRes.ok) { toast.error("Need 500 coins. Buy coins first!"); return; }
      const { data: inserted } = await supabase.from("hockey_players").insert({ user_id: user.id, name: player.name, position: player.position, overall_rating: player.overall_rating, skating: player.skating, shooting: player.shooting, passing: player.passing, defense: player.defense, physicality: player.physicality, goaltending: player.goaltending, speed: player.speed, stamina: player.stamina, market_value: player.market_value }).select().single();
      setCreated(inserted);
      toast.success(`${player.name} created! (-500 coins)`);
    } catch (e: any) { toast.error(e.message); } finally { setLoading(false); }
  };

  return (
    <>
      <FloatingHowItWorks title={"Player Creator - How it works"} steps={[{ title: 'Open', desc: 'Access the Player Creator section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Player Creator.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-4">
      <Button variant="ghost" onClick={onBack}><ArrowLeft className="h-4 w-4 mr-2" />Back</Button>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" />AI Player Creator <span className="text-xs text-muted-foreground">(500 coins)</span></CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Input placeholder="Player name..." value={name} onChange={(e) => setName(e.target.value)} />
          <Select value={position} onValueChange={setPosition}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{POSITIONS.map(p => <SelectItem key={p.value} value={p.value}>{p.value} - {p.label}</SelectItem>)}</SelectContent>
          </Select>
          <Button className="w-full" onClick={createPlayer} disabled={loading || !name.trim()}>
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Generating...</> : "Create Player (500 coins)"}
          </Button>
          {created && (
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 space-y-2">
              <h3 className="font-bold text-lg">{created.name}</h3>
              <p className="text-sm text-muted-foreground">{created.position} | OVR: {created.overall_rating}</p>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>⛸️ Skating: {created.skating}</div><div>🏒 Shooting: {created.shooting}</div><div>🎯 Passing: {created.passing}</div>
                <div>🛡️ Defense: {created.defense}</div><div>💪 Physical: {created.physicality}</div><div>🧤 Goaltend: {created.goaltending}</div>
                <div>🏃 Speed: {created.speed}</div><div>❤️ Stamina: {created.stamina}</div><div>💰 Value: {created.market_value}</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
    </>
  );
}
