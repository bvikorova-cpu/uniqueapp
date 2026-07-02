import { useAuth } from "@/contexts/AuthContext";
import { useCreatorStudioStats } from "@/hooks/useCreatorStudioStats";
import { Card } from "@/components/ui/card";
import { BarChart3, Eye, Heart, MessageCircle, TrendingUp, Users, Loader2, FileText, Clock } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar } from "recharts";
import { motion } from "framer-motion";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
interface Props {
  userId?: string;
}

const formatN = (n: number) => (n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n));

const Stat = ({ icon: Icon, label, value, color = "text-primary" }: any) => (
  <Card className="p-4">
    <div className="flex items-center gap-2 mb-1">
      <Icon className={`h-4 w-4 ${color}`} />
      <span className="text-xs uppercase tracking-wider text-muted-foreground font-bold">{label}</span>
    </div>
    <div className="text-2xl font-black tabular-nums">{value}</div>
  </Card>
);

export const CreatorStudioDashboard = ({ userId }: Props) => {
  const { user } = useAuth();
  const targetId = userId ?? user?.id;
  const { data, isLoading } = useCreatorStudioStats(targetId);

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const heatMax = Math.max(1, ...data.hourlyHeatmap);

  return (
    <>
      <FloatingHowItWorks
        title="How Creator Studio works"
        steps={[
          { title: 'Overview', description: 'See earnings, followers, and top posts at a glance.' },
          { title: 'Create content', description: 'Jump into any AI studio (Content, Beauty, Fashion...).' },
          { title: 'Monetize', description: 'Enable tips, subs, and PPV.' },
          { title: 'Get support', description: 'Access docs and creator success team.' },
        ]}
      />
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30">
          <BarChart3 className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-black">Creator Studio</h2>
          <p className="text-sm text-muted-foreground flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
            <span className={data.growth7d >= 0 ? "text-emerald-500 font-bold" : "text-rose-500 font-bold"}>
              {data.growth7d >= 0 ? "+" : ""}{data.growth7d.toFixed(1)}%
            </span>
            <span>engagement vs. previous week</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <Stat icon={FileText} label="Posts (30d)" value={data.totalPosts} color="text-violet-400" />
        <Stat icon={Eye} label="Views" value={formatN(data.totalViews)} color="text-blue-400" />
        <Stat icon={Heart} label="Likes" value={formatN(data.totalLikes)} color="text-rose-400" />
        <Stat icon={MessageCircle} label="Comments" value={formatN(data.totalComments)} color="text-emerald-400" />
        <Stat icon={Users} label="Followers" value={formatN(data.followers)} color="text-amber-400" />
        <Stat icon={TrendingUp} label="Engagement" value={`${data.engagementRate.toFixed(1)}%`} color="text-pink-400" />
      </div>

      <Card className="p-5">
        <h3 className="text-sm font-bold uppercase tracking-wider mb-3">Activity — last 30 days</h3>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={data.series}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(d) => d.slice(5)} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
            <Line type="monotone" dataKey="likes" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="comments" stroke="hsl(var(--accent))" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card className="p-5">
          <h3 className="text-sm font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
            <Clock className="h-4 w-4" /> Best posting hours
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.hourlyHeatmap.map((v, h) => ({ hour: `${h}h`, eng: v }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="hour" tick={{ fontSize: 9 }} interval={1} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
              <Bar dataKey="eng" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <h3 className="text-sm font-bold uppercase tracking-wider mb-3">Top posts</h3>
          {data.topPosts.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">No posts yet.</p>
          ) : (
            <div className="space-y-2">
              {data.topPosts.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-start gap-3 p-2.5 rounded-lg bg-muted/30 border border-border/40"
                >
                  <div className="text-lg font-black text-primary w-6 tabular-nums">#{i + 1}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm line-clamp-2">{p.content || "(media post)"}</p>
                    <div className="flex gap-3 text-xs text-muted-foreground mt-1">
                      <span className="flex items-center gap-1"><Heart className="h-3 w-3" />{p.likes_count}</span>
                      <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" />{p.comments_count}</span>
                      <span>{new Date(p.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
    </>
  );
};
