import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, TrendingUp, TrendingDown, BarChart3, PieChart, Calendar, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RePieChart, Pie, Cell, Legend, Area, AreaChart } from "recharts";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface ReadingData {
  id: string;
  era: string;
  reading_type: string;
  created_at: string;
  karmic_lesson: string;
  location: string;
}

export const KarmicAnalytics = () => {
  const { toast } = useToast();
  const [readings, setReadings] = useState<ReadingData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data } = await supabase
        .from("past_life_readings")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      if (data) {
        setReadings(data.map((r: any) => ({
          id: r.id,
          era: r.era || "Unknown",
          reading_type: r.reading_type || "standard",
          created_at: r.created_at,
          karmic_lesson: (r.reading_result as any)?.karmic_lesson || "Growth",
          location: (r.reading_result as any)?.location || "Unknown",
        })));
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Compute analytics
  const eraDistribution = readings.reduce((acc, r) => {
    acc[r.era] = (acc[r.era] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const eraChartData = Object.entries(eraDistribution)
    .map(([era, count]) => ({ era: era.length > 15 ? era.substring(0, 15) + "..." : era, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const karmicThemes = readings.reduce((acc, r) => {
    acc[r.karmic_lesson] = (acc[r.karmic_lesson] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const karmicPieData = Object.entries(karmicThemes)
    .map(([name, value]) => ({ name: name.length > 20 ? name.substring(0, 20) + "..." : name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  const COLORS = ["hsl(var(--primary))", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#06b6d4"];

  // Activity over time (by month)
  const activityByMonth = readings.reduce((acc, r) => {
    const date = new Date(r.created_at);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const activityChartData = Object.entries(activityByMonth)
    .map(([month, count]) => ({ month, readings: count }))
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-12);

  // Location distribution
  const locationDistribution = readings.reduce((acc, r) => {
    acc[r.location] = (acc[r.location] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const locationData = Object.entries(locationDistribution)
    .map(([location, count]) => ({ location: location.length > 12 ? location.substring(0, 12) + "..." : location, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  // Reading type distribution
  const typeDistribution = readings.reduce((acc, r) => {
    const label = r.reading_type.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
    acc[label] = (acc[label] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const typeData = Object.entries(typeDistribution)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // Karmic balance score (simulated from data patterns)
  const balanceScore = Math.min(100, Math.round((readings.length * 7.5) + (Object.keys(karmicThemes).length * 12)));
  const trend = readings.length > 3 ? "positive" : readings.length > 0 ? "neutral" : "none";

  if (loading) {
    return (
      <>
        <FloatingHowItWorks
          title='Karmic Analytics'
          steps={[
          { title: 'Open the tool', desc: 'Launch the Karmic Analytics panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
        />
      <Card className="p-12 text-center bg-card/80 backdrop-blur-xl border-border/50">
        <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" />
      </Card>
      </>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-card/80 backdrop-blur-xl border-border/50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black mb-2">Karmic Analytics</h3>
            <p className="text-sm text-muted-foreground">
              Deep analysis of your spiritual journey patterns, karmic trends, and soul evolution metrics.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={loadAnalytics} className="gap-2">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
        </div>
      </Card>

      {readings.length === 0 ? (
        <Card className="p-8 text-center bg-card/80 backdrop-blur-xl border-border/50">
          <BarChart3 className="h-12 w-12 mx-auto text-primary/30 mb-3" />
          <p className="text-muted-foreground mb-1">No data to analyze yet</p>
          <p className="text-xs text-muted-foreground">Complete past life readings to see your karmic analytics</p>
        </Card>
      ) : (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Total Readings", value: readings.length, icon: BarChart3, color: "text-primary" },
              { label: "Eras Explored", value: Object.keys(eraDistribution).length, icon: Calendar, color: "text-violet-500" },
              { label: "Karmic Themes", value: Object.keys(karmicThemes).length, icon: PieChart, color: "text-pink-500" },
              { label: "Balance Score", value: `${balanceScore}%`, icon: trend === "positive" ? TrendingUp : TrendingDown, color: trend === "positive" ? "text-emerald-500" : "text-amber-500" },
            ].map((stat, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Card className="p-4 bg-card/80 backdrop-blur-xl border-border/50">
                  <stat.icon className={`h-5 w-5 ${stat.color} mb-2`} />
                  <p className="text-2xl font-black">{stat.value}</p>
                  <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Activity Over Time */}
            {activityChartData.length > 1 && (
              <Card className="p-5 bg-card/80 backdrop-blur-xl border-border/50">
                <h4 className="font-bold text-sm mb-4 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" /> Reading Activity Over Time
                </h4>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={activityChartData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Area type="monotone" dataKey="readings" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>
            )}

            {/* Era Distribution */}
            <Card className="p-5 bg-card/80 backdrop-blur-xl border-border/50">
              <h4 className="font-bold text-sm mb-4 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-violet-500" /> Lives by Era
              </h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={eraChartData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
                  <XAxis dataKey="era" tick={{ fontSize: 9 }} angle={-30} textAnchor="end" height={60} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Karmic Themes Pie */}
            <Card className="p-5 bg-card/80 backdrop-blur-xl border-border/50">
              <h4 className="font-bold text-sm mb-4 flex items-center gap-2">
                <PieChart className="h-4 w-4 text-pink-500" /> Karmic Theme Distribution
              </h4>
              <ResponsiveContainer width="100%" height={200}>
                <RePieChart>
                  <Pie data={karmicPieData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" label={({ name }) => name}>
                    {karmicPieData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RePieChart>
              </ResponsiveContainer>
            </Card>

            {/* Location Distribution */}
            <Card className="p-5 bg-card/80 backdrop-blur-xl border-border/50">
              <h4 className="font-bold text-sm mb-4 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-cyan-500" /> Lives by Location
              </h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={locationData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
                  <XAxis type="number" tick={{ fontSize: 10 }} />
                  <YAxis dataKey="location" type="category" tick={{ fontSize: 9 }} width={90} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#06b6d4" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Reading Types */}
          <Card className="p-5 bg-card/80 backdrop-blur-xl border-border/50">
            <h4 className="font-bold text-sm mb-4">Reading Type Breakdown</h4>
            <div className="flex flex-wrap gap-2">
              {typeData.map((t, i) => (
                <Badge key={i} variant="outline" className="text-xs py-1.5 px-3">
                  {t.name} <span className="ml-1.5 font-black text-primary">{t.value}</span>
                </Badge>
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  );
};
