import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Search, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export const ScoutNetwork = ({ onBack }: { onBack: () => void }) => {
  const { user, session } = useAuth();
  const [scoutResult, setScoutResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const scout = async () => {
    if (!user || !session) { toast.error("Sign in first"); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-gift-message", {
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: {
          prompt: `Generate 3 football talent scouts as JSON array: [{"name": "<realistic name>", "age": <17-28>, "position": "<GK/CB/LB/RB/CDM/CM/CAM/LW/RW/ST>", "nationality": "<country>", "overall_rating": <55-85>, "potential": <65-95>, "price": <500-10000>, "description": "<one sentence>"}]`,
          type: "football_scout"
        }
      });
      if (error) throw error;
      try { setScoutResult(JSON.parse(data.message || "[]")); } catch { setScoutResult([{ name: "Unknown Talent", age: 19, position: "ST", nationality: "Brazil", overall_rating: 68, potential: 85, price: 3000, description: "A promising young striker." }]); }
    } catch (e: any) { toast.error(e.message); } finally { setLoading(false); }
  };

  const signPlayer = async (player: any) => {
    if (!user) return;
    const { data: coins } = await supabase.from("football_coins").select("*").eq("user_id", user.id).single();
    if (!coins || coins.balance < player.price) { toast.error("Not enough coins!"); return; }
    await supabase.from("football_coins").update({ balance: coins.balance - player.price, total_spent: coins.total_spent + player.price }).eq("user_id", user.id);
    await supabase.from("football_players").insert({ user_id: user.id, name: player.name, position: player.position, overall_rating: player.overall_rating, pace: 40 + Math.floor(Math.random() * 40), shooting: 40 + Math.floor(Math.random() * 40), passing: 40 + Math.floor(Math.random() * 40), defending: 40 + Math.floor(Math.random() * 40), physical: 40 + Math.floor(Math.random() * 40), market_value: player.price });
    toast.success(`Signed ${player.name}!`);
    setScoutResult((prev: any[]) => prev.filter((p: any) => p.name !== player.name));
  };

  return (
    <><FloatingHowItWorks title="ScoutNetwork — How it works" steps={[{title:"Open this section",desc:"Access ScoutNetwork from the menu."},{title:"Explore features",desc:"Browse cards, filters, matches, tools and options."},{title:"Play & interact",desc:"Start matches, buy items, join tournaments (some actions cost credits or EUR)."},{title:"Track progress",desc:"Check leaderboards, trophies and stats over time."}]} />
<div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2"><ArrowLeft className="h-4 w-4" /> Back</Button>
      <h2 className="text-2xl font-bold">🔍 Scout Network</h2>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Search className="h-5 w-5" /> Discover Talent</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">Use AI scouts to discover hidden talent worldwide.</p>
          <Button onClick={scout} disabled={loading} className="w-full gap-2 bg-gradient-to-r from-emerald-600 to-green-600">
            <Sparkles className="h-4 w-4" /> Scout Players (3 credits)
          </Button>
        </CardContent>
      </Card>
      {scoutResult && scoutResult.length > 0 && (
        <div className="space-y-3">
          {scoutResult.map((p: any, i: number) => (
            <Card key={i} className="border-emerald-500/20">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-bold text-lg">{p.name}</p>
                    <p className="text-sm text-muted-foreground">{p.position} • {p.nationality} • Age {p.age}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-emerald-400">{p.overall_rating}</p>
                    <p className="text-xs text-amber-400">POT {p.potential}</p>
                  </div>
                </div>
                <p className="text-sm mb-3">{p.description}</p>
                <Button onClick={() => signPlayer(p)} className="w-full">{p.price.toLocaleString()} coins</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  </>
  );
};
