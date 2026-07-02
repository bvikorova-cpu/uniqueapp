import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Flame, Calendar, TrendingUp, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from "recharts";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const CATEGORIES = [
  { name: "Pride", color: "#8b5cf6", emoji: "👑" },
  { name: "Greed", color: "#f59e0b", emoji: "💰" },
  { name: "Lust", color: "#ef4444", emoji: "❤️‍🔥" },
  { name: "Envy", color: "#22c55e", emoji: "👁️" },
  { name: "Gluttony", color: "#f97316", emoji: "🍔" },
  { name: "Wrath", color: "#dc2626", emoji: "😡" },
  { name: "Sloth", color: "#6b7280", emoji: "😴" },
  { name: "Other", color: "#a855f7", emoji: "📝" },
];

export const SinHeatmap = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [confessions, setConfessions] = useState<any[]>([]);
  const [heatmapData, setHeatmapData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [timeRange, setTimeRange] = useState<"week" | "month" | "all">("month");

  useEffect(() => {
    loadData();
  }, [timeRange]);

  const loadData = async () => {
    setLoading(true);
    try {
      let query = (supabase as any).from("confessions_public").select("*").order("created_at", { ascending: false });

      if (timeRange === "week") {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        query = query.gte("created_at", weekAgo.toISOString());
      } else if (timeRange === "month") {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        query = query.gte("created_at", monthAgo.toISOString());
      }

      const { data, error } = await query.limit(500);
      if (error) throw error;

      setConfessions(data || []);
      processData(data || []);
    } catch (error: any) {
      toast({ title: "Failed to load heatmap data", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const processData = (data: any[]) => {
    // Category distribution
    const catCounts: Record<string, number> = {};
    CATEGORIES.forEach(c => catCounts[c.name] = 0);
    data.forEach(d => {
      const cat = d.category || "Other";
      const matchedCat = CATEGORIES.find(c => c.name.toLowerCase() === cat.toLowerCase());
      if (matchedCat) catCounts[matchedCat.name]++;
      else catCounts["Other"]++;
    });
    setCategoryData(CATEGORIES.map(c => ({ name: c.name, value: catCounts[c.name], color: c.color, emoji: c.emoji })));

    // Heatmap by hour of day
    const hourCounts: Record<number, number> = {};
    for (let i = 0; i < 24; i++) hourCounts[i] = 0;
    data.forEach(d => {
      const hour = new Date(d.created_at).getHours();
      hourCounts[hour]++;
    });
    setHeatmapData(Object.entries(hourCounts).map(([hour, count]) => ({
      hour: `${hour}:00`,
      confessions: count,
    })));

    // Weekly trend
    const dayMap: Record<string, number> = {};
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      dayMap[d.toISOString().split("T")[0]] = 0;
    }
    data.forEach(d => {
      const day = d.created_at.split("T")[0];
      if (dayMap[day] !== undefined) dayMap[day]++;
    });
    setWeeklyData(Object.entries(dayMap).map(([date, count]) => ({
      date: new Date(date).toLocaleDateString("en", { weekday: "short" }),
      confessions: count,
    })));
  };

  if (loading) {
    return (
      <>
        <FloatingHowItWorks
          title='Sin Heatmap'
          steps={[
          { title: 'Open the tool', desc: 'Launch the Sin Heatmap panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
        />
      <Card className="p-12 text-center bg-card/80 backdrop-blur-xl border-border/50">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <p className="text-sm text-muted-foreground mt-2">Loading heatmap data...</p>
      </Card>
      </>
    );
  }

  const maxCategory = categoryData.reduce((max, c) => c.value > max.value ? c : max, { name: "", value: 0, color: "", emoji: "" });

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-card/80 backdrop-blur-xl border-border/50">
        <h3 className="text-lg font-black mb-2">🔥 Community Sin Heatmap</h3>
        <p className="text-sm text-muted-foreground">
          Visualize community-wide confession patterns, sin categories, and activity trends in real-time.
        </p>
      </Card>

      {/* Time Range Filter */}
      <div className="flex gap-2">
        {(["week", "month", "all"] as const).map(range => (
          <Button
            key={range}
            variant={timeRange === range ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange(range)}
          >
            {range === "week" ? "This Week" : range === "month" ? "This Month" : "All Time"}
          </Button>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Confessions", value: confessions.length, icon: BarChart3 },
          { label: "Most Common Sin", value: maxCategory.emoji + " " + maxCategory.name, icon: Flame },
          { label: "Unique Categories", value: categoryData.filter(c => c.value > 0).length, icon: TrendingUp },
          { label: "Peak Hour", value: heatmapData.reduce((max, h) => h.confessions > max.confessions ? h : max, { hour: "N/A", confessions: 0 }).hour, icon: Calendar },
        ].map((s, i) => (
          <Card key={i} className="p-3 bg-card/80 border-border/50 text-center">
            <s.icon className="w-5 h-5 mx-auto text-primary mb-1" />
            <p className="text-lg font-black">{s.value}</p>
            <p className="text-[10px] text-muted-foreground">{s.label}</p>
          </Card>
        ))}
      </div>

      {/* Sin Category Distribution - Pie Chart */}
      <Card className="p-5 bg-card/80 backdrop-blur-xl border-border/50">
        <h4 className="font-black text-sm mb-4">Sin Category Distribution</h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData.filter(c => c.value > 0)}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={90}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {categoryData.filter(c => c.value > 0).map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {categoryData.map((c, i) => (
            <Badge key={i} variant="secondary" className="text-[10px] gap-1">
              <span>{c.emoji}</span> {c.name}: {c.value}
            </Badge>
          ))}
        </div>
      </Card>

      {/* Hourly Activity Heatmap */}
      <Card className="p-5 bg-card/80 backdrop-blur-xl border-border/50">
        <h4 className="font-black text-sm mb-4">Confession Activity by Hour</h4>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={heatmapData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis dataKey="hour" tick={{ fontSize: 10 }} interval={3} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="confessions" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Weekly Trend */}
      <Card className="p-5 bg-card/80 backdrop-blur-xl border-border/50">
        <h4 className="font-black text-sm mb-4">7-Day Confession Trend</h4>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Area type="monotone" dataKey="confessions" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Visual Heatmap Grid */}
      <Card className="p-5 bg-card/80 backdrop-blur-xl border-border/50">
        <h4 className="font-black text-sm mb-4">Hourly Heatmap Grid</h4>
        <div className="grid grid-cols-6 sm:grid-cols-8 gap-1.5">
          {heatmapData.map((h, i) => {
            const max = Math.max(...heatmapData.map(d => d.confessions), 1);
            const intensity = h.confessions / max;
            return (
              <motion.div
                key={i}
                className="aspect-square rounded-lg flex flex-col items-center justify-center text-[9px] font-mono cursor-default"
                style={{
                  backgroundColor: `rgba(139, 92, 246, ${0.1 + intensity * 0.8})`,
                  color: intensity > 0.5 ? "white" : "inherit",
                }}
                whileHover={{ scale: 1.2 }}
                title={`${h.hour}: ${h.confessions} confessions`}
              >
                <span className="font-bold">{h.confessions}</span>
                <span className="opacity-70">{h.hour}</span>
              </motion.div>
            );
          })}
        </div>
        <p className="text-[10px] text-muted-foreground mt-2 text-center">
          Darker = more confessions at that hour
        </p>
      </Card>
    </div>
  );
};
