import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Map, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

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
      const { data: coins } = await supabase.from("american_football_coins").select("*").eq("user_id", user.id).single();
      if (!coins || coins.balance < 300) { toast.error("Need 300 coins!"); return; }

      const { data: team } = await supabase.from("american_football_teams").select("*").eq("user_id", user.id).single();
      const { data: players } = await supabase.from("american_football_players").select("*").eq("user_id", user.id);
      const { data, error } = await supabase.functions.invoke("generate-gift-message", {
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: {
          prompt: `As an American football tactical analyst, analyze:\nTeam: ${team?.name || "My Team"}\nPlaystyle: ${team?.playstyle || "Balanced"}\nPlayers: ${(players || []).map(p => `${p.name}(${p.position},OVR:${p.overall_rating},THR:${p.throwing},RSH:${p.rushing},SPD:${p.speed})`).join(", ")}\n\nProvide:\n1. Optimal offensive formation\n2. Best defensive scheme\n3. Special teams recommendations\n4. Red zone play suggestions\n5. Two-minute drill strategy\n6. Areas to improve`,
          type: "af_tactics"
        }
      });
      if (error) throw error;
      await supabase.from("american_football_coins").update({ balance: coins.balance - 300, total_spent: coins.total_spent + 300 }).eq("user_id", user.id);
      setAnalysis(data.response || "No analysis generated");
      toast.success("Playbook analysis ready! (-300 coins)");
    } catch (e: any) { toast.error(e.message); } finally { setLoading(false); }
  };

  return (
    <><FloatingHowItWorks title="TacticsBoard — How it works" steps={[{title:"Open this section",desc:"Access TacticsBoard from the menu."},{title:"Explore features",desc:"Browse cards, filters, matches, tools and options."},{title:"Play & interact",desc:"Start matches, buy items, join tournaments (some actions cost credits or EUR)."},{title:"Track progress",desc:"Check leaderboards, trophies and stats over time."}]} />
<div className="space-y-4">
      <Button variant="ghost" onClick={onBack}><ArrowLeft className="h-4 w-4 mr-2" />Back</Button>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Map className="h-5 w-5 text-primary" />AI Playbook <span className="text-xs text-muted-foreground">(300 coins)</span></CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Button className="w-full" onClick={analyze} disabled={loading}>{loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Analyzing...</> : "Get Playbook Analysis (300 coins)"}</Button>
          {analysis && <div className="p-4 rounded-lg bg-muted/50 border border-border/50 whitespace-pre-wrap text-sm">{analysis}</div>}
        </CardContent>
      </Card>
    </div>
  </>
  );
}
