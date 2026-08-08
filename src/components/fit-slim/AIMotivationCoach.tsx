import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Flame, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAICredits } from "@/hooks/useAICredits";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export default function AIMotivationCoach({ onBack }: { onBack: () => void }) {
  const { credits } = useAICredits();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [form, setForm] = useState({ goal: "", obstacle: "", streak: "" });

  const motivate = async () => {
    if (!form.goal) return toast.error("Tell me your fitness goal");
    if (!credits || credits.credits_remaining < 3) return toast.error("Insufficient credits (3 required)");
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-gift-message", {
        body: {
          type: "fitness_plan",
          message: `Act as an elite fitness motivation coach. Create a rich, personalized motivation package.
Goal: ${form.goal}
${form.obstacle ? `Current obstacle: ${form.obstacle}` : ""}
${form.streak ? `Current streak: ${form.streak} days` : ""}

Answer in markdown with these sections:
## Your Mission
A powerful 3-4 paragraph motivational speech that directly addresses the goal and obstacle.

## Reality Check
Realistic timeline and what the goal actually requires week by week (short table: Week | Focus | Expected progress).

## Daily Affirmations
5 affirmations tailored to the obstacle.

## Today's Action Plan
A checklist of 5-7 concrete tasks for today (movement, food, mindset, recovery).

## Mindset Shifts
3 reframing techniques with a one-line script for each.

## Obstacle Playbook
For the stated obstacle: triggers, early warning signs, and 3 counter-moves.

## Habit Stack
How to attach the new habits to existing routines.

## Milestones & Rewards
Milestone table: Milestone | When | Reward.

## Mantra
One short line to repeat.` } });
      if (error) throw error;
      setResult(data?.message || data?.text || "No response");

    } catch (e: any) {
      toast.error(e.message || "Error generating motivation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks title={"A I Motivation Coach - How it works"} steps={[{ title: 'Open', desc: 'Access the A I Motivation Coach section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in A I Motivation Coach.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2"><ArrowLeft className="h-4 w-4" /> Back</Button>
      <Card className="bg-card/80 backdrop-blur-xl border-border/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Flame className="h-5 w-5 text-red-500" /> AI Motivation Coach</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div><Label>Your Fitness Goal *</Label><Input placeholder="e.g. Lose 10kg in 3 months" value={form.goal} onChange={e => setForm({...form, goal: e.target.value})} /></div>
          <div><Label>Current Obstacle</Label><Textarea placeholder="What's holding you back?" value={form.obstacle} onChange={e => setForm({...form, obstacle: e.target.value})} rows={2} /></div>
          <div><Label>Current Streak (days)</Label><Input type="number" placeholder="0" value={form.streak} onChange={e => setForm({...form, streak: e.target.value})} /></div>
          <Button onClick={motivate} disabled={loading} className="w-full bg-gradient-to-r from-red-500 to-orange-600">
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating...</> : <><Sparkles className="h-4 w-4 mr-2" /> Get Motivated (3 Credits)</>}
          </Button>
          {result && (
            <Card className="bg-red-500/5 border-red-500/20 mt-4">
              <CardContent className="p-4 whitespace-pre-line text-sm">{result}</CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
    </>
  );
}
