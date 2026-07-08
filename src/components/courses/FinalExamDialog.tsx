import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { moduleCourseApi, type CourseMetaLite, type ExamQuestion } from "@/lib/moduleCourseApi";
import { Award, CheckCircle2, Loader2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  meta: CourseMetaLite;
}

type Stage = "intro" | "loading" | "quiz" | "submitting" | "result";

export const FinalExamDialog = ({ open, onOpenChange, meta }: Props) => {
  const [stage, setStage] = useState<Stage>("intro");
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [examToken, setExamToken] = useState("");
  const [answers, setAnswers] = useState<number[]>([]);
  const [step, setStep] = useState(0);
  const [recipient, setRecipient] = useState("");
  const [result, setResult] = useState<Awaited<ReturnType<typeof moduleCourseApi.submitExam>> | null>(null);

  useEffect(() => {
    if (!open) {
      setStage("intro");
      setQuestions([]);
      setAnswers([]);
      setStep(0);
      setResult(null);
      return;
    }
    // Prefill recipient name from profile if available
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const meta = user.user_metadata as any;
          const name = meta?.full_name || meta?.name || "";
          if (name) setRecipient(name);
        }
      } catch {}
    })();
  }, [open]);

  const startExam = async () => {
    if (!recipient.trim()) {
      toast.error("Please enter the name that should appear on the certificate.");
      return;
    }
    setStage("loading");
    try {
      const res = await moduleCourseApi.startExam(meta);
      setQuestions(res.questions);
      setExamToken(res.exam_token);
      setAnswers(new Array(res.questions.length).fill(-1));
      setStep(0);
      setStage("quiz");
    } catch (e: any) {
      toast.error(e?.message || "Failed to load exam");
      setStage("intro");
    }
  };

  const submit = async () => {
    if (answers.some((a) => a < 0)) {
      toast.error("Please answer every question.");
      return;
    }
    setStage("submitting");
    try {
      const res = await moduleCourseApi.submitExam(meta, {
        answers,
        exam_token: examToken,
        recipient_name: recipient,
      });
      setResult(res);
      setStage("result");
    } catch (e: any) {
      toast.error(e?.message || "Failed to submit");
      setStage("quiz");
    }
  };

  const q = questions[step];
  const progress = questions.length ? ((step + 1) / questions.length) * 100 : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            Final Exam — {meta.course_title}
          </DialogTitle>
          <DialogDescription>10 multiple-choice questions · Pass ≥ 70% to earn your certificate.</DialogDescription>
        </DialogHeader>

        {stage === "intro" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Confirm the name that should appear on your certificate. You can retake the exam if you don't pass.
            </p>
            <div>
              <Label htmlFor="recipient">Full name for certificate</Label>
              <Input id="recipient" value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="e.g. Jane Doe" />
            </div>
            <Button className="w-full" onClick={startExam}>Start Exam</Button>
          </div>
        )}

        {stage === "loading" && (
          <div className="py-10 text-center text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" /> Preparing your questions…
          </div>
        )}

        {stage === "quiz" && q && (
          <div className="space-y-4">
            <div>
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">Question {step + 1} of {questions.length}</p>
            </div>
            <p className="font-semibold">{q.q}</p>
            <div className="space-y-2">
              {q.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => {
                    const next = [...answers];
                    next[step] = i;
                    setAnswers(next);
                  }}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${answers[step] === i ? "border-primary bg-primary/10" : "border-border hover:bg-muted"}`}
                >
                  <span className="font-mono text-xs mr-2 text-muted-foreground">{String.fromCharCode(65 + i)}.</span>
                  {opt}
                </button>
              ))}
            </div>
            <div className="flex justify-between gap-2">
              <Button variant="outline" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>Previous</Button>
              {step < questions.length - 1 ? (
                <Button disabled={answers[step] < 0} onClick={() => setStep((s) => s + 1)}>Next</Button>
              ) : (
                <Button onClick={submit} disabled={answers[step] < 0}>Submit Exam</Button>
              )}
            </div>
          </div>
        )}

        {stage === "submitting" && (
          <div className="py-10 text-center text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" /> Scoring & issuing certificate…
          </div>
        )}

        {stage === "result" && result && (
          <div className="text-center space-y-3">
            {result.passed ? (
              <>
                <CheckCircle2 className="w-14 h-14 mx-auto text-green-500" />
                <h3 className="text-2xl font-black">Congratulations!</h3>
                <p>You scored <strong>{result.score}%</strong> ({result.correct}/{result.total})</p>
                <p className="text-sm text-muted-foreground">Certificate No: <span className="font-mono">{result.certificate?.certificate_code}</span></p>
                <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
                  {result.certificate?.pdf_url && (
                    <Button asChild>
                      <a href={result.certificate.pdf_url} target="_blank" rel="noreferrer">Download PDF</a>
                    </Button>
                  )}
                  {result.verify_url && (
                    <Button variant="outline" asChild>
                      <a href={result.verify_url} target="_blank" rel="noreferrer">Verification page</a>
                    </Button>
                  )}
                </div>
              </>
            ) : (
              <>
                <XCircle className="w-14 h-14 mx-auto text-destructive" />
                <h3 className="text-2xl font-black">Not yet</h3>
                <p>You scored <strong>{result.score}%</strong> ({result.correct}/{result.total}). You need 70% to pass.</p>
                <Button onClick={() => { setStage("intro"); }}>Retake Exam</Button>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
