import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Sparkles, UserPlus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const positions = ["GK", "CB", "LB", "RB", "CDM", "CM", "CAM", "LW", "RW", "ST", "CF"];

export const PlayerCreator = ({ onBack }: { onBack: () => void }) => {
  const { user, session } = useAuth();
  const [name, setName] = useState("");
  const [position, setPosition] = useState("ST");
  const [loading, setLoading] = useState(false);
  const [createdPlayer, setCreatedPlayer] = useState<any>(null);

  const createPlayer = async (useAI: boolean) => {
    if (!user || !session) { toast.error("Please sign in first"); return; }
    if (!name.trim()) { toast.error("Enter a player name"); return; }
    setLoading(true);
    try {
      if (useAI) {
        const { data, error } = await supabase.functions.invoke("generate-gift-message", {
          headers: { Authorization: `Bearer ${session.access_token}` },
          body: {
            prompt: `Generate a football player card with these stats as JSON: {"pace": <40-99>, "shooting": <40-99>, "passing": <40-99>, "defending": <40-99>, "physical": <40-99>, "overall_rating": <calculated average>, "description": "<one sentence about the player style>"}. Player name: ${name}, Position: ${position}. Only return valid JSON.`,
            type: "football_player_creation"
          }
        });
        if (error) throw error;
        let stats;
        try { stats = JSON.parse(data.message || data.text || "{}"); } catch { stats = { pace: 55 + Math.floor(Math.random() * 30), shooting: 50 + Math.floor(Math.random() * 30), passing: 50 + Math.floor(Math.random() * 30), defending: 40 + Math.floor(Math.random() * 30), physical: 50 + Math.floor(Math.random() * 30) }; stats.overall_rating = Math.round((stats.pace + stats.shooting + stats.passing + stats.defending + stats.physical) / 5); }
        const { data: player, error: insertError } = await supabase.from("football_players").insert({ user_id: user.id, name, position, overall_rating: stats.overall_rating || 60, pace: stats.pace || 60, shooting: stats.shooting || 60, passing: stats.passing || 60, defending: stats.defending || 50, physical: stats.physical || 60, market_value: (stats.overall_rating || 60) * 100 }).select().single();
        if (insertError) throw insertError;
        setCreatedPlayer(player);
        toast.success("AI Player created!");
      } else {
        const stats = { pace: 45 + Math.floor(Math.random() * 20), shooting: 45 + Math.floor(Math.random() * 20), passing: 45 + Math.floor(Math.random() * 20), defending: 40 + Math.floor(Math.random() * 20), physical: 45 + Math.floor(Math.random() * 20) };
        const overall = Math.round(Object.values(stats).reduce((a, b) => a + b, 0) / 5);
        const { data: player, error: insertError } = await supabase.from("football_players").insert({ user_id: user.id, name, position, overall_rating: overall, ...stats, market_value: overall * 80 }).select().single();
        if (insertError) throw insertError;
        setCreatedPlayer(player);
        toast.success("Player created!");
      }
    } catch (e: any) { toast.error(e.message); } finally { setLoading(false); }
  };

  return (
    <><FloatingHowItWorks title="PlayerCreator — How it works" steps={[{title:"Open this section",desc:"Access PlayerCreator from the menu."},{title:"Explore features",desc:"Browse cards, filters, matches, tools and options."},{title:"Play & interact",desc:"Start matches, buy items, join tournaments (some actions cost credits or EUR)."},{title:"Track progress",desc:"Check leaderboards, trophies and stats over time."}]} />
<div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2"><ArrowLeft className="h-4 w-4" /> Back</Button>
      <h2 className="text-2xl font-bold">⚽ Player Creator</h2>
      <Card>
        <CardHeader><CardTitle>Create New Player</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Input placeholder="Player name..." value={name} onChange={e => setName(e.target.value)} />
          <Select value={position} onValueChange={setPosition}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{positions.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
          </Select>
          <div className="grid grid-cols-2 gap-3">
            <Button onClick={() => createPlayer(false)} disabled={loading} className="gap-2"><UserPlus className="h-4 w-4" /> Basic Create</Button>
            <Button onClick={() => createPlayer(true)} disabled={loading} className="gap-2 bg-gradient-to-r from-emerald-600 to-green-600"><Sparkles className="h-4 w-4" /> AI Create (3 credits)</Button>
          </div>
        </CardContent>
      </Card>
      {createdPlayer && (
        <Card className="border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-transparent">
          <CardContent className="pt-6">
            <div className="text-center mb-4">
              <p className="text-3xl font-black text-emerald-400">{createdPlayer.overall_rating}</p>
              <p className="text-xl font-bold">{createdPlayer.name}</p>
              <p className="text-sm text-muted-foreground">{createdPlayer.position}</p>
            </div>
            <div className="grid grid-cols-5 gap-2 text-center">
              {[{ l: "PAC", v: createdPlayer.pace }, { l: "SHO", v: createdPlayer.shooting }, { l: "PAS", v: createdPlayer.passing }, { l: "DEF", v: createdPlayer.defending }, { l: "PHY", v: createdPlayer.physical }].map(s => (
                <div key={s.l} className="p-2 rounded-lg bg-muted/50">
                  <p className="font-bold">{s.v}</p>
                  <p className="text-[10px] text-muted-foreground">{s.l}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  </>
  );
};
