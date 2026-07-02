import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Map, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { spendSportCoins } from "@/lib/sportCoins";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export function TacticsBoard({ onBack }: { onBack: () => void }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState("");

  const analyze = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");
      const { data: coins } = await supabase.from("hockey_coins").select("*").eq("user_id", user.id).single();
      if (!coins || coins.balance < 300) { toast.error("Need 300 coins!"); return; }

      const { data: team } = await supabase.from("hockey_teams").select("*").eq("user_id", user.id).single();
      const { data: players } = await supabase.from("hockey_players").select("*").eq("user_id", user.id);
      const { data, error } = await supabase.functions.invoke("generate-gift-message", {
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: {
          prompt: `As an ice hockey tactical analyst, analyze:\nTeam: ${team?.name || "My Team"}\nPlaystyle: ${team?.playstyle || "Balanced"}\nPlayers: ${(players || []).map(p => `${p.name}(${p.position},OVR:${p.overall_rating},SKT:${p.skating},SHT:${p.shooting},DEF:${p.defense},SPD:${p.speed})`).join(", ")}\n\nProvide:\n1. Optimal line combinations\n2. Power play strategy\n3. Penalty kill scheme\n4. Forechecking system\n5. Areas to improve\n6. Recommended plays`,
          type: "hockey_tactics"
        }
      });
      if (error) throw error;
      const spendRes = await spendSportCoins("hockey_coins", 300);
      if (!spendRes.ok) { toast.error("Need 300 coins!"); return; }
      setAnalysis(data.response || "No analysis generated");
      toast.success("Tactical analysis ready! (-300 coins)");
    } catch (e: any) { toast.error(e.message); } finally { setLoading(false); }
  };

  return (
    <>
      <FloatingHowItWorks title={"Tactics Board - How it works"} steps={[{ title: 'Open', desc: 'Access the Tactics Board section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Tactics Board.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-4">
      <Button variant="ghost" onClick={onBack}><ArrowLeft className="h-4 w-4 mr-2" />Back</Button>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Map className="h-5 w-5 text-primary" />AI Tactics Board <span className="text-xs text-muted-foreground">(300 coins)</span></CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Button className="w-full" onClick={analyze} disabled={loading}>{loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Analyzing...</> : "Get Tactical Analysis (300 coins)"}</Button>
          {analysis && <div className="p-4 rounded-lg bg-muted/50 border border-border/50 whitespace-pre-wrap text-sm">{analysis}</div>}
        </CardContent>
      </Card>
    </div>
    </>
  );
}
