import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  ArrowLeft, PieChart, Users, MapPin, Clock, TrendingUp, BarChart3, Sparkles, Loader2,
} from "lucide-react";
import {
  PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip,
} from "recharts";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface AudienceInsightsProps {
  onBack: () => void;
}

interface AudienceInsightsPayload {
  total_followers: number;
  age_distribution: { name: string; value: number }[];
  top_locations: { country: string; followers: number }[];
  top_interests: { name: string; value: number }[];
  weekday_growth: { day: string; followers: number }[];
  active_hours: { hour: string; activity: number }[];
  engagement: {
    total_posts: number;
    total_likes: number;
    total_views: number;
    avg_likes_per_post: number;
    engagement_rate: number;
  };
  error?: string;
}

const AGE_COLORS = ["hsl(var(--primary))", "#06b6d4", "#f59e0b", "#10b981", "#ec4899", "#a855f7"];
const INTEREST_COLORS = ["#ec4899", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#3b82f6", "#f43f5e", "#14b8a6", "#a855f7", "#eab308"];

const EmptyMini = ({ label }: { label: string }) => (
  <div className="h-[200px] flex items-center justify-center text-xs text-muted-foreground italic">
    {label}
  </div>
);

const AudienceInsights = ({ onBack }: AudienceInsightsProps) => {
  const { data: myProfile } = useQuery({
    queryKey: ["my-influencer-audience"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await supabase
        .from("influencer_profiles")
        .select("id, user_id, followers_count")
        .eq("user_id", user.id)
        .maybeSingle();
      return data;
    },
  });

  const { data: insights, isLoading } = useQuery({
    queryKey: ["audience-insights-rpc", myProfile?.id],
    enabled: !!myProfile?.id,
    queryFn: async (): Promise<AudienceInsightsPayload | null> => {
      const { data, error } = await (supabase as any).rpc("get_influencer_audience_insights", {
        _influencer_id: myProfile!.id,
      });
      if (error) throw error;
      return data as AudienceInsightsPayload;
    },
  });

  const total = insights?.total_followers ?? 0;
  const age = insights?.age_distribution ?? [];
  const locations = insights?.top_locations ?? [];
  const interests = insights?.top_interests ?? [];
  const weekday = insights?.weekday_growth ?? [];
  const hours = insights?.active_hours ?? [];
  const eng = insights?.engagement;

  return (
    <>
      <FloatingHowItWorks
        title="Audience Insights — How it works"
        intro="All numbers come from your real followers and post engagement — no mock data."
        steps={[
          { title: "Followers", desc: "Anyone who follows your influencer profile is counted here." },
          { title: "Demographics", desc: "Age and location are aggregated from your followers' profile info." },
          { title: "Interests", desc: "Top interests come from what your followers listed on their profiles." },
          { title: "Activity", desc: "Active hours are computed from likes on your posts." },
        ]}
      />
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <Button variant="ghost" onClick={onBack} className="gap-2 mb-4">
            <ArrowLeft className="h-4 w-4" /> Back to Hub
          </Button>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-6 flex-wrap">
            <div className="p-3 rounded-xl bg-teal-500/20 border border-teal-500/30">
              <PieChart className="h-8 w-8 text-teal-500" />
            </div>
            <div className="flex-1 min-w-[200px]">
              <h2 className="text-2xl font-black">Audience Insights</h2>
              <p className="text-muted-foreground text-sm">
                Real demographics, interests & activity — aggregated from your followers.
              </p>
            </div>
            <Badge className="ml-auto">{total} Followers</Badge>
          </div>
        </motion.div>

        {!myProfile ? (
          <Card className="p-12 text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              Create your influencer profile to view audience insights.
            </p>
          </Card>
        ) : isLoading ? (
          <Card className="p-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          </Card>
        ) : insights?.error === "forbidden" ? (
          <Card className="p-8 text-center text-sm text-muted-foreground">
            You can only view insights for your own influencer profile.
          </Card>
        ) : (
          <>
            {/* Engagement summary cards */}
            {eng && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {[
                  { label: "Posts", value: eng.total_posts, icon: BarChart3, color: "text-violet-400" },
                  { label: "Total likes", value: eng.total_likes, icon: TrendingUp, color: "text-rose-400" },
                  { label: "Total views", value: eng.total_views, icon: Users, color: "text-blue-400" },
                  { label: "Avg likes/post", value: eng.avg_likes_per_post, icon: Sparkles, color: "text-amber-400" },
                  { label: "Engagement %", value: `${eng.engagement_rate}%`, icon: TrendingUp, color: "text-emerald-400" },
                ].map((s) => (
                  <Card key={s.label} className="p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <s.icon className={`h-4 w-4 ${s.color}`} />
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                        {s.label}
                      </span>
                    </div>
                    <div className="text-xl font-black tabular-nums">{s.value}</div>
                  </Card>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Age Distribution */}
              <Card className="backdrop-blur-xl bg-card/80 border-primary/10 h-full">
                <CardHeader><CardTitle className="text-base">Age Distribution</CardTitle></CardHeader>
                <CardContent>
                  {age.length === 0 ? (
                    <EmptyMini label="No follower birth-date data yet." />
                  ) : (
                    <ResponsiveContainer width="100%" height={200}>
                      <RechartsPie>
                        <Pie
                          data={age} cx="50%" cy="50%" outerRadius={70} dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {age.map((_, i) => <Cell key={i} fill={AGE_COLORS[i % AGE_COLORS.length]} />)}
                        </Pie>
                        <Tooltip />
                      </RechartsPie>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              {/* Top Interests / Categories */}
              <Card className="backdrop-blur-xl bg-card/80 border-primary/10 h-full md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-pink-500" /> Top Interests / Categories
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {interests.length === 0 ? (
                    <EmptyMini label="No interest data on follower profiles yet." />
                  ) : (
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={interests} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis type="number" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                        <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={110} stroke="hsl(var(--muted-foreground))" />
                        <Tooltip />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                          {interests.map((_, i) => <Cell key={i} fill={INTEREST_COLORS[i % INTEREST_COLORS.length]} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              {/* Top Locations */}
              <Card className="backdrop-blur-xl bg-card/80 border-primary/10 md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-emerald-500" /> Top Locations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {locations.length === 0 ? (
                    <EmptyMini label="Followers haven't set a location yet." />
                  ) : (
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={locations} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis type="number" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                        <YAxis type="category" dataKey="country" tick={{ fontSize: 10 }} width={110} stroke="hsl(var(--muted-foreground))" />
                        <Tooltip />
                        <Bar dataKey="followers" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              {/* Weekday follower growth */}
              <Card className="backdrop-blur-xl bg-card/80 border-primary/10">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-primary" /> Follows by weekday
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {weekday.length === 0 ? (
                    <EmptyMini label="No follow events yet." />
                  ) : (
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={weekday}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="day" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                        <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                        <Tooltip />
                        <Bar dataKey="followers" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              {/* Active hours */}
              <Card className="backdrop-blur-xl bg-card/80 border-primary/10 md:col-span-2 lg:col-span-3">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Clock className="h-4 w-4 text-amber-500" /> Audience active hours (UTC)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {hours.every((h) => h.activity === 0) ? (
                    <EmptyMini label="No likes on your posts yet — publish content to see activity." />
                  ) : (
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={hours}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="hour" tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" interval={2} />
                        <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                        <Tooltip />
                        <Bar dataKey="activity" fill="hsl(var(--primary) / 0.6)" radius={[2, 2, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default AudienceInsights;
