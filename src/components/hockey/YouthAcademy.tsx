import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, GraduationCap, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { spendSportCoins } from "@/lib/sportCoins";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

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
      const { data, error } = await supabase.functions.invoke("generate-gift-message", {
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: {
          prompt: `Generate 3 young ice hockey prospects (age 15-19) as JSON array: [{"name": "<realistic name>", "age": <15-19>, "position": "<C/LW/RW/D/G>", "overall_rating": <45-65>, "potential": <80-99>, "skating": <30-70>, "shooting": <30-70>, "defense": <30-65>, "speed": <40-80>, "trait": "<unique trait like 'Sniper' or 'Power Forward' or 'Shutdown D'>", "development_cost": <200-600>}]`,
          type: "hockey_youth"
        }
      });
      if (error) throw error;
      const jsonMatch = data.response?.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error("Discovery failed");
      const spendRes = await spendSportCoins("hockey_coins", 350);
      if (!spendRes.ok) { toast.error("Need 350 coins!"); return; }
      setProspects(JSON.parse(jsonMatch[0]));
      toast.success("Youth prospects found! (-350 coins)");
    } catch (e: any) { toast.error(e.message); } finally { setLoading(false); }
  };

  const signProspect = async (p: any) => {
    if (!user) return;
    const { data: coins } = await supabase.from("hockey_coins").select("*").eq("user_id", user.id).single();
    if (!coins || coins.balance < p.development_cost) { toast.error("Not enough coins!"); return; }
    await supabase.from("hockey_coins").update({ balance: coins.balance - p.development_cost, total_spent: coins.total_spent + p.development_cost }).eq("user_id", user.id);
    await supabase.from("hockey_players").insert({ user_id: user.id, name: p.name, position: p.position, overall_rating: p.overall_rating, skating: p.skating, shooting: p.shooting, defense: p.defense, speed: p.speed, passing: 35 + Math.floor(Math.random() * 30), physicality: 35 + Math.floor(Math.random() * 30), stamina: 40 + Math.floor(Math.random() * 30), goaltending: p.position === "G" ? 50 + Math.floor(Math.random() * 30) : 20, market_value: p.development_cost * 2 });
    toast.success(`Signed ${p.name} to academy!`);
    setProspects(prev => prev.filter(x => x.name !== p.name));
  };

  return (
    <>
      <FloatingHowItWorks title={"Youth Academy - How it works"} steps={[{ title: 'Open', desc: 'Access the Youth Academy section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Youth Academy.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-4">
      <Button variant="ghost" onClick={onBack}><ArrowLeft className="h-4 w-4 mr-2" />Back</Button>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><GraduationCap className="h-5 w-5 text-primary" />Youth Academy <span className="text-xs text-muted-foreground">(350 coins)</span></CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Button className="w-full" onClick={discover} disabled={loading}>{loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Discovering...</> : "Discover Prospects (350 coins)"}</Button>
          {prospects.map((p, i) => (
            <div key={i} className="p-3 rounded-lg border border-border/50">
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-bold text-sm">{p.name}</span> <span className="text-xs text-muted-foreground">({p.age}y)</span>
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
