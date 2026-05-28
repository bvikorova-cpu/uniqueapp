import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ArrowLeft, BarChart3, Shield, Crown, Timer, Trophy, Eye, Clock, Brain, BookOpen, Mail } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

import { ParentalHero } from "@/components/kids/parental/ParentalHero";
import { ParentalDashboard } from "@/components/kids/ParentalDashboard";
import { ChildProfileCards } from "@/components/kids/parental/ChildProfileCards";
import { AnimatedStats } from "@/components/kids/parental/AnimatedStats";
import { EnhancedCharts } from "@/components/kids/parental/EnhancedCharts";
import { WeeklyDigest } from "@/components/kids/parental/WeeklyDigest";
import { ContentBlocking } from "@/components/kids/parental/ContentBlocking";
import { AchievementTracking } from "@/components/kids/parental/AchievementTracking";
import { ActivityTimeline } from "@/components/kids/parental/ActivityTimeline";

import { HeroRewardedAd } from "@/components/ads/HeroRewardedAd";
interface UsageStats {
  homework_tasks: number;
  science_experiments: number;
  vocabulary_learned: number;
  stories_created: number;
  drawings_made: number;
  total_time_minutes: number;
}

export default function KidsParentalDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [sleepTimerEnabled, setSleepTimerEnabled] = useState(false);
  const [dailyLimit, setDailyLimit] = useState("60");
  const [emailReports, setEmailReports] = useState(true);

  const { data: stats } = useQuery({
    queryKey: ["parental-stats", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const [homework, science, reading, stories, drawings, gateLogs] = await Promise.all([
        supabase.from("kids_homework" as any).select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("kids_science_experiments" as any).select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("kids_reading_sessions" as any).select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("kids_stories" as any).select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("kids_drawings" as any).select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("kids_parental_gate_log").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      ]);
      return {
        homework_tasks: homework.count || 0,
        science_experiments: science.count || 0,
        vocabulary_learned: reading.count || 0,
        stories_created: stories.count || 0,
        drawings_made: drawings.count || 0,
        total_time_minutes: (gateLogs.count || 0) * 5,
      } as UsageStats;
    },
    enabled: !!user,
  });

  // Real weekly chart data — last 7 days from DB
  const { data: weeklyData = [] } = useQuery({
    queryKey: ["parental-weekly", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const since = new Date();
      since.setDate(since.getDate() - 6);
      since.setHours(0, 0, 0, 0);
      const sinceIso = since.toISOString();

      const [hw, sc, rd] = await Promise.all([
        supabase.from("kids_homework" as any).select("created_at").eq("user_id", user.id).gte("created_at", sinceIso),
        supabase.from("kids_science_experiments" as any).select("created_at").eq("user_id", user.id).gte("created_at", sinceIso),
        supabase.from("kids_reading_sessions" as any).select("created_at").eq("user_id", user.id).gte("created_at", sinceIso),
      ]);

      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const buckets: Record<string, { day: string; homework: number; science: number; reading: number }> = {};
      for (let i = 0; i < 7; i++) {
        const d = new Date(since);
        d.setDate(since.getDate() + i);
        const key = d.toISOString().slice(0, 10);
        buckets[key] = { day: days[d.getDay()], homework: 0, science: 0, reading: 0 };
      }
      const bump = (rows: any, field: "homework" | "science" | "reading") => {
        (rows.data || []).forEach((r: any) => {
          const key = (r.created_at || "").slice(0, 10);
          if (buckets[key]) buckets[key][field]++;
        });
      };
      bump(hw, "homework");
      bump(sc, "science");
      bump(rd, "reading");
      return Object.values(buckets);
    },
    enabled: !!user,
  });


  const { data: settings } = useQuery({
    queryKey: ["parental-settings", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from("kids_parental_settings")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (settings) {
      setSleepTimerEnabled(settings.sleep_timer_enabled || false);
      setDailyLimit(settings.daily_limit_minutes?.toString() || "60");
      setEmailReports(settings.email_reports ?? true);
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async (data: { sleep_timer_enabled: boolean; daily_limit_minutes: number; email_reports: boolean }) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("kids_parental_settings")
        .upsert({ user_id: user.id, ...data }, { onConflict: "user_id" });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parental-settings"] });
      toast.success("Settings saved!");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to save settings");
    },
  });

  const handleSaveSettings = () => {
    saveMutation.mutate({
      sleep_timer_enabled: sleepTimerEnabled,
      daily_limit_minutes: parseInt(dailyLimit),
      email_reports: emailReports,
    });
  };



  const categoryData = [
    { name: "Homework", value: stats?.homework_tasks || 0 },
    { name: "Science", value: stats?.science_experiments || 0 },
    { name: "Reading", value: stats?.vocabulary_learned || 0 },
    { name: "Stories", value: stats?.stories_created || 0 },
    { name: "Drawings", value: stats?.drawings_made || 0 },
  ];

  if (!hasGoldPass) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 flex items-center justify-center px-4">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <Crown className="w-16 h-16 mx-auto text-amber-500 mb-4" />
            <CardTitle className="text-2xl text-amber-700">Gold Pass Required</CardTitle>
            <CardDescription>
              The Parental Analytics Dashboard is available with the Unique Kids Gold Pass subscription.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={() => navigate("/kids-pricing")} className="w-full bg-gradient-to-r from-yellow-500 to-amber-500">
              Get Gold Pass
            </Button>
            <Button variant="outline" onClick={() => navigate("/kids-channel")}>
              Back to Kids Channel
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-8 px-4 pt-24">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate("/kids-channel")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Kids Channel
          </Button>
          <Badge className="bg-gradient-to-r from-yellow-500 to-amber-500 gap-1">
            <Crown className="w-4 h-4" /> Gold Pass Active
          </Badge>
        </div>

        <ParentalHero />
        <HeroRewardedAd sectionKey="page_kidsparentaldashboard" />

        <ChildProfileCards />

        <ParentalDashboard />

        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="flex items-center gap-4 py-4">
            <div className="bg-blue-100 rounded-full p-3"><Mail className="w-6 h-6 text-blue-600" /></div>
            <div className="flex-1">
              <p className="font-medium text-blue-800">Monthly Progress Reports</p>
              <p className="text-sm text-blue-600">A detailed progress report will be sent to your email at the end of each month.</p>
            </div>
            <Badge className="bg-blue-500">Active</Badge>
          </CardContent>
        </Card>

        <Tabs defaultValue="progress" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 max-w-2xl mx-auto">
            <TabsTrigger value="progress" className="gap-1 text-xs"><BarChart3 className="w-3.5 h-3.5" /> Progress</TabsTrigger>
            <TabsTrigger value="time" className="gap-1 text-xs"><Timer className="w-3.5 h-3.5" /> Limits</TabsTrigger>
            <TabsTrigger value="safety" className="gap-1 text-xs"><Shield className="w-3.5 h-3.5" /> Safety</TabsTrigger>
            <TabsTrigger value="digest" className="gap-1 text-xs"><Trophy className="w-3.5 h-3.5" /> Digest</TabsTrigger>
            <TabsTrigger value="achievements" className="gap-1 text-xs"><Crown className="w-3.5 h-3.5" /> Badges</TabsTrigger>
            <TabsTrigger value="timeline" className="gap-1 text-xs"><Clock className="w-3.5 h-3.5" /> Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="progress" className="space-y-6">
            <AnimatedStats stats={stats} />
            <EnhancedCharts weeklyData={weeklyData} categoryData={categoryData} />
          </TabsContent>

          <TabsContent value="time" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Timer className="w-5 h-5 text-purple-600" />Smart Sleep Timer</CardTitle>
                <CardDescription>Set daily usage limits. When the limit is reached, a friendly message will suggest a break.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="sleep-timer">Enable Sleep Timer</Label>
                    <p className="text-sm text-muted-foreground">Automatically remind your child to take a break</p>
                  </div>
                  <Switch id="sleep-timer" checked={sleepTimerEnabled} onCheckedChange={setSleepTimerEnabled} />
                </div>
                {sleepTimerEnabled && (
                  <div className="space-y-4 pt-4 border-t">
                    <div className="space-y-2">
                      <Label>Daily Limit</Label>
                      <Select value={dailyLimit} onValueChange={setDailyLimit}>
                        <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="45">45 minutes</SelectItem>
                          <SelectItem value="60">1 hour</SelectItem>
                          <SelectItem value="90">1.5 hours</SelectItem>
                          <SelectItem value="120">2 hours</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Card className="bg-blue-50 border-blue-200">
                      <CardContent className="pt-4">
                        <p className="text-sm text-blue-700">
                          💡 When the limit is reached, your child will see a friendly message from a magical character
                          suggesting they take a break to play outside, read a book, or spend time with family.
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                )}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="space-y-1">
                    <Label htmlFor="email-reports">Monthly Email Reports</Label>
                    <p className="text-sm text-muted-foreground">Receive detailed progress reports via email</p>
                  </div>
                  <Switch id="email-reports" checked={emailReports} onCheckedChange={setEmailReports} />
                </div>
                <Button onClick={handleSaveSettings} disabled={saveMutation.isPending} className="w-full bg-gradient-to-r from-purple-500 to-pink-500">
                  {saveMutation.isPending ? "Saving..." : "Save Settings"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="safety" className="space-y-6">
            <ContentBlocking />
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Shield className="w-5 h-5 text-green-600" />Safety Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { icon: <Shield className="w-5 h-5 text-green-600" />, bg: "bg-green-50", label: "AI Content Moderation", desc: "All AI responses are double-moderated for safety", color: "text-green-800", descColor: "text-green-600", badge: "bg-green-500" },
                  { icon: <Brain className="w-5 h-5 text-purple-600" />, bg: "bg-purple-50", label: "Parental Gate", desc: "Math verification required for AI features", color: "text-purple-800", descColor: "text-purple-600", badge: "bg-purple-500" },
                  { icon: <BookOpen className="w-5 h-5 text-blue-600" />, bg: "bg-blue-50", label: "Age-Appropriate Content", desc: "All content is curated for children", color: "text-blue-800", descColor: "text-blue-600", badge: "bg-blue-500" },
                ].map((item, i) => (
                  <div key={i} className={`flex items-center justify-between p-4 ${item.bg} rounded-xl`}>
                    <div className="flex items-center gap-3">
                      <div className={`${item.bg} rounded-full p-2`}>{item.icon}</div>
                      <div>
                        <p className={`font-medium ${item.color}`}>{item.label}</p>
                        <p className={`text-sm ${item.descColor}`}>{item.desc}</p>
                      </div>
                    </div>
                    <Badge className={item.badge}>Active</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="digest"><WeeklyDigest /></TabsContent>
          <TabsContent value="achievements"><AchievementTracking /></TabsContent>
          <TabsContent value="timeline"><ActivityTimeline /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
