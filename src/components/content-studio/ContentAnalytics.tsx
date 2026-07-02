import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { ArrowLeft, BarChart3, TrendingUp, FileText, Image as ImageIcon, Calendar, Sparkles } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
interface Props {
  onBack: () => void;
}

const COLORS = ["hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

const ContentAnalytics = ({ onBack }: Props) => {
  const [contentData, setContentData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("ai_generated_content")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    setContentData(data || []);
    setLoading(false);
  };

  const typeDistribution = contentData.reduce((acc: Record<string, number>, item) => {
    const type = item.content_type?.replace("_", " ") || "unknown";
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.entries(typeDistribution).map(([name, value]) => ({ name, value }));

  const dailyData = contentData.reduce((acc: Record<string, number>, item) => {
    const day = new Date(item.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    acc[day] = (acc[day] || 0) + 1;
    return acc;
  }, {});
  const timelineData = Object.entries(dailyData).slice(-14).map(([date, count]) => ({ date, count }));

  const creditsUsed = contentData.reduce((sum, item) => sum + (item.credits_used || 0), 0);
  const withImages = contentData.filter(c => c.generated_image_url).length;
  const avgLength = contentData.length > 0
    ? Math.round(contentData.reduce((sum, c) => sum + (c.generated_text?.length || 0), 0) / contentData.length)
    : 0;

  const weeklyData = (() => {
    const weeks: Record<string, number> = {};
    contentData.forEach(item => {
      const d = new Date(item.created_at);
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay());
      const key = weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      weeks[key] = (weeks[key] || 0) + 1;
    });
    return Object.entries(weeks).slice(-8).map(([week, count]) => ({ week, count }));
  })();

  return (
    <>
      <FloatingHowItWorks
        title="How Content Analytics works"
        steps={[
          { title: 'Connect accounts', description: 'Link your social profiles.' },
          { title: 'View metrics', description: 'Reach, engagement, growth.' },
          { title: 'Spot winners', description: 'Filter by top-performing content.' },
          { title: 'Iterate', description: 'Double down on formats that work.' },
        ]}
      />
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <div className="flex-1">
          <h2 className="text-2xl font-black">Content Performance Analytics</h2>
          <p className="text-muted-foreground">Track your content creation patterns and usage insights</p>
        </div>
        <Badge variant="outline">Free</Badge>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : contentData.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-bold mb-2">No Content Yet</h3>
            <p className="text-muted-foreground">Generate some content first to see your analytics dashboard.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total Content", value: contentData.length, icon: FileText, color: "text-primary" },
              { label: "Credits Used", value: creditsUsed, icon: Sparkles, color: "text-yellow-500" },
              { label: "With Images", value: withImages, icon: ImageIcon, color: "text-pink-500" },
              { label: "Avg Length", value: `${avgLength} chars`, icon: TrendingUp, color: "text-emerald-500" },
            ].map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Card>
                  <CardContent className="p-4 text-center">
                    <stat.icon className={`h-6 w-6 mx-auto mb-2 ${stat.color}`} />
                    <p className="text-2xl font-black">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Daily Content Output
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={timelineData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="date" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Type Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Content Type Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Weekly Trend */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Weekly Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="week" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                    <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))" }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
    </>
  );
};

export default ContentAnalytics;
