import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, BarChart3, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { spendSportCoins } from "@/lib/sportCoins";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

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
      const { data: coins } = await supabase.from("hockey_coins").select("*").eq("user_id", user.id).single();
      if (!coins || coins.balance < 400) { toast.error("Need 400 coins!"); return; }

      const { data: team } = await supabase.from("hockey_teams").select("*").eq("user_id", user.id).single();
      const { data, error } = await supabase.functions.invoke("generate-gift-message", {
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: {
          prompt: `Post-match analysis for ice hockey team "${team?.name || "My Team"}" (W${team?.wins || 0} L${team?.losses || 0} D${team?.draws || 0}). Provide:\n1. Performance summary\n2. Offensive zone efficiency\n3. Defensive zone coverage\n4. Special teams rating (PP/PK)\n5. Player development recommendations\n6. Suggested line changes`,
          type: "hockey_analysis"
        }
      });
      if (error) throw error;
      const spendRes = await spendSportCoins("hockey_coins", 400);
      if (!spendRes.ok) { toast.error("Need 400 coins!"); return; }
      setAnalysis(data.response || "No analysis generated");
      toast.success("Match analysis ready! (-400 coins)");
    } catch (e: any) { toast.error(e.message); } finally { setLoading(false); }
  };

  return (
    <>
      <FloatingHowItWorks title={"Match Analysis - How it works"} steps={[{ title: 'Open', desc: 'Access the Match Analysis section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Match Analysis.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-4">
      <Button variant="ghost" onClick={onBack}><ArrowLeft className="h-4 w-4 mr-2" />Back</Button>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5 text-primary" />AI Match Analysis <span className="text-xs text-muted-foreground">(400 coins)</span></CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Button className="w-full" onClick={analyze} disabled={loading}>{loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Analyzing...</> : "Generate Analysis (400 coins)"}</Button>
          {analysis && <div className="p-4 rounded-lg bg-muted/50 border border-border/50 whitespace-pre-wrap text-sm">{analysis}</div>}
        </CardContent>
      </Card>
    </div>
    </>
  );
}
