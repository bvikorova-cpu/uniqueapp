import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, GraduationCap, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export function YouthAcademy({ onBack }: { onBack: () => void }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [prospects, setProspects] = useState<any[]>([]);

  const discover = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");
      const { data: coins } = await supabase.from("american_football_coins").select("*").eq("user_id", user.id).single();
      if (!coins || coins.balance < 350) { toast.error("Need 350 coins!"); return; }

      const { data, error } = await supabase.functions.invoke("generate-gift-message", {
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: {
          prompt: `Generate 3 young American football draft prospects (age 18-22) as JSON array: [{"name": "<realistic name>", "age": <18-22>, "position": "<QB/RB/WR/TE/OL/DL/LB/CB/S>", "college": "<university>", "overall_rating": <45-65>, "potential": <80-99>, "throwing": <30-70>, "catching": <30-70>, "rushing": <30-70>, "speed": <40-80>, "trait": "<unique trait like 'Cannon Arm' or 'Shutdown Corner' or 'Power Runner'>", "development_cost": <200-600>}]`,
          type: "af_youth"
        }
      });
      if (error) throw error;
      const jsonMatch = data.response?.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error("Draft discovery failed");
      await supabase.from("american_football_coins").update({ balance: coins.balance - 350, total_spent: coins.total_spent + 350 }).eq("user_id", user.id);
      setProspects(JSON.parse(jsonMatch[0]));
      toast.success("Draft prospects found! (-350 coins)");
    } catch (e: any) { toast.error(e.message); } finally { setLoading(false); }
  };

  const signProspect = async (p: any) => {
    if (!user) return;
    const { data: coins } = await supabase.from("american_football_coins").select("*").eq("user_id", user.id).single();
    if (!coins || coins.balance < p.development_cost) { toast.error("Not enough coins!"); return; }
    await supabase.from("american_football_coins").update({ balance: coins.balance - p.development_cost, total_spent: coins.total_spent + p.development_cost }).eq("user_id", user.id);
    await supabase.from("american_football_players").insert({ user_id: user.id, name: p.name, position: p.position, overall_rating: p.overall_rating, throwing: p.throwing, catching: p.catching, rushing: p.rushing, blocking: 30 + Math.floor(Math.random() * 30), tackling: 30 + Math.floor(Math.random() * 30), speed: p.speed, stamina: 40 + Math.floor(Math.random() * 30), market_value: p.development_cost * 2 });
    toast.success(`Drafted ${p.name}!`);
    setProspects(prev => prev.filter(x => x.name !== p.name));
  };

  return (
    <><FloatingHowItWorks title="YouthAcademy — How it works" steps={[{title:"Open this section",desc:"Access YouthAcademy from the menu."},{title:"Explore features",desc:"Browse cards, filters, matches, tools and options."},{title:"Play & interact",desc:"Start matches, buy items, join tournaments (some actions cost credits or EUR)."},{title:"Track progress",desc:"Check leaderboards, trophies and stats over time."}]} />
<div className="space-y-4">
      <Button variant="ghost" onClick={onBack}><ArrowLeft className="h-4 w-4 mr-2" />Back</Button>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><GraduationCap className="h-5 w-5 text-primary" />Draft Academy <span className="text-xs text-muted-foreground">(350 coins)</span></CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Button className="w-full" onClick={discover} disabled={loading}>{loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Scouting Draft...</> : "Discover Prospects (350 coins)"}</Button>
          {prospects.map((p, i) => (
            <div key={i} className="p-3 rounded-lg border border-border/50">
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-bold text-sm">{p.name}</span> <span className="text-xs text-muted-foreground">({p.college}, {p.age}y)</span>
                  <p className="text-xs">{p.position} | OVR {p.overall_rating} | POT {p.potential} ⭐</p>
                  <p className="text-[11px] text-primary">Trait: {p.trait}</p>
                </div>
                <Button size="sm" onClick={() => signProspect(p)}>{p.development_cost} coins</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  </>
  );
}
