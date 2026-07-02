import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Loader2, Coins, AlertTriangle, ArrowRight } from "lucide-react";
import { useAnonymousDateAI } from "@/hooks/useAnonymousDateAI";
import type { ChatMessage } from "@/hooks/useAnonymousChat";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface Props {
  matchId: string;
  messages: ChatMessage[];
  currentUserId: string;
  partnerName: string;
  credits: number;
}

export const ConversationCoach = ({ matchId, messages, currentUserId, partnerName, credits }: Props) => {
  const { run, loading } = useAnonymousDateAI();
  const [analysis, setAnalysis] = useState<any>(null);

  const analyse = async () => {
    const transcript = messages.slice(-30).map(m => {
      const who = m.sender_id === currentUserId ? "Me" : partnerName;
      return `${who}: ${m.content}`;
    }).join("\n");
    const result = await run("conversation_coach", { transcript, partner: partnerName, message_count: messages.length }, matchId);
    if (result?.output) setAnalysis(result.output);
  };

  return (
    <Card className="p-4 bg-gradient-to-br from-violet-500/10 via-card/80 to-primary/10 backdrop-blur-xl border-violet-500/30">
      <FloatingHowItWorks
        title={"Conversation Coach"}
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
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-violet-500 to-primary">
            <Brain className="h-4 w-4 text-white" />
          </div>
          <h3 className="font-black text-sm">AI Conversation Coach</h3>
        </div>
        <Badge className="bg-violet-500/20 text-violet-300 border-violet-500/40 text-[10px]">
          <Coins className="h-3 w-3 mr-1" /> 10 cr
        </Badge>
      </div>

      {!analysis && (
        <div className="text-center py-3">
          <p className="text-xs text-muted-foreground mb-3">
            Get an AI breakdown of your chat — health score, what's working, and the next move to make.
          </p>
          <Button
            onClick={analyse}
            disabled={loading === "conversation_coach" || credits < 10 || messages.length < 4}
            className="bg-gradient-to-r from-violet-500 to-primary"
            size="sm"
          >
            {loading === "conversation_coach" ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Analysing…</>
            ) : messages.length < 4 ? "Need 4+ messages" : credits < 10 ? "Need 10 credits" : (
              <><Brain className="h-4 w-4 mr-2" /> Analyse chat (10 cr)</>
            )}
          </Button>
        </div>
      )}

      <AnimatePresence>
        {analysis && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            <div className="text-center p-3 rounded-xl bg-gradient-to-br from-violet-500/20 to-primary/20 border border-violet-500/40">
              <div className="text-4xl font-black bg-gradient-to-r from-violet-400 to-primary bg-clip-text text-transparent">
                {analysis.health_score}%
              </div>
              <p className="text-xs font-semibold mt-0.5">{analysis.vibe_summary}</p>
            </div>

            {analysis.what_is_working?.length > 0 && (
              <div>
                <p className="text-[10px] font-bold uppercase text-emerald-400 mb-1">What's working</p>
                <ul className="text-xs space-y-0.5">
                  {analysis.what_is_working.map((s: string, i: number) => <li key={i}>✓ {s}</li>)}
                </ul>
              </div>
            )}

            {analysis.what_to_improve?.length > 0 && (
              <div>
                <p className="text-[10px] font-bold uppercase text-amber-400 mb-1">Improve</p>
                <ul className="text-xs space-y-0.5">
                  {analysis.what_to_improve.map((s: string, i: number) => <li key={i}>→ {s}</li>)}
                </ul>
              </div>
            )}

            {analysis.next_move && (
              <div className="p-2.5 rounded-lg bg-primary/15 border border-primary/40">
                <p className="text-[10px] font-bold uppercase text-primary mb-0.5 flex items-center gap-1">
                  <ArrowRight className="h-3 w-3" /> Next move
                </p>
                <p className="text-xs">{analysis.next_move}</p>
              </div>
            )}

            {analysis.red_flags?.length > 0 && (
              <div className="p-2.5 rounded-lg bg-destructive/15 border border-destructive/40">
                <p className="text-[10px] font-bold uppercase text-destructive mb-0.5 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" /> Watch out
                </p>
                <ul className="text-xs space-y-0.5">
                  {analysis.red_flags.map((s: string, i: number) => <li key={i}>! {s}</li>)}
                </ul>
              </div>
            )}

            <Button onClick={() => setAnalysis(null)} variant="outline" size="sm" className="w-full">
              Run again
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};
