import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
} from "recharts";
import { Brain, TrendingUp, BarChart3, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIQProgress, useIQUserStats } from "@/hooks/useIQUserStats";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
const DOMAINS = ["Memory", "Logic", "Spatial", "Verbal", "Speed", "Pattern"];

export default function IQProgressCharts() {
  const { data: progress, isLoading: loadingProgress } = useIQProgress();
  const { data: stats, isLoading: loadingStats } = useIQUserStats();

  const trendData = (progress ?? [])
    .slice()
    .reverse()
    .map((r, i) => ({
      label: `#${i + 1}`,
      iq: r.iq_score,
      percentile: r.percentile,
    }));

  const radarData = DOMAINS.map((d) => ({
    domain: d,
    score: Number(stats?.sub_scores?.[d.toLowerCase()] ?? 0),
  }));

  const noData = !loadingProgress && trendData.length === 0;

  return (
    <>
      <FloatingHowItWorks title="How IQProgress Charts works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <div className="mb-8">
      <h2 className="text-xl sm:text-2xl font-black mb-4">📈 IQ Progress Tracking</h2>
      <Tabs defaultValue="iq" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 h-auto p-1">
          <TabsTrigger value="iq" className="text-xs"><TrendingUp className="h-3 w-3 mr-1" /> IQ Trend</TabsTrigger>
          <TabsTrigger value="radar" className="text-xs"><Brain className="h-3 w-3 mr-1" /> Cognitive Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="iq">
          <Card className="bg-gradient-to-br from-blue-500/5 to-indigo-500/5 border-blue-500/20">
            <CardHeader className="p-4">
              <CardTitle className="text-base">IQ Score Over Time</CardTitle>
              <CardDescription className="text-xs">
                {trendData.length > 0
                  ? `Last ${trendData.length} tests · Best ${stats?.best_iq ?? "—"} · Latest ${stats?.latest_iq ?? "—"}`
                  : "Take your first test to see your progress"}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              {loadingProgress ? (
                <div className="h-[250px] flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : noData ? (
                <div className="h-[200px] flex items-center justify-center text-sm text-muted-foreground">
                  <BarChart3 className="h-8 w-8 mr-2 opacity-40" />
                  No test history yet.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="label" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis domain={["dataMin - 5", "dataMax + 5"]} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                    <Line type="monotone" dataKey="iq" stroke="hsl(217, 91%, 60%)" strokeWidth={3} dot={{ fill: "hsl(217, 91%, 60%)", r: 4 }} name="IQ" />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="radar">
          <Card className="bg-gradient-to-br from-purple-500/5 to-violet-500/5 border-purple-500/20">
            <CardHeader className="p-4">
              <CardTitle className="text-base">Cognitive Profile</CardTitle>
              <CardDescription className="text-xs">Your strengths across 6 cognitive domains (best per area)</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              {loadingStats ? (
                <div className="h-[280px] flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis dataKey="domain" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                    <PolarRadiusAxis tick={{ fontSize: 9 }} domain={[0, 100]} />
                    <Radar dataKey="score" stroke="hsl(280, 67%, 55%)" fill="hsl(280, 67%, 55%)" fillOpacity={0.3} />
                  </RadarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
    </>
    );
}
