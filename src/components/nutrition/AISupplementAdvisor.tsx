import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pill, Loader2, ArrowLeft, Sparkles, AlertTriangle } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAICredits } from "@/hooks/useAICredits";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface Props { onBack: () => void; }

export default function AISupplementAdvisor({ onBack }: Props) {
  const { credits } = useAICredits();
  const [age, setAge] = useState("30");
  const [gender, setGender] = useState("male");
  const [diet, setDiet] = useState("");
  const [goals, setGoals] = useState("");
  const [result, setResult] = useState<any>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('nutrition-supplement-advisor', {
        body: { age: Number(age), gender, current_diet: diet, health_goals: goals }
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => { setResult(data.recommendations); toast.success("Supplement plan ready!"); },
    onError: (e: any) => toast.error(e.message || "Error generating recommendations"),
  });

  return (
    <>
      <FloatingHowItWorks title="AISupplementAdvisor — How it works" steps={[{title:"Open this tool",desc:"Access AISupplementAdvisor within the Health & Wellness section."},{title:"Configure",desc:"Adjust preferences, choose duration or select goals."},{title:"Start & interact",desc:"Begin the session, log data or run an AI analysis (some cost 3–5 credits)."},{title:"Review results",desc:"Check outcomes, save to history and track progress over time."}]} />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2 mb-2 drop-shadow-md">
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Button>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-border/60 bg-card/80 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20">
                <Pill className="h-5 w-5 text-green-500" />
              </div>
              AI Supplement Advisor
            </CardTitle>
            <CardDescription>Personalized vitamin & supplement recommendations (8 credits)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Age</Label>
                <Input type="number" value={age} onChange={(e) => setAge(e.target.value)} className="bg-background/50" />
              </div>
              <div className="space-y-2">
                <Label>Gender</Label>
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger className="bg-background/50"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Current Diet Description</Label>
              <Textarea value={diet} onChange={(e) => setDiet(e.target.value)} placeholder="Describe your typical daily diet..." rows={3} className="bg-background/50" />
            </div>
            <div className="space-y-2">
              <Label>Health Goals</Label>
              <Input value={goals} onChange={(e) => setGoals(e.target.value)} placeholder="e.g. energy boost, muscle recovery, immunity" className="bg-background/50" />
            </div>
            <Button onClick={() => mutation.mutate()} disabled={mutation.isPending || !credits || credits.credits_remaining < 8} className="w-full gap-2" size="lg">
              {mutation.isPending ? <><Loader2 className="h-5 w-5 animate-spin" /> Analyzing...</> : <><Sparkles className="h-5 w-5" /> Get Recommendations (8 credits)</>}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/80 backdrop-blur-xl">
          <CardHeader><CardTitle>Supplement Recommendations</CardTitle></CardHeader>
          <CardContent>
            {result ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 max-h-[500px] overflow-y-auto">
                {result.supplements && Array.isArray(result.supplements) && result.supplements.map((supp: any, i: number) => (
                  <div key={i} className="p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/20">
                    <h4 className="font-bold text-lg">{supp.name}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{supp.reason}</p>
                    {supp.dosage && <p className="text-sm font-medium mt-2">💊 Dosage: {supp.dosage}</p>}
                    {supp.timing && <p className="text-sm text-muted-foreground">⏰ {supp.timing}</p>}
                  </div>
                ))}
                {result.diet_gaps && Array.isArray(result.diet_gaps) && result.diet_gaps.length > 0 && (
                  <div className="p-4 bg-gradient-to-br from-orange-500/10 to-amber-500/10 rounded-xl border border-orange-500/20">
                    <h4 className="font-semibold flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-orange-500" /> Diet Gaps Detected
                    </h4>
                    <ul className="mt-2 space-y-1">
                      {result.diet_gaps.map((gap: string, i: number) => (
                        <li key={i} className="text-sm text-muted-foreground">• {gap}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <p className="text-xs text-muted-foreground italic">⚠️ AI-generated advice. Always consult a healthcare professional before starting supplements.</p>
              </motion.div>
            ) : (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                <div className="text-center">
                  <Pill className="h-12 w-12 mx-auto mb-2 opacity-30" />
                  <p>Recommendations will appear here</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
    </>);
}
