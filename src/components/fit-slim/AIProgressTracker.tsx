import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, TrendingUp, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAICredits } from "@/hooks/useAICredits";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export default function AIProgressTracker({ onBack }: { onBack: () => void }) {
  const { credits } = useAICredits();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [form, setForm] = useState({ startWeight: "", currentWeight: "", targetWeight: "", weeks: "", habits: "" });

  const analyze = async () => {
    if (!form.startWeight || !form.currentWeight) return toast.error("Fill in your weight data");
    if (!credits || credits.credits_remaining < 3) return toast.error("Insufficient credits (3 required)");
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-gift-message", {
        body: {
          message: `Analyze fitness progress and provide detailed insights:
Start weight: ${form.startWeight}kg, Current weight: ${form.currentWeight}kg
${form.targetWeight ? `Target: ${form.targetWeight}kg` : ""}
${form.weeks ? `Duration: ${form.weeks} weeks` : ""}
${form.habits ? `Current habits: ${form.habits}` : ""}
Provide:
1. Progress analysis (weight lost, rate per week, % to goal)
2. Projected timeline to reach target
3. What's working well
4. 5 specific adjustments to accelerate progress
5. Weekly mini-goals for the next 4 weeks
6. Risk factors to watch out for
Format with clear headers and emojis.`,
        },
      });
      if (error) throw error;
      setResult(data?.message || data?.text || "No response");
    } catch (e: any) {
      toast.error(e.message || "Error analyzing progress");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks title={"A I Progress Tracker - How it works"} steps={[{ title: 'Open', desc: 'Access the A I Progress Tracker section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in A I Progress Tracker.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2"><ArrowLeft className="h-4 w-4" /> Back</Button>
      <Card className="bg-card/80 backdrop-blur-xl border-border/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-cyan-500" /> AI Progress Tracker</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div><Label>Start Weight (kg) *</Label><Input type="number" value={form.startWeight} onChange={e => setForm({...form, startWeight: e.target.value})} /></div>
            <div><Label>Current Weight (kg) *</Label><Input type="number" value={form.currentWeight} onChange={e => setForm({...form, currentWeight: e.target.value})} /></div>
            <div><Label>Target Weight (kg)</Label><Input type="number" value={form.targetWeight} onChange={e => setForm({...form, targetWeight: e.target.value})} /></div>
            <div><Label>Weeks So Far</Label><Input type="number" value={form.weeks} onChange={e => setForm({...form, weeks: e.target.value})} /></div>
          </div>
          <div><Label>Current Habits & Routine</Label><Textarea placeholder="Describe your current diet and exercise routine..." value={form.habits} onChange={e => setForm({...form, habits: e.target.value})} rows={3} /></div>
          <Button onClick={analyze} disabled={loading} className="w-full bg-gradient-to-r from-cyan-500 to-blue-600">
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Analyzing...</> : <><Sparkles className="h-4 w-4 mr-2" /> Analyze Progress (3 Credits)</>}
          </Button>
          {result && (
            <Card className="bg-cyan-500/5 border-cyan-500/20 mt-4">
              <CardContent className="p-4 whitespace-pre-line text-sm">{result}</CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
    </>
  );
}
