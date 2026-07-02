import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Award, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

interface ScienceComprehensionQuizProps {
  category: string;
  difficulty: string;
  questions: QuizQuestion[];
  onComplete: (xp: number) => void;
}

const PASS_THRESHOLD = 4;

export const ScienceComprehensionQuiz = ({
  category,
  difficulty,
  questions,
  onComplete,
}: ScienceComprehensionQuizProps) => {
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);
  const [certificateIssued, setCertificateIssued] = useState(false);
  const [issuing, setIssuing] = useState(false);

  const total = questions.length;

  const persistAttempt = async (finalScore: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const passed = finalScore >= PASS_THRESHOLD;
      const { data, error } = await supabase
        .from("kids_science_quiz_attempts")
        .insert({
          user_id: user.id,
          category,
          difficulty,
          score: finalScore,
          total_questions: total,
          questions_json: questions as any,
          passed,
        })
        .select("id")
        .single();
      if (error) throw error;
      return data?.id ?? null;
    } catch (e) {
      console.error("persistAttempt", e);
      return null;
    }
  };

  const handleAnswer = (index: number) => {
    if (answered !== null) return;
    setAnswered(index);
    const correct = index === questions[currentQ].correctIndex;
    const newScore = correct ? score + 1 : score;
    if (correct) setScore(newScore);

    setTimeout(async () => {
      if (currentQ < total - 1) {
        setCurrentQ(currentQ + 1);
        setAnswered(null);
      } else {
        setFinished(true);
        await persistAttempt(newScore);
        onComplete(newScore * 5);
      }
    }, 1100);
  };

  const issueCertificate = async () => {
    setIssuing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to claim your certificate");
        return;
      }
      const childName =
        (user.user_metadata?.full_name as string) ||
        (user.email?.split("@")[0] ?? "Young Scientist");
      const { error } = await supabase.from("kids_science_certificates").insert({
        user_id: user.id,
        child_name: childName,
        category,
        difficulty,
        score,
        total_questions: total,
      });
      if (error) throw error;
      setCertificateIssued(true);
      toast.success("🏆 Certificate added to your collection!");
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Could not issue certificate");
    } finally {
      setIssuing(false);
    }
  };

  const downloadCertificate = () => {
    const childName =
      document.querySelector<HTMLElement>("[data-cert-name]")?.textContent ||
      "Young Scientist";
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Certificate</title>
<style>
@page { size: A4 landscape; margin: 0 }
body { margin:0; font-family: Georgia, serif; }
.cert { width:297mm; height:210mm; padding:40mm 30mm; box-sizing:border-box;
  background: linear-gradient(135deg,#faf5ff,#fdf2f8); color:#4c1d95; text-align:center;
  border: 12px double #a855f7; }
h1 { font-size: 48pt; margin: 0 0 6mm; }
h2 { font-size: 28pt; margin: 0 0 12mm; color:#db2777; }
.name { font-size: 36pt; margin: 8mm 0; border-bottom: 2px solid #a855f7; display:inline-block; padding: 0 16mm 4mm; }
.body { font-size: 16pt; line-height:1.6; }
.score { font-size: 22pt; margin-top: 12mm; color:#059669; font-weight:bold; }
.footer { margin-top: 16mm; font-size: 12pt; color:#6b21a8; }
</style></head><body><div class="cert">
<h1>🏆 Certificate of Achievement</h1>
<h2>Unique Kids Science Lab</h2>
<div class="body">This certifies that</div>
<div class="name">${childName}</div>
<div class="body">has successfully completed a <strong>${category}</strong> experiment<br/>
at the <strong>${difficulty}</strong> level and passed the comprehension quiz.</div>
<div class="score">Score: ${score} / ${total}</div>
<div class="footer">Issued by Unique • ${new Date().toLocaleDateString()}</div>
</div><script>window.onload=()=>window.print()</script></body></html>`;
    const w = window.open("", "_blank");
    if (!w) {
      toast.error("Please allow pop-ups to download the certificate");
      return;
    }
    w.document.write(html);
    w.document.close();
  };

  if (finished) {
    const passed = score >= PASS_THRESHOLD;
    return (
    <>
      <FloatingHowItWorks title={"Science Comprehension Quiz - How it works"} steps={[{ title: 'Open', desc: 'Access the Science Comprehension Quiz section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Science Comprehension Quiz.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10">
        <CardContent className="py-8 text-center space-y-4">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-6xl">
            {score === total ? "🏆" : passed ? "🎉" : "📚"}
          </motion.div>
          <h3 className="text-2xl font-bold">
            {score === total ? "Perfect score!" : passed ? "Great job!" : "Keep learning!"}
          </h3>
          <p className="text-muted-foreground">
            {score}/{total} correct •{" "}
            <span className="text-emerald-500 font-bold">+{score * 5} XP</span>
          </p>
          {passed ? (
            certificateIssued ? (
              <div className="space-y-2">
                <p className="text-sm text-emerald-600 font-semibold flex items-center justify-center gap-2">
                  <Award className="w-4 h-4" /> Certificate saved to your gallery
                </p>
                <Button onClick={downloadCertificate} variant="outline" className="gap-2">
                  <Download className="w-4 h-4" /> Download / Print PDF
                </Button>
              </div>
            ) : (
              <Button
                onClick={issueCertificate}
                disabled={issuing}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white gap-2"
              >
                <Award className="w-4 h-4" />
                {issuing ? "Issuing…" : "Claim certificate 🏆"}
              </Button>
            )
          ) : (
            <p className="text-sm text-muted-foreground">
              Score at least {PASS_THRESHOLD}/{total} to earn a certificate.
            </p>
          )}
        </CardContent>
      </Card>
    </>
  );
  }

  const q = questions[currentQ];

  return (
    <Card className="border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-indigo-500/10">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          🧠 Quiz — Did you understand?
          <span className="text-sm font-normal text-muted-foreground ml-auto">
            {currentQ + 1}/{total}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQ}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
          >
            <p className="font-semibold mb-4">{q.question}</p>
            <div className="space-y-2">
              {q.options.map((opt, i) => {
                let variant = "";
                if (answered !== null) {
                  if (i === q.correctIndex) variant = "border-emerald-500 bg-emerald-500/20";
                  else if (i === answered) variant = "border-red-500 bg-red-500/20";
                }
                return (
                  <Button
                    key={i}
                    variant="outline"
                    onClick={() => handleAnswer(i)}
                    disabled={answered !== null}
                    className={`w-full justify-start text-left h-auto py-3 ${variant}`}
                  >
                    {answered !== null && i === q.correctIndex && (
                      <CheckCircle className="w-4 h-4 mr-2 text-emerald-500" />
                    )}
                    {answered !== null && i === answered && i !== q.correctIndex && (
                      <XCircle className="w-4 h-4 mr-2 text-red-500" />
                    )}
                    {opt}
                  </Button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};
