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
import { useKidsGoldPass } from "@/hooks/useKidsGoldPass";

import { ParentalHero } from "@/components/kids/parental/ParentalHero";
import { ChildProfileCards } from "@/components/kids/parental/ChildProfileCards";
import { AnimatedStats } from "@/components/kids/parental/AnimatedStats";
import { EnhancedCharts } from "@/components/kids/parental/EnhancedCharts";
import { WeeklyDigest } from "@/components/kids/parental/WeeklyDigest";
import { ContentBlocking } from "@/components/kids/parental/ContentBlocking";
import { AchievementTracking } from "@/components/kids/parental/AchievementTracking";
import { ActivityTimeline } from "@/components/kids/parental/ActivityTimeline";

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

  const { data: stats } = useQuery({
    queryKey: ["parental-stats", user?.id],
    queryFn: async () => ({
      homework_tasks: Math.floor(Math.random() * 30) + 10,
      science_experiments: Math.floor(Math.random() * 15) + 5,
      vocabulary_learned: Math.floor(Math.random() * 50) + 20,
      stories_created: Math.floor(Math.random() * 10) + 2,
      drawings_made: Math.floor(Math.random() * 8) + 3,
      total_time_minutes: Math.floor(Math.random() * 300) + 100,
    } as UsageStats),
    enabled: !!user,
  });

  const { data: settings } = useQuery({
    queryKey: ["parental-settings", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const stored = localStorage.getItem(`kids_parental_settings_${user.id}`);
      return stored ? JSON.parse(stored) : null;
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
      localStorage.setItem(`kids_parental_settings_${user.id}`, JSON.stringify(data));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parental-settings"] });
      toast.success("Nastavenia uložené!");
    },
    onError: () => {
      toast.error("Nepodarilo sa uložiť nastavenia");
    },
  });

  const handleSaveSettings = () => {
    saveMutation.mutate({
      sleep_timer_enabled: sleepTimerEnabled,
      daily_limit_minutes: parseInt(dailyLimit),
      email_reports: emailReports,
    });
  };

  const weeklyData = [
    { day: "Po", homework: 12, science: 5, reading: 8 },
    { day: "Ut", homework: 8, science: 3, reading: 10 },
    { day: "St", homework: 15, science: 7, reading: 6 },
    { day: "Št", homework: 10, science: 4, reading: 12 },
    { day: "Pi", homework: 6, science: 8, reading: 9 },
    { day: "So", homework: 3, science: 10, reading: 15 },
    { day: "Ne", homework: 5, science: 6, reading: 11 },
  ];

  const categoryData = [
    { name: "Úlohy", value: stats?.homework_tasks || 0 },
    { name: "Veda", value: stats?.science_experiments || 0 },
    { name: "Čítanie", value: stats?.vocabulary_learned || 0 },
    { name: "Príbehy", value: stats?.stories_created || 0 },
    { name: "Kresby", value: stats?.drawings_made || 0 },
  ];

  if (!hasGoldPass) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 flex items-center justify-center px-4">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <Crown className="w-16 h-16 mx-auto text-amber-500 mb-4" />
            <CardTitle className="text-2xl text-amber-700">Vyžaduje sa Gold Pass</CardTitle>
            <CardDescription>
              Rodičovský analytický panel je dostupný s predplatným Unique Kids Gold Pass.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={() => navigate("/kids-pricing")}
              className="w-full bg-gradient-to-r from-yellow-500 to-amber-500"
            >
              Získať Gold Pass
            </Button>
            <Button variant="outline" onClick={() => navigate("/kids-channel")}>
              Späť na Kids Channel
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-8 px-4 pt-24">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate("/kids-channel")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Späť na Kids Channel
          </Button>
          <Badge className="bg-gradient-to-r from-yellow-500 to-amber-500 gap-1">
            <Crown className="w-4 h-4" /> Gold Pass Active
          </Badge>
        </div>

        {/* Hero */}
        <ParentalHero />

        {/* Child Profiles */}
        <ChildProfileCards />

        {/* Email Report Notice */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="flex items-center gap-4 py-4">
            <div className="bg-blue-100 rounded-full p-3">
              <Mail className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-blue-800">Mesačné reporty o pokroku</p>
              <p className="text-sm text-blue-600">Podrobný report bude zaslaný na váš email na konci každého mesiaca.</p>
            </div>
            <Badge className="bg-blue-500">Aktívne</Badge>
          </CardContent>
        </Card>

        <Tabs defaultValue="progress" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 max-w-2xl mx-auto">
            <TabsTrigger value="progress" className="gap-1 text-xs">
              <BarChart3 className="w-3.5 h-3.5" /> Pokrok
            </TabsTrigger>
            <TabsTrigger value="time" className="gap-1 text-xs">
              <Timer className="w-3.5 h-3.5" /> Limity
            </TabsTrigger>
            <TabsTrigger value="safety" className="gap-1 text-xs">
              <Shield className="w-3.5 h-3.5" /> Bezpečnosť
            </TabsTrigger>
            <TabsTrigger value="digest" className="gap-1 text-xs">
              <Trophy className="w-3.5 h-3.5" /> Prehľad
            </TabsTrigger>
            <TabsTrigger value="achievements" className="gap-1 text-xs">
              <Crown className="w-3.5 h-3.5" /> Odznaky
            </TabsTrigger>
            <TabsTrigger value="timeline" className="gap-1 text-xs">
              <Clock className="w-3.5 h-3.5" /> Aktivita
            </TabsTrigger>
          </TabsList>

          {/* Progress Tab */}
          <TabsContent value="progress" className="space-y-6">
            <AnimatedStats stats={stats} />
            <EnhancedCharts weeklyData={weeklyData} categoryData={categoryData} />
          </TabsContent>

          {/* Time Limits Tab */}
          <TabsContent value="time" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Timer className="w-5 h-5 text-purple-600" />
                  Smart Sleep Timer
                </CardTitle>
                <CardDescription>
                  Nastavte denné limity používania. Po dosiahnutí limitu sa zobrazí priateľská správa.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="sleep-timer">Zapnúť Sleep Timer</Label>
                    <p className="text-sm text-muted-foreground">Automaticky pripomenie dieťaťu prestávku</p>
                  </div>
                  <Switch id="sleep-timer" checked={sleepTimerEnabled} onCheckedChange={setSleepTimerEnabled} />
                </div>

                {sleepTimerEnabled && (
                  <div className="space-y-4 pt-4 border-t">
                    <div className="space-y-2">
                      <Label>Denný limit</Label>
                      <Select value={dailyLimit} onValueChange={setDailyLimit}>
                        <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="30">30 minút</SelectItem>
                          <SelectItem value="45">45 minút</SelectItem>
                          <SelectItem value="60">1 hodina</SelectItem>
                          <SelectItem value="90">1,5 hodiny</SelectItem>
                          <SelectItem value="120">2 hodiny</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Card className="bg-blue-50 border-blue-200">
                      <CardContent className="pt-4">
                        <p className="text-sm text-blue-700">
                          💡 Po dosiahnutí limitu dieťa uvidí priateľskú správu od magickej postavy,
                          ktorá mu navrhne ísť sa hrať von, čítať knihu alebo tráviť čas s rodinou.
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="space-y-1">
                    <Label htmlFor="email-reports">Mesačné emailové reporty</Label>
                    <p className="text-sm text-muted-foreground">Dostávajte podrobné reporty o pokroku</p>
                  </div>
                  <Switch id="email-reports" checked={emailReports} onCheckedChange={setEmailReports} />
                </div>

                <Button
                  onClick={handleSaveSettings}
                  disabled={saveMutation.isPending}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500"
                >
                  {saveMutation.isPending ? "Ukladám..." : "Uložiť nastavenia"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Safety Tab */}
          <TabsContent value="safety" className="space-y-6">
            <ContentBlocking />

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-600" />
                  Bezpečnostné funkcie
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { icon: <Shield className="w-5 h-5 text-green-600" />, bg: "bg-green-50", label: "AI moderácia obsahu", desc: "Všetky AI odpovede sú dvojito moderované", color: "text-green-800", descColor: "text-green-600", badge: "bg-green-500" },
                  { icon: <Brain className="w-5 h-5 text-purple-600" />, bg: "bg-purple-50", label: "Rodičovská brána", desc: "Matematické overenie pre AI funkcie", color: "text-purple-800", descColor: "text-purple-600", badge: "bg-purple-500" },
                  { icon: <BookOpen className="w-5 h-5 text-blue-600" />, bg: "bg-blue-50", label: "Vekovo vhodný obsah", desc: "Všetok obsah je kurátorsky vybraný pre deti", color: "text-blue-800", descColor: "text-blue-600", badge: "bg-blue-500" },
                ].map((item, i) => (
                  <div key={i} className={`flex items-center justify-between p-4 ${item.bg} rounded-xl`}>
                    <div className="flex items-center gap-3">
                      <div className={`${item.bg} rounded-full p-2`}>{item.icon}</div>
                      <div>
                        <p className={`font-medium ${item.color}`}>{item.label}</p>
                        <p className={`text-sm ${item.descColor}`}>{item.desc}</p>
                      </div>
                    </div>
                    <Badge className={item.badge}>Aktívne</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Weekly Digest Tab */}
          <TabsContent value="digest">
            <WeeklyDigest />
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements">
            <AchievementTracking />
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline">
            <ActivityTimeline />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
