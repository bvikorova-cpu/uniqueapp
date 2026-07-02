import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Target, Sparkles, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const COST = 3;

interface Props { onCredits?: () => void; }

export const SkillGapAnalyzer = ({ onCredits }: Props) => {
  const [targetCareer, setTargetCareer] = useState("");
  const [currentSkills, setCurrentSkills] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  const run = async () => {
    if (!targetCareer.trim()) return toast.error("Enter a target career");
    setLoading(true);
    try {
      const { data: res, error } = await supabase.functions.invoke("teen-career-counselor", {
        body: { action: "skillGap", targetCareer, currentSkills },
      });
      if (error || res?.error) {
        const msg = res?.error || error?.message || "Failed";
        if (String(msg).toLowerCase().includes("insufficient")) toast.error(`Need ${COST} credits`);
        else toast.error(msg);
        return;
      }
      setData(res);
      onCredits?.();
    } finally { setLoading(false); }
  };

  return (
    <>
      <FloatingHowItWorks title={"Skill Gap Analyzer - How it works"} steps={[{ title: 'Open', desc: 'Access the Skill Gap Analyzer section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Skill Gap Analyzer.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Target className="h-5 w-5 text-primary" /> Skill Gap Analyzer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Input placeholder="Target career (e.g. AI Engineer)" value={targetCareer} onChange={e => setTargetCareer(e.target.value)} />
        <Textarea placeholder="Your current skills (comma separated)" rows={2} value={currentSkills} onChange={e => setCurrentSkills(e.target.value)} />
        <Button onClick={run} disabled={loading} className="w-full gap-1">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          Analyze gap ({COST} credits)
        </Button>

        {data && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 pt-3">
            <div className="text-center p-4 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
              <p className="text-xs text-muted-foreground">Readiness</p>
              <p className="text-3xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{data.readinessScore}%</p>
              <p className="text-xs text-muted-foreground mt-1">~{data.estimatedMonthsToReady} months to ready</p>
            </div>

            {data.haveSkills?.length > 0 && (
              <div>
                <h4 className="text-sm font-bold mb-1 flex items-center gap-1 text-emerald-500"><CheckCircle2 className="h-4 w-4" /> You already have</h4>
                <div className="flex flex-wrap gap-1">
                  {data.haveSkills.map((s: any, i: number) => (
                    <span key={i} className="text-[10px] px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      {s.skill} · {s.level}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {data.missingSkills?.length > 0 && (
              <div>
                <h4 className="text-sm font-bold mb-1 flex items-center gap-1 text-amber-500"><AlertTriangle className="h-4 w-4" /> Gaps to close</h4>
                <div className="space-y-1">
                  {data.missingSkills.map((s: any, i: number) => (
                    <div key={i} className="p-2 rounded-lg bg-amber-500/5 border border-amber-500/20 text-xs">
                      <div className="flex items-center justify-between gap-2">
                        <strong>{s.skill}</strong>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${s.priority === 'high' ? 'bg-rose-500/20 text-rose-500' : s.priority === 'medium' ? 'bg-amber-500/20 text-amber-500' : 'bg-muted text-muted-foreground'}`}>{s.priority}</span>
                      </div>
                      <p className="text-muted-foreground mt-0.5">{s.whyItMatters}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data.learningPath?.length > 0 && (
              <div>
                <h4 className="text-sm font-bold mb-1">6-Month Learning Path</h4>
                <div className="space-y-1.5">
                  {data.learningPath.map((m: any, i: number) => (
                    <div key={i} className="flex gap-3 p-2 rounded-lg bg-muted/40 text-xs">
                      <div className="w-7 h-7 rounded-full bg-primary/15 text-primary font-bold flex items-center justify-center shrink-0">{m.month}</div>
                      <div className="flex-1">
                        <div className="font-semibold">{m.focus}</div>
                        <div className="text-muted-foreground">📚 {(m.resources || []).join(", ")}</div>
                        <div className="text-primary text-[11px] mt-0.5">🎯 {m.milestone}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data.quickWins?.length > 0 && (
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                <p className="text-xs font-bold mb-1">⚡ Quick wins this week</p>
                <ul className="text-xs space-y-0.5">
                  {data.quickWins.map((w: string, i: number) => <li key={i}>• {w}</li>)}
                </ul>
              </div>
            )}
          </motion.div>
        )}
      </CardContent>
    </Card>
    </>
  );
};
