import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Dumbbell, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAICredits } from "@/hooks/useAICredits";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export default function AIWorkoutCoach({ onBack }: { onBack: () => void }) {
  const { credits } = useAICredits();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [form, setForm] = useState({ goal: "", level: "", duration: "30", equipment: "" });

  const generate = async () => {
    if (!form.goal || !form.level) return toast.error("Fill in goal and fitness level");
    if (!credits || credits.credits_remaining < 3) return toast.error("Insufficient credits (3 required)");
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-gift-message", {
        body: {
          message: `Create a detailed ${form.duration}-minute workout plan for someone with ${form.level} fitness level.
Goal: ${form.goal}. Equipment: ${form.equipment || "None (bodyweight only)"}.
Include warmup, main exercises (with sets, reps, rest), and cooldown. Format with clear sections.`,
        },
      });
      if (error) throw error;
      setResult(data?.message || data?.text || "No response");
    } catch (e: any) {
      toast.error(e.message || "Error generating workout");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks title={"A I Workout Coach - How it works"} steps={[{ title: 'Open', desc: 'Access the A I Workout Coach section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in A I Workout Coach.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2"><ArrowLeft className="h-4 w-4" /> Back</Button>
      <Card className="bg-card/80 backdrop-blur-xl border-border/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Dumbbell className="h-5 w-5 text-emerald-500" /> AI Workout Coach</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Fitness Goal *</Label>
              <Select value={form.goal} onValueChange={v => setForm({...form, goal: v})}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="weight_loss">Weight Loss</SelectItem>
                  <SelectItem value="muscle_gain">Muscle Gain</SelectItem>
                  <SelectItem value="toning">Body Toning</SelectItem>
                  <SelectItem value="endurance">Endurance</SelectItem>
                  <SelectItem value="flexibility">Flexibility</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Fitness Level *</Label>
              <Select value={form.level} onValueChange={v => setForm({...form, level: v})}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Duration (min)</Label>
              <Input type="number" value={form.duration} onChange={e => setForm({...form, duration: e.target.value})} />
            </div>
            <div><Label>Equipment</Label>
              <Input placeholder="Dumbbells, bands..." value={form.equipment} onChange={e => setForm({...form, equipment: e.target.value})} />
            </div>
          </div>
          <Button onClick={generate} disabled={loading} className="w-full bg-gradient-to-r from-emerald-500 to-green-600">
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating...</> : <><Sparkles className="h-4 w-4 mr-2" /> Generate Workout (3 Credits)</>}
          </Button>
          {result && (
            <Card className="bg-emerald-500/5 border-emerald-500/20 mt-4">
              <CardContent className="p-4 whitespace-pre-line text-sm">{result}</CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
    </>
  );
}
