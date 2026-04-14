import { useState } from "react";
import { motion } from "framer-motion";
import { Flame, Loader2, CreditCard, Zap, Shield, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";

export default function RewardsStreakCoach() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [currentStreak, setCurrentStreak] = useState("");
  const [bestStreak, setBestStreak] = useState("");
  const [timezone, setTimezone] = useState("");
  const [challengeAreas, setChallengeAreas] = useState("");
  const { toast } = useToast();

  const handleSubmit = async () => {
    setLoading(true);
    setResult(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Please sign in");
      const { data, error } = await supabase.functions.invoke("rewards-ai", {
        body: { action: "streak_coach", current_streak: currentStreak, best_streak: bestStreak, timezone, challenge_areas: challengeAreas },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResult(data.result);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <Card className="p-5 bg-card/90 backdrop-blur-md border-amber-400/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
            <Flame className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg">AI Streak Coach</h3>
            <p className="text-xs text-muted-foreground flex items-center gap-1"><CreditCard className="h-3 w-3" /> 4 credits per use</p>
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
          <h4 className="font-bold mb-3 text-amber-500">🔥 Your Streak Coach Plan</h4>
          <div className="prose prose-sm dark:prose-invert max-w-none"><ReactMarkdown>{result}</ReactMarkdown></div>
        </Card>
      )}
    </motion.div>
  );
}
