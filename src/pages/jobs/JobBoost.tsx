import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Rocket, Loader2, Sparkles, TrendingUp, Crown } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

import { HowItWorksButton } from "@/components/common/HowItWorksButton";

const HOW_STEPS_JOBBOOST = [
  { title: "Pick the job", desc: "Select an active post to boost." },
  { title: "Choose a boost tier", desc: "48h Highlight, 7-day Featured or 30-day Top-of-search." },
  { title: "Pay & activate", desc: "Boost starts immediately after payment. Analytics show views/applies delta." },
];

const TIERS = [
  { tier: "basic", label: "Basic Boost", price: 19, days: 7, desc: "Pinned to top of category", icon: TrendingUp, color: "from-blue-500 to-cyan-500" },
  { tier: "premium", label: "Premium Boost", price: 49, days: 14, desc: "Featured + push notifications", icon: Sparkles, color: "from-purple-500 to-pink-500" },
  { tier: "ultimate", label: "Ultimate", price: 99, days: 30, desc: "Homepage feature + email blast", icon: Crown, color: "from-amber-500 to-orange-500" },
];

export default function JobBoost() {
  const { jobId } = useParams();
  const [job, setJob] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) return;
    (async () => {
      const { data } = await (supabase as any).from("job_listings").select("*").eq("id", jobId).maybeSingle();
      setJob(data);
      const { data: h } = await (supabase as any).from("job_boost_purchases").select("*").eq("job_id", jobId).order("created_at", { ascending: false });
      setHistory(h || []);
    })();
  }, [jobId]);

  const buy = async (t: typeof TIERS[number]) => {
    setLoading(t.tier);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { product: "job_boost", module: "job_boost", job_id: jobId, boost_tier: t.tier, duration_days: t.days, amount_eur: t.price },
      });
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch (e: any) { toast.error(e.message); }
    finally { setLoading(null); }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 pt-6 pb-8 space-y-4">
      <div className="flex justify-end mb-2 max-w-6xl mx-auto px-4">
        <HowItWorksButton title="Job Boost" intro="Increase visibility of a specific job posting." steps={HOW_STEPS_JOBBOOST} variant="compact" />
      </div>
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-gradient-to-br from-amber-500/15 via-primary/10 to-orange-500/5 border border-amber-500/20 p-6 flex items-center gap-3">
        <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-xl"><Rocket className="h-6 w-6 text-white" /></div>
        <div>
          <h1 className="text-2xl font-black">Boost Your Job</h1>
          <p className="text-xs text-muted-foreground">{job?.title || "Reach 10× more candidates"}</p>
        </div>
      </motion.div>

      <div className="grid sm:grid-cols-3 gap-3">
        {TIERS.map(t => {
          const Icon = t.icon;
          return (
            <Card key={t.tier} className="overflow-hidden">
              <div className={`h-1 bg-gradient-to-r ${t.color}`} />
              <CardContent className="p-4 space-y-3">
                <div className={`p-2 rounded-lg bg-gradient-to-br ${t.color} w-fit`}><Icon className="h-5 w-5 text-white" /></div>
                <div>
                  <p className="font-black">{t.label}</p>
                  <p className="text-2xl font-black">€{t.price}</p>
                  <p className="text-xs text-muted-foreground">{t.days} days · {t.desc}</p>
                </div>
                <Button className="w-full" onClick={() => buy(t)} disabled={loading === t.tier}>
                  {loading === t.tier ? <Loader2 className="h-4 w-4 animate-spin" /> : "Buy"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {history.length > 0 && (
        <Card><CardContent className="p-4">
          <p className="font-bold mb-2 text-sm">Boost history</p>
          {history.map(h => (
            <div key={h.id} className="flex justify-between text-xs py-1 border-b last:border-0">
              <span>{h.boost_tier} · {h.duration_days}d</span>
              <span className="font-bold">€{h.amount_eur} · {h.status}</span>
            </div>
          ))}
        </CardContent></Card>
      )}
    </div>
  );
}
