import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, TrendingUp, ArrowRight, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Rec {
  recommended_tier: string;
  current_tier: string;
  rationale: string;
  monthly_savings_cents: number;
  ai_usage_30d: number;
  listings_30d: number;
}

export const PlanRecommenderCard = () => {
  const [rec, setRec] = useState<Rec | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const { data } = await supabase.functions.invoke("recommend-plan");
      if (data) setRec(data as Rec);
      setLoading(false);
    })();
  }, []);

  if (loading) return <Card><CardContent className="py-6 flex justify-center"><Loader2 className="h-5 w-5 animate-spin" /></CardContent></Card>;
  if (!rec || rec.recommended_tier === rec.current_tier) return null;

  const upgrade = rec.recommended_tier !== "basic" || rec.current_tier === "premium";
  return (
    <>
      <FloatingHowItWorks title={"Plan Recommender Card - How it works"} steps={[{ title: 'Open', desc: 'Access the Plan Recommender Card section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Plan Recommender Card.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
      <CardContent className="py-5 space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <span className="font-semibold">Smart plan suggestion</span>
        </div>
        <div className="text-sm">
          Switch to <span className="font-bold capitalize text-primary">{rec.recommended_tier}</span> — {rec.rationale}
        </div>
        {rec.monthly_savings_cents > 0 && (
          <div className="text-sm flex items-center gap-1 text-emerald-500"><TrendingUp className="h-4 w-4" /> Save €{(rec.monthly_savings_cents/100).toFixed(2)}/mo</div>
        )}
        <Button onClick={() => navigate("/subscription")} className="gap-2">
          {upgrade ? "Upgrade" : "Switch plan"} <ArrowRight className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
    </>
  );
};
