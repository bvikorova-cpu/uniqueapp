import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Search, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

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
      const { data: coins } = await supabase.from("american_football_coins").select("*").eq("user_id", user.id).single();
      if (!coins || coins.balance < 400) { toast.error("Need 400 coins!"); return; }

      const { data, error } = await supabase.functions.invoke("generate-gift-message", {
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: {
          prompt: `Generate 3 American football prospects as JSON array: [{"name": "<realistic name>", "age": <20-30>, "position": "<QB/RB/WR/TE/OL/DL/LB/CB/S/K>", "college": "<university name>", "overall_rating": <55-85>, "potential": <70-99>, "throwing": <40-90>, "catching": <40-90>, "rushing": <40-90>, "tackling": <40-90>, "speed": <40-90>, "price": <500-8000>, "description": "<one sentence>"}]`,
          type: "af_scout"
        }
      });
      if (error) throw error;
      const jsonMatch = data.response?.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error("Scout failed");
      await supabase.from("american_football_coins").update({ balance: coins.balance - 400, total_spent: coins.total_spent + 400 }).eq("user_id", user.id);
      setScoutResult(JSON.parse(jsonMatch[0]));
      toast.success("Scouting report ready! (-400 coins)");
    } catch (e: any) { toast.error(e.message); } finally { setLoading(false); }
  };

  const signPlayer = async (player: any) => {
    if (!user) return;
    const { data: coins } = await supabase.from("american_football_coins").select("*").eq("user_id", user.id).single();
    if (!coins || coins.balance < player.price) { toast.error("Not enough coins!"); return; }
    await supabase.from("american_football_coins").update({ balance: coins.balance - player.price, total_spent: coins.total_spent + player.price }).eq("user_id", user.id);
    await supabase.from("american_football_players").insert({ user_id: user.id, name: player.name, position: player.position, overall_rating: player.overall_rating, throwing: player.throwing, catching: player.catching, rushing: player.rushing, blocking: 40 + Math.floor(Math.random() * 40), tackling: player.tackling, speed: player.speed, stamina: 40 + Math.floor(Math.random() * 40), market_value: player.price });
    toast.success(`Signed ${player.name}!`);
    setScoutResult(prev => prev.filter(p => p.name !== player.name));
  };

  return (
    <><FloatingHowItWorks title="ScoutNetwork — How it works" steps={[{title:"Open this section",desc:"Access ScoutNetwork from the menu."},{title:"Explore features",desc:"Browse cards, filters, matches, tools and options."},{title:"Play & interact",desc:"Start matches, buy items, join tournaments (some actions cost credits or EUR)."},{title:"Track progress",desc:"Check leaderboards, trophies and stats over time."}]} />
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
                  <span className="font-bold text-sm">{p.name}</span> <span className="text-xs text-muted-foreground">({p.college}, {p.age}y)</span>
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
