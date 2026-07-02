import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Activity, Loader2, ArrowLeft, Sparkles, TrendingUp, TrendingDown, Scale } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAICredits } from "@/hooks/useAICredits";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface Props { onBack: () => void; }

export default function AIBodyCompositionPredictor({ onBack }: Props) {
  const { credits } = useAICredits();
  const [weight, setWeight] = useState("75");
  const [height, setHeight] = useState("175");
  const [bodyFat, setBodyFat] = useState("20");
  const [activity, setActivity] = useState("moderate");
  const [calories, setCalories] = useState("2000");
  const [timeframe, setTimeframe] = useState("90");
  const [result, setResult] = useState<any>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('nutrition-body-predictor', {
        body: { weight: Number(weight), height: Number(height), body_fat_percent: Number(bodyFat), activity_level: activity, daily_calories: Number(calories), timeframe_days: Number(timeframe) }
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => { setResult(data.prediction); toast.success("Body composition predicted!"); },
    onError: (e: any) => toast.error(e.message || "Error predicting"),
  });

  return (
    <>
      <FloatingHowItWorks title="AIBodyCompositionPredictor — How it works" steps={[{title:"Open this tool",desc:"Access AIBodyCompositionPredictor within the Health & Wellness section."},{title:"Configure",desc:"Adjust preferences, choose duration or select goals."},{title:"Start & interact",desc:"Begin the session, log data or run an AI analysis (some cost 3–5 credits)."},{title:"Review results",desc:"Check outcomes, save to history and track progress over time."}]} />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2 mb-2 drop-shadow-md">
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Button>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-border/60 bg-card/80 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-violet-500/20 to-purple-500/20">
                <Activity className="h-5 w-5 text-violet-500" />
              </div>
              AI Body Composition Predictor
            </CardTitle>
            <CardDescription>Predict your body changes over 30/60/90 days (10 credits)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Current Weight (kg)</Label>
                <Input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className="bg-background/50" />
              </div>
              <div className="space-y-2">
                <Label>Height (cm)</Label>
                <Input type="number" value={height} onChange={(e) => setHeight(e.target.value)} className="bg-background/50" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Body Fat %</Label>
                <Input type="number" value={bodyFat} onChange={(e) => setBodyFat(e.target.value)} className="bg-background/50" />
              </div>
              <div className="space-y-2">
                <Label>Daily Calories</Label>
                <Input type="number" value={calories} onChange={(e) => setCalories(e.target.value)} className="bg-background/50" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Activity Level</Label>
                <Select value={activity} onValueChange={setActivity}>
                  <SelectTrigger className="bg-background/50"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sedentary">Sedentary</SelectItem>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="intense">Intense</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Timeframe</Label>
                <Select value={timeframe} onValueChange={setTimeframe}>
                  <SelectTrigger className="bg-background/50"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 Days</SelectItem>
                    <SelectItem value="60">60 Days</SelectItem>
                    <SelectItem value="90">90 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={() => mutation.mutate()} disabled={mutation.isPending || !credits || credits.credits_remaining < 10} className="w-full gap-2" size="lg">
              {mutation.isPending ? <><Loader2 className="h-5 w-5 animate-spin" /> Predicting...</> : <><Sparkles className="h-5 w-5" /> Predict Changes (10 credits)</>}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/80 backdrop-blur-xl">
          <CardHeader><CardTitle>Predicted Results</CardTitle></CardHeader>
          <CardContent>
            {result ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl border border-primary/20 text-center">
                    <Scale className="h-5 w-5 mx-auto text-primary mb-1" />
                    <p className="text-xs text-muted-foreground">Predicted Weight</p>
                    <p className="text-2xl font-black">{result.predicted_weight || "—"}kg</p>
                    {result.weight_change && (
                      <div className="flex items-center justify-center gap-1 mt-1">
                        {result.weight_change < 0 ? <TrendingDown className="h-4 w-4 text-green-500" /> : <TrendingUp className="h-4 w-4 text-orange-500" />}
                        <span className="text-sm font-medium">{result.weight_change}kg</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4 bg-gradient-to-br from-violet-500/10 to-purple-500/10 rounded-xl border border-violet-500/20 text-center">
                    <Activity className="h-5 w-5 mx-auto text-violet-500 mb-1" />
                    <p className="text-xs text-muted-foreground">Predicted Body Fat</p>
                    <p className="text-2xl font-black">{result.predicted_body_fat || "—"}%</p>
                    {result.fat_change && (
                      <div className="flex items-center justify-center gap-1 mt-1">
                        {result.fat_change < 0 ? <TrendingDown className="h-4 w-4 text-green-500" /> : <TrendingUp className="h-4 w-4 text-orange-500" />}
                        <span className="text-sm font-medium">{result.fat_change}%</span>
                      </div>
                    )}
                  </div>
                </div>
                {result.muscle_mass && (
                  <div className="p-3 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl border border-blue-500/20 text-center">
                    <p className="text-xs text-muted-foreground">Predicted Muscle Mass</p>
                    <p className="text-xl font-black">{result.muscle_mass}kg</p>
                  </div>
                )}
                {result.recommendations && Array.isArray(result.recommendations) && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">AI Recommendations</h4>
                    {result.recommendations.map((rec: string, i: number) => (
                      <p key={i} className="text-sm text-muted-foreground p-2.5 bg-muted/50 rounded-xl border border-border/30">💡 {rec}</p>
                    ))}
                  </div>
                )}
                {result.milestones && Array.isArray(result.milestones) && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">🏆 Milestones</h4>
                    {result.milestones.map((m: any, i: number) => (
                      <div key={i} className="p-2.5 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/20 flex justify-between">
                        <span className="text-sm font-medium">{m.day ? `Day ${m.day}` : m.label}</span>
                        <span className="text-sm text-muted-foreground">{m.description || m.value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                <div className="text-center">
                  <Activity className="h-12 w-12 mx-auto mb-2 opacity-30" />
                  <p>Your body composition prediction will appear here</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
    </>);
}
