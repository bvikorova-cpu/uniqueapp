import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { BarChart3, Loader2, TrendingDown, Brain } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const COLORS = ["#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"];

export const FearAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [phobiaData, setPhobiaData] = useState<any[]>([]);
  const [journalData, setJournalData] = useState<any[]>([]);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Get journal entries for trend data
      const { data: journals } = await supabase
        .from("ai_generated_content")
        .select("created_at, metadata")
        .eq("user_id", session.user.id)
        .eq("content_type", "social_post")
        .like("title", "fear_journal_%")
        .order("created_at", { ascending: true })
        .limit(30);

      if (journals) {
        const trendData = journals.map((j, i) => ({
          day: i + 1,
          level: (j.metadata as any)?.fear_level || 5,
        }));
        setJournalData(trendData);
      }

      // Mock phobia category distribution (would come from user_phobias in production)
      setPhobiaData([
        { name: "Arachnophobia", value: 35 },
        { name: "Acrophobia", value: 25 },
        { name: "Social Anxiety", value: 20 },
        { name: "Claustrophobia", value: 12 },
        { name: "Other", value: 8 },
      ]);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-cyan-400" /></div>;

  const weeklyActivity = [
    { day: "Mon", sessions: 3 }, { day: "Tue", sessions: 5 },
    { day: "Wed", sessions: 2 }, { day: "Thu", sessions: 7 },
    { day: "Fri", sessions: 4 }, { day: "Sat", sessions: 6 },
    { day: "Sun", sessions: 1 },
  ];

  return (
    <>
      <FloatingHowItWorks title={"Fear Analytics - How it works"} steps={[{ title: 'Open', desc: 'Access the Fear Analytics section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Fear Analytics.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Fears Tracked", value: phobiaData.length, icon: Brain, color: "text-cyan-400" },
          { label: "Journal Entries", value: journalData.length, icon: BarChart3, color: "text-blue-400" },
          { label: "Avg Fear Level", value: journalData.length ? (journalData.reduce((a, b) => a + b.level, 0) / journalData.length).toFixed(1) : "0", icon: TrendingDown, color: "text-purple-400" },
          { label: "Days Active", value: new Set(journalData.map((_, i) => i)).size, icon: BarChart3, color: "text-green-400" },
        ].map(stat => (
          <Card key={stat.label} className="p-4 bg-card/80 backdrop-blur-xl border-border/50 text-center">
            <stat.icon className={`h-5 w-5 mx-auto mb-1 ${stat.color}`} />
            <p className="text-xl font-black">{stat.value}</p>
            <p className="text-[10px] text-muted-foreground">{stat.label}</p>
          </Card>
        ))}
      </div>

      <Card className="p-4 bg-card/80 backdrop-blur-xl border-border/50">
        <h3 className="font-bold text-sm mb-3">Fear Level Trend</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={journalData.length > 0 ? journalData : [{ day: 1, level: 5 }]}>
            <XAxis dataKey="day" tick={{ fontSize: 10 }} />
            <YAxis domain={[0, 10]} tick={{ fontSize: 10 }} />
            <Tooltip />
            <Line type="monotone" dataKey="level" stroke="#06b6d4" strokeWidth={2} dot={{ fill: "#06b6d4", r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="p-4 bg-card/80 backdrop-blur-xl border-border/50">
          <h3 className="font-bold text-sm mb-3">Phobia Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={phobiaData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name }) => name}>
                {phobiaData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-4 bg-card/80 backdrop-blur-xl border-border/50">
          <h3 className="font-bold text-sm mb-3">Weekly Activity</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyActivity}>
              <XAxis dataKey="day" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="sessions" fill="#06b6d4" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
    </>
  );
};
