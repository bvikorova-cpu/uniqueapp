import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Smile, Sparkles, Loader2, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useMoodLogs, useAddMoodLog, useWeeklyInsight } from "@/hooks/useSafetyExtras";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { format, parseISO } from "date-fns";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export function MoodTracker() {
  const { data: logs = [] } = useMoodLogs(30);
  const addLog = useAddMoodLog();
  const { insight, generate } = useWeeklyInsight();
  const [mood, setMood] = useState(7);
  const [energy, setEnergy] = useState(5);
  const [anxiety, setAnxiety] = useState(4);

  const chartData = logs.map((l: any) => ({
    date: format(parseISO(l.logged_at), "MM/dd"),
    Mood: l.mood_score,
    Energy: l.energy_score || 0,
    Anxiety: l.anxiety_score || 0,
  }));

  const TrendIcon = insight?.trend === "improving" ? TrendingUp : insight?.trend === "declining" ? TrendingDown : Minus;
  const trendColor = insight?.trend === "improving" ? "text-emerald-400" : insight?.trend === "declining" ? "text-red-400" : "text-muted-foreground";

  return (
    <>
      <FloatingHowItWorks title={"Mood Tracker - How it works"} steps={[{ title: 'Open', desc: 'Access the Mood Tracker section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Mood Tracker.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="grid lg:grid-cols-2 gap-4">
      <Card className="border-teal-500/30 bg-card/60 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Smile className="h-4 w-4 text-teal-400" /> Quick Mood Log
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-xs text-muted-foreground">Mood: <span className="font-bold text-foreground">{mood}/10</span></label>
            <Slider value={[mood]} onValueChange={([v]) => setMood(v)} min={1} max={10} step={1} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Energy: <span className="font-bold text-foreground">{energy}/10</span></label>
            <Slider value={[energy]} onValueChange={([v]) => setEnergy(v)} min={1} max={10} step={1} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Anxiety: <span className="font-bold text-foreground">{anxiety}/10</span></label>
            <Slider value={[anxiety]} onValueChange={([v]) => setAnxiety(v)} min={1} max={10} step={1} />
          </div>
          <Button
            className="w-full bg-teal-600 hover:bg-teal-500"
            disabled={addLog.isPending}
            onClick={() => addLog.mutate({ mood_score: mood, energy_score: energy, anxiety_score: anxiety })}
          >
            {addLog.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Log Today"}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-border/40 bg-card/60 backdrop-blur-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">30-day Trend</CardTitle>
          <Button size="sm" variant="outline" onClick={() => generate.mutate()} disabled={generate.isPending} className="border-amber-500/40">
            <Sparkles className="h-3 w-3 mr-1 text-amber-400" />
            {generate.isPending ? "..." : "AI Insight (5 cr)"}
          </Button>
        </CardHeader>
        <CardContent>
          {chartData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">Log moods to see trends</div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                <YAxis domain={[0, 10]} stroke="hsl(var(--muted-foreground))" fontSize={10} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="Mood" stroke="hsl(180, 70%, 50%)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Energy" stroke="hsl(45, 90%, 55%)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Anxiety" stroke="hsl(0, 70%, 60%)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
          {insight && (
            <div className="mt-3 p-3 rounded-lg bg-amber-500/5 border border-amber-500/30">
              <div className={`flex items-center gap-1 text-xs font-bold ${trendColor} mb-1`}>
                <TrendIcon className="h-3 w-3" /> Trend: {insight.trend}
              </div>
              <p className="text-xs text-foreground/85">{insight.insight_text}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
    </>
  );
}
