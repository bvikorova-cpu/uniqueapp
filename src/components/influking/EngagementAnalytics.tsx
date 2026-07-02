import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, BarChart3, TrendingUp, Users, Heart, Eye, Calendar, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from "recharts";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface EngagementAnalyticsProps {
  onBack: () => void;
}

const EngagementAnalytics = ({ onBack }: EngagementAnalyticsProps) => {
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d");

  const { data: myProfile } = useQuery({
    queryKey: ["my-influencer-analytics"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await supabase
        .from("influencer_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      return data;
    },
  });

  const { data: posts = [] } = useQuery({
    queryKey: ["analytics-posts", myProfile?.id],
    queryFn: async () => {
      if (!myProfile) return [];
      const { data, error } = await supabase
        .from("influencer_posts")
        .select("*")
        .eq("influencer_id", myProfile.id)
        .eq("is_active", true)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!myProfile,
  });

  const { data: followers = [] } = useQuery({
    queryKey: ["analytics-followers", myProfile?.id],
    queryFn: async () => {
      if (!myProfile) return [];
      const { data, error } = await supabase
        .from("influencer_followers")
        .select("created_at")
        .eq("influencer_id", myProfile.id)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!myProfile,
  });

  // Generate chart data from real posts
  const generateChartData = () => {
    const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
    const data = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      const dayPosts = posts.filter(p => p.created_at?.startsWith(dateStr));
      const dayFollowers = followers.filter(f => f.created_at?.startsWith(dateStr));

      data.push({
        date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        likes: dayPosts.reduce((sum: number, p: any) => sum + (p.likes_count || 0), 0),
        views: dayPosts.reduce((sum: number, p: any) => sum + (p.views_count || 0), 0),
        followers: dayFollowers.length,
        posts: dayPosts.length,
      });
    }
    return data;
  };

  const chartData = generateChartData();
  const totalLikes = posts.reduce((sum: number, p: any) => sum + (p.likes_count || 0), 0);
  const totalViews = posts.reduce((sum: number, p: any) => sum + (p.views_count || 0), 0);
  const engagementRate = totalViews > 0 ? ((totalLikes / totalViews) * 100).toFixed(2) : "0.00";

  // Best performing post
  const bestPost = posts.length > 0
    ? posts.reduce((best: any, p: any) => (p.likes_count || 0) > (best.likes_count || 0) ? p : best, posts[0])
    : null;

  const stats = [
    { label: "Total Posts", value: posts.length, icon: Calendar, color: "text-primary", trend: "+12%" },
    { label: "Total Likes", value: totalLikes.toLocaleString(), icon: Heart, color: "text-pink-500", trend: "+8%" },
    { label: "Total Views", value: totalViews.toLocaleString(), icon: Eye, color: "text-cyan-500", trend: "+23%" },
    { label: "Engagement Rate", value: `${engagementRate}%`, icon: TrendingUp, color: "text-emerald-500", trend: "+2.1%" },
  ];

  return (
    <>
      <FloatingHowItWorks title={"Engagement Analytics - How it works"} steps={[{ title: 'Open', desc: 'Access the Engagement Analytics section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Engagement Analytics.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <Button variant="ghost" onClick={onBack} className="gap-2 mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to Hub
        </Button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-primary/20 border border-primary/30">
            <BarChart3 className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-black">Engagement Analytics</h2>
            <p className="text-muted-foreground">Track your growth, likes, views & engagement over time</p>
          </div>
        </div>
      </motion.div>

      {/* Time Range Selector */}
      <div className="flex gap-2">
        {(["7d", "30d", "90d"] as const).map((range) => (
          <Button key={range} variant={timeRange === range ? "default" : "outline"} size="sm"
            onClick={() => setTimeRange(range)}>
            {range === "7d" ? "7 Days" : range === "30d" ? "30 Days" : "90 Days"}
          </Button>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}>
            <Card className="backdrop-blur-xl bg-card/80 border-primary/10">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  <div className="flex items-center gap-1 text-xs text-emerald-500">
                    <ArrowUpRight className="h-3 w-3" />
                    {stat.trend}
                  </div>
                </div>
                <p className="text-2xl font-black">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="backdrop-blur-xl bg-card/80 border-primary/10">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Heart className="h-4 w-4 text-pink-500" /> Likes Over Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip />
                  <Area type="monotone" dataKey="likes" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.2)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="backdrop-blur-xl bg-card/80 border-primary/10">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Eye className="h-4 w-4 text-cyan-500" /> Views Over Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip />
                  <Area type="monotone" dataKey="views" stroke="#06b6d4" fill="rgba(6,182,212,0.2)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="backdrop-blur-xl bg-card/80 border-primary/10">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4 text-emerald-500" /> New Followers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip />
                  <Bar dataKey="followers" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Best Post Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <Card className="backdrop-blur-xl bg-card/80 border-primary/10 h-full">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-amber-500" /> Best Performing Post
              </CardTitle>
            </CardHeader>
            <CardContent>
              {bestPost ? (
                <div className="space-y-3">
                  {bestPost.media_url && (
                    <div className="aspect-video rounded-lg overflow-hidden">
                      {bestPost.media_type === "video" ? (
                        <video src={bestPost.media_url} controls className="w-full h-full object-cover" />
                      ) : (
                        <img src={bestPost.media_url} alt="" className="w-full h-full object-cover" />
                      )}
                    </div>
                  )}
                  <h4 className="font-bold">{bestPost.title || "Untitled Post"}</h4>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1"><Heart className="h-4 w-4 text-pink-500" /><span className="font-bold">{bestPost.likes_count}</span></div>
                    <div className="flex items-center gap-1"><Eye className="h-4 w-4 text-cyan-500" /><span className="font-bold">{bestPost.views_count}</span></div>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">No posts yet. Start creating content!</p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
    </>
  );
};

export default EngagementAnalytics;
