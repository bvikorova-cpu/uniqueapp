import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Sparkles, Zap, Target, AlertCircle } from "lucide-react";
import { useLieCoach } from "@/hooks/useLieDetectorTuning";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export const LiveLieCoachCard = () => {
  const [text, setText] = useState("");
  const coach = useLieCoach();
  const r = coach.data?.results;

  return (
    <>
      <FloatingHowItWorks title={"Live Lie Coach Card - How it works"} steps={[{ title: 'Open', desc: 'Access the Live Lie Coach Card section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Live Lie Coach Card.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="bg-gradient-to-br from-red-950/40 via-card/80 to-amber-950/30 border-red-500/30 backdrop-blur-md">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="w-4 h-4 text-red-400" />
              Live Lie Coach
              <Badge className="bg-red-500/20 text-red-200 border-red-500/40 text-[10px]">4 cr</Badge>
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Paste a live conversation — get real-time manipulation tips & suggested replies.
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste the conversation as you're chatting (e.g. 'Them: ... Me: ...')"
          className="min-h-[110px] bg-background/40 border-red-500/20 text-sm font-mono"
        />
        <Button
          className="w-full bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700"
          disabled={!text.trim() || coach.isPending}
          onClick={() => coach.mutate({ conversation: text })}
        >
          <Sparkles className="w-4 h-4 mr-2" />
          {coach.isPending ? "Analyzing..." : "Coach Me"}
        </Button>

        {r && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3 pt-2 border-t border-red-500/20">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground flex items-center gap-1"><Target className="w-3 h-3" /> Manipulation Score</span>
                <span className="font-bold text-red-400">{r.manipulation_score}/100</span>
              </div>
              <Progress value={r.manipulation_score} className="h-2" />
            </div>

            {r.tactics_detected?.length > 0 && (
              <div>
                <p className="text-[11px] uppercase tracking-wide text-amber-300 mb-1 font-mono">Tactics Detected</p>
                <div className="flex flex-wrap gap-1">
                  {r.tactics_detected.map((t: string, i: number) => (
                    <Badge key={i} variant="outline" className="text-[10px] border-red-500/40 text-red-200">{t}</Badge>
                  ))}
                </div>
              </div>
            )}

            {r.suggested_responses?.length > 0 && (
              <div>
                <p className="text-[11px] uppercase tracking-wide text-emerald-300 mb-1 font-mono">Suggested Replies</p>
                <ul className="space-y-1">
                  {r.suggested_responses.map((s: string, i: number) => (
                    <li key={i} className="text-xs p-2 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-100">
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {r.red_flag_phrases?.length > 0 && (
              <div className="p-2 rounded bg-red-500/10 border border-red-500/30">
                <p className="text-[11px] uppercase tracking-wide text-red-300 mb-1 font-mono flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> Red Flags
                </p>
                <p className="text-xs text-red-100">{r.red_flag_phrases.join(" · ")}</p>
              </div>
            )}
          </motion.div>
        )}
      </CardContent>
    </Card>
    </>
  );
};
