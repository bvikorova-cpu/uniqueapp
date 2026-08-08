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
import { AiMarkdown } from "../common/AiMarkdown";


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
          type: "fitness_plan",
          message: `You are an elite sports recovery & physiotherapy specialist. Create a DETAILED, comprehensive post-workout recovery protocol in clean markdown (## headings, tables, bullet lists, bold key numbers). Do NOT write a motivational letter.

ATHLETE DATA
- Recent workout: ${form.workout}
${form.soreness ? `- Soreness level: ${form.soreness}/10` : ""}
${form.sleep ? `- Sleep quality: ${form.sleep}` : ""}
${form.area ? `- Problem areas: ${form.area}` : ""}

REQUIRED SECTIONS
## 🔎 Recovery Assessment
Estimated muscle damage, fatigue level, expected DOMS peak (hours), recovery status score /100.

## ⏱️ Immediate Protocol (first 30-60 min)
Markdown table: Time | Action | Why it matters.

## 🍽️ Nutrition Recovery
Table with meals/timing (post-workout, +2h, dinner, before bed), grams of protein/carbs, hydration & electrolytes in ml.

## 🧘 Mobility & Stretching Routine
Table: Exercise | Target muscle | Sets/Duration | Cues. 6-8 items focused on the trained and problem areas.

## 😴 Sleep Optimization
Concrete steps, target hours, evening routine timeline.

## 🚶 Active Recovery (off days)
2-3 options with intensity, duration, heart-rate zone.

## 💊 Supplements
Table: Supplement | Dose | Timing | Evidence level. Note that this is general info, not medical advice.

## 📅 Next Workout Timeline
Day-by-day table for the next 4-5 days (rest / light / full training) with readiness checkpoints.

## ⚠️ Red Flags
When soreness/pain means stop and see a professional.

Be specific with numbers, times and doses. 500-800 words.` } });

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
