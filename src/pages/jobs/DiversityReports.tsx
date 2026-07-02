import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart3, Users } from "lucide-react";
import { motion } from "framer-motion";

import { HowItWorksButton } from "@/components/common/HowItWorksButton";

const HOW_STEPS_DIVERSITYREPORTS = [
  { title: "Pick a timeframe", desc: "Last 30 days, quarter, year or custom range." },
  { title: "Read the breakdown", desc: "Charts show applicants, interviews and hires broken down by anonymous demographics." },
  { title: "Export as CSV/PDF", desc: "Share the report with leadership or DEI teams." },
];

export default function DiversityReports() {
  const { jobId } = useParams();
  const [apps, setApps] = useState<any[]>([]);
  const [selfIds, setSelfIds] = useState<Record<string, any>>({});

  useEffect(() => {
    (async () => {
      const q = (supabase as any).from("job_applications").select("user_id, status, job_id");
      const { data: a } = jobId ? await q.eq("job_id", jobId) : await q;
      setApps(a || []);
      const ids = [...new Set((a || []).map((x: any) => x.user_id))];
      if (ids.length) {
        const { data: s } = await (supabase as any).from("diversity_self_id").select("*").in("user_id", ids);
        const map: any = {};
        (s || []).forEach((r: any) => { map[r.user_id] = r; });
        setSelfIds(map);
      }
    })();
  }, [jobId]);

  const counts = (key: string) => {
    const m: Record<string, number> = {};
    apps.forEach(a => {
      const v = selfIds[a.user_id]?.[key] || "Not disclosed";
      m[v] = (m[v] || 0) + 1;
    });
    return Object.entries(m).sort((a, b) => b[1] - a[1]);
  };

  const total = apps.length || 1;
  const fields = ["gender", "ethnicity", "age_range", "veteran_status", "disability_status"];

  return (
    <div className="max-w-4xl mx-auto px-4 pt-6 pb-8 space-y-4">
      <div className="flex justify-end mb-2 max-w-6xl mx-auto px-4">
        <HowItWorksButton title="Diversity Reports" intro="Aggregated hiring diversity insights (employer view)." steps={HOW_STEPS_DIVERSITYREPORTS} variant="compact" />
      </div>
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-gradient-to-br from-violet-500/15 via-primary/10 to-purple-500/5 border border-violet-500/20 p-6 flex items-center gap-3">
        <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 shadow-xl"><BarChart3 className="h-6 w-6 text-white" /></div>
        <div>
          <h1 className="text-2xl font-black">Diversity Report</h1>
          <p className="text-xs text-muted-foreground">{apps.length} applicants · self-ID is voluntary</p>
        </div>
      </motion.div>

      <div className="grid sm:grid-cols-2 gap-3">
        {fields.map(f => (
          <Card key={f}><CardContent className="p-4 space-y-2">
            <p className="text-sm font-bold capitalize">{f.replace(/_/g, " ")}</p>
            {counts(f).map(([k, n]) => (
              <div key={k} className="space-y-1">
                <div className="flex justify-between text-xs"><span>{k}</span><span className="font-bold">{n} ({Math.round(n / total * 100)}%)</span></div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-violet-500 to-purple-500" style={{ width: `${n / total * 100}%` }} /></div>
              </div>
            ))}
          </CardContent></Card>
        ))}
      </div>
    </div>
  );
}
