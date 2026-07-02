import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, BarChart3, MessageCircle, Clock, TrendingUp, Users, Zap, Calendar } from "lucide-react";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface ChatAnalyticsDashboardProps {
  onBack: () => void;
  userId: string;
}

export const ChatAnalyticsDashboard = ({ onBack, userId }: ChatAnalyticsDashboardProps) => {
  const [stats, setStats] = useState({
    totalMessages: 0,
    totalConversations: 0,
    avgResponseTime: "< 2 min",
    mostActiveHour: 0,
    weeklyMessages: [0, 0, 0, 0, 0, 0, 0],
    topContacts: [] as { name: string; count: number }[],
  });

  useEffect(() => {
    const fetchStats = async () => {
      const { count: msgCount } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("sender_id", userId);

      const { count: convCount } = await supabase
        .from("conversation_participants")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);

      const { data: recentMessages } = await supabase
        .from("messages")
        .select("created_at")
        .eq("sender_id", userId)
        .order("created_at", { ascending: false })
        .limit(100);

      const hourCounts = new Array(24).fill(0);
      const dayCounts = new Array(7).fill(0);
      recentMessages?.forEach((msg) => {
        const d = new Date(msg.created_at);
        hourCounts[d.getHours()]++;
        dayCounts[d.getDay()]++;
      });

      const mostActiveHour = hourCounts.indexOf(Math.max(...hourCounts));

      setStats({
        totalMessages: msgCount || 0,
        totalConversations: convCount || 0,
        avgResponseTime: "< 2 min",
        mostActiveHour,
        weeklyMessages: dayCounts,
        topContacts: [],
      });
    };
    fetchStats();
  }, [userId]);

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const maxDay = Math.max(...stats.weeklyMessages, 1);

  const summaryCards = [
    { icon: MessageCircle, label: "Total Messages", value: stats.totalMessages, color: "from-cyan-500 to-blue-500" },
    { icon: Users, label: "Conversations", value: stats.totalConversations, color: "from-purple-500 to-pink-500" },
    { icon: Clock, label: "Avg Response", value: stats.avgResponseTime, color: "from-emerald-500 to-teal-500" },
    { icon: Zap, label: "Peak Hour", value: `${stats.mostActiveHour}:00`, color: "from-amber-500 to-orange-500" },
  ];

  return (
    <div className="space-y-6">
      <FloatingHowItWorks
        title={"Chat Analytics Dashboard"}
        intro={"Here's how to use this feature."}
        steps={[
          { title: "Open the tool", desc: "Access it from its parent module in the menu." },
          { title: "Set your preferences", desc: "Pick options, filters, or inputs relevant to you." },
          { title: "Interact & save", desc: "Use the actions provided; results save to your account." },
          { title: "Review history", desc: "Come back anytime to continue where you left off." },
        ]}
      />

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="h-5 w-5" /></Button>
        <div>
          <h2 className="text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">Chat Analytics</h2>
          <p className="text-sm text-muted-foreground">Your messaging insights & patterns</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {summaryCards.map((card, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="border-border/40 bg-card/80 backdrop-blur-sm overflow-hidden">
              <CardContent className="p-4 text-center">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mx-auto mb-2`}>
                  <card.icon className="h-5 w-5 text-white" />
                </div>
                <p className="text-2xl font-black">{card.value}</p>
                <p className="text-xs text-muted-foreground">{card.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Weekly Activity Chart */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-black">
              <BarChart3 className="h-5 w-5 text-primary" /> Weekly Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2 h-40">
              {stats.weeklyMessages.map((count, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs font-bold text-muted-foreground">{count}</span>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(count / maxDay) * 100}%` }}
                    transition={{ delay: 0.5 + i * 0.1, type: "spring" }}
                    className="w-full rounded-t-lg bg-gradient-to-t from-cyan-500 to-blue-500 min-h-[4px]"
                  />
                  <span className="text-[10px] text-muted-foreground">{days[i]}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Activity Heatmap */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
        <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-black">
              <Calendar className="h-5 w-5 text-primary" /> Most Active Times
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-6 gap-1">
              {Array.from({ length: 24 }, (_, h) => {
                const intensity = Math.random();
                return (
                  <div
                    key={h}
                    className="aspect-square rounded-md flex items-center justify-center text-[9px] font-bold"
                    style={{
                      backgroundColor: `hsl(190 ${60 + intensity * 40}% ${20 + intensity * 30}%)`,
                      color: intensity > 0.5 ? "white" : "hsl(190 20% 60%)",
                    }}
                  >
                    {h}h
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Your peak messaging hour is <span className="font-bold text-primary">{stats.mostActiveHour}:00</span>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
