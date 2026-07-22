import { motion } from "framer-motion";
import { BarChart3, Eye, Heart, MessageCircle, Share2, TrendingUp, Users } from "lucide-react";

interface CreatorAnalyticsPanelProps {
  stats?: {
    totalViews: number;
    totalLikes: number;
    totalComments: number;
    totalShares: number;
    followers: number;
    growth: number;
  };
}

export const CreatorAnalyticsPanel = ({ stats }: CreatorAnalyticsPanelProps) => { const defaultStats = stats || {
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0,
    totalShares: 0,
    followers: 0,
    growth: 0 };

  const metrics = [
    { icon: Eye, label: "Views", value: defaultStats.totalViews, color: "text-blue-500" },
    { icon: Heart, label: "Likes", value: defaultStats.totalLikes, color: "text-rose-500" },
    { icon: MessageCircle, label: "Comments", value: defaultStats.totalComments, color: "text-emerald-500" },
    { icon: Share2, label: "Shares", value: defaultStats.totalShares, color: "text-amber-500" },
    { icon: Users, label: "Followers", value: defaultStats.followers, color: "text-primary" },
  ];

  const formatNumber = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return String(n);
  };

  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-primary/10 rounded-xl">
          <BarChart3 className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-bold text-lg">Creator Dashboard</h3>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <TrendingUp className="w-3 h-3 text-emerald-500" />
            <span className="text-emerald-500 font-semibold">+{defaultStats.growth}%</span>
            <span>this week</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {metrics.map((metric, i) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="text-center p-2 rounded-xl bg-accent/20 backdrop-blur-sm"
          >
            <metric.icon className={`w-4 h-4 mx-auto mb-1 ${metric.color}`} />
            <div className="text-sm font-bold tabular-nums">{formatNumber(metric.value)}</div>
            <div className="text-[10px] text-muted-foreground">{metric.label}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
