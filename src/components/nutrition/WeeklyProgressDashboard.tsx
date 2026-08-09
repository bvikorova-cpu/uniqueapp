import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BarChart3, Loader2, ArrowLeft, Sparkles, TrendingUp, Award, Target } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAICredits } from "@/hooks/useAICredits";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface Props { onBack: () => void; }

const COLORS = ["#8b5cf6", "#06b6d4", "#f59e0b", "#ef4444", "#10b981"];

export default function WeeklyProgressDashboard({ onBack }: Props) {
  const { credits } = useAICredits();
  const [avgCalories, setAvgCalories] = useState("2000");
  const [avgProtein, setAvgProtein] = useState("120");
  const [workoutsPerWeek, setWorkoutsPerWeek] = useState("4");
  const [currentWeight, setCurrentWeight] = useState("75");
  const [result, setResult] = useState<any>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('nutrition-router', {
        body: { action: 'weekly_progress', avg_daily_calories: Number(avgCalories), avg_daily_protein: Number(avgProtein), workouts_per_week: Number(workoutsPerWeek), current_weight: Number(currentWeight) }
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => { setResult(data.report); toast.success("Progress report generated!"); },
    onError: (e: any) => toast.error(e.message || "Error generating report") });

  return (
    <>
      <FloatingHowItWorks title="WeeklyProgressDashboard — How it works" steps={[{title:"Open this tool",desc:"Access WeeklyProgressDashboard within the Health & Wellness section."},{title:"Configure",desc:"Adjust preferences, choose duration or select goals."},{title:"Start & interact",desc:"Begin the session, log data or run an AI analysis (some cost 3–5 credits)."},{title:"Review results",desc:"Check outcomes, save to history and track progress over time."}]} />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2 mb-2 drop-shadow-md">
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Button>

      <Card className="border-border/60 bg-card/80 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-violet-500/20 to-indigo-500/20">
              <BarChart3 className="h-5 w-5 text-violet-500" />
            </div>
            Weekly Progress Dashboard
          </CardTitle>
          <CardDescription>AI-powered weekly analysis with visual charts (6 credits)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-4 gap-4 mb-6">
            <div className="space-y-2">
              <Label>Avg Daily Calories</Label>
              <Input type="number" value={avgCalories} onChange={(e) => setAvgCalories(e.target.value)} className="bg-background/50" />
            </div>
            <div className="space-y-2">
              <Label>Avg Daily Protein (g)</Label>
              <Input type="number" value={avgProtein} onChange={(e) => setAvgProtein(e.target.value)} className="bg-background/50" />
            </div>
            <div className="space-y-2">
              <Label>Workouts/Week</Label>
              <Input type="number" value={workoutsPerWeek} onChange={(e) => setWorkoutsPerWeek(e.target.value)} className="bg-background/50" />
            </div>
            <div className="space-y-2">
              <Label>Current Weight (kg)</Label>
              <Input type="number" value={currentWeight} onChange={(e) => setCurrentWeight(e.target.value)} className="bg-background/50" />
            </div>
          </div>
          <Button onClick={() => mutation.mutate()} disabled={mutation.isPending || !credits || credits.credits_remaining < 6} className="w-full gap-2" size="lg">
            {mutation.isPending ? <><Loader2 className="h-5 w-5 animate-spin" /> Analyzing...</> : <><Sparkles className="h-5 w-5" /> Generate Weekly Report (6 credits)</>}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Score Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Overall Score", value: `${result.overall_score || 0}/100`, icon: Award, gradient: "from-violet-500/10 to-purple-500/10", border: "border-violet-500/20", color: "text-violet-500" },
              { label: "Nutrition Grade", value: result.nutrition_grade || "B+", icon: Target, gradient: "from-green-500/10 to-emerald-500/10", border: "border-green-500/20", color: "text-green-500" },
              { label: "Weekly Trend", value: result.weight_trend || "Stable", icon: TrendingUp, gradient: "from-blue-500/10 to-cyan-500/10", border: "border-blue-500/20", color: "text-blue-500" },
              { label: "Consistency", value: `${result.consistency_percent || 0}%`, icon: BarChart3, gradient: "from-orange-500/10 to-amber-500/10", border: "border-orange-500/20", color: "text-orange-500" },
            ].map((card, i) => (
              <Card key={i} className={`p-4 bg-gradient-to-br ${card.gradient} ${card.border} border backdrop-blur-xl text-center`}>
                <card.icon className={`h-6 w-6 mx-auto ${card.color} mb-1`} />
                <p className="text-xs text-muted-foreground">{card.label}</p>
                <p className="text-2xl font-black">{card.value}</p>
              </Card>
            ))}
          </div>

          {/* Charts */}
          <div className="grid lg:grid-cols-2 gap-6">
            {result.daily_calories_chart && Array.isArray(result.daily_calories_chart) && (
              <Card className="p-4 border-border/60 bg-card/80 backdrop-blur-xl">
                <h4 className="font-bold text-sm mb-3">📊 Daily Calorie Intake</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={result.daily_calories_chart}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip />
                    <Bar dataKey="calories" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            )}

            {result.macro_distribution && Array.isArray(result.macro_distribution) && (
              <Card className="p-4 border-border/60 bg-card/80 backdrop-blur-xl">
                <h4 className="font-bold text-sm mb-3">🥗 Macro Distribution</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={result.macro_distribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, value }) => `${name}: ${value}%`}>
                      {result.macro_distribution.map((_: any, i: number) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            )}

            {result.weight_projection && Array.isArray(result.weight_projection) && (
              <Card className="p-4 border-border/60 bg-card/80 backdrop-blur-xl lg:col-span-2">
                <h4 className="font-bold text-sm mb-3">📈 Weight Projection (4 weeks)</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={result.weight_projection}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="week" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" domain={['auto', 'auto']} />
                    <Tooltip />
                    <Line type="monotone" dataKey="weight" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            )}
          </div>

          {/* Summary */}
          {result.summary && (
            <Card className="p-4 border-border/60 bg-card/80 backdrop-blur-xl">
              <h4 className="font-bold text-sm mb-2">📝 Week Summary</h4>
              <AiMarkdown content={String(result.summary)} />
            </Card>
          )}

          {/* Energy balance */}
          {(result.estimated_tdee || result.calorie_balance_per_day || result.protein_per_kg) && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: "Estimated TDEE", value: result.estimated_tdee ? `${Math.round(result.estimated_tdee)} kcal` : "—" },
                { label: "Daily Balance", value: result.calorie_balance_per_day != null ? `${result.calorie_balance_per_day > 0 ? "+" : ""}${Math.round(result.calorie_balance_per_day)} kcal` : "—" },
                { label: "Protein / kg", value: result.protein_per_kg ? `${Number(result.protein_per_kg).toFixed(1)} g/kg` : "—" },
              ].map((m) => (
                <Card key={m.label} className="p-4 border-border/60 bg-card/80 backdrop-blur-xl text-center">
                  <p className="text-xs text-muted-foreground">{m.label}</p>
                  <p className="text-xl font-black">{m.value}</p>
                </Card>
              ))}
            </div>
          )}

          {/* Key metrics */}
          {Array.isArray(result.key_metrics) && result.key_metrics.length > 0 && (
            <Card className="p-4 border-border/60 bg-card/80 backdrop-blur-xl">
              <h4 className="font-bold text-sm mb-3">📌 Key Metrics</h4>
              <div className="grid sm:grid-cols-2 gap-2">
                {result.key_metrics.map((m: any, i: number) => (
                  <div key={i} className={`p-2.5 rounded-xl border text-sm ${
                    m.status === "risk" ? "bg-destructive/5 border-destructive/20"
                      : m.status === "watch" ? "bg-amber-500/5 border-amber-500/20"
                      : "bg-emerald-500/5 border-emerald-500/20"}`}>
                    <div className="flex justify-between gap-2 font-medium">
                      <span>{m.label}</span><span>{m.value}</span>
                    </div>
                    {m.note && <p className="text-xs text-muted-foreground mt-1">{m.note}</p>}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Training & recovery */}
          {(result.training_volume_assessment || result.recovery_assessment) && (
            <div className="grid sm:grid-cols-2 gap-4">
              {result.training_volume_assessment && (
                <Card className="p-4 border-border/60 bg-card/80 backdrop-blur-xl">
                  <h4 className="font-bold text-sm mb-2">🏋️ Training Volume</h4>
                  <AiMarkdown content={String(result.training_volume_assessment)} />
                </Card>
              )}
              {result.recovery_assessment && (
                <Card className="p-4 border-border/60 bg-card/80 backdrop-blur-xl">
                  <h4 className="font-bold text-sm mb-2">😴 Recovery</h4>
                  <AiMarkdown content={String(result.recovery_assessment)} />
                </Card>
              )}
            </div>
          )}

          {/* Wins / improvements / risks */}
          <div className="grid sm:grid-cols-2 gap-4">
            {Array.isArray(result.wins) && result.wins.length > 0 && (
              <Card className="p-4 border-emerald-500/20 bg-emerald-500/5 backdrop-blur-xl">
                <h4 className="font-bold text-sm mb-2">✅ Wins This Week</h4>
                <ul className="space-y-1.5 text-sm text-muted-foreground">
                  {result.wins.map((w: string, i: number) => <li key={i}>• {w}</li>)}
                </ul>
              </Card>
            )}
            {Array.isArray(result.improvements) && result.improvements.length > 0 && (
              <Card className="p-4 border-amber-500/20 bg-amber-500/5 backdrop-blur-xl">
                <h4 className="font-bold text-sm mb-2">🔧 To Improve</h4>
                <ul className="space-y-1.5 text-sm text-muted-foreground">
                  {result.improvements.map((w: string, i: number) => <li key={i}>• {w}</li>)}
                </ul>
              </Card>
            )}
          </div>

          {Array.isArray(result.risk_flags) && result.risk_flags.length > 0 && (
            <Card className="p-4 border-destructive/20 bg-destructive/5 backdrop-blur-xl">
              <h4 className="font-bold text-sm mb-2">⚠️ Risk Flags</h4>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                {result.risk_flags.map((w: string, i: number) => <li key={i}>• {w}</li>)}
              </ul>
            </Card>
          )}

          {/* AI Insights */}
          {result.insights && Array.isArray(result.insights) && (
            <Card className="p-4 border-border/60 bg-card/80 backdrop-blur-xl">
              <h4 className="font-bold text-sm mb-3">🧠 AI Insights</h4>
              <div className="space-y-2">
                {result.insights.map((insight: string, i: number) => (
                  <p key={i} className="text-sm text-muted-foreground p-2.5 bg-muted/50 rounded-xl border border-border/30">💡 {insight}</p>
                ))}
              </div>
            </Card>
          )}

          {/* Next week targets */}
          {result.next_week_targets && typeof result.next_week_targets === "object" && (
            <Card className="p-4 border-border/60 bg-card/80 backdrop-blur-xl">
              <h4 className="font-bold text-sm mb-3">🎯 Next Week Targets</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                {[
                  { label: "Calories", value: result.next_week_targets.calories, unit: "kcal" },
                  { label: "Protein", value: result.next_week_targets.protein_g, unit: "g" },
                  { label: "Carbs", value: result.next_week_targets.carbs_g, unit: "g" },
                  { label: "Fat", value: result.next_week_targets.fat_g, unit: "g" },
                  { label: "Workouts", value: result.next_week_targets.workouts, unit: "" },
                  { label: "Steps/day", value: result.next_week_targets.steps_per_day, unit: "" },
                ].map((t) => (
                  <div key={t.label} className="p-2.5 bg-muted/50 rounded-xl border border-border/30 text-center">
                    <p className="text-xs text-muted-foreground">{t.label}</p>
                    <p className="text-sm font-bold">{t.value != null ? `${Math.round(Number(t.value))}${t.unit}` : "—"}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Action Plan */}
          {result.action_plan && Array.isArray(result.action_plan) && (
            <Card className="p-4 border-border/60 bg-card/80 backdrop-blur-xl">
              <h4 className="font-bold text-sm mb-3">🎯 Next Week Action Plan</h4>
              <div className="grid sm:grid-cols-2 gap-2">
                {result.action_plan.map((action: string, i: number) => (
                  <div key={i} className="p-2.5 bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl border border-primary/10">
                    <p className="text-sm font-medium">#{i + 1} {action}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Focus, timing, supplements */}
          <div className="grid sm:grid-cols-2 gap-4">
            {Array.isArray(result.next_week_focus) && result.next_week_focus.length > 0 && (
              <Card className="p-4 border-border/60 bg-card/80 backdrop-blur-xl">
                <h4 className="font-bold text-sm mb-2">🔭 Focus Areas</h4>
                <ul className="space-y-1.5 text-sm text-muted-foreground">
                  {result.next_week_focus.map((w: string, i: number) => <li key={i}>• {w}</li>)}
                </ul>
              </Card>
            )}
            {Array.isArray(result.meal_timing_advice) && result.meal_timing_advice.length > 0 && (
              <Card className="p-4 border-border/60 bg-card/80 backdrop-blur-xl">
                <h4 className="font-bold text-sm mb-2">⏰ Meal Timing</h4>
                <ul className="space-y-1.5 text-sm text-muted-foreground">
                  {result.meal_timing_advice.map((w: string, i: number) => <li key={i}>• {w}</li>)}
                </ul>
              </Card>
            )}
          </div>

          {Array.isArray(result.supplement_notes) && result.supplement_notes.length > 0 && (
            <Card className="p-4 border-border/60 bg-card/80 backdrop-blur-xl">
              <h4 className="font-bold text-sm mb-2">💊 Supplement Notes</h4>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                {result.supplement_notes.map((w: string, i: number) => <li key={i}>• {w}</li>)}
              </ul>
            </Card>
          )}

          {result.disclaimer && (
            <p className="text-xs text-muted-foreground text-center">{result.disclaimer}</p>
          )}
        </motion.div>
      )}
    </motion.div>
    </>);
}

