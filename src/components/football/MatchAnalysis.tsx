import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Sparkles, BarChart3 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export const MatchAnalysis = ({ onBack }: { onBack: () => void }) => {
  const { user, session } = useAuth();
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    if (!user || !session) { toast.error("Sign in first"); return; }
    setLoading(true);
    try {
      const { data: team } = await supabase.from("football_teams").select("*").eq("user_id", user.id).single();
      const { data, error } = await supabase.functions.invoke("generate-gift-message", {
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: {
          prompt: `Post-match analysis for football team "${team?.name || "My Team"}" (W${team?.wins || 0} D${team?.draws || 0} L${team?.losses || 0}). Provide:\n1. Performance summary\n2. Key strengths identified\n3. Areas for improvement\n4. Player development recommendations\n5. Suggested transfers\n6. Next match preparation tips`,
          type: "football_analysis"
        }
      });
      if (error) throw error;
      setAnalysis(data.message || data.text || "No analysis available");
    } catch (e: any) { toast.error(e.message); } finally { setLoading(false); }
  };

  return (
    <><FloatingHowItWorks title="MatchAnalysis — How it works" steps={[{title:"Open this section",desc:"Access MatchAnalysis from the menu."},{title:"Explore features",desc:"Browse cards, filters, matches, tools and options."},{title:"Play & interact",desc:"Start matches, buy items, join tournaments (some actions cost credits or EUR)."},{title:"Track progress",desc:"Check leaderboards, trophies and stats over time."}]} />
<div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2"><ArrowLeft className="h-4 w-4" /> Back</Button>
      <h2 className="text-2xl font-bold">📊 Match Analysis</h2>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5" /> AI Performance Report</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">Get detailed AI analysis of your team performance, strengths, and weaknesses.</p>
          <Button onClick={analyze} disabled={loading} className="w-full gap-2 bg-gradient-to-r from-emerald-600 to-green-600">
            <Sparkles className="h-4 w-4" /> Generate Report (3 credits)
          </Button>
          {analysis && <div className="p-4 rounded-lg bg-muted/50 whitespace-pre-wrap text-sm">{analysis}</div>}
        </CardContent>
      </Card>
    </div>
  </>
  );
};
