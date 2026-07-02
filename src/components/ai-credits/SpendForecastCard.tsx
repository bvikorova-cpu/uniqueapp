import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export function SpendForecastCard() {
  const [avg, setAvg] = useState<number | null>(null);
  const [recommended, setRecommended] = useState<string>("");

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const since = new Date(Date.now() - 30 * 86400_000).toISOString();
      const { data } = await supabase
        .from("ai_usage_history")
        .select("credits_used")
        .eq("user_id", user.id)
        .gte("created_at", since);
      const total = (data || []).reduce((s, r: any) => s + (r.credits_used || 0), 0);
      setAvg(total);
      if (total === 0) setRecommended("Try the Starter pack to begin");
      else if (total < 25) setRecommended("Basic (25 credits) fits your usage");
      else if (total < 60) setRecommended("Pro (60 credits) is your sweet spot");
      else if (total < 150) setRecommended("Ultimate (150 credits) saves you the most");
      else setRecommended("Consider monthly subscription — you'll save 40%+");
    })();
  }, []);

  if (avg === null) return null;

  return (
    <>
      <FloatingHowItWorks title={"Spend Forecast Card - How it works"} steps={[{ title: 'Open', desc: 'Access the Spend Forecast Card section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Spend Forecast Card.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="max-w-5xl mx-auto mb-6">
      <CardHeader>
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <CardTitle>Your 30-day spend forecast</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4 items-baseline">
          <div>
            <p className="text-4xl font-black">{avg}</p>
            <p className="text-xs text-muted-foreground">credits used / 30 days</p>
          </div>
          <div className="flex-1 text-sm">
            <p className="font-semibold">Recommendation</p>
            <p className="text-muted-foreground">{recommended}</p>
          </div>
        </div>
      </CardContent>
    </Card>
    </>
  );
}
