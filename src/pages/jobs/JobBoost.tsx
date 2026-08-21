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
  { title: "Choose a boost tier", desc: "7-day pinned, 14-day featured or 30-day top-of-search." },
  { title: "Pay with credits", desc: "Boost activates instantly after credits are deducted. Analytics show views/applies delta." },
];

const TIERS = [
  { tier: "basic", label: "Basic Boost", credits: JOBS_CREDIT_COSTS.boost_basic, days: 7, desc: "Pinned to top of category", icon: TrendingUp, color: "from-blue-500 to-cyan-500" },
  { tier: "premium", label: "Premium Boost", credits: JOBS_CREDIT_COSTS.boost_premium, days: 14, desc: "Featured in search results", icon: Sparkles, color: "from-purple-500 to-pink-500" },
  { tier: "ultimate", label: "Ultimate", credits: JOBS_CREDIT_COSTS.boost_ultimate, days: 30, desc: "Homepage feature + top of search", icon: Crown, color: "from-amber-500 to-orange-500" },
];

export default function JobBoost() {
  const { jobId } = useParams();
  const [job, setJob] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState<string | null>(null);
  const { spend } = useJobsCredits();

  const loadHistory = async () => {
    const { data: h } = await (supabase as any)
      .from("job_boost_purchases").select("*").eq("job_id", jobId).order("created_at", { ascending: false });
    setHistory(h || []);
  };

  useEffect(() => {
    if (!jobId) return;
    (async () => {
      const { data } = await (supabase as any).from("job_listings").select("*").eq("id", jobId).maybeSingle();
      setJob(data);
      await loadHistory();
    })();
  }, [jobId]);

  const buy = async (t: typeof TIERS[number]) => {
    if (!jobId) return;
    setLoading(t.tier);
    try {
      const ok = await spend(t.credits, `job_boost_${t.tier}`);
      if (!ok) return;

      const now = new Date();
      const expires = new Date(now.getTime() + t.days * 24 * 60 * 60 * 1000);

      const { error: upErr } = await (supabase as any)
        .from("job_listings")
        .update({
          is_featured: true,
          boost_tier: t.tier,
          boost_until: expires.toISOString(),
          featured_until: expires.toISOString(),
        })
        .eq("id", jobId);
      if (upErr) throw upErr;

      await (supabase as any).from("job_boost_purchases").insert({
        job_id: jobId,
        employer_id: job?.employer_id,
        boost_tier: t.tier,
        duration_days: t.days,
        amount_eur: 0,
        status: "active",
        starts_at: now.toISOString(),
        expires_at: expires.toISOString(),
      });

      toast.success(`${t.label} active for ${t.days} days`, { description: `${t.credits} credits used.` });
      await loadHistory();
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
