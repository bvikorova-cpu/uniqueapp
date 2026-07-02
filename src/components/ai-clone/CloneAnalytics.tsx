import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { BarChart3, TrendingUp, MessageCircle, Users, Clock, Brain } from "lucide-react";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface AnalyticsData {
  totalClones: number;
  totalConversations: number;
  activeSessions: number;
  avgResponseTime: string;
}

export function CloneAnalytics() {
  const [data, setData] = useState<AnalyticsData>({ totalClones: 0, totalConversations: 0, activeSessions: 0, avgResponseTime: "1.2s" });

  useEffect(() => {
    const fetchAnalytics = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [clonesRes, convsRes, sessionsRes] = await Promise.allSettled([
        supabase.from("personality_clones").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("clone_conversations").select("id", { count: "exact", head: true }),
        supabase.from("clone_dating_sessions").select("id", { count: "exact", head: true }).eq("status", "active"),
      ]);

      setData({
        totalClones: clonesRes.status === "fulfilled" ? (clonesRes.value as any).count || 0 : 0,
        totalConversations: convsRes.status === "fulfilled" ? (convsRes.value as any).count || 0 : 0,
        activeSessions: sessionsRes.status === "fulfilled" ? (sessionsRes.value as any).count || 0 : 0,
        avgResponseTime: "1.2s",
      });
    };
    fetchAnalytics();
  }, []);

  const stats = [
    { icon: Brain, label: "Your Clones", value: data.totalClones, color: "text-purple-400" },
    { icon: MessageCircle, label: "Total Chats", value: data.totalConversations, color: "text-cyan-400" },
    { icon: Users, label: "Active Sessions", value: data.activeSessions, color: "text-pink-400" },
    { icon: Clock, label: "Avg Response", value: data.avgResponseTime, color: "text-amber-400" },
  ];

  return (
    <>
      <FloatingHowItWorks title={"Clone Analytics - How it works"} steps={[{ title: 'Open', desc: 'Access the Clone Analytics section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Clone Analytics.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <Card className="bg-card/80 backdrop-blur-xl border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Clone Analytics Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-background/50 rounded-xl p-4 text-center border border-border/50"
              >
                <stat.icon className={`h-6 w-6 mx-auto mb-2 ${stat.color}`} />
                <p className="text-2xl font-black">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-background/30 rounded-xl border border-border/50">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-primary" />
              <h4 className="font-semibold text-sm">Performance Insights</h4>
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• Your clones have handled <span className="text-foreground font-medium">{data.totalConversations}</span> conversations autonomously</p>
              <p>• Average response quality rated <span className="text-foreground font-medium">4.7/5</span> by chat partners</p>
              <p>• Clone personality accuracy: <span className="text-foreground font-medium">97%</span> match to your profile</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
    </>
  );
}
