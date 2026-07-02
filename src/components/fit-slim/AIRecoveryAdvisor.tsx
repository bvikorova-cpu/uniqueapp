import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, HeartPulse, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAICredits } from "@/hooks/useAICredits";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export default function AIRecoveryAdvisor({ onBack }: { onBack: () => void }) {
  const { credits } = useAICredits();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [form, setForm] = useState({ workout: "", soreness: "", sleep: "", area: "" });

  const advise = async () => {
    if (!form.workout) return toast.error("Describe your recent workout");
    if (!credits || credits.credits_remaining < 3) return toast.error("Insufficient credits (3 required)");
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-gift-message", {
        body: {
          message: `Create a personalized post-workout recovery plan:
Recent workout: ${form.workout}
${form.soreness ? `Soreness level: ${form.soreness}/10` : ""}
${form.sleep ? `Sleep quality: ${form.sleep}` : ""}
${form.area ? `Problem areas: ${form.area}` : ""}
Include:
1. Immediate recovery protocol (first 30 min)
2. Nutrition recovery plan (what to eat and when)
3. Stretching/mobility routine for affected muscles
4. Sleep optimization tips
5. Active recovery suggestions for off days
6. Supplement recommendations
7. When to work out next (recovery timeline)
Format with sections, emojis, and specific timing.`,
        },
      });
      if (error) throw error;
      setResult(data?.message || data?.text || "No response");
    } catch (e: any) {
      toast.error(e.message || "Error generating recovery plan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks title={"A I Recovery Advisor - How it works"} steps={[{ title: 'Open', desc: 'Access the A I Recovery Advisor section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in A I Recovery Advisor.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2"><ArrowLeft className="h-4 w-4" /> Back</Button>
      <Card className="bg-card/80 backdrop-blur-xl border-border/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><HeartPulse className="h-5 w-5 text-pink-500" /> AI Recovery Advisor</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div><Label>Recent Workout *</Label><Textarea placeholder="e.g. Heavy leg day: squats 5x5, leg press, lunges, calf raises" value={form.workout} onChange={e => setForm({...form, workout: e.target.value})} rows={3} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Soreness (1-10)</Label><Input type="number" min="1" max="10" value={form.soreness} onChange={e => setForm({...form, soreness: e.target.value})} /></div>
            <div><Label>Sleep Quality</Label>
              <Select value={form.sleep} onValueChange={v => setForm({...form, sleep: v})}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="poor">Poor (&lt;5h)</SelectItem>
                  <SelectItem value="fair">Fair (5-6h)</SelectItem>
                  <SelectItem value="good">Good (7-8h)</SelectItem>
                  <SelectItem value="excellent">Excellent (8+h)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div><Label>Problem Areas</Label><Input placeholder="e.g. lower back, knees" value={form.area} onChange={e => setForm({...form, area: e.target.value})} /></div>
          <Button onClick={advise} disabled={loading} className="w-full bg-gradient-to-r from-pink-500 to-rose-600">
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating...</> : <><Sparkles className="h-4 w-4 mr-2" /> Get Recovery Plan (3 Credits)</>}
          </Button>
          {result && (
            <Card className="bg-pink-500/5 border-pink-500/20 mt-4">
              <CardContent className="p-4 whitespace-pre-line text-sm">{result}</CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
    </>
  );
}
