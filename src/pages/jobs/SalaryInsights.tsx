import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DollarSign, Loader2, TrendingUp, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { SEO } from "@/components/SEO";
import { SalaryDialog } from "@/components/jobs/SalaryDialog";

import { HowItWorksButton } from "@/components/common/HowItWorksButton";

const HOW_STEPS_SALARYINSIGHTS = [
  { title: "Pick a job title", desc: "Search or select from popular roles." },
  { title: "Choose location + seniority", desc: "Filter by country/city and Junior/Mid/Senior/Lead." },
  { title: "Read the range", desc: "You see min, median and max EUR salary based on Unique data + market sources." },
  { title: "Compare roles", desc: "Add multiple titles to a comparison to help negotiate your next offer." },
];

export default function SalaryInsights() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    let query = supabase.from("salary_reports").select("*").order("created_at", { ascending: false }).limit(200);
    if (q.trim()) query = query.ilike("job_title", `%${q.trim()}%`);
    const { data } = await query;
    setItems(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const grouped = useMemo(() => {
    const g: Record<string, any[]> = {};
    items.forEach(i => { (g[i.job_title] ??= []).push(i); });
    return Object.entries(g).map(([title, rows]) => {
      const arr = rows.map(r => Number(r.base_salary || 0)).sort((a, b) => a - b);
      const avg = Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
      const median = arr[Math.floor(arr.length / 2)];
      return { title, count: rows.length, avg, median, min: arr[0], max: arr[arr.length - 1] };
    }).sort((a, b) => b.count - a.count);
  }, [items]);

  return (
    <div className="max-w-5xl mx-auto px-4 pt-6 pb-8 space-y-6">
      <SEO title="Salary Insights" description="Real salary data shared by employees across roles and companies." />
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/15 via-primary/5 to-pink-500/10 border border-primary/20 p-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-primary to-pink-500 shadow-xl shadow-primary/30">
              <DollarSign className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black">Salary Insights</h1>
              <p className="text-sm text-muted-foreground">{items.length} anonymous reports</p>
            </div>
          </div>
          <Button onClick={() => setOpen(true)} className="gap-2"><Plus className="h-4 w-4" />Add salary</Button>
        </div>
      </motion.div>

      <div className="flex gap-2">
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter by job title..." onKeyDown={e => e.key === "Enter" && load()} />
        <Button variant="secondary" onClick={load}>Filter</Button>
      </div>

      {loading ? <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div> :
        grouped.length === 0 ? <Card className="border-dashed border-2"><CardContent className="py-16 text-center text-muted-foreground">No salary data yet.</CardContent></Card> :
        <div className="grid sm:grid-cols-2 gap-3">
          {grouped.map(g => (
            <Card key={g.title}><CardContent className="p-4">
              <div className="flex justify-between gap-2 items-start">
                <div>
                  <h3 className="font-bold">{g.title}</h3>
                  <p className="text-xs text-muted-foreground">{g.count} reports</p>
                </div>
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
              <div className="mt-3 grid grid-cols-3 text-center text-sm">
                <div><p className="text-xs text-muted-foreground">Min</p><p className="font-semibold">€{g.min.toLocaleString()}</p></div>
                <div><p className="text-xs text-muted-foreground">Median</p><p className="font-bold text-primary">€{g.median.toLocaleString()}</p></div>
                <div><p className="text-xs text-muted-foreground">Max</p><p className="font-semibold">€{g.max.toLocaleString()}</p></div>
              </div>
            </CardContent></Card>
          ))}
        </div>
      }

      <SalaryDialog open={open} onOpenChange={setOpen} onSubmitted={load} />
    </div>
  );
}
