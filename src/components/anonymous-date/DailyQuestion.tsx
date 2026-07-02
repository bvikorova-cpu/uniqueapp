import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, Coins, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAnonymousDateAI, AI_COSTS } from "@/hooks/useAnonymousDateAI";
import { useToast } from "@/hooks/use-toast";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface Props {
  matchId: string;
  currentUserId: string;
  isUser1: boolean;
  partnerName: string;
  credits: number;
}

interface DailyQ {
  id: string;
  question: string;
  user1_answer: string | null;
  user2_answer: string | null;
  question_date: string;
}

export const DailyQuestion = ({ matchId, currentUserId, isUser1, partnerName, credits }: Props) => {
  const { toast } = useToast();
  const { run, loading: aiLoading } = useAnonymousDateAI();
  const [daily, setDaily] = useState<DailyQ | null>(null);
  const [answer, setAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const today = new Date().toISOString().slice(0, 10);

  const fetchToday = async () => {
    const { data } = await supabase
      .from("anonymous_dating_daily_questions")
      .select("*")
      .eq("match_id", matchId)
      .eq("question_date", today)
      .maybeSingle();
    setDaily(data as DailyQ | null);
    if (data) {
      const myAns = isUser1 ? data.user1_answer : data.user2_answer;
      if (myAns) setAnswer(myAns);
    }
  };

  useEffect(() => {
    fetchToday();
    const ch = supabase.channel(`daily-q:${matchId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "anonymous_dating_daily_questions", filter: `match_id=eq.${matchId}` },
        () => fetchToday())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchId]);

  const generateQuestion = async () => {
    const result = await run("daily_question", { date: today, partner: partnerName });
    if (!result?.output) return;
    const q = typeof result.output === "string" ? result.output : (result.output.question ?? JSON.stringify(result.output));
    const { data, error } = await supabase
      .from("anonymous_dating_daily_questions")
      .insert({ match_id: matchId, question: q, generated_by: currentUserId, credits_used: 5 })
      .select().single();
    if (error) toast({ title: "Save failed", description: error.message, variant: "destructive" });
    else setDaily(data as DailyQ);
  };

  const submitAnswer = async () => {
    if (!daily || !answer.trim()) return;
    setSubmitting(true);
    const update = isUser1
      ? { user1_answer: answer.trim() }
      : { user2_answer: answer.trim() };
    const { error } = await supabase
      .from("anonymous_dating_daily_questions")
      .update(update)
      .eq("id", daily.id);
    setSubmitting(false);
    if (error) toast({ title: "Submit failed", description: error.message, variant: "destructive" });
    else toast({ title: "Answer locked in", description: "Waiting for partner to answer too." });
  };

  const myAnswer = daily ? (isUser1 ? daily.user1_answer : daily.user2_answer) : null;
  const partnerAnswer = daily ? (isUser1 ? daily.user2_answer : daily.user1_answer) : null;
  const bothAnswered = !!myAnswer && !!partnerAnswer;

  return (
    <Card className="p-4 bg-gradient-to-br from-amber-500/10 via-card/80 to-pink-500/10 backdrop-blur-xl border-amber-500/30">
      <FloatingHowItWorks
        title={"Daily Question"}
        intro={"Here's how to use this feature."}
        steps={[
          { title: "Open the tool", desc: "Access it from its parent module in the menu." },
          { title: "Set your preferences", desc: "Pick options, filters, or inputs relevant to you." },
          { title: "Interact & save", desc: "Use the actions provided; results save to your account." },
          { title: "Review history", desc: "Come back anytime to continue where you left off." },
        ]}
      />

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <h3 className="font-black text-sm">Daily AI Question</h3>
        </div>
        <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/40 text-[10px]">
          <Coins className="h-3 w-3 mr-1" /> 5 cr/day
        </Badge>
      </div>

      {!daily && (
        <div className="text-center py-4">
          <p className="text-xs text-muted-foreground mb-3">No question for today yet. Generate one!</p>
          <Button
            onClick={generateQuestion}
            disabled={aiLoading === "daily_question" || credits < 5}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90"
            size="sm"
          >
            {aiLoading === "daily_question" ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating…</>
            ) : credits < 5 ? `Need 5 credits` : (
              <><Sparkles className="h-4 w-4 mr-2" /> Generate today's question (5 cr)</>
            )}
          </Button>
        </div>
      )}

      {daily && (
        <div className="space-y-3">
          <div className="p-3 rounded-xl bg-background/50 border border-amber-500/30">
            <p className="text-sm font-semibold italic">"{daily.question}"</p>
          </div>

          {!myAnswer && (
            <div>
              <Textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Your honest answer (blind until partner answers)…"
                rows={3}
                className="text-sm"
              />
              <Button
                onClick={submitAnswer}
                disabled={submitting || !answer.trim()}
                className="w-full mt-2 bg-gradient-to-r from-amber-500 to-orange-500"
                size="sm"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Lock in answer"}
              </Button>
            </div>
          )}

          {myAnswer && !bothAnswered && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/30 border border-border/40">
              <EyeOff className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs italic">Your answer is locked. Waiting for {partnerName}…</p>
            </div>
          )}

          <AnimatePresence>
            {bothAnswered && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                  <Eye className="h-4 w-4" /> Both answered — revealed!
                </div>
                <div className="grid gap-2">
                  <div className="p-3 rounded-xl bg-primary/15 border border-primary/40">
                    <p className="text-[10px] font-bold uppercase text-primary mb-1">You</p>
                    <p className="text-sm">{myAnswer}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-pink-500/15 border border-pink-500/40">
                    <p className="text-[10px] font-bold uppercase text-pink-400 mb-1">{partnerName}</p>
                    <p className="text-sm">{partnerAnswer}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </Card>
  );
};
