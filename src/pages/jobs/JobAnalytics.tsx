import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BarChart3, Eye, MousePointerClick, Send, Bookmark, Share2, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

import { HowItWorksButton } from "@/components/common/HowItWorksButton";

const HOW_STEPS_JOBANALYTICS = [
  { title: "Pick a timeframe", desc: "Last 7/30/90 days or custom." },
  { title: "Key metrics", desc: "Views, applies, view-to-apply rate, source split, time-to-hire." },
  { title: "Drill into a job", desc: "Click any post to see per-job funnel and source of hire." },
];

const TYPES: { id: string; label: string; icon: any }[] = [
  { id: "view", label: "Views", icon: Eye },
  { id: "impression", label: "Impressions", icon: MousePointerClick },
  { id: "apply_start", label: "Apply Started", icon: Send },
  { id: "apply_complete", label: "Apply Completed", icon: Send },
  { id: "save", label: "Saves", icon: Bookmark },
  { id: "share", label: "Shares", icon: Share2 },
];

export default function JobAnalytics() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState<any>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!jobId) return;
      const { data: j } = await supabase.from("job_listings").select("*").eq("id", jobId).maybeSingle();
      setJob(j);
      const { data } = await (supabase as any).from("job_analytics_events").select("event_type").eq("job_id", jobId);
      const c: Record<string, number> = {};
      (data ?? []).forEach((e: any) => { c[e.event_type] = (c[e.event_type] || 0) + 1; });
      setCounts(c);
      setLoading(false);
    })();
  }, [jobId]);

  const conversion = counts.view ? ((counts.apply_complete || 0) / counts.view * 100).toFixed(1) : "0";

  return (
    <div className="max-w-5xl mx-auto px-4 pt-6 pb-8 space-y-6">
      <div className="flex justify-end mb-2 max-w-6xl mx-auto px-4">
        <HowItWorksButton title="Job Analytics" intro="How your postings and pipeline perform." steps={HOW_STEPS_JOBANALYTICS} variant="compact" />
      </div>
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500/15 via-primary/10 to-violet-500/5 border border-indigo-500/20 p-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/employer-dashboard")}><ArrowLeft className="h-4 w-4" /></Button>
          <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 shadow-xl"><BarChart3 className="h-7 w-7 text-white" /></div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black">{job?.title || "Job"} Analytics</h1>
            <p className="text-sm text-muted-foreground">Conversion rate: {conversion}%</p>
          </div>
        </div>
      </motion.div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {TYPES.map(t => {
            const Icon = t.icon;
            return (
              <Card key={t.id}><CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground text-xs"><Icon className="h-4 w-4" /> {t.label}</div>
                <p className="text-3xl font-black mt-2">{counts[t.id] || 0}</p>
              </CardContent></Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
