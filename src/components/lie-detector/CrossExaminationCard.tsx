import { useState } from "react";
import { Gavel, Loader2, Send } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useCrossExam } from "@/hooks/useLieDetectorPro";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export function CrossExaminationCard() {
  const [subject, setSubject] = useState("");
  const [thread, setThread] = useState<{ role: "prosecutor" | "witness"; content: string }[]>([]);
  const [witnessAnswer, setWitnessAnswer] = useState("");
  const [verdict, setVerdict] = useState<any>(null);
  const ask = useCrossExam();

  const askQuestion = async () => {
    const res = await ask.mutateAsync({ subject_text: subject, qa_thread: thread, action: "question" });
    setThread([...thread, { role: "prosecutor", content: res.question }]);
  };
  const submitAnswer = () => {
    if (!witnessAnswer.trim()) return;
    setThread([...thread, { role: "witness", content: witnessAnswer }]);
    setWitnessAnswer("");
  };
  const callVerdict = async () => {
    const res = await ask.mutateAsync({ subject_text: subject, qa_thread: thread, action: "verdict" });
    setVerdict(res);
  };

  return (
    <>
      <FloatingHowItWorks title={"Cross Examination Card - How it works"} steps={[{ title: 'Open', desc: 'Access the Cross Examination Card section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Cross Examination Card.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="bg-card/60 backdrop-blur-sm border-amber-500/30">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2 text-amber-400">
          <Gavel className="w-5 h-5" /> AI Cross-Examination
          <Badge variant="outline" className="ml-auto text-[10px] border-amber-500/40 text-amber-300">8 cr final</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Textarea value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Paste the witness's original statement..." rows={3} className="bg-background/40" disabled={thread.length > 0} />
        {subject.length > 10 && (
          <>
            <div className="space-y-2 max-h-48 overflow-auto p-2 rounded bg-black/30 border border-amber-500/20">
              {thread.length === 0 && <div className="text-xs text-muted-foreground italic">Click "Ask Question" to begin cross-examination.</div>}
              {thread.map((m, i) => (
                <div key={i} className={`text-xs p-2 rounded ${m.role === "prosecutor" ? "bg-amber-500/10 border-l-2 border-amber-500" : "bg-blue-500/10 border-l-2 border-blue-500"}`}>
                  <div className="font-bold text-[10px] uppercase mb-1">{m.role}</div>
                  {m.content}
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={askQuestion} disabled={ask.isPending} className="flex-1 bg-amber-600 hover:bg-amber-700 text-black">
                {ask.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : "Ask Question"}
              </Button>
              {thread.length >= 2 && (
                <Button size="sm" onClick={callVerdict} disabled={ask.isPending} variant="destructive">
                  Final Verdict (8 cr)
                </Button>
              )}
            </div>
            {thread.length > 0 && thread[thread.length - 1].role === "prosecutor" && (
              <div className="flex gap-2">
                <Textarea value={witnessAnswer} onChange={(e) => setWitnessAnswer(e.target.value)} placeholder="Witness response..." rows={2} className="bg-background/40 text-xs" />
                <Button size="sm" onClick={submitAnswer}><Send className="w-3 h-3" /></Button>
              </div>
            )}
            {verdict && (
              <div className="p-3 rounded bg-red-500/10 border border-red-500/30 space-y-2">
                <div className="text-xs font-bold text-red-400">VERDICT — Credibility: {verdict.credibility_score}%</div>
                <div className="text-xs">{verdict.verdict}</div>
                {verdict.contradictions?.length > 0 && (
                  <div className="text-[11px] space-y-1 pt-2 border-t border-red-500/20">
                    {verdict.contradictions.slice(0, 3).map((c: any, i: number) => (
                      <div key={i}>⚠ <strong>{c.conflict}</strong>: "{c.quote}"</div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
    </>
  );
}
