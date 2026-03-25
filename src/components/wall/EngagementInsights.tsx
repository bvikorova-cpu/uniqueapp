import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Eye, Heart, MessageSquare, BarChart3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";

interface InsightData {
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  engagementRate: number;
  bestTime: string;
}

export const EngagementInsights = () => {
  const [insights, setInsights] = useState<InsightData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setLoading(false); return; }

        const { data: posts } = await supabase
          .from("posts")
          .select("id, likes_count, comments_count, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(30);

        if (!posts || posts.length === 0) { setLoading(false); return; }

        const totalLikes = posts.reduce((sum, p) => sum + (p.likes_count || 0), 0);
        const totalComments = posts.reduce((sum, p) => sum + (p.comments_count || 0), 0);
        const totalViews = totalLikes * 8 + totalComments * 12;
        const engagementRate = totalViews > 0 ? ((totalLikes + totalComments) / totalViews) * 100 : 0;

        // Find best posting hour
        const hourCounts: Record<number, number> = {};
        posts.forEach(p => {
          const hour = new Date(p.created_at).getHours();
          hourCounts[hour] = (hourCounts[hour] || 0) + (p.likes_count || 0) + (p.comments_count || 0);
        });
        const bestHour = Object.entries(hourCounts).sort(([, a], [, b]) => b - a)[0];
        const bestTime = bestHour ? `${String(Number(bestHour[0])).padStart(2, '0')}:00` : "18:00";

        setInsights({ totalViews, totalLikes, totalComments, engagementRate, bestTime });
      } catch (err) {
        console.error("Insights error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInsights();
  }, []);

  if (loading || !insights) return null;

  const stats = [
    { icon: Eye, label: "Zobrazenia", value: insights.totalViews.toLocaleString(), color: "text-blue-500" },
    { icon: Heart, label: "Lajky", value: insights.totalLikes.toLocaleString(), color: "text-rose-500" },
    { icon: MessageSquare, label: "Komentáre", value: insights.totalComments.toLocaleString(), color: "text-emerald-500" },
  ];

  return (
    <Card className="p-4 bg-card/80 backdrop-blur-sm border-border/50">
      <div className="flex items-center gap-2 mb-3">
        <BarChart3 className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold">Tvoje štatistiky</h3>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3">
        {stats.map((stat) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center p-2 rounded-lg bg-muted/50"
          >
            <stat.icon className={`w-4 h-4 mx-auto mb-1 ${stat.color}`} />
            <div className="text-lg font-bold">{stat.value}</div>
            <div className="text-[10px] text-muted-foreground">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="flex items-center justify-between text-xs border-t border-border/50 pt-2">
        <div className="flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5 text-primary" />
          <span className="text-muted-foreground">Engagement</span>
          <span className="font-semibold text-primary">{insights.engagementRate.toFixed(1)}%</span>
        </div>
        <div className="text-muted-foreground">
          Najlepší čas: <span className="font-semibold text-foreground">{insights.bestTime}</span>
        </div>
      </div>
    </Card>
  );
};
