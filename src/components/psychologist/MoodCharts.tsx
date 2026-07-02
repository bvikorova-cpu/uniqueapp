import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, TrendingUp, Calendar, BarChart3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, CartesianGrid } from "recharts";
import { format, subDays, startOfDay, eachDayOfInterval } from "date-fns";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Props { onBack: () => void; }

type TimeRange = "7d" | "30d" | "90d";

export const MoodCharts = ({ onBack }: Props) => {
  const [entries, setEntries] = useState<any[]>([]);
  const [range, setRange] = useState<TimeRange>("30d");
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadEntries(); }, [range]);

  const loadEntries = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const days = range === "7d" ? 7 : range === "30d" ? 30 : 90;
    const since = subDays(new Date(), days).toISOString();

    const { data } = await (supabase as any).from("psychology_mood_entries")
      .select("*").eq("user_id", user.id)
      .gte("created_at", since)
      .order("created_at", { ascending: true });

    setEntries(data || []);
    setLoading(false);
  };

  const days = range === "7d" ? 7 : range === "30d" ? 30 : 90;
  const interval = eachDayOfInterval({ start: subDays(new Date(), days), end: new Date() });

  const dailyData = interval.map(day => {
    const dayStr = format(day, "yyyy-MM-dd");
    const dayEntries = entries.filter(e => format(new Date(e.created_at), "yyyy-MM-dd") === dayStr);
    const avg = dayEntries.length > 0
      ? Math.round((dayEntries.reduce((s: number, e: any) => s + e.mood_score, 0) / dayEntries.length) * 10) / 10
      : null;
    return { date: format(day, "MMM dd"), avg, count: dayEntries.length };
  });

  // Tag frequency
  const tagCounts: Record<string, number> = {};
  entries.forEach(e => {
    (e.tags || []).forEach((t: string) => { tagCounts[t] = (tagCounts[t] || 0) + 1; });
  });
  const tagData = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([tag, count]) => ({ tag, count }));

  const avgMood = entries.length > 0
    ? (entries.reduce((s, e) => s + e.mood_score, 0) / entries.length).toFixed(1)
    : "—";

  const bestDay = dailyData.filter(d => d.avg !== null).sort((a, b) => (b.avg || 0) - (a.avg || 0))[0];
  const streak = (() => {
    let count = 0;
    for (let i = dailyData.length - 1; i >= 0; i--) {
      if (dailyData[i].count > 0) count++;
      else break;
    }
    return count;
  })();

  return (
    <>
      <FloatingHowItWorks title={"Mood Charts - How it works"} steps={[{ title: 'Open', desc: 'Access the Mood Charts section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Mood Charts.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2">
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-3xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent mb-2">
          Mood Trends & Charts
        </h2>
        <p className="text-muted-foreground">Visualize your emotional patterns over time to gain deeper self-awareness.</p>
      </motion.div>

      {/* Time Range */}
      <div className="flex gap-2">
        {(["7d", "30d", "90d"] as TimeRange[]).map(r => (
          <Button key={r} variant={range === r ? "default" : "outline"} size="sm" onClick={() => setRange(r)}>
            {r === "7d" ? "7 Days" : r === "30d" ? "30 Days" : "90 Days"}
          </Button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Entries", value: entries.length, icon: Calendar },
          { label: "Avg Mood", value: avgMood, icon: TrendingUp },
          { label: "Streak", value: `${streak}d`, icon: BarChart3 },
          { label: "Best Day", value: bestDay?.date || "—", icon: TrendingUp },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
            <Card className="p-4 text-center bg-card/50 backdrop-blur-sm border-border/50">
              <s.icon className="h-4 w-4 text-primary mx-auto mb-1" />
              <p className="text-xl font-black text-foreground">{s.value}</p>
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Mood Trend Line */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" /> Mood Over Time
          </h3>
          {entries.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No mood data yet. Start logging your mood to see trends!</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={dailyData.filter(d => d.avg !== null)}>
                <defs>
                  <linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" fontSize={11} tick={{ fill: "hsl(var(--muted-foreground))" }} />
                <YAxis domain={[1, 10]} fontSize={11} tick={{ fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                />
                <Area type="monotone" dataKey="avg" stroke="hsl(var(--primary))" fill="url(#moodGrad)" strokeWidth={2} name="Avg Mood" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </Card>
      </motion.div>

      {/* Daily Entry Count */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" /> Daily Entries
          </h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" fontSize={10} tick={{ fill: "hsl(var(--muted-foreground))" }} interval={Math.floor(dailyData.length / 7)} />
              <YAxis fontSize={11} tick={{ fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Entries" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </motion.div>

      {/* Tag Distribution */}
      {tagData.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" /> Most Frequent Tags
            </h3>
            <div className="space-y-2">
              {tagData.map((t, i) => {
                const maxCount = tagData[0].count;
                return (
                  <div key={t.tag} className="flex items-center gap-3">
                    <span className="text-sm font-medium w-20 text-right">{t.tag}</span>
                    <div className="flex-1 bg-muted rounded-full h-5 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(t.count / maxCount) * 100}%` }}
                        transition={{ delay: 0.5 + i * 0.05, duration: 0.5 }}
                        className="h-full bg-primary/60 rounded-full flex items-center justify-end pr-2"
                      >
                        <span className="text-[10px] text-primary-foreground font-bold">{t.count}</span>
                      </motion.div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </motion.div>
      )}
    </div>
    </>
  );
};
