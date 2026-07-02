import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { usePetProfiles } from "@/hooks/usePetProfiles";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const KEY = "pet_daily_tip_v1";

export default function PetDailyTip() {
  const { active } = usePetProfiles();
  const [tip, setTip] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchTip = async (force = false) => {
    const today = new Date().toISOString().slice(0, 10);
    const cached = JSON.parse(localStorage.getItem(KEY) || "null");
    if (!force && cached?.date === today) { setTip(cached.tip); return; }
    setLoading(true);
    const { data } = await supabase.functions.invoke("pet-translator-ai", {
      body: { action: "daily_tip", species: active?.species || "dog" },
    });
    setLoading(false);
    if (data?.result) { setTip(data.result); localStorage.setItem(KEY, JSON.stringify({ date: today, tip: data.result })); }
  };
  useEffect(() => { fetchTip();   }, [active?.species]);

  return (
    <>
      <FloatingHowItWorks title="How Pet Daily Tip works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Tap buttons, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Check output and save or share.' },
          { title: 'Iterate', desc: 'Repeat or refine anytime — progress is saved.' },
        ]} />
      <Card className="p-4 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 font-semibold"><Sparkles className="w-4 h-4 text-primary" /> Daily Pet Tip</div>
        <Button size="icon" variant="ghost" onClick={() => fetchTip(true)} disabled={loading}><RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /></Button>
      </div>
      <p className="text-sm">{tip || "Loading today's tip…"}</p>
    </Card>
    </>
    );
}
