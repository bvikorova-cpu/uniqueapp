import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, BarChart3, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export function MatchAnalysis({ onBack }: { onBack: () => void }) {
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
      if (!coins || coins.balance < 400) { toast.error("Need 400 coins!"); return; }

      const { data: team } = await supabase.from("american_football_teams").select("*").eq("user_id", user.id).single();
      const { data, error } = await supabase.functions.invoke("generate-gift-message", {
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: {
          prompt: `Post-game film analysis for American football team "${team?.name || "My Team"}" (W${team?.wins || 0} L${team?.losses || 0}). Provide:\n1. Offensive performance breakdown\n2. Defensive efficiency\n3. Special teams analysis\n4. Turnover margin assessment\n5. Red zone efficiency\n6. Player development recommendations`,
          type: "af_analysis"
        }
      });
      if (error) throw error;
      await supabase.from("american_football_coins").update({ balance: coins.balance - 400, total_spent: coins.total_spent + 400 }).eq("user_id", user.id);
      setAnalysis(data.response || "No analysis generated");
      toast.success("Game film analysis ready! (-400 coins)");
    } catch (e: any) { toast.error(e.message); } finally { setLoading(false); }
  };

  return (
    <><FloatingHowItWorks title="MatchAnalysis — How it works" steps={[{title:"Open this section",desc:"Access MatchAnalysis from the menu."},{title:"Explore features",desc:"Browse cards, filters, matches, tools and options."},{title:"Play & interact",desc:"Start matches, buy items, join tournaments (some actions cost credits or EUR)."},{title:"Track progress",desc:"Check leaderboards, trophies and stats over time."}]} />
<div className="space-y-4">
      <Button variant="ghost" onClick={onBack}><ArrowLeft className="h-4 w-4 mr-2" />Back</Button>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5 text-primary" />AI Game Film <span className="text-xs text-muted-foreground">(400 coins)</span></CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Button className="w-full" onClick={analyze} disabled={loading}>{loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Analyzing...</> : "Generate Analysis (400 coins)"}</Button>
          {analysis && <div className="p-4 rounded-lg bg-muted/50 border border-border/50 whitespace-pre-wrap text-sm">{analysis}</div>}
        </CardContent>
      </Card>
    </div>
  </>
  );
}
