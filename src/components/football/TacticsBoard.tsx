import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Sparkles, Map } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export const TacticsBoard = ({ onBack }: { onBack: () => void }) => {
  const { user, session } = useAuth();
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const getAnalysis = async () => {
    if (!user || !session) { toast.error("Sign in first"); return; }
    setLoading(true);
    try {
      const { data: team } = await supabase.from("football_teams").select("*").eq("user_id", user.id).single();
      const { data: players } = await supabase.from("football_players").select("*").eq("user_id", user.id);
      const { data, error } = await supabase.functions.invoke("generate-gift-message", {
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: {
          prompt: `As a football tactical analyst, analyze this team:\nTeam: ${team?.name || "My Team"}\nFormation: ${team?.formation || "4-3-3"}\nPlayers: ${(players || []).map(p => `${p.name} (${p.position}, OVR:${p.overall_rating})`).join(", ")}\n\nProvide:\n1. Formation analysis\n2. Tactical recommendations\n3. Key player roles\n4. Weaknesses to address\n5. Best strategy for next match`,
          type: "football_tactics"
        }
      });
      if (error) throw error;
      setAnalysis(data.message || data.text || "No analysis available");
    } catch (e: any) { toast.error(e.message); } finally { setLoading(false); }
  };

  return (
    <><FloatingHowItWorks title="TacticsBoard — How it works" steps={[{title:"Open this section",desc:"Access TacticsBoard from the menu."},{title:"Explore features",desc:"Browse cards, filters, matches, tools and options."},{title:"Play & interact",desc:"Start matches, buy items, join tournaments (some actions cost credits or EUR)."},{title:"Track progress",desc:"Check leaderboards, trophies and stats over time."}]} />
<div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2"><ArrowLeft className="h-4 w-4" /> Back</Button>
      <h2 className="text-2xl font-bold">📋 Tactics Board</h2>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Map className="h-5 w-5" /> AI Tactical Analysis</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">Get AI-powered tactical recommendations for your team formation and strategy.</p>
          <Button onClick={getAnalysis} disabled={loading} className="w-full gap-2 bg-gradient-to-r from-emerald-600 to-green-600">
            <Sparkles className="h-4 w-4" /> Get AI Analysis (2 credits)
          </Button>
          {analysis && (
            <div className="p-4 rounded-lg bg-muted/50 whitespace-pre-wrap text-sm">{analysis}</div>
          )}
        </CardContent>
      </Card>
    </div>
  </>
  );
};
