import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, BarChart3, MessageCircle, Clock, TrendingUp, Users, Zap, Calendar } from "lucide-react";
interface ChatAnalyticsDashboardProps {
  onBack: () => void;
  userId: string;
}

export const ChatAnalyticsDashboard = ({ onBack, userId }: ChatAnalyticsDashboardProps) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalMessages: 0,
    totalConversations: 0,
    avgResponseTime: "—",
    mostActiveHour: 0,
    weeklyMessages: [0, 0, 0, 0, 0, 0, 0],
    weeklyLabels: [] as string[],
    hourCounts: new Array(24).fill(0) as number[],
    topContacts: [] as { name: string; count: number }[],
  });

  useEffect(() => {
    let cancelled = false;

    const fetchStats = async () => {
      // conversations the user participates in
      const { data: parts } = await supabase
        .from("conversation_participants")
        .select("conversation_id")
        .eq("user_id", userId);
      const convIds = (parts || []).map((p) => p.conversation_id);

      const { count: msgCount } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("sender_id", userId);

      // last 30 days of messages in those conversations (both sides)
      const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      let convMessages: { conversation_id: string; sender_id: string; created_at: string }[] = [];
      if (convIds.length) {
        const { data } = await supabase
          .from("messages")
          .select("conversation_id, sender_id, created_at")
          .in("conversation_id", convIds)
          .gte("created_at", since)
          .order("created_at", { ascending: true })
          .limit(1000);
        convMessages = data || [];
      }

      const mine = convMessages.filter((m) => m.sender_id === userId);

      // real hourly distribution of own messages
      const hourCounts = new Array(24).fill(0);
      mine.forEach((m) => hourCounts[new Date(m.created_at).getHours()]++);
      const mostActiveHour = hourCounts.some((c) => c > 0) ? hourCounts.indexOf(Math.max(...hourCounts)) : 0;

      // last 7 calendar days
      const weeklyMessages = new Array(7).fill(0);
      const weeklyLabels: string[] = [];
      const dayKeys: string[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() - i);
        dayKeys.push(d.toDateString());
        weeklyLabels.push(d.toLocaleDateString(undefined, { weekday: "short" }));
      }
      mine.forEach((m) => {
        const idx = dayKeys.indexOf(new Date(m.created_at).toDateString());
        if (idx >= 0) weeklyMessages[idx]++;
      });

      // real average response time: gap between partner's message and user's reply
      const byConv = new Map<string, typeof convMessages>();
      convMessages.forEach((m) => {
        const arr = byConv.get(m.conversation_id) || [];
        arr.push(m);
        byConv.set(m.conversation_id, arr);
      });
      let gapSum = 0;
      let gapCount = 0;
      byConv.forEach((arr) => {
        for (let i = 1; i < arr.length; i++) {
          if (arr[i].sender_id === userId && arr[i - 1].sender_id !== userId) {
            const diff = new Date(arr[i].created_at).getTime() - new Date(arr[i - 1].created_at).getTime();
            if (diff > 0 && diff < 24 * 60 * 60 * 1000) {
              gapSum += diff;
              gapCount++;
            }
          }
        }
      });
      let avgResponseTime = "—";
      if (gapCount > 0) {
        const avgMin = gapSum / gapCount / 60000;
        avgResponseTime = avgMin < 1 ? "< 1 min" : avgMin < 60 ? `${Math.round(avgMin)} min` : `${(avgMin / 60).toFixed(1)} h`;
      }

      // top contacts: partners by message volume in shared conversations
      let topContacts: { name: string; count: number }[] = [];
      if (convIds.length) {
        const { data: others } = await supabase
          .from("conversation_participants")
          .select("conversation_id, user_id")
          .in("conversation_id", convIds)
          .neq("user_id", userId);
        const convToUser = new Map<string, string>();
        (others || []).forEach((o) => convToUser.set(o.conversation_id, o.user_id));
        const perUser = new Map<string, number>();
        convMessages.forEach((m) => {
          const partner = convToUser.get(m.conversation_id);
          if (partner) perUser.set(partner, (perUser.get(partner) || 0) + 1);
        });
        const ids = [...perUser.keys()];
        if (ids.length) {
          const { data: profs } = await supabase
            .from("profiles")
            .select("id, username, full_name")
            .in("id", ids);
          const nameById = new Map((profs || []).map((p: any) => [p.id, p.full_name || p.username || "User"]));
          topContacts = ids
            .map((id) => ({ name: nameById.get(id) || "User", count: perUser.get(id) || 0 }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
        }
      }

      if (cancelled) return;
      setStats({
        totalMessages: msgCount || 0,
        totalConversations: convIds.length,
        avgResponseTime,
        mostActiveHour,
        weeklyMessages,
        weeklyLabels,
        hourCounts,
        topContacts,
      });
      setLoading(false);
    };

    fetchStats();

    const channel = supabase
      .channel(`chat-analytics-${userId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, () => fetchStats())
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const days = stats.weeklyLabels;
  const maxDay = Math.max(...stats.weeklyMessages, 1);
  const maxHour = Math.max(...stats.hourCounts, 1);


  const summaryCards = [
    { icon: MessageCircle, label: "Total Messages", value: stats.totalMessages, color: "from-cyan-500 to-blue-500" },
    { icon: Users, label: "Conversations", value: stats.totalConversations, color: "from-purple-500 to-pink-500" },
    { icon: Clock, label: "Avg Response", value: stats.avgResponseTime, color: "from-emerald-500 to-teal-500" },
    { icon: Zap, label: "Peak Hour", value: `${stats.mostActiveHour}:00`, color: "from-amber-500 to-orange-500" },
  ];

  return (
    <div className="space-y-6">
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
              {stats.hourCounts.map((count, h) => {
                const intensity = count / maxHour;
                return (
                  <div
                    key={h}
                    title={`${count} message(s) at ${h}:00`}
                    className="aspect-square rounded-md flex items-center justify-center text-[9px] font-bold"
                    style={{
                      backgroundColor: `hsl(190 ${60 + intensity * 40}% ${20 + intensity * 30}%)`,
                      color: intensity > 0.5 ? "white" : "hsl(190 20% 60%)" }}
                  >
                    {h}h
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              {stats.totalMessages === 0
                ? "No messages yet — your activity will appear here."
                : <>Your peak messaging hour is <span className="font-bold text-primary">{stats.mostActiveHour}:00</span></>}
            </p>

          </CardContent>
        </Card>
      </motion.div>

      {/* Top Contacts */}
      {stats.topContacts.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
          <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-black">
                <TrendingUp className="h-5 w-5 text-primary" /> Top Contacts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {stats.topContacts.map((c, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs font-bold w-4 text-muted-foreground">{i + 1}</span>
                  <span className="text-sm font-semibold truncate flex-1">{c.name}</span>
                  <span className="text-xs font-bold text-primary">{c.count} msgs</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}

    </div>
  );
};
