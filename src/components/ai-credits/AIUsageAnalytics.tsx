import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Activity, Image as ImageIcon, Wand2, Brush, Cpu, Sparkles, TrendingUp } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface DayBucket { day: string; credits: number; }

const TYPE_META: Record<string, { label: string; icon: any; color: string }> = {
  image_generation: { label: "Image generation", icon: ImageIcon, color: "text-cyan-400" },
  custom_generation: { label: "Custom generation", icon: Sparkles, color: "text-purple-400" },
  effect: { label: "Style transfer", icon: Brush, color: "text-pink-400" },
  avatar: { label: "Avatar", icon: Cpu, color: "text-amber-400" },
  course: { label: "AI mentor", icon: Wand2, color: "text-emerald-400" },
};

/**
 * Last-30-days usage chart + breakdown by tool.
 */
export const AIUsageAnalytics = () => {
  const [days, setDays] = useState<DayBucket[]>([]);
  const [breakdown, setBreakdown] = useState<{ type: string; total: number }[]>([]);
  const [total30d, setTotal30d] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const { data } = await supabase
        .from("ai_usage_history")
        .select("usage_type, credits_used, created_at")
        .eq("user_id", user.id)
        .gte("created_at", since.toISOString())
        .order("created_at", { ascending: true });

      if (cancelled) return;
      const rows = data ?? [];

      // Daily buckets
      const buckets = new Map<string, number>();
      for (let i = 29; i >= 0; i--) {
        const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
        buckets.set(d.toISOString().slice(0, 10), 0);
      }
      let sum = 0;
      const byType = new Map<string, number>();
      for (const r of rows as any[]) {
        const day = (r.created_at as string).slice(0, 10);
        if (buckets.has(day)) buckets.set(day, (buckets.get(day) || 0) + (r.credits_used || 0));
        sum += r.credits_used || 0;
        byType.set(r.usage_type, (byType.get(r.usage_type) || 0) + (r.credits_used || 0));
      }
      setDays([...buckets.entries()].map(([day, credits]) => ({ day, credits })));
      setBreakdown([...byType.entries()].map(([type, total]) => ({ type, total })).sort((a, b) => b.total - a.total));
      setTotal30d(sum);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const max = Math.max(1, ...days.map(d => d.credits));
  const breakdownTotal = Math.max(1, breakdown.reduce((s, b) => s + b.total, 0));

  return (
    <Card className="p-5 sm:p-6 bg-card/80 backdrop-blur-xl border-border/50">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="h-4 w-4 text-primary" />
        <h3 className="font-black text-lg">Your AI usage</h3>
        <span className="ml-auto text-xs text-muted-foreground">Last 30 days</span>
      </div>

      <div className="grid sm:grid-cols-3 gap-3 mb-6">
        <div className="rounded-xl p-3 bg-primary/10 border border-primary/30">
          <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Credits used</p>
          <p className="text-2xl font-black text-foreground">{loading ? "—" : total30d}</p>
        </div>
        <div className="rounded-xl p-3 bg-purple-500/10 border border-purple-500/30">
          <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Avg / day</p>
          <p className="text-2xl font-black text-foreground">{loading ? "—" : (total30d / 30).toFixed(1)}</p>
        </div>
        <div className="rounded-xl p-3 bg-cyan-500/10 border border-cyan-500/30">
          <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Top tool</p>
          <p className="text-base font-black text-foreground truncate">
            {loading ? "—" : breakdown[0] ? (TYPE_META[breakdown[0].type]?.label ?? breakdown[0].type) : "—"}
          </p>
        </div>
      </div>

      {/* Spark bars */}
      <div className="mb-6">
        <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mb-2">Daily spend</p>
        <div className="flex items-end gap-[3px] h-24">
          {days.map((d, i) => (
            <motion.div
              key={d.day}
              initial={{ height: 0 }}
              animate={{ height: `${(d.credits / max) * 100}%` }}
              transition={{ delay: i * 0.01, duration: 0.4 }}
              className={`flex-1 rounded-t ${d.credits === 0 ? "bg-muted/30" : "bg-gradient-to-t from-primary to-purple-400"}`}
              title={`${d.day}: ${d.credits} cr`}
            />
          ))}
        </div>
      </div>

      {/* Breakdown */}
      <div>
        <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mb-2">By tool</p>
        {breakdown.length === 0 && !loading && (
          <p className="text-sm text-muted-foreground py-4 text-center">
            No AI usage yet — start generating to see your stats.
          </p>
        )}
        <div className="space-y-2">
          {breakdown.slice(0, 5).map(b => {
            const meta = TYPE_META[b.type] ?? { label: b.type, icon: TrendingUp, color: "text-foreground" };
            const Icon = meta.icon;
            const pct = Math.round((b.total / breakdownTotal) * 100);
            return (
              <div key={b.type} className="flex items-center gap-3">
                <Icon className={`h-4 w-4 shrink-0 ${meta.color}`} />
                <span className="text-sm font-medium flex-1 truncate">{meta.label}</span>
                <div className="w-24 sm:w-40 h-2 rounded-full bg-muted/40 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary to-purple-400" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-xs font-black text-foreground w-12 text-right tabular-nums">{b.total} cr</span>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};
