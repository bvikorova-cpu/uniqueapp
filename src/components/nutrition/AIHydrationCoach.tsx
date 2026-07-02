import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Droplets, Loader2, ArrowLeft, Sparkles, GlassWater } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAICredits } from "@/hooks/useAICredits";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface Props { onBack: () => void; }

export default function AIHydrationCoach({ onBack }: Props) {
  const { credits } = useAICredits();
  const [weight, setWeight] = useState("70");
  const [activity, setActivity] = useState("moderate");
  const [climate, setClimate] = useState("temperate");
  const [result, setResult] = useState<any>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('nutrition-hydration-coach', {
        body: { weight: Number(weight), activity_level: activity, climate }
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => { setResult(data.plan); toast.success("Hydration plan generated!"); },
    onError: (e: any) => toast.error(e.message || "Error generating plan"),
  });

  return (
    <>
      <FloatingHowItWorks title="AIHydrationCoach — How it works" steps={[{title:"Open this tool",desc:"Access AIHydrationCoach within the Health & Wellness section."},{title:"Configure",desc:"Adjust preferences, choose duration or select goals."},{title:"Start & interact",desc:"Begin the session, log data or run an AI analysis (some cost 3–5 credits)."},{title:"Review results",desc:"Check outcomes, save to history and track progress over time."}]} />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2 mb-2 drop-shadow-md">
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Button>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-border/60 bg-card/80 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20">
                <Droplets className="h-5 w-5 text-cyan-500" />
              </div>
              AI Hydration Coach
            </CardTitle>
            <CardDescription>Personalized water intake plan based on your body & lifestyle (3 credits)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Body Weight (kg)</Label>
              <Input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className="bg-background/50" />
            </div>
            <div className="space-y-2">
              <Label>Activity Level</Label>
              <Select value={activity} onValueChange={setActivity}>
                <SelectTrigger className="bg-background/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="sedentary">Sedentary</SelectItem>
                  <SelectItem value="light">Light Activity</SelectItem>
                  <SelectItem value="moderate">Moderate Activity</SelectItem>
                  <SelectItem value="intense">Intense Training</SelectItem>
                  <SelectItem value="athlete">Professional Athlete</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Climate</Label>
              <Select value={climate} onValueChange={setClimate}>
                <SelectTrigger className="bg-background/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="cold">Cold</SelectItem>
                  <SelectItem value="temperate">Temperate</SelectItem>
                  <SelectItem value="hot">Hot & Humid</SelectItem>
                  <SelectItem value="dry">Hot & Dry</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => mutation.mutate()} disabled={mutation.isPending || !credits || credits.credits_remaining < 3} className="w-full gap-2" size="lg">
              {mutation.isPending ? <><Loader2 className="h-5 w-5 animate-spin" /> Generating...</> : <><Sparkles className="h-5 w-5" /> Generate Plan (3 credits)</>}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/80 backdrop-blur-xl">
          <CardHeader><CardTitle>Your Hydration Plan</CardTitle></CardHeader>
          <CardContent>
            {result ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div className="text-center p-5 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-xl border border-cyan-500/20">
                  <Droplets className="h-10 w-10 mx-auto text-cyan-500 mb-2" />
                  <p className="text-3xl font-black text-cyan-500">{result.daily_target_ml || result.daily_target}ml</p>
                  <p className="text-sm text-muted-foreground">Daily Target</p>
                </div>
                {result.schedule && Array.isArray(result.schedule) && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Hydration Schedule</h4>
                    {result.schedule.map((item: any, i: number) => (
                      <div key={i} className="p-3 bg-muted/50 rounded-xl border border-border/40 flex justify-between items-center">
                        <span className="font-medium text-sm">{item.time}</span>
                        <span className="text-xs text-muted-foreground">{item.amount || item.ml}ml - {item.note || item.reason}</span>
                      </div>
                    ))}
                  </div>
                )}
                {result.tips && Array.isArray(result.tips) && (
                  <div className="space-y-1">
                    <h4 className="font-semibold text-sm">Tips</h4>
                    {result.tips.map((tip: string, i: number) => (
                      <p key={i} className="text-sm text-muted-foreground">💧 {tip}</p>
                    ))}
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                <div className="text-center">
                  <Droplets className="h-12 w-12 mx-auto mb-2 opacity-30" />
                  <p>Your hydration plan will appear here</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
    </>);
}
