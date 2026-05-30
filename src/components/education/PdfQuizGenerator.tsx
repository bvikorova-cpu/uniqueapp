import { useRef, useState } from "react";
import { FileText, Loader2, Sparkles, Check, X, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useTutoringCredits } from "@/hooks/useTutoringCredits";
import { toast } from "sonner";

interface QuizQ {
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
}
interface Quiz {
  title: string;
  questions: QuizQ[];
}

const PdfQuizGenerator = () => {
  const { credits, spendCredit, refundCredit, isUsingCredit } = useTutoringCredits();
  const fileRef = useRef<HTMLInputElement>(null);
  const [extracting, setExtracting] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [text, setText] = useState("");
  const [filename, setFilename] = useState("");
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const extractPdf = async (file: File) => {
    setExtracting(true);
    setText("");
    setQuiz(null);
    setSubmitted(false);
    setAnswers({});
    setFilename(file.name);
    try {
      const pdfjs: any = await import("pdfjs-dist");
      // Use the bundled worker via Vite's ?url import for browser compatibility
      const workerUrl = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url")).default;
      pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
      const arrayBuf = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuf }).promise;
      let full = "";
      const maxPages = Math.min(pdf.numPages, 25);
      for (let i = 1; i <= maxPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        full += content.items.map((it: any) => it.str).join(" ") + "\n\n";
      }
      const trimmed = full.trim().slice(0, 20000);
      if (trimmed.length < 50) throw new Error("PDF contains no extractable text (scanned?).");
      setText(trimmed);
      toast.success(`Extracted ${trimmed.length} chars from ${maxPages} page(s)`);
    } catch (e: any) {
      toast.error(e?.message || "Failed to read PDF");
      setFilename("");
    } finally {
      setExtracting(false);
    }
  };

  const onFile = (file: File) => {
    if (file.type === "application/pdf") {
      extractPdf(file);
    } else if (file.type.startsWith("text/")) {
      file.text().then((t) => {
        setText(t.slice(0, 20000));
        setFilename(file.name);
        setQuiz(null);
        setSubmitted(false);
        setAnswers({});
      });
    } else {
      toast.error("Upload a PDF or text file");
    }
  };

  const generate = async () => {
    if (text.trim().length < 50) {
      toast.error("Paste or upload more text");
      return;
    }
    if (credits < 1) {
      toast.error("Out of credits");
      return;
    }
    setGenerating(true);
    setQuiz(null);
    setSubmitted(false);
    setAnswers({});
    let credited = false;
    try {
      await spendCredit();
      credited = true;
      const { data, error } = await supabase.functions.invoke("education-ai", {
        body: { action: "pdf_to_quiz", text, numQuestions: 8, difficulty: "medium" },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      setQuiz((data as any).quiz);
    } catch (e: any) {
      if (credited) await refundCredit("pdf-to-quiz failed");
      toast.error(e?.message || "Failed");
    } finally {
      setGenerating(false);
    }
  };

  const score = quiz
    ? quiz.questions.reduce((s, q, i) => s + (answers[i] === q.correct_index ? 1 : 0), 0)
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText className="h-5 w-5 text-primary" /> PDF → Quiz
          <span className="ml-auto text-xs text-muted-foreground font-normal">1 credit</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <input
          ref={fileRef}
          type="file"
          accept="application/pdf,text/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
        />

        <button
          onClick={() => fileRef.current?.click()}
          disabled={extracting}
          className="w-full p-6 border-2 border-dashed border-primary/30 rounded-xl hover:bg-primary/5 transition flex flex-col items-center gap-2 disabled:opacity-50"
        >
          {extracting ? <Loader2 className="h-6 w-6 animate-spin text-primary" /> : <Upload className="h-6 w-6 text-primary" />}
          <p className="font-semibold text-sm">{extracting ? "Reading PDF…" : filename || "Upload PDF or text file"}</p>
          <p className="text-xs text-muted-foreground">Max 25 pages • lecture notes, articles, study material</p>
        </button>

        {text && !quiz && (
          <div className="text-xs text-muted-foreground">
            ✓ {text.length.toLocaleString()} chars ready
          </div>
        )}

        <Button onClick={generate} disabled={generating || isUsingCredit || text.length < 50} className="w-full gap-2">
          {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {generating ? "Generating quiz…" : "Generate Quiz"}
        </Button>

        {quiz && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold">{quiz.title}</h3>
              {submitted && (
                <Badge variant={score === quiz.questions.length ? "default" : "secondary"}>
                  {score} / {quiz.questions.length}
                </Badge>
              )}
            </div>
            {quiz.questions.map((q, i) => (
              <div key={i} className="p-3 rounded-lg border bg-muted/30 space-y-2">
                <p className="font-semibold text-sm">
                  {i + 1}. {q.question}
                </p>
                <div className="grid gap-1.5">
                  {q.options.map((opt, j) => {
                    const picked = answers[i] === j;
                    const isCorrect = j === q.correct_index;
                    const showResult = submitted;
                    return (
                      <button
                        key={j}
                        disabled={submitted}
                        onClick={() => setAnswers({ ...answers, [i]: j })}
                        className={`text-left text-sm px-3 py-2 rounded-md border transition flex items-center gap-2 ${
                          showResult && isCorrect
                            ? "bg-green-500/20 border-green-500 text-foreground"
                            : showResult && picked && !isCorrect
                            ? "bg-destructive/20 border-destructive"
                            : picked
                            ? "bg-primary/10 border-primary"
                            : "bg-background hover:bg-muted"
                        }`}
                      >
                        {showResult && isCorrect && <Check className="h-4 w-4 text-green-600 shrink-0" />}
                        {showResult && picked && !isCorrect && <X className="h-4 w-4 text-destructive shrink-0" />}
                        <span>{opt}</span>
                      </button>
                    );
                  })}
                </div>
                {submitted && (
                  <p className="text-xs text-muted-foreground italic pt-1">{q.explanation}</p>
                )}
              </div>
            ))}
            {!submitted ? (
              <Button
                onClick={() => setSubmitted(true)}
                disabled={Object.keys(answers).length !== quiz.questions.length}
                className="w-full"
              >
                Check answers
              </Button>
            ) : (
              <Button variant="outline" onClick={() => { setQuiz(null); setAnswers({}); setSubmitted(false); }} className="w-full">
                Done
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PdfQuizGenerator;
