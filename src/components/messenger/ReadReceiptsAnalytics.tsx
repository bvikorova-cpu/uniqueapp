import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, CheckCheck, Clock, TrendingUp, Users, Zap, Eye, Timer } from "lucide-react";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface ReadReceiptsAnalyticsProps {
  onBack: () => void;
  userId: string;
}

interface ContactSpeed {
  name: string;
  avgTime: number;
  totalRead: number;
}

export const ReadReceiptsAnalytics = ({ onBack, userId }: ReadReceiptsAnalyticsProps) => {
  const [stats, setStats] = useState({
    totalSent: 0,
    totalRead: 0,
    avgReadTime: 0,
    fastestReader: "",
    slowestReader: "",
    readRate: 0,
    hourlyReadRates: Array(24).fill(0),
    contactSpeeds: [] as ContactSpeed[],
  });

  useEffect(() => {
    const fetchReadStats = async () => {
      const { data: sentMessages } = await supabase
        .from("messages")
        .select("id, created_at, is_read, read_at, conversation_id")
        .eq("sender_id", userId)
        .order("created_at", { ascending: false })
        .limit(500);

      if (!sentMessages) return;

      const totalSent = sentMessages.length;
      const readMessages = sentMessages.filter(m => m.is_read && m.read_at);
      const totalRead = readMessages.length;
      const readRate = totalSent > 0 ? Math.round((totalRead / totalSent) * 100) : 0;

      const readTimes = readMessages.map(m => {
        const sent = new Date(m.created_at).getTime();
        const read = new Date(m.read_at!).getTime();
        return (read - sent) / 1000;
      }).filter(t => t > 0 && t < 86400);

      const avgReadTime = readTimes.length > 0
        ? Math.round(readTimes.reduce((a, b) => a + b, 0) / readTimes.length)
        : 0;

      const hourlyRates = Array(24).fill(0);
      const hourlyCounts = Array(24).fill(0);
      readMessages.forEach(m => {
        if (m.read_at) {
          const h = new Date(m.read_at).getHours();
          hourlyRates[h]++;
        }
      });
      sentMessages.forEach(m => {
        const h = new Date(m.created_at).getHours();
        hourlyCounts[h]++;
      });

      const normalizedHourly = hourlyRates.map((r, i) =>
        hourlyCounts[i] > 0 ? Math.round((r / hourlyCounts[i]) * 100) : 0
      );

      // Get conversation partners' read speeds
      const convMap = new Map<string, { times: number[]; count: number }>();
      for (const msg of readMessages) {
        if (!msg.read_at) continue;
        const time = (new Date(msg.read_at).getTime() - new Date(msg.created_at).getTime()) / 1000;
        if (time <= 0 || time > 86400) continue;
        const existing = convMap.get(msg.conversation_id) || { times: [], count: 0 };
        existing.times.push(time);
        existing.count++;
        convMap.set(msg.conversation_id, existing);
      }

      const contactSpeeds: ContactSpeed[] = [];
      for (const [convId, data] of convMap.entries()) {
        const { data: participants } = await supabase
          .from("conversation_participants")
          .select("user_id")
          .eq("conversation_id", convId)
          .neq("user_id", userId)
          .limit(1);

        if (participants?.[0]) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", participants[0].user_id)
            .single();

          contactSpeeds.push({
            name: profile?.full_name || "Unknown",
            avgTime: Math.round(data.times.reduce((a, b) => a + b, 0) / data.times.length),
            totalRead: data.count,
          });
        }
      }

      contactSpeeds.sort((a, b) => a.avgTime - b.avgTime);

      setStats({
        totalSent,
        totalRead,
        avgReadTime,
        fastestReader: contactSpeeds[0]?.name || "N/A",
        slowestReader: contactSpeeds[contactSpeeds.length - 1]?.name || "N/A",
        readRate,
        hourlyReadRates: normalizedHourly,
        contactSpeeds: contactSpeeds.slice(0, 8),
      });
    };

    fetchReadStats();
  }, [userId]);

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
    return `${Math.round(seconds / 3600)}h`;
  };

  const summaryCards = [
    { icon: CheckCheck, label: "Read Rate", value: `${stats.readRate}%`, color: "from-cyan-500 to-blue-500" },
    { icon: Timer, label: "Avg Read Time", value: formatTime(stats.avgReadTime), color: "from-emerald-500 to-teal-500" },
    { icon: Zap, label: "Fastest Reader", value: stats.fastestReader, color: "from-amber-500 to-orange-500" },
    { icon: Eye, label: "Messages Read", value: stats.totalRead.toLocaleString(), color: "from-purple-500 to-pink-500" },
  ];

  return (
    <div className="space-y-6">
      <FloatingHowItWorks
        title={"Read Receipts Analytics"}
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
          <h2 className="text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">Read Receipts Analytics</h2>
          <p className="text-sm text-muted-foreground">Who reads your messages fastest?</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {summaryCards.map((card, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mx-auto mb-2`}>
                  <card.icon className="h-5 w-5 text-white" />
                </div>
                <p className="text-xl font-black truncate">{card.value}</p>
                <p className="text-xs text-muted-foreground">{card.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Contact Read Speeds */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-black">
              <Users className="h-5 w-5 text-primary" /> Contact Read Speeds
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.contactSpeeds.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No read receipt data yet. Start chatting!</p>
            ) : (
              stats.contactSpeeds.map((contact, i) => {
                const maxTime = Math.max(...stats.contactSpeeds.map(c => c.avgTime), 1);
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.05 }}
                    className="flex items-center gap-3"
                  >
                    <span className="text-xs font-bold w-6 text-muted-foreground">#{i + 1}</span>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-bold">{contact.name}</span>
                        <span className="text-xs text-muted-foreground">{formatTime(contact.avgTime)} avg • {contact.totalRead} read</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.max(5, 100 - (contact.avgTime / maxTime) * 100)}%` }}
                          transition={{ delay: 0.6 + i * 0.05, duration: 0.5 }}
                          className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                        />
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Hourly Read Heatmap */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
        <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-black">
              <Clock className="h-5 w-5 text-primary" /> Hourly Read Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-8 gap-1">
              {stats.hourlyReadRates.map((rate, h) => (
                <div
                  key={h}
                  className="aspect-square rounded-md flex items-center justify-center text-[9px] font-bold transition-colors"
                  style={{
                    backgroundColor: `hsl(var(--primary) / ${0.1 + (rate / 100) * 0.8})`,
                    color: rate > 50 ? "hsl(var(--primary-foreground))" : "hsl(var(--muted-foreground))",
                  }}
                >
                  {h}h
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Higher intensity = higher read rate at that hour
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
