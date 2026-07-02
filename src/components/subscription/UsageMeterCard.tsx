import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Sparkles, ListPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/hooks/useSubscription";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export const UsageMeterCard = () => {
  const { limits } = useSubscription();
  const [aiUsed, setAiUsed] = useState(0);
  const [listingsUsed, setListingsUsed] = useState(0);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0,0,0,0);
      const [ai, l] = await Promise.all([
        supabase.from("ai_usage_history").select("id", { count: "exact", head: true }).eq("user_id", user.id).gte("created_at", monthStart.toISOString()),
        supabase.from("bazaar_items").select("id", { count: "exact", head: true }).eq("user_id", user.id).gte("created_at", monthStart.toISOString()),
      ]);
      setAiUsed(ai.count ?? 0);
      setListingsUsed(l.count ?? 0);
    })();
  }, []);

  const aiLimit = limits.aiGenerationsPerMonth;
  const listLimit = limits.bazaarListingsPerMonth;
  const aiPct = aiLimit === -1 ? 0 : Math.min(100, (aiUsed / aiLimit) * 100);
  const listPct = listLimit === -1 ? 0 : Math.min(100, (listingsUsed / listLimit) * 100);

  return (
    <>
      <FloatingHowItWorks title={"Usage Meter Card - How it works"} steps={[{ title: 'Open', desc: 'Access the Usage Meter Card section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Usage Meter Card.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card>
      <CardHeader><CardTitle className="text-base">This month's usage</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-1"><span className="flex items-center gap-1"><Sparkles className="h-3 w-3" /> AI generations</span><span className="text-muted-foreground">{aiUsed} / {aiLimit === -1 ? "∞" : aiLimit}</span></div>
          {aiLimit !== -1 && <Progress value={aiPct} />}
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1"><span className="flex items-center gap-1"><ListPlus className="h-3 w-3" /> Bazaar listings</span><span className="text-muted-foreground">{listingsUsed} / {listLimit === -1 ? "∞" : listLimit}</span></div>
          {listLimit !== -1 && <Progress value={listPct} />}
        </div>
      </CardContent>
    </Card>
    </>
  );
};
