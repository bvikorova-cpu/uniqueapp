import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { HowItWorksButton } from "@/components/common/HowItWorksButton";

const HOW_STEPS_ASSESSMENTTAKE = [
  { title: "Read instructions carefully", desc: "Note time limit, number of questions and passing score." },
  { title: "Start the timer", desc: "Once you begin you cannot pause. Ensure a stable connection." },
  { title: "Submit before time runs out", desc: "Auto-submit at 00:00. Results are sent to you and the employer." },
];

export default function AssessmentTake() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [a, setA] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState<{ score: number; passed: boolean } | null>(null);
  const [startedAt] = useState(Date.now());

  useEffect(() => { (async () => {
    const { data } = await (supabase as any).from("skill_assessments").select("*").eq("id", id).single();
    setA(data);
  })(); }, [id]);

  if (!a) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  const questions: any[] = Array.isArray(a.questions) ? a.questions : [];

  const submit = async () => {
    const correct = questions.reduce((s, q, i) => s + (answers[i] === q.correct ? 1 : 0), 0);
    const score = Math.round((correct / Math.max(1, questions.length)) * 100);
    const passed = score >= a.passing_score;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return toast.error("Sign in required");
    await (supabase as any).from("skill_assessment_attempts").insert({
      assessment_id: a.id, user_id: user.id, score, passed,
      answers: Object.entries(answers).map(([k, v]) => ({ q: Number(k), a: v })),
      duration_seconds: Math.round((Date.now() - startedAt) / 1000),
    });
    setSubmitted({ score, passed });
  };

  if (submitted) return (
    <div className="max-w-xl mx-auto px-4 pt-10">
      <Card><CardContent className="py-12 text-center space-y-3">
        <h2 className="text-3xl font-black">{submitted.passed ? "🎉 Passed!" : "Try again"}</h2>
        <p className="text-5xl font-black text-primary">{submitted.score}%</p>
        <p className="text-sm text-muted-foreground">Pass mark: {a.passing_score}%</p>
        <Button onClick={() => navigate("/jobs/assessments")}>Back</Button>
      </CardContent></Card>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 pt-6 pb-8 space-y-4">
      <Card><CardHeader><CardTitle>{a.title}</CardTitle></CardHeader></Card>
      {questions.map((q, i) => (
        <Card key={i}><CardContent className="p-4 space-y-2">
          <p className="font-medium text-sm">{i + 1}. {q.question}</p>
          <div className="space-y-1">
            {(q.options || []).map((o: string, oi: number) => (
              <label key={oi} className="flex items-center gap-2 p-2 rounded-md hover:bg-muted cursor-pointer">
                <input type="radio" name={`q${i}`} checked={answers[i] === oi} onChange={() => setAnswers({ ...answers, [i]: oi })} />
                <span className="text-sm">{o}</span>
              </label>
            ))}
          </div>
        </CardContent></Card>
      ))}
      {questions.length === 0 ? <p className="text-center text-muted-foreground">No questions configured.</p> :
        <Button className="w-full" onClick={submit}>Submit</Button>}
    </div>
  );
}
