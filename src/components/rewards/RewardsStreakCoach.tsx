import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Flame, Loader2, CreditCard, Zap, Shield, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";
import { HowItWorksButton } from "@/components/common/HowItWorksButton";

export default function RewardsStreakCoach() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [currentStreak, setCurrentStreak] = useState("");
  const [bestStreak, setBestStreak] = useState("");
  const [timezone, setTimezone] = useState("");
  const [challengeAreas, setChallengeAreas] = useState("");
  const { toast } = useToast();

  // Auto-prefill from user_points + load latest saved coaching
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const [pointsRes, historyRes] = await Promise.all([
        supabase.from("user_points").select("login_streak").eq("user_id", user.id).maybeSingle(),
        supabase.from("rewards_ai_history").select("result, input, created_at").eq("user_id", user.id).eq("action", "streak_coach").order("created_at", { ascending: false }).limit(1).maybeSingle(),
      ]);
      if (pointsRes.data) {
        const s = pointsRes.data.login_streak ?? 0;
        setCurrentStreak(String(s));
        setBestStreak(String(s));
      }
      if (historyRes.data) {
        setResult(historyRes.data.result);
        setHistoryLoaded(true);
        const inp: any = historyRes.data.input || {};
        if (inp.timezone) setTimezone(inp.timezone);
        if (inp.challenge_areas) setChallengeAreas(inp.challenge_areas);
      }
    })();
  }, []);

  const handleSubmit = async () => {
    setLoading(true);
    setResult(null);
    setHistoryLoaded(false);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Please sign in");
      const { data, error } = await supabase.functions.invoke("rewards-ai", {
        body: { action: "streak_coach", current_streak: currentStreak, best_streak: bestStreak, timezone, challenge_areas: challengeAreas },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResult(data.result);
      toast({ title: "Saved", description: "Your coaching plan is saved — view it anytime free." });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="flex justify-end"><HowItWorksButton variant="compact" title="Streak Coach" intro="AI coach that helps you keep your daily login streak alive." steps={[
        { title: "Tell the coach", desc: "Type your situation (busy week, travelling, forgot yesterday…) and pick a tone." },
        { title: "Get a plan", desc: "The coach generates a personalized plan: which micro-actions to do today to protect your streak." },
        { title: "Apply the tips", desc: "Follow the suggestions — usually a 1-minute daily action is enough to keep the flame going." },
        { title: "Costs credits", desc: "Each coach session uses a small amount of AI credits. Your remaining balance is shown in the header." },
      ]} /></div>
      <Card className="p-5 bg-card/90 backdrop-blur-md border-amber-400/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
            <Flame className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg">AI Streak Coach</h3>
            <p className="text-xs text-muted-foreground flex items-center gap-1"><CreditCard className="h-3 w-3" /> 4 credits per use • Auto-filled from your stats</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="rounded-lg bg-orange-500/10 border border-orange-500/20 p-3 text-center">
            <Zap className="h-4 w-4 text-orange-400 mx-auto mb-1" />
            <p className="text-xs font-bold">Motivation</p>
            <p className="text-[10px] text-muted-foreground">Daily messages</p>
          </div>
          <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-center">
            <Shield className="h-4 w-4 text-red-400 mx-auto mb-1" />
            <p className="text-xs font-bold">Recovery</p>
            <p className="text-[10px] text-muted-foreground">Streak save tips</p>
          </div>
        </div>

        <div className="space-y-3">
          <Input placeholder="Current streak (days)" value={currentStreak} onChange={e => setCurrentStreak(e.target.value)} />
          <Input placeholder="Best streak ever (days)" value={bestStreak} onChange={e => setBestStreak(e.target.value)} />
          <Select value={timezone} onValueChange={setTimezone}>
            <SelectTrigger><SelectValue placeholder="Your peak activity time" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="morning">Morning (6am-12pm)</SelectItem>
              <SelectItem value="afternoon">Afternoon (12pm-6pm)</SelectItem>
              <SelectItem value="evening">Evening (6pm-12am)</SelectItem>
              <SelectItem value="night">Night Owl (12am-6am)</SelectItem>
            </SelectContent>
          </Select>
          <Input placeholder="Biggest challenge keeping streaks (optional)" value={challengeAreas} onChange={e => setChallengeAreas(e.target.value)} />
        </div>

        <Button onClick={handleSubmit} disabled={loading} className="w-full mt-4 bg-gradient-to-r from-orange-500 to-red-500 text-white hover:opacity-90">
          {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Coaching...</> : "Get Streak Coaching — 4 Credits"}
        </Button>
      </Card>

      {result && (
        <Card className="p-5 bg-card/90 backdrop-blur-md border-amber-400/20">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-amber-500">🔥 Your Streak Coach Plan</h4>
            {historyLoaded && (
              <span className="text-[10px] text-muted-foreground flex items-center gap-1"><History className="h-3 w-3" /> Saved plan (free)</span>
            )}
          </div>
          <div className="prose prose-sm dark:prose-invert max-w-none"><ReactMarkdown>{result}</ReactMarkdown></div>
        </Card>
      )}
    </motion.div>
  );
}
