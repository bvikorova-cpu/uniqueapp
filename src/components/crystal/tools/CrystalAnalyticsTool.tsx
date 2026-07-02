import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

const COLORS = ["#8b5cf6", "#ec4899", "#06b6d4", "#f59e0b", "#22c55e", "#ef4444", "#6366f1"];

export const CrystalAnalyticsTool = () => {
  const [readings, setReadings] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setLoading(false); return; }

      const { data: readingsData } = await (supabase as any).from("crystal_energy_readings").select("*").eq("user_id", session.user.id).order("created_at", { ascending: false }).limit(100);
      setReadings(readingsData || []);

      const { data: statsData } = await (supabase as any).from("crystal_user_stats").select("*").eq("user_id", session.user.id).maybeSingle();
      setStats(statsData);
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin" /></div>;

  // Group readings by tool type
  const toolTypeCounts: Record<string, number> = {};
  readings.forEach(r => { toolTypeCounts[r.tool_type] = (toolTypeCounts[r.tool_type] || 0) + 1; });
  const pieData = Object.entries(toolTypeCounts).map(([name, value]) => ({ name, value }));

  // Group readings by date (last 7 days)
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().split("T")[0];
    const count = readings.filter(r => r.created_at.startsWith(key)).length;
    return { date: d.toLocaleDateString("en", { weekday: "short" }), count };
  });

  return (
    <>
      <FloatingHowItWorks title={"Crystal Analytics Tool - How it works"} steps={[{ title: 'Open', desc: 'Access the Crystal Analytics Tool section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Crystal Analytics Tool.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="bg-card/80 backdrop-blur-xl border-border/50">
      <CardHeader>
        <CardTitle className="text-xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent flex items-center gap-2">
          <BarChart3 className="w-5 h-5" /> Energy Analytics
        </CardTitle>
        <p className="text-sm text-muted-foreground">Track your healing journey progress over time</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {stats && (
          <div className="grid grid-cols-4 gap-2">
            <div className="text-center p-3 rounded-xl bg-primary/5 border border-primary/20">
              <div className="text-xl font-black text-primary">{stats.total_points}</div>
              <div className="text-[10px] text-muted-foreground">Total Points</div>
            </div>
            <div className="text-center p-3 rounded-xl bg-muted/30 border border-border/30">
              <div className="text-xl font-black">{stats.total_readings}</div>
              <div className="text-[10px] text-muted-foreground">Readings</div>
            </div>
            <div className="text-center p-3 rounded-xl bg-muted/30 border border-border/30">
              <div className="text-xl font-black">{stats.total_meditations}</div>
              <div className="text-[10px] text-muted-foreground">Meditations</div>
            </div>
            <div className="text-center p-3 rounded-xl bg-muted/30 border border-border/30">
              <div className="text-xl font-black">{stats.longest_streak}</div>
              <div className="text-[10px] text-muted-foreground">Best Streak</div>
            </div>
          </div>
        )}

        {readings.length > 0 ? (
          <>
            <div>
              <h4 className="text-sm font-bold mb-3">Activity (Last 7 Days)</h4>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={last7}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            {pieData.length > 0 && (
              <div>
                <h4 className="text-sm font-bold mb-3">Tool Usage Distribution</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8">
            <BarChart3 className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm text-muted-foreground">No readings yet. Use the AI tools to start generating analytics!</p>
          </div>
        )}
      </CardContent>
    </Card>
    </>
  );
};
