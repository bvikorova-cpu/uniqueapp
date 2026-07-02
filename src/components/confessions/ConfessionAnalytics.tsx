import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, BarChart3, TrendingUp, PieChart, Calendar, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import {
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RePieChart, Pie, Cell, AreaChart, Area
} from "recharts";

export const ConfessionAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [confessions, setConfessions] = useState<any[]>([]);
  const [votes, setVotes] = useState<any[]>([]);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const [confRes, voteRes] = await Promise.all([
        (supabase as any).from("confessions_public").select("*").order("created_at", { ascending: true }).limit(500),
        supabase.from("absolution_votes").select("*").limit(500),
      ]);

      if (confRes.data) setConfessions(confRes.data);
      if (voteRes.data) setVotes(voteRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ["hsl(var(--primary))", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#06b6d4"];

  // Category distribution
  const categoryDist = confessions.reduce((acc, c) => {
    const cat = c.sin_category || "Unknown";
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categoryData = Object.entries(categoryDist)
    .map(([name, value]) => ({ name: name.length > 15 ? name.substring(0, 15) + "..." : name, value }))
    .sort((a, b) => (b.value as number) - (a.value as number))
    .slice(0, 8);

  // Vote distribution
  const absolveCount = votes.filter(v => v.vote_type === "absolve").length;
  const condemnCount = votes.filter(v => v.vote_type === "condemn").length;
  const voteData = [
    { name: "Absolve", value: absolveCount },
    { name: "Condemn", value: condemnCount },
  ].filter(d => d.value > 0);

  // Activity over time
  const activityByMonth = confessions.reduce((acc, c) => {
    const d = new Date(c.created_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const activityData = Object.entries(activityByMonth)
    .map(([month, count]) => ({ month, confessions: count }))
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-12);

  // Severity distribution
  const severityDist = confessions.reduce((acc, c) => {
    const sev = c.severity_score != null ? (c.severity_score <= 3 ? "Low" : c.severity_score <= 6 ? "Medium" : "High") : "Unknown";
    acc[sev] = (acc[sev] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const severityData = Object.entries(severityDist)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => (b.value as number) - (a.value as number));

  if (loading) {
    return <Card className="p-12 text-center bg-card/80 backdrop-blur-xl border-border/50"><Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" /></Card>;
  }

  return (
    <>
      <FloatingHowItWorks
        title='Confession Analytics'
        steps={[
          { title: 'Open the tool', desc: 'Launch the Confession Analytics panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
      />
    <div className="space-y-6">
      <Card className="p-6 bg-card/80 backdrop-blur-xl border-border/50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black mb-2">Confession Analytics</h3>
            <p className="text-sm text-muted-foreground">
              Deep analysis of community confession patterns, voting trends, and spiritual growth metrics.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={loadData} className="gap-2">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
        </div>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Confessions", value: confessions.length, icon: BarChart3, color: "text-primary" },
          { label: "Total Votes", value: votes.length, icon: TrendingUp, color: "text-violet-500" },
          { label: "Categories", value: Object.keys(categoryDist).length, icon: PieChart, color: "text-pink-500" },
          { label: "Absolution Rate", value: votes.length > 0 ? `${Math.round((absolveCount / votes.length) * 100)}%` : "—", icon: Calendar, color: "text-emerald-500" },
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {activityData.length > 1 && (
          <Card className="p-5 bg-card/80 backdrop-blur-xl border-border/50">
            <h4 className="font-bold text-sm mb-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" /> Confessions Over Time
            </h4>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Area type="monotone" dataKey="confessions" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        )}

        {categoryData.length > 0 && (
          <Card className="p-5 bg-card/80 backdrop-blur-xl border-border/50">
            <h4 className="font-bold text-sm mb-4 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-violet-500" /> Sin Categories
            </h4>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
                <XAxis dataKey="name" tick={{ fontSize: 9 }} angle={-30} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}

        {voteData.length > 0 && (
          <Card className="p-5 bg-card/80 backdrop-blur-xl border-border/50">
            <h4 className="font-bold text-sm mb-4 flex items-center gap-2">
              <PieChart className="h-4 w-4 text-pink-500" /> Vote Distribution
            </h4>
            <ResponsiveContainer width="100%" height={200}>
              <RePieChart>
                <Pie data={voteData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" label={({ name }) => name}>
                  {voteData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </RePieChart>
            </ResponsiveContainer>
          </Card>
        )}

        {severityData.length > 0 && (
          <Card className="p-5 bg-card/80 backdrop-blur-xl border-border/50">
            <h4 className="font-bold text-sm mb-4">Severity Breakdown</h4>
            <div className="flex flex-wrap gap-2">
              {severityData.map((s, i) => (
                <Badge key={i} variant="outline" className="text-xs py-1.5 px-3">
                  {s.name} <span className="ml-1.5 font-black text-primary">{s.value as number}</span>
                </Badge>
              ))}
            </div>
          </Card>
        )}
      </div>

      {confessions.length === 0 && (
        <Card className="p-8 text-center bg-card/80 backdrop-blur-xl border-border/50">
          <BarChart3 className="h-12 w-12 mx-auto text-primary/30 mb-3" />
          <p className="text-muted-foreground mb-1">No data to analyze yet</p>
          <p className="text-xs text-muted-foreground">Community confessions will appear here once posted</p>
        </Card>
      )}
    </div>
    </>
  );
};
