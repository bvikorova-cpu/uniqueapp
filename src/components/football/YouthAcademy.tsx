import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Sparkles, GraduationCap } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export const YouthAcademy = ({ onBack }: { onBack: () => void }) => {
  const { user, session } = useAuth();
  const [prospects, setProspects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const generateYouth = async () => {
    if (!user || !session) { toast.error("Sign in first"); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-gift-message", {
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: {
          prompt: `Generate 4 youth football academy prospects as JSON: [{"name": "<name>", "age": <15-18>, "position": "<position>", "potential": <70-95>, "current_rating": <40-60>, "trait": "<special trait>"}]`,
          type: "football_youth"
        }
      });
      if (error) throw error;
      try { setProspects(JSON.parse(data.message || "[]")); } catch { setProspects([{ name: "Youth Star", age: 16, position: "ST", potential: 88, current_rating: 52, trait: "Speed demon" }]); }
    } catch (e: any) { toast.error(e.message); } finally { setLoading(false); }
  };

  const signYouth = async (prospect: any) => {
    if (!user) return;
    await supabase.from("football_players").insert({
      user_id: user.id, name: prospect.name, position: prospect.position,
      overall_rating: prospect.current_rating, pace: 40 + Math.floor(Math.random() * 20),
      shooting: 35 + Math.floor(Math.random() * 20), passing: 35 + Math.floor(Math.random() * 20),
      defending: 30 + Math.floor(Math.random() * 20), physical: 35 + Math.floor(Math.random() * 20),
      market_value: prospect.current_rating * 50
    });
    toast.success(`${prospect.name} joined your academy!`);
    setProspects(prev => prev.filter(p => p.name !== prospect.name));
  };

  return (
    <><FloatingHowItWorks title="YouthAcademy — How it works" steps={[{title:"Open this section",desc:"Access YouthAcademy from the menu."},{title:"Explore features",desc:"Browse cards, filters, matches, tools and options."},{title:"Play & interact",desc:"Start matches, buy items, join tournaments (some actions cost credits or EUR)."},{title:"Track progress",desc:"Check leaderboards, trophies and stats over time."}]} />
<div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2"><ArrowLeft className="h-4 w-4" /> Back</Button>
      <h2 className="text-2xl font-bold">🎓 Youth Academy</h2>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><GraduationCap className="h-5 w-5" /> Discover Young Talent</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">Use AI to scout and develop promising youth players with high potential.</p>
          <Button onClick={generateYouth} disabled={loading} className="w-full gap-2 bg-gradient-to-r from-emerald-600 to-green-600">
            <Sparkles className="h-4 w-4" /> Scout Youth (2 credits)
          </Button>
        </CardContent>
      </Card>
      {prospects.length > 0 && (
        <div className="space-y-3">
          {prospects.map((p, i) => (
            <Card key={i} className="border-emerald-500/20">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-bold">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.position} • Age {p.age}</p>
                    <p className="text-xs text-emerald-400 mt-1">✨ {p.trait}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">{p.current_rating}</p>
                    <p className="text-xs text-amber-400">POT {p.potential}</p>
                  </div>
                </div>
                <Button onClick={() => signYouth(p)} size="sm" className="w-full">Sign to Academy</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  </>
  );
};
