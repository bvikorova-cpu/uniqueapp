import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ArrowLeft, BarChart3, BookOpen, Brain, FlaskConical, Clock, Mail, Shield, AlertTriangle, Crown, Timer } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useKidsGoldPass } from "@/hooks/useKidsGoldPass";
import { format, subDays, startOfWeek, endOfWeek } from "date-fns";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";

const COLORS = ["#8b5cf6", "#ec4899", "#06b6d4", "#10b981", "#f59e0b"];

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
  const { hasGoldPass } = useKidsGoldPass();
  const queryClient = useQueryClient();
  
  const [sleepTimerEnabled, setSleepTimerEnabled] = useState(false);
  const [dailyLimit, setDailyLimit] = useState("60");
  const [emailReports, setEmailReports] = useState(true);

  // Fetch usage statistics - using simulated data for demo
  const { data: stats } = useQuery({
    queryKey: ["parental-stats", user?.id],
    queryFn: async () => {
      return {
        homework_tasks: Math.floor(Math.random() * 30) + 10,
        science_experiments: Math.floor(Math.random() * 15) + 5,
        vocabulary_learned: Math.floor(Math.random() * 50) + 20,
        stories_created: Math.floor(Math.random() * 10) + 2,
        drawings_made: Math.floor(Math.random() * 8) + 3,
        total_time_minutes: Math.floor(Math.random() * 300) + 100,
      } as UsageStats;
    },
    enabled: !!user,
  });

  // Fetch parental settings from localStorage for demo
  const { data: settings } = useQuery({
    queryKey: ["parental-settings", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const stored = localStorage.getItem(`kids_parental_settings_${user.id}`);
      return stored ? JSON.parse(stored) : null;
    },
    enabled: !!user,
  });

  // Load settings
  useEffect(() => {
    if (settings) {
      setSleepTimerEnabled(settings.sleep_timer_enabled || false);
      setDailyLimit(settings.daily_limit_minutes?.toString() || "60");
      setEmailReports(settings.email_reports ?? true);
    }
  }, [settings]);

  // Save settings mutation - using localStorage for demo
  const saveMutation = useMutation({
    mutationFn: async (data: { sleep_timer_enabled: boolean; daily_limit_minutes: number; email_reports: boolean }) => {
      if (!user) throw new Error("Not authenticated");
      localStorage.setItem(`kids_parental_settings_${user.id}`, JSON.stringify(data));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parental-settings"] });
      toast.success("Settings saved!");
    },
    onError: () => {
      toast.error("Failed to save settings");
    },
  });

  const handleSaveSettings = () => {
    saveMutation.mutate({
      sleep_timer_enabled: sleepTimerEnabled,
      daily_limit_minutes: parseInt(dailyLimit),
      email_reports: emailReports,
    });
  };

  // Chart data
  const weeklyData = [
    { day: "Mon", homework: 12, science: 5, reading: 8 },
    { day: "Tue", homework: 8, science: 3, reading: 10 },
    { day: "Wed", homework: 15, science: 7, reading: 6 },
    { day: "Thu", homework: 10, science: 4, reading: 12 },
    { day: "Fri", homework: 6, science: 8, reading: 9 },
    { day: "Sat", homework: 3, science: 10, reading: 15 },
    { day: "Sun", homework: 5, science: 6, reading: 11 },
  ];

  const categoryData = [
    { name: "Homework", value: stats?.homework_tasks || 0 },
    { name: "Science", value: stats?.science_experiments || 0 },
    { name: "Reading", value: stats?.vocabulary_learned || 0 },
    { name: "Stories", value: stats?.stories_created || 0 },
    { name: "Drawing", value: stats?.drawings_made || 0 },
  ];

  if (!hasGoldPass) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 flex items-center justify-center px-4">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <Crown className="w-16 h-16 mx-auto text-amber-500 mb-4" />
            <CardTitle className="text-2xl text-amber-700">Gold Pass Required</CardTitle>
            <CardDescription>
              Parental Analytics Dashboard is available with the Unique Kids Gold Pass subscription.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={() => navigate("/kids-pricing")}
              className="w-full bg-gradient-to-r from-yellow-500 to-amber-500"
            >
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
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate("/kids-channel")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Kids Channel
          </Button>
          <Badge className="bg-gradient-to-r from-yellow-500 to-amber-500 gap-1">
            <Crown className="w-4 h-4" /> Gold Pass Active
          </Badge>
        </div>

        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Parental Dashboard 👨‍👩‍👧
          </h1>
          <p className="text-muted-foreground">
            Track your child's educational progress and manage screen time
          </p>
        </div>

        {/* Email Report Notice */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="flex items-center gap-4 py-4">
            <div className="bg-blue-100 rounded-full p-3">
              <Mail className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-blue-800">Monthly Educational Progress Reports</p>
              <p className="text-sm text-blue-600">Detailed progress report will be sent to your email at the end of each month.</p>
            </div>
            <Badge className="bg-blue-500">Active</Badge>
          </CardContent>
        </Card>

        <Tabs defaultValue="progress" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
            <TabsTrigger value="progress" className="gap-2">
              <BarChart3 className="w-4 h-4" /> Progress
            </TabsTrigger>
            <TabsTrigger value="time" className="gap-2">
              <Clock className="w-4 h-4" /> Time Limits
            </TabsTrigger>
            <TabsTrigger value="safety" className="gap-2">
              <Shield className="w-4 h-4" /> Safety
            </TabsTrigger>
          </TabsList>

          {/* Progress Tab */}
          <TabsContent value="progress" className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <Card className="bg-white/80">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-100 rounded-full p-2">
                      <Brain className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-purple-700">{stats?.homework_tasks || 0}</p>
                      <p className="text-xs text-muted-foreground">Homework Tasks</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/80">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-pink-100 rounded-full p-2">
                      <FlaskConical className="w-5 h-5 text-pink-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-pink-700">{stats?.science_experiments || 0}</p>
                      <p className="text-xs text-muted-foreground">Experiments</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/80">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-cyan-100 rounded-full p-2">
                      <BookOpen className="w-5 h-5 text-cyan-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-cyan-700">{stats?.vocabulary_learned || 0}</p>
                      <p className="text-xs text-muted-foreground">Words Learned</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/80">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 rounded-full p-2">
                      <BookOpen className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-700">{stats?.stories_created || 0}</p>
                      <p className="text-xs text-muted-foreground">Stories Created</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/80">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-amber-100 rounded-full p-2">
                      <Clock className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-amber-700">{stats?.total_time_minutes || 0}m</p>
                      <p className="text-xs text-muted-foreground">Total Time</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-white/80">
                <CardHeader>
                  <CardTitle className="text-lg">Weekly Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={weeklyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis />
                        <Tooltip />
                        <Area type="monotone" dataKey="homework" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                        <Area type="monotone" dataKey="science" stackId="1" stroke="#ec4899" fill="#ec4899" fillOpacity={0.6} />
                        <Area type="monotone" dataKey="reading" stackId="1" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.6} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80">
                <CardHeader>
                  <CardTitle className="text-lg">Activity Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}`}
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Time Limits Tab */}
          <TabsContent value="time" className="space-y-6">
            <Card className="bg-white/80">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Timer className="w-5 h-5 text-purple-600" />
                  Smart Sleep Timer
                </CardTitle>
                <CardDescription>
                  Set daily usage limits. When the limit is reached, a friendly message will suggest a break.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="sleep-timer">Enable Sleep Timer</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically remind your child to take breaks
                    </p>
                  </div>
                  <Switch
                    id="sleep-timer"
                    checked={sleepTimerEnabled}
                    onCheckedChange={setSleepTimerEnabled}
                  />
                </div>

                {sleepTimerEnabled && (
                  <div className="space-y-4 pt-4 border-t">
                    <div className="space-y-2">
                      <Label>Daily Usage Limit</Label>
                      <Select value={dailyLimit} onValueChange={setDailyLimit}>
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
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
                    <p className="text-sm text-muted-foreground">
                      Receive detailed progress reports via email
                    </p>
                  </div>
                  <Switch
                    id="email-reports"
                    checked={emailReports}
                    onCheckedChange={setEmailReports}
                  />
                </div>

                <Button 
                  onClick={handleSaveSettings}
                  disabled={saveMutation.isPending}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500"
                >
                  {saveMutation.isPending ? "Saving..." : "Save Settings"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Safety Tab */}
          <TabsContent value="safety" className="space-y-6">
            <Card className="bg-white/80">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-600" />
                  Safety Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 rounded-full p-2">
                      <Shield className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-green-800">AI Content Moderation</p>
                      <p className="text-sm text-green-600">All AI responses are double-moderated for safety</p>
                    </div>
                  </div>
                  <Badge className="bg-green-500">Active</Badge>
                </div>

                <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-100 rounded-full p-2">
                      <Brain className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-purple-800">Parental Gate</p>
                      <p className="text-sm text-purple-600">Math verification required for AI features</p>
                    </div>
                  </div>
                  <Badge className="bg-purple-500">Active</Badge>
                </div>

                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 rounded-full p-2">
                      <BookOpen className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-blue-800">Age-Appropriate Content</p>
                      <p className="text-sm text-blue-600">All content is curated for children</p>
                    </div>
                  </div>
                  <Badge className="bg-blue-500">Active</Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
