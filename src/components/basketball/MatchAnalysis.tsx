import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, BarChart3, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { spendSportCoins, getSportCoinsBalance } from "@/lib/sportCoins";

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
      const balance = await getSportCoinsBalance("basketball_coins");
      if (balance < 400) { toast.error("Need 400 coins!"); return; }

      const { data: team } = await supabase.from("basketball_teams").select("*").eq("user_id", user.id).single();
      const { data, error } = await supabase.functions.invoke("generate-gift-message", {
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: {
          prompt: `Post-match analysis for basketball team "${team?.name || "My Team"}" (W${team?.wins || 0} L${team?.losses || 0}). Provide:\n1. Performance summary\n2. Offensive efficiency\n3. Defensive rating\n4. Player development recommendations\n5. Suggested roster changes\n6. Next game preparation tips`,
          type: "basketball_analysis"
        }
      });
      if (error) throw error;
      await supabase.from("basketball_coins").update({ balance: coins.balance - 400, total_spent: coins.total_spent + 400 }).eq("user_id", user.id);
      setAnalysis(data.response || "No analysis generated");
      toast.success("Match analysis ready! (-400 coins)");
    } catch (e: any) { toast.error(e.message); } finally { setLoading(false); }
  };

  return (
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
  );
}
