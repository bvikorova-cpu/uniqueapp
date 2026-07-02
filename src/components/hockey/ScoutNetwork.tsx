import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Search, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { spendSportCoins } from "@/lib/sportCoins";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export function ScoutNetwork({ onBack }: { onBack: () => void }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [scoutResult, setScoutResult] = useState<any[]>([]);

  const scout = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");
      const { data, error } = await supabase.functions.invoke("generate-gift-message", {
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: {
          prompt: `Generate 3 ice hockey talent scouts as JSON array: [{"name": "<realistic name>", "age": <17-25>, "position": "<C/LW/RW/D/G>", "nationality": "<country>", "overall_rating": <55-85>, "potential": <70-99>, "skating": <40-90>, "shooting": <40-90>, "defense": <40-90>, "speed": <40-90>, "price": <500-8000>, "description": "<one sentence>"}]`,
          type: "hockey_scout"
        }
      });
      if (error) throw error;
      const jsonMatch = data.response?.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error("Scout failed");
      const spendRes = await spendSportCoins("hockey_coins", 400);
      if (!spendRes.ok) { toast.error("Need 400 coins!"); return; }
      setScoutResult(JSON.parse(jsonMatch[0]));
      toast.success("Scouting report ready! (-400 coins)");
    } catch (e: any) { toast.error(e.message); } finally { setLoading(false); }
  };

  const signPlayer = async (player: any) => {
    if (!user) return;
    const { data: coins } = await supabase.from("hockey_coins").select("*").eq("user_id", user.id).single();
    if (!coins || coins.balance < player.price) { toast.error("Not enough coins!"); return; }
    await supabase.from("hockey_coins").update({ balance: coins.balance - player.price, total_spent: coins.total_spent + player.price }).eq("user_id", user.id);
    await supabase.from("hockey_players").insert({ user_id: user.id, name: player.name, position: player.position, overall_rating: player.overall_rating, skating: player.skating, shooting: player.shooting, defense: player.defense, speed: player.speed, passing: 40 + Math.floor(Math.random() * 40), physicality: 40 + Math.floor(Math.random() * 40), stamina: 40 + Math.floor(Math.random() * 40), goaltending: player.position === "G" ? 60 + Math.floor(Math.random() * 30) : 20, market_value: player.price });
    toast.success(`Signed ${player.name}!`);
    setScoutResult(prev => prev.filter(p => p.name !== player.name));
  };

  return (
    <>
      <FloatingHowItWorks title={"Scout Network - How it works"} steps={[{ title: 'Open', desc: 'Access the Scout Network section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Scout Network.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-4">
      <Button variant="ghost" onClick={onBack}><ArrowLeft className="h-4 w-4 mr-2" />Back</Button>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Search className="h-5 w-5 text-primary" />AI Scout Network <span className="text-xs text-muted-foreground">(400 coins)</span></CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Button className="w-full" onClick={scout} disabled={loading}>{loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Scouting...</> : "Scout Talents (400 coins)"}</Button>
          {scoutResult.map((p, i) => (
            <div key={i} className="p-3 rounded-lg border border-border/50">
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-bold text-sm">{p.name}</span> <span className="text-xs text-muted-foreground">({p.nationality}, {p.age}y)</span>
                  <p className="text-xs">{p.position} | OVR {p.overall_rating} | POT {p.potential}</p>
                  <p className="text-[11px] text-muted-foreground">{p.description}</p>
                </div>
                <Button size="sm" onClick={() => signPlayer(p)}>{p.price} coins</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
    </>
  );
}
