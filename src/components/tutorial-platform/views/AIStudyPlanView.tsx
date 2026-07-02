import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CalendarDays, Loader2, Copy, Check, Sparkles, Target, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTutorialAICredits } from "@/hooks/useTutorialAICredits";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

const CREDITS_COST = 4;

interface Props { onBack: () => void; }

export function AIStudyPlanView({ onBack }: Props) {
  const { toast } = useToast();
  const { credits, isDeducting, checkAndDeduct } = useTutorialAICredits();
  const [goal, setGoal] = useState("");
  const [subject, setSubject] = useState("");
  const [level, setLevel] = useState("intermediate");
  const [hoursPerWeek, setHoursPerWeek] = useState([10]);
  const [durationWeeks, setDurationWeeks] = useState("8");
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const generatePlan = async () => {
    if (!goal.trim() || !subject.trim()) {
      toast({ title: "Missing Info", description: "Please enter your goal and subject", variant: "destructive" });
      return;
    }
    setLoading(true);
    setPlan(null);
    try {
      const { data, error } = await supabase.functions.invoke('stock-content-ai', {
        body: { action: 'generate-study-plan', goal, subject, level, hoursPerWeek: hoursPerWeek[0], durationWeeks: parseInt(durationWeeks) }
      });
      if (error) throw error;
      setPlan(data?.result || "No plan generated");
    } catch (err: any) {
      toast({ title: "Generation Failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (plan) { navigator.clipboard.writeText(plan); setCopied(true); setTimeout(() => setCopied(false), 2000); }
  };

  return (
    <>
      <FloatingHowItWorks title={"A I Study Plan View - How it works"} steps={[{ title: 'Open', desc: 'Access the A I Study Plan View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in A I Study Plan View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="h-5 w-5" /></Button>
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2">
            <CalendarDays className="h-6 w-6 text-blue-500" /> AI Study Plan Generator
            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 text-[10px]">4 CR</Badge>
          </h1>
          <p className="text-sm text-muted-foreground">Personalized learning paths based on your goals & schedule</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-blue-500/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><Target className="h-5 w-5 text-blue-500" /> Your Learning Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-semibold mb-1 block">Subject / Topic</label>
              <Input placeholder="e.g. Web Development, Machine Learning..." value={subject} onChange={e => setSubject(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-semibold mb-1 block">Learning Goal</label>
              <Input placeholder="e.g. Build a full-stack app, pass certification..." value={goal} onChange={e => setGoal(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-semibold mb-1 block">Current Level</label>
              <Select value={level} onValueChange={setLevel}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-semibold mb-1 block flex items-center gap-2">
                <Clock className="h-4 w-4" /> Hours per week: <span className="text-blue-500 font-black">{hoursPerWeek[0]}h</span>
              </label>
              <Slider value={hoursPerWeek} onValueChange={setHoursPerWeek} min={2} max={40} step={1} className="mt-2" />
            </div>
            <div>
              <label className="text-sm font-semibold mb-1 block">Duration (weeks)</label>
              <Select value={durationWeeks} onValueChange={setDurationWeeks}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[4, 6, 8, 12, 16, 24].map(w => <SelectItem key={w} value={w.toString()}>{w} weeks</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={generatePlan} disabled={loading} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
              {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Creating Plan...</> : <><CalendarDays className="h-4 w-4 mr-2" /> Generate Study Plan</>}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-blue-500/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              <span className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-blue-500" /> Your Plan</span>
              {plan && <Button variant="ghost" size="sm" onClick={handleCopy}>{copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}</Button>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {plan ? (
              <div className="prose prose-sm max-w-none dark:prose-invert whitespace-pre-wrap text-sm leading-relaxed max-h-[600px] overflow-y-auto">{plan}</div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                <CalendarDays className="h-12 w-12 mb-3 opacity-30" />
                <p className="text-sm">Configure your goals to generate a plan</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  );
}
