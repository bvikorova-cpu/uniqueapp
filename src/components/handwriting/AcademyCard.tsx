import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Loader2, CheckCircle2 } from "lucide-react";
import { useAcademy } from "@/hooks/useHandwritingPro";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const LESSONS = [
  { id: "basics", title: "Foundations of Graphology", xp: 30 },
  { id: "slant", title: "Slant & Emotional Expression", xp: 40 },
  { id: "pressure", title: "Pressure & Energy Levels", xp: 40 },
  { id: "loops", title: "Loops, Hooks & Personality", xp: 50 },
  { id: "signatures", title: "Reading Signatures", xp: 60 },
  { id: "forensic", title: "Forensic Document Examination", xp: 80 },
];

export const AcademyCard = () => {
  const { progress, generateQuiz, completeLesson } = useAcademy();
  const [activeQuiz, setActiveQuiz] = useState<{ lessonId: string; questions: any[]; answers: number[] } | null>(null);
  const completed = new Set((progress.data ?? []).filter((p: any) => p.completed).map((p: any) => p.lesson_id));
  const totalXp = (progress.data ?? []).reduce((s: number, p: any) => s + (p.xp_earned || 0), 0);

  const startLesson = async (lessonId: string) => {
    const data: any = await generateQuiz.mutateAsync({ lessonId });
    setActiveQuiz({ lessonId, questions: data.questions ?? [], answers: [] });
  };

  const submitQuiz = () => {
    if (!activeQuiz) return;
    let correct = 0;
    activeQuiz.questions.forEach((q, i) => { if (q.correct === activeQuiz.answers[i]) correct++; });
    const score = Math.round((correct / activeQuiz.questions.length) * 100);
    completeLesson.mutate({ lessonId: activeQuiz.lessonId, quizScore: score });
    setActiveQuiz(null);
  };

  return (
    <>
      <FloatingHowItWorks title={"Academy Card - How it works"} steps={[{ title: 'Open', desc: 'Access the Academy Card section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Academy Card.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="bg-card/60 backdrop-blur-sm border-amber-900/20">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-base">
          <span className="flex items-center gap-2"><GraduationCap className="w-5 h-5 text-amber-700" /> Graphology Academy</span>
          <Badge>{totalXp} XP</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {!activeQuiz && LESSONS.map(l => {
          const done = completed.has(l.id);
          return (
            <div key={l.id} className="flex items-center justify-between p-2 rounded border border-amber-300/30 bg-amber-50/40">
              <div className="flex items-center gap-2 text-sm">
                {done ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <GraduationCap className="w-4 h-4 text-amber-700" />}
                {l.title}
              </div>
              <Button size="sm" variant={done ? "outline" : "default"} disabled={generateQuiz.isPending}
                onClick={() => startLesson(l.id)}>
                {generateQuiz.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : (done ? "Retake" : `Start +${l.xp} XP`)}
              </Button>
            </div>
          );
        })}

        {activeQuiz && (
          <div className="space-y-3">
            <div className="text-sm font-semibold">Quiz: {activeQuiz.lessonId}</div>
            {activeQuiz.questions.map((q, i) => (
              <div key={i} className="p-2 rounded bg-amber-50/40 border border-amber-300/30">
                <div className="text-xs font-semibold mb-1">{i + 1}. {q.q}</div>
                <div className="space-y-1">
                  {q.options.map((opt: string, j: number) => (
                    <label key={j} className="text-xs flex items-center gap-2 cursor-pointer">
                      <input type="radio" name={`q${i}`} checked={activeQuiz.answers[i] === j}
                        onChange={() => {
                          const a = [...activeQuiz.answers]; a[i] = j;
                          setActiveQuiz({ ...activeQuiz, answers: a });
                        }} />
                      {opt}
                    </label>
                  ))}
                </div>
              </div>
            ))}
            <div className="flex gap-2">
              <Button onClick={submitQuiz} className="flex-1" disabled={activeQuiz.answers.length !== activeQuiz.questions.length || completeLesson.isPending}>
                {completeLesson.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit"}
              </Button>
              <Button variant="outline" onClick={() => setActiveQuiz(null)}>Cancel</Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
    </>
  );
};
